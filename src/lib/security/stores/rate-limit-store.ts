/**
 * Rate Limit Store — Interface and Implementations
 *
 * Extracted from distributed-rate-limit.ts for reuse across
 * rate limiting and other security modules.
 *
 * Storage backend selection (runtime, in priority order):
 * - Upstash Redis (if UPSTASH_REDIS_REST_URL configured)
 * - Vercel KV     (if KV_REST_API_URL configured)
 * - In-memory     (local development / fallback — not cross-instance safe)
 *
 * D1 adapter is planned (Task 025) but not yet implemented.
 */

import { logger } from "@/lib/logger";
import { ONE, ZERO } from "@/constants";

// ==================== Interface ====================

export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitStore {
  get(key: string): Promise<RateLimitEntry | null>;
  set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void>;
  increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; resetTime: number }>;
}

// ==================== In-Memory Store ====================

export class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<
    string,
    { entry: RateLimitEntry; expiresAt: number }
  >();
  private warned = false;

  constructor() {
    this.warnAboutMemoryStore();
  }

  private warnAboutMemoryStore(): void {
    if (!this.warned) {
      logger.warn(
        "[Rate Limit] Using in-memory store. Rate limits will not persist across serverless instances. " +
          "Configure UPSTASH_REDIS_REST_URL or KV_REST_API_URL for distributed rate limiting.",
      );
      this.warned = true;
    }
  }

  // eslint-disable-next-line require-await -- Interface requires async for distributed store compatibility
  async get(key: string): Promise<RateLimitEntry | null> {
    const stored = this.store.get(key);
    if (!stored) return null;

    const now = Date.now();
    if (now > stored.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return stored.entry;
  }

  // eslint-disable-next-line require-await -- Interface requires async for distributed store compatibility
  async set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void> {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { entry, expiresAt });
  }

  async increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const stored = this.store.get(key);

    if (!stored || now > stored.expiresAt) {
      const newEntry: RateLimitEntry = {
        count: ONE,
        resetTime: now + windowMs,
      };
      await this.set(key, newEntry, windowMs);
      return newEntry;
    }

    stored.entry.count += ONE;
    return stored.entry;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, stored] of this.store.entries()) {
      if (now > stored.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// ==================== Redis Store (Upstash) ====================

export class RedisRateLimitStore implements RateLimitStore {
  private baseUrl: string;
  private token: string;
  private static readonly INCREMENT_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return {current, ttl}
`.trim();

  constructor(url: string, token: string) {
    this.baseUrl = url.replace(/\/$/, "");
    this.token = token;
  }

  private async redisCommand<T>(
    commands: (string | number)[],
  ): Promise<T | null> {
    const response = await fetch(`${this.baseUrl}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    });

    if (!response.ok) {
      throw new Error(
        `[Rate Limit] Redis command failed with status ${response.status}`,
      );
    }

    const data = (await response.json()) as { result: T };
    return data.result;
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    const result = await this.redisCommand<string | null>(["GET", key]);
    if (!result) return null;

    const ttlMs = await this.redisCommand<number>(["PTTL", key]);
    if (!ttlMs || ttlMs <= 0) {
      return null;
    }

    try {
      const count = Number.parseInt(result, 10);
      if (!Number.isFinite(count)) {
        throw new Error("Rate limit counter is not a number");
      }

      return {
        count,
        resetTime: Date.now() + ttlMs,
      };
    } catch (error) {
      // Treat corrupted data as a storage error so the caller's failureMode
      // logic handles it (fail-closed presets deny; fail-open presets degrade).
      logger.error(
        "[Rate Limit] Redis entry parse failure — treating as storage error",
        {
          keyPrefix: key.slice(0, 16),
          valueLength: result.length,
          error,
        },
      );
      throw error;
    }
  }

  async set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void> {
    await this.redisCommand([
      "SET",
      key,
      entry.count,
      "PX",
      Math.max(ttlMs, ONE),
    ]);
  }

  async increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; resetTime: number }> {
    const result = await this.redisCommand<[number, number]>([
      "EVAL",
      RedisRateLimitStore.INCREMENT_SCRIPT,
      ONE,
      key,
      Math.max(windowMs, ONE),
    ]);

    if (!result || result.length < 2) {
      throw new Error("[Rate Limit] Redis increment returned invalid response");
    }

    const [count, ttlMs] = result;
    if (!Number.isFinite(count) || !Number.isFinite(ttlMs)) {
      throw new Error(
        "[Rate Limit] Redis increment returned non-numeric values",
      );
    }

    return {
      count,
      resetTime: Date.now() + Math.max(ttlMs, ZERO),
    };
  }
}

// ==================== KV Store (Vercel KV) ====================

export class KVRateLimitStore implements RateLimitStore {
  private baseUrl: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseUrl = url.replace(/\/$/, "");
    this.token = token;
  }

  private async kvCommand<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T | null> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      throw new Error(
        `[Rate Limit] KV command failed with status ${response.status}`,
      );
    }

    return response.json() as Promise<T>;
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    const result = await this.kvCommand<{ result: string | null }>(
      "GET",
      `/get/${key}`,
    );
    if (!result?.result) return null;

    try {
      return JSON.parse(result.result) as RateLimitEntry;
    } catch (error) {
      // Treat corrupted data as a storage error so the caller's failureMode
      // logic handles it (fail-closed presets deny; fail-open presets degrade).
      logger.error(
        "[Rate Limit] KV entry parse failure — treating as storage error",
        {
          keyPrefix: key.slice(0, 16),
          valueLength: result.result.length,
          error,
        },
      );
      throw error;
    }
  }

  async set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void> {
    const ttlSeconds = Math.ceil(ttlMs / 1000);
    await this.kvCommand("POST", `/set/${key}`, {
      value: JSON.stringify(entry),
      ex: ttlSeconds,
    });
  }

  async increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = await this.get(key);

    if (!existing || now > existing.resetTime) {
      const newEntry: RateLimitEntry = {
        count: ONE,
        resetTime: now + windowMs,
      };
      await this.set(key, newEntry, windowMs);
      return newEntry;
    }

    existing.count += ONE;
    const remainingTtl = existing.resetTime - now;
    await this.set(key, existing, remainingTtl);
    return existing;
  }
}

// ==================== Store Factory ====================

/**
 * Create the appropriate rate limit store based on available configuration
 */
export function createRateLimitStore(): RateLimitStore {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    logger.info("[Rate Limit] Using Upstash Redis store");
    return new RedisRateLimitStore(upstashUrl, upstashToken);
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  const allowMemoryFallback = process.env.ALLOW_MEMORY_RATE_LIMIT === "true";
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    if (kvUrl && kvToken) {
      throw new Error(
        "[Rate Limit] KV-only rate limiting is not allowed in production. Configure Upstash Redis or explicitly opt into ALLOW_MEMORY_RATE_LIMIT=true.",
      );
    }

    if (!allowMemoryFallback) {
      throw new Error(
        "[Rate Limit] Production requires Upstash Redis. Set ALLOW_MEMORY_RATE_LIMIT=true only for an explicit degraded override.",
      );
    }

    logger.warn(
      "[Rate Limit] Falling back to in-memory rate limiting in production due to ALLOW_MEMORY_RATE_LIMIT=true.",
    );
    return new MemoryRateLimitStore();
  }

  if (kvUrl && kvToken) {
    logger.info("[Rate Limit] Using Vercel KV store");
    return new KVRateLimitStore(kvUrl, kvToken);
  }

  return new MemoryRateLimitStore();
}

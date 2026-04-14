import { logger } from "@/lib/logger";

/**
 * Idempotency key metadata stored in Redis
 */
export interface IdempotencyEntry {
  status: "pending" | "success" | "error";
  fingerprint?: string;
  response?: unknown;
  error?: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Interface for idempotency key storage
 */
export interface IdempotencyStore {
  /**
   * Atomically claim a key if it does not exist yet.
   */
  setIfNotExists(
    idempotencyKey: string,
    entry: IdempotencyEntry,
    ttlMs: number,
  ): Promise<boolean>;

  /**
   * Store an idempotency entry
   */
  set(
    idempotencyKey: string,
    entry: IdempotencyEntry,
    ttlMs: number,
  ): Promise<void>;

  /**
   * Retrieve an idempotency entry
   */
  get(idempotencyKey: string): Promise<IdempotencyEntry | null>;

  /**
   * Delete an idempotency entry
   */
  delete(idempotencyKey: string): Promise<void>;
}

/**
 * Redis-backed idempotency store using Upstash REST API
 */
class RedisIdempotencyStore implements IdempotencyStore {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  async setIfNotExists(
    idempotencyKey: string,
    entry: IdempotencyEntry,
    ttlMs: number,
  ): Promise<boolean> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "SET",
        idempotencyKey,
        JSON.stringify(entry),
        "PX",
        ttlMs,
        "NX",
      ]),
    });

    if (!response.ok) {
      throw new Error(
        `[Idempotency] Upstash operation failed: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.result === "OK";
  }

  async set(
    idempotencyKey: string,
    entry: IdempotencyEntry,
    ttlMs: number,
  ): Promise<void> {
    const response = await fetch(`${this.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["SET", idempotencyKey, JSON.stringify(entry)],
        ["PEXPIRE", idempotencyKey, ttlMs.toString()],
      ]),
    });

    if (!response.ok) {
      throw new Error(
        `[Idempotency] Upstash operation failed: ${response.statusText}`,
      );
    }
  }

  async get(idempotencyKey: string): Promise<IdempotencyEntry | null> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["GET", idempotencyKey]),
    });

    if (!response.ok) {
      throw new Error(
        `[Idempotency] Upstash get failed: ${response.statusText}`,
      );
    }

    const data = await response.json();
    if (!data.result) {
      return null;
    }

    return JSON.parse(data.result);
  }

  async delete(idempotencyKey: string): Promise<void> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["DEL", idempotencyKey]),
    });

    if (!response.ok) {
      logger.error(
        `[Idempotency] Failed to delete idempotency key: ${response.statusText}`,
      );
    }
  }
}

/**
 * In-memory idempotency store (for development/testing only)
 */
class MemoryIdempotencyStore implements IdempotencyStore {
  private store = new Map<string, IdempotencyEntry>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  private resetTimer(idempotencyKey: string, ttlMs: number): void {
    const existingTimer = this.timers.get(idempotencyKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    const timer = setTimeout(() => {
      this.store.delete(idempotencyKey);
      this.timers.delete(idempotencyKey);
    }, ttlMs);
    this.timers.set(idempotencyKey, timer);
  }

  setIfNotExists(
    idempotencyKey: string,
    entry: IdempotencyEntry,
    ttlMs: number,
  ): Promise<boolean> {
    const existing = this.store.get(idempotencyKey);
    if (existing && existing.expiresAt > Date.now()) {
      return Promise.resolve(false);
    }
    this.store.set(idempotencyKey, entry);
    this.resetTimer(idempotencyKey, ttlMs);
    return Promise.resolve(true);
  }

  set(
    idempotencyKey: string,
    entry: IdempotencyEntry,
    ttlMs: number,
  ): Promise<void> {
    this.store.set(idempotencyKey, entry);
    this.resetTimer(idempotencyKey, ttlMs);
    return Promise.resolve();
  }

  get(idempotencyKey: string): Promise<IdempotencyEntry | null> {
    const entry = this.store.get(idempotencyKey);
    if (!entry || entry.expiresAt <= Date.now()) {
      this.store.delete(idempotencyKey);
      const timer = this.timers.get(idempotencyKey);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(idempotencyKey);
      }
      return Promise.resolve(null);
    }
    return Promise.resolve(entry);
  }

  delete(idempotencyKey: string): Promise<void> {
    this.store.delete(idempotencyKey);
    const timer = this.timers.get(idempotencyKey);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(idempotencyKey);
    }
    return Promise.resolve();
  }
}

export { MemoryIdempotencyStore, RedisIdempotencyStore };

/**
 * Factory function to create the appropriate idempotency store
 *
 * Production requires Upstash Redis for distributed idempotency tracking.
 * Development can use in-memory fallback.
 *
 * Vercel KV support is pending; D1 adapter is planned (Task 025) but not yet implemented.
 */
export function createIdempotencyStore(): IdempotencyStore {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    logger.info("[Idempotency] Using Upstash Redis store");
    return new RedisIdempotencyStore(upstashUrl, upstashToken);
  }

  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    throw new Error(
      "[Idempotency] Production requires Upstash Redis. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  logger.info("[Idempotency] Using in-memory store (development only)");
  return new MemoryIdempotencyStore();
}

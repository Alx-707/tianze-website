/**
 * Idempotency Store — Interface and In-Memory Implementation
 *
 * Provides atomic set-if-not-exists (SETNX) semantics for idempotency
 * protection. The state machine (PENDING → COMPLETED) is implemented in
 * src/lib/idempotency.ts on top of this interface.
 *
 * Storage backend decision (Task 025):
 * - D1 adapter is planned (INSERT … ON CONFLICT DO NOTHING) but not yet implemented
 * - Fallback: In-memory (local development / current behavior)
 *
 * State model:
 * - PENDING: Request is being processed (set by SETNX)
 * - COMPLETED: Request finished successfully (set by complete())
 */

import { logger } from "@/lib/logger";

export type IdempotencyStatus = "PENDING" | "COMPLETED";

export interface IdempotencyEntry {
  status: IdempotencyStatus;
  result?: unknown;
  statusCode?: number;
  fingerprint?: string;
  createdAt: number;
  expiresAt: number;
}

export interface IdempotencyStore {
  /**
   * Atomically set a key only if it does not exist (SETNX semantics).
   * Returns true if the key was set, false if it already existed.
   */
  setIfNotExists(
    key: string,
    entry: IdempotencyEntry,
    ttlMs: number,
  ): Promise<boolean>;

  /**
   * Get an existing idempotency entry.
   * Returns null if the key does not exist or has expired.
   */
  get(key: string): Promise<IdempotencyEntry | null>;

  /**
   * Transition a PENDING entry to COMPLETED, storing the handler result.
   * Narrowed to only the legal PENDING → COMPLETED transition; prevents callers
   * from making arbitrary field mutations that would corrupt the state machine.
   */
  complete(key: string, result: unknown, statusCode: number): Promise<void>;

  /**
   * Delete a key (e.g., on handler failure to allow retry).
   */
  delete(key: string): Promise<void>;
}

// ==================== In-Memory Implementation ====================

const CLEANUP_INTERVAL_MS = 60_000;

export class MemoryIdempotencyStore implements IdempotencyStore {
  private store = new Map<string, IdempotencyEntry>();
  private lastCleanupAt = 0;

  private maybeCleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanupAt < CLEANUP_INTERVAL_MS) return;
    this.lastCleanupAt = now;
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  // eslint-disable-next-line require-await -- Interface requires async for distributed store compatibility
  async setIfNotExists(
    key: string,
    entry: IdempotencyEntry,
    _ttlMs: number,
  ): Promise<boolean> {
    this.maybeCleanup();

    const existing = this.store.get(key);
    if (existing && Date.now() < existing.expiresAt) {
      return false;
    }

    this.store.set(key, entry);
    return true;
  }

  // eslint-disable-next-line require-await -- Interface requires async for distributed store compatibility
  async get(key: string): Promise<IdempotencyEntry | null> {
    this.maybeCleanup();

    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  // eslint-disable-next-line require-await -- Interface requires async for distributed store compatibility
  async complete(
    key: string,
    result: unknown,
    statusCode: number,
  ): Promise<void> {
    const existing = this.store.get(key);
    if (!existing) return;

    this.store.set(key, {
      ...existing,
      status: "COMPLETED",
      result,
      statusCode,
    });
  }

  // eslint-disable-next-line require-await -- Interface requires async for distributed store compatibility
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  /** Clear all entries (for testing) */
  clear(): void {
    this.store.clear();
  }
}

// ==================== Redis Implementation ====================

export class RedisIdempotencyStore implements IdempotencyStore {
  private baseUrl: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseUrl = url.replace(/\/$/, "");
    this.token = token;
  }

  private async redisCommand<T>(
    command: (string | number)[],
  ): Promise<T | null> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      throw new Error(
        `[Idempotency] Redis command failed with status ${response.status}`,
      );
    }

    const data = (await response.json()) as { result?: T; error?: string };
    if (data.error) {
      throw new Error(`[Idempotency] Redis command failed: ${data.error}`);
    }

    return data.result ?? null;
  }

  async setIfNotExists(
    key: string,
    entry: IdempotencyEntry,
    ttlMs: number,
  ): Promise<boolean> {
    const result = await this.redisCommand<string | null>([
      "SET",
      key,
      JSON.stringify(entry),
      "PX",
      ttlMs,
      "NX",
    ]);
    return result === "OK";
  }

  async get(key: string): Promise<IdempotencyEntry | null> {
    const result = await this.redisCommand<string | null>(["GET", key]);
    if (!result) return null;

    try {
      return JSON.parse(result) as IdempotencyEntry;
    } catch (error) {
      logger.error(
        "[Idempotency] Redis entry parse failure — treating as storage error",
        {
          keyPrefix: key.slice(0, 16),
          valueLength: result.length,
          error,
        },
      );
      throw error;
    }
  }

  async complete(
    key: string,
    result: unknown,
    statusCode: number,
  ): Promise<void> {
    const existing = await this.get(key);
    if (!existing) return;

    const ttlMs = existing.expiresAt - Date.now();
    if (ttlMs <= 0) return;

    await this.redisCommand([
      "SET",
      key,
      JSON.stringify({
        ...existing,
        status: "COMPLETED",
        result,
        statusCode,
      }),
      "PX",
      ttlMs,
    ]);
  }

  async delete(key: string): Promise<void> {
    await this.redisCommand(["DEL", key]);
  }
}

// ==================== Store Factory ====================

/**
 * Create the appropriate idempotency store based on available configuration.
 * D1 adapter is planned (Task 025) but not yet implemented.
 */
export function createIdempotencyStore(): IdempotencyStore {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const allowMemoryFallback = process.env.ALLOW_MEMORY_IDEMPOTENCY === "true";

  if (upstashUrl && upstashToken) {
    logger.info("[Idempotency] Using Upstash Redis store");
    return new RedisIdempotencyStore(upstashUrl, upstashToken);
  }

  if (process.env.NODE_ENV === "production" && !allowMemoryFallback) {
    throw new Error(
      "[Idempotency] Production requires Upstash Redis. Set ALLOW_MEMORY_IDEMPOTENCY=true only for an explicit degraded override.",
    );
  }

  if (process.env.NODE_ENV === "production" && allowMemoryFallback) {
    logger.warn(
      "[Idempotency] Falling back to in-memory idempotency in production due to ALLOW_MEMORY_IDEMPOTENCY=true.",
    );
  }

  return new MemoryIdempotencyStore();
}

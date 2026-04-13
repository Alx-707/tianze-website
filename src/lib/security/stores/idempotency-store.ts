import { logger } from "@/lib/logger";
import { HTTP_NOT_FOUND } from "@/constants/core";

/**
 * Idempotency key metadata stored in Redis
 */
export interface IdempotencyEntry {
  status: "pending" | "success" | "error";
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
   * Store an idempotency entry
   */
  set(
    idempotencyKey: string,
    entry: IdempotencyEntry,
    ttlSeconds: number,
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

  async set(
    idempotencyKey: string,
    entry: IdempotencyEntry,
    ttlSeconds: number,
  ): Promise<void> {
    const pipeline = [
      ["SET", idempotencyKey, JSON.stringify(entry)],
      ["EXPIRE", idempotencyKey, ttlSeconds.toString()],
    ];

    const response = await fetch(`${this.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
    });

    if (!response.ok) {
      throw new Error(
        `[Idempotency] Upstash operation failed: ${response.statusText}`,
      );
    }
  }

  async get(idempotencyKey: string): Promise<IdempotencyEntry | null> {
    const response = await fetch(`${this.url}/get/${idempotencyKey}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      if (response.status === HTTP_NOT_FOUND) {
        return null;
      }
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
    const response = await fetch(`${this.url}/del/${idempotencyKey}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
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

  set(
    idempotencyKey: string,
    entry: IdempotencyEntry,
    ttlSeconds: number,
  ): Promise<void> {
    this.store.set(idempotencyKey, entry);
    setTimeout(() => {
      this.store.delete(idempotencyKey);
    }, ttlSeconds * 1000);
    return Promise.resolve();
  }

  get(idempotencyKey: string): Promise<IdempotencyEntry | null> {
    return Promise.resolve(this.store.get(idempotencyKey) || null);
  }

  delete(idempotencyKey: string): Promise<void> {
    this.store.delete(idempotencyKey);
    return Promise.resolve();
  }
}

export { MemoryIdempotencyStore };

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

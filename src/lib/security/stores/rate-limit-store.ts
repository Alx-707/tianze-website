import { logger } from "@/lib/logger";
import { HTTP_NOT_FOUND } from "@/constants/core";

/**
 * Key-value pair interface representing rate limit data
 */
export interface RateLimitEntry {
  count: number;
  expiresAt: number; // Unix timestamp in milliseconds
}

/**
 * Interface for rate limit storage implementations
 */
export interface RateLimitStore {
  /**
   * Increment the counter for a key and return the new count
   * @param key - The rate limit key (e.g., IP address)
   * @param windowMs - Window size in milliseconds
   * @returns The new count after increment
   */
  increment(key: string, windowMs: number): Promise<RateLimitEntry>;

  /**
   * Get the current count for a key
   */
  get(key: string): Promise<RateLimitEntry | null>;

  /**
   * Delete a key
   */
  delete(key: string): Promise<void>;
}

/**
 * Redis-backed rate limit store using Upstash REST API
 */
class RedisRateLimitStore implements RateLimitStore {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
    const pipeline = [
      ["INCR", key],
      ["PTTL", key],
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
      logger.error(
        `[Rate Limit] Upstash pipeline failed: ${response.statusText}`,
      );
      throw new Error(
        `Upstash rate limit operation failed: ${response.status}`,
      );
    }

    const data = await response.json();
    const [countResult, ttlResult] = Array.isArray(data.result)
      ? data.result
      : [];
    const count =
      typeof countResult?.result === "number"
        ? countResult.result
        : countResult;
    let ttlMs =
      typeof ttlResult?.result === "number" ? ttlResult.result : ttlResult;

    if (typeof count !== "number") {
      throw new Error(
        "[Rate Limit] Invalid Upstash response: expected numeric count",
      );
    }

    if (count === 1 || typeof ttlMs !== "number" || ttlMs < 0) {
      const expireResponse = await fetch(`${this.url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([["PEXPIRE", key, windowMs.toString()]]),
      });

      if (!expireResponse.ok) {
        logger.error(
          `[Rate Limit] Upstash PEXPIRE failed: ${expireResponse.statusText}`,
        );
        throw new Error(
          `Upstash rate limit operation failed: ${expireResponse.status}`,
        );
      }

      ttlMs = windowMs;
    }

    const expiresAt = Date.now() + ttlMs;
    return { count, expiresAt };
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    const response = await fetch(`${this.url}/get/${key}`, {
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
        `[Rate Limit] Upstash get failed: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const count = parseInt(data.result || "0", 10);

    const ttlResponse = await fetch(`${this.url}/pttl/${key}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!ttlResponse.ok) {
      throw new Error(
        `[Rate Limit] Upstash pttl failed: ${ttlResponse.statusText}`,
      );
    }

    const ttlData = await ttlResponse.json();
    const ttlMs = Math.max(0, Number(ttlData.result) || 0);
    const expiresAt = Date.now() + ttlMs;
    return { count, expiresAt };
  }

  async delete(key: string): Promise<void> {
    const response = await fetch(`${this.url}/del/${key}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      logger.error(
        `[Rate Limit] Failed to delete rate limit key: ${response.statusText}`,
      );
    }
  }
}

/**
 * In-memory rate limit store (for development/testing only)
 */
class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>();

  increment(key: string, windowMs: number): Promise<RateLimitEntry> {
    const now = Date.now();
    const expiresAt = now + windowMs;

    const entry = this.store.get(key);
    if (entry && entry.expiresAt > now) {
      entry.count += 1;
      return Promise.resolve({
        count: entry.count,
        expiresAt: entry.expiresAt,
      });
    }

    const newEntry = { count: 1, expiresAt };
    this.store.set(key, newEntry);
    return Promise.resolve(newEntry);
  }

  get(key: string): Promise<RateLimitEntry | null> {
    const entry = this.store.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      return Promise.resolve(null);
    }
    return Promise.resolve(entry);
  }

  delete(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }
}

let memoryStoreWarningLogged = false;

export function resetRateLimitStoreWarnings(): void {
  memoryStoreWarningLogged = false;
}

export { MemoryRateLimitStore, RedisRateLimitStore };

/**
 * Factory function to create the appropriate rate limit store
 * Production requires Upstash Redis; development can use in-memory fallback
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
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    if (kvUrl && kvToken) {
      throw new Error(
        "[Rate Limit] KV-only rate limiting is not allowed in production. Configure Upstash Redis for distributed rate limiting.",
      );
    }

    throw new Error(
      "[Rate Limit] Production requires Upstash Redis. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  if (kvUrl && kvToken) {
    logger.warn(
      "[Rate Limit] KV store detected but Upstash Redis is preferred. Using in-memory fallback for development.",
    );
  }

  if (!memoryStoreWarningLogged) {
    logger.warn("[Rate Limit] Using in-memory store (development only)");
    memoryStoreWarningLogged = true;
  }
  return new MemoryRateLimitStore();
}

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
   * @param ttlSeconds - Time-to-live in seconds
   * @returns The new count after increment
   */
  increment(key: string, ttlSeconds: number): Promise<RateLimitEntry>;

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

  async increment(key: string, ttlSeconds: number): Promise<RateLimitEntry> {
    const pipeline = [
      ["INCR", key],
      ["EXPIRE", key, ttlSeconds.toString()],
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
    const count = data.result?.[0];

    if (typeof count !== "number") {
      throw new Error(
        "[Rate Limit] Invalid Upstash response: expected numeric count",
      );
    }

    const expiresAt = Date.now() + ttlSeconds * 1000;
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
    const expiresAt = Date.now() + 60 * 1000; // Conservative: assume 60s TTL
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

  increment(key: string, ttlSeconds: number): Promise<RateLimitEntry> {
    const now = Date.now();
    const expiresAt = now + ttlSeconds * 1000;

    const entry = this.store.get(key);
    if (entry && entry.expiresAt > now) {
      entry.count += 1;
      entry.expiresAt = expiresAt;
      return Promise.resolve({ count: entry.count, expiresAt });
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

export { MemoryRateLimitStore };

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

  logger.info("[Rate Limit] Using in-memory store (development only)");
  return new MemoryRateLimitStore();
}

/**
 * Rate Limiting with Per-Key Serialization
 *
 * Provides single-instance rate limiting with per-key promise queue
 * to prevent TOCTOU races within one process. Cross-instance consistency
 * requires a distributed store backend (Upstash Redis / KV); without one,
 * limits are best-effort per-instance only.
 *
 * Store implementations are in ./stores/rate-limit-store.ts.
 */

import { logger } from "@/lib/logger";
import {
  COUNT_FIVE,
  COUNT_PAIR,
  COUNT_TEN,
  COUNT_THREE,
  MINUTE_MS,
  ONE,
  ZERO,
} from "@/constants";
import {
  type RateLimitStore,
  MemoryRateLimitStore,
  createRateLimitStore,
} from "@/lib/security/stores/rate-limit-store";

// Rate limit configuration per endpoint
// failureMode: "open" = allow on storage failure; "closed" = deny on storage failure
export const RATE_LIMIT_PRESETS = {
  contact: {
    maxRequests: COUNT_FIVE,
    windowMs: MINUTE_MS,
    failureMode: "open" as const,
  },
  inquiry: {
    maxRequests: COUNT_TEN,
    windowMs: MINUTE_MS,
    failureMode: "open" as const,
  },
  subscribe: {
    maxRequests: COUNT_THREE,
    windowMs: MINUTE_MS,
    failureMode: "open" as const,
  },
  whatsapp: {
    maxRequests: COUNT_FIVE,
    windowMs: MINUTE_MS,
    failureMode: "open" as const,
  },
  csp: { maxRequests: 100, windowMs: MINUTE_MS, failureMode: "open" as const },
  // Security-sensitive: deny on storage failure to prevent brute-force bypass
  turnstile: {
    maxRequests: COUNT_TEN,
    windowMs: MINUTE_MS,
    failureMode: "closed" as const,
  },
  cacheInvalidate: {
    maxRequests: COUNT_TEN,
    windowMs: MINUTE_MS,
    failureMode: "closed" as const,
  },
  cacheInvalidatePreAuth: {
    maxRequests: COUNT_TEN * COUNT_PAIR,
    windowMs: MINUTE_MS,
    failureMode: "closed" as const,
  },
} as const;

export type RateLimitPreset = keyof typeof RATE_LIMIT_PRESETS;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter: number | null;
  /** Indicates storage failure triggered fail-open or fail-closed behavior */
  degraded?: boolean;
  /** Reason for denial: 'limit' = real rate limit exceeded, 'storage_failure' = backend unavailable */
  deniedReason?: "limit" | "storage_failure";
}

let rateLimitStore: RateLimitStore | null = null;

/** Per-key promise queue for single-process atomicity (prevents TOCTOU races) */
const rateLimitQueue = new Map<string, Promise<unknown>>();

function getRateLimitStore(): RateLimitStore {
  if (!rateLimitStore) {
    rateLimitStore = createRateLimitStore();
  }
  return rateLimitStore;
}

/**
 * Get rate limit config for preset (safe access pattern)
 */
function getRateLimitConfig(preset: RateLimitPreset): {
  maxRequests: number;
  windowMs: number;
  failureMode: "open" | "closed";
} {
  switch (preset) {
    case "contact":
      return RATE_LIMIT_PRESETS.contact;
    case "inquiry":
      return RATE_LIMIT_PRESETS.inquiry;
    case "subscribe":
      return RATE_LIMIT_PRESETS.subscribe;
    case "whatsapp":
      return RATE_LIMIT_PRESETS.whatsapp;
    case "csp":
      return RATE_LIMIT_PRESETS.csp;
    case "turnstile":
      return RATE_LIMIT_PRESETS.turnstile;
    case "cacheInvalidate":
      return RATE_LIMIT_PRESETS.cacheInvalidate;
    case "cacheInvalidatePreAuth":
      return RATE_LIMIT_PRESETS.cacheInvalidatePreAuth;
    default: {
      // Exhaustive check - TypeScript will error if a case is missing
      const exhaustiveCheck: never = preset;
      return exhaustiveCheck;
    }
  }
}

async function executeRateLimitCheck(
  key: string,
  config: ReturnType<typeof getRateLimitConfig>,
): Promise<RateLimitResult> {
  const store = getRateLimitStore();
  try {
    const { count, resetTime } = await store.increment(key, config.windowMs);
    const now = Date.now();
    const remaining = Math.max(ZERO, config.maxRequests - count);
    const allowed = count <= config.maxRequests;

    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: allowed ? null : Math.ceil((resetTime - now) / 1000),
      ...(allowed ? {} : { deniedReason: "limit" as const }),
    };
  } catch (error) {
    const failClosed = config.failureMode === "closed";
    logger.warn(
      failClosed
        ? "[Rate Limit] Storage failure — fail-closed, denying request (degraded)"
        : "[Rate Limit] Storage failure — fail-open, allowing request (degraded)",
    );
    logger.error("[Rate Limit] Storage backend error details", { error });
    return {
      allowed: !failClosed,
      remaining: failClosed ? ZERO : config.maxRequests - ONE,
      resetTime: Date.now() + config.windowMs,
      retryAfter: failClosed ? Math.ceil(config.windowMs / 1000) : null,
      degraded: true,
      ...(failClosed ? { deniedReason: "storage_failure" as const } : {}),
    };
  }
}

/**
 * Check rate limit for a given identifier and preset.
 *
 * Serializes concurrent requests for the same key via a promise queue to
 * prevent TOCTOU races within a single process instance.
 */
export function checkDistributedRateLimit(
  identifier: string,
  preset: RateLimitPreset,
): Promise<RateLimitResult> {
  const config = getRateLimitConfig(preset);
  const key = `ratelimit:${preset}:${identifier}`;

  // Chain onto the previous pending request for this key (if any) to serialize
  // increments within the same process and prevent read-modify-write races.
  const previous = (rateLimitQueue.get(key) ?? Promise.resolve()).catch(() => {
    /* swallow queue errors to prevent cascade failures */
  });
  const current = previous.then(() => executeRateLimitCheck(key, config));

  // Register as the latest pending operation for this key.
  // Clean up after settlement to prevent unbounded Map growth.
  const tracked = current
    .catch(() => {
      /* swallow queue errors to prevent cascade failures */
    })
    .finally(() => {
      if (rateLimitQueue.get(key) === tracked) {
        rateLimitQueue.delete(key);
      }
    });
  rateLimitQueue.set(key, tracked);

  return current;
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  preset: RateLimitPreset,
): Promise<RateLimitResult> {
  const store = getRateLimitStore();
  const config = getRateLimitConfig(preset);
  const key = `ratelimit:${preset}:${identifier}`;

  try {
    const entry = await store.get(key);
    const now = Date.now();

    if (!entry || now > entry.resetTime) {
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        retryAfter: null,
      };
    }

    const remaining = Math.max(ZERO, config.maxRequests - entry.count);
    const allowed = entry.count < config.maxRequests;

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      retryAfter: allowed ? null : Math.ceil((entry.resetTime - now) / 1000),
    };
  } catch (error) {
    logger.error("[Rate Limit] Status check failed (fail-open)", { error });
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
      retryAfter: null,
      degraded: true,
    };
  }
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set("X-RateLimit-Reset", String(result.resetTime));

  if (result.retryAfter !== null) {
    headers.set("Retry-After", String(result.retryAfter));
  }

  return headers;
}

/**
 * Cleanup expired entries (for memory store only)
 */
export function cleanupRateLimitStore(): void {
  const store = getRateLimitStore();
  if (store instanceof MemoryRateLimitStore) {
    store.cleanup();
  }
}

/**
 * Reset store instance (for testing)
 */
export function resetRateLimitStore(): void {
  rateLimitStore = null;
  rateLimitQueue.clear();
}

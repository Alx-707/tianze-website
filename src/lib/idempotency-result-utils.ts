/**
 * Idempotent Result Helper Functions
 *
 * Extracted from src/lib/idempotency.ts to reduce main file size while
 * preserving all idempotent result logic (caching, claiming, persistence).
 */

import { logger } from "@/lib/logger";
import { DEFAULT_TTL_MS } from "@/lib/idempotency-utils";
import type { IdempotencyStore } from "@/lib/security/stores/idempotency-store";
import type { IdempotentResult } from "@/lib/idempotency";

/** Tracks the fingerprint associated with each in-flight key */
const inFlightFingerprints = new Map<string, string>();

/** Track pending results */
const pendingResults = new Map<string, Promise<unknown>>();

/** Maximum in-flight entries across all Maps (prevents unbounded memory growth) */
const MAX_IN_FLIGHT_ENTRIES = 1000;

/**
 * Get required missing result validation for idempotent result calls
 */
export function getRequiredMissingResult<T>(
  required: boolean,
  idempotencyKey: string | null,
): IdempotentResult<T> | null {
  if (!required || idempotencyKey) {
    return null;
  }

  logger.warn("Missing required idempotency key");
  return { ok: false, reason: "missing" };
}

/**
 * Get in-flight result from pending cache
 */
export async function getInFlightIdempotentResult<T>(
  idempotencyKey: string,
  fingerprint: string,
): Promise<IdempotentResult<T> | null> {
  const inFlight = pendingResults.get(idempotencyKey);
  if (!inFlight) {
    return null;
  }

  const existingFingerprint = inFlightFingerprints.get(idempotencyKey);
  if (existingFingerprint && existingFingerprint !== fingerprint) {
    return { ok: false, reason: "reused" };
  }

  try {
    return { ok: true, result: (await inFlight) as T, cached: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

/**
 * Get stored result from IdempotencyStore
 */
export async function getStoredIdempotentResult<T>(
  idempotencyKey: string,
  fingerprint: string,
  store: IdempotencyStore,
): Promise<IdempotentResult<T> | null> {
  const existing = await store.get(idempotencyKey);
  if (!existing) {
    return null;
  }

  if (
    existing.status !== "pending" &&
    inFlightFingerprints.get(idempotencyKey) !== fingerprint
  ) {
    return { ok: false, reason: "reused" };
  }

  if (existing.status === "success") {
    return { ok: true, result: existing.response as T, cached: true };
  }

  if (existing.status === "error") {
    return { ok: false, reason: "failed" };
  }

  // Import waitForCompletionResult from idempotency-utils
  const { waitForCompletionResult } = await import("@/lib/idempotency-utils");
  return waitForCompletionResult<T>(idempotencyKey, store);
}

/**
 * Claim idempotent result key atomically (SETNX pattern)
 */
export function claimIdempotentResultKey(
  idempotencyKey: string,
  context: {
    fingerprint: string;
    ttlMs: number;
    store: IdempotencyStore;
  },
): Promise<boolean> {
  const { fingerprint, ttlMs, store } = context;
  const now = Date.now();
  return (async () => {
    const existing = await store.get(idempotencyKey);
    if (!existing) {
      await store.set(
        idempotencyKey,
        {
          status: "pending",
          createdAt: now,
          expiresAt: now + ttlMs,
        },
        Math.ceil(ttlMs / 1000),
      );
      inFlightFingerprints.set(idempotencyKey, fingerprint);
      return true;
    }
    return false;
  })();
}

/**
 * Complete idempotent result work (run handler, persist result, register in-flight)
 */
export function completeIdempotentResultWork<T>(
  idempotencyKey: string,
  context: {
    fingerprint: string;
    handler: () => Promise<T>;
    store: IdempotencyStore;
  },
): Promise<T> {
  const { fingerprint, handler, store } = context;
  const work = (async (): Promise<T> => {
    let result: T;
    const now = Date.now();
    try {
      result = await handler();
    } catch (error) {
      try {
        await store.delete(idempotencyKey);
      } catch (deleteError) {
        logger.error(
          "Failed to delete PENDING idempotency key after result failure",
          { deleteError, idempotencyKey },
        );
      }
      throw error;
    } finally {
      pendingResults.delete(idempotencyKey);
      inFlightFingerprints.delete(idempotencyKey);
    }

    // Handler finished. Fail closed: do not delete the claim after success, even
    // if persisting the COMPLETED record fails.
    try {
      await store.set(
        idempotencyKey,
        {
          status: "success",
          response: result,
          createdAt: now,
          expiresAt: now + DEFAULT_TTL_MS,
        },
        Math.ceil(DEFAULT_TTL_MS / 1000),
      );
    } catch (completeError) {
      logger.error(
        "Failed to persist COMPLETED idempotency result — key remains PENDING until TTL expires",
        { completeError, idempotencyKey },
      );
    }

    return result;
  })();

  if (pendingResults.size < MAX_IN_FLIGHT_ENTRIES) {
    pendingResults.set(idempotencyKey, work as Promise<unknown>);
    inFlightFingerprints.set(idempotencyKey, fingerprint);
  }

  return work;
}

/**
 * Clear a single idempotent result key
 */
export function clearIdempotentResultKey(key: string): void {
  pendingResults.delete(key);
  inFlightFingerprints.delete(key);
}

/**
 * Clear all idempotent result keys
 */
export function clearAllIdempotentResultKeys(): void {
  pendingResults.clear();
  inFlightFingerprints.clear();
}

/**
 * Idempotency Key Management
 *
 * 提供幂等键支持，防止重复请求导致的重复处理
 *
 * Security properties:
 * - TOCTOU protection: atomic SETNX via IdempotencyStore.setIfNotExists()
 * - Key semantic binding: key fingerprinted to {method}:{pathname}
 * - Persistence: results stored in IdempotencyStore (survives hot-cache clear)
 *
 * 使用方式：
 * 1. 客户端在请求头中添加 Idempotency-Key
 * 2. 服务端使用 withIdempotency 包装处理函数
 * 3. 重复请求会返回缓存的结果
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import { createApiErrorResponse } from "@/lib/api/api-response";
import {
  HOURS_PER_DAY,
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_SERVICE_UNAVAILABLE,
  MILLISECONDS_PER_HOUR,
} from "@/constants";
import {
  type IdempotencyStore,
  createIdempotencyStore,
} from "@/lib/security/stores/idempotency-store";

const DEFAULT_TTL_MS = HOURS_PER_DAY * MILLISECONDS_PER_HOUR;
const HTTP_CONFLICT = 409;

/** Singleton store — persists across clearAllIdempotencyKeys() calls */
let idempotencyStore: IdempotencyStore | null = null;

function getIdempotencyStore(): IdempotencyStore {
  if (!idempotencyStore) {
    idempotencyStore = createIdempotencyStore();
  }
  return idempotencyStore;
}

/**
 * Hot-cache Map tracks in-flight PENDING requests for fast duplicate detection.
 * Cleared by clearAllIdempotencyKeys() — does NOT affect the persistent store.
 */
const pendingRequests = new Map<string, Promise<NextResponse>>();
const pendingResults = new Map<string, Promise<unknown>>();

/**
 * Poll the store until the entry transitions from PENDING to COMPLETED.
 * Used by the "loser" of a concurrent SETNX race to wait for the winner.
 */
async function waitForCompletion(
  key: string,
  store: IdempotencyStore,
): Promise<NextResponse> {
  const POLL_INTERVAL_MS = 50;
  const TIMEOUT_MS = 10_000;
  const start = Date.now();

  while (Date.now() - start < TIMEOUT_MS) {
    await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    const entry = await store.get(key);
    if (!entry) {
      // Key expired or deleted — handler failed, allow retry
      return createApiErrorResponse(
        API_ERROR_CODES.IDEMPOTENCY_REQUEST_FAILED,
        HTTP_SERVICE_UNAVAILABLE,
      );
    }
    if (entry.status === "COMPLETED") {
      return NextResponse.json(entry.result, {
        status: entry.statusCode ?? HTTP_OK,
      });
    }
  }

  return createApiErrorResponse(
    API_ERROR_CODES.IDEMPOTENCY_REQUEST_TIMEOUT,
    HTTP_SERVICE_UNAVAILABLE,
  );
}

/**
 * 从请求中提取幂等键
 */
export function getIdempotencyKey(request: NextRequest): string | null {
  return request.headers.get("Idempotency-Key");
}

/**
 * Build the semantic fingerprint for a request (method + pathname).
 * The same raw idempotency key used for a different endpoint is rejected.
 */
function buildFingerprint(request: NextRequest): string {
  const { pathname } = new URL(request.url);
  return `${request.method}:${pathname}`;
}

/**
 * Handle requests that have an Idempotency-Key header.
 *
 * State machine:
 *   - Key absent → SETNX PENDING (winner runs handler) or wait for COMPLETED
 *   - Fingerprint mismatch → 409 Conflict
 *   - COMPLETED → return cached result
 */
interface IdempotencyHandlerContext {
  fingerprint: string;
  ttlMs: number;
}

/** Track the fingerprint associated with each in-flight key */
const inFlightFingerprints = new Map<string, string>();

/**
 * Fast path: check if an in-flight promise exists for this key.
 * Returns the in-flight promise, a 409 conflict response, or null to continue.
 */
function checkInFlight(
  idempotencyKey: string,
  fingerprint: string,
): NextResponse | Promise<NextResponse> | null {
  const inFlight = pendingRequests.get(idempotencyKey);
  if (!inFlight) return null;

  const existingFingerprint = inFlightFingerprints.get(idempotencyKey);
  if (existingFingerprint && existingFingerprint !== fingerprint) {
    return NextResponse.json(
      {
        success: false,
        errorCode: API_ERROR_CODES.IDEMPOTENCY_KEY_REUSED,
      },
      { status: HTTP_CONFLICT },
    );
  }
  return inFlight;
}

async function handleWithIdempotencyKey<T>(
  idempotencyKey: string,
  handler: () => Promise<T>,
  context: IdempotencyHandlerContext,
): Promise<NextResponse> {
  const { fingerprint, ttlMs } = context;
  const store = getIdempotencyStore();

  // Fast path: if there's already a pending in-flight promise for this key
  // (same process, same request racing), verify fingerprint before returning.
  const inFlightResult = checkInFlight(idempotencyKey, fingerprint);
  if (inFlightResult) return inFlightResult;

  // Check existing entry in the persistent store
  const existing = await store.get(idempotencyKey);

  if (existing) {
    // Reject if the same key is used for a different endpoint
    if (existing.fingerprint && existing.fingerprint !== fingerprint) {
      return NextResponse.json(
        {
          success: false,
          errorCode: API_ERROR_CODES.IDEMPOTENCY_KEY_REUSED,
        },
        { status: HTTP_CONFLICT },
      );
    }

    if (existing.status === "COMPLETED") {
      logger.warn("Returning cached result for idempotency key", {
        keyHash: idempotencyKey.slice(0, 8),
        age: Date.now() - existing.createdAt,
      });
      return NextResponse.json(existing.result, {
        status: existing.statusCode ?? HTTP_OK,
      });
    }

    // PENDING — another concurrent request is processing it; wait for result
    return waitForCompletion(idempotencyKey, store);
  }

  // Atomically claim the key (SETNX)
  const now = Date.now();
  const claimed = await store.setIfNotExists(
    idempotencyKey,
    {
      status: "PENDING",
      fingerprint,
      createdAt: now,
      expiresAt: now + ttlMs,
    },
    ttlMs,
  );

  if (!claimed) {
    // Lost the SETNX race — another request claimed it concurrently
    return waitForCompletion(idempotencyKey, store);
  }

  // We own the key — run the handler
  const work = (async (): Promise<NextResponse> => {
    try {
      const result = await handler();

      if (result instanceof NextResponse) {
        // Don't cache responses where the handler returns a NextResponse directly
        // (both 2xx and non-2xx). For idempotency caching, handlers must return
        // a plain serializable object instead of a NextResponse.
        try {
          await store.delete(idempotencyKey);
        } catch (deleteError) {
          logger.warn("Failed to delete non-cached idempotency key", {
            deleteError,
            idempotencyKey,
          });
        }
        return result;
      }

      const normalized = (() => {
        if (typeof result !== "object" || result === null) {
          return { body: result, statusCode: HTTP_OK };
        }

        if (Array.isArray(result)) {
          return { body: result, statusCode: HTTP_OK };
        }

        const record = result as Record<string, unknown>;
        if (!Object.prototype.hasOwnProperty.call(record, "statusCode")) {
          return { body: result, statusCode: HTTP_OK };
        }

        const { statusCode } = record;
        if (typeof statusCode !== "number") {
          return { body: result, statusCode: HTTP_OK };
        }

        // Strip statusCode from the JSON payload; keep it on the stored entry.
        // This mirrors `createApiErrorResponse()` which communicates status via HTTP,
        // not via a redundant JSON field.
        const { statusCode: _statusCode, ...rest } = record;
        return { body: rest, statusCode };
      })();

      // PENDING → COMPLETED transition.
      // Important: never delete a claimed key after the handler has finished, even
      // if the store write fails — failing closed avoids duplicate-write risk.
      try {
        await store.complete(
          idempotencyKey,
          normalized.body,
          normalized.statusCode,
        );
      } catch (completeError) {
        logger.error(
          "Failed to persist COMPLETED idempotency result — key remains PENDING until TTL expires",
          { completeError, idempotencyKey },
        );
      }

      return NextResponse.json(normalized.body, {
        status: normalized.statusCode,
      });
    } catch (error) {
      logger.error("Request handler failed", {
        error: error as Error,
        idempotencyKey,
      });
      // Delete the PENDING key so the next request can retry.
      // Isolated try/catch so a store failure does not mask the original error.
      try {
        await store.delete(idempotencyKey);
      } catch (deleteError) {
        logger.error(
          "Failed to delete PENDING idempotency key after handler failure — key stuck until TTL expires",
          { deleteError, idempotencyKey },
        );
      }
      throw error;
    } finally {
      pendingRequests.delete(idempotencyKey);
      inFlightFingerprints.delete(idempotencyKey);
    }
  })();

  // Register in-flight to short-circuit concurrent duplicates in this process
  pendingRequests.set(idempotencyKey, work);
  inFlightFingerprints.set(idempotencyKey, fingerprint);

  return work;
}

/**
 * Handle requests without an idempotency key (no caching, just wrap handler)
 */
async function handleWithoutIdempotencyKey<T>(
  handler: () => Promise<T>,
): Promise<NextResponse> {
  try {
    const result = await handler();
    if (result instanceof NextResponse) {
      return result;
    }
    return NextResponse.json(result, { status: HTTP_OK });
  } catch (error) {
    logger.error("Request handler failed", { error: error as Error });
    throw error;
  }
}

type IdempotentResultReason = "missing" | "reused" | "timeout" | "failed";

export type IdempotentResult<T> =
  | { ok: true; result: T; cached?: boolean }
  | { ok: false; reason: IdempotentResultReason };

async function waitForCompletionResult<T>(
  key: string,
  store: IdempotencyStore,
): Promise<IdempotentResult<T>> {
  const POLL_INTERVAL_MS = 50;
  const TIMEOUT_MS = 10_000;
  const start = Date.now();

  while (Date.now() - start < TIMEOUT_MS) {
    await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    const entry = await store.get(key);
    if (!entry) {
      return { ok: false, reason: "failed" };
    }
    if (entry.status === "COMPLETED") {
      return { ok: true, result: entry.result as T, cached: true };
    }
  }

  return { ok: false, reason: "timeout" };
}

function resolveIdempotentResultTtl(ttl?: number): number {
  return typeof ttl === "number" && ttl > 0 ? ttl : DEFAULT_TTL_MS;
}

function getRequiredMissingResult<T>(
  required: boolean,
  idempotencyKey: string | null,
): IdempotentResult<T> | null {
  if (!required || idempotencyKey) {
    return null;
  }

  logger.warn("Missing required idempotency key");
  return { ok: false, reason: "missing" };
}

async function getInFlightIdempotentResult<T>(
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

async function getStoredIdempotentResult<T>(
  idempotencyKey: string,
  fingerprint: string,
  store: IdempotencyStore,
): Promise<IdempotentResult<T> | null> {
  const existing = await store.get(idempotencyKey);
  if (!existing) {
    return null;
  }

  if (existing.fingerprint && existing.fingerprint !== fingerprint) {
    return { ok: false, reason: "reused" };
  }

  if (existing.status === "COMPLETED") {
    return { ok: true, result: existing.result as T, cached: true };
  }

  return waitForCompletionResult<T>(idempotencyKey, store);
}

function claimIdempotentResultKey(
  idempotencyKey: string,
  context: {
    fingerprint: string;
    ttlMs: number;
    store: IdempotencyStore;
  },
): Promise<boolean> {
  const { fingerprint, ttlMs, store } = context;
  const now = Date.now();
  return store.setIfNotExists(
    idempotencyKey,
    {
      status: "PENDING",
      fingerprint,
      createdAt: now,
      expiresAt: now + ttlMs,
    },
    ttlMs,
  );
}

function completeIdempotentResultWork<T>(
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
      await store.complete(idempotencyKey, result, HTTP_OK);
    } catch (completeError) {
      logger.error(
        "Failed to persist COMPLETED idempotency result — key remains PENDING until TTL expires",
        { completeError, idempotencyKey },
      );
    }

    return result;
  })();

  pendingResults.set(idempotencyKey, work);
  inFlightFingerprints.set(idempotencyKey, fingerprint);

  return work;
}

export async function withIdempotentResult<T>(
  idempotencyKey: string | null,
  handler: () => Promise<T>,
  options: {
    fingerprint: string;
    required?: boolean;
    ttl?: number;
  },
): Promise<IdempotentResult<T>> {
  const { fingerprint, required = false } = options;
  const ttlMs = resolveIdempotentResultTtl(options.ttl);
  const missingKeyResult = getRequiredMissingResult<T>(
    required,
    idempotencyKey,
  );
  if (missingKeyResult) return missingKeyResult;

  if (!idempotencyKey) {
    try {
      return { ok: true, result: await handler() };
    } catch {
      return { ok: false, reason: "failed" };
    }
  }

  const inFlightResult = await getInFlightIdempotentResult<T>(
    idempotencyKey,
    fingerprint,
  );
  if (inFlightResult) return inFlightResult;

  const store = getIdempotencyStore();
  const storedResult = await getStoredIdempotentResult<T>(
    idempotencyKey,
    fingerprint,
    store,
  );
  if (storedResult) return storedResult;

  const claimed = await claimIdempotentResultKey(idempotencyKey, {
    fingerprint,
    ttlMs,
    store,
  });

  if (!claimed) {
    return waitForCompletionResult<T>(idempotencyKey, store);
  }

  try {
    return {
      ok: true,
      result: await completeIdempotentResultWork(idempotencyKey, {
        fingerprint,
        handler,
        store,
      }),
    };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

/**
 * 幂等键中间件
 *
 * 核心行为：
 * - 当请求携带 Idempotency-Key 时：
 *   - 首次请求：原子 SETNX PENDING → 执行 handler → COMPLETED（成功）或删除（失败）
 *   - 重复请求：命中缓存 → 按缓存结果直接返回
 *   - 并发重复请求：等待首次请求完成后返回缓存结果（TOCTOU 保护）
 *   - 跨端点复用：409 Conflict（key 语义绑定）
 * - 当请求未携带 Idempotency-Key 时：直接执行 handler
 */
// eslint-disable-next-line require-await -- Returns Promise for API consistency
export async function withIdempotency<T>(
  request: NextRequest,
  handler: () => Promise<T>,
  options: {
    required?: boolean;
    ttl?: number;
  } = {},
): Promise<NextResponse> {
  const { required = false } = options;
  const idempotencyKey = getIdempotencyKey(request);
  const ttlMs =
    typeof options.ttl === "number" && options.ttl > 0
      ? options.ttl
      : DEFAULT_TTL_MS;

  if (required && !idempotencyKey) {
    logger.warn("Missing required Idempotency-Key header");
    return NextResponse.json(
      {
        success: false,
        errorCode: API_ERROR_CODES.IDEMPOTENCY_KEY_REQUIRED,
      },
      { status: HTTP_BAD_REQUEST },
    );
  }

  return idempotencyKey
    ? handleWithIdempotencyKey(idempotencyKey, handler, {
        fingerprint: buildFingerprint(request),
        ttlMs,
      })
    : handleWithoutIdempotencyKey(handler);
}

/**
 * 生成幂等键（客户端使用）
 */
export { generateIdempotencyKey } from "@/lib/idempotency-key";

/**
 * 清除指定幂等键（用于测试或手动清理）
 */
export function clearIdempotencyKey(key: string): void {
  pendingRequests.delete(key);
  pendingResults.delete(key);
  inFlightFingerprints.delete(key);
}

/**
 * 清除所有幂等键热缓存（用于测试）
 * NOTE: Does NOT clear the IdempotencyStore — store persists to simulate
 * cross-process/restart persistence.
 */
export function clearAllIdempotencyKeys(): void {
  pendingRequests.clear();
  pendingResults.clear();
  inFlightFingerprints.clear();
}

/**
 * Reset the backing idempotency store and hot caches (testing only).
 */
export function resetIdempotencyState(): void {
  idempotencyStore = null;
  clearAllIdempotencyKeys();
}

/**
 * 获取缓存统计信息
 */
export function getIdempotencyCacheStats() {
  return {
    size: pendingRequests.size + pendingResults.size,
    keys: Array.from(
      new Set([...pendingRequests.keys(), ...pendingResults.keys()]),
    ),
  };
}

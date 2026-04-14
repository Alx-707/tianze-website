/**
 * Utility functions for Idempotency Key Management
 *
 * Extracted to reduce main module line count below ESLint max-lines: 500
 */

import { NextResponse } from "next/server";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import { createApiErrorResponse } from "@/lib/api/api-response";
import {
  MILLISECONDS_PER_HOUR,
  HTTP_OK,
  HTTP_SERVICE_UNAVAILABLE,
} from "@/constants";
import { type IdempotencyStore } from "@/lib/security/stores/idempotency-store";

export const DEFAULT_TTL_MS = 24 * MILLISECONDS_PER_HOUR;
export const HTTP_CONFLICT = 409;

/**
 * Poll the store until the entry transitions from PENDING to COMPLETED.
 * Used by the "loser" of a concurrent SETNX race to wait for the winner.
 */
export async function waitForCompletion(
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
    if (entry.status === "success") {
      return NextResponse.json(entry.response, {
        status: HTTP_OK,
      });
    }
    if (entry.status === "error") {
      return createApiErrorResponse(
        API_ERROR_CODES.IDEMPOTENCY_REQUEST_FAILED,
        HTTP_SERVICE_UNAVAILABLE,
      );
    }
  }

  return createApiErrorResponse(
    API_ERROR_CODES.IDEMPOTENCY_REQUEST_TIMEOUT,
    HTTP_SERVICE_UNAVAILABLE,
  );
}

/**
 * Normalize handler result to {body, statusCode} tuple
 */
export function normalizeHandlerResult(result: unknown): {
  body: unknown;
  statusCode: number;
} {
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
}

export type IdempotentResultReason =
  | "missing"
  | "reused"
  | "timeout"
  | "failed";

export type IdempotentResult<T> =
  | { ok: true; result: T; cached?: boolean }
  | { ok: false; reason: IdempotentResultReason };

/**
 * Wait for completion of an idempotent result with typed return
 */
export async function waitForCompletionResult<T>(
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
    if (entry.status === "success") {
      return { ok: true, result: entry.response as T, cached: true };
    }
    if (entry.status === "error") {
      return { ok: false, reason: "failed" };
    }
  }

  return { ok: false, reason: "timeout" };
}

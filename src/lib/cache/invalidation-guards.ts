import { NextRequest, NextResponse } from "next/server";
import { createCacheHealthErrorResponse } from "@/lib/api/cache-health-response";
import { createValidationErrorResponse } from "@/lib/api/validation-error-response";
import {
  cacheInvalidationSchema,
  type InvalidationRequest,
} from "@/lib/cache/invalidation-policy";
import { getRuntimeEnvString } from "@/lib/env";
import { logger } from "@/lib/logger";
import { constantTimeCompare } from "@/lib/security-crypto";
import {
  checkDistributedRateLimit,
  createRateLimitHeaders,
} from "@/lib/security/distributed-rate-limit";
import {
  getApiKeyPriorityKey,
  getIPKey,
} from "@/lib/security/rate-limit-key-strategies";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import {
  HTTP_BAD_REQUEST,
  HTTP_SERVICE_UNAVAILABLE,
  HTTP_TOO_MANY_REQUESTS,
} from "@/constants";

type ApiKeyValidationResult =
  | { ok: true }
  | { ok: false; status: number; errorCode: string };

type RateLimitPresetType = "cacheInvalidatePreAuth" | "cacheInvalidate";

export function validateCacheInvalidationApiKey(
  request: NextRequest,
): ApiKeyValidationResult {
  const secret = getRuntimeEnvString("CACHE_INVALIDATION_SECRET");

  if (!secret) {
    logger.error("CACHE_INVALIDATION_SECRET not configured");
    return {
      ok: false,
      status: HTTP_SERVICE_UNAVAILABLE,
      errorCode: API_ERROR_CODES.SERVICE_UNAVAILABLE,
    };
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, errorCode: API_ERROR_CODES.UNAUTHORIZED };
  }

  const token = authHeader.slice(7);
  return constantTimeCompare(token, secret)
    ? { ok: true }
    : { ok: false, status: 401, errorCode: API_ERROR_CODES.UNAUTHORIZED };
}

export async function checkCacheInvalidationRateLimit(
  identifier: string,
  preset: RateLimitPresetType,
  logContext: string,
): Promise<NextResponse | null> {
  const rateLimitResult = await checkDistributedRateLimit(identifier, preset);
  if (!rateLimitResult.allowed) {
    const isStorageFailure = rateLimitResult.deniedReason === "storage_failure";
    logger.warn(`Cache invalidation ${logContext} rate limit exceeded`, {
      keyPrefix: identifier.slice(0, 8),
      retryAfter: rateLimitResult.retryAfter,
      deniedReason: rateLimitResult.deniedReason,
    });
    return createCacheHealthErrorResponse(
      isStorageFailure
        ? API_ERROR_CODES.SERVICE_UNAVAILABLE
        : API_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      isStorageFailure ? HTTP_SERVICE_UNAVAILABLE : HTTP_TOO_MANY_REQUESTS,
      createRateLimitHeaders(rateLimitResult),
    );
  }

  return null;
}

export async function parseCacheInvalidationRequestBody(
  request: NextRequest,
): Promise<InvalidationRequest | NextResponse> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return createCacheHealthErrorResponse(
      API_ERROR_CODES.INVALID_JSON_BODY,
      HTTP_BAD_REQUEST,
    );
  }

  const parseResult = cacheInvalidationSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return createValidationErrorResponse(
      parseResult.error,
      API_ERROR_CODES.INVALID_JSON_BODY,
    );
  }

  return parseResult.data;
}

export function getPreAuthInvalidationKey(request: NextRequest) {
  return getIPKey(request);
}

export function getPostAuthInvalidationKey(request: NextRequest) {
  return getApiKeyPriorityKey(request);
}

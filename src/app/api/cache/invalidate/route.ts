/**
 * Cache Invalidation API Route
 *
 * Provides HTTP endpoints for triggering cache invalidation.
 * Protected by API key authentication for security.
 *
 * Usage:
 * POST /api/cache/invalidate
 * Authorization: Bearer <CACHE_INVALIDATION_SECRET>
 * Content-Type: application/json
 *
 * Body:
 * {
 *   "domain": "i18n" | "content" | "product" | "all",
 *   "locale"?: "en" | "zh",
 *   "entity"?: string,
 *   "identifier"?: string
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  applyRequestObservability,
  getRequestObservability,
  withObservabilityContext,
} from "@/lib/api/request-observability";
import { recordApiResponseSignal } from "@/lib/observability/api-signals";
import {
  createCacheHealthErrorResponse,
  createCacheInvalidationResponse,
} from "@/lib/api/cache-health-response";
import {
  VALID_CACHE_DOMAINS,
  VALID_CACHE_ENTITIES,
  VALID_CACHE_LOCALES,
  processCacheInvalidation,
  type InvalidationRequest,
  type InvalidationResult,
} from "@/lib/cache/invalidation-policy";
import {
  checkCacheInvalidationRateLimit,
  getPostAuthInvalidationKey,
  getPreAuthInvalidationKey,
  parseCacheInvalidationRequestBody,
  validateCacheInvalidationApiKey,
} from "@/lib/cache/invalidation-guards";
import { logger } from "@/lib/logger";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import { HTTP_INTERNAL_ERROR } from "@/constants";

// Keep these exported-like constants in route scope for GET usage metadata.
const VALID_LOCALES = VALID_CACHE_LOCALES;
const VALID_DOMAINS = VALID_CACHE_DOMAINS;
const VALID_ENTITIES = VALID_CACHE_ENTITIES;

type ProcessResult = InvalidationResult | { errorCode: string; status: number };

async function finalizePostResponse({
  observability,
  response,
  startTime,
  path,
}: {
  observability: ReturnType<typeof getRequestObservability>;
  response: NextResponse;
  startTime: number;
  path: string;
}): Promise<NextResponse> {
  const enrichedResponse = applyRequestObservability(response, observability);
  await recordApiResponseSignal({
    context: observability,
    response: enrichedResponse,
    name: "cache.invalidate.post",
    route: "/api/cache/invalidate",
    latencyMs: Date.now() - startTime,
    meta: { path },
  });
  return enrichedResponse;
}

function processDomainInvalidation(
  options: InvalidationRequest,
): ProcessResult {
  return processCacheInvalidation(options);
}

async function handleCacheInvalidation(
  request: NextRequest,
  observability: ReturnType<typeof getRequestObservability>,
): Promise<NextResponse> {
  const body = await parseCacheInvalidationRequestBody(request);
  if (body instanceof NextResponse) return body;

  const result = processDomainInvalidation(body);

  if ("errorCode" in result) {
    return createCacheHealthErrorResponse(result.errorCode, result.status);
  }

  logger.info("Cache invalidation triggered", {
    domain: body.domain,
    locale: body.locale,
    entity: body.entity,
    identifier: body.identifier,
    result,
    ...withObservabilityContext(observability),
  });

  return createCacheInvalidationResponse(result);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const observability = getRequestObservability(request, "cache-health");
  const preAuthBlock = await checkCacheInvalidationRateLimit(
    getPreAuthInvalidationKey(request),
    "cacheInvalidatePreAuth",
    "pre-auth",
  );
  if (preAuthBlock) {
    return finalizePostResponse({
      observability,
      response: preAuthBlock,
      startTime,
      path: "pre-auth-rate-limit",
    });
  }

  const authResult = validateCacheInvalidationApiKey(request);
  if (!authResult.ok) {
    return finalizePostResponse({
      observability,
      response: createCacheHealthErrorResponse(
        authResult.errorCode,
        authResult.status,
      ),
      startTime,
      path: "auth",
    });
  }

  const postAuthBlock = await checkCacheInvalidationRateLimit(
    getPostAuthInvalidationKey(request),
    "cacheInvalidate",
    "post-auth",
  );
  if (postAuthBlock) {
    return finalizePostResponse({
      observability,
      response: postAuthBlock,
      startTime,
      path: "post-auth-rate-limit",
    });
  }

  try {
    return finalizePostResponse({
      observability,
      response: await handleCacheInvalidation(request, observability),
      startTime,
      path: "handler",
    });
  } catch (error) {
    logger.error(
      "Cache invalidation failed",
      withObservabilityContext(observability, { error }),
    );
    return finalizePostResponse({
      observability,
      response: createCacheHealthErrorResponse(
        API_ERROR_CODES.CACHE_INVALIDATION_FAILED,
        HTTP_INTERNAL_ERROR,
      ),
      startTime,
      path: "unexpected-error",
    });
  }
}

export function GET(request: NextRequest) {
  const observability = getRequestObservability(request, "cache-health");
  const response = applyRequestObservability(
    NextResponse.json({
      message: "Cache Invalidation API",
      usage: {
        method: "POST",
        authentication: "Bearer <CACHE_INVALIDATION_SECRET>",
        body: {
          domain: VALID_DOMAINS.join(" | "),
          locale: `${VALID_LOCALES.join(" | ")} (optional for i18n/all, required for content/product)`,
          entity: VALID_ENTITIES.join(" | "),
          identifier: "slug or specific identifier",
        },
      },
    }),
    observability,
  );
  recordApiResponseSignal({
    context: observability,
    response,
    name: "cache.invalidate.get",
    route: "/api/cache/invalidate",
  }).catch(() => undefined);
  return response;
}

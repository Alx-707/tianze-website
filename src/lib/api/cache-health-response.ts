import { NextRequest, NextResponse } from "next/server";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "@/constants";
import type { InvalidationResult } from "@/lib/cache/invalidation-policy";
import {
  applyRequestObservability,
  getRequestObservability,
} from "@/lib/api/request-observability";
import { recordApiResponseSignal } from "@/lib/observability/api-signals";

export interface CacheHealthResponse {
  status: "ok";
}

export interface CacheErrorResponse {
  success: false;
  errorCode: string;
}

export interface CacheInvalidationResponse {
  success: boolean;
  errorCode: string;
  invalidatedTags: string[];
  errors?: string[];
}

const CACHE_HEALTH_HEADERS = {
  "cache-control": "no-store",
} as const;

export function createCacheHealthResponse(): NextResponse<CacheHealthResponse> {
  return NextResponse.json(
    { status: "ok" },
    {
      status: 200,
      headers: CACHE_HEALTH_HEADERS,
    },
  );
}

export interface ObservedCacheHealthResponseOptions {
  requestId?: string;
}

export function createObservedCacheHealthResponse(
  request: NextRequest,
  options: ObservedCacheHealthResponseOptions = {},
): NextResponse<CacheHealthResponse> {
  const baseContext = getRequestObservability(request, "cache-health");
  const context = options.requestId
    ? { ...baseContext, requestId: options.requestId }
    : baseContext;
  const response = applyRequestObservability(
    createCacheHealthResponse(),
    context,
  );

  recordApiResponseSignal({
    context,
    response,
    name: "health.get",
    route: "/api/health",
  }).catch(() => undefined);

  return response;
}

export function createCacheHealthErrorResponse(
  errorCode: string,
  status: number,
  headers?: HeadersInit,
): NextResponse<CacheErrorResponse> {
  return NextResponse.json(
    { success: false, errorCode },
    {
      status,
      ...(headers ? { headers } : {}),
    },
  );
}

export function createCacheInvalidationResponse(
  result: InvalidationResult,
): NextResponse<CacheInvalidationResponse> {
  return NextResponse.json(
    {
      success: result.success,
      errorCode: result.success
        ? API_ERROR_CODES.CACHE_INVALIDATED
        : API_ERROR_CODES.CACHE_INVALIDATION_FAILED,
      invalidatedTags: result.invalidatedTags,
      ...(result.errors.length > 0 && { errors: result.errors }),
    },
    { status: result.success ? HTTP_OK : HTTP_INTERNAL_ERROR },
  );
}

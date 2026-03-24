import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import { GET as healthGet } from "@/app/api/health/route";
import { POST as invalidatePost } from "@/app/api/cache/invalidate/route";
import {
  OBSERVABILITY_SURFACE_HEADER,
  REQUEST_ID_HEADER,
} from "@/lib/api/request-observability";
import {
  getSystemObservabilitySnapshot,
  resetSystemObservability,
} from "@/lib/observability/system-observability";

const {
  mockLogger,
  mockCheckDistributedRateLimit,
  mockCreateRateLimitHeaders,
  mockInvalidateI18n,
} = vi.hoisted(() => ({
  mockLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  mockCheckDistributedRateLimit: vi.fn(async () => ({
    allowed: true,
    remaining: 10,
    resetTime: Date.now() + 60000,
    retryAfter: null,
  })),
  mockCreateRateLimitHeaders: vi.fn(() => new Headers()),
  mockInvalidateI18n: {
    critical: vi.fn(() => ({
      success: true,
      invalidatedTags: ["i18n:critical"],
      errors: [],
    })),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: mockLogger,
}));

vi.mock("@/lib/security/distributed-rate-limit", () => ({
  checkDistributedRateLimit: mockCheckDistributedRateLimit,
  createRateLimitHeaders: mockCreateRateLimitHeaders,
}));

vi.mock("@/lib/cache", () => ({
  CACHE_INVALIDATION_LOCALES: ["en", "zh"],
  CACHE_INVALIDATION_DOMAINS: ["i18n", "content", "product", "all"],
  CACHE_INVALIDATION_ENTITIES: [
    "critical",
    "deferred",
    "blog",
    "page",
    "detail",
    "categories",
    "featured",
  ],
  invalidateI18n: {
    ...mockInvalidateI18n,
    all: vi.fn(() => ({
      success: true,
      invalidatedTags: ["i18n"],
      errors: [],
    })),
    locale: vi.fn(() => ({
      success: true,
      invalidatedTags: ["i18n:locale"],
      errors: [],
    })),
    deferred: vi.fn(() => ({
      success: true,
      invalidatedTags: ["i18n:deferred"],
      errors: [],
    })),
  },
  invalidateContent: {
    locale: vi.fn(),
    blogPost: vi.fn(),
    page: vi.fn(),
  },
  invalidateProduct: {
    locale: vi.fn(),
    detail: vi.fn(),
    categories: vi.fn(),
    featured: vi.fn(),
  },
  invalidateLocale: vi.fn(),
  invalidateDomain: vi.fn(),
  invalidateCacheRequest: vi.fn(
    (options: {
      domain: string;
      locale?: string;
      entity?: string;
      identifier?: string;
    }) => {
      if (options.domain === "i18n") {
        if (options.locale === "en" || options.locale === "zh") {
          if (options.entity === "critical")
            return mockInvalidateI18n.critical();
          if (options.entity === "deferred")
            return {
              success: true,
              invalidatedTags: ["i18n:deferred"],
              errors: [],
            };
          return {
            success: true,
            invalidatedTags: ["i18n:locale"],
            errors: [],
          };
        }
        return {
          success: true,
          invalidatedTags: ["i18n"],
          errors: [],
        };
      }

      if (options.domain === "content" || options.domain === "product") {
        return {
          errorCode: API_ERROR_CODES.CACHE_LOCALE_REQUIRED,
          status: 400,
        };
      }

      if (options.domain === "all") {
        return {
          success: true,
          invalidatedTags: ["all:locale"],
          errors: [],
        };
      }

      return {
        errorCode: API_ERROR_CODES.CACHE_INVALID_DOMAIN,
        status: 400,
      };
    },
  ),
}));

describe("cache health contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSystemObservability();
    vi.stubEnv("CACHE_INVALIDATION_SECRET", "secret");
  });

  it("health route returns a stable no-store status payload", async () => {
    const response = healthGet(
      new NextRequest("http://localhost:3000/api/health", {
        headers: {
          [REQUEST_ID_HEADER]: "health-contract-request",
        },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get(REQUEST_ID_HEADER)).toBe(
      "health-contract-request",
    );
    expect(response.headers.get(OBSERVABILITY_SURFACE_HEADER)).toBe(
      "cache-health",
    );
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("cache invalidation unauthorized response uses machine-readable family error shape", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/cache/invalidate",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [REQUEST_ID_HEADER]: "cache-unauthorized-request",
        },
        body: JSON.stringify({ domain: "i18n" }),
      },
    );

    const response = await invalidatePost(request);
    expect(response.status).toBe(401);
    expect(response.headers.get(REQUEST_ID_HEADER)).toBe(
      "cache-unauthorized-request",
    );
    expect(response.headers.get(OBSERVABILITY_SURFACE_HEADER)).toBe(
      "cache-health",
    );
    expect(await response.json()).toEqual({
      success: false,
      errorCode: API_ERROR_CODES.UNAUTHORIZED,
    });
  });

  it("cache invalidation success uses machine-readable family success shape", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/cache/invalidate",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer secret",
          [REQUEST_ID_HEADER]: "cache-success-request",
        },
        body: JSON.stringify({
          domain: "i18n",
          locale: "en",
          entity: "critical",
        }),
      },
    );

    const response = await invalidatePost(request);
    expect(response.status).toBe(200);
    expect(response.headers.get(REQUEST_ID_HEADER)).toBe(
      "cache-success-request",
    );
    expect(response.headers.get(OBSERVABILITY_SURFACE_HEADER)).toBe(
      "cache-health",
    );
    expect(await response.json()).toEqual({
      success: true,
      errorCode: API_ERROR_CODES.CACHE_INVALIDATED,
      invalidatedTags: ["i18n:critical"],
    });

    expect(getSystemObservabilitySnapshot().aggregates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          surface: "cache-health",
          kind: "api_request",
          name: "cache.invalidate.post",
          success: 1,
          lastRequestId: "cache-success-request",
        }),
      ]),
    );
  });
});

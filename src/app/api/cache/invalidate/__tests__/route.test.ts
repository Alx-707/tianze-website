import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/cache/invalidate/route";
import { API_ERROR_CODES } from "@/constants/api-error-codes";

const {
  mockLogger,
  mockCheckDistributedRateLimit,
  mockCreateRateLimitHeaders,
  mockInvalidateI18n,
  mockInvalidateContent,
  mockInvalidateProduct,
  mockInvalidateLocale,
  mockInvalidateDomain,
} = vi.hoisted(() => {
  return {
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
      critical: vi.fn(() => ({
        success: true,
        invalidatedTags: ["i18n:critical"],
        errors: [],
      })),
      deferred: vi.fn(() => ({
        success: true,
        invalidatedTags: ["i18n:deferred"],
        errors: [],
      })),
    },
    mockInvalidateContent: {
      locale: vi.fn(() => ({
        success: true,
        invalidatedTags: ["content:locale"],
        errors: [],
      })),
      blogPost: vi.fn(() => ({
        success: true,
        invalidatedTags: ["content:blog"],
        errors: [],
      })),
      page: vi.fn(() => ({
        success: true,
        invalidatedTags: ["content:page"],
        errors: [],
      })),
    },
    mockInvalidateProduct: {
      locale: vi.fn(() => ({
        success: true,
        invalidatedTags: ["product:locale"],
        errors: [],
      })),
      detail: vi.fn(() => ({
        success: true,
        invalidatedTags: ["product:detail"],
        errors: [],
      })),
      categories: vi.fn(() => ({
        success: true,
        invalidatedTags: ["product:categories"],
        errors: [],
      })),
      featured: vi.fn(() => ({
        success: true,
        invalidatedTags: ["product:featured"],
        errors: [],
      })),
    },
    mockInvalidateLocale: vi.fn(() => ({
      success: true,
      invalidatedTags: ["all:locale"],
      errors: [],
    })),
    mockInvalidateDomain: vi.fn(() => ({
      success: true,
      invalidatedTags: ["all:domain"],
      errors: [],
    })),
  };
});

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
  invalidateI18n: mockInvalidateI18n,
  invalidateContent: mockInvalidateContent,
  invalidateProduct: mockInvalidateProduct,
  invalidateLocale: mockInvalidateLocale,
  invalidateDomain: mockInvalidateDomain,
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
            return mockInvalidateI18n.deferred();
          return mockInvalidateI18n.locale();
        }
        return mockInvalidateI18n.all();
      }

      if (options.domain === "content") {
        if (!options.locale) {
          return {
            errorCode: API_ERROR_CODES.CACHE_LOCALE_REQUIRED,
            status: 400,
          };
        }
        if (options.entity === "blog") return mockInvalidateContent.blogPost();
        if (options.entity === "page") return mockInvalidateContent.page();
        return mockInvalidateContent.locale();
      }

      if (options.domain === "product") {
        if (!options.locale) {
          return {
            errorCode: API_ERROR_CODES.CACHE_LOCALE_REQUIRED,
            status: 400,
          };
        }
        if (options.entity === "detail") return mockInvalidateProduct.detail();
        if (options.entity === "categories")
          return mockInvalidateProduct.categories();
        if (options.entity === "featured")
          return mockInvalidateProduct.featured();
        return mockInvalidateProduct.locale();
      }

      if (options.domain === "all") {
        if (options.locale === "en" || options.locale === "zh") {
          return mockInvalidateLocale();
        }
        return mockInvalidateDomain();
      }

      return {
        errorCode: API_ERROR_CODES.CACHE_INVALID_DOMAIN,
        status: 400,
      };
    },
  ),
}));

describe("cache invalidate route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CACHE_INVALIDATION_SECRET", "secret");
  });

  it("GET returns usage metadata", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("usage");
  });

  it("POST returns 401 when missing authorization", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/cache/invalidate",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ domain: "i18n" }),
      },
    );

    const response = await POST(request);
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.errorCode).toBe(API_ERROR_CODES.UNAUTHORIZED);
  });

  it("POST returns 503 when CACHE_INVALIDATION_SECRET is not configured", async () => {
    vi.stubEnv("CACHE_INVALIDATION_SECRET", "");

    const request = new NextRequest(
      "http://localhost:3000/api/cache/invalidate",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer secret",
        },
        body: JSON.stringify({ domain: "i18n" }),
      },
    );

    const response = await POST(request);
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.errorCode).toBe(API_ERROR_CODES.SERVICE_UNAVAILABLE);
    expect(mockInvalidateI18n.all).not.toHaveBeenCalled();
  });

  it("POST invalidates i18n tags when authorized", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/cache/invalidate",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer secret",
        },
        body: JSON.stringify({
          domain: "i18n",
          locale: "en",
          entity: "critical",
        }),
      },
    );

    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(mockInvalidateI18n.critical).toHaveBeenCalled();
  });

  it("POST returns 400 for content invalidation without locale", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/cache/invalidate",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer secret",
        },
        body: JSON.stringify({
          domain: "content",
          entity: "page",
          identifier: "about",
        }),
      },
    );

    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.errorCode).toBe(API_ERROR_CODES.CACHE_LOCALE_REQUIRED);
  });
});

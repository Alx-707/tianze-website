/**
 * CSP Report API Route - Rate Limiting Tests
 */

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockCheckDistributedRateLimit = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 99,
    resetTime: Date.now() + 60000,
    retryAfter: null,
  }),
);

const mockCreateRateLimitHeaders = vi.hoisted(() =>
  vi.fn().mockImplementation((result) => {
    const headers = new Headers();
    headers.set("X-RateLimit-Remaining", String(result.remaining));
    headers.set("X-RateLimit-Reset", String(result.resetTime));
    if (result.retryAfter !== null) {
      headers.set("Retry-After", String(result.retryAfter));
    }
    return headers;
  }),
);

vi.mock("@/lib/security/distributed-rate-limit", () => ({
  checkDistributedRateLimit: mockCheckDistributedRateLimit,
  createRateLimitHeaders: mockCreateRateLimitHeaders,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  // Keep exports compatible with production module shape.
  // Route code sanitizes before logging; tests don't assert on sanitization details here.
  sanitizeIP: vi.fn(() => "[REDACTED_IP]"),
  sanitizeLogContext: vi.fn((context: Record<string, unknown>) => context),
}));

vi.mock("@/lib/env", () => ({
  env: {
    NODE_ENV: "production",
    CSP_REPORT_URI: "https://example.com/csp-report",
  },
}));

describe("CSP Report API Route - Rate Limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const validCSPReport = {
    "csp-report": {
      "document-uri": "https://example.com/page",
      "violated-directive": "script-src",
      "blocked-uri": "https://external.com/script.js",
    },
  };

  const createRequest = (ip = "192.168.1.1") =>
    new NextRequest("http://localhost:3000/api/csp-report", {
      method: "POST",
      body: JSON.stringify(validCSPReport),
      headers: {
        "content-type": "application/csp-report",
        "x-forwarded-for": ip,
      },
    });

  describe("Rate limit enforcement", () => {
    it("should allow requests within rate limit", async () => {
      mockCheckDistributedRateLimit.mockResolvedValueOnce({
        allowed: true,
        remaining: 99,
        resetTime: Date.now() + 60000,
        retryAfter: null,
      });

      const { POST } = await import("../route");
      const response = await POST(createRequest());

      expect(response.status).toBe(200);
      expect(mockCheckDistributedRateLimit).toHaveBeenCalledWith(
        expect.stringMatching(/^ip:[0-9a-f]{16}$/),
        "csp",
      );

      const [identifier] = mockCheckDistributedRateLimit.mock.calls[0] ?? [];
      expect(String(identifier)).not.toContain("192.168.1.1");
    });

    it("should return 429 when rate limit exceeded", async () => {
      mockCheckDistributedRateLimit.mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 60,
      });

      const { POST } = await import("../route");
      const response = await POST(createRequest());
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Too many requests");
    });
  });
});

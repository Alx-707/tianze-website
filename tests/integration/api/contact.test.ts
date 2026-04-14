import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetIdempotencyState } from "@/lib/idempotency";
import * as contactRoute from "@/app/api/contact/route";

/**
 * Auxiliary route-level checks for /api/contact.
 *
 * The heavy mocks here keep this suite fast, but they also mean it should not
 * be treated as the main proof for contact protection behavior.
 */
vi.mock("@/lib/security/distributed-rate-limit", () => ({
  checkDistributedRateLimit: vi.fn(async () => ({
    allowed: true,
    remaining: 5,
    resetTime: Date.now() + 60000,
    retryAfter: null,
  })),
  createRateLimitHeaders: vi.fn(() => new Headers()),
}));

vi.mock("@/lib/contact-form-processing", () => ({
  processFormSubmission: vi.fn(async () => ({
    success: true,
    emailSent: true,
    recordCreated: true,
    referenceId: "ref-1",
  })),
}));

vi.mock("@/app/api/contact/contact-api-validation", () => ({
  validateFormData: vi.fn(async (body: unknown) => ({
    success: true,
    data: body as any,
  })),
  validateAdminAccess: vi.fn((auth?: string | null) => auth === "Bearer admin"),
  getContactFormStats: vi.fn(async () => ({ total: 10 })),
}));

vi.mock("@/lib/contact/submit-canonical-contact", () => ({
  createCanonicalContactFingerprintFromUnknown: vi.fn(() => "CONTACT:test"),
  submitCanonicalContactSubmission: vi.fn(async (body: unknown) => ({
    success: true,
    error: null,
    details: null,
    data: body,
    submissionResult: {
      success: true,
      emailSent: true,
      recordCreated: true,
      referenceId: "ref-1",
    },
  })),
}));

describe("api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetIdempotencyState();
  });

  const makeRequest = (body: unknown) =>
    new NextRequest(
      new Request("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": "test-contact-idempotency-key",
        },
      }),
    );

  it("handles successful form submission", async () => {
    const res = await contactRoute.POST(
      makeRequest({ email: "a@example.com", company: "Acme" }),
    );

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.referenceId).toBe("ref-1");
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new NextRequest(
      new Request("http://localhost/api/contact", {
        method: "POST",
        body: "invalid json",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": "test-contact-idempotency-key",
        },
      }),
    );

    const res = await contactRoute.POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.errorCode).toBe("INVALID_JSON_BODY");
  });

  it("returns 429 when rate limited", async () => {
    const rateLimit = await import("@/lib/security/distributed-rate-limit");
    (
      rateLimit.checkDistributedRateLimit as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60000,
      retryAfter: 60,
    });

    const res = await contactRoute.POST(
      makeRequest({ email: "a@example.com" }),
    );
    expect(res.status).toBe(429);
  });

  it("returns 400 when Idempotency-Key is missing", async () => {
    const req = new NextRequest(
      new Request("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify({ email: "a@example.com", company: "Acme" }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const res = await contactRoute.POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.errorCode).toBe("IDEMPOTENCY_KEY_REQUIRED");
  });

  it("rejects invalid form data", async () => {
    const canonical = await import("@/lib/contact/submit-canonical-contact");
    (
      canonical.submitCanonicalContactSubmission as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      success: false,
      errorCode: "CONTACT_VALIDATION_FAILED",
      error: "invalid",
      details: null,
      data: null,
      statusCode: 400,
    });

    const res = await contactRoute.POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("requires admin auth for GET stats", async () => {
    const unauthorized = await contactRoute.GET(
      new NextRequest(
        new Request("http://localhost/api/contact", {
          headers: { authorization: "none" },
        }),
      ),
    );
    expect(unauthorized.status).toBe(401);

    const authorized = await contactRoute.GET(
      new NextRequest(
        new Request("http://localhost/api/contact", {
          headers: { authorization: "Bearer admin" },
        }),
      ),
    );
    expect(authorized.status).toBe(200);
    const authorizedJson = await authorized.json();
    expect(authorizedJson.success).toBe(true);
    expect(authorizedJson.data).toEqual({ total: 10 });
  });
});

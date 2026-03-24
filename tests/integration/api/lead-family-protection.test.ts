import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import { resetIdempotencyState } from "@/lib/idempotency";
import * as contactRoute from "@/app/api/contact/route";
import * as inquiryRoute from "@/app/api/inquiry/route";
import * as subscribeRoute from "@/app/api/subscribe/route";
import { validateFormData } from "@/app/api/contact/contact-api-validation";
import { processLead } from "@/lib/lead-pipeline";

vi.mock("@/lib/security/distributed-rate-limit", () => ({
  checkDistributedRateLimit: vi.fn(async () => ({
    allowed: true,
    remaining: 5,
    resetTime: Date.now() + 60000,
    retryAfter: null,
  })),
  createRateLimitHeaders: vi.fn(() => new Headers()),
}));

vi.mock("@/lib/turnstile", () => ({
  verifyTurnstile: vi.fn(async () => true),
}));

vi.mock("@/app/api/contact/contact-api-validation", () => ({
  validateFormData: vi.fn(async (body: unknown) => ({
    success: true,
    data: body as Record<string, unknown>,
    error: null,
    details: null,
  })),
  validateAdminAccess: vi.fn(() => false),
  getContactFormStats: vi.fn(async () => ({ total: 10 })),
}));

vi.mock("@/lib/contact-form-processing", () => ({
  processFormSubmission: vi.fn(async () => ({
    success: true,
    emailSent: true,
    recordCreated: true,
    referenceId: "contact-ref-001",
  })),
}));

vi.mock("@/lib/lead-pipeline", () => ({
  processLead: vi.fn(async () => ({
    success: true,
    emailSent: true,
    recordCreated: true,
    referenceId: "lead-ref-001",
  })),
  LEAD_TYPES: {
    PRODUCT: "PRODUCT",
    CONTACT: "CONTACT",
    NEWSLETTER: "NEWSLETTER",
  },
}));

vi.mock("@/lib/lead-pipeline/lead-schema", () => ({
  LEAD_TYPES: {
    PRODUCT: "PRODUCT",
    CONTACT: "CONTACT",
    NEWSLETTER: "NEWSLETTER",
  },
  productLeadSchema: {
    safeParse: vi.fn((input: Record<string, unknown>) => ({
      success: true,
      data: {
        ...input,
        type: "PRODUCT",
      },
    })),
  },
}));

function makeRequest(
  pathname: string,
  body: unknown,
  headers: HeadersInit = {},
): NextRequest {
  return new NextRequest(
    new Request(`http://localhost${pathname}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `${pathname}-key`,
        ...(headers as Record<string, string>),
      },
    }),
  );
}

describe("lead API family protection contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetIdempotencyState();
  });

  it("all write-path family routes require Idempotency-Key", async () => {
    const contact = await contactRoute.POST(
      new NextRequest(
        new Request("http://localhost/api/contact", {
          method: "POST",
          body: JSON.stringify({ email: "contact@example.com" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const inquiry = await inquiryRoute.POST(
      new NextRequest(
        new Request("http://localhost/api/inquiry", {
          method: "POST",
          body: JSON.stringify({
            email: "buyer@example.com",
            fullName: "Buyer",
            company: "Buyer Co",
            productSlug: "north-america",
            productName: "North America",
            turnstileToken: "valid-token",
          }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const subscribe = await subscribeRoute.POST(
      new NextRequest(
        new Request("http://localhost/api/subscribe", {
          method: "POST",
          body: JSON.stringify({
            email: "newsletter@example.com",
            turnstileToken: "valid-token",
          }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    expect((await contact.json()).errorCode).toBe(
      API_ERROR_CODES.IDEMPOTENCY_KEY_REQUIRED,
    );
    expect((await inquiry.json()).errorCode).toBe(
      API_ERROR_CODES.IDEMPOTENCY_KEY_REQUIRED,
    );
    expect((await subscribe.json()).errorCode).toBe(
      API_ERROR_CODES.IDEMPOTENCY_KEY_REQUIRED,
    );
  });

  it("all write-path family routes return 429 under rate limiting", async () => {
    const rateLimit = await import("@/lib/security/distributed-rate-limit");
    vi.mocked(rateLimit.checkDistributedRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60000,
      retryAfter: 60,
    });

    const contact = await contactRoute.POST(
      makeRequest("/api/contact", {
        email: "contact@example.com",
        company: "Acme",
        firstName: "Ada",
      }),
    );
    const inquiry = await inquiryRoute.POST(
      makeRequest("/api/inquiry", {
        turnstileToken: "valid-token",
        email: "buyer@example.com",
        fullName: "Buyer",
        company: "Buyer Co",
        productSlug: "north-america",
        productName: "North America",
      }),
    );
    const subscribe = await subscribeRoute.POST(
      makeRequest("/api/subscribe", {
        email: "newsletter@example.com",
        turnstileToken: "valid-token",
      }),
    );

    expect(contact.status).toBe(429);
    expect(inquiry.status).toBe(429);
    expect(subscribe.status).toBe(429);
  });

  it("inquiry and subscribe both reject missing turnstile tokens before processing", async () => {
    const inquiry = await inquiryRoute.POST(
      makeRequest("/api/inquiry", {
        email: "buyer@example.com",
        fullName: "Buyer",
        company: "Buyer Co",
        productSlug: "north-america",
        productName: "North America",
      }),
    );
    const subscribe = await subscribeRoute.POST(
      makeRequest("/api/subscribe", {
        email: "newsletter@example.com",
      }),
    );

    expect((await inquiry.json()).errorCode).toBe(
      API_ERROR_CODES.INQUIRY_SECURITY_REQUIRED,
    );
    expect((await subscribe.json()).errorCode).toBe(
      API_ERROR_CODES.SUBSCRIBE_SECURITY_REQUIRED,
    );
    expect(vi.mocked(processLead)).not.toHaveBeenCalled();
  });

  it("contact rejects invalid validation before submission processing", async () => {
    vi.mocked(validateFormData).mockResolvedValueOnce({
      success: false,
      errorCode: API_ERROR_CODES.CONTACT_VALIDATION_FAILED,
      error: "Validation failed",
      details: null,
      data: null,
    });

    const response = await contactRoute.POST(
      makeRequest("/api/contact", {
        email: "contact@example.com",
        company: "Acme",
        firstName: "Ada",
      }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).errorCode).toBe(
      API_ERROR_CODES.CONTACT_VALIDATION_FAILED,
    );
  });
});

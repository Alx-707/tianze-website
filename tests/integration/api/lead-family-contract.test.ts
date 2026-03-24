import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetIdempotencyState } from "@/lib/idempotency";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import * as contactRoute from "@/app/api/contact/route";
import * as inquiryRoute from "@/app/api/inquiry/route";
import * as subscribeRoute from "@/app/api/subscribe/route";

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
  extraHeaders: HeadersInit = {},
) {
  return new NextRequest(
    new Request(`http://localhost${pathname}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `${pathname}-key`,
        ...(extraHeaders as Record<string, string>),
      },
    }),
  );
}

describe("lead API family contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetIdempotencyState();
  });

  it("contact success uses the family success contract", async () => {
    const response = await contactRoute.POST(
      makeRequest("/api/contact", {
        email: "contact@example.com",
        company: "Acme",
        firstName: "Ada",
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      success: true,
      data: {
        referenceId: "contact-ref-001",
      },
    });
  });

  it("inquiry success uses the family success contract", async () => {
    const response = await inquiryRoute.POST(
      makeRequest("/api/inquiry", {
        turnstileToken: "valid-token",
        email: "buyer@example.com",
        fullName: "Buyer",
        company: "Buyer Co",
        productSlug: "north-america",
        productName: "North America",
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      success: true,
      data: {
        referenceId: "lead-ref-001",
      },
    });
  });

  it("subscribe success uses the family success contract", async () => {
    const response = await subscribeRoute.POST(
      makeRequest("/api/subscribe", {
        email: "newsletter@example.com",
        turnstileToken: "valid-token",
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      success: true,
      data: {
        referenceId: "lead-ref-001",
      },
    });
  });

  it("contact invalid JSON uses the family error contract", async () => {
    const response = await contactRoute.POST(
      new NextRequest(
        new Request("http://localhost/api/contact", {
          method: "POST",
          body: "not-json",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": "contact-invalid-json",
          },
        }),
      ),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      errorCode: API_ERROR_CODES.INVALID_JSON_BODY,
    });
  });

  it("inquiry missing turnstile uses the family error contract", async () => {
    const response = await inquiryRoute.POST(
      makeRequest("/api/inquiry", {
        email: "buyer@example.com",
        fullName: "Buyer",
        company: "Buyer Co",
        productSlug: "north-america",
        productName: "North America",
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      errorCode: API_ERROR_CODES.INQUIRY_SECURITY_REQUIRED,
    });
  });

  it("subscribe missing email uses the family error contract", async () => {
    const response = await subscribeRoute.POST(
      makeRequest("/api/subscribe", {
        turnstileToken: "valid-token",
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      errorCode: API_ERROR_CODES.SUBSCRIBE_VALIDATION_EMAIL_REQUIRED,
    });
  });
});

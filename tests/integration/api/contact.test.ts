import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as contactRoute from "@/app/api/contact/route";

vi.mock("@/lib/security/distributed-rate-limit", () => ({
  checkDistributedRateLimit: vi.fn(async () => ({
    allowed: true,
    remaining: 5,
    resetTime: Date.now() + 60000,
    retryAfter: null,
  })),
  createRateLimitHeaders: vi.fn(() => new Headers()),
}));

vi.mock("@/app/api/contact/contact-api-utils", () => ({
  getClientIP: vi.fn(() => "1.1.1.1"),
}));

vi.mock("@/app/api/contact/contact-api-validation", () => ({
  validateFormData: vi.fn(async (body: unknown) => ({
    success: true,
    data: body as any,
  })),
  processFormSubmission: vi.fn(async () => ({
    emailSent: true,
    recordCreated: true,
    emailMessageId: "msg-1",
    airtableRecordId: "rec-1",
  })),
  validateAdminAccess: vi.fn((auth?: string | null) => auth === "Bearer admin"),
  getContactFormStats: vi.fn(async () => ({ total: 10 })),
}));

describe("api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const makeRequest = (body: unknown) =>
    new NextRequest(
      new Request("http://localhost/api/contact", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    );

  it("handles successful form submission", async () => {
    const res = await contactRoute.POST(
      makeRequest({ email: "a@example.com", company: "Acme" }),
    );

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.messageId).toBe("msg-1");
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new NextRequest(
      new Request("http://localhost/api/contact", {
        method: "POST",
        body: "invalid json",
      }),
    );

    const res = await contactRoute.POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe("INVALID_JSON");
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

  it("rejects invalid form data", async () => {
    const validation = await import("@/app/api/contact/contact-api-validation");
    (
      validation.validateFormData as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      success: false,
      error: "invalid",
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
    expect(await authorized.json()).toEqual({ total: 10 });
  });
});

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import { resetIdempotencyState } from "@/lib/idempotency";
import { GET, POST } from "@/app/api/contact/route";

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const {
  mockAirtableService,
  mockResendService,
  mockLogger,
  mockValidationHelpers,
} = vi.hoisted(() => ({
  mockAirtableService: {
    isReady: vi.fn(),
    createContact: vi.fn(),
    getStatistics: vi.fn(),
  },
  mockResendService: {
    isReady: vi.fn(),
    sendContactFormEmail: vi.fn(),
    sendConfirmationEmail: vi.fn(),
  },
  mockLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  mockValidationHelpers: {
    validateEmail: vi.fn(),
    sanitizeInput: vi.fn(),
  },
}));

// Mock dependencies
vi.mock("@/lib/airtable", () => ({
  airtableService: mockAirtableService,
}));

vi.mock("@/lib/resend", () => ({
  resendService: mockResendService,
}));

vi.mock("@/lib/logger", () => ({
  logger: mockLogger,
  sanitizeIP: (ip: string | undefined | null) =>
    ip ? "[REDACTED_IP]" : "[NO_IP]",
  sanitizeEmail: (email: string | undefined | null) =>
    email ? "[REDACTED_EMAIL]" : "[NO_EMAIL]",
  sanitizeLogContext: <T extends Record<string, unknown>>(context: T): T =>
    context,
}));

// Mock distributed rate limit
vi.mock("@/lib/security/distributed-rate-limit", () => ({
  checkDistributedRateLimit: vi.fn(async () => ({
    allowed: true,
    remaining: 5,
    resetTime: Date.now() + 60000,
    retryAfter: null,
  })),
  createRateLimitHeaders: vi.fn(() => new Headers()),
}));

// 移除全局validations Mock，使用真实的验证逻辑
// 在需要的地方进行局部Mock

// Mock contact API validation (validateFormData, validateAdminAccess, getContactFormStats remain here)
vi.mock("@/app/api/contact/contact-api-validation", async () => {
  const actual = await vi.importActual(
    "@/app/api/contact/contact-api-validation",
  );
  return {
    ...actual,
    validateFormData: vi.fn(),
    validateAdminAccess: vi.fn(),
    getContactFormStats: vi.fn(),
  };
});

// Mock processFormSubmission from its new lib location
vi.mock("@/lib/contact-form-processing", () => ({
  processFormSubmission: vi.fn().mockResolvedValue({
    emailSent: true,
    recordCreated: true,
    referenceId: "ref-123",
  }),
}));

// Mock process.env for Turnstile verification
Object.defineProperty(process, "env", {
  value: {
    ...process.env,
    NODE_ENV: "test",
    TURNSTILE_SECRET_KEY: "test-turnstile-key",
  },
});

describe("Contact API Route", () => {
  beforeEach(async () => {
    // Vitest v4: ensure mock implementations are reset between tests
    vi.resetAllMocks();
    resetIdempotencyState();

    // Reset default mock implementations
    mockAirtableService.isReady.mockReturnValue(true);
    mockResendService.isReady.mockReturnValue(true);
    mockValidationHelpers.validateEmail.mockReturnValue(true);
    mockValidationHelpers.sanitizeInput.mockImplementation((input) => input);

    // Reset contact-form-processing mocks
    const contactFormProcessing = await import("@/lib/contact-form-processing");
    vi.mocked(contactFormProcessing.processFormSubmission).mockResolvedValue({
      success: true,
      emailSent: true,
      recordCreated: true,
      referenceId: "ref-123",
    } as any);
  });

  describe("POST /api/contact", () => {
    const validFormData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      company: "Test Company",
      message: "Test message",
      acceptPrivacy: true,
      phone: "+1234567890",
      subject: "Test Subject",
      marketingConsent: false,
      website: "",
      turnstileToken: "valid-token",
      submittedAt: new Date().toISOString(),
    };

    it("应该成功处理有效的表单提交", async () => {
      // Mock successful validation
      const { validateFormData } =
        await import("@/app/api/contact/contact-api-validation");
      vi.mocked(validateFormData).mockResolvedValue({
        success: true,
        error: null,
        details: null,
        data: validFormData,
      });

      // Ensure submission processing is mocked to succeed under Vitest v4
      const { processFormSubmission } =
        await import("@/lib/contact-form-processing");
      vi.mocked(processFormSubmission).mockResolvedValue({
        success: true,
        emailSent: true,
        recordCreated: true,
        referenceId: "ref-123",
      } as any);

      // Mock successful service responses
      mockAirtableService.createContact.mockResolvedValue({ id: "record-123" });
      mockResendService.sendContactFormEmail.mockResolvedValue("email-123");
      mockResendService.sendConfirmationEmail.mockResolvedValue(
        "confirmation-123",
      );

      // Mock Turnstile verification
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const request = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        body: JSON.stringify(validFormData),
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "127.0.0.1",
          "Idempotency-Key": "contact-route-key",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.referenceId).toBe("ref-123");
    });

    it("应该处理无效的表单数据", async () => {
      // Mock validation failure
      const { validateFormData } =
        await import("@/app/api/contact/contact-api-validation");
      vi.mocked(validateFormData).mockResolvedValue({
        success: false,
        error: "Invalid form data",
        details: ["email: Invalid email"],
        data: null,
      });

      const request = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        body: JSON.stringify({ email: "invalid-email" }),
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": "contact-route-key",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errorCode).toBe(API_ERROR_CODES.CONTACT_VALIDATION_FAILED);
    });

    it("应该处理速率限制", async () => {
      const rateLimitModule =
        await import("@/lib/security/distributed-rate-limit");
      let callCount = 0;
      vi.mocked(rateLimitModule.checkDistributedRateLimit).mockImplementation(
        async () => {
          callCount += 1;
          const allowed = callCount < 6;
          return {
            allowed,
            remaining: allowed ? 5 : 0,
            resetTime: Date.now() + 60000,
            retryAfter: allowed ? null : 60,
          };
        },
      );

      const createRequest = (attempt: number) =>
        new NextRequest("http://localhost:3000/api/contact", {
          method: "POST",
          body: JSON.stringify(validFormData),
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": "127.0.0.1",
            "Idempotency-Key": `contact-route-key-${attempt}`,
          },
        });

      // 第一次请求应该成功 - use the global mock from setup.ts
      const mockValidations =
        await import("@/lib/form-schema/contact-form-schema");
      const mockExtendedSchema = {
        safeParse: vi.fn().mockReturnValue({
          success: true,
          data: validFormData,
        }),
        parse: vi.fn(),
        parseAsync: vi.fn(),
        _def: {},
        _type: undefined as any,
      };
      vi.mocked(mockValidations.contactFormSchema.extend).mockReturnValue(
        mockExtendedSchema as any,
      );

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      mockAirtableService.createContact.mockResolvedValue("record-123");
      mockResendService.sendContactFormEmail.mockResolvedValue("email-123");

      // 前 5 次请求允许通过
      for (let i = 0; i < 5; i += 1) {
        const response = await POST(createRequest(i));
        expect(response.status).not.toBe(429);
      }

      // 第 6 次请求必须被限制
      const response = await POST(createRequest(5));
      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.errorCode).toBe(API_ERROR_CODES.RATE_LIMIT_EXCEEDED);
    });

    it("应该处理Turnstile验证失败", async () => {
      // Mock validation failure due to Turnstile
      const { validateFormData } =
        await import("@/app/api/contact/contact-api-validation");
      vi.mocked(validateFormData).mockResolvedValue({
        success: false,
        error: "Security verification failed. Please try again.",
        details: ["Turnstile verification failed"],
        data: null,
      });

      // Mock failed Turnstile verification
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            "error-codes": ["invalid-input-response"],
          }),
      });

      const request = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        body: JSON.stringify(validFormData),
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": "contact-route-key",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errorCode).toBe(API_ERROR_CODES.CONTACT_VALIDATION_FAILED);
    });

    it("应该处理服务不可用的情况", async () => {
      // Mock services not ready
      mockAirtableService.isReady.mockReturnValue(false);
      mockResendService.isReady.mockReturnValue(false);

      // Mock successful validation
      const { validateFormData } =
        await import("@/app/api/contact/contact-api-validation");
      vi.mocked(validateFormData).mockResolvedValue({
        success: true,
        error: null,
        details: null,
        data: validFormData,
      });

      // Mock processFormSubmission to handle service unavailability gracefully
      const { processFormSubmission } =
        await import("@/lib/contact-form-processing");
      vi.mocked(processFormSubmission).mockResolvedValue({
        success: true,
        emailSent: false,
        recordCreated: false,
        referenceId: undefined,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const request = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        body: JSON.stringify(validFormData),
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": "contact-route-key",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // 应该仍然成功，但没有调用外部服务
      expect(mockAirtableService.createContact).not.toHaveBeenCalled();
      expect(mockResendService.sendContactFormEmail).not.toHaveBeenCalled();
    });

    it("应该处理JSON解析错误", async () => {
      const request = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        body: "invalid-json",
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": "contact-route-key",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      // 使用 safeParseJson 后，JSON 解析错误应返回 400 + INVALID_JSON_BODY
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errorCode).toBe(API_ERROR_CODES.INVALID_JSON_BODY);
    });

    it("应该在缺少 Idempotency-Key 时返回 400", async () => {
      const { validateFormData } =
        await import("@/app/api/contact/contact-api-validation");
      vi.mocked(validateFormData).mockResolvedValue({
        success: true,
        error: null,
        details: null,
        data: validFormData,
      });

      const request = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        body: JSON.stringify(validFormData),
        headers: {
          "content-type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errorCode).toBe(API_ERROR_CODES.IDEMPOTENCY_KEY_REQUIRED);
    });
  });

  describe("GET /api/contact", () => {
    it("应该返回统计信息（有效的管理员token）", async () => {
      const mockStats = {
        totalContacts: 100,
        newContacts: 10,
        completedContacts: 90,
        recentContacts: 5,
      };

      // Mock admin validation and stats
      const { validateAdminAccess, getContactFormStats } =
        await import("@/app/api/contact/contact-api-validation");
      vi.mocked(validateAdminAccess).mockReturnValue(true);
      vi.mocked(getContactFormStats).mockResolvedValue({
        success: true,
        data: mockStats,
      });

      mockAirtableService.getStatistics.mockResolvedValue(mockStats);

      const request = new NextRequest("http://localhost:3000/api/contact", {
        method: "GET",
        headers: {
          authorization: "Bearer test-admin-token",
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.data).toEqual(mockStats);
    });

    it("应该在 rate limit 超限时返回 429（并且不进入鉴权逻辑）", async () => {
      const { checkDistributedRateLimit } =
        await import("@/lib/security/distributed-rate-limit");
      vi.mocked(checkDistributedRateLimit).mockResolvedValueOnce({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 60,
        deniedReason: "limit",
      });

      const { validateAdminAccess } =
        await import("@/app/api/contact/contact-api-validation");
      vi.mocked(validateAdminAccess).mockReturnValue(true);

      const request = new NextRequest("http://localhost:3000/api/contact", {
        method: "GET",
        headers: {
          authorization: "Bearer test-admin-token",
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.errorCode).toBe(API_ERROR_CODES.RATE_LIMIT_EXCEEDED);
      expect(validateAdminAccess).not.toHaveBeenCalled();
      expect(checkDistributedRateLimit).toHaveBeenCalledWith(
        expect.stringMatching(/^ip:/),
        "contactAdminStats",
      );
    });

    it("应该拒绝无效的管理员token", async () => {
      const request = new NextRequest("http://localhost:3000/api/contact", {
        method: "GET",
        headers: {
          authorization: "Bearer invalid-token",
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.errorCode).toBe(API_ERROR_CODES.UNAUTHORIZED);
    });

    it("应该处理缺少authorization header的情况", async () => {
      const request = new NextRequest("http://localhost:3000/api/contact", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.errorCode).toBe(API_ERROR_CODES.UNAUTHORIZED);
    });

    it("应该处理Airtable服务不可用的情况", async () => {
      mockAirtableService.isReady.mockReturnValue(false);

      // Mock admin validation and stats
      const { validateAdminAccess, getContactFormStats } =
        await import("@/app/api/contact/contact-api-validation");
      vi.mocked(validateAdminAccess).mockReturnValue(true);
      vi.mocked(getContactFormStats).mockResolvedValue({
        success: true,
        data: {
          totalContacts: 0,
          newContacts: 0,
          completedContacts: 0,
          recentContacts: 0,
        },
      });

      const request = new NextRequest("http://localhost:3000/api/contact", {
        method: "GET",
        headers: {
          authorization: "Bearer test-admin-token",
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.data).toEqual({
        totalContacts: 0,
        newContacts: 0,
        completedContacts: 0,
        recentContacts: 0,
      });
    });
  });

  describe("错误处理", () => {
    it("应该记录错误日志", async () => {
      const testFormData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        company: "Test Company",
        message: "Test message",
        phone: "+1234567890",
        subject: "Test Subject",
        marketingConsent: false,
        turnstileToken: "valid-token",
        submittedAt: new Date().toISOString(),
      };

      // Mock validation error - use the global mock from setup.ts
      const mockValidations =
        await import("@/lib/form-schema/contact-form-schema");
      const mockExtendedSchema = {
        safeParse: vi.fn().mockImplementation(() => {
          throw new Error("Validation error");
        }),
        parse: vi.fn(),
        parseAsync: vi.fn(),
        _def: {},
        _type: undefined as any,
      };
      vi.mocked(mockValidations.contactFormSchema.extend).mockReturnValue(
        mockExtendedSchema as any,
      );

      const request = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        body: JSON.stringify(testFormData),
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": "contact-route-error-key",
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});

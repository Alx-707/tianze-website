import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatErrorResponse,
  generateRequestId,
  validateEnvironmentConfig,
  verifyTurnstile,
} from "../contact-api-utils";

// Mock dependencies
vi.mock("@/lib/env", () => ({
  env: {
    TURNSTILE_SECRET_KEY: "test-secret-key",
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  sanitizeIP: (ip: string | undefined | null) =>
    ip ? "[REDACTED_IP]" : "[NO_IP]",
  sanitizeEmail: (email: string | undefined | null) =>
    email ? "[REDACTED_EMAIL]" : "[NO_EMAIL]",
}));

vi.mock("@/lib/security/turnstile-config", () => ({
  getAllowedTurnstileHosts: vi.fn(() => ["localhost", "example.com"]),
  getExpectedTurnstileAction: vi.fn(() => "contact-form"),
  isAllowedTurnstileHostname: vi.fn((hostname: string) =>
    ["localhost", "example.com"].includes(hostname),
  ),
  isAllowedTurnstileAction: vi.fn((action: string) =>
    ["contact-form", undefined].includes(action),
  ),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("contact-api-utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("verifyTurnstile", () => {
    it("should return true for valid turnstile response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            hostname: "localhost",
            action: "contact-form",
          }),
      });

      const result = await verifyTurnstile("valid-token", "192.168.1.1");

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalled();
    });

    it("should return false when turnstile verification fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            "error-codes": ["invalid-input-response"],
          }),
      });

      const result = await verifyTurnstile("invalid-token", "192.168.1.1");

      expect(result).toBe(false);
    });

    it("should return false for invalid hostname", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            hostname: "malicious-site.com",
            action: "contact-form",
          }),
      });

      const result = await verifyTurnstile("valid-token", "192.168.1.1");

      expect(result).toBe(false);
    });

    it("should return false for invalid action", async () => {
      const { isAllowedTurnstileAction } =
        await import("@/lib/security/turnstile-config");
      vi.mocked(isAllowedTurnstileAction).mockReturnValueOnce(false);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            hostname: "localhost",
            action: "wrong-action",
          }),
      });

      const result = await verifyTurnstile("valid-token", "192.168.1.1");

      expect(result).toBe(false);
    });

    it("should throw on fetch error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        verifyTurnstile("valid-token", "192.168.1.1"),
      ).rejects.toThrow("Network error");
    });

    it("should throw on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(
        verifyTurnstile("valid-token", "192.168.1.1"),
      ).rejects.toThrow("Turnstile API returned 500: Internal Server Error");
    });

    it("should not include IP in payload when IP is empty string", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            hostname: "localhost",
          }),
      });

      await verifyTurnstile("token", "");

      const callArgs = mockFetch.mock.calls[0]!;
      expect(callArgs[1].body.toString()).not.toContain("remoteip");
    });

    it("should return false when secret key is not configured", async () => {
      // This test verifies the early-return path when TURNSTILE_SECRET_KEY is empty
      // verifyTurnstileDetailed should return {success: false, errorCodes: ['not-configured']}
      // without calling fetch at all

      // Temporarily override the env mock
      vi.doMock("@/lib/env", () => ({
        env: {
          TURNSTILE_SECRET_KEY: "",
        },
      }));

      // Also re-mock logger to avoid reset issues
      vi.doMock("@/lib/logger", () => ({
        logger: {
          warn: vi.fn(),
          error: vi.fn(),
          info: vi.fn(),
        },
      }));

      // Re-import module with new env mock
      vi.resetModules();
      const { verifyTurnstile: testVerify } =
        await import("../contact-api-utils");

      const result = await testVerify("token", "192.168.1.1");

      // Should return false due to missing secret key (early return, no fetch)
      expect(result).toBe(false);

      // Verify fetch was NOT called (early return path)
      expect(mockFetch).not.toHaveBeenCalled();

      // Cleanup
      vi.doUnmock("@/lib/env");
      vi.doUnmock("@/lib/logger");
      vi.resetModules();
    });

    it("should include IP in payload when not unknown", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            hostname: "localhost",
          }),
      });

      await verifyTurnstile("token", "192.168.1.100");

      const callArgs = mockFetch.mock.calls[0]!;
      expect(callArgs[1].body.toString()).toContain("remoteip=192.168.1.100");
    });

    it("should not include IP in payload when unknown", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            hostname: "localhost",
          }),
      });

      await verifyTurnstile("token", "unknown");

      const callArgs = mockFetch.mock.calls[0]!;
      expect(callArgs[1].body.toString()).not.toContain("remoteip");
    });
  });

  describe("validateEnvironmentConfig", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should return valid when all env vars are set", () => {
      process.env.TURNSTILE_SECRET_KEY = "test";
      process.env.RESEND_API_KEY = "test";
      process.env.AIRTABLE_API_KEY = "test";
      process.env.AIRTABLE_BASE_ID = "test";

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(true);
      expect(result.missingVars).toHaveLength(0);
    });

    it("should return invalid when TURNSTILE_SECRET_KEY is missing", () => {
      delete process.env.TURNSTILE_SECRET_KEY;
      process.env.RESEND_API_KEY = "test";
      process.env.AIRTABLE_API_KEY = "test";
      process.env.AIRTABLE_BASE_ID = "test";

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(false);
      expect(result.missingVars).toContain("TURNSTILE_SECRET_KEY");
    });

    it("should return invalid when RESEND_API_KEY is missing", () => {
      process.env.TURNSTILE_SECRET_KEY = "test";
      delete process.env.RESEND_API_KEY;
      process.env.AIRTABLE_API_KEY = "test";
      process.env.AIRTABLE_BASE_ID = "test";

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(false);
      expect(result.missingVars).toContain("RESEND_API_KEY");
    });

    it("should return all missing vars", () => {
      delete process.env.TURNSTILE_SECRET_KEY;
      delete process.env.RESEND_API_KEY;
      delete process.env.AIRTABLE_API_KEY;
      delete process.env.AIRTABLE_BASE_ID;

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(false);
      expect(result.missingVars).toHaveLength(4);
    });
  });

  describe("generateRequestId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();

      expect(id1).not.toBe(id2);
    });

    it("should start with req_ prefix", () => {
      const id = generateRequestId();

      expect(id.startsWith("req_")).toBe(true);
    });

    it("should generate string ID", () => {
      const id = generateRequestId();

      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(4); // More than just "req_"
    });
  });

  describe("formatErrorResponse", () => {
    it("should format basic error response", () => {
      const response = formatErrorResponse("Test error", 400);

      expect(response.error).toBe("ContactFormError");
      expect(response.message).toBe("Test error");
      expect(response.statusCode).toBe(400);
      expect(response.timestamp).toBeDefined();
    });

    it("should include details when provided", () => {
      const details = { field: "email", reason: "invalid" };
      const response = formatErrorResponse("Validation error", 422, details);

      expect(response.details).toEqual(details);
    });

    it("should not include details when not provided", () => {
      const response = formatErrorResponse("Error", 500);

      expect(response.details).toBeUndefined();
    });

    it("should include ISO timestamp", () => {
      const response = formatErrorResponse("Error", 500);

      // Should be valid ISO string
      expect(() => new Date(response.timestamp)).not.toThrow();
    });

    it("should handle different status codes", () => {
      expect(formatErrorResponse("Not found", 404).statusCode).toBe(404);
      expect(formatErrorResponse("Unauthorized", 401).statusCode).toBe(401);
      expect(formatErrorResponse("Server error", 500).statusCode).toBe(500);
    });
  });
});

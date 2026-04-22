import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  extractBearerToken,
  getApiKeyPriorityKey,
  getIPKey,
  getSessionPriorityKey,
  hmacKey,
  hmacKeyWithRotation,
  resetPepperWarning,
} from "../rate-limit-key-strategies";

// Use vi.hoisted for mock functions
const mockGetClientIP = vi.hoisted(() => vi.fn());
const mockLoggerWarn = vi.hoisted(() => vi.fn());

vi.mock("@/lib/security/client-ip", () => ({
  getClientIP: mockGetClientIP,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: mockLoggerWarn,
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

/**
 * Type-safe environment variable helper for tests.
 * Bypasses TypeScript's read-only process.env constraint.
 */
function setEnv(key: string, value: string | undefined): void {
  const env = process.env as Record<string, string | undefined>;
  if (value === undefined) {
    delete env[key];
  } else {
    env[key] = value;
  }
}

describe("rate-limit-key-strategies", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    resetPepperWarning();
    // Reset environment
    process.env = { ...originalEnv };
    setEnv("RATE_LIMIT_PEPPER", undefined);
    setEnv("RATE_LIMIT_PEPPER_PREVIOUS", undefined);
    setEnv("NODE_ENV", undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env = originalEnv;
  });

  function createMockRequest(
    options: {
      cookies?: Record<string, string>;
      headers?: Record<string, string>;
    } = {},
  ): NextRequest {
    const url = "http://localhost/api/test";
    const headers = new Headers(options.headers);

    const request = new NextRequest(url, { headers });

    // Mock cookies
    if (options.cookies) {
      Object.defineProperty(request.cookies, "get", {
        value: vi.fn().mockImplementation((cookieName: string) => {
          if (options.cookies && cookieName in options.cookies) {
            return { value: options.cookies[cookieName] };
          }
          return undefined;
        }),
      });
    }

    return request;
  }

  describe("hmacKey", () => {
    it("should generate consistent hash for same input", async () => {
      setEnv("RATE_LIMIT_PEPPER", "a".repeat(32));

      const key1 = await hmacKey("192.168.1.1");
      const key2 = await hmacKey("192.168.1.1");

      expect(key1).toBe(key2);
    });

    it("should generate different hash for different inputs", async () => {
      setEnv("RATE_LIMIT_PEPPER", "a".repeat(32));

      const key1 = await hmacKey("192.168.1.1");
      const key2 = await hmacKey("192.168.1.2");

      expect(key1).not.toBe(key2);
    });

    it("should return 16 character hex string (64-bit)", async () => {
      setEnv("RATE_LIMIT_PEPPER", "a".repeat(32));

      const key = await hmacKey("test-input");

      expect(key).toHaveLength(16);
      expect(key).toMatch(/^[0-9a-f]{16}$/);
    });

    it("should use development fallback pepper when not configured", async () => {
      setEnv("NODE_ENV", "development");

      const key = await hmacKey("test-input");

      expect(key).toHaveLength(16);
      expect(mockLoggerWarn).toHaveBeenCalledWith(
        "[Rate Limit] RATE_LIMIT_PEPPER not configured. Using default development pepper. This is insecure - set RATE_LIMIT_PEPPER for production.",
      );
    });

    it("should warn only once about missing pepper", async () => {
      setEnv("NODE_ENV", "development");

      await hmacKey("input1");
      await hmacKey("input2");
      await hmacKey("input3");

      expect(mockLoggerWarn).toHaveBeenCalledTimes(1);
    });

    it("should throw error in production without pepper", async () => {
      setEnv("NODE_ENV", "production");

      await expect(hmacKey("test-input")).rejects.toThrow(
        "[SECURITY] RATE_LIMIT_PEPPER is required in production. Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
      );
    });

    it("should accept a pepper at the minimum required length without warning", async () => {
      setEnv("NODE_ENV", "development");
      setEnv("RATE_LIMIT_PEPPER", "a".repeat(32));

      const key = await hmacKey("test-input");

      expect(key).toHaveLength(16);
      expect(mockLoggerWarn).not.toHaveBeenCalled();
    });

    it("should throw error in production with short pepper", async () => {
      setEnv("NODE_ENV", "production");
      setEnv("RATE_LIMIT_PEPPER", "tooshort");

      await expect(hmacKey("test-input")).rejects.toThrow(
        "[SECURITY] RATE_LIMIT_PEPPER is too short (8 chars). Minimum 32 chars required. Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
      );
    });

    it("should warn about weak pepper in development", async () => {
      setEnv("NODE_ENV", "development");
      setEnv("RATE_LIMIT_PEPPER", "short");

      await hmacKey("test-input");

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        "[Rate Limit] RATE_LIMIT_PEPPER is weak (5 chars). Recommend at least 32 chars for production.",
      );
    });

    it("should warn only once about weak pepper", async () => {
      setEnv("NODE_ENV", "development");
      setEnv("RATE_LIMIT_PEPPER", "short");

      await hmacKey("input1");
      await hmacKey("input2");

      expect(mockLoggerWarn).toHaveBeenCalledTimes(1);
    });
  });

  describe("hmacKeyWithRotation", () => {
    it("should return single key when no previous pepper", async () => {
      setEnv("RATE_LIMIT_PEPPER", "a".repeat(32));

      const keys = await hmacKeyWithRotation("test-input");

      expect(keys).toHaveLength(1);
    });

    it("should return two keys during pepper rotation", async () => {
      setEnv("RATE_LIMIT_PEPPER", "a".repeat(32));
      setEnv("RATE_LIMIT_PEPPER_PREVIOUS", "b".repeat(32));

      const keys = await hmacKeyWithRotation("test-input");

      expect(keys).toHaveLength(2);
      expect(keys[0]).not.toBe(keys[1]);
    });

    it("should have current key as first element", async () => {
      setEnv("RATE_LIMIT_PEPPER", "a".repeat(32));
      setEnv("RATE_LIMIT_PEPPER_PREVIOUS", "b".repeat(32));

      const currentKey = await hmacKey("test-input");
      const keys = await hmacKeyWithRotation("test-input");

      expect(keys[0]).toBe(currentKey);
    });

    it("should truncate the previous rotation key to the standard HMAC length", async () => {
      setEnv("RATE_LIMIT_PEPPER", "a".repeat(32));
      setEnv("RATE_LIMIT_PEPPER_PREVIOUS", "b".repeat(32));

      const keys = await hmacKeyWithRotation("test-input");

      expect(keys[1]).toHaveLength(16);
      expect(keys[1]).toMatch(/^[0-9a-f]{16}$/);
    });
  });

  describe("getIPKey", () => {
    it("should return IP-based key with prefix", async () => {
      setEnv("RATE_LIMIT_PEPPER", "a".repeat(32));
      mockGetClientIP.mockReturnValue("192.168.1.100");

      const request = createMockRequest();
      const key = await getIPKey(request);

      expect(key).toMatch(/^ip:[0-9a-f]{16}$/);
    });

    it("should call getClientIP with request", async () => {
      setEnv("RATE_LIMIT_PEPPER", "a".repeat(32));
      mockGetClientIP.mockReturnValue("10.0.0.1");

      const request = createMockRequest();
      await getIPKey(request);

      expect(mockGetClientIP).toHaveBeenCalledWith(request);
    });

    it("should produce different keys for different IPs", async () => {
      setEnv("RATE_LIMIT_PEPPER", "a".repeat(32));

      mockGetClientIP.mockReturnValue("192.168.1.1");
      const key1 = await getIPKey(createMockRequest());

      mockGetClientIP.mockReturnValue("192.168.1.2");
      const key2 = await getIPKey(createMockRequest());

      expect(key1).not.toBe(key2);
    });
  });

  describe("getSessionPriorityKey", () => {
    beforeEach(() => {
      setEnv("RATE_LIMIT_PEPPER", "a".repeat(32));
      mockGetClientIP.mockReturnValue("192.168.1.100");
    });

    it("should return session-based key when valid session exists", async () => {
      const request = createMockRequest({
        cookies: { "session-id": "valid-session-id-12345678" },
      });

      const key = await getSessionPriorityKey(request);

      expect(key).toMatch(/^session:[0-9a-f]{16}$/);
    });

    it("should fallback to IP key when no session cookie", async () => {
      const request = createMockRequest();

      const ipKey = await getIPKey(request);
      const sessionKey = await getSessionPriorityKey(request);

      expect(sessionKey).toBe(ipKey);
    });

    it("should fallback to IP key for an empty session ID", async () => {
      const request = createMockRequest({
        cookies: { "session-id": "" },
      });

      const ipKey = await getIPKey(request);
      const sessionKey = await getSessionPriorityKey(request);

      expect(sessionKey).toBe(ipKey);
    });

    it("should fallback to IP key for too short session ID", async () => {
      const request = createMockRequest({
        cookies: { "session-id": "short" },
      });

      const ipKey = await getIPKey(request);
      const sessionKey = await getSessionPriorityKey(request);

      expect(sessionKey).toBe(ipKey);
    });

    it("should accept session IDs with the minimum valid length", async () => {
      const request = createMockRequest({
        cookies: { "session-id": "12345678" },
      });

      const sessionKey = await getSessionPriorityKey(request);

      expect(sessionKey).toMatch(/^session:[0-9a-f]{16}$/);
    });

    it("should accept session IDs at the maximum valid length", async () => {
      const request = createMockRequest({
        cookies: { "session-id": "a".repeat(256) },
      });

      const sessionKey = await getSessionPriorityKey(request);

      expect(sessionKey).toMatch(/^session:[0-9a-f]{16}$/);
    });

    it("should reject session IDs that exceed the maximum valid length", async () => {
      const request = createMockRequest({
        cookies: { "session-id": "a".repeat(257) },
      });

      const ipKey = await getIPKey(request);
      const sessionKey = await getSessionPriorityKey(request);

      expect(sessionKey).toBe(ipKey);
    });

    it("should reject invalid session values", async () => {
      const invalidValues = ["undefined", "null", "[object Object]"];

      for (const invalidValue of invalidValues) {
        const request = createMockRequest({
          cookies: { "session-id": invalidValue },
        });

        const ipKey = await getIPKey(request);
        const sessionKey = await getSessionPriorityKey(request);

        expect(sessionKey).toBe(ipKey);
      }
    });
  });

  describe("getApiKeyPriorityKey", () => {
    beforeEach(() => {
      setEnv("RATE_LIMIT_PEPPER", "a".repeat(32));
      mockGetClientIP.mockReturnValue("192.168.1.100");
    });

    it("should extract a normal Bearer token", () => {
      expect(extractBearerToken("Bearer sk-test-key")).toBe("sk-test-key");
    });

    it("should reject non-Bearer schemes even when they include whitespace and a token", () => {
      expect(extractBearerToken("Basic  sk-test-key")).toBeNull();
    });

    it("should reject Bearer values that do not use whitespace as the separator", () => {
      expect(extractBearerToken("Bearer:sk-test-key")).toBeNull();
    });

    it("should allow leading whitespace before the Bearer prefix", () => {
      expect(extractBearerToken("   Bearer sk-test-key   ")).toBe(
        "sk-test-key",
      );
    });

    it("should reject Bearer values whose token trims to empty text", () => {
      expect(extractBearerToken("Bearer \t\n")).toBeNull();
    });

    it("should return API key-based key when Bearer token exists", async () => {
      const request = createMockRequest({
        headers: { Authorization: "Bearer sk-test-api-key-12345" },
      });

      const key = await getApiKeyPriorityKey(request);

      expect(key).toMatch(/^apikey:[0-9a-f]{16}$/);
    });

    it("should fallback to IP key when no Authorization header", async () => {
      const request = createMockRequest();

      const ipKey = await getIPKey(request);
      const apiKeyKey = await getApiKeyPriorityKey(request);

      expect(apiKeyKey).toBe(ipKey);
    });

    it("should fallback to IP key for non-Bearer authorization", async () => {
      const request = createMockRequest({
        headers: { Authorization: "Basic dXNlcm5hbWU6cGFzc3dvcmQ=" },
      });

      const ipKey = await getIPKey(request);
      const apiKeyKey = await getApiKeyPriorityKey(request);

      expect(apiKeyKey).toBe(ipKey);
    });

    it("should handle case-insensitive Bearer prefix", async () => {
      const request = createMockRequest({
        headers: { Authorization: "bearer sk-test-key" },
      });

      const key = await getApiKeyPriorityKey(request);

      expect(key).toMatch(/^apikey:[0-9a-f]{16}$/);
    });

    it("should fallback to IP key when Bearer token is only whitespace", async () => {
      const request = createMockRequest({
        headers: { Authorization: "Bearer    " },
      });

      const ipKey = await getIPKey(request);
      const apiKeyKey = await getApiKeyPriorityKey(request);

      expect(apiKeyKey).toBe(ipKey);
    });

    it("should fallback to IP key when the Bearer token is only tab/newline whitespace", async () => {
      const request = createMockRequest({
        headers: { Authorization: "Bearer \t\n" },
      });

      const ipKey = await getIPKey(request);
      const apiKeyKey = await getApiKeyPriorityKey(request);

      expect(apiKeyKey).toBe(ipKey);
    });

    it("should fallback to IP key when authorization header is only whitespace", async () => {
      const request = createMockRequest({
        headers: { Authorization: "    " },
      });

      const ipKey = await getIPKey(request);
      const apiKeyKey = await getApiKeyPriorityKey(request);

      expect(apiKeyKey).toBe(ipKey);
    });

    it("should trim surrounding whitespace before parsing Bearer authorization", async () => {
      const request = createMockRequest({
        headers: { Authorization: "   Bearer sk-trimmed-key   " },
      });

      const key = await getApiKeyPriorityKey(request);

      expect(key).toMatch(/^apikey:[0-9a-f]{16}$/);
    });

    it("should normalize repeated whitespace between Bearer scheme and token", async () => {
      const compactRequest = createMockRequest({
        headers: { Authorization: "Bearer spaced-token" },
      });
      const spacedRequest = createMockRequest({
        headers: { Authorization: "Bearer    spaced-token" },
      });

      const compactKey = await getApiKeyPriorityKey(compactRequest);
      const spacedKey = await getApiKeyPriorityKey(spacedRequest);

      expect(spacedKey).toBe(compactKey);
    });

    it("should produce different keys for different API keys", async () => {
      setEnv("RATE_LIMIT_PEPPER", "a".repeat(32));

      const request1 = createMockRequest({
        headers: { Authorization: "Bearer api-key-1" },
      });
      const request2 = createMockRequest({
        headers: { Authorization: "Bearer api-key-2" },
      });

      const key1 = await getApiKeyPriorityKey(request1);
      const key2 = await getApiKeyPriorityKey(request2);

      expect(key1).not.toBe(key2);
    });
  });

  describe("resetPepperWarning", () => {
    it("should allow warning to be logged again after reset", async () => {
      setEnv("NODE_ENV", "development");

      await hmacKey("input1");
      expect(mockLoggerWarn).toHaveBeenCalledTimes(1);

      resetPepperWarning();
      await hmacKey("input2");
      expect(mockLoggerWarn).toHaveBeenCalledTimes(2);
    });
  });
});

import { vi } from "vitest";

// Mock environment variables - use Object.defineProperty for read-only properties
try {
  if (!process.env.NODE_ENV) {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "test",
      writable: false,
      enumerable: true,
      configurable: true,
    });
  }
} catch {
  // Environment variable already set, ignore
}

// Mock environment variables - 使用vi.stubEnv而不是直接修改process.env
vi.stubEnv("NODE_ENV", "test");
vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://example.com");
vi.stubEnv("NEXT_PUBLIC_VERCEL_URL", "example.vercel.app");

// Mock server-side environment variables for API testing
vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret-key");
vi.stubEnv("RESEND_API_KEY", "test-resend-key");
vi.stubEnv("AIRTABLE_API_KEY", "test-airtable-key");
vi.stubEnv("AIRTABLE_BASE_ID", "test-base-id");
vi.stubEnv("AIRTABLE_TABLE_NAME", "test-table");
vi.stubEnv("EMAIL_FROM", "test@example.com");
vi.stubEnv("EMAIL_REPLY_TO", "reply@example.com");
vi.stubEnv("CSP_REPORT_URI", "https://example.com/csp-report");
vi.stubEnv("ADMIN_TOKEN", "test-admin-token");

// Mock @t3-oss/env-nextjs to prevent server-side environment variable access errors
vi.mock("@t3-oss/env-nextjs", () => ({
  createEnv: vi.fn(() => ({
    NODE_ENV: "test",
    TURNSTILE_SECRET_KEY: "test-secret-key",
    RESEND_API_KEY: "test-resend-key",
    AIRTABLE_API_KEY: "test-airtable-key",
    AIRTABLE_BASE_ID: "test-base-id",
    AIRTABLE_TABLE_NAME: "test-table",
    EMAIL_FROM: "test@example.com",
    EMAIL_REPLY_TO: "reply@example.com",
    CSP_REPORT_URI: "https://example.com/csp-report",
    ADMIN_TOKEN: "test-admin-token",
    NEXT_PUBLIC_BASE_URL: "https://example.com",
    NEXT_PUBLIC_VERCEL_URL: "example.vercel.app",
    WHATSAPP_ACCESS_TOKEN: "test-whatsapp-token",
    WHATSAPP_PHONE_NUMBER_ID: "test-phone-id",
    WHATSAPP_BUSINESS_ACCOUNT_ID: "test-business-id",
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: "test-webhook-token",
  })),
}));

// Mock the env module directly
vi.mock("@/lib/env", () => {
  const mockEnv = {
    NODE_ENV: "test",
    TURNSTILE_SECRET_KEY: "test-secret-key",
    RESEND_API_KEY: "test-resend-key",
    AIRTABLE_API_KEY: "test-airtable-key",
    AIRTABLE_BASE_ID: "test-base-id",
    AIRTABLE_TABLE_NAME: "test-table",
    EMAIL_FROM: "test@example.com",
    EMAIL_REPLY_TO: "reply@example.com",
    CSP_REPORT_URI: "https://example.com/csp-report",
    ADMIN_TOKEN: "test-admin-token",
    NEXT_PUBLIC_BASE_URL: "https://example.com",
    NEXT_PUBLIC_VERCEL_URL: "example.vercel.app",
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: "test-site-key-12345",
    NEXT_PUBLIC_TEST_MODE: false,
    WHATSAPP_ACCESS_TOKEN: "test-whatsapp-token",
    WHATSAPP_PHONE_NUMBER_ID: "test-phone-id",
    WHATSAPP_BUSINESS_ACCOUNT_ID: "test-business-id",
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: "test-webhook-token",
  } as Record<string, string | boolean | number | undefined>;

  return {
    env: mockEnv,
    getEnvVar: (key: string) => mockEnv[key],
    requireEnvVar: (key: string) => {
      const value = mockEnv[key];
      if (!value || typeof value === "boolean" || typeof value === "number") {
        throw new Error(
          `Required environment variable ${key} is not set or is not a string`,
        );
      }
      return value;
    },
    envUtils: {
      isDevelopment: () => false,
      isProduction: () => false,
      isTest: () => true,
      getWhatsAppToken: () => "test-whatsapp-token",
      getWhatsAppPhoneId: () => "test-phone-id",
      getTurnstileSecret: () => "test-secret-key",
      getTurnstileSiteKey: () => "test-site-key",
      getResendApiKey: () => "test-resend-key",
      getAirtableToken: () => "test-airtable-key",
      getAirtableBaseId: () => "test-base-id",
    },
  };
});

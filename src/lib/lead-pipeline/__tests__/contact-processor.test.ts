/**
 * Contact Processor Tests — Confirmation Email Retry Behavior
 *
 * Tests confirmation email retry mechanism with exponential backoff.
 * Uses next/server after() for serverless-safe fire-and-forget execution.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type ContactLeadInput,
  CONTACT_SUBJECTS,
  LEAD_TYPES,
} from "@/lib/lead-pipeline/lead-schema";
import type { ServiceResult } from "@/lib/lead-pipeline/service-result";

// Ensure real Zod is used
vi.unmock("zod");

// Mock next/server after() to immediately invoke callback in tests
vi.mock("next/server", () => ({
  after: vi.fn((callback: () => void | Promise<void>) => {
    const result = callback();
    if (result instanceof Promise) {
      result.catch(() => {});
    }
  }),
}));

// Hoist mock functions for dynamic import compatibility
const mockSendContactFormEmail = vi.hoisted(() => vi.fn());
const mockSendConfirmationEmail = vi.hoisted(() => vi.fn());
const mockCreateLead = vi.hoisted(() => vi.fn());
const mockLoggerWarn = vi.hoisted(() => vi.fn());
const mockLoggerError = vi.hoisted(() => vi.fn());
const mockLoggerInfo = vi.hoisted(() => vi.fn());

// Mock external services with hoisted functions
vi.mock("@/lib/resend", () => ({
  resendService: {
    sendContactFormEmail: mockSendContactFormEmail,
    sendConfirmationEmail: mockSendConfirmationEmail,
  },
}));

vi.mock("@/lib/airtable", () => ({
  airtableService: {
    createLead: mockCreateLead,
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: mockLoggerInfo,
    warn: mockLoggerWarn,
    error: mockLoggerError,
  },
  sanitizeEmail: (email: string | undefined | null) =>
    email ? "[REDACTED_EMAIL]" : "[NO_EMAIL]",
  sanitizeIP: (ip: string | undefined | null) =>
    ip ? "[REDACTED_IP]" : "[NO_IP]",
  sanitizeCompany: (company: string | undefined | null) =>
    company ? "[REDACTED]" : "[NO_COMPANY]",
}));

// Mock contact form config to enable confirmation email feature
vi.mock("@/config/contact-form-config", () => ({
  CONTACT_FORM_CONFIG: {
    features: {
      sendConfirmationEmail: true,
    },
  },
}));

// Mock settle-service to pass through for simplicity
vi.mock("@/lib/lead-pipeline/settle-service", () => ({
  settleService: vi.fn(
    async (
      promise: Promise<unknown>,
      options: {
        operationName: string;
        mapId?: (result: unknown) => string | undefined;
      },
    ): Promise<ServiceResult> => {
      try {
        const result = await promise;
        const id = options.mapId ? options.mapId(result) : undefined;
        return { success: true, id, latencyMs: 100 };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          latencyMs: 100,
        };
      }
    },
  ),
}));

/**
 * Helper: flush all pending microtasks and timers to allow
 * fire-and-forget promises and retry delays to complete.
 */
async function flushPromises(): Promise<void> {
  await vi.runAllTimersAsync();
}

const VALID_CONTACT_LEAD: ContactLeadInput = {
  type: LEAD_TYPES.CONTACT,
  fullName: "John Doe",
  email: "john@example.com",
  subject: CONTACT_SUBJECTS.PRODUCT_INQUIRY,
  message: "This is a test message with enough characters for validation.",
  turnstileToken: "valid-token",
  company: "Test Company",
  marketingConsent: true,
};

const REFERENCE_ID = "CON-test-ref-001";

describe("processContactLead — confirmation email retry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Default: main pipeline services succeed
    mockSendContactFormEmail.mockResolvedValue("email-id-123");
    mockCreateLead.mockResolvedValue({ id: "record-123" });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Scenario 1: Confirmation email succeeds on first attempt", () => {
    it("calls sendConfirmationEmail exactly 1 time when it succeeds immediately", async () => {
      mockSendConfirmationEmail.mockResolvedValue("confirmation-id-001");

      const { processContactLead } =
        await import("@/lib/lead-pipeline/processors/contact");
      await processContactLead(VALID_CONTACT_LEAD, REFERENCE_ID);
      await flushPromises();

      expect(mockSendConfirmationEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe("Scenario 2: Confirmation email retries after first failure", () => {
    it("retries sendConfirmationEmail after first failure and succeeds on second attempt", async () => {
      mockSendConfirmationEmail
        .mockRejectedValueOnce(new Error("Transient network error"))
        .mockResolvedValueOnce("confirmation-id-retry");

      const { processContactLead } =
        await import("@/lib/lead-pipeline/processors/contact");
      await processContactLead(VALID_CONTACT_LEAD, REFERENCE_ID);
      await flushPromises();

      // Should have been called twice: initial attempt + 1 retry
      expect(mockSendConfirmationEmail).toHaveBeenCalledTimes(2);
    });

    it("does not log permanent failure when retry succeeds", async () => {
      mockSendConfirmationEmail
        .mockRejectedValueOnce(new Error("Transient network error"))
        .mockResolvedValueOnce("confirmation-id-retry");

      const { processContactLead } =
        await import("@/lib/lead-pipeline/processors/contact");
      await processContactLead(VALID_CONTACT_LEAD, REFERENCE_ID);
      await flushPromises();

      // Should NOT log error-level when retry eventually succeeds
      expect(mockLoggerError).not.toHaveBeenCalledWith(
        expect.stringContaining("Confirmation email"),
        expect.anything(),
      );
    });
  });

  describe("Scenario 3: Confirmation email fails after all retries exhausted", () => {
    it("logs error-level message with retry count after all retries fail", async () => {
      const persistentError = new Error("Resend API permanently down");
      mockSendConfirmationEmail.mockRejectedValue(persistentError);

      const { processContactLead } =
        await import("@/lib/lead-pipeline/processors/contact");
      await processContactLead(VALID_CONTACT_LEAD, REFERENCE_ID);
      await flushPromises();

      // After all retries exhausted, should log at error level (not just warn)
      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.stringContaining("Confirmation email"),
        expect.objectContaining({
          email: "[REDACTED_EMAIL]",
        }),
      );
    });

    it("attempts sendConfirmationEmail at least 3 times before giving up", async () => {
      mockSendConfirmationEmail.mockRejectedValue(
        new Error("Persistent failure"),
      );

      const { processContactLead } =
        await import("@/lib/lead-pipeline/processors/contact");
      await processContactLead(VALID_CONTACT_LEAD, REFERENCE_ID);
      await flushPromises();

      // Should attempt at least 3 times (1 initial + 2 retries)
      expect(
        mockSendConfirmationEmail.mock.calls.length,
      ).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Scenario 4: Email failure does not affect main pipeline", () => {
    it("returns successful emailResult and crmResult even when confirmation email fails completely", async () => {
      mockSendConfirmationEmail.mockRejectedValue(
        new Error("All retries exhausted"),
      );

      const { processContactLead } =
        await import("@/lib/lead-pipeline/processors/contact");
      const result = await processContactLead(VALID_CONTACT_LEAD, REFERENCE_ID);
      await flushPromises();

      // Main pipeline email (to admin) should succeed
      expect(result.emailResult.success).toBe(true);
      // CRM record should succeed
      expect(result.crmResult.success).toBe(true);
    });

    it("returns normally without throwing when confirmation email fails", async () => {
      mockSendConfirmationEmail.mockRejectedValue(
        new Error("Complete failure"),
      );

      const { processContactLead } =
        await import("@/lib/lead-pipeline/processors/contact");

      // processContactLead should not throw, even if confirmation fails
      await expect(
        processContactLead(VALID_CONTACT_LEAD, REFERENCE_ID),
      ).resolves.toEqual(
        expect.objectContaining({
          emailResult: expect.objectContaining({ success: true }),
          crmResult: expect.objectContaining({ success: true }),
        }),
      );
    });
  });
});

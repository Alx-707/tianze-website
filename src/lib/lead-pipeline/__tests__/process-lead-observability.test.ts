import { beforeEach, describe, expect, it, vi } from "vitest";

import { CONTACT_SUBJECTS, LEAD_TYPES } from "../lead-schema";
import { processLead } from "../process-lead";

vi.unmock("zod");

const mockProcessContactLead = vi.hoisted(() => vi.fn());
const mockProcessProductLead = vi.hoisted(() => vi.fn());
const mockProcessNewsletterLead = vi.hoisted(() => vi.fn());
const mockLoggerInfo = vi.hoisted(() => vi.fn());
const mockLoggerWarn = vi.hoisted(() => vi.fn());
const mockLoggerError = vi.hoisted(() => vi.fn());
const mockEmitServiceMetrics = vi.hoisted(() => vi.fn());
const mockLogPipelineSummary = vi.hoisted(() => vi.fn());
const mockTimerStop = vi.hoisted(() => vi.fn(() => 321));

vi.mock("@/lib/lead-pipeline/processors/contact", () => ({
  processContactLead: mockProcessContactLead,
}));

vi.mock("@/lib/lead-pipeline/processors/product", () => ({
  processProductLead: mockProcessProductLead,
}));

vi.mock("@/lib/lead-pipeline/processors/newsletter", () => ({
  processNewsletterLead: mockProcessNewsletterLead,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: mockLoggerInfo,
    warn: mockLoggerWarn,
    error: mockLoggerError,
  },
  sanitizeEmail: (email: string | undefined | null) =>
    email ? "[REDACTED_EMAIL]" : "[NO_EMAIL]",
}));

vi.mock("@/lib/lead-pipeline/pipeline-observability", () => ({
  emitServiceMetrics: mockEmitServiceMetrics,
  logPipelineSummary: mockLogPipelineSummary,
}));

vi.mock("@/lib/lead-pipeline/metrics", () => ({
  createLatencyTimer: () => ({
    stop: mockTimerStop,
  }),
}));

const VALID_CONTACT_LEAD = {
  type: LEAD_TYPES.CONTACT,
  fullName: "John Doe",
  email: "john@example.com",
  subject: CONTACT_SUBJECTS.PRODUCT_INQUIRY,
  message: "This is a test message with enough characters.",
  turnstileToken: "valid-token",
  company: "Test Company",
  marketingConsent: true,
};

const VALID_NEWSLETTER_LEAD = {
  type: LEAD_TYPES.NEWSLETTER,
  email: "subscriber@example.com",
};

describe("processLead observability contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTimerStop.mockReturnValue(321);
  });

  it("logs validation failures with requestId context", async () => {
    const result = await processLead(null, { requestId: "req-validation" });

    expect(result).toEqual({
      success: false,
      partialSuccess: false,
      emailSent: false,
      recordCreated: false,
      error: "VALIDATION_ERROR",
    });
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      "Lead validation failed",
      expect.objectContaining({
        errors: expect.any(Array),
        requestId: "req-validation",
      }),
    );
  });

  it("logs success flow and forwards requestId to observability helpers", async () => {
    const emailResult = {
      success: true as const,
      id: "email-123",
      latencyMs: 10,
    };
    const crmResult = {
      success: true as const,
      id: "record-123",
      latencyMs: 20,
    };
    mockProcessContactLead.mockResolvedValue({ emailResult, crmResult });

    const result = await processLead(VALID_CONTACT_LEAD, {
      requestId: "req-success",
    });

    expect(result.success).toBe(true);
    expect(mockLoggerInfo).toHaveBeenNthCalledWith(
      1,
      "Processing lead",
      expect.objectContaining({
        type: LEAD_TYPES.CONTACT,
        email: "[REDACTED_EMAIL]",
        referenceId: expect.stringMatching(/^CON-/),
        requestId: "req-success",
      }),
    );
    expect(mockEmitServiceMetrics).toHaveBeenCalledWith(
      emailResult,
      crmResult,
      true,
      "req-success",
    );
    expect(mockLogPipelineSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        leadType: LEAD_TYPES.CONTACT,
        emailResult,
        crmResult,
        totalLatencyMs: 321,
        overallSuccess: true,
        requestId: "req-success",
      }),
    );
    expect(mockLoggerError).not.toHaveBeenCalled();
    expect(mockLoggerInfo).toHaveBeenNthCalledWith(
      2,
      "Lead processed successfully",
      expect.objectContaining({
        emailSent: true,
        recordCreated: true,
        requestId: "req-success",
      }),
    );
  });

  it("logs email-only partial failures with error details and requestId", async () => {
    const emailResult = {
      success: false as const,
      error: new Error("Email failed"),
      latencyMs: 10,
    };
    const crmResult = {
      success: true as const,
      id: "record-123",
      latencyMs: 20,
    };
    mockProcessContactLead.mockResolvedValue({ emailResult, crmResult });

    const result = await processLead(VALID_CONTACT_LEAD, {
      requestId: "req-partial",
    });

    expect(result.partialSuccess).toBe(true);
    expect(mockLoggerError).toHaveBeenCalledWith(
      "Lead email send failed",
      expect.objectContaining({
        type: LEAD_TYPES.CONTACT,
        error: "Email failed",
        requestId: "req-partial",
      }),
    );
    expect(
      mockLoggerError.mock.calls.some(
        ([message]) => message === "Lead CRM record failed",
      ),
    ).toBe(false);
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      "Lead processed partially",
      expect.objectContaining({
        emailSent: false,
        recordCreated: true,
        requestId: "req-partial",
      }),
    );
  });

  it("logs complete failures with both service errors", async () => {
    const emailResult = {
      success: false as const,
      error: new Error("Email failed"),
      latencyMs: 10,
    };
    const crmResult = {
      success: false as const,
      error: new Error("CRM failed"),
      latencyMs: 20,
    };
    mockProcessContactLead.mockResolvedValue({ emailResult, crmResult });

    const result = await processLead(VALID_CONTACT_LEAD, {
      requestId: "req-failure",
    });

    expect(result.success).toBe(false);
    expect(mockLoggerError).toHaveBeenCalledWith(
      "Lead email send failed",
      expect.objectContaining({
        requestId: "req-failure",
        error: "Email failed",
      }),
    );
    expect(mockLoggerError).toHaveBeenCalledWith(
      "Lead CRM record failed",
      expect.objectContaining({
        requestId: "req-failure",
        error: "CRM failed",
      }),
    );
    expect(mockLoggerError).toHaveBeenCalledWith(
      "Lead processing failed completely",
      expect.objectContaining({
        emailError: "Email failed",
        crmError: "CRM failed",
        requestId: "req-failure",
      }),
    );
  });

  it("does not log an email failure for newsletter leads that have no email operation", async () => {
    const emailResult = {
      success: false as const,
      error: new Error("Not applicable"),
      latencyMs: 0,
    };
    const crmResult = {
      success: false as const,
      error: new Error("CRM failed"),
      latencyMs: 15,
    };
    mockProcessNewsletterLead.mockResolvedValue({ emailResult, crmResult });

    const result = await processLead(VALID_NEWSLETTER_LEAD, {
      requestId: "req-newsletter",
    });

    expect(result.success).toBe(false);
    expect(
      mockLoggerError.mock.calls.some(
        ([message]) => message === "Lead email send failed",
      ),
    ).toBe(false);
    expect(mockLoggerError).toHaveBeenCalledWith(
      "Lead CRM record failed",
      expect.objectContaining({
        type: LEAD_TYPES.NEWSLETTER,
        error: "CRM failed",
        requestId: "req-newsletter",
      }),
    );
  });

  it("logs unexpected non-Error rejections as Unknown error with latency and requestId", async () => {
    mockProcessContactLead.mockRejectedValue("boom");

    const result = await processLead(VALID_CONTACT_LEAD, {
      requestId: "req-unexpected",
    });

    expect(result.error).toBe("PROCESSING_FAILED");
    expect(mockLoggerError).toHaveBeenCalledWith(
      "Lead processing unexpected error",
      expect.objectContaining({
        type: LEAD_TYPES.CONTACT,
        error: "Unknown error",
        totalLatencyMs: 321,
        requestId: "req-unexpected",
      }),
    );
  });
});

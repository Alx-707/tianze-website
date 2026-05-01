import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetSystemObservability } from "@/lib/observability/system-observability";

import { CONTACT_SUBJECTS, LEAD_TYPES } from "../lead-schema";
import { processLead } from "../process-lead";

vi.unmock("zod");

const mockSendContactFormEmail = vi.hoisted(() => vi.fn());
const mockCreateLead = vi.hoisted(() => vi.fn());
const mockLoggerInfo = vi.hoisted(() => vi.fn());
const mockLoggerWarn = vi.hoisted(() => vi.fn());
const mockLoggerError = vi.hoisted(() => vi.fn());

vi.mock("@/lib/resend", () => ({
  resendService: {
    sendContactFormEmail: mockSendContactFormEmail,
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
  sanitizeCompany: (company: string | undefined | null) =>
    company ? "[REDACTED]" : "[NO_COMPANY]",
  sanitizeIP: (ip: string | undefined | null) =>
    ip ? "[REDACTED_IP]" : "[NO_IP]",
}));

const VALID_CONTACT_LEAD = {
  type: LEAD_TYPES.CONTACT,
  fullName: "Test Buyer",
  email: "buyer@example.com",
  subject: CONTACT_SUBJECTS.PRODUCT_INQUIRY,
  message: "Need PVC conduit fittings for a distributor order.",
  turnstileToken: "valid-token",
  company: "Example Distributor",
  marketingConsent: true,
};

describe("processLead characterization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetSystemObservability();
  });

  it("returns partial success without error when contact email fails and CRM succeeds", async () => {
    mockSendContactFormEmail.mockRejectedValue(new Error("email unavailable"));
    mockCreateLead.mockResolvedValue({ id: "rec-contact-001" });

    const result = await processLead(VALID_CONTACT_LEAD, {
      requestId: "req-email-failed-crm-succeeded",
    });

    expect(result).toEqual({
      success: false,
      partialSuccess: true,
      emailSent: false,
      recordCreated: true,
      referenceId: expect.stringMatching(/^CON-/),
      error: undefined,
    });
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      "Lead processed partially",
      expect.objectContaining({
        type: LEAD_TYPES.CONTACT,
        referenceId: result.referenceId,
        emailSent: false,
        recordCreated: true,
        requestId: "req-email-failed-crm-succeeded",
      }),
    );
  });

  it("returns partial success without error when contact email succeeds and CRM fails", async () => {
    mockSendContactFormEmail.mockResolvedValue("email-contact-001");
    mockCreateLead.mockRejectedValue(new Error("crm unavailable"));

    const result = await processLead(VALID_CONTACT_LEAD, {
      requestId: "req-email-succeeded-crm-failed",
    });

    expect(result).toEqual({
      success: false,
      partialSuccess: true,
      emailSent: true,
      recordCreated: false,
      referenceId: expect.stringMatching(/^CON-/),
      error: undefined,
    });
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      "Lead processed partially",
      expect.objectContaining({
        type: LEAD_TYPES.CONTACT,
        referenceId: result.referenceId,
        emailSent: true,
        recordCreated: false,
        requestId: "req-email-succeeded-crm-failed",
      }),
    );
  });
});

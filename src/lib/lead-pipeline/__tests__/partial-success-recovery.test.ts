import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONTACT_SUBJECTS, LEAD_TYPES, type LeadInput } from "../lead-schema";

const mockLoggerError = vi.hoisted(() => vi.fn());

vi.mock("@/lib/logger", () => ({
  logger: {
    error: mockLoggerError,
  },
  sanitizeEmail: (email: string | undefined | null) =>
    email ? "[REDACTED_EMAIL]" : "[NO_EMAIL]",
}));

describe("recordPartialSuccessRecovery", () => {
  const contactLead = {
    type: LEAD_TYPES.CONTACT,
    fullName: "Jane Doe",
    email: "jane@example.com",
    subject: CONTACT_SUBJECTS.OTHER,
    message: "This is another test message with enough characters.",
    turnstileToken: "valid-token",
  } satisfies LeadInput;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("emits an owner recovery event when email succeeds but CRM fails", async () => {
    const { recordPartialSuccessRecovery } =
      await import("../partial-success-recovery");

    recordPartialSuccessRecovery({
      lead: {
        type: LEAD_TYPES.CONTACT,
        fullName: "John Doe",
        email: "john@example.com",
        subject: CONTACT_SUBJECTS.PRODUCT_INQUIRY,
        message: "This is a test message with enough characters.",
        turnstileToken: "valid-token",
      },
      referenceId: "CON-123",
      emailSent: true,
      recordCreated: false,
      requestId: "req-email-only",
    });

    expect(mockLoggerError).toHaveBeenCalledWith(
      "Lead partial success requires owner follow-up",
      {
        type: LEAD_TYPES.CONTACT,
        referenceId: "CON-123",
        email: "[REDACTED_EMAIL]",
        emailSent: true,
        recordCreated: false,
        recoveryReason: "crm_record_missing",
        requestId: "req-email-only",
      },
    );
  });

  it("emits an owner recovery event when CRM succeeds but email fails", async () => {
    const { recordPartialSuccessRecovery } =
      await import("../partial-success-recovery");

    recordPartialSuccessRecovery({
      lead: contactLead,
      referenceId: "CON-456",
      emailSent: false,
      recordCreated: true,
    });

    expect(mockLoggerError).toHaveBeenCalledWith(
      "Lead partial success requires owner follow-up",
      {
        type: LEAD_TYPES.CONTACT,
        referenceId: "CON-456",
        email: "[REDACTED_EMAIL]",
        emailSent: false,
        recordCreated: true,
        recoveryReason: "email_delivery_missing",
      },
    );

    const [, payload] = mockLoggerError.mock.calls[0] ?? [];
    expect(payload).not.toHaveProperty("requestId");
  });

  it.each([
    { emailSent: true, recordCreated: true },
    { emailSent: false, recordCreated: false },
  ])(
    "emits a mixed recovery reason for emailSent=$emailSent and recordCreated=$recordCreated",
    async ({ emailSent, recordCreated }) => {
      const { recordPartialSuccessRecovery } =
        await import("../partial-success-recovery");

      recordPartialSuccessRecovery({
        lead: contactLead,
        referenceId: "CON-mixed",
        emailSent,
        recordCreated,
      });

      expect(mockLoggerError).toHaveBeenCalledWith(
        "Lead partial success requires owner follow-up",
        expect.objectContaining({
          recoveryReason: "mixed_partial_success",
          emailSent,
          recordCreated,
        }),
      );
    },
  );

  it("records requestId when the property is provided as an empty string", async () => {
    const { recordPartialSuccessRecovery } =
      await import("../partial-success-recovery");

    recordPartialSuccessRecovery({
      lead: contactLead,
      referenceId: "CON-empty-request",
      emailSent: true,
      recordCreated: false,
      requestId: "",
    });

    expect(mockLoggerError).toHaveBeenCalledWith(
      "Lead partial success requires owner follow-up",
      expect.objectContaining({
        requestId: "",
      }),
    );
  });
});

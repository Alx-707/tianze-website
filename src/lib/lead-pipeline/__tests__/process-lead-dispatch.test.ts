import { describe, expect, it, vi } from "vitest";

describe("processLead impossible dispatch branch", () => {
  it("logs unsupported lead types without serializing the lead payload", async () => {
    vi.resetModules();

    const mockLoggerError = vi.fn();
    const mockLoggerInfo = vi.fn();
    const sensitiveEmail = "private-buyer@example.com";

    vi.doMock("@/lib/lead-pipeline/lead-schema", () => ({
      LEAD_TYPES: {
        CONTACT: "contact",
        PRODUCT: "product",
        NEWSLETTER: "newsletter",
      },
      leadSchema: {
        safeParse: () => ({
          success: true,
          data: {
            type: "unknown",
            email: sensitiveEmail,
            message: "Confidential inquiry text",
          },
        }),
      },
      isContactLead: () => false,
      isProductLead: () => false,
      isNewsletterLead: () => false,
    }));

    vi.doMock("@/lib/lead-pipeline/metrics", () => ({
      createLatencyTimer: () => ({ stop: () => 1 }),
    }));

    vi.doMock("@/lib/logger", () => ({
      logger: {
        info: mockLoggerInfo,
        warn: vi.fn(),
        error: mockLoggerError,
      },
      sanitizeEmail: () => "[REDACTED_EMAIL]",
    }));

    const { processLead } = await import("../process-lead");

    const result = await processLead({ type: "unknown" });

    expect(result.error).toBe("PROCESSING_FAILED");
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      "Processing lead",
      expect.objectContaining({
        email: "[REDACTED_EMAIL]",
      }),
    );
    expect(mockLoggerError).toHaveBeenCalledWith(
      "Lead processing unexpected error",
      expect.objectContaining({
        error: "Unsupported lead type: unknown",
      }),
    );
    expect(JSON.stringify(mockLoggerError.mock.calls)).not.toContain(
      sensitiveEmail,
    );
    expect(JSON.stringify(mockLoggerError.mock.calls)).not.toContain(
      "Confidential inquiry text",
    );
  });
});

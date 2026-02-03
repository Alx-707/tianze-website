import {
  LEAD_TYPES,
  type ContactLeadInput,
} from "@/lib/lead-pipeline/lead-schema";
import { settleService } from "@/lib/lead-pipeline/settle-service";
import type { ServiceResult } from "@/lib/lead-pipeline/service-result";
import { logger, sanitizeEmail } from "@/lib/logger";
import { CONTACT_FORM_CONFIG } from "@/config/contact-form-config";
import { splitName } from "@/lib/lead-pipeline/utils";

export async function processContactLead(
  lead: ContactLeadInput,
  referenceId: string,
): Promise<{ emailResult: ServiceResult; crmResult: ServiceResult }> {
  const { firstName, lastName } = splitName(lead.fullName);

  // Lazy import to avoid circular dependencies
  const { resendService } = await import("@/lib/resend");
  const { airtableService } = await import("@/lib/airtable");

  const emailData = {
    firstName,
    lastName,
    email: lead.email,
    company: lead.company ?? "",
    subject: lead.subject,
    message: lead.message,
    submittedAt: lead.submittedAt || new Date().toISOString(),
    marketingConsent: lead.marketingConsent,
  };

  const [emailResult, crmResult] = await Promise.all([
    settleService(resendService.sendContactFormEmail(emailData), {
      operationName: "Email send",
      mapId: (id) => id,
    }),
    settleService(
      airtableService.createLead(LEAD_TYPES.CONTACT, {
        firstName,
        lastName,
        email: lead.email,
        company: lead.company,
        subject: lead.subject,
        message: lead.message,
        marketingConsent: lead.marketingConsent,
        referenceId,
      }),
      {
        operationName: "CRM record",
        mapId: (record) => record?.id,
      },
    ),
  ]);

  // Send confirmation email if enabled (fire-and-forget, non-blocking)
  if (CONTACT_FORM_CONFIG.features.sendConfirmationEmail) {
    resendService.sendConfirmationEmail(emailData).catch((error) => {
      logger.warn("Confirmation email failed (non-blocking)", {
        error: error instanceof Error ? error.message : "Unknown error",
        email: sanitizeEmail(lead.email),
      });
    });
  }

  return { emailResult, crmResult };
}

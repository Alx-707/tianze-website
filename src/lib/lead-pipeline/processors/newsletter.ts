import {
  LEAD_TYPES,
  type NewsletterLeadInput,
} from "@/lib/lead-pipeline/lead-schema";
import { settleService } from "@/lib/lead-pipeline/settle-service";
import {
  DEFAULT_LATENCY,
  type ServiceResult,
} from "@/lib/lead-pipeline/service-result";

export async function processNewsletterLead(
  lead: NewsletterLeadInput,
  referenceId: string,
): Promise<{ emailResult: ServiceResult; crmResult: ServiceResult }> {
  // Lazy import to avoid circular dependencies
  const { airtableService } = await import("@/lib/airtable");

  const crmResult = await settleService(
    airtableService.createLead(LEAD_TYPES.NEWSLETTER, {
      email: lead.email,
      referenceId,
    }),
    {
      operationName: "CRM record",
      mapId: (record) => record?.id,
    },
  );

  return {
    emailResult: { success: false, latencyMs: DEFAULT_LATENCY },
    crmResult,
  };
}

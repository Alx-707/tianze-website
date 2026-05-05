import type { LeadInput } from "@/lib/lead-pipeline/lead-schema";
import { logger, sanitizeEmail } from "@/lib/logger";

export type PartialSuccessRecoveryReason =
  | "crm_record_missing"
  | "email_delivery_missing"
  | "mixed_partial_success";

export interface PartialSuccessRecoveryEvent {
  lead: LeadInput;
  referenceId: string;
  emailSent: boolean;
  recordCreated: boolean;
  requestId?: string | undefined;
}

function getRecoveryReason(
  emailSent: boolean,
  recordCreated: boolean,
): PartialSuccessRecoveryReason {
  if (emailSent && !recordCreated) {
    return "crm_record_missing";
  }
  if (!emailSent && recordCreated) {
    return "email_delivery_missing";
  }
  return "mixed_partial_success";
}

export function recordPartialSuccessRecovery(
  event: PartialSuccessRecoveryEvent,
): void {
  logger.error("Lead partial success requires owner follow-up", {
    type: event.lead.type,
    referenceId: event.referenceId,
    email: sanitizeEmail(event.lead.email),
    emailSent: event.emailSent,
    recordCreated: event.recordCreated,
    recoveryReason: getRecoveryReason(event.emailSent, event.recordCreated),
    ...(event.requestId ? { requestId: event.requestId } : {}),
  });
}

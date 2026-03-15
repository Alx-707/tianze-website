/**
 * Contact Form Processing
 *
 * Shared form submission logic used by both Server Actions and API routes.
 */

import { processLead } from "@/lib/lead-pipeline/process-lead";
import { CONTACT_SUBJECTS, LEAD_TYPES } from "@/lib/lead-pipeline/lead-schema";
import { logger, sanitizeEmail } from "@/lib/logger";
import type { ContactFormFieldValues } from "@/config/contact-form-config";

export type ContactFormWithToken = ContactFormFieldValues & {
  turnstileToken: string;
  submittedAt: string;
};

function mapSubjectToEnum(
  subject: string | undefined,
): (typeof CONTACT_SUBJECTS)[keyof typeof CONTACT_SUBJECTS] {
  if (!subject) return CONTACT_SUBJECTS.OTHER;

  const subjectLower = subject.toLowerCase();
  if (subjectLower.includes("product")) return CONTACT_SUBJECTS.PRODUCT_INQUIRY;
  if (subjectLower.includes("distributor")) return CONTACT_SUBJECTS.DISTRIBUTOR;
  if (subjectLower.includes("oem") || subjectLower.includes("odm")) {
    return CONTACT_SUBJECTS.OEM_ODM;
  }
  return CONTACT_SUBJECTS.OTHER;
}

/**
 * Process a contact form submission via the unified Lead Pipeline.
 */
export async function processFormSubmission(formData: ContactFormWithToken) {
  const fullName = [formData.firstName, formData.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const leadInput = {
    type: LEAD_TYPES.CONTACT,
    fullName: fullName || formData.firstName || "Unknown",
    email: formData.email,
    company: formData.company,
    subject: mapSubjectToEnum(formData.subject),
    message: formData.message,
    turnstileToken: formData.turnstileToken,
    submittedAt: formData.submittedAt,
    marketingConsent: formData.marketingConsent ?? false,
  };

  const result = await processLead(leadInput);

  if (result.success) {
    return {
      success: true,
      emailSent: result.emailSent,
      recordCreated: result.recordCreated,
      referenceId: result.referenceId,
    };
  }

  logger.error("Contact form submission failed via processLead", {
    error: result.error,
    email: sanitizeEmail(formData.email),
  });

  throw new Error("Failed to process form submission");
}

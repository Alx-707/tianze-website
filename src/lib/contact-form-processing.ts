/**
 * Contact Form Processing
 *
 * Shared form submission logic used by both Server Actions and API routes.
 */

import { z } from "zod";
import { processLead } from "@/lib/lead-pipeline/process-lead";
import { CONTACT_SUBJECTS, LEAD_TYPES } from "@/lib/lead-pipeline/lead-schema";
import { logger, sanitizeEmail } from "@/lib/logger";
import { contactFieldValidators } from "@/lib/form-schema/contact-field-validators";
import { verifyTurnstile } from "@/lib/turnstile";
import { mapZodIssueToErrorKey } from "@/lib/contact-form-error-utils";
import {
  CONTACT_FORM_CONFIG,
  createContactFormSchemaFromConfig,
} from "@/config/contact-form-config";
import { TEN_MINUTES_MS } from "@/constants/time";

const contactFormSchema = createContactFormSchemaFromConfig(
  CONTACT_FORM_CONFIG,
  contactFieldValidators,
).extend({
  turnstileToken: z.string().min(1),
  submittedAt: z.string().min(1),
  idempotencyKey: z.string().optional(),
});

export type ContactFormWithToken = z.infer<typeof contactFormSchema>;

interface ContactValidationFailure {
  success: false;
  errorCode: string;
  error: string;
  details: string[] | null;
  data: null;
}

interface ContactValidationSuccess {
  success: true;
  error: null;
  details: null;
  data: ContactFormWithToken;
}

export type ContactValidationResult =
  | ContactValidationFailure
  | ContactValidationSuccess;

function createExpiredSubmissionFailure(): ContactValidationFailure {
  return {
    success: false,
    errorCode: "CONTACT_SUBMISSION_EXPIRED",
    error: "Form submission expired or invalid",
    details: null,
    data: null,
  };
}

function validateSubmissionTime(
  submittedAt: string,
): ContactValidationFailure | null {
  const submittedAtMs = new Date(submittedAt).getTime();
  if (!submittedAt || isNaN(submittedAtMs)) {
    return createExpiredSubmissionFailure();
  }

  const timeDiff = Date.now() - submittedAtMs;
  if (timeDiff > TEN_MINUTES_MS || timeDiff < 0) {
    return createExpiredSubmissionFailure();
  }

  return null;
}

export async function validateContactSubmission(
  body: unknown,
  clientIP: string,
): Promise<ContactValidationResult> {
  const validationResult = contactFormSchema.safeParse(body);

  if (!validationResult.success) {
    return {
      success: false,
      errorCode: "CONTACT_VALIDATION_FAILED",
      error: "Validation failed",
      details: validationResult.error.issues.map(mapZodIssueToErrorKey),
      data: null,
    };
  }

  const formData = validationResult.data;
  if (!formData.turnstileToken) {
    return {
      success: false,
      errorCode: "TURNSTILE_MISSING_TOKEN",
      error: "Security verification required",
      details: null,
      data: null,
    };
  }

  const timeValidationError = validateSubmissionTime(formData.submittedAt);
  if (timeValidationError) {
    return timeValidationError;
  }

  const turnstileValid = await verifyTurnstile(
    formData.turnstileToken,
    clientIP,
  );
  if (!turnstileValid) {
    return {
      success: false,
      errorCode: "TURNSTILE_VERIFICATION_FAILED",
      error: "Security verification failed",
      details: null,
      data: null,
    };
  }

  return {
    success: true,
    error: null,
    details: null,
    data: formData,
  };
}

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

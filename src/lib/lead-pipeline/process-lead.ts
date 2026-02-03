/**
 * Lead Pipeline Core Processing Function
 * Unified handler for all lead sources: contact, product inquiry, newsletter
 */

import {
  isContactLead,
  isNewsletterLead,
  isProductLead,
  leadSchema,
  type LeadInput,
} from "@/lib/lead-pipeline/lead-schema";
import { createLatencyTimer } from "@/lib/lead-pipeline/metrics";
import {
  emitServiceMetrics,
  logPipelineSummary,
} from "@/lib/lead-pipeline/pipeline-observability";
import { processContactLead } from "@/lib/lead-pipeline/processors/contact";
import { processNewsletterLead } from "@/lib/lead-pipeline/processors/newsletter";
import { processProductLead } from "@/lib/lead-pipeline/processors/product";
import type { ServiceResult } from "@/lib/lead-pipeline/service-result";
import { generateLeadReferenceId } from "@/lib/lead-pipeline/utils";
import { logger, sanitizeEmail } from "@/lib/logger";

/**
 * Result of lead processing operation
 */
export interface LeadResult {
  success: boolean;
  emailSent: boolean;
  recordCreated: boolean;
  referenceId?: string | undefined;
  error?: "VALIDATION_ERROR" | "PROCESSING_FAILED" | string | undefined;
}

/**
 * Main lead processing function
 * Validates input, routes to appropriate handler, and ensures at least one service succeeds
 *
 * @param rawInput - Raw input data (will be validated)
 * @returns LeadResult indicating success/failure and service statuses
 */
// eslint-disable-next-line complexity, max-statements -- orchestration logic requires branching
export async function processLead(rawInput: unknown): Promise<LeadResult> {
  const pipelineTimer = createLatencyTimer();

  // Step 1: Validate input
  const validationResult = leadSchema.safeParse(rawInput);

  if (!validationResult.success) {
    logger.warn("Lead validation failed", {
      errors: validationResult.error.issues,
    });
    return {
      success: false,
      emailSent: false,
      recordCreated: false,
      error: "VALIDATION_ERROR",
    };
  }

  const lead: LeadInput = validationResult.data;
  const referenceId = generateLeadReferenceId(lead.type);

  logger.info("Processing lead", {
    type: lead.type,
    email: sanitizeEmail(lead.email),
    referenceId,
  });

  try {
    // Step 2: Route to appropriate handler
    let results: { emailResult: ServiceResult; crmResult: ServiceResult };
    let hasEmailOperation = true;

    if (isContactLead(lead)) {
      results = await processContactLead(lead, referenceId);
    } else if (isProductLead(lead)) {
      results = await processProductLead(lead, referenceId);
    } else if (isNewsletterLead(lead)) {
      results = await processNewsletterLead(lead, referenceId);
      hasEmailOperation = false;
    } else {
      // This should never happen due to discriminated union
      throw new Error("Unknown lead type");
    }

    const { emailResult, crmResult } = results;
    const totalLatencyMs = pipelineTimer.stop();

    // Step 3: Emit metrics for service results
    emitServiceMetrics(emailResult, crmResult, hasEmailOperation);

    // Log individual failures
    if (hasEmailOperation && !emailResult.success) {
      logger.error("Lead email send failed", {
        type: lead.type,
        referenceId,
        error: emailResult.error?.message,
      });
    }

    if (!crmResult.success) {
      logger.error("Lead CRM record failed", {
        type: lead.type,
        referenceId,
        error: crmResult.error?.message,
      });
    }

    // Step 4: At least one success = overall success
    const success = emailResult.success || crmResult.success;

    // Step 5: Log pipeline summary
    logPipelineSummary({
      referenceId,
      leadType: lead.type,
      emailResult,
      crmResult,
      totalLatencyMs,
      overallSuccess: success,
    });

    if (success) {
      logger.info("Lead processed successfully", {
        type: lead.type,
        referenceId,
        emailSent: emailResult.success,
        recordCreated: crmResult.success,
      });
    } else {
      logger.error("Lead processing failed completely", {
        type: lead.type,
        referenceId,
        emailError: emailResult.error?.message,
        crmError: crmResult.error?.message,
      });
    }

    return {
      success,
      emailSent: emailResult.success,
      recordCreated: crmResult.success,
      referenceId: success ? referenceId : undefined,
      error: success ? undefined : "PROCESSING_FAILED",
    };
  } catch (error) {
    const totalLatencyMs = pipelineTimer.stop();

    logger.error("Lead processing unexpected error", {
      type: lead.type,
      referenceId,
      error: error instanceof Error ? error.message : "Unknown error",
      totalLatencyMs,
    });

    return {
      success: false,
      emailSent: false,
      recordCreated: false,
      referenceId,
      error: "PROCESSING_FAILED",
    };
  }
}

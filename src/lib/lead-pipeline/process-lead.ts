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
  type LeadType,
} from "@/lib/lead-pipeline/lead-schema";
import { createLatencyTimer } from "@/lib/lead-pipeline/metrics";
import {
  emitServiceMetrics,
  logPipelineSummary,
} from "@/lib/lead-pipeline/pipeline-observability";
import { processContactLead } from "@/lib/lead-pipeline/processors/contact";
import { processNewsletterLead } from "@/lib/lead-pipeline/processors/newsletter";
import { processProductLead } from "@/lib/lead-pipeline/processors/product";
import {
  isServiceFailure,
  type ServiceResult,
} from "@/lib/lead-pipeline/service-result";
import { generateLeadReferenceId } from "@/lib/lead-pipeline/utils";
import { logger, sanitizeEmail } from "@/lib/logger";

/**
 * Lead handler configuration for table-driven dispatch
 */
interface LeadHandlerConfig {
  /** Whether this lead type sends email notifications */
  hasEmailOperation: boolean;
}

/**
 * Table-driven lead handler configuration
 * Maps each lead type to its processing behavior
 */
const LEAD_HANDLER_CONFIG = {
  contact: { hasEmailOperation: true },
  product: { hasEmailOperation: true },
  newsletter: { hasEmailOperation: false },
} as const satisfies Record<LeadType, LeadHandlerConfig>;

/**
 * Handler result type for all lead processors
 */
type LeadHandlerResult = {
  emailResult: ServiceResult;
  crmResult: ServiceResult;
};

interface LeadOutcome {
  success: boolean;
  partialSuccess: boolean;
}

interface LeadLogContext {
  lead: LeadInput;
  referenceId: string;
  emailResult: ServiceResult;
  crmResult: ServiceResult;
}

function createValidationFailureResult(): LeadResult {
  return {
    success: false,
    partialSuccess: false,
    emailSent: false,
    recordCreated: false,
    error: "VALIDATION_ERROR",
  };
}

function createProcessingFailureResult(referenceId: string): LeadResult {
  return {
    success: false,
    partialSuccess: false,
    emailSent: false,
    recordCreated: false,
    referenceId,
    error: "PROCESSING_FAILED",
  };
}

function calculateLeadOutcome(
  hasEmailOperation: boolean,
  emailResult: ServiceResult,
  crmResult: ServiceResult,
): LeadOutcome {
  const success = hasEmailOperation
    ? emailResult.success && crmResult.success
    : crmResult.success;

  return {
    success,
    partialSuccess: !success && (emailResult.success || crmResult.success),
  };
}

function logServiceFailures(
  context: LeadLogContext & { hasEmailOperation: boolean },
): void {
  const { lead, referenceId, hasEmailOperation, emailResult, crmResult } =
    context;
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
}

function logLeadOutcome(
  context: LeadLogContext & { outcome: LeadOutcome },
): void {
  const { lead, referenceId, emailResult, crmResult, outcome } = context;
  if (outcome.success) {
    logger.info("Lead processed successfully", {
      type: lead.type,
      referenceId,
      emailSent: emailResult.success,
      recordCreated: crmResult.success,
    });
    return;
  }

  if (outcome.partialSuccess) {
    logger.warn("Lead processed partially", {
      type: lead.type,
      referenceId,
      emailSent: emailResult.success,
      recordCreated: crmResult.success,
    });
    return;
  }

  logger.error("Lead processing failed completely", {
    type: lead.type,
    referenceId,
    emailError: isServiceFailure(emailResult)
      ? emailResult.error.message
      : undefined,
    crmError: isServiceFailure(crmResult) ? crmResult.error.message : undefined,
  });
}

/**
 * Dispatches lead to appropriate handler with exhaustive type checking
 * Uses type guards for discriminated union narrowing
 */
// eslint-disable-next-line require-await -- Handler functions are async; this wrapper provides exhaustive dispatch
async function dispatchLeadHandler(
  lead: LeadInput,
  referenceId: string,
): Promise<LeadHandlerResult> {
  if (isContactLead(lead)) {
    return processContactLead(lead, referenceId);
  }
  if (isProductLead(lead)) {
    return processProductLead(lead, referenceId);
  }
  if (isNewsletterLead(lead)) {
    return processNewsletterLead(lead, referenceId);
  }

  // Exhaustive check: TypeScript ensures all LeadType cases are handled
  const exhaustiveCheck: never = lead;
  return exhaustiveCheck;
}

/**
 * Result of lead processing operation
 */
export interface LeadResult {
  success: boolean;
  partialSuccess: boolean;
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
// eslint-disable-next-line max-statements -- orchestration logic requires branching
export async function processLead(rawInput: unknown): Promise<LeadResult> {
  const pipelineTimer = createLatencyTimer();

  // Step 1: Validate input
  const validationResult = leadSchema.safeParse(rawInput);

  if (!validationResult.success) {
    logger.warn("Lead validation failed", {
      errors: validationResult.error.issues,
    });
    return createValidationFailureResult();
  }

  const lead: LeadInput = validationResult.data;
  const referenceId = generateLeadReferenceId(lead.type);

  logger.info("Processing lead", {
    type: lead.type,
    email: sanitizeEmail(lead.email),
    referenceId,
  });

  try {
    // Step 2: Route to appropriate handler with exhaustive type checking
    const results = await dispatchLeadHandler(lead, referenceId);
    const { hasEmailOperation } = LEAD_HANDLER_CONFIG[lead.type];

    const { emailResult, crmResult } = results;
    const totalLatencyMs = pipelineTimer.stop();

    // Step 3: Emit metrics for service results
    emitServiceMetrics(emailResult, crmResult, hasEmailOperation);
    logServiceFailures({
      lead,
      referenceId,
      hasEmailOperation,
      emailResult,
      crmResult,
    });
    const outcome = calculateLeadOutcome(
      hasEmailOperation,
      emailResult,
      crmResult,
    );

    // Step 5: Log pipeline summary
    logPipelineSummary({
      referenceId,
      leadType: lead.type,
      emailResult,
      crmResult,
      totalLatencyMs,
      overallSuccess: outcome.success,
    });
    logLeadOutcome({
      lead,
      referenceId,
      emailResult,
      crmResult,
      outcome,
    });

    return {
      success: outcome.success,
      partialSuccess: outcome.partialSuccess,
      emailSent: emailResult.success,
      recordCreated: crmResult.success,
      referenceId: outcome.success ? referenceId : undefined,
      error: outcome.success ? undefined : "PROCESSING_FAILED",
    };
  } catch (error) {
    const totalLatencyMs = pipelineTimer.stop();

    logger.error("Lead processing unexpected error", {
      type: lead.type,
      referenceId,
      error: error instanceof Error ? error.message : "Unknown error",
      totalLatencyMs,
    });

    return createProcessingFailureResult(referenceId);
  }
}

/**
 * Lead Pipeline Core Processing Function
 * Unified handler for all lead sources: contact, product inquiry, newsletter
 */

import {
  isContactLead,
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

interface LeadHandlerConfig {
  hasEmailOperation: boolean;
}

const LEAD_HANDLER_CONFIG = {
  contact: { hasEmailOperation: true },
  product: { hasEmailOperation: true },
  newsletter: { hasEmailOperation: false },
} as const satisfies Record<LeadType, LeadHandlerConfig>;

type LeadHandlerResult = {
  emailResult: ServiceResult;
  crmResult: ServiceResult;
};

interface ProcessLeadOptions {
  requestId?: string;
}

interface LeadOutcome {
  success: boolean;
  partialSuccess: boolean;
}

interface LeadLogContext {
  lead: LeadInput;
  referenceId: string;
  emailResult: ServiceResult;
  crmResult: ServiceResult;
  requestId?: string;
}

function withRequestId(
  requestId?: string,
): { requestId: string } | Record<string, never> {
  return requestId ? { requestId } : {};
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
  const {
    lead,
    referenceId,
    hasEmailOperation,
    emailResult,
    crmResult,
    requestId,
  } = context;
  if (hasEmailOperation && !emailResult.success) {
    logger.error("Lead email send failed", {
      type: lead.type,
      referenceId,
      error: emailResult.error.message,
      ...withRequestId(requestId),
    });
  }

  if (!crmResult.success) {
    logger.error("Lead CRM record failed", {
      type: lead.type,
      referenceId,
      error: crmResult.error.message,
      ...withRequestId(requestId),
    });
  }
}

function logLeadOutcome(
  context: LeadLogContext & { outcome: LeadOutcome },
): void {
  const { lead, referenceId, emailResult, crmResult, outcome, requestId } =
    context;
  if (outcome.success) {
    logger.info("Lead processed successfully", {
      type: lead.type,
      referenceId,
      emailSent: emailResult.success,
      recordCreated: crmResult.success,
      ...withRequestId(requestId),
    });
    return;
  }

  if (outcome.partialSuccess) {
    logger.warn("Lead processed partially", {
      type: lead.type,
      referenceId,
      emailSent: emailResult.success,
      recordCreated: crmResult.success,
      ...withRequestId(requestId),
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
    ...withRequestId(requestId),
  });
}

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

  return processNewsletterLead(lead, referenceId);
}

export interface LeadResult {
  success: boolean;
  partialSuccess: boolean;
  emailSent: boolean;
  recordCreated: boolean;
  referenceId?: string | undefined;
  error?: "VALIDATION_ERROR" | "PROCESSING_FAILED" | string | undefined;
}

// eslint-disable-next-line max-statements -- orchestration logic intentionally coordinates validation, routing, metrics, and summaries in one place
export async function processLead(
  rawInput: unknown,
  options: ProcessLeadOptions = {},
): Promise<LeadResult> {
  const pipelineTimer = createLatencyTimer();
  const { requestId } = options;

  const validationResult = leadSchema.safeParse(rawInput);

  if (!validationResult.success) {
    logger.warn("Lead validation failed", {
      errors: validationResult.error.issues,
      ...withRequestId(requestId),
    });
    return createValidationFailureResult();
  }

  const lead: LeadInput = validationResult.data;
  const referenceId = generateLeadReferenceId(lead.type);

  logger.info("Processing lead", {
    type: lead.type,
    email: sanitizeEmail(lead.email),
    referenceId,
    ...withRequestId(requestId),
  });

  try {
    const results = await dispatchLeadHandler(lead, referenceId);
    const { hasEmailOperation } = LEAD_HANDLER_CONFIG[lead.type];

    const { emailResult, crmResult } = results;
    const totalLatencyMs = pipelineTimer.stop();

    emitServiceMetrics(emailResult, crmResult, hasEmailOperation, requestId);
    logServiceFailures({
      lead,
      referenceId,
      hasEmailOperation,
      emailResult,
      crmResult,
      ...withRequestId(requestId),
    });
    const outcome = calculateLeadOutcome(
      hasEmailOperation,
      emailResult,
      crmResult,
    );

    logPipelineSummary({
      referenceId,
      leadType: lead.type,
      emailResult,
      crmResult,
      totalLatencyMs,
      overallSuccess: outcome.success,
      ...withRequestId(requestId),
    });
    logLeadOutcome({
      lead,
      referenceId,
      emailResult,
      crmResult,
      outcome,
      ...withRequestId(requestId),
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
      ...withRequestId(requestId),
    });

    return createProcessingFailureResult(referenceId);
  }
}

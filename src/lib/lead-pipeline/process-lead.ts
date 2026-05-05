/**
 * Lead Pipeline Core Processing Function
 * Unified handler for all lead sources: contact, product inquiry, newsletter
 */

import "server-only";

import {
  isContactLead,
  isProductLead,
  leadSchema,
  type LeadInput,
  type LeadType,
} from "@/lib/lead-pipeline/lead-schema";
import { createLatencyTimer } from "@/lib/lead-pipeline/metrics";
import { recordPartialSuccessRecovery } from "@/lib/lead-pipeline/partial-success-recovery";
import {
  recordPipelineObservability,
  type PipelineObservabilityOutcome,
} from "@/lib/lead-pipeline/pipeline-observability";
import { processContactLead } from "@/lib/lead-pipeline/processors/contact";
import { processNewsletterLead } from "@/lib/lead-pipeline/processors/newsletter";
import { processProductLead } from "@/lib/lead-pipeline/processors/product";
import { type ServiceResult } from "@/lib/lead-pipeline/service-result";
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

interface ObservedLeadProcessingResult extends LeadHandlerResult {
  outcome: PipelineObservabilityOutcome;
}

interface ProcessLeadOptions {
  requestId?: string;
}

interface ObserveLeadProcessingParams {
  lead: LeadInput;
  referenceId: string;
  pipelineTimer: ReturnType<typeof createLatencyTimer>;
  requestId?: string;
}

interface ProcessedLeadResultParams {
  referenceId: string;
  emailResult: ServiceResult;
  crmResult: ServiceResult;
  outcome: PipelineObservabilityOutcome;
}

interface PartialSuccessRecoveryParams extends ProcessedLeadResultParams {
  lead: LeadInput;
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

function shouldExposeReferenceId(
  outcome: PipelineObservabilityOutcome,
): boolean {
  return outcome.success || outcome.partialSuccess;
}

function createProcessedLeadResult(
  params: ProcessedLeadResultParams,
): LeadResult {
  const { referenceId, emailResult, crmResult, outcome } = params;
  const exposeReferenceId = shouldExposeReferenceId(outcome);

  return {
    success: outcome.success,
    partialSuccess: outcome.partialSuccess,
    emailSent: emailResult.success,
    recordCreated: crmResult.success,
    referenceId: exposeReferenceId ? referenceId : undefined,
    error: exposeReferenceId ? undefined : "PROCESSING_FAILED",
  };
}

function recordOwnerRecoveryForPartialSuccess(
  params: PartialSuccessRecoveryParams,
): void {
  const { lead, referenceId, emailResult, crmResult, outcome, requestId } =
    params;

  if (!outcome.partialSuccess) {
    return;
  }

  recordPartialSuccessRecovery({
    lead,
    referenceId,
    emailSent: emailResult.success,
    recordCreated: crmResult.success,
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

async function observeLeadProcessing(
  params: ObserveLeadProcessingParams,
): Promise<ObservedLeadProcessingResult> {
  const { lead, referenceId, pipelineTimer, requestId } = params;
  const results = await dispatchLeadHandler(lead, referenceId);
  const { hasEmailOperation } = LEAD_HANDLER_CONFIG[lead.type];

  const { emailResult, crmResult } = results;
  const totalLatencyMs = pipelineTimer.stop();

  const outcome = recordPipelineObservability({
    lead,
    referenceId,
    emailResult,
    crmResult,
    hasEmailOperation,
    totalLatencyMs,
    ...withRequestId(requestId),
  });

  return { emailResult, crmResult, outcome };
}

export interface LeadResult {
  success: boolean;
  partialSuccess: boolean;
  emailSent: boolean;
  recordCreated: boolean;
  referenceId?: string | undefined;
  error?: "VALIDATION_ERROR" | "PROCESSING_FAILED" | string | undefined;
}

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

  let observedResult: ObservedLeadProcessingResult;

  try {
    observedResult = await observeLeadProcessing({
      lead,
      referenceId,
      pipelineTimer,
      ...withRequestId(requestId),
    });
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

  recordOwnerRecoveryForPartialSuccess({
    lead,
    referenceId,
    ...observedResult,
    ...withRequestId(requestId),
  });

  return createProcessedLeadResult({
    referenceId,
    ...observedResult,
  });
}

import {
  categorizeError,
  leadPipelineMetrics,
  METRIC_SERVICES,
  type PipelineSummary,
} from "@/lib/lead-pipeline/metrics";
import type { ServiceResult } from "@/lib/lead-pipeline/service-result";

export function emitServiceMetrics(
  emailResult: ServiceResult,
  crmResult: ServiceResult,
  hasEmailOperation: boolean,
): void {
  // Emit Resend metrics (only for leads with email operations)
  if (hasEmailOperation) {
    if (emailResult.success) {
      leadPipelineMetrics.recordSuccess(
        METRIC_SERVICES.RESEND,
        emailResult.latencyMs,
      );
    } else {
      leadPipelineMetrics.recordFailure(
        METRIC_SERVICES.RESEND,
        emailResult.latencyMs,
        emailResult.error,
      );
    }
  }

  // Emit Airtable metrics
  if (crmResult.success) {
    leadPipelineMetrics.recordSuccess(
      METRIC_SERVICES.AIRTABLE,
      crmResult.latencyMs,
    );
  } else {
    leadPipelineMetrics.recordFailure(
      METRIC_SERVICES.AIRTABLE,
      crmResult.latencyMs,
      crmResult.error,
    );
  }
}

interface LogPipelineSummaryParams {
  referenceId: string;
  leadType: string;
  emailResult: ServiceResult;
  crmResult: ServiceResult;
  totalLatencyMs: number;
  overallSuccess: boolean;
}

export function logPipelineSummary(params: LogPipelineSummaryParams): void {
  const {
    referenceId,
    leadType,
    emailResult,
    crmResult,
    totalLatencyMs,
    overallSuccess,
  } = params;

  const summary: PipelineSummary = {
    leadId: referenceId,
    leadType,
    totalLatencyMs,
    resend: {
      success: emailResult.success,
      latencyMs: emailResult.latencyMs,
      ...(emailResult.error
        ? { errorType: categorizeError(emailResult.error) }
        : {}),
    },
    airtable: {
      success: crmResult.success,
      latencyMs: crmResult.latencyMs,
      ...(crmResult.error
        ? { errorType: categorizeError(crmResult.error) }
        : {}),
    },
    overallSuccess,
    timestamp: new Date().toISOString(),
  };

  leadPipelineMetrics.logPipelineSummary(summary);
}

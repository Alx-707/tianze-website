import {
  categorizeError,
  leadPipelineMetrics,
  METRIC_SERVICES,
  type PipelineSummary,
} from "@/lib/lead-pipeline/metrics";
import {
  isServiceFailure,
  type ServiceResult,
} from "@/lib/lead-pipeline/service-result";

// eslint-disable-next-line max-params -- requestId is required to correlate route and pipeline signals
export function emitServiceMetrics(
  emailResult: ServiceResult,
  crmResult: ServiceResult,
  hasEmailOperation: boolean,
  requestId?: string,
): void {
  // Emit Resend metrics (only for leads with email operations)
  if (hasEmailOperation) {
    if (emailResult.success) {
      leadPipelineMetrics.recordSuccess(
        METRIC_SERVICES.RESEND,
        emailResult.latencyMs,
        requestId,
      );
    } else {
      leadPipelineMetrics.recordFailure(
        METRIC_SERVICES.RESEND,
        emailResult.latencyMs,
        emailResult.error,
        requestId,
      );
    }
  }

  // Emit Airtable metrics
  if (crmResult.success) {
    leadPipelineMetrics.recordSuccess(
      METRIC_SERVICES.AIRTABLE,
      crmResult.latencyMs,
      requestId,
    );
  } else {
    leadPipelineMetrics.recordFailure(
      METRIC_SERVICES.AIRTABLE,
      crmResult.latencyMs,
      crmResult.error,
      requestId,
    );
  }
}

interface LogPipelineSummaryParams {
  referenceId: string;
  leadType: string;
  requestId?: string;
  emailResult: ServiceResult;
  crmResult: ServiceResult;
  totalLatencyMs: number;
  overallSuccess: boolean;
}

export function logPipelineSummary(params: LogPipelineSummaryParams): void {
  const {
    referenceId,
    leadType,
    requestId,
    emailResult,
    crmResult,
    totalLatencyMs,
    overallSuccess,
  } = params;

  const summary: PipelineSummary = {
    leadId: referenceId,
    leadType,
    totalLatencyMs,
    ...(requestId !== undefined ? { requestId } : {}),
    resend: {
      success: emailResult.success,
      latencyMs: emailResult.latencyMs,
      ...(isServiceFailure(emailResult)
        ? { errorType: categorizeError(emailResult.error) }
        : {}),
    },
    airtable: {
      success: crmResult.success,
      latencyMs: crmResult.latencyMs,
      ...(isServiceFailure(crmResult)
        ? { errorType: categorizeError(crmResult.error) }
        : {}),
    },
    overallSuccess,
    timestamp: new Date().toISOString(),
  };

  leadPipelineMetrics.logPipelineSummary(summary);
}

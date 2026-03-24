import { NextResponse } from "next/server";
import { createApiErrorResponse } from "@/lib/api/api-response";
import type { LeadResult } from "@/lib/lead-pipeline/process-lead";
import type { ApiErrorCode } from "@/constants/api-error-codes";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR } from "@/constants";
import { verifyTurnstile } from "@/lib/turnstile";
import { logger, sanitizeIP } from "@/lib/logger";

interface LeadFailureResponseOptions {
  result: LeadResult;
  validationErrorCode: ApiErrorCode;
  processingErrorCode: ApiErrorCode;
}

interface TurnstileValidationOptions {
  token: string | undefined;
  clientIP: string;
  missingTokenErrorCode: ApiErrorCode;
  invalidTokenErrorCode: ApiErrorCode;
  missingTokenLogMessage: string;
  invalidTokenLogMessage: string;
}

export function createLeadSuccessPayload(referenceId: string) {
  return {
    success: true as const,
    data: {
      referenceId,
    },
  };
}

export function createLeadFailureResponse(
  options: LeadFailureResponseOptions,
): NextResponse {
  const { result, validationErrorCode, processingErrorCode } = options;
  const isValidationError = result.error === "VALIDATION_ERROR";
  return createApiErrorResponse(
    isValidationError ? validationErrorCode : processingErrorCode,
    isValidationError ? HTTP_BAD_REQUEST : HTTP_INTERNAL_ERROR,
  );
}

export async function validateLeadTurnstileToken(
  options: TurnstileValidationOptions,
): Promise<NextResponse | null> {
  const {
    token,
    clientIP,
    missingTokenErrorCode,
    invalidTokenErrorCode,
    missingTokenLogMessage,
    invalidTokenLogMessage,
  } = options;

  if (!token) {
    logger.warn(missingTokenLogMessage, {
      ip: sanitizeIP(clientIP),
    });
    return createApiErrorResponse(missingTokenErrorCode, HTTP_BAD_REQUEST);
  }

  const isValid = await verifyTurnstile(token, clientIP);
  if (!isValid) {
    logger.warn(invalidTokenLogMessage, {
      ip: sanitizeIP(clientIP),
    });
    return createApiErrorResponse(invalidTokenErrorCode, HTTP_BAD_REQUEST);
  }

  return null;
}

import { NextResponse } from "next/server";
import { createApiErrorResponse } from "@/lib/api/api-response";
import type { LeadResult } from "@/lib/lead-pipeline/process-lead";
import {
  API_ERROR_CODES,
  type ApiErrorCode,
} from "@/constants/api-error-codes";
import {
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_ERROR,
  HTTP_SERVICE_UNAVAILABLE,
} from "@/constants";
import { verifyTurnstileDetailed } from "@/lib/turnstile";
import { logger, sanitizeIP } from "@/lib/logger";

interface LeadFailureResponseOptions {
  result: LeadResult;
  validationErrorCode: ApiErrorCode;
  partialSuccessErrorCode?: ApiErrorCode;
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

export function requireLeadReferenceId(
  result: Pick<LeadResult, "referenceId">,
  message: string,
): string {
  if (!result.referenceId) {
    throw new Error(message);
  }

  return result.referenceId;
}

export function createLeadFailureResponse(
  options: LeadFailureResponseOptions,
): NextResponse {
  const {
    result,
    validationErrorCode,
    partialSuccessErrorCode,
    processingErrorCode,
  } = options;

  if (result.partialSuccess && result.referenceId && partialSuccessErrorCode) {
    return NextResponse.json(
      {
        success: false,
        errorCode: partialSuccessErrorCode,
        data: {
          partialSuccess: true,
          referenceId: result.referenceId,
          emailSent: result.emailSent,
          recordCreated: result.recordCreated,
        },
      },
      { status: 200 },
    );
  }

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

  const verificationResult = await verifyTurnstileDetailed(token, clientIP);

  if (!verificationResult.success) {
    const errorCodes = verificationResult.errorCodes ?? [];
    const isServiceFailure = errorCodes.some((code) =>
      ["not-configured", "network-error", "timeout"].includes(code),
    );

    if (isServiceFailure) {
      logger.error("Lead Turnstile verification unavailable", {
        ip: sanitizeIP(clientIP),
        errorCodes,
      });
      return createApiErrorResponse(
        API_ERROR_CODES.SERVICE_UNAVAILABLE,
        HTTP_SERVICE_UNAVAILABLE,
      );
    }

    logger.warn(invalidTokenLogMessage, {
      ip: sanitizeIP(clientIP),
      errorCodes,
    });
    return createApiErrorResponse(invalidTokenErrorCode, HTTP_BAD_REQUEST);
  }

  return null;
}

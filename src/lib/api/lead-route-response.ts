import { NextResponse } from "next/server";
import { createApiErrorResponse } from "@/lib/api/api-response";
import type { LeadResult } from "@/lib/lead-pipeline";
import type { ApiErrorCode } from "@/constants/api-error-codes";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR } from "@/constants";

export interface LeadSuccessPayload {
  success: true;
  data: {
    referenceId: string;
  };
}

interface LeadFailureResponseOptions {
  result: LeadResult;
  validationErrorCode: ApiErrorCode;
  processingErrorCode: ApiErrorCode;
}

export function createLeadSuccessPayload(
  referenceId: string,
): LeadSuccessPayload {
  return {
    success: true,
    data: {
      referenceId,
    },
  };
}

export function createLeadSuccessResponse(referenceId: string) {
  return createLeadSuccessPayload(referenceId);
}

export function createLeadCachedSuccessResponse(
  referenceId: string,
): LeadSuccessPayload {
  return createLeadSuccessPayload(referenceId);
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

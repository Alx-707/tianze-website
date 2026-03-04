import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import { logger } from "@/lib/logger";

interface ValidationErrorResponse {
  success: false;
  errorCode: string;
}

/**
 * Format Zod validation errors into a standardized API response.
 * Zod issue details are logged server-side only — never exposed to clients.
 */
export function createValidationErrorResponse(
  zodError: ZodError,
  errorCode: string = API_ERROR_CODES.INVALID_JSON_BODY,
): NextResponse<ValidationErrorResponse> {
  logger.warn("Validation error", {
    errorCode,
    issues: zodError.issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
    })),
  });

  return NextResponse.json(
    {
      success: false,
      errorCode,
    },
    { status: 400 },
  );
}

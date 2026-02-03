/**
 * Product Inquiry API Route
 * Handles product-specific inquiries via product page drawer
 */

import { NextRequest, NextResponse } from "next/server";
import { createCorsPreflightResponse } from "@/lib/api/cors-utils";
import { getApiMessages, type ApiMessages } from "@/lib/api/get-request-locale";
import { safeParseJson } from "@/lib/api/safe-parse-json";
import {
  withRateLimit,
  type RateLimitContext,
} from "@/lib/api/with-rate-limit";
import { processLead, type LeadResult } from "@/lib/lead-pipeline";
import { LEAD_TYPES } from "@/lib/lead-pipeline/lead-schema";
import { logger, sanitizeIP } from "@/lib/logger";
import { verifyTurnstile } from "@/app/api/contact/contact-api-utils";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR } from "@/constants";

interface SuccessResponseOptions {
  result: LeadResult;
  clientIP: string;
  processingTime: number;
  successMessage: string;
}

/**
 * Create success response for product inquiry
 */
function createSuccessResponse(options: SuccessResponseOptions): NextResponse {
  const { result, clientIP, processingTime, successMessage } = options;
  logger.info("Product inquiry submitted successfully", {
    referenceId: result.referenceId,
    ip: sanitizeIP(clientIP),
    processingTime,
    emailSent: result.emailSent,
    recordCreated: result.recordCreated,
  });

  return NextResponse.json({
    success: true,
    message: successMessage,
    referenceId: result.referenceId,
  });
}

interface ErrorResponseOptions {
  result: LeadResult;
  clientIP: string;
  processingTime: number;
  messages: ApiMessages;
}

/**
 * Create error response for failed inquiry
 */
function createErrorResponse(options: ErrorResponseOptions): NextResponse {
  const { result, clientIP, processingTime, messages } = options;
  logger.warn("Product inquiry submission failed", {
    error: result.error,
    ip: sanitizeIP(clientIP),
    processingTime,
  });

  const isValidationError = result.error === "VALIDATION_ERROR";
  return NextResponse.json(
    {
      success: false,
      error: isValidationError
        ? messages.validationError
        : messages.inquiry.processingError,
    },
    { status: isValidationError ? HTTP_BAD_REQUEST : HTTP_INTERNAL_ERROR },
  );
}

interface TurnstileValidationOptions {
  token: string | undefined;
  clientIP: string;
  messages: ApiMessages;
}

/**
 * Validate Turnstile token and return error response if invalid
 */
async function validateTurnstile(
  options: TurnstileValidationOptions,
): Promise<NextResponse | null> {
  const { token, clientIP, messages } = options;

  if (!token) {
    logger.warn("Product inquiry missing Turnstile token", {
      ip: sanitizeIP(clientIP),
    });
    return NextResponse.json(
      { success: false, error: messages.inquiry.securityRequired },
      { status: HTTP_BAD_REQUEST },
    );
  }

  const isValid = await verifyTurnstile(token, clientIP);
  if (!isValid) {
    logger.warn("Product inquiry Turnstile verification failed", {
      ip: sanitizeIP(clientIP),
    });
    return NextResponse.json(
      {
        success: false,
        error: messages.inquiry.securityFailed,
      },
      { status: HTTP_BAD_REQUEST },
    );
  }

  return null;
}

/**
 * POST /api/inquiry
 * Handle product inquiry form submission
 */
export const POST = withRateLimit(
  "inquiry",
  async (request: NextRequest, { clientIP }: RateLimitContext) => {
    const startTime = Date.now();
    const messages = getApiMessages(request);

    try {
      const parsedBody = await safeParseJson<{
        turnstileToken?: string;
        [key: string]: unknown;
      }>(request, { route: "/api/inquiry" });

      if (!parsedBody.ok) {
        return NextResponse.json(
          { success: false, error: parsedBody.error },
          { status: HTTP_BAD_REQUEST },
        );
      }

      const turnstileError = await validateTurnstile({
        token: parsedBody.data?.turnstileToken,
        clientIP,
        messages,
      });
      if (turnstileError) return turnstileError;

      const { turnstileToken: _token, ...leadData } = parsedBody.data ?? {};
      const result = await processLead({
        type: LEAD_TYPES.PRODUCT,
        ...leadData,
      });
      const processingTime = Date.now() - startTime;

      return result.success
        ? createSuccessResponse({
            result,
            clientIP,
            processingTime,
            successMessage: messages.inquiry.success,
          })
        : createErrorResponse({ result, clientIP, processingTime, messages });
    } catch (error) {
      logger.error("Product inquiry submission failed unexpectedly", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        ip: sanitizeIP(clientIP),
        processingTime: Date.now() - startTime,
      });

      return NextResponse.json(
        { success: false, error: messages.serverError },
        { status: HTTP_INTERNAL_ERROR },
      );
    }
  },
);

/**
 * OPTIONS /api/inquiry
 * Handle CORS preflight requests
 */
export function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

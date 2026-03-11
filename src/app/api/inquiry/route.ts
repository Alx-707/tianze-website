/**
 * Product Inquiry API Route
 * Handles product-specific inquiries via product page drawer
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createApiErrorResponse,
  createApiSuccessResponse,
} from "@/lib/api/api-response";
import {
  applyCorsHeaders,
  createCorsPreflightResponse,
} from "@/lib/api/cors-utils";
import { safeParseJson } from "@/lib/api/safe-parse-json";
import {
  withRateLimit,
  type RateLimitContext,
} from "@/lib/api/with-rate-limit";
import { withIdempotency } from "@/lib/idempotency";
import { processLead, type LeadResult } from "@/lib/lead-pipeline";
import { LEAD_TYPES } from "@/lib/lead-pipeline/lead-schema";
import { logger, sanitizeIP } from "@/lib/logger";
import { verifyTurnstile } from "@/lib/turnstile";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR } from "@/constants";

interface SuccessResponseOptions {
  result: LeadResult;
  clientIP: string;
  processingTime: number;
}

/**
 * Create success response for product inquiry
 */
function createSuccessResponse(options: SuccessResponseOptions): NextResponse {
  const { result, clientIP, processingTime } = options;
  logger.info("Product inquiry submitted successfully", {
    referenceId: result.referenceId,
    ip: sanitizeIP(clientIP),
    processingTime,
    emailSent: result.emailSent,
    recordCreated: result.recordCreated,
  });

  return createApiSuccessResponse({
    referenceId: result.referenceId,
  });
}

interface ErrorResponseOptions {
  result: LeadResult;
  clientIP: string;
  processingTime: number;
}

/**
 * Create error response for failed inquiry
 */
function createErrorResponse(options: ErrorResponseOptions): NextResponse {
  const { result, clientIP, processingTime } = options;
  logger.warn("Product inquiry submission failed", {
    error: result.error,
    ip: sanitizeIP(clientIP),
    processingTime,
  });

  const isValidationError = result.error === "VALIDATION_ERROR";
  return createApiErrorResponse(
    isValidationError
      ? API_ERROR_CODES.INQUIRY_VALIDATION_FAILED
      : API_ERROR_CODES.INQUIRY_PROCESSING_ERROR,
    isValidationError ? HTTP_BAD_REQUEST : HTTP_INTERNAL_ERROR,
  );
}

interface TurnstileValidationOptions {
  token: string | undefined;
  clientIP: string;
}

/**
 * Validate Turnstile token and return error response if invalid
 */
async function validateTurnstile(
  options: TurnstileValidationOptions,
): Promise<NextResponse | null> {
  const { token, clientIP } = options;

  if (!token) {
    logger.warn("Product inquiry missing Turnstile token", {
      ip: sanitizeIP(clientIP),
    });
    return createApiErrorResponse(
      API_ERROR_CODES.INQUIRY_SECURITY_REQUIRED,
      HTTP_BAD_REQUEST,
    );
  }

  const isValid = await verifyTurnstile(token, clientIP);
  if (!isValid) {
    logger.warn("Product inquiry Turnstile verification failed", {
      ip: sanitizeIP(clientIP),
    });
    return createApiErrorResponse(
      API_ERROR_CODES.INQUIRY_SECURITY_FAILED,
      HTTP_BAD_REQUEST,
    );
  }

  return null;
}

/**
 * POST /api/inquiry
 * Handle product inquiry form submission
 */
const POST_RATE_LIMITED = withRateLimit(
  "inquiry",
  (request: NextRequest, { clientIP }: RateLimitContext) => {
    return withIdempotency(
      request,
      async () => {
        const startTime = Date.now();

        try {
          const parsedBody = await safeParseJson<{
            turnstileToken?: string;
            [key: string]: unknown;
          }>(request, { route: "/api/inquiry" });

          if (!parsedBody.ok) {
            return createApiErrorResponse(
              parsedBody.errorCode,
              parsedBody.statusCode,
            );
          }

          const turnstileError = await validateTurnstile({
            token: parsedBody.data?.turnstileToken,
            clientIP,
          });
          if (turnstileError) return turnstileError;

          const data = parsedBody.data ?? {};
          const pickedLeadData = {
            fullName: data.fullName,
            productSlug: data.productSlug,
            productName: data.productName,
            quantity: data.quantity,
            requirements: data.requirements,
            email: data.email,
            company: data.company,
            marketingConsent: data.marketingConsent,
          };
          const result = await processLead({
            ...pickedLeadData,
            // Ensure route semantics cannot be overwritten by request body.
            type: LEAD_TYPES.PRODUCT,
          });
          const processingTime = Date.now() - startTime;

          return result.success
            ? createSuccessResponse({
                result,
                clientIP,
                processingTime,
              })
            : createErrorResponse({ result, clientIP, processingTime });
        } catch (error) {
          logger.error("Product inquiry submission failed unexpectedly", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            ip: sanitizeIP(clientIP),
            processingTime: Date.now() - startTime,
          });

          return createApiErrorResponse(
            API_ERROR_CODES.INQUIRY_PROCESSING_ERROR,
            HTTP_INTERNAL_ERROR,
          );
        }
      },
      { required: true },
    );
  },
);

export async function POST(request: NextRequest) {
  const response = await POST_RATE_LIMITED(request);
  return applyCorsHeaders({ request, response });
}

/**
 * OPTIONS /api/inquiry
 * Handle CORS preflight requests
 */
export function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

import { NextRequest, NextResponse } from "next/server";
import { createApiErrorResponse } from "@/lib/api/api-response";
import {
  applyCorsHeaders,
  createCorsPreflightResponse,
} from "@/lib/api/cors-utils";
import {
  createLeadCachedSuccessResponse,
  createLeadFailureResponse,
} from "@/lib/api/lead-route-response";
import { readAndHashJsonBody } from "@/lib/api/read-and-hash-body";
import {
  withRateLimit,
  type RateLimitContext,
} from "@/lib/api/with-rate-limit";
import { createRequestFingerprint, withIdempotency } from "@/lib/idempotency";
import { processLead, type LeadResult } from "@/lib/lead-pipeline";
import { LEAD_TYPES } from "@/lib/lead-pipeline/lead-schema";
import { logger, sanitizeEmail, sanitizeIP } from "@/lib/logger";
import { verifyTurnstile } from "@/lib/turnstile";
import { HTTP_BAD_REQUEST } from "@/constants";
import { API_ERROR_CODES } from "@/constants/api-error-codes";

/**
 * Create success response for newsletter subscription
 */
function createSuccessResponse(result: LeadResult, email: string) {
  logger.info("Newsletter subscription successful", {
    referenceId: result.referenceId,
    email: sanitizeEmail(email),
  });

  return createLeadCachedSuccessResponse(result.referenceId!);
}

/**
 * Create error response for failed subscription
 */
function createErrorResponse(result: LeadResult): NextResponse {
  logger.warn("Newsletter subscription failed", { error: result.error });

  return createLeadFailureResponse({
    result,
    validationErrorCode: API_ERROR_CODES.SUBSCRIBE_VALIDATION_EMAIL_INVALID,
    processingErrorCode: API_ERROR_CODES.SUBSCRIBE_PROCESSING_ERROR,
  });
}

/**
 * Handle subscription form submission
 */
function handlePost(
  request: NextRequest,
  { clientIP }: RateLimitContext,
): Promise<NextResponse> {
  return (async () => {
    const parsedBody = await readAndHashJsonBody<{
      email?: string;
      pageType?: string;
      turnstileToken?: string;
    }>(request, { route: "/api/subscribe" });

    if (!parsedBody.ok) {
      return createApiErrorResponse(
        parsedBody.errorCode,
        parsedBody.statusCode,
      );
    }

    return withIdempotency(
      request,
      async () => {
        const email = parsedBody.data?.email;
        const turnstileToken = parsedBody.data?.turnstileToken;

        if (email === undefined || email === "") {
          return createApiErrorResponse(
            API_ERROR_CODES.SUBSCRIBE_VALIDATION_EMAIL_REQUIRED,
            HTTP_BAD_REQUEST,
          );
        }

        // Verify Turnstile token
        if (!turnstileToken) {
          logger.warn("Newsletter subscription missing Turnstile token", {
            ip: sanitizeIP(clientIP),
          });
          return createApiErrorResponse(
            API_ERROR_CODES.SUBSCRIBE_SECURITY_REQUIRED,
            HTTP_BAD_REQUEST,
          );
        }

        const isValidTurnstile = await verifyTurnstile(
          turnstileToken,
          clientIP,
        );
        if (!isValidTurnstile) {
          logger.warn("Newsletter Turnstile verification failed", {
            ip: sanitizeIP(clientIP),
          });
          return createApiErrorResponse(
            API_ERROR_CODES.SUBSCRIBE_SECURITY_FAILED,
            HTTP_BAD_REQUEST,
          );
        }

        // Prepare lead input for newsletter subscription
        const leadInput = {
          type: LEAD_TYPES.NEWSLETTER,
          email,
        };

        // Process via unified Lead Pipeline
        const result = await processLead(leadInput);

        return result.success
          ? createSuccessResponse(result, email)
          : createErrorResponse(result);
      },
      {
        required: true,
        fingerprint: createRequestFingerprint(request, parsedBody.bodyHash),
      },
    );
  })();
}

const POST_RATE_LIMITED = withRateLimit("subscribe", handlePost);

export async function POST(request: NextRequest) {
  const response = await POST_RATE_LIMITED(request);
  return applyCorsHeaders({ request, response });
}

// 处理 OPTIONS 请求 (CORS)
export function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

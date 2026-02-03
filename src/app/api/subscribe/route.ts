import { NextRequest, NextResponse } from "next/server";
import { createCorsPreflightResponse } from "@/lib/api/cors-utils";
import { safeParseJson as safeParseJsonHelper } from "@/lib/api/safe-parse-json";
import {
  withRateLimit,
  type RateLimitContext,
} from "@/lib/api/with-rate-limit";
import { withIdempotency } from "@/lib/idempotency";
import { processLead, type LeadResult } from "@/lib/lead-pipeline";
import { LEAD_TYPES } from "@/lib/lead-pipeline/lead-schema";
import { logger, sanitizeEmail, sanitizeIP } from "@/lib/logger";
import { verifyTurnstile } from "@/app/api/contact/contact-api-utils";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR } from "@/constants";
import { API_ERROR_CODES } from "@/constants/api-error-codes";

type SafeParseSuccess<T> = { ok: true; data: T };
type SafeParseFailure = { ok: false; errorCode: string };

function safeParseJson<T>(
  req: NextRequest,
): Promise<SafeParseSuccess<T> | SafeParseFailure> {
  // 复用通用 safeParseJson helper，统一 JSON 解析行为和 errorCode 语义
  return safeParseJsonHelper<T>(req, { route: "/api/subscribe" });
}

/**
 * Create success response for newsletter subscription
 */
function createSuccessResponse(result: LeadResult, email: string): object {
  logger.info("Newsletter subscription successful", {
    referenceId: result.referenceId,
    email: sanitizeEmail(email),
  });

  return {
    success: true,
    errorCode: API_ERROR_CODES.SUBSCRIBE_SUCCESS,
    email,
    referenceId: result.referenceId,
  };
}

/**
 * Create error response for failed subscription
 */
function createErrorResponse(result: LeadResult): NextResponse {
  logger.warn("Newsletter subscription failed", { error: result.error });

  const isValidationError = result.error === "VALIDATION_ERROR";
  return NextResponse.json(
    {
      success: false,
      errorCode: isValidationError
        ? API_ERROR_CODES.SUBSCRIBE_VALIDATION_EMAIL_INVALID
        : API_ERROR_CODES.SUBSCRIBE_PROCESSING_ERROR,
    },
    {
      status: isValidationError ? HTTP_BAD_REQUEST : HTTP_INTERNAL_ERROR,
    },
  );
}

/**
 * Handle subscription form submission
 */
function handlePost(
  request: NextRequest,
  { clientIP }: RateLimitContext,
): ReturnType<typeof withIdempotency> {
  // 使用幂等键中间件包装处理逻辑
  return withIdempotency(request, async () => {
    const parsedBody = await safeParseJson<{
      email?: string;
      pageType?: string;
      turnstileToken?: string;
    }>(request);

    if (!parsedBody.ok) {
      return NextResponse.json(
        {
          success: false,
          errorCode: API_ERROR_CODES.INVALID_JSON_BODY,
        },
        { status: HTTP_BAD_REQUEST },
      );
    }

    const email = parsedBody.data?.email;
    const turnstileToken = parsedBody.data?.turnstileToken;

    if (email === undefined || email === "") {
      return NextResponse.json(
        {
          success: false,
          errorCode: API_ERROR_CODES.SUBSCRIBE_VALIDATION_EMAIL_REQUIRED,
        },
        { status: HTTP_BAD_REQUEST },
      );
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      logger.warn("Newsletter subscription missing Turnstile token", {
        ip: sanitizeIP(clientIP),
      });
      return NextResponse.json(
        {
          success: false,
          errorCode: API_ERROR_CODES.SUBSCRIBE_SECURITY_REQUIRED,
        },
        { status: HTTP_BAD_REQUEST },
      );
    }

    const isValidTurnstile = await verifyTurnstile(turnstileToken, clientIP);
    if (!isValidTurnstile) {
      logger.warn("Newsletter Turnstile verification failed", {
        ip: sanitizeIP(clientIP),
      });
      return NextResponse.json(
        {
          success: false,
          errorCode: API_ERROR_CODES.SUBSCRIBE_SECURITY_FAILED,
        },
        { status: HTTP_BAD_REQUEST },
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
  });
}

export const POST = withRateLimit("subscribe", handlePost);

// 处理 OPTIONS 请求 (CORS)
export function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

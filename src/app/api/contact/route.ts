/**
 * 联系表单API路由
 * Contact form API routes
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createApiErrorResponse,
  createApiSuccessResponse,
} from "@/lib/api/api-response";
import { createLeadSuccessPayload } from "@/lib/api/lead-route-response";
import {
  applyRequestObservability,
  getRequestObservability,
  withObservabilityContext,
} from "@/lib/api/request-observability";
import { recordApiResponseSignal } from "@/lib/observability/api-signals";
import {
  applyCorsHeaders,
  createCorsPreflightResponse,
} from "@/lib/api/cors-utils";
import { readAndHashJsonBody } from "@/lib/api/read-and-hash-body";
import {
  withRateLimit,
  type RateLimitContext,
} from "@/lib/api/with-rate-limit";
import { createRequestFingerprint, withIdempotency } from "@/lib/idempotency";
import {
  createCanonicalContactFingerprintFromUnknown,
  submitCanonicalContactSubmission,
} from "@/lib/contact/submit-canonical-contact";
import { logger, sanitizeIP, sanitizeLogContext } from "@/lib/logger";
import {
  getContactFormStats,
  validateAdminAccess,
} from "@/app/api/contact/contact-api-validation";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import {
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_ERROR,
  HTTP_UNAUTHORIZED,
} from "@/constants";

/**
 * POST /api/contact
 * 处理联系表单提交
 * Handle contact form submission
 */
const POST_RATE_LIMITED = withRateLimit(
  "contact",
  async (request: NextRequest, { clientIP }: RateLimitContext) => {
    const observability = getRequestObservability(request, "lead-family");
    const parsedBody = await readAndHashJsonBody<unknown>(request, {
      route: "/api/contact",
    });
    if (!parsedBody.ok) {
      return createApiErrorResponse(
        parsedBody.errorCode,
        parsedBody.statusCode,
      );
    }

    return withIdempotency(
      request,
      async () => {
        const startTime = Date.now();

        try {
          const submission = await submitCanonicalContactSubmission(
            parsedBody.data,
            {
              clientIP,
              requestId: observability.requestId,
            },
          );
          if (!submission.success) {
            return {
              success: false as const,
              errorCode:
                submission.errorCode ??
                API_ERROR_CODES.CONTACT_VALIDATION_FAILED,
              statusCode: submission.statusCode ?? HTTP_BAD_REQUEST,
            };
          }

          const { submissionResult } = submission;
          const processingTime = Date.now() - startTime;

          if (process.env.NODE_ENV !== "production") {
            logger.info(
              "Contact form submitted successfully",
              sanitizeLogContext({
                email: submission.data.email,
                company: submission.data.company,
                ip: clientIP,
                processingTime,
                emailSent: submissionResult.emailSent,
                recordCreated: submissionResult.recordCreated,
                ...withObservabilityContext(observability),
              }),
            );
          }

          if (!submissionResult.referenceId) {
            throw new Error(
              "referenceId missing on successful contact submission",
            );
          }
          return createLeadSuccessPayload(submissionResult.referenceId);
        } catch (error) {
          logger.error("Contact form submission failed", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            ip: sanitizeIP(clientIP),
            processingTime: Date.now() - startTime,
            ...withObservabilityContext(observability),
          });

          return {
            success: false as const,
            errorCode: API_ERROR_CODES.CONTACT_PROCESSING_ERROR,
            statusCode: HTTP_INTERNAL_ERROR,
          };
        }
      },
      {
        required: true,
        fingerprint:
          createCanonicalContactFingerprintFromUnknown(parsedBody.data) ??
          createRequestFingerprint(request, parsedBody.bodyHash),
      },
    );
  },
);

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const observability = getRequestObservability(request, "lead-family");
  const response = await POST_RATE_LIMITED(request);
  const enrichedResponse = applyRequestObservability(
    applyCorsHeaders({ request, response }),
    observability,
  );
  await recordApiResponseSignal({
    context: observability,
    response: enrichedResponse,
    name: "contact.post",
    route: "/api/contact",
    latencyMs: Date.now() - startTime,
  });
  return enrichedResponse;
}

/**
 * GET /api/contact
 * 获取联系表单统计信息（仅管理员）
 * Get contact form statistics (admin only)
 */
const GET_RATE_LIMITED = withRateLimit(
  "contactAdminStats",
  async (
    request: NextRequest,
    _ctx: RateLimitContext,
  ): Promise<NextResponse> => {
    const observability = getRequestObservability(request, "lead-family");
    try {
      // 验证管理员权限
      const authHeader = request.headers.get("authorization");

      if (!validateAdminAccess(authHeader)) {
        logger.warn(
          "Unauthorized access attempt to contact statistics",
          withObservabilityContext(observability),
        );
        return createApiErrorResponse(
          API_ERROR_CODES.UNAUTHORIZED,
          HTTP_UNAUTHORIZED,
        );
      }

      // 获取统计信息
      const statsResult = await getContactFormStats();

      return createApiSuccessResponse(statsResult);
    } catch (error) {
      logger.error("Failed to get contact statistics", {
        error: error instanceof Error ? error.message : "Unknown error",
        ...withObservabilityContext(observability),
      });

      return createApiErrorResponse(
        API_ERROR_CODES.CONTACT_STATS_ERROR,
        HTTP_INTERNAL_ERROR,
      );
    }
  },
);

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const observability = getRequestObservability(request, "lead-family");
  const response = await GET_RATE_LIMITED(request);
  const enrichedResponse = applyRequestObservability(
    applyCorsHeaders({
      request,
      response,
      additionalMethods: ["GET"],
      additionalHeaders: ["Authorization"],
    }),
    observability,
  );
  await recordApiResponseSignal({
    context: observability,
    response: enrichedResponse,
    name: "contact.get-stats",
    route: "/api/contact",
    latencyMs: Date.now() - startTime,
  });
  return enrichedResponse;
}

/**
 * OPTIONS /api/contact
 * 处理CORS预检请求
 * Handle CORS preflight requests
 */
export function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request, ["GET"], ["Authorization"]);
}

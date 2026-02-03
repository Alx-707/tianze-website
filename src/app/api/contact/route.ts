/**
 * 联系表单API路由
 * Contact form API routes
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createApiErrorResponse,
  createApiSuccessResponse,
} from "@/lib/api/api-response";
import { createCorsPreflightResponse } from "@/lib/api/cors-utils";
import { safeParseJson } from "@/lib/api/safe-parse-json";
import {
  withRateLimit,
  type RateLimitContext,
} from "@/lib/api/with-rate-limit";
import { logger, sanitizeIP, sanitizeLogContext } from "@/lib/logger";
import {
  getContactFormStats,
  processFormSubmission,
  validateAdminAccess,
  validateFormData,
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
export const POST = withRateLimit(
  "contact",
  async (
    request: NextRequest,
    { clientIP }: RateLimitContext,
  ): Promise<NextResponse> => {
    const startTime = Date.now();

    try {
      const parsedBody = await safeParseJson<unknown>(request, {
        route: "/api/contact",
      });
      if (!parsedBody.ok) {
        return createApiErrorResponse(
          API_ERROR_CODES.INVALID_JSON_BODY,
          HTTP_BAD_REQUEST,
        );
      }

      const validation = await validateFormData(parsedBody.data, clientIP);
      if (!validation.success || !validation.data) {
        return createApiErrorResponse(
          API_ERROR_CODES.CONTACT_VALIDATION_FAILED,
          HTTP_BAD_REQUEST,
        );
      }

      const submissionResult = await processFormSubmission(validation.data);
      const processingTime = Date.now() - startTime;

      logger.info(
        "Contact form submitted successfully",
        sanitizeLogContext({
          email: validation.data.email,
          company: validation.data.company,
          ip: clientIP,
          processingTime,
          emailSent: submissionResult.emailSent,
          recordCreated: submissionResult.recordCreated,
        }),
      );

      return createApiSuccessResponse({
        messageId: submissionResult.emailMessageId,
        recordId: submissionResult.airtableRecordId,
      });
    } catch (error) {
      logger.error("Contact form submission failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        ip: sanitizeIP(clientIP),
        processingTime: Date.now() - startTime,
      });

      return createApiErrorResponse(
        API_ERROR_CODES.CONTACT_PROCESSING_ERROR,
        HTTP_INTERNAL_ERROR,
      );
    }
  },
);

/**
 * GET /api/contact
 * 获取联系表单统计信息（仅管理员）
 * Get contact form statistics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get("authorization");

    if (!validateAdminAccess(authHeader)) {
      logger.warn("Unauthorized access attempt to contact statistics");
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
    });

    return createApiErrorResponse(
      API_ERROR_CODES.CONTACT_STATS_ERROR,
      HTTP_INTERNAL_ERROR,
    );
  }
}

/**
 * OPTIONS /api/contact
 * 处理CORS预检请求
 * Handle CORS preflight requests
 */
export function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request, ["GET"], ["Authorization"]);
}

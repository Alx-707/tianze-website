/**
 * 联系表单API验证和数据处理
 * Contact form API validation and data processing
 *
 * This module handles validation and delegates to the unified processLead pipeline
 */

import { z } from "zod";
import { airtableService } from "@/lib/airtable";
import { getRuntimeEnvString } from "@/lib/env";
import { logger, sanitizeIP } from "@/lib/logger";
import { constantTimeCompare } from "@/lib/security-crypto";
import { ONE, ZERO } from "@/constants";
import {
  type ContactFormWithToken,
  validateContactSubmission,
} from "@/lib/contact-form-processing";

/**
 * 扩展的联系表单模式，包含Turnstile token
 * Extended contact form schema with Turnstile token
 */
export const contactFormWithTokenSchema = z.object({
  turnstileToken: z.string().min(ONE, "Security verification required"),
  submittedAt: z.string(),
});

export type { ContactFormWithToken };

let hasLoggedMissingAdminToken = false;

/**
 * 验证表单数据
 * Validate form data
 */
export async function validateFormData(body: unknown, clientIP: string) {
  const result = await validateContactSubmission(body, clientIP);

  if (!result.success) {
    logger.warn("Form validation failed", {
      errorCode: result.errorCode,
      details: result.details,
      clientIP: sanitizeIP(clientIP),
    });
  }

  return result;
}

/**
 * 获取联系表单统计信息
 * Get contact form statistics
 */
export async function getContactFormStats() {
  try {
    if (!airtableService.isReady()) {
      // 如果服务未配置，返回默认值
      return {
        success: true,
        data: {
          totalContacts: ZERO,
          newContacts: ZERO,
          completedContacts: ZERO,
          recentContacts: ZERO,
        },
      };
    }

    const stats = await airtableService.getStatistics();

    // 确保返回完整的统计数据，为缺失字段提供默认值
    const defaultStats = {
      totalContacts: ZERO,
      newContacts: ZERO,
      completedContacts: ZERO,
      recentContacts: ZERO,
    };

    const normalizedStats = {
      totalContacts: stats?.totalContacts ?? defaultStats.totalContacts,
      newContacts: stats?.newContacts ?? defaultStats.newContacts,
      completedContacts:
        stats?.completedContacts ?? defaultStats.completedContacts,
      recentContacts: stats?.recentContacts ?? defaultStats.recentContacts,
    };

    return {
      success: true,
      data: normalizedStats,
    };
  } catch (error) {
    logger.error("Failed to get contact form stats", { error });
    throw new Error("Failed to retrieve statistics");
  }
}

/**
 * 验证管理员权限
 * Validate admin permissions
 */
export function validateAdminAccess(authHeader: string | null): boolean {
  const adminToken = getRuntimeEnvString("ADMIN_API_TOKEN");

  if (!adminToken) {
    if (!hasLoggedMissingAdminToken) {
      logger.error(
        "Admin API token not configured — admin endpoint unavailable",
        {
          missingEnv: "ADMIN_API_TOKEN",
          endpoint: "contact-admin-stats",
        },
      );
      hasLoggedMissingAdminToken = true;
    }
    return false;
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  // Use constant-time comparison to prevent timing attacks
  return token.length > 0 && constantTimeCompare(token, adminToken);
}

/**
 * 清理和标准化表单数据
 * Clean and normalize form data
 */
export function sanitizeFormData(
  data: ContactFormWithToken,
): ContactFormWithToken {
  return {
    turnstileToken: data.turnstileToken.trim(),
    submittedAt: data.submittedAt,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.toLowerCase().trim(),
    company: data.company?.trim() || "",
    phone: data.phone?.trim() || undefined,
    subject: data.subject?.trim() || undefined,
    message: data.message.trim(),
    acceptPrivacy: data.acceptPrivacy,
    marketingConsent: data.marketingConsent ?? false,
    website: data.website?.trim() || undefined,
  };
}

/**
 * 联系表单API验证和数据处理
 * Contact form API validation and data processing
 *
 * This module handles validation and delegates to the unified processLead pipeline
 */

import { z } from "zod";
import { airtableService } from "@/lib/airtable";
import { contactFieldValidators } from "@/lib/form-schema/contact-field-validators";
import { logger, sanitizeIP } from "@/lib/logger";
import { constantTimeCompare } from "@/lib/security-crypto";
import { verifyTurnstile } from "@/lib/turnstile";
import { mapZodIssueToErrorKey } from "@/lib/contact-form-error-utils";
import {
  CONTACT_FORM_CONFIG,
  createContactFormSchemaFromConfig,
} from "@/config/contact-form-config";
import { ONE, ZERO } from "@/constants";
import { TEN_MINUTES_MS } from "@/constants/time";
// Canonical type definition lives in contact-form-processing.ts (lib layer).
// Import here to avoid duplicating the shape definition.
import { type ContactFormWithToken } from "@/lib/contact-form-processing";

const contactFormSchema = createContactFormSchemaFromConfig(
  CONTACT_FORM_CONFIG,
  contactFieldValidators,
);

/**
 * 扩展的联系表单模式，包含Turnstile token
 * Extended contact form schema with Turnstile token
 */
export const contactFormWithTokenSchema = contactFormSchema.extend({
  turnstileToken: z.string().min(ONE, "Security verification required"),
  submittedAt: z.string(),
});

export type { ContactFormWithToken };

const SUBMISSION_EXPIRED_RESPONSE = {
  success: false,
  error: "Form submission expired or invalid",
  details: ["Please refresh the page and try again"],
  data: null,
} as const;

let hasLoggedMissingAdminToken = false;

/**
 * 验证提交时间（防止重放攻击）
 * Must validate NaN before arithmetic: NaN comparisons always return false,
 * allowing an attacker to bypass the time window check with "not-a-date".
 */
function validateSubmissionTime(submittedAt: string, clientIP: string) {
  const ms = new Date(submittedAt).getTime();
  if (!submittedAt || isNaN(ms)) {
    logger.warn("Form submission time validation failed — invalid date", {
      submittedAt,
      clientIP: sanitizeIP(clientIP),
    });
    return SUBMISSION_EXPIRED_RESPONSE;
  }
  const timeDiff = Date.now() - ms;
  if (timeDiff > TEN_MINUTES_MS || timeDiff < ZERO) {
    logger.warn("Form submission time validation failed", {
      submittedAt,
      timeDiff,
      clientIP: sanitizeIP(clientIP),
    });
    return SUBMISSION_EXPIRED_RESPONSE;
  }
  return null;
}

/**
 * 验证表单数据
 * Validate form data
 */
export async function validateFormData(body: unknown, clientIP: string) {
  const validationResult = contactFormWithTokenSchema.safeParse(body);

  if (!validationResult.success) {
    logger.warn("Form validation failed", {
      errors: validationResult.error.issues,
      clientIP: sanitizeIP(clientIP),
    });

    const errorMessages = validationResult.error.issues.map(
      mapZodIssueToErrorKey,
    );

    return {
      success: false,
      error: "Validation failed",
      details: errorMessages,
      data: null,
    };
  }

  const formData = validationResult.data;

  const timeError = validateSubmissionTime(formData.submittedAt, clientIP);
  if (timeError) return timeError;

  // 验证Turnstile token
  const turnstileValid = await verifyTurnstile(
    formData.turnstileToken,
    clientIP,
  );
  if (!turnstileValid) {
    logger.warn("Turnstile verification failed", {
      clientIP: sanitizeIP(clientIP),
    });
    return {
      success: false,
      error: "Security verification failed",
      details: ["Please complete the security check"],
      data: null,
    };
  }

  return {
    success: true,
    error: null,
    details: null,
    data: formData,
  };
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
  const adminToken = process.env.ADMIN_API_TOKEN;

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

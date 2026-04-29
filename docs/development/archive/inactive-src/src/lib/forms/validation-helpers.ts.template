import { type ContactFormData } from "@/lib/form-schema/contact-form-schema";
import { CONTACT_FORM_VALIDATION_CONSTANTS } from "@/config/contact-form-config";
import { COUNT_FIVE, COUNT_TEN, ZERO } from "@/constants";

/**
 * 表单验证错误类型
 * Form validation error types
 */
export interface FormValidationError {
  field: keyof ContactFormData;
  message: string;
}

/**
 * 验证辅助函数
 * Validation helper functions
 */
export const validationHelpers = {
  /**
   * 验证邮箱域名是否在允许列表中
   * Validate if email domain is in allowed list
   */
  isEmailDomainAllowed: (email: string, allowedDomains?: string[]): boolean => {
    if (!allowedDomains || allowedDomains.length === ZERO) return true;

    const parts = email.split("@");
    const [, rawDomain] = parts;
    const domain = rawDomain?.toLowerCase();
    if (!domain) {
      return false;
    }
    return allowedDomains.some((allowed) => domain === allowed.toLowerCase());
  },

  /**
   * 验证是否为垃圾邮件
   * Basic spam detection
   */
  isSpamContent: (message: string): boolean => {
    const spamKeywords = [
      "viagra",
      "casino",
      "lottery",
      "winner",
      "congratulations",
      "click here",
      "free money",
      "make money fast",
      "work from home",
    ];

    const lowerMessage = message.toLowerCase();
    return spamKeywords.some((keyword) => lowerMessage.includes(keyword));
  },

  /**
   * 验证提交频率限制
   * Validate submission rate limiting
   */
  isSubmissionRateLimited: (
    lastSubmission: Date | null,
    cooldownMinutes = CONTACT_FORM_VALIDATION_CONSTANTS.DEFAULT_COOLDOWN_MINUTES,
  ): boolean => {
    if (!lastSubmission) return false;

    const now = new Date();
    const timeDiff = now.getTime() - lastSubmission.getTime();
    const cooldownMs =
      cooldownMinutes *
      CONTACT_FORM_VALIDATION_CONSTANTS.COOLDOWN_TO_MS_MULTIPLIER;

    return timeDiff < cooldownMs;
  },
};

/**
 * 表单验证配置
 * Form validation configuration
 */
export const validationConfig = {
  submissionCooldownMinutes: COUNT_FIVE,
  maxSubmissionsPerHour: COUNT_TEN,
  enableSpamDetection: true,
  allowedEmailDomains: [],
  requiredFields: [
    "firstName",
    "lastName",
    "email",
    "company",
    "message",
    "acceptPrivacy",
  ] as const,
  optionalFields: ["phone", "subject", "marketingConsent", "website"] as const,
  enableHoneypot: true,
  enableCsrfProtection: true,
  enableTurnstile: true,
} as const;

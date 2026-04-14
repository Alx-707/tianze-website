/**
 * 站点配置
 */

import { SINGLE_SITE_CONFIG, type SiteConfig } from "@/config/single-site";

export type { SiteConfig } from "@/config/single-site";

export const SITE_CONFIG = SINGLE_SITE_CONFIG;

/**
 * Default placeholder phone number used when no real number is configured.
 * Shared across layout (floating button gate) and contact page (coming-soon state).
 */
const WHATSAPP_PLACEHOLDER = "+86-518-0000-0000";

/**
 * Check if the WhatsApp number is properly configured (not the default placeholder).
 */
export function isWhatsAppConfigured(
  number: string | undefined = SITE_CONFIG.contact.whatsappNumber,
): boolean {
  return number !== undefined && number !== WHATSAPP_PLACEHOLDER;
}

/**
 * Production placeholder pattern - matches [PLACEHOLDER_NAME] format
 * Used to detect unconfigured values that should be replaced before production
 */
const PLACEHOLDER_PATTERN = /^\[.+\]$/;

/**
 * Check if a value is a placeholder that needs to be configured
 */
export function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERN.test(value);
}

/**
 * Check if the base URL is properly configured for production
 * Returns false if using example.com or localhost in production
 */
export function isBaseUrlConfigured(
  baseUrl: string = SITE_CONFIG.baseUrl,
): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  if (process.env.PLAYWRIGHT_TEST === "true") return true;
  if (process.env.SKIP_ENV_VALIDATION === "true") return true;
  return !baseUrl.includes("example.com") && !baseUrl.includes("localhost");
}

/**
 * Get all unconfigured placeholders in SITE_CONFIG
 * Returns array of { path, value } for each placeholder found
 */
export function getUnconfiguredPlaceholders(
  config: SiteConfig = SITE_CONFIG,
): Array<{
  path: string;
  value: string;
}> {
  const placeholders: Array<{ path: string; value: string }> = [];

  // Check top-level string values
  if (isPlaceholder(config.name)) {
    placeholders.push({ path: "SITE_CONFIG.name", value: config.name });
  }

  // Check SEO config
  if (isPlaceholder(config.seo.defaultTitle)) {
    placeholders.push({
      path: "SITE_CONFIG.seo.defaultTitle",
      value: config.seo.defaultTitle,
    });
  }
  if (config.seo.titleTemplate.includes("[PROJECT_NAME]")) {
    placeholders.push({
      path: "SITE_CONFIG.seo.titleTemplate",
      value: config.seo.titleTemplate,
    });
  }

  // Check social links
  if (isPlaceholder(config.social.twitter)) {
    placeholders.push({
      path: "SITE_CONFIG.social.twitter",
      value: config.social.twitter,
    });
  }
  if (isPlaceholder(config.social.linkedin)) {
    placeholders.push({
      path: "SITE_CONFIG.social.linkedin",
      value: config.social.linkedin,
    });
  }
  if (isPlaceholder(config.social.github)) {
    placeholders.push({
      path: "SITE_CONFIG.social.github",
      value: config.social.github,
    });
  }

  // Check contact info
  if (isPlaceholder(config.contact.email)) {
    placeholders.push({
      path: "SITE_CONFIG.contact.email",
      value: config.contact.email,
    });
  }
  return placeholders;
}

/**
 * Validate site config for production readiness
 * Returns validation result object for build-time checks
 */
export function validateSiteConfig(config: SiteConfig = SITE_CONFIG): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === "production";

  // Check base URL
  if (!isBaseUrlConfigured(config.baseUrl)) {
    const msg = `SITE_CONFIG.baseUrl is not configured for production: ${config.baseUrl}`;
    if (isProduction) {
      errors.push(msg);
    } else {
      warnings.push(msg);
    }
  }

  // Check placeholders
  const placeholders = getUnconfiguredPlaceholders(config);
  for (const { path, value } of placeholders) {
    const msg = `${path} contains placeholder value: ${value}`;
    if (isProduction) {
      errors.push(msg);
    } else {
      warnings.push(msg);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

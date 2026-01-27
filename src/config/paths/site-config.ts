/**
 * 站点配置
 */

export interface SiteConfig {
  baseUrl: string;
  name: string;
  description: string;
  seo: {
    titleTemplate: string;
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
  };
  social: {
    twitter: string;
    linkedin: string;
    github: string;
  };
  contact: {
    phone: string;
    email: string;
    whatsappNumber: string;
  };
}

// 站点配置
export const SITE_CONFIG = {
  baseUrl:
    process.env["NEXT_PUBLIC_BASE_URL"] ||
    process.env["NEXT_PUBLIC_SITE_URL"] ||
    "https://tianze-pipe.com",
  name: "Tianze Pipe",
  description:
    "Pipe Bending Experts - Equipment, Process & Fittings Integrated Solutions",

  // SEO配置
  seo: {
    titleTemplate: "%s | Tianze Pipe - Pipe Bending Experts",
    defaultTitle: "Tianze Pipe - Pipe Bending Experts",
    defaultDescription:
      "Professional PVC pipe bending machinery and pipe fittings manufacturer. Equipment + Process + Fittings integrated solutions for global B2B customers.",
    keywords: [
      "pipe bending machine",
      "PVC pipe bending",
      "pipe bending equipment",
      "PVC conduit",
      "PETG pneumatic tube",
      "pipe fittings",
      "pipe manufacturer China",
      "industrial pipes",
      "Schedule 80 conduit",
      "hospital pneumatic tube system",
    ],
  },

  // 社交媒体链接
  social: {
    twitter: "https://x.com/tianzepipe",
    linkedin: "https://www.linkedin.com/company/tianze-pipe",
    github: "https://github.com/tianze-pipe",
  },

  // 联系信息
  contact: {
    phone: "+86-518-0000-0000",
    email: "sales@tianze-pipe.com",
    whatsappNumber:
      process.env["NEXT_PUBLIC_WHATSAPP_NUMBER"] || "+86-518-0000-0000",
  },
} as const satisfies SiteConfig;

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

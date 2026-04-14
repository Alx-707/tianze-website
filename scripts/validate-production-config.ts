#!/usr/bin/env tsx
/**
 * Production Configuration Validation Script
 *
 * Validates site configuration for production readiness and, when running in
 * production mode, enforces the runtime environment contract for the shipped
 * lead/security path.
 *
 * Usage: pnpm validate:config
 */
import { pathToFileURL } from "node:url";
import { CONTACT_FORM_CONFIG } from "../src/config/contact-form-config";
import { validateSiteConfig } from "../src/config/paths/site-config";

const MIN_SECRET_LENGTH = 32;

export interface ValidationReport {
  warnings: string[];
  errors: string[];
}

type EnvMap = NodeJS.ProcessEnv;

function readEnv(env: EnvMap, key: string): string | undefined {
  const value = env[key];
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function hasPair(env: EnvMap, firstKey: string, secondKey: string): boolean {
  return Boolean(readEnv(env, firstKey) && readEnv(env, secondKey));
}

function hasAny(env: EnvMap, ...keys: string[]): boolean {
  return keys.some((key) => Boolean(readEnv(env, key)));
}

function isTrue(env: EnvMap, key: string): boolean {
  return readEnv(env, key) === "true";
}

function validateRequiredEnv(
  target: string[],
  env: EnvMap,
  key: string,
  reason: string,
): void {
  if (!readEnv(env, key)) {
    target.push(`${key} is required (${reason}).`);
  }
}

function validateMinLengthEnv(
  target: string[],
  env: EnvMap,
  key: string,
  minLength: number,
  reason: string,
): void {
  const value = readEnv(env, key);
  if (!value) {
    target.push(`${key} is required (${reason}).`);
  } else if (value.length < minLength) {
    target.push(
      `${key} must be at least ${minLength} characters long (${reason}). Current length: ${value.length}`,
    );
  }
}

export function shouldValidateProductionRuntimeContract(env: EnvMap): boolean {
  const appEnv = readEnv(env, "APP_ENV")?.toLowerCase();

  if (isTrue(env, "ENFORCE_RUNTIME_CONTRACT")) {
    return true;
  }

  if (appEnv === "preview") {
    return false;
  }

  if (appEnv === "production") {
    return true;
  }

  // Check if this is production environment
  const nodeEnv = readEnv(env, "NODE_ENV")?.toLowerCase();
  const isProduction = nodeEnv === "production";

  // Check if running in Cloudflare Workers runtime (indicates production deployment)
  const isCloudflareProduction =
    isProduction &&
    hasAny(env, "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN");

  return isProduction || isCloudflareProduction;
}

export function validateProductionRuntimeContract(
  env: EnvMap,
): ValidationReport {
  const warnings: string[] = [];
  const errors: string[] = [];

  const hasUpstash = hasPair(
    env,
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
  );
  const hasKv = hasPair(env, "KV_REST_API_URL", "KV_REST_API_TOKEN");

  // SIMPLIFIED: No intermediate allow branch. If no Redis/KV, error immediately.
  if (!hasUpstash && !hasKv) {
    errors.push(
      "Production rate limiting and idempotency require Upstash Redis or Vercel KV. Configure at least one store.",
    );
  } else if (!hasUpstash && hasKv) {
    errors.push(
      "KV-only rate limiting is not allowed in production. Configure Upstash Redis for the shared security stores or remove the KV-only setup.",
    );
  }

  validateMinLengthEnv(
    errors,
    env,
    "RATE_LIMIT_PEPPER",
    MIN_SECRET_LENGTH,
    "production rate-limit keys rely on it and runtime already throws when it is missing or weak",
  );
  validateMinLengthEnv(
    errors,
    env,
    "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY",
    MIN_SECRET_LENGTH,
    "Server Actions deployment requires a stable encryption key",
  );

  if (CONTACT_FORM_CONFIG.features.enableTurnstile) {
    validateRequiredEnv(
      errors,
      env,
      "TURNSTILE_SECRET_KEY",
      "Contact form verification depends on server-side Turnstile validation",
    );
    validateRequiredEnv(
      errors,
      env,
      "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
      "the live Contact form widget depends on a public Turnstile site key",
    );
  }

  validateRequiredEnv(
    errors,
    env,
    "RESEND_API_KEY",
    "the shipped lead pipeline sends admin notification email through Resend",
  );
  validateRequiredEnv(
    errors,
    env,
    "AIRTABLE_API_KEY",
    "the shipped lead pipeline persists lead records in Airtable",
  );
  validateRequiredEnv(
    errors,
    env,
    "AIRTABLE_BASE_ID",
    "the shipped lead pipeline persists lead records in Airtable",
  );

  // ENFORCED: Degraded flags are never allowed in production.
  if (hasAny(env, "ALLOW_MEMORY_RATE_LIMIT", "ALLOW_MEMORY_IDEMPOTENCY")) {
    errors.push(
      "Degraded in-memory store flags (ALLOW_MEMORY_RATE_LIMIT, ALLOW_MEMORY_IDEMPOTENCY) cannot be used in production. " +
        "Configure Upstash Redis or Vercel KV for production deployments.",
    );
  }

  return { warnings, errors };
}

export function validateProductionConfig(
  env: EnvMap = process.env,
): ValidationReport & { runtimeContractChecked: boolean } {
  const siteConfig = validateSiteConfig();
  const runtimeContractChecked = shouldValidateProductionRuntimeContract(env);
  const runtimeContract = runtimeContractChecked
    ? validateProductionRuntimeContract(env)
    : { warnings: [], errors: [] };

  return {
    warnings: [...siteConfig.warnings, ...runtimeContract.warnings],
    errors: [...siteConfig.errors, ...runtimeContract.errors],
    runtimeContractChecked,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const report = validateProductionConfig(process.env);

  if (report.warnings.length > 0) {
    console.warn("⚠️  Warnings:");
    report.warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (report.errors.length > 0) {
    console.error("❌ Errors:");
    report.errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log("✅ Production configuration validated successfully.");
  if (report.runtimeContractChecked) {
    console.log("   Runtime contract enforced.");
  }
}

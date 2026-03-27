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
    target.push(`${key} is required: ${reason}`);
  }
}

function validateMinLengthEnv(
  errors: string[],
  env: EnvMap,
  key: string,
  minLength: number,
  reason: string,
): void {
  const value = readEnv(env, key);
  if (!value) {
    errors.push(`${key} is required: ${reason}`);
    return;
  }

  if (value.length < minLength) {
    errors.push(`${key} must be at least ${minLength} characters: ${reason}`);
  }
}

function validatePairCompleteness(
  errors: string[],
  env: EnvMap,
  firstKey: string,
  secondKey: string,
  label: string,
): void {
  const first = readEnv(env, firstKey);
  const second = readEnv(env, secondKey);

  if ((first && !second) || (!first && second)) {
    errors.push(
      `${label} must be configured as a complete pair (${firstKey} + ${secondKey}) or left unset.`,
    );
  }
}

export function shouldValidateProductionRuntimeContract(
  env: EnvMap = process.env,
): boolean {
  return readEnv(env, "NODE_ENV") === "production";
}

export function validateProductionRuntimeContract(
  env: EnvMap = process.env,
): ValidationReport {
  const warnings: string[] = [];
  const errors: string[] = [];

  validatePairCompleteness(
    errors,
    env,
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "Upstash Redis",
  );
  validatePairCompleteness(
    errors,
    env,
    "KV_REST_API_URL",
    "KV_REST_API_TOKEN",
    "Vercel KV",
  );

  const hasUpstash = hasPair(
    env,
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
  );
  const hasKv = hasPair(env, "KV_REST_API_URL", "KV_REST_API_TOKEN");
  const allowMemoryRateLimit = isTrue(env, "ALLOW_MEMORY_RATE_LIMIT");
  const allowMemoryIdempotency = isTrue(env, "ALLOW_MEMORY_IDEMPOTENCY");

  if (!hasUpstash) {
    if (hasKv) {
      errors.push(
        "KV-only rate limiting is not allowed in production. Configure Upstash Redis for the shared security stores or remove the KV-only setup.",
      );
    } else if (!allowMemoryRateLimit) {
      errors.push(
        "Production rate limiting requires Upstash Redis or an explicit degraded override via ALLOW_MEMORY_RATE_LIMIT=true.",
      );
    } else {
      warnings.push(
        "ALLOW_MEMORY_RATE_LIMIT=true enables degraded in-memory rate limiting in production.",
      );
    }

    if (!allowMemoryIdempotency) {
      errors.push(
        "Production idempotency requires Upstash Redis or an explicit degraded override via ALLOW_MEMORY_IDEMPOTENCY=true.",
      );
    } else {
      warnings.push(
        "ALLOW_MEMORY_IDEMPOTENCY=true enables degraded in-memory idempotency in production.",
      );
    }
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

  if (hasAny(env, "ALLOW_MEMORY_RATE_LIMIT", "ALLOW_MEMORY_IDEMPOTENCY")) {
    warnings.push(
      "Explicit degraded store overrides are configured. Keep them only if this release intentionally accepts reduced protection durability.",
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

  // CI tests code quality, not deployment readiness.
  // Runtime contract errors are downgraded to warnings so builds can proceed.
  const isCi = isTrue(env, "CI");
  const runtimeErrors = isCi ? [] : runtimeContract.errors;
  const runtimeWarnings = isCi
    ? [...runtimeContract.warnings, ...runtimeContract.errors]
    : runtimeContract.warnings;

  return {
    warnings: [...siteConfig.warnings, ...runtimeWarnings],
    errors: [...siteConfig.errors, ...runtimeErrors],
    runtimeContractChecked,
  };
}

async function main(): Promise<void> {
  console.log("Validating production configuration...\n");

  const result = validateProductionConfig();

  if (!result.runtimeContractChecked) {
    console.log(
      "Skipping strict runtime env contract because NODE_ENV is not production.\n",
    );
  }

  if (result.warnings.length > 0) {
    console.warn("Warnings:");
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    console.log();
  }

  if (result.errors.length > 0) {
    console.error("Production config validation failed:");
    result.errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  console.log("Production config validation passed");
  process.exit(0);
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  main().catch((error: unknown) => {
    console.error("Validation script failed:", error);
    process.exit(1);
  });
}

/**
 * Turnstile Verification
 *
 * Shared Cloudflare Turnstile verification logic.
 * Used by API routes, Server Actions, and other consumers.
 */

import { env } from "@/lib/env";
import { logger, sanitizeIP } from "@/lib/logger";
import {
  getAllowedTurnstileHosts,
  getExpectedTurnstileAction,
  isAllowedTurnstileAction,
  isAllowedTurnstileHostname,
} from "@/lib/security/turnstile-config";

interface TurnstileVerificationResult {
  success: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
}

function buildTurnstilePayload(
  token: string,
  ip: string,
  secretKey: string,
): URLSearchParams {
  const payload = new URLSearchParams({
    secret: secretKey,
    response: token,
  });

  if (ip && ip !== "unknown") {
    payload.set("remoteip", ip);
  }

  return payload;
}

async function requestTurnstileVerification(
  payload: URLSearchParams,
): Promise<TurnstileVerificationResult> {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Turnstile API returned ${response.status}: ${response.statusText}`,
    );
  }

  return response.json();
}

function validateTurnstileHostnameResponse(
  result: TurnstileVerificationResult,
  ip: string,
): boolean {
  if (isAllowedTurnstileHostname(result.hostname)) {
    return true;
  }

  logger.warn("Turnstile verification rejected due to unexpected hostname", {
    hostname: result.hostname,
    allowed: getAllowedTurnstileHosts(),
    ip: sanitizeIP(ip),
  });
  return false;
}

function validateTurnstileActionResponse(
  result: TurnstileVerificationResult,
  ip: string,
): boolean {
  if (isAllowedTurnstileAction(result.action)) {
    return true;
  }

  const expectedAction = getExpectedTurnstileAction();
  logger.warn("Turnstile verification rejected due to mismatched action", {
    action: result.action,
    expectedAction,
    ip: sanitizeIP(ip),
  });
  return false;
}

function shouldBypassTurnstile(ip: string): boolean {
  const isDevelopment = env.NODE_ENV === "development";
  const isBypassEnabled = process.env.TURNSTILE_BYPASS === "true";

  if (isDevelopment && isBypassEnabled) {
    logger.warn("[DEV] Turnstile verification bypassed", {
      ip: sanitizeIP(ip),
    });
    return true;
  }
  return false;
}

function handleTurnstileFailure(
  result: TurnstileVerificationResult,
  ip: string,
): { success: false; errorCodes?: string[] } {
  logger.warn("Turnstile verification failed:", {
    errorCodes: result["error-codes"],
    clientIP: sanitizeIP(ip),
  });
  const errorCodes = result["error-codes"];
  return errorCodes ? { success: false, errorCodes } : { success: false };
}

/**
 * Verify a Turnstile token (returns boolean).
 */
export async function verifyTurnstile(
  token: string,
  ip: string,
): Promise<boolean> {
  const result = await verifyTurnstileDetailed(token, ip);
  return result.success;
}

/**
 * Verify a Turnstile token with detailed result.
 */
export async function verifyTurnstileDetailed(
  token: string,
  ip: string,
): Promise<{ success: boolean; errorCodes?: string[] }> {
  try {
    if (shouldBypassTurnstile(ip)) {
      return { success: true };
    }

    const secretKey = env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      logger.warn("Turnstile secret key not configured");
      return { success: false, errorCodes: ["not-configured"] };
    }

    const payload = buildTurnstilePayload(token, ip, secretKey);
    const result = await requestTurnstileVerification(payload);

    if (!result.success) {
      return handleTurnstileFailure(result, ip);
    }

    if (!validateTurnstileHostnameResponse(result, ip)) {
      return { success: false, errorCodes: ["invalid-hostname"] };
    }

    if (!validateTurnstileActionResponse(result, ip)) {
      return { success: false, errorCodes: ["invalid-action"] };
    }

    logger.info("Turnstile verification attempt", {
      success: true,
      hostname: result.hostname,
      clientIP: sanitizeIP(ip),
    });

    return { success: true };
  } catch (error) {
    logger.error("Turnstile verification error", { error, ip: sanitizeIP(ip) });
    throw error;
  }
}

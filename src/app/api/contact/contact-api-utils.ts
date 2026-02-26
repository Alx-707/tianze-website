/**
 * 联系表单API工具函数
 * Contact form API utility functions
 */

import { env } from "@/lib/env";
import { logger, sanitizeIP } from "@/lib/logger";
import {
  getAllowedTurnstileHosts,
  getExpectedTurnstileAction,
  isAllowedTurnstileAction,
  isAllowedTurnstileHostname,
} from "@/lib/security/turnstile-config";
import { COUNT_PAIR, SHORT_ID_LENGTH, BASE36_RADIX, ZERO } from "@/constants";

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

/**
 * Check if Turnstile verification should be bypassed (development mode only)
 */
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

/**
 * 验证Turnstile token
 * Verify Turnstile token
 */
export async function verifyTurnstile(
  token: string,
  ip: string,
): Promise<boolean> {
  const result = await verifyTurnstileDetailed(token, ip);
  return result.success;
}

/**
 * Handle Turnstile verification failure
 */
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
 * 验证Turnstile令牌（详细结果）
 * Verify Turnstile token with detailed result
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

    // Log successful verification
    logger.info("Turnstile verification attempt", {
      success: true,
      hostname: result.hostname,
      clientIP: sanitizeIP(ip),
    });

    return { success: true };
  } catch (error) {
    logger.error("Turnstile verification error", { error, ip: sanitizeIP(ip) });
    throw error; // Re-throw to let caller handle 500 errors
  }
}

/**
 * 验证环境变量配置
 * Validate environment variables
 */
export function validateEnvironmentConfig(): {
  isValid: boolean;
  missingVars: string[];
} {
  // 使用受限白名单映射，避免对 process.env 的动态键访问
  const envMap = {
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  };

  const missingVars: string[] = [];
  if (!envMap.TURNSTILE_SECRET_KEY) missingVars.push("TURNSTILE_SECRET_KEY");
  if (!envMap.RESEND_API_KEY) missingVars.push("RESEND_API_KEY");
  if (!envMap.AIRTABLE_API_KEY) missingVars.push("AIRTABLE_API_KEY");
  if (!envMap.AIRTABLE_BASE_ID) missingVars.push("AIRTABLE_BASE_ID");

  return {
    isValid: missingVars.length === ZERO,
    missingVars,
  };
}

/**
 * 生成请求ID用于日志追踪
 * Generate request ID for log tracing
 */
export function generateRequestId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `req_${crypto.randomUUID().replaceAll("-", "")}`;
  }

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const buffer = new Uint32Array(SHORT_ID_LENGTH);
    crypto.getRandomValues(buffer);
    const randomPart = Array.from(buffer, (value) =>
      value.toString(BASE36_RADIX).padStart(COUNT_PAIR, "0"),
    ).join("");
    return `req_${randomPart}`;
  }

  throw new Error("Secure random generator unavailable for request id");
}

/**
 * 格式化错误响应
 * Format error response
 */
export function formatErrorResponse(
  message: string,
  statusCode: number,
  details?: Record<string, unknown>,
): {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  details?: Record<string, unknown>;
} {
  const response: {
    error: string;
    message: string;
    statusCode: number;
    timestamp: string;
    details?: Record<string, unknown>;
  } = {
    error: "ContactFormError",
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  if (details) {
    response.details = details;
  }

  return response;
}

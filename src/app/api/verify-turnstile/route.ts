import { NextRequest, NextResponse } from "next/server";
import {
  createApiErrorResponse,
  createApiSuccessResponse,
} from "@/lib/api/api-response";
import { safeParseJson } from "@/lib/api/safe-parse-json";
import { env } from "@/lib/env";
import { logger, sanitizeIP } from "@/lib/logger";
import { getClientIP } from "@/lib/security/client-ip";
import { verifyTurnstileDetailed } from "@/app/api/contact/contact-api-utils";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR, HTTP_OK } from "@/constants";

/**
 * Request body interface for Turnstile verification.
 *
 * SECURITY NOTE: Client IP is intentionally NOT accepted from request body.
 * The server MUST derive the client IP from trusted request headers
 * (X-Forwarded-For, X-Real-IP) to prevent IP spoofing attacks that could
 * bypass Turnstile's risk analysis.
 */
interface TurnstileVerificationRequest {
  token: string;
}

/**
 * Validate request body
 */
function validateRequestBody(body: TurnstileVerificationRequest) {
  if (!body.token) {
    return createApiErrorResponse(
      API_ERROR_CODES.TURNSTILE_MISSING_TOKEN,
      HTTP_BAD_REQUEST,
    );
  }
  return null;
}

/**
 * Create verification error response
 */
function createVerificationErrorResponse() {
  return createApiErrorResponse(
    API_ERROR_CODES.TURNSTILE_VERIFICATION_FAILED,
    HTTP_BAD_REQUEST,
  );
}

/**
 * Create network error response
 */
function createNetworkErrorResponse(verifyError: Error, clientIP: string) {
  logger.error("Turnstile verification request failed", {
    error: verifyError,
    clientIP: sanitizeIP(clientIP),
  });
  return createApiErrorResponse(
    API_ERROR_CODES.TURNSTILE_NETWORK_ERROR,
    HTTP_INTERNAL_ERROR,
  );
}

/**
 * Check if Turnstile is configured
 */
function checkTurnstileConfigured(): NextResponse | null {
  if (!env.TURNSTILE_SECRET_KEY) {
    return createApiErrorResponse(
      API_ERROR_CODES.TURNSTILE_NOT_CONFIGURED,
      HTTP_INTERNAL_ERROR,
    );
  }
  return null;
}

/**
 * Verify Cloudflare Turnstile token
 *
 * This endpoint verifies the Turnstile token on the server side
 * to ensure the user has passed the bot protection challenge.
 * Uses the shared verifyTurnstile function for consistency.
 */
export async function POST(request: NextRequest) {
  try {
    const configError = checkTurnstileConfigured();
    if (configError) return configError;

    const parsedBody = await safeParseJson<TurnstileVerificationRequest>(
      request,
      { route: "/api/verify-turnstile" },
    );
    if (!parsedBody.ok) {
      return createApiErrorResponse(
        API_ERROR_CODES.INVALID_JSON_BODY,
        HTTP_BAD_REQUEST,
      );
    }

    const validationError = validateRequestBody(parsedBody.data);
    if (validationError) return validationError;

    // SECURITY: Always use server-derived IP - never trust client-provided IP
    const clientIP = getClientIP(request);

    let verificationResult: { success: boolean; errorCodes?: string[] };
    try {
      verificationResult = await verifyTurnstileDetailed(
        parsedBody.data.token,
        clientIP,
      );
    } catch (verifyError) {
      return createNetworkErrorResponse(verifyError as Error, clientIP);
    }

    if (!verificationResult.success) {
      return createVerificationErrorResponse();
    }

    return createApiSuccessResponse({ verified: true }, HTTP_OK);
  } catch (error) {
    logger.error("Error verifying Turnstile token", { error: error as Error });
    return createApiErrorResponse(
      API_ERROR_CODES.INTERNAL_SERVER_ERROR,
      HTTP_INTERNAL_ERROR,
    );
  }
}

/**
 * Handle GET requests (for health checks)
 */
export function GET() {
  const isConfigured = Boolean(env.TURNSTILE_SECRET_KEY);

  return createApiSuccessResponse(
    {
      status: "Turnstile verification endpoint active",
      configured: isConfigured,
      timestamp: new Date().toISOString(),
    },
    HTTP_OK,
  );
}

/**
 * Only allow POST and GET methods
 */
export function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "POST, GET, OPTIONS",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

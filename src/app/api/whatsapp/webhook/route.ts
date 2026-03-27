import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import { createApiErrorResponse } from "@/lib/api/api-response";
import {
  checkDistributedRateLimit,
  createRateLimitHeaders,
} from "@/lib/security/distributed-rate-limit";
import { getIPKey } from "@/lib/security/rate-limit-key-strategies";
import {
  handleIncomingMessage,
  verifyWebhook,
  verifyWebhookSignature,
} from "@/lib/whatsapp-service";
import {
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_ERROR,
  HTTP_PAYLOAD_TOO_LARGE,
  HTTP_SERVICE_UNAVAILABLE,
  HTTP_TOO_MANY_REQUESTS,
  HTTP_UNAUTHORIZED,
} from "@/constants";

/**
 * WhatsApp Webhook Endpoint
 *
 * Handles Meta webhook verification (GET) and incoming messages (POST).
 * Uses unified whatsapp-service for all operations.
 *
 * Execution order (security-critical):
 *   1. Body size check  — prevents resource exhaustion before any work
 *   2. Rate limit check — limits request volume before reading body
 *   3. Read body        — now safe to read (within limits, not rate-limited)
 *   4. Signature verify — validates body integrity
 *   5. Process message  — business logic
 */

const MAX_BODY_BYTES = 1_000_000; // 1 MB
const HTTP_FORBIDDEN = 403;

function createWebhookRateLimitResponse(
  rateLimitResult: Awaited<ReturnType<typeof checkDistributedRateLimit>>,
) {
  const headers = createRateLimitHeaders(rateLimitResult);
  const isStorageFailure = rateLimitResult.deniedReason === "storage_failure";
  const status = isStorageFailure
    ? HTTP_SERVICE_UNAVAILABLE
    : HTTP_TOO_MANY_REQUESTS;

  return NextResponse.json(
    {
      success: false,
      errorCode: isStorageFailure
        ? API_ERROR_CODES.SERVICE_UNAVAILABLE
        : API_ERROR_CODES.RATE_LIMIT_EXCEEDED,
    },
    { status, headers },
  );
}

function getUtf8ByteLength(text: string): number {
  // Buffer.byteLength avoids allocating a full byte array; keep a fallback for edge-like runtimes.
  if (typeof Buffer !== "undefined") return Buffer.byteLength(text, "utf8");
  return new TextEncoder().encode(text).length;
}

// GET: Webhook verification
export async function GET(request: NextRequest) {
  try {
    const rateLimitKey = getIPKey(request);
    const rateLimitResult = await checkDistributedRateLimit(
      rateLimitKey,
      "whatsapp",
    );
    if (!rateLimitResult.allowed) {
      return createWebhookRateLimitResponse(rateLimitResult);
    }

    if (rateLimitResult.degraded) {
      logger.warn(
        "[WhatsAppWebhook] Verification rate limit storage degraded (fail-open) — proceeding without enforcement",
        {
          rateLimitKey,
        },
      );
    }

    const { searchParams } = request.nextUrl;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (!mode || !token || !challenge) {
      return createApiErrorResponse(
        API_ERROR_CODES.INVALID_REQUEST,
        HTTP_BAD_REQUEST,
      );
    }

    const verificationResult = verifyWebhook(mode, token, challenge);

    if (verificationResult) {
      return new NextResponse(verificationResult, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    return createApiErrorResponse(API_ERROR_CODES.FORBIDDEN, HTTP_FORBIDDEN);
  } catch (error) {
    logger.error(
      "WhatsApp webhook verification error",
      {},
      error instanceof Error ? error : new Error(String(error)),
    );
    return createApiErrorResponse(
      API_ERROR_CODES.INTERNAL_SERVER_ERROR,
      HTTP_INTERNAL_ERROR,
    );
  }
}

// POST: Receive incoming messages
// eslint-disable-next-line max-statements -- Sequential security gates (size→rate→signature→parse→handle) require multiple statements
export async function POST(request: NextRequest) {
  try {
    // 1. Body size check — reject oversized payloads before reading body
    const contentLength = request.headers.get("content-length");
    if (
      contentLength !== null &&
      parseInt(contentLength, 10) > MAX_BODY_BYTES
    ) {
      return createApiErrorResponse(
        API_ERROR_CODES.PAYLOAD_TOO_LARGE,
        HTTP_PAYLOAD_TOO_LARGE,
      );
    }

    // 2. Rate limiting — consume quota before reading body to prevent exhaustion
    const rateLimitKey = getIPKey(request);
    const rateLimitResult = await checkDistributedRateLimit(
      rateLimitKey,
      "whatsapp",
    );
    if (!rateLimitResult.allowed) {
      const headers = createRateLimitHeaders(rateLimitResult);
      const status =
        rateLimitResult.deniedReason === "storage_failure"
          ? HTTP_SERVICE_UNAVAILABLE
          : HTTP_TOO_MANY_REQUESTS;
      return NextResponse.json(
        {
          success: false,
          errorCode:
            rateLimitResult.deniedReason === "storage_failure"
              ? API_ERROR_CODES.SERVICE_UNAVAILABLE
              : API_ERROR_CODES.RATE_LIMIT_EXCEEDED,
        },
        { status, headers },
      );
    }

    // Degraded rate limit: storage failure triggered fail-open — log for observability.
    // The whatsapp preset is fail-open so requests are allowed; this matches withRateLimit HOF behavior.
    if (rateLimitResult.degraded) {
      logger.warn(
        "[WhatsAppWebhook] Rate limit storage degraded (fail-open) — proceeding without enforcement",
        {
          rateLimitKey,
        },
      );
    }

    // 3. Read body — safe now (rate limited); verify actual size
    const rawBody = await request.text();
    if (getUtf8ByteLength(rawBody) > MAX_BODY_BYTES) {
      return createApiErrorResponse(
        API_ERROR_CODES.PAYLOAD_TOO_LARGE,
        HTTP_PAYLOAD_TOO_LARGE,
      );
    }
    const signature = request.headers.get("x-hub-signature-256");

    // 4. Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      logger.warn("[WhatsAppWebhook] Invalid signature");
      return createApiErrorResponse(
        API_ERROR_CODES.UNAUTHORIZED,
        HTTP_UNAUTHORIZED,
      );
    }

    // 5. Parse JSON body
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return createApiErrorResponse(
        API_ERROR_CODES.INVALID_JSON_BODY,
        HTTP_BAD_REQUEST,
      );
    }

    // 6. Handle incoming message with auto-reply
    await handleIncomingMessage(body);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error(
      "WhatsApp webhook message handling error",
      {},
      error instanceof Error ? error : new Error(String(error)),
    );
    return createApiErrorResponse(
      API_ERROR_CODES.INTERNAL_SERVER_ERROR,
      HTTP_INTERNAL_ERROR,
    );
  }
}

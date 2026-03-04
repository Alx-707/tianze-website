import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
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
import { HTTP_PAYLOAD_TOO_LARGE } from "@/constants";

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

// GET: Webhook verification
export function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (!mode || !token || !challenge) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const verificationResult = verifyWebhook(mode, token, challenge);

    if (verificationResult) {
      return new NextResponse(verificationResult, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 403 },
    );
  } catch (error) {
    logger.error(
      "WhatsApp webhook verification error",
      {},
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
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
      return NextResponse.json(
        { error: "Payload too large" },
        { status: HTTP_PAYLOAD_TOO_LARGE },
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
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers },
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
    if (rawBody.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: HTTP_PAYLOAD_TOO_LARGE },
      );
    }
    const signature = request.headers.get("x-hub-signature-256");

    // 4. Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      logger.warn("[WhatsAppWebhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 5. Parse JSON body
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
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
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 },
    );
  }
}

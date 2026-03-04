/**
 * Idempotency Protection Tests (Red)
 *
 * Tests for security properties that the current in-memory Map
 * implementation does NOT satisfy:
 * - TOCTOU concurrency (no lock)
 * - Key semantic binding (key not tied to method/path)
 * - Persistence across process restarts (in-memory only)
 */

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HTTP_OK } from "@/constants";

import { clearAllIdempotencyKeys, withIdempotency } from "../idempotency";

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

function createRequest(
  method: string,
  path: string,
  idempotencyKey?: string,
): NextRequest {
  const url = `http://localhost:3000${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  return new NextRequest(url, { method, headers });
}

describe("idempotency security properties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllIdempotencyKeys();
  });

  afterEach(() => {
    clearAllIdempotencyKeys();
  });

  // =========================================================================
  // 1. TOCTOU Concurrency Test (Red)
  // =========================================================================
  describe("TOCTOU concurrency protection", () => {
    it("should execute business logic only once for duplicate concurrent requests", async () => {
      const executionCount = { value: 0 };
      const idempotencyKey = "concurrent-test-key-1";

      const request1 = createRequest("POST", "/api/contact", idempotencyKey);
      const request2 = createRequest("POST", "/api/contact", idempotencyKey);

      const handler = async () => {
        executionCount.value += 1;
        // Simulate async work to widen the race window
        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });
        return { success: true, executionId: executionCount.value };
      };

      // Fire both requests concurrently
      const [response1, response2] = await Promise.all([
        withIdempotency(request1, handler),
        withIdempotency(request2, handler),
      ]);

      // Both should succeed
      expect(response1.status).toBe(HTTP_OK);
      expect(response2.status).toBe(HTTP_OK);

      // Business logic should only execute ONCE — the second request
      // should get the cached result. Without a lock, both may execute.
      expect(executionCount.value).toBe(1);
    });
  });

  // =========================================================================
  // 2. Key Semantic Binding Test (Red)
  // =========================================================================
  describe("key semantic binding", () => {
    it("should reject same idempotency key used for different method/path", async () => {
      const sharedKey = "semantic-binding-key-1";

      // First: POST /api/contact with this key
      const request1 = createRequest("POST", "/api/contact", sharedKey);
      const response1 = await withIdempotency(request1, async () => ({
        action: "contact",
      }));
      expect(response1.status).toBe(HTTP_OK);

      // Second: POST /api/subscribe with the SAME key — should be rejected
      // because the key was originally used for a different endpoint.
      // Current implementation does not bind key to method/path.
      const request2 = createRequest("POST", "/api/subscribe", sharedKey);
      const response2 = await withIdempotency(request2, async () => ({
        action: "subscribe",
      }));

      // The response should indicate a conflict (e.g., 409 or 422),
      // not silently return the cached /api/contact result.
      const data = (await response2.json()) as Record<string, unknown>;
      expect(response2.status).not.toBe(HTTP_OK);
      expect(data).toHaveProperty("error");
    });
  });

  // =========================================================================
  // 3. Persistence Test (Red)
  // =========================================================================
  describe("persistence across restarts", () => {
    it("should recognize previously used key after cache clear (simulated restart)", async () => {
      const key = "persistence-test-key-1";

      // First request succeeds and caches
      const request1 = createRequest("POST", "/api/contact", key);
      await withIdempotency(request1, async () => ({ success: true }));

      // Simulate process restart by clearing the in-memory Map
      clearAllIdempotencyKeys();

      // Second request with same key should still return cached result
      // (from persistent storage), not re-execute business logic.
      const executionCount = { value: 0 };
      const request2 = createRequest("POST", "/api/contact", key);
      const response2 = await withIdempotency(request2, async () => {
        executionCount.value += 1;
        return { success: true, reExecuted: true };
      });

      const data = (await response2.json()) as Record<string, unknown>;

      // If key was persisted, handler should NOT execute again.
      // With in-memory Map, the key is lost and handler re-executes.
      expect(executionCount.value).toBe(0);
      expect(data).not.toHaveProperty("reExecuted");
    });
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanupSlidingWindow,
  getRateLimitStatus,
  rateLimit,
  rateLimitWithTier,
  resetRateLimit,
  slidingWindowRateLimit,
} from "@/lib/security-rate-limit";

describe("security-rate-limit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resets window after expiry", () => {
    vi.useFakeTimers();
    const id = "user-reset-window";

    expect(rateLimit(id, 2, 1000)).toBe(true);
    expect(rateLimit(id, 2, 1000)).toBe(true);
    expect(rateLimit(id, 2, 1000)).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(rateLimit(id, 2, 1000)).toBe(true);
  });

  it("provides remaining quota in status", () => {
    const id = "user-status";
    resetRateLimit(id);
    expect(rateLimit(id, 3, 5000)).toBe(true);
    expect(rateLimit(id, 3, 5000)).toBe(true);

    const status = getRateLimitStatus(id);
    expect(status.remaining).toBe(8); // uses default max (10) internally
    expect(status.isLimited).toBe(false);

    for (let i = 0; i < 8; i++) {
      rateLimit(id);
    }

    const limited = getRateLimitStatus(id);
    expect(limited.isLimited).toBe(true);

    resetRateLimit(id);
  });

  it("supports predefined tiers", () => {
    const id = "user-tier";
    for (let i = 0; i < 5; i++) {
      expect(rateLimitWithTier(id, "strict")).toBe(true);
    }
    expect(rateLimitWithTier(id, "strict")).toBe(false);
  });

  it("enforces sliding window limits and recovers after cleanup", () => {
    vi.useFakeTimers();
    const id = "sliding-user";

    expect(slidingWindowRateLimit(id, 2, 1000)).toBe(true);
    expect(slidingWindowRateLimit(id, 2, 1000)).toBe(true);
    expect(slidingWindowRateLimit(id, 2, 1000)).toBe(false);

    vi.advanceTimersByTime(2001);
    cleanupSlidingWindow();

    expect(slidingWindowRateLimit(id, 2, 1000)).toBe(true);
  });
});

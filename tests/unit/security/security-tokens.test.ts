import { describe, expect, it, vi } from "vitest";
import {
  createTokenWithExpiry,
  generateApiKey,
  generateCsrfToken,
  generateOTP,
  generateSecureToken,
  generateSessionToken,
  generateUUID,
  generateVerificationCode,
  isTokenExpired,
  isValidToken,
  isValidUUID,
} from "@/lib/security-tokens";

describe("security-tokens", () => {
  it("generates tokens/uuids with expected format", () => {
    expect(generateSecureToken(32)).toMatch(/^[a-f0-9]{32}$/);
    expect(generateSessionToken()).toHaveLength(64);
    expect(generateCsrfToken()).toHaveLength(32);
    expect(generateApiKey("sk")).toMatch(/^sk_[a-f0-9]{48}$/);
    expect(isValidUUID(generateUUID())).toBe(true);
  });

  it("creates numeric OTP and alphanumeric verification codes", () => {
    const otp = generateOTP(6);
    expect(otp).toMatch(/^\d{6}$/);

    const code = generateVerificationCode(8);
    expect(code).toMatch(/^[A-Z0-9]{8}$/);
    expect(isValidToken(code)).toBe(true);
  });

  it("tracks expiration metadata", () => {
    vi.useFakeTimers();
    const tokenWithExpiry = createTokenWithExpiry(16, 1); // 1 minute
    expect(tokenWithExpiry.token).toHaveLength(16);
    expect(isTokenExpired(tokenWithExpiry)).toBe(false);

    vi.advanceTimersByTime(60_000 + 1);
    expect(isTokenExpired(tokenWithExpiry)).toBe(true);
    vi.useRealTimers();
  });
});

import {
  HEX_MASK_6_BITS,
  HEX_MASK_BIT_6,
  HEX_MASK_HIGH_BIT,
  HEX_MASK_LOW_NIBBLE,
  VERIFY_CODE_DEFAULT_LENGTH,
  HEX_RADIX,
  TOKEN_DEFAULT_LENGTH,
  API_KEY_TOKEN_LENGTH,
  SESSION_TOKEN_LENGTH,
  ZERO,
} from "@/constants";
import { COUNT_TWO, OTP_DEFAULT_LENGTH } from "@/constants/count";
import { MINUTES_PER_HOUR, MINUTE_MS } from "@/constants/time";

// UUID v4 constants (RFC 4122)
const UUID_BYTE_LENGTH = 16;
const UUID_VERSION_BYTE = 6;
const UUID_VARIANT_BYTE = 8;
// Standard 8-4-4-4-12 hex format segment boundaries
const UUID_SEG_1_END = 8;
const UUID_SEG_2_END = 12;
const UUID_SEG_3_END = 16;
const UUID_SEG_4_END = 20;
const UUID_TOTAL_HEX = 32;

const getCrypto = (): Crypto | null => {
  if (typeof globalThis === "undefined") {
    return null;
  }
  const candidate = (globalThis as { crypto?: Crypto }).crypto;
  if (candidate && typeof candidate.getRandomValues === "function") {
    return candidate;
  }
  return null;
};

function secureRandomBytes(length: number): Uint8Array {
  const cryptoSource = getCrypto();
  if (cryptoSource) {
    const array = new Uint8Array(length);
    cryptoSource.getRandomValues(array);
    return array;
  }

  throw new Error("Secure random generator unavailable");
}

function secureRandomUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  const array = secureRandomBytes(UUID_BYTE_LENGTH);
  const dv = new DataView(array.buffer);

  const b6 = dv.getUint8(UUID_VERSION_BYTE);
  dv.setUint8(UUID_VERSION_BYTE, (b6 & HEX_MASK_LOW_NIBBLE) | HEX_MASK_BIT_6);
  const b8 = dv.getUint8(UUID_VARIANT_BYTE);
  dv.setUint8(UUID_VARIANT_BYTE, (b8 & HEX_MASK_6_BITS) | HEX_MASK_HIGH_BIT);

  const hex = Array.from(array, (byte) =>
    byte.toString(HEX_RADIX).padStart(COUNT_TWO, "0"),
  ).join("");

  return [
    hex.substring(ZERO, UUID_SEG_1_END),
    hex.substring(UUID_SEG_1_END, UUID_SEG_2_END),
    hex.substring(UUID_SEG_2_END, UUID_SEG_3_END),
    hex.substring(UUID_SEG_3_END, UUID_SEG_4_END),
    hex.substring(UUID_SEG_4_END, UUID_TOTAL_HEX),
  ].join("-");
}

/**
 * 安全令牌生成工具
 * Security token generation utilities
 */

/**
 * Token generation constants
 */
const TOKEN_CONSTANTS = {
  // Token generation
  DEFAULT_TOKEN_LENGTH: TOKEN_DEFAULT_LENGTH,
  HEX_RADIX: COUNT_TWO,
  HEX_PAD_LENGTH: COUNT_TWO,
  HEX_BASE: HEX_RADIX,
} as const;

/**
 * Generate a secure random string
 */
export function generateSecureToken(
  length: number = TOKEN_CONSTANTS.DEFAULT_TOKEN_LENGTH,
): string {
  // Generate half the length in bytes since each byte becomes 2 hex characters
  const byteLength = Math.ceil(length / TOKEN_CONSTANTS.HEX_RADIX);
  const array = secureRandomBytes(byteLength);
  const hex = Array.from(array, (byte) =>
    byte
      .toString(TOKEN_CONSTANTS.HEX_BASE)
      .padStart(TOKEN_CONSTANTS.HEX_PAD_LENGTH, "0"),
  ).join("");
  return hex.substring(ZERO, length);
}

/**
 * Generate a secure random UUID v4
 */
export function generateUUID(): string {
  return secureRandomUUID();
}

/**
 * Generate a secure random API key
 */
export function generateApiKey(prefix: string = "sk"): string {
  const randomPart = generateSecureToken(API_KEY_TOKEN_LENGTH);
  return `${prefix}_${randomPart}`;
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return generateSecureToken(SESSION_TOKEN_LENGTH);
}

/**
 * Generate a secure CSRF token
 */
export function generateCsrfToken(): string {
  return generateSecureToken(TOKEN_DEFAULT_LENGTH);
}

/**
 * Generate a secure nonce for CSP
 *
 * Re-exported from @/config/security to maintain single source of truth.
 * @see src/config/security.ts for implementation details
 */
export { generateNonce } from "@/config/security";

/**
 * Validate CSP nonce format
 *
 * Re-exported from @/config/security for consistent validation.
 * @see src/config/security.ts for implementation details
 */
export { isValidNonce } from "@/config/security";

/**
 * Generate a secure one-time password (OTP)
 */
export function generateOTP(length: number = OTP_DEFAULT_LENGTH): string {
  const digits = "0123456789";
  let result = "";

  const array = secureRandomBytes(length);
  const dv = new DataView(array.buffer);
  for (let i = ZERO; i < length; i++) {
    const idx = (dv.getUint8(i) % digits.length) >>> 0;
    result += digits.charAt(idx);
  }

  return result;
}

/**
 * Generate a secure verification code (alphanumeric)
 */
export function generateVerificationCode(
  length: number = VERIFY_CODE_DEFAULT_LENGTH,
): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  const array = secureRandomBytes(length);
  const dv = new DataView(array.buffer);
  for (let i = ZERO; i < length; i++) {
    const idx = (dv.getUint8(i) % chars.length) >>> 0;
    result += chars.charAt(idx);
  }

  return result;
}

/**
 * Validate token format
 */
export function isValidToken(token: string, expectedLength?: number): boolean {
  if (typeof token !== "string" || token.length === ZERO) {
    return false;
  }

  // Check if token contains only valid characters (alphanumeric and some special chars)
  const validTokenRegex = /^[a-zA-Z0-9_-]+$/;
  if (!validTokenRegex.test(token)) {
    return false;
  }

  // Check length if specified
  if (expectedLength && token.length !== expectedLength) {
    return false;
  }

  return true;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  // RFC 4122 version 4 UUID
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generate a secure random salt for password hashing
 */
export function generateSalt(length: number = HEX_RADIX): string {
  return generateSecureToken(length * COUNT_TWO); // Double length for hex representation
}

/**
 * Token expiration utilities
 */
export interface TokenWithExpiry {
  token: string;
  expiresAt: number;
}

/**
 * Create a token with expiration
 */
export function createTokenWithExpiry(
  tokenLength: number = TOKEN_DEFAULT_LENGTH,
  expiryMinutes: number = MINUTES_PER_HOUR,
): TokenWithExpiry {
  return {
    token: generateSecureToken(tokenLength),
    expiresAt: Date.now() + expiryMinutes * MINUTE_MS,
  };
}

/**
 * Check if token is expired
 */
export function isTokenExpired(tokenWithExpiry: TokenWithExpiry): boolean {
  return Date.now() > tokenWithExpiry.expiresAt;
}

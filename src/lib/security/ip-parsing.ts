import type { NextRequest } from "next/server";

const INVALID_IP_VERSION = 0;
const IPV4_VERSION = 4;
const IPV6_VERSION = 6;

/**
 * Strip port from IP address if present.
 */
export function stripPort(ip: string): string {
  if (ip.startsWith("[")) {
    const bracketEnd = ip.indexOf("]");
    if (bracketEnd !== -1) {
      return ip.slice(1, bracketEnd);
    }
  }

  const colonCount = (ip.match(/:/g) ?? []).length;
  if (colonCount === 1) {
    return ip.split(":")[0] ?? ip;
  }

  return ip;
}

/**
 * Parse first IP from X-Forwarded-For style headers.
 */
export function parseFirstIP(headerValue: string): string {
  const firstIP = headerValue.split(",")[0];
  if (!firstIP) return "";
  return stripPort(firstIP.trim());
}

const IPV4_OCTET_COUNT = 4;
const IPV4_BITS_PER_OCTET = 8;
const IPV4_MAX_OCTET = 255;
const IPV4_SEGMENT_MASK = 0xffff;
const IPV6_SEGMENT_COUNT = 8;
const IPV6_BITS_PER_SEGMENT = 16;
const BIGINT_ZERO = 0n;
const MALFORMED_IPV6_TRIPLE_COLON = /:::/u;

function ipv4ToInteger(ip: string): number | null {
  const segments = ip.split(".");
  if (segments.length !== IPV4_OCTET_COUNT) return null;

  let value = 0;
  for (const segment of segments) {
    if (!/^\d+$/u.test(segment)) return null;

    const octet = Number.parseInt(segment, 10);
    if (!Number.isInteger(octet) || octet < 0 || octet > IPV4_MAX_OCTET) {
      return null;
    }

    value = (value << IPV4_BITS_PER_OCTET) + octet;
  }

  return value >>> 0;
}

function normalizeIPv6Segments(segments: string[]): string[] | null {
  if (segments.length === 0) return [];

  const lastSegment = segments.at(-1);
  if (lastSegment?.includes(".")) {
    const ipv4Value = ipv4ToInteger(lastSegment);
    if (ipv4Value === null) return null;

    const normalized = segments.slice(0, -1);
    normalized.push(
      ((ipv4Value >>> IPV6_BITS_PER_SEGMENT) & IPV4_SEGMENT_MASK).toString(16),
    );
    normalized.push((ipv4Value & IPV4_SEGMENT_MASK).toString(16));
    return normalized;
  }

  return segments;
}

function hasValidIPv6Structure(ip: string): boolean {
  if (MALFORMED_IPV6_TRIPLE_COLON.test(ip)) return false;
  if (ip.startsWith(":") && !ip.startsWith("::")) return false;
  if (ip.endsWith(":") && !ip.endsWith("::")) return false;
  return true;
}

function ipv6ToBigInt(ip: string): bigint | null {
  if (!ip.includes(":")) return null;
  if (!hasValidIPv6Structure(ip)) return null;

  const compressedParts = ip.split("::");
  if (compressedParts.length > 2) return null;

  const [leftRaw = "", rightRaw = ""] = compressedParts;
  const leftSegments = normalizeIPv6Segments(
    leftRaw ? leftRaw.split(":").filter(Boolean) : [],
  );
  const rightSegments = normalizeIPv6Segments(
    rightRaw ? rightRaw.split(":").filter(Boolean) : [],
  );

  if (!leftSegments || !rightSegments) return null;

  const hasCompression = compressedParts.length === 2;
  const totalProvided = leftSegments.length + rightSegments.length;
  const missingSegments = IPV6_SEGMENT_COUNT - totalProvided;
  const validCount = hasCompression
    ? missingSegments > 0
    : missingSegments === 0;
  if (!validCount) return null;

  const segments = hasCompression
    ? [
        ...leftSegments,
        ...Array.from({ length: missingSegments }, () => "0"),
        ...rightSegments,
      ]
    : leftSegments;

  if (segments.length !== IPV6_SEGMENT_COUNT) return null;

  return segments.reduce<bigint | null>((accumulator, segment) => {
    if (accumulator === null) return null;
    const value = Number.parseInt(segment, 16);
    if (!Number.isFinite(value) || value < 0 || value > IPV4_SEGMENT_MASK) {
      return null;
    }
    return (accumulator << BigInt(IPV6_BITS_PER_SEGMENT)) + BigInt(value);
  }, BIGINT_ZERO);
}

export function getIPVersion(ip: string): number {
  if (ipv4ToInteger(ip) !== null) return IPV4_VERSION;
  if (ipv6ToBigInt(ip) !== null) return IPV6_VERSION;
  return INVALID_IP_VERSION;
}

/**
 * Validate IP address with local normalization rules.
 */
export function isValidIP(ip: string): boolean {
  if (!ip || ip === "unknown") {
    return false;
  }

  const cleanIP = stripPort(ip.trim());
  return getIPVersion(cleanIP) !== INVALID_IP_VERSION;
}

/**
 * Extract a normalized request IP from NextRequest.ip when present.
 */
export function getNextJsIP(request: NextRequest): string | null {
  const requestIP = (request as NextRequest & { ip?: string }).ip;
  if (!requestIP) return null;

  const cleanIP = stripPort(requestIP.trim());
  return isValidIP(cleanIP) ? cleanIP : null;
}

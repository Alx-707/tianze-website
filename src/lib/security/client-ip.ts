/**
 * Trusted Proxy Model - Client IP Extraction
 *
 * Extracts client IP from request headers with platform-specific trust rules.
 * Only parses proxy headers when request comes from a trusted platform entry.
 *
 * Security: X-Forwarded-For can be spoofed by clients. This module only
 * trusts proxy headers when DEPLOYMENT_PLATFORM is configured, preventing
 * direct connection spoofing.
 */

import { NextRequest } from "next/server";
import { INTERNAL_TRUSTED_CLIENT_IP_HEADER } from "@/lib/security/client-ip-headers";

/**
 * Trusted proxy configuration per platform
 */
interface TrustedProxyConfig {
  /** Headers to trust in order of preference */
  trustedHeaders: string[];
  /** Optional: Validate that request comes from CDN IP ranges */
  cdnIpRanges?: string[];
}

/**
 * Platform-specific proxy configurations
 *
 * Vercel: Automatically strips client-provided X-Forwarded-For
 * Cloudflare: Use cf-connecting-ip (set by Cloudflare edge)
 * Development: Accept headers for local testing
 *
 * NOTE on cdnIpRanges:
 * - Cloudflare source validation is enforced for NextRequest contexts.
 * - Server Action/header-only contexts must rely on middleware-derived headers,
 *   because they no longer have access to the trusted request source IP.
 */
const PROXY_CONFIGS: Record<string, TrustedProxyConfig> = {
  vercel: {
    // Vercel strips client-provided X-Forwarded-For, safe to trust
    trustedHeaders: ["x-real-ip", "x-forwarded-for"],
  },
  cloudflare: {
    // cf-connecting-ip is set by Cloudflare edge, most reliable
    trustedHeaders: ["cf-connecting-ip", "x-forwarded-for"],
    // Common Cloudflare IP ranges
    cdnIpRanges: [
      "173.245.48.0/20",
      "103.21.244.0/22",
      "103.22.200.0/22",
      "103.31.4.0/22",
      "141.101.64.0/18",
      "108.162.192.0/18",
      "190.93.240.0/20",
      "188.114.96.0/20",
      "197.234.240.0/22",
      "198.41.128.0/17",
      "162.158.0.0/15",
      "104.16.0.0/13",
      "104.24.0.0/14",
      "172.64.0.0/13",
      "131.0.72.0/22",
      "2400:cb00::/32",
      "2606:4700::/32",
      "2803:f800::/32",
      "2405:b500::/32",
      "2405:8100::/32",
      "2a06:98c0::/29",
      "2c0f:f248::/32",
    ],
  },
  development: {
    // Accept headers for local testing (less secure)
    trustedHeaders: ["x-forwarded-for", "x-real-ip"],
  },
};

/** Default fallback IP when none can be determined */
const FALLBACK_IP = "0.0.0.0";

/** Development localhost IP */
const LOCALHOST_IP = "127.0.0.1";
const BIGINT_ZERO = 0n;
const BIGINT_ONE = 1n;
const INVALID_IP_VERSION = 0;
const IPV4_VERSION = 4;
const IPV6_VERSION = 6;
const IPV4_OCTET_COUNT = 4;
const IPV4_BITS_PER_OCTET = 8;
const IPV4_MAX_OCTET = 255;
const IPV4_FULL_MASK = 2 ** (IPV4_OCTET_COUNT * IPV4_BITS_PER_OCTET) - 1;
const IPV4_SEGMENT_MASK = 0xffff;
const IPV6_SEGMENT_COUNT = 8;
const IPV6_BITS_PER_SEGMENT = 16;
const IPV6_MAX_BITS = 128;

/**
 * Get deployment platform from environment
 *
 * @returns Platform name or null if not configured
 */
function getDeploymentPlatform(): string | null {
  const platform = process.env.DEPLOYMENT_PLATFORM;

  if (!platform) {
    // Auto-detect common platforms
    if (process.env.VERCEL) {
      return "vercel";
    }
    if (process.env.CF_PAGES) {
      return "cloudflare";
    }
    if (process.env.NODE_ENV === "development") {
      return "development";
    }
    return null;
  }

  return platform.toLowerCase();
}

/**
 * Parse first IP from X-Forwarded-For header
 *
 * X-Forwarded-For format: "client, proxy1, proxy2"
 * We only want the first (leftmost) IP which is the original client.
 * Port suffix is stripped if present to ensure consistent rate limiting.
 *
 * @param headerValue - Raw header value
 * @returns First IP address, trimmed and normalized (port stripped)
 */
function parseFirstIP(headerValue: string): string {
  const firstIP = headerValue.split(",")[0];
  if (!firstIP) return "";
  return stripPort(firstIP.trim());
}

/**
 * Strip port from IP address if present
 *
 * Handles formats: "192.168.1.1:8080", "[::1]:8080"
 *
 * @param ip - IP string possibly containing port
 * @returns IP without port suffix
 */
function stripPort(ip: string): string {
  // IPv6 with port: [::1]:8080
  if (ip.startsWith("[")) {
    const bracketEnd = ip.indexOf("]");
    if (bracketEnd !== -1) {
      return ip.slice(1, bracketEnd);
    }
  }

  // IPv4 with port: 192.168.1.1:8080
  // Only strip if there's exactly one colon (IPv6 has multiple)
  const colonCount = (ip.match(/:/g) ?? []).length;
  if (colonCount === 1) {
    return ip.split(":")[0] ?? ip;
  }

  return ip;
}

/**
 * Validate IP address using Node.js net.isIP()
 *
 * Uses the built-in Node.js IP validation which correctly handles:
 * - IPv4 octet range (0-255)
 * - IPv6 format variations
 * - Edge cases that regex patterns miss
 *
 * @param ip - IP string to validate
 * @returns true if valid IPv4 or IPv6 address
 */
function isValidIP(ip: string): boolean {
  if (!ip || ip === "unknown") {
    return false;
  }

  // Strip port if present
  const cleanIP = stripPort(ip.trim());

  return getIPVersion(cleanIP) !== INVALID_IP_VERSION;
}

/**
 * Get IP from Next.js request object (handles optional ip property)
 * Returns normalized IP with port stripped for consistent rate limiting.
 */
function getNextJsIP(request: NextRequest): string | null {
  const requestIP = (request as NextRequest & { ip?: string }).ip;
  if (!requestIP) return null;

  const cleanIP = stripPort(requestIP.trim());
  return isValidIP(cleanIP) ? cleanIP : null;
}

/**
 * Get platform-specific proxy config
 */
function getPlatformConfig(platform: string): TrustedProxyConfig | undefined {
  if (platform === "vercel") return PROXY_CONFIGS.vercel;
  if (platform === "cloudflare") return PROXY_CONFIGS.cloudflare;
  if (platform === "development") return PROXY_CONFIGS.development;
  return undefined;
}

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

function ipv4ToBigInt(ip: string): bigint | null {
  const value = ipv4ToInteger(ip);
  return value === null ? null : BigInt(value);
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

function ipv6ToBigInt(ip: string): bigint | null {
  if (!ip.includes(":")) return null;

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

  const hasCompression = ip.includes("::");
  const missingSegments =
    IPV6_SEGMENT_COUNT - (leftSegments.length + rightSegments.length);

  if ((!hasCompression && missingSegments !== 0) || missingSegments < 0) {
    return null;
  }

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

function getIPVersion(ip: string): number {
  if (ipv4ToInteger(ip) !== null) return IPV4_VERSION;
  if (ipv6ToBigInt(ip) !== null) return IPV6_VERSION;
  return INVALID_IP_VERSION;
}

function ipToBigInt(ip: string): bigint | null {
  const version = getIPVersion(ip);
  if (version === IPV4_VERSION) return ipv4ToBigInt(ip);
  if (version === IPV6_VERSION) return ipv6ToBigInt(ip);
  return null;
}

function isValidCIDRContext(
  ipVersion: number,
  networkVersion: number,
  prefixLength: number,
): boolean {
  if (
    ipVersion === INVALID_IP_VERSION ||
    networkVersion === INVALID_IP_VERSION ||
    ipVersion !== networkVersion ||
    !Number.isFinite(prefixLength)
  ) {
    return false;
  }

  const maxBits = ipVersion === IPV4_OCTET_COUNT ? 32 : IPV6_MAX_BITS;
  return prefixLength >= 0 && prefixLength <= maxBits;
}

function createIPv4Mask(prefixLength: number): bigint {
  const hostBits = 32 - prefixLength;
  if (hostBits === IPV4_OCTET_COUNT * IPV4_BITS_PER_OCTET) {
    return BIGINT_ZERO;
  }

  return BigInt((IPV4_FULL_MASK << hostBits) >>> 0);
}

function createIPv6Mask(prefixLength: number): bigint | null {
  if (prefixLength === 0) {
    return null;
  }

  const fullMask = (BIGINT_ONE << BigInt(IPV6_MAX_BITS)) - BIGINT_ONE;
  return (fullMask << BigInt(IPV6_MAX_BITS - prefixLength)) & fullMask;
}

function isIPInCIDRRange(ip: string, cidr: string): boolean {
  const [network, prefixLengthValue] = cidr.split("/");
  if (!network || !prefixLengthValue) return false;

  const ipVersion = getIPVersion(ip);
  const networkVersion = getIPVersion(network);
  const prefixLength = Number.parseInt(prefixLengthValue, 10);

  if (!isValidCIDRContext(ipVersion, networkVersion, prefixLength)) {
    return false;
  }

  const ipValue = ipToBigInt(ip);
  const networkValue = ipToBigInt(network);
  if (ipValue === null || networkValue === null) {
    return false;
  }

  if (ipVersion === IPV4_VERSION) {
    const mask = createIPv4Mask(prefixLength);
    return (ipValue & mask) === (networkValue & mask);
  }

  const mask = createIPv6Mask(prefixLength);
  if (mask === null) {
    return true;
  }

  return (ipValue & mask) === (networkValue & mask);
}

function isTrustedCdnSource(
  request: NextRequest,
  config: TrustedProxyConfig,
): boolean {
  if (!config.cdnIpRanges || config.cdnIpRanges.length === 0) {
    return true;
  }

  const sourceIP = getNextJsIP(request);
  if (!sourceIP) {
    return false;
  }

  return config.cdnIpRanges.some((cidr) => isIPInCIDRRange(sourceIP, cidr));
}

/**
 * Try to extract IP from trusted headers
 */
function getIPFromTrustedHeaders(
  request: NextRequest,
  config: TrustedProxyConfig,
): string | null {
  for (const headerName of config.trustedHeaders) {
    const headerValue = request.headers.get(headerName);
    if (headerValue) {
      const ip = parseFirstIP(headerValue);
      if (isValidIP(ip)) return ip;
    }
  }
  return null;
}

/**
 * Derive the client IP value that middleware is allowed to promote into the
 * internal trusted header. This is intentionally stricter than getClientIP():
 * it only returns a value when the proxy chain itself is trusted.
 */
export function getTrustedClientIPForInternalHeader(
  request: NextRequest,
): string | null {
  const platform = getDeploymentPlatform();
  if (!platform) {
    return null;
  }

  const config = getPlatformConfig(platform);
  if (!config) {
    return null;
  }

  if (platform === "cloudflare" && !isTrustedCdnSource(request, config)) {
    return null;
  }

  return getIPFromTrustedHeaders(request, config);
}

/**
 * Extract client IP from request using trusted proxy model
 *
 * Only trusts proxy headers when request comes from a known platform.
 * For direct connections without trusted proxy, ignores all proxy headers.
 *
 * @param request - Next.js request object
 * @returns Client IP address
 *
 * @example
 * ```typescript
 * const clientIP = getClientIP(request);
 * // On Vercel: extracts from x-real-ip or x-forwarded-for
 * // On Cloudflare: extracts from cf-connecting-ip
 * // Direct connection: returns framework IP or fallback
 * ```
 */
export function getClientIP(request: NextRequest): string {
  const platform = getDeploymentPlatform();

  // If no platform configured, don't trust proxy headers (security).
  // Falls back to 0.0.0.0 which collapses all unknown IPs into one rate-limit bucket.
  // DEPLOYMENT_PLATFORM must be set in production to enable proper per-IP rate limiting.
  if (!platform) {
    return getNextJsIP(request) ?? FALLBACK_IP;
  }

  const config = getPlatformConfig(platform);
  if (!config) {
    return getNextJsIP(request) ?? FALLBACK_IP;
  }

  if (platform === "cloudflare" && !isTrustedCdnSource(request, config)) {
    return getNextJsIP(request) ?? FALLBACK_IP;
  }

  // Try trusted headers first
  const headerIP = getIPFromTrustedHeaders(request, config);
  if (headerIP) return headerIP;

  // Fallback to Next.js IP
  const nextIP = getNextJsIP(request);
  if (nextIP) return nextIP;

  // Development localhost fallback
  if (platform === "development") return LOCALHOST_IP;

  return FALLBACK_IP;
}

/**
 * Get all IPs in the proxy chain (for debugging/logging)
 *
 * @param request - Next.js request object
 * @returns Array of IP addresses in the chain
 */
export function getIPChain(request: NextRequest): string[] {
  const chain: string[] = [];

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const ips = xff.split(",").map((ip) => ip.trim());
    chain.push(...ips.filter(isValidIP));
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP && isValidIP(realIP) && !chain.includes(realIP)) {
    chain.push(realIP);
  }

  const cfIP = request.headers.get("cf-connecting-ip");
  if (cfIP && isValidIP(cfIP) && !chain.includes(cfIP)) {
    chain.unshift(cfIP); // Cloudflare IP is authoritative
  }

  // Add request.ip if not already present
  const nextIP = getNextJsIP(request);
  if (nextIP && !chain.includes(nextIP)) {
    chain.push(nextIP);
  }

  return chain;
}

type HeadersLike = Pick<Headers, "get">;

function getIPFromTrustedHeadersLike(
  headers: HeadersLike,
  config: TrustedProxyConfig,
): string | null {
  for (const headerName of config.trustedHeaders) {
    const headerValue = headers.get(headerName);
    if (headerValue) {
      const ip = parseFirstIP(headerValue);
      if (isValidIP(ip)) return ip;
    }
  }
  return null;
}

/**
 * Extract client IP from headers (Server Actions / non-NextRequest contexts)
 *
 * This uses the same trusted proxy model as getClientIP(request), but since
 * we don't have access to request.ip, the fallback behavior differs:
 * - No platform configured: returns FALLBACK_IP (does NOT trust proxy headers)
 * - Platform configured: trusts only the platform's trusted headers
 * - Cloudflare Server Actions: trusts the middleware-derived internal header
 *   because middleware still has access to the trusted request context
 *
 * @example
 * ```ts
 * const h = await headers();
 * const clientIP = getClientIPFromHeaders(h);
 * ```
 */
export function getClientIPFromHeaders(headers: HeadersLike): string {
  const platform = getDeploymentPlatform();

  // If no platform configured, don't trust proxy headers (security)
  if (!platform) {
    return FALLBACK_IP;
  }

  const config = getPlatformConfig(platform);
  if (!config) {
    return FALLBACK_IP;
  }

  if (platform === "cloudflare") {
    const middlewareDerivedIP = getIPFromTrustedHeadersLike(headers, {
      trustedHeaders: [INTERNAL_TRUSTED_CLIENT_IP_HEADER],
    });
    if (middlewareDerivedIP) {
      return middlewareDerivedIP;
    }

    return FALLBACK_IP;
  }

  const headerIP = getIPFromTrustedHeadersLike(headers, config);
  if (headerIP) return headerIP;

  // Development localhost fallback
  if (platform === "development") return LOCALHOST_IP;

  return FALLBACK_IP;
}

/**
 * Trusted Proxy Model - Client IP Extraction
 *
 * Extracts client IP from request headers with platform-specific trust rules.
 * Only parses proxy headers when request comes from a trusted platform entry.
 */

import { NextRequest } from "next/server";
import { INTERNAL_TRUSTED_CLIENT_IP_HEADER } from "@/lib/security/client-ip-headers";
import {
  getIPVersion,
  getNextJsIP,
  isValidIP,
  parseFirstIP,
} from "@/lib/security/ip-parsing";
import { isTrustedCdnSource } from "@/lib/security/ip-range";

interface TrustedProxyConfig {
  trustedHeaders: string[];
  cdnIpRanges?: string[];
}

const PROXY_CONFIGS: Record<string, TrustedProxyConfig> = {
  vercel: {
    trustedHeaders: ["x-real-ip", "x-forwarded-for"],
  },
  cloudflare: {
    trustedHeaders: ["cf-connecting-ip", "x-forwarded-for"],
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
    trustedHeaders: ["x-forwarded-for", "x-real-ip"],
  },
};

const FALLBACK_IP = "0.0.0.0";
const LOCALHOST_IP = "127.0.0.1";

function getDeploymentPlatform(): string | null {
  const platform = process.env.DEPLOYMENT_PLATFORM;

  if (!platform) {
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

function getPlatformConfig(platform: string): TrustedProxyConfig | undefined {
  if (platform === "vercel") return PROXY_CONFIGS.vercel;
  if (platform === "cloudflare") return PROXY_CONFIGS.cloudflare;
  if (platform === "development") return PROXY_CONFIGS.development;
  return undefined;
}

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

  if (
    platform === "cloudflare" &&
    !isTrustedCdnSource(getNextJsIP(request), config.cdnIpRanges)
  ) {
    return null;
  }

  return getIPFromTrustedHeaders(request, config);
}

export function getClientIP(request: NextRequest): string {
  const platform = getDeploymentPlatform();

  if (!platform) {
    return getNextJsIP(request) ?? FALLBACK_IP;
  }

  const config = getPlatformConfig(platform);
  if (!config) {
    return getNextJsIP(request) ?? FALLBACK_IP;
  }

  if (
    platform === "cloudflare" &&
    !isTrustedCdnSource(getNextJsIP(request), config.cdnIpRanges)
  ) {
    return getNextJsIP(request) ?? FALLBACK_IP;
  }

  const headerIP = getIPFromTrustedHeaders(request, config);
  if (headerIP) return headerIP;

  const nextIP = getNextJsIP(request);
  if (nextIP) return nextIP;

  if (platform === "development") return LOCALHOST_IP;

  return FALLBACK_IP;
}

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
    chain.unshift(cfIP);
  }

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

export function getClientIPFromHeaders(headers: HeadersLike): string {
  const platform = getDeploymentPlatform();

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

  if (platform === "development") return LOCALHOST_IP;

  return FALLBACK_IP;
}

export { getIPVersion };

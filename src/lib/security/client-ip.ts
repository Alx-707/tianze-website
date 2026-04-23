/**
 * Trusted Proxy Model - Client IP Extraction
 *
 * Extracts client IP from request headers with platform-specific trust rules.
 * Only parses proxy headers when request comes from a trusted platform entry.
 */

import cloudflareIpRanges from "@/lib/security/cloudflare-ip-ranges.json";
import { NextRequest } from "next/server";
import { INTERNAL_TRUSTED_CLIENT_IP_HEADER } from "@/lib/security/client-ip-headers";
import {
  getIPVersion,
  getNextJsIP,
  isValidIP,
  parseFirstIP,
} from "@/lib/security/ip-parsing";
import { isTrustedCdnSource } from "@/lib/security/ip-range";

const PLATFORM_VERCEL = "vercel";
const PLATFORM_CLOUDFLARE = "cloudflare";
const PLATFORM_DEVELOPMENT = "development";

type DeploymentPlatform =
  | typeof PLATFORM_VERCEL
  | typeof PLATFORM_CLOUDFLARE
  | typeof PLATFORM_DEVELOPMENT;

type HeadersLike = Pick<Headers, "get">;

interface TrustedProxyConfig {
  trustedHeaders: readonly string[];
  cdnIpRanges?: typeof cloudflareIpRanges;
}

const FALLBACK_IP = "0.0.0.0";
const LOCALHOST_IP = "127.0.0.1";
const INTERNAL_HEADER_CONFIG: TrustedProxyConfig = {
  trustedHeaders: [INTERNAL_TRUSTED_CLIENT_IP_HEADER],
};

const TRUSTED_PROXY_CONFIGS: Record<DeploymentPlatform, TrustedProxyConfig> = {
  [PLATFORM_VERCEL]: {
    trustedHeaders: ["x-real-ip", "x-forwarded-for"],
  },
  [PLATFORM_CLOUDFLARE]: {
    trustedHeaders: ["cf-connecting-ip", "x-forwarded-for"],
    cdnIpRanges: cloudflareIpRanges,
  },
  [PLATFORM_DEVELOPMENT]: {
    trustedHeaders: ["x-forwarded-for", "x-real-ip"],
  },
};

function getDeploymentPlatform(): DeploymentPlatform | null {
  const platform = process.env.DEPLOYMENT_PLATFORM;

  if (platform) {
    const normalizedPlatform = platform.toLowerCase();
    if (normalizedPlatform === PLATFORM_VERCEL) return PLATFORM_VERCEL;
    if (normalizedPlatform === PLATFORM_CLOUDFLARE) return PLATFORM_CLOUDFLARE;
    if (normalizedPlatform === PLATFORM_DEVELOPMENT) {
      return PLATFORM_DEVELOPMENT;
    }
    return null;
  }

  if (process.env.VERCEL) {
    return PLATFORM_VERCEL;
  }
  if (process.env.CF_PAGES) {
    return PLATFORM_CLOUDFLARE;
  }
  if (process.env.NODE_ENV === "development") {
    return PLATFORM_DEVELOPMENT;
  }

  return null;
}

function readTrustedHeaderIP(
  headers: HeadersLike,
  trustedHeaders: readonly string[],
): string | null {
  for (const headerName of trustedHeaders) {
    const headerValue = headers.get(headerName);
    if (!headerValue) {
      continue;
    }

    const ip = parseFirstIP(headerValue);
    if (isValidIP(ip)) {
      return ip;
    }
  }

  return null;
}

function getPlatformContext(): {
  platform: DeploymentPlatform;
  config: TrustedProxyConfig;
} | null {
  const platform = getDeploymentPlatform();
  if (!platform) {
    return null;
  }

  return {
    platform,
    config: TRUSTED_PROXY_CONFIGS[platform],
  };
}

function isTrustedCloudflareRequest(
  request: NextRequest,
  config: TrustedProxyConfig,
): boolean {
  if (!config.cdnIpRanges || config.cdnIpRanges.length === 0) {
    return false;
  }

  return isTrustedCdnSource(getNextJsIP(request), config.cdnIpRanges);
}

function getRequestFallbackIP(
  request: NextRequest,
  platform: DeploymentPlatform | null,
): string {
  const nextIp = getNextJsIP(request);
  if (nextIp) {
    return nextIp;
  }

  if (platform === PLATFORM_DEVELOPMENT) {
    return LOCALHOST_IP;
  }

  return FALLBACK_IP;
}

function canTrustPlatformHeaders(
  request: NextRequest,
  platformContext: { platform: DeploymentPlatform; config: TrustedProxyConfig },
): boolean {
  if (platformContext.platform !== PLATFORM_CLOUDFLARE) {
    return true;
  }

  return isTrustedCloudflareRequest(request, platformContext.config);
}

function pushUniqueIP(chain: string[], ip: string | null | undefined): void {
  if (!ip || !isValidIP(ip) || chain.includes(ip)) {
    return;
  }

  chain.push(ip);
}

export function getTrustedClientIPForInternalHeader(
  request: NextRequest,
): string | null {
  const platformContext = getPlatformContext();
  if (!platformContext || !canTrustPlatformHeaders(request, platformContext)) {
    return null;
  }

  return readTrustedHeaderIP(
    request.headers,
    platformContext.config.trustedHeaders,
  );
}

export function getClientIP(request: NextRequest): string {
  const platformContext = getPlatformContext();
  if (!platformContext) {
    return getRequestFallbackIP(request, null);
  }

  if (!canTrustPlatformHeaders(request, platformContext)) {
    return getRequestFallbackIP(request, platformContext.platform);
  }

  const headerIP = readTrustedHeaderIP(
    request.headers,
    platformContext.config.trustedHeaders,
  );
  if (headerIP) {
    return headerIP;
  }

  return getRequestFallbackIP(request, platformContext.platform);
}

export function getIPChain(request: NextRequest): string[] {
  const chain: string[] = [];
  const xForwardedFor = request.headers.get("x-forwarded-for");

  if (xForwardedFor) {
    for (const candidate of xForwardedFor.split(",").map((ip) => ip.trim())) {
      pushUniqueIP(chain, candidate);
    }
  }

  pushUniqueIP(chain, request.headers.get("x-real-ip"));

  const cfIP = request.headers.get("cf-connecting-ip");
  if (cfIP && isValidIP(cfIP) && !chain.includes(cfIP)) {
    chain.unshift(cfIP);
  }

  pushUniqueIP(chain, getNextJsIP(request));

  return chain;
}

export function getClientIPFromHeaders(headers: HeadersLike): string {
  const platformContext = getPlatformContext();
  if (!platformContext) {
    return FALLBACK_IP;
  }

  if (platformContext.platform === PLATFORM_CLOUDFLARE) {
    return (
      readTrustedHeaderIP(headers, INTERNAL_HEADER_CONFIG.trustedHeaders) ??
      FALLBACK_IP
    );
  }

  const headerIP = readTrustedHeaderIP(
    headers,
    platformContext.config.trustedHeaders,
  );
  if (headerIP) {
    return headerIP;
  }

  return platformContext.platform === PLATFORM_DEVELOPMENT
    ? LOCALHOST_IP
    : FALLBACK_IP;
}

export { getIPVersion };

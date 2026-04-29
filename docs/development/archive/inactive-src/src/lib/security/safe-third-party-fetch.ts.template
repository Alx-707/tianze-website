import { ipv4ToInteger } from "@/lib/security/ip-range";

export type ThirdPartyUrlPolicy = {
  /**
   * Exact host allowlist (case-insensitive).
   * Example: ["graph.facebook.com", "lookaside.fbsbx.com"]
   */
  allowHosts?: readonly string[];
  /**
   * Host suffix allowlist (case-insensitive, dot-boundary enforced).
   * Example: ["fbsbx.com", "fbcdn.net"]
   */
  allowHostSuffixes?: readonly string[];
};

const DEFAULT_MAX_REDIRECTS = 2;
const HTTP_MOVED_PERMANENTLY = 301;
const HTTP_FOUND = 302;
const HTTP_SEE_OTHER = 303;
const HTTP_TEMPORARY_REDIRECT = 307;
const HTTP_PERMANENT_REDIRECT = 308;
const REDIRECT_STATUSES = new Set([
  HTTP_MOVED_PERMANENTLY,
  HTTP_FOUND,
  HTTP_SEE_OTHER,
  HTTP_TEMPORARY_REDIRECT,
  HTTP_PERMANENT_REDIRECT,
]);

function isIpLiteral(hostname: string): boolean {
  if (ipv4ToInteger(hostname) !== null) return true;
  // IPv6 literal (URL.hostname does not include brackets)
  return hostname.includes(":");
}

function hostnameMatchesSuffix(hostname: string, suffix: string): boolean {
  const normalizedHostname = hostname.toLowerCase();
  const normalizedSuffix = suffix.toLowerCase();
  return (
    normalizedHostname === normalizedSuffix ||
    normalizedHostname.endsWith(`.${normalizedSuffix}`)
  );
}

export function isAllowedThirdPartyUrl(
  rawUrl: string,
  policy: ThirdPartyUrlPolicy,
): { allowed: true; url: URL } | { allowed: false; reason: string } {
  const url = tryParseUrl(rawUrl);
  if (!url) return { allowed: false, reason: "Invalid URL" };

  const baseUrlError = validateBaseUrl(url);
  if (baseUrlError) return { allowed: false, reason: baseUrlError };

  const hostname = url.hostname.toLowerCase();
  const hostnameError = validateHostname(hostname, policy);
  if (hostnameError) return { allowed: false, reason: hostnameError };

  return { allowed: true, url };
}

export async function safeFetchThirdPartyUrl(
  rawUrl: string,
  init: RequestInit,
  config: { policy: ThirdPartyUrlPolicy; maxRedirects?: number },
): Promise<Response> {
  const requestedRedirects = config.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const maxRedirects =
    Number.isInteger(requestedRedirects) && requestedRedirects >= 0
      ? requestedRedirects
      : DEFAULT_MAX_REDIRECTS;

  const initialCheck = isAllowedThirdPartyUrl(rawUrl, config.policy);
  if (!initialCheck.allowed) {
    throw new Error(`Unsafe third-party URL: ${initialCheck.reason}`);
  }

  let currentUrl = initialCheck.url;
  let response = await fetchManualRedirect(currentUrl, init);

  for (
    let redirectsLeft = maxRedirects;
    redirectsLeft > 0;
    redirectsLeft -= 1
  ) {
    if (!REDIRECT_STATUSES.has(response.status)) {
      break;
    }
    const location = response.headers.get("location");
    if (!location) {
      return response;
    }

    const nextUrl = new URL(location, currentUrl);
    const check = isAllowedThirdPartyUrl(nextUrl.toString(), config.policy);
    if (!check.allowed) {
      throw new Error(`Unsafe redirect URL: ${check.reason}`);
    }

    currentUrl = check.url;
    response = await fetchManualRedirect(currentUrl, init);
  }

  return response;
}

function fetchManualRedirect(url: URL, init: RequestInit): Promise<Response> {
  return fetch(url.toString(), {
    ...init,
    redirect: "manual",
  });
}

function tryParseUrl(rawUrl: string): URL | null {
  return URL.canParse(rawUrl) ? new URL(rawUrl) : null;
}

function validateBaseUrl(url: URL): string | null {
  if (url.protocol !== "https:") {
    return "Only https: URLs are allowed";
  }
  if (url.username || url.password) {
    return "URL must not include credentials";
  }
  return null;
}

function isAllowedHostname(
  hostname: string,
  policy: ThirdPartyUrlPolicy,
): boolean {
  if (policy.allowHosts !== undefined) {
    for (const allowedHost of policy.allowHosts) {
      if (allowedHost.toLowerCase() === hostname) {
        return true;
      }
    }
  }

  if (policy.allowHostSuffixes !== undefined) {
    for (const suffix of policy.allowHostSuffixes) {
      if (hostnameMatchesSuffix(hostname, suffix)) {
        return true;
      }
    }
  }

  return false;
}

function validateHostname(
  hostname: string,
  policy: ThirdPartyUrlPolicy,
): string | null {
  if (hostname === "localhost") return "localhost is not allowed";
  if (isIpLiteral(hostname)) return "IP literals are not allowed";
  if (!isAllowedHostname(hostname, policy)) {
    return `Hostname not in allowlist: ${hostname}`;
  }
  return null;
}

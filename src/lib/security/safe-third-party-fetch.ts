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
const HTTP_STATUS_REDIRECT_MIN = 300;
const HTTP_STATUS_REDIRECT_MAX_EXCLUSIVE = 400;
const HTTP_STATUS_NOT_MODIFIED = 304;
const IPV4_OCTET_MAX = 255;

function isDecimalNumberString(value: string): boolean {
  if (value.length === 0) return false;
  for (const char of value) {
    if (char < "0" || char > "9") return false;
  }
  return true;
}

function isIPv4Literal(hostname: string): boolean {
  const parts = hostname.split(".");
  if (parts.length !== 4) return false;

  for (const part of parts) {
    if (!isDecimalNumberString(part)) return false;
    const value = Number(part);
    if (!Number.isFinite(value) || value < 0 || value > IPV4_OCTET_MAX)
      return false;
  }

  return true;
}

function isIpLiteral(hostname: string): boolean {
  if (isIPv4Literal(hostname)) return true;
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
  const maxRedirects =
    typeof config.maxRedirects === "number" && config.maxRedirects >= 0
      ? config.maxRedirects
      : DEFAULT_MAX_REDIRECTS;

  const initialCheck = isAllowedThirdPartyUrl(rawUrl, config.policy);
  if (!initialCheck.allowed) {
    throw new Error(`Unsafe third-party URL: ${initialCheck.reason}`);
  }

  let currentUrl = initialCheck.url;
  let redirectsLeft = maxRedirects;

  while (true) {
    const response = await fetch(currentUrl.toString(), {
      ...init,
      redirect: "manual",
    });

    const isRedirect =
      response.status >= HTTP_STATUS_REDIRECT_MIN &&
      response.status < HTTP_STATUS_REDIRECT_MAX_EXCLUSIVE &&
      response.status !== HTTP_STATUS_NOT_MODIFIED;

    if (!isRedirect || redirectsLeft <= 0) {
      return response;
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
    redirectsLeft -= 1;
  }
}

function tryParseUrl(rawUrl: string): URL | null {
  try {
    return new URL(rawUrl);
  } catch {
    return null;
  }
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
  const allowHosts = policy.allowHosts?.map((h) => h.toLowerCase()) ?? [];
  if (allowHosts.includes(hostname)) return true;

  const suffixes = policy.allowHostSuffixes ?? [];
  return suffixes.some((suffix) => hostnameMatchesSuffix(hostname, suffix));
}

function validateHostname(
  hostname: string,
  policy: ThirdPartyUrlPolicy,
): string | null {
  if (!hostname) return "Missing hostname";
  if (hostname === "localhost") return "localhost is not allowed";
  if (isIpLiteral(hostname)) return "IP literals are not allowed";
  if (!isAllowedHostname(hostname, policy)) {
    return `Hostname not in allowlist: ${hostname}`;
  }
  return null;
}

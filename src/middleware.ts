import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { generateNonce, getSecurityHeaders } from "@/config/security";
import { routing, type Locale } from "@/i18n/routing-config";
import { INTERNAL_TRUSTED_CLIENT_IP_HEADER } from "@/lib/security/client-ip-headers";

const intlMiddleware = createMiddleware(routing);
const SUPPORTED_LOCALES = new Set<string>(routing.locales);
const NONCE_REQUEST_HEADER_KEY = "x-nonce";

function isValidLocale(candidate: string): candidate is Locale {
  return SUPPORTED_LOCALES.has(candidate);
}

function applyRequestHeaderOverride(
  response: NextResponse,
  headerKey: string,
  headerValue: string,
): void {
  const normalizedKey = headerKey.toLowerCase();
  response.headers.set(`x-middleware-request-${normalizedKey}`, headerValue);

  const existing = response.headers.get("x-middleware-override-headers");
  const keys = new Set(
    (existing ?? "")
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean),
  );
  keys.add(normalizedKey);
  response.headers.set(
    "x-middleware-override-headers",
    Array.from(keys).join(","),
  );
}

function stripPort(ip: string): string {
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

function normalizeForwardedIP(headerValue: string | null): string | null {
  if (!headerValue) return null;

  const firstValue = headerValue.split(",")[0]?.trim();
  if (!firstValue || firstValue.toLowerCase() === "unknown") {
    return null;
  }

  const normalized = stripPort(firstValue);
  return normalized.length > 0 ? normalized : null;
}

function getTrustedClientIPForRequest(request: NextRequest): string | null {
  return (
    normalizeForwardedIP(request.headers.get("cf-connecting-ip")) ??
    normalizeForwardedIP(request.headers.get("x-real-ip")) ??
    normalizeForwardedIP(request.headers.get("x-forwarded-for"))
  );
}

function addSecurityHeaders(response: NextResponse, nonce: string): void {
  const securityHeaders = getSecurityHeaders(nonce);
  securityHeaders.forEach(({ key, value }) => {
    response.headers.set(key, value);
  });
}

function extractLocaleCandidate(pathname: string): Locale | undefined {
  const segments = pathname.split("/").filter(Boolean);
  const candidate = segments[0];
  return candidate && isValidLocale(candidate) ? candidate : undefined;
}

function setLocaleCookie(resp: NextResponse, locale: Locale): void {
  try {
    const appEnv = process.env.APP_ENV;
    const isSecure = appEnv === "production" || appEnv === "preview";
    const { localeCookie } = routing;
    const maxAge =
      typeof localeCookie === "object" && localeCookie !== null
        ? localeCookie.maxAge
        : undefined;
    resp.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isSecure,
      ...(typeof maxAge === "number" ? { maxAge } : {}),
    });
  } catch {
    // ignore cookie errors
  }
}

function removeLeakedMiddlewareCookieHeader(response: NextResponse): void {
  response.headers.delete("x-middleware-set-cookie");
}

function extractLocaleFromLocationHeader(
  request: NextRequest,
  locationHeader: string | null,
): Locale | undefined {
  if (!locationHeader) return undefined;

  try {
    const redirectUrl = new URL(locationHeader, request.url);
    return extractLocaleCandidate(redirectUrl.pathname);
  } catch {
    return undefined;
  }
}

function tryHandleInvalidLocalePrefix(
  request: NextRequest,
  nonce: string,
): NextResponse | null {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length < 2) {
    return null;
  }

  const [first, ...rest] = segments;

  if (first && SUPPORTED_LOCALES.has(first)) {
    return null;
  }

  const candidatePath = `/${rest.join("/")}`;
  const pathnames = routing.pathnames as Record<string, unknown> | undefined;
  const isKnownPath = Boolean(
    pathnames && Object.prototype.hasOwnProperty.call(pathnames, candidatePath),
  );

  if (!isKnownPath) {
    return null;
  }

  const targetUrl = request.nextUrl.clone();
  targetUrl.pathname = `/${routing.defaultLocale}${candidatePath}`;

  const resp = NextResponse.redirect(targetUrl);
  setLocaleCookie(resp, routing.defaultLocale);
  removeLeakedMiddlewareCookieHeader(resp);
  addSecurityHeaders(resp, nonce);

  return resp;
}

export default function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const trustedClientIP = getTrustedClientIPForRequest(request);

  const invalidLocaleHandled = tryHandleInvalidLocalePrefix(request, nonce);
  if (invalidLocaleHandled) {
    applyRequestHeaderOverride(
      invalidLocaleHandled,
      NONCE_REQUEST_HEADER_KEY,
      nonce,
    );
    if (trustedClientIP) {
      applyRequestHeaderOverride(
        invalidLocaleHandled,
        INTERNAL_TRUSTED_CLIENT_IP_HEADER,
        trustedClientIP,
      );
    }
    return invalidLocaleHandled;
  }

  const response = intlMiddleware(request);
  const locale =
    extractLocaleCandidate(request.nextUrl.pathname) ??
    extractLocaleFromLocationHeader(request, response.headers.get("location"));
  const existingLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (response && locale && existingLocale !== locale) {
    setLocaleCookie(response, locale);
  }
  if (response) {
    removeLeakedMiddlewareCookieHeader(response);
    applyRequestHeaderOverride(response, NONCE_REQUEST_HEADER_KEY, nonce);
    if (trustedClientIP) {
      applyRequestHeaderOverride(
        response,
        INTERNAL_TRUSTED_CLIENT_IP_HEADER,
        trustedClientIP,
      );
    }
    addSecurityHeaders(response, nonce);
  }
  return response;
}

export const config = {
  matcher: ["/", "/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};

import { COUNT_TWO, HEX_RADIX } from "../constants/count";
import { ZERO } from "../constants/core";
import {
  getRuntimeEnvBoolean,
  getRuntimeEnvString,
  isRuntimeDevelopment,
  isRuntimeProduction,
  isRuntimeTest,
} from "../lib/env";

export type SecurityHeader = {
  key: string;
  value: string;
};

/**
 * Inline script allowlist (CSP hashes)
 *
 * Why:
 * - In strict CSP mode we rely on a per-request nonce for Next.js internal inline scripts.
 * - Some inline scripts are intentionally rendered without nonce (e.g. JSON-LD, next-themes init),
 *   and Turbopack also emits a small `$RT` bootstrap without nonce.
 * - Hash allowlisting keeps strict CSP enforceable without falling back to `unsafe-inline`.
 *
 * Maintenance:
 * - When upgrading Next.js/next-themes or editing JSON-LD generation, run `pnpm security:csp:check`
 *   to refresh these hashes (and ensure no new nonced scripts regress).
 */
const CSP_INLINE_SCRIPT_SHA256_BASE64_ALLOWLIST = [
  // Shared inline scripts for prerendered home routes (next-themes + Next.js RSC bootstrap/shell).
  "n46vPwSWuMC0W703pBofImv82Z26xo4LXymv0E9caPk=",
  "OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo=",
  "bBpJJ8aXbivDqX35/j6eel15hvLNbM1prCX0WwXwzWQ=",
  "i+oOQWaCXue4EjKa+/5AcHbPo2Xy7vfP2mIpoxIkebw=",

  // Locale-specific inline scripts for `/en` home route (JSON-LD + streamed RSC payload).
  "0d+gdTiq+Wm8Alp1qv0n8zLmGrlhTsmITZZrAAGHu4U=",
  "2dEsvJ9x/vk9goXSkpykCEbam/fDCw/v67euZ1a/6Y4=",
  "M58sHH45JvOJ/+TUUZR77KwEQaUjXrF2Vpi7KGGmfoo=",
  "1VpYxXC3q+hYxOKSOO6r3l5xX0lWghAjxhJCV1MGJ7c=",
  "/98yFs6PuWLmCbIoc5Ds7rlKGCCVVAbp/EiR7UGiH08=",
  "E6QfeQZh8OiLBsyiZrcbxwiM/DXBhSEZ4B3SpXSMvyM=",
  "fj1oC3/wZs8vDEvuk4a6VzvRq61bebt+bpngZ+38TRI=",
  "HbQKT3hgdqupDLgkrgYvmwo1lFYePSVdImXTvUyJJyM=",
  "YMin26Oa7ZSgbLyy3QLUwDeSKiNHGyV/SluMwXSIkTI=",
  "Ap68fBxgoAAmfa4VTIs6iQEGVzv24BWEwzM6WcqJXbY=",
  "e3x/TA46p+lnirXC9+fzCar3iFSDKikXGW85jpLwY7s=",
  "aQ9azh9mAQRsQ/3vwgiEeNedqr+8fH+JeGdT5t2RYj0=",
  "MEXBhuehiS4iaxRlLs/6UoflWvXnPnpldK8+IZ1zGo4=",
  "IGZ/+yh8rU1tu3gqpN1fbBC3y/Jouw3GdqF9sPd6XSE=",
  "poWImLi2t9XEwzUgkgs4kDV6PI6EJLeljjtoqxsEsLM=",
  "szua/RN+5mTwzKhqTKiO7uc7Y893j14bYnOevm3UCYk=",
  "sQpVd3DjVAxMTrpWAZpebGIW0PsHr6xAYtenUIymbm4=",
  "SuR1RHwr2HPAm0p8qbuVh9Pqbx+RJnJ/mWNtBZSy9C0=",
  "QbylbhZsSL75OL4NDP2HDPRMjtmgr7DguMEhdk/YbEA=",
  "jnfzFrJufxib7NKZRvmQEj6aSEiJ1RSpGknbbXDey6s=",
  "TcTQd+HmML769MvTdqixiLSvXjkJHlgb2637WPm6Ctw=",
  "eVORcM85u+jhLe+Mr0lOUIh36sjVIABkz640fYi/zWo=",
  "F7dMUZF8ZUTnc/FRNwhRpHmUlhWD+3VY2GMYVzAG2Os=",
  "ZpRR5ziOkaqWFJy7NLn12bD1K4JSeHtJaBGsi1qhKNM=",
  "0s7P4UcwcP4oBFvNVhM6iDIz8J8kkcVIKoBS7W9RvCk=",
  "l4Ot0y9UZQ0vMJrAbrsSmgxcUUUsRxlLcS3CQa/GJwU=",
  "lCAm/sRHvQlb4zPpmeT2fpf9X2QufVxwyhN52RKJDvk=",
  "sJJ9jNdXwa0I0HyE+xoLWc80FZjzyyGJLiFF8fxBtgw=",
  "db/jwK4EN8dFKChTvqhOfU45ejG7AK6rkbeWLSX8pM0=",
  "wIbOYgoSJ9jcaps6N2vX3Qb/jXoyliwhQlDRnf16jkU=",
  "gbgpBQ9hh2/Z4cSx7t/IcCxH6rsJ99gmYckR2L5knZQ=",
  "EKa1Ex5z1FS+bbTVXoMLyHTOKBQW60CKQPexJFRxXUQ=",
  "eh1ppdb4UjCdJs5CJJX6FIcTasS2p78LtR1Km4Pw61g=",
  "GZmGf6K2rsowM0FRwYzbQtWwhgN0taILk9RXL0uXy7U=",
  "ZivENWMdPIr9f/7mecAkhVlRq03aSm9a0htgJ0OK1jA=",
  "Q4MhnBblIciPpmzjBRScyaxEdJA5WkptbPsNBXwQ9dQ=",
  "4VpVsRgSVG0CeJPJiBIwk8m32+goq+T7/3/saziGESE=",
  "rxM5DaV7nXWOlIfpYvkIcaSmMMLGpdP9o/Lz/KVcqzY=",
  "G9haygKPgQD1m15khigBSFmFDidJ4sET43JUGzjWV4M=",
  "yL2fb/cRrobRjMtaL9bwPP0fO+6fjw7b1n1zgdE3+kY=",
  "9y7sI3jic0ISxd/nib5K3gGCx+eGUQVqWY1nqkcLdmc=",
  "AOD/79C6cpOdCZqP7kwYmP0/5Il41pVBK9vDEoM6wog=",
  "oPoksPqQxJTQozOaY4VQqec4oIQPOEc99fb3f3RNnrU=",
  "O7TsHbbF/63JXF4zJAS8dHldWBKgRVtrOh0EEQUCn4w=",
  "cDLEVbnwadMIj5thqrLWhB7Vq7DwLiRMXyOr4gQgoyo=",
  "S/USTJqgH0/LbxHzaV3i8vANhbdFZK5dusOaIpQB2j8=",
  "fc8p+FwXjtni+aK1/Hbx+uHwBhBmwkDhAGLunyJZu0A=",
  "6ovAXP8CGRpqgCPYtiGtksGsjf3srA5r+2+i7g348ds=",
  "Meya+XfnLpMWhprsQjTGX1IV8GxyCqZY0DyCObhK2Kc=",
  "qxxz40pXmi3nzl8koVGDjHYZqaghtlqGjGHG7/nY5Ng=",
  "NKpXtZyZedOZoGp/2i1Dv0YX2rgCv0Nv6xqtlOeeCmo=",
  "pM+duDkqnFX7QYkRRwuebz7iQXGGbMa4Dnuvk6vsMaU=",

  // Locale-specific inline scripts for `/zh` home route (JSON-LD + streamed RSC payload).
  "JSkRdWTPUR13OV2dQyqC3uQxDGf1sZx5yC7aqOJty4M=",
  "UVgINgKK3LVb6bhjXJWh8hfnTavN7GZTFOIGDQ3lyRM=",
  "PiQmtASgrSXJNzmwZKaEZNvn22kxNIfAZYLVJnEk+Do=",
  "WyfG6NY0f0xIXlGStZVlpW1fJnNtUjtLbbT9MJyKk9s=",
  "HjpLMcMiPrZVU+FT38R4Qt03O2e2GP7oWkQfkYkRRS8=",
  "SC4GnB0JppsvMJHIGLsrxPLLstapQTkC6Fw3RpjT64k=",
  "RKt8AzwGogBNUIYcYZUiZAEtHgR5DpIdU19ZtbVQIlY=",
  "PJm0pssBy6vJj8cIMqkJyZGFc73C0AS8lwpvb2JaiFQ=",
  "B7XOKvTDjW4iB489JD2EScQCgmDUEs77y2LQQ6AruR4=",
  "4OGdbQIPL3t2vWEJk+nlMT0HkwuzNZXc3e/KvOhdhuc=",
  "AOBHr1FBrzIDSGqfPP/RI9aM0MpWR95BSkK7wVW0uxY=",
  "AsvEoz+JDrCzwwdXBEErPRA03OQkg3D8L7qy4+NuME4=",
  "0Qm7UMUi4DkucIUNZ+qL6TzDimnKpSGJMidtTF/r3g8=",
  "CkAmRPxDDWOVjSjro4KixUBcqPIIrkDvTG6tV3qvhfE=",
  "l1ayS7A4iWMJ8uuMCO/Vw8F4G+F4dE6p8nTaPLZ2GfU=",
  "qF/FBLuL/ecPlVPAhJmwghVquRqIggEUPvjcT4INu/U=",
  "Euvn/D2lxIJQrtecgRKS+rQMXiLQZQM2IwZgqTZg9UI=",
  "aozu9HJvbTD4LGaRx0vPFVW4iXdovqy+C0YcosXIimQ=",
  "g6zO4H4Di1qN16Siv+xNyOELQuvumJK1NL5o2yFovag=",
  "2Zg+bZDkzCRcD1SqLP1By2bpkwpWQfm2uI9teFaxetY=",
  "E/wGanCwf/wQgW+ysZwYH7eJ1yUvuS99WVxFCP8ROWU=",
  "rbUVdlIggQ9Cj+5XgWhfJSfjhrzhoG3+pJJKKZeYSHs=",
  "GWOAbATCHaIdWd6jjHmEWnMUdfhqtObUmyWLXdkfwjs=",
  "3o4731GY8HLpyHo5RScufaD2m78gpkAa531j4d94tWw=",
  "/OwToF+uBxkoQVUrWbqrdmvdc94wVm9pdP+idASmwXY=",
  "xqOt0zoFUpoNN84A8gP08OEi3X0yVVH0Npf5HVqL0Oc=",
  "ntR8eGDBYKo/IyuCMxEyfQBbFmTBybpNP6qTNr2j0C0=",
  "NDA5brdW4zL8+/ZBsipmKL+ey3BcRjTnS01GG4z+sfI=",
  "20TWICeszp8iD0i2sfLJKDpe9q2e334BkvAWL/o2wBw=",
  "8xFAmRSxI6MIpjUx6NgUOLAqzm5AZJ1PonsDK+epynE=",
  "K8ONXw7k6k/v9qI9qxOxB/tJMnY2p64oUMlfjMWzoCg=",
  "BICkdhtdsvaSwjdsGy5ERLSJrHUseggFwP9dOKo1Dvk=",
  "M2BxCRRtIfqMQoaQZDHjblE+yY8PqB69WX9S+Nocc7g=",
  "8X+udnTnCK3GR8AyhavweZF92bhbWcb2eHbfMCpmQFk=",
  "PqqRqjOSwIMhATFlolONzUNqlKH8kf6S+rK+G5uGNfg=",
  "Z30ft2XogmyWnqNL9ry/UlkQDqgj1ynWiNDL/NFzgCY=",
  "dqFs8AGqrorMuZcCo0Dzxw0RzTLF2dotbxScUNIaods=",
  "FXLkGXkqwiRO+IpKooxvCZQa0YDhJmspeUanXxrLad8=",
  "VTLEvRTo7MVijRlpd4qqZiiS6gptD3EL+LcpHb3K/Fo=",

  // Locale-specific inline scripts for `/zh` home route after Wave B schema/nav updates.
  "/l+U8XzvFtqMOXbYkt7U9syC0UWvut8OcTrV893R2nU=",
  "TQR9bOot/1E/5X7HrwLg9Z5RLWOC1tdWNH6cjFEZhuo=",
  "Q5HqcOzinS2Lpe8U0jOqQHE4IFvf8YxMOHlG0hhq8K4=",
  "xHCu3ijXSSiKcq6eh7xS+76fqmCEE1xxAqKTQTQ9G1M=",
  "isOGDKRga6Xd4txIxJcfNucAUZsRyfpNTKLi5pauUGs=",
  "0WdQp6Aq4jXr1wHDOcAenq9A3ePK+VWR/rPo6mKF9BM=",
  "A3qcKjA9AnKVEShbQOktFsh2WdX1umEWaDmAyjh//g8=",
  "gKPWxHkmPx5JYKylzFheKqFJIeWvG8dIanvv9a05Tt8=",
  "4IWLFeg24B0VgHsFAflNau+Yybg2vSStVEhA0syTTr0=",
  "7MYPqWv53oSMkwrBVWH24kTj+/IWvaS/s8ruyNnG8sg=",
  "c2mvWkqA0ypUzzRF0VU/IdYXvPeu2ftIZoGUVRw7T8w=",
  "Ra48qGlimbJBr1HQORs9o9aORJNtnTM7Uznvo/qJky4=",
] as const;

// Exported for CI/runtime verification scripts (see scripts/csp/check-inline-scripts.ts).
export const CSP_INLINE_SCRIPT_SHA256_BASE64_ALLOWLIST_FOR_TESTS =
  CSP_INLINE_SCRIPT_SHA256_BASE64_ALLOWLIST;

/**
 * Security configuration for the application
 * Includes CSP, security headers, and other security-related settings
 */

/**
 * Content Security Policy configuration
 */
export function generateCSP(nonce?: string): string {
  const isDevelopment = isRuntimeDevelopment();
  const isProduction = isRuntimeProduction();
  const configuredReportUri = getRuntimeEnvString("CSP_REPORT_URI")?.trim();
  const reportUri =
    configuredReportUri && configuredReportUri.length > ZERO
      ? configuredReportUri
      : "/api/csp-report";

  // Base CSP directives
  const cspDirectives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      // Allow inline scripts with nonce in production, unsafe-inline in development
      ...(isDevelopment
        ? ["'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"]
        : []),
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      ...CSP_INLINE_SCRIPT_SHA256_BASE64_ALLOWLIST.map(
        (hash) => `'sha256-${hash}'`,
      ),
      // Vercel Analytics
      "https://va.vercel-scripts.com",
      // Cloudflare Turnstile
      "https://challenges.cloudflare.com",
      // Google Analytics (if enabled)
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
    ],
    // App Router static/prerendered responses still emit inline framework/data
    // scripts that cannot receive a request nonce. Keep `script-src` strict for
    // non-<script> execution paths, but explicitly allow inline <script> blocks
    // so prerendered routes hydrate correctly under CSP.
    "script-src-elem": [
      "'self'",
      "'unsafe-inline'",
      ...(isDevelopment ? ["'unsafe-eval'", "https://unpkg.com"] : []),
      "https://va.vercel-scripts.com",
      "https://challenges.cloudflare.com",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
    ],
    "style-src": [
      "'self'",
      // Allow unsafe-inline for Tailwind CSS (required for both dev and prod)
      "'unsafe-inline'",
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      "https://fonts.googleapis.com",
    ],
    // Runtime style tags injected by framework/client libraries cannot reliably
    // receive a request nonce on prerendered routes. Keep element-level policy
    // explicit so browsers don't ignore `unsafe-inline` via the fallback list.
    "style-src-elem": [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
    ],
    // The app intentionally renders style attributes in several server components
    // (grid decorations, responsive placeholders, and streamed fallback shells).
    // Make this explicit to stop browsers from treating style attributes as an
    // implicit fallback violation.
    "style-src-attr": ["'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "https:",
      // Vercel Analytics
      "https://va.vercel-scripts.com",
      // External image sources
      "https://images.unsplash.com",
      "https://via.placeholder.com",
      // Google Analytics
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com",
    ],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      // Vercel Analytics
      "https://vitals.vercel-insights.com",
      // API endpoints
      ...(isDevelopment ? ["http://localhost:*", "ws://localhost:*"] : []),
      // External APIs
      "https://api.resend.com",
      // Google Analytics
      "https://www.google-analytics.com",
      "https://analytics.google.com",
      "https://region1.google-analytics.com",
    ],
    "frame-src": [
      // Cloudflare Turnstile (removed 'none' - conflicts with allowlist)
      "https://challenges.cloudflare.com",
    ],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "report-uri": [reportUri],
    "upgrade-insecure-requests": isProduction ? [] : undefined,
  };

  // Convert directives to CSP string
  return Object.entries(cspDirectives)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      if (Array.isArray(value) && value.length > ZERO) {
        return `${key} ${value.join(" ")}`;
      }
      return key;
    })
    .join("; ");
}

/**
 * Security headers configuration
 */
export function isSecurityHeadersEnabled(testMode = false): boolean {
  if (testMode) {
    return getRuntimeEnvBoolean("SECURITY_HEADERS_ENABLED") !== false;
  }

  if (isRuntimeTest()) {
    return getRuntimeEnvBoolean("SECURITY_HEADERS_ENABLED") !== false;
  }

  return getRuntimeEnvBoolean("SECURITY_HEADERS_ENABLED") !== false;
}

export function getSecurityHeaders(
  nonce?: string,
  testMode = false,
): SecurityHeader[] {
  if (!isSecurityHeadersEnabled(testMode)) {
    return [];
  }

  const securityConfig = getSecurityConfig(testMode);
  const cspHeaderKey = securityConfig.cspReportOnly
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy";

  return [
    // Prevent clickjacking
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
    // Prevent MIME type sniffing
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    // Referrer policy
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    // HSTS (HTTP Strict Transport Security)
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    // Content Security Policy (enforced or report-only based on security mode)
    {
      key: cspHeaderKey,
      value: generateCSP(nonce),
    },
    // Permissions Policy (formerly Feature Policy)
    {
      key: "Permissions-Policy",
      value: [
        "camera=()",
        "microphone=()",
        "geolocation=()",
        "interest-cohort=()",
        "payment=()",
        "usb=()",
      ].join(", "),
    },
    // Cross-Origin policies
    {
      key: "Cross-Origin-Embedder-Policy",
      value: "unsafe-none", // Changed from require-corp for compatibility
    },
    {
      key: "Cross-Origin-Opener-Policy",
      value: "same-origin",
    },
    {
      key: "Cross-Origin-Resource-Policy",
      value: "cross-origin",
    },
  ];
}

/**
 * Generate a cryptographically secure nonce for CSP
 *
 * Requirements:
 * - Minimum 128 bits (16 bytes) entropy per OWASP best practices
 * - 32 hex characters output for CSP compatibility
 * - Must pass isValidNonce validation
 */
const NONCE_BYTE_LENGTH = HEX_RADIX; // 16 bytes = 128 bits = 32 hex characters
const NONCE_HEX_PAD = COUNT_TWO;

export function generateNonce(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    // randomUUID returns 36 chars with hyphens, removing hyphens gives 32 hex chars
    // Use full 32 chars for 128-bit entropy
    return crypto.randomUUID().replace(/-/g, "");
  }

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(NONCE_BYTE_LENGTH);
    crypto.getRandomValues(bytes);
    // Convert to hex: 16 bytes = 32 hex characters = 128 bits
    return Array.from(bytes, (value) =>
      value.toString(HEX_RADIX).padStart(NONCE_HEX_PAD, "0"),
    ).join("");
  }

  throw new Error("Secure nonce generation unavailable");
}

/**
 * Security mode configuration
 */
export const SECURITY_MODES = {
  strict: {
    cspReportOnly: false,
    enforceHTTPS: true,
    strictTransportSecurity: true,
    contentTypeOptions: true,
    frameOptions: "DENY",
    xssProtection: true,
  },
  moderate: {
    cspReportOnly: false,
    enforceHTTPS: true,
    strictTransportSecurity: true,
    contentTypeOptions: true,
    frameOptions: "SAMEORIGIN",
    xssProtection: true,
  },
  relaxed: {
    cspReportOnly: true,
    enforceHTTPS: false,
    strictTransportSecurity: false,
    contentTypeOptions: true,
    frameOptions: "SAMEORIGIN",
    xssProtection: false,
  },
} as const;

/**
 * Get security configuration based on mode
 */
export function getSecurityConfig(_testMode = false) {
  const rawMode = getRuntimeEnvString("NEXT_PUBLIC_SECURITY_MODE") || "strict";

  const mode =
    rawMode === "moderate" || rawMode === "relaxed" ? rawMode : "strict";

  switch (mode) {
    case "moderate":
      return SECURITY_MODES.moderate;
    case "relaxed":
      return SECURITY_MODES.relaxed;
    case "strict":
    default:
      return SECURITY_MODES.strict;
  }
}

/**
 * Validate CSP nonce (128-bit minimum entropy)
 */
export function isValidNonce(nonce: string): boolean {
  // Nonce should be at least 32 characters (128 bits) and contain only alphanumeric characters
  return /^[a-zA-Z0-9]{32,}$/.test(nonce);
}

/**
 * CSP report endpoint handler type
 */
export interface CSPReport {
  "csp-report": {
    "document-uri": string;
    referrer: string;
    "violated-directive": string;
    "effective-directive": string;
    "original-policy": string;
    disposition: string;
    "blocked-uri": string;
    "line-number": number;
    "column-number": number;
    "source-file": string;
    "status-code": number;
    "script-sample": string;
  };
}

/**
 * Security utilities
 */
export const SecurityUtils = {
  generateCSP,
  getSecurityHeaders,
  generateNonce,
  getSecurityConfig,
  isValidNonce,
} as const;

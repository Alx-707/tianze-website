/**
 * Route parsing utilities for i18n navigation
 *
 * Provides functions to parse and normalize pathnames for use with next-intl's
 * Link component, handling both static and dynamic routes.
 */
import type { ComponentProps } from "react";
import type { Link } from "@/i18n/routing";

/**
 * Type for Link href prop, extracted from next-intl's Link component.
 * Supports both string paths and objects with pathname + params for dynamic routes.
 */
export type LinkHref = ComponentProps<typeof Link>["href"];

/**
 * Dynamic route pattern configuration.
 * Maps URL patterns to their corresponding Link href builders.
 */
interface DynamicRoutePattern {
  /** Regex pattern to match the URL */
  pattern: RegExp;
  /** Function to build the Link href from captured groups */
  buildHref: (param: string) => LinkHref;
}

/**
 * Dynamic route patterns for matching actual URLs to route patterns.
 *
 * When a user navigates between locales, the current URL (e.g., `/blog/my-post`)
 * needs to be mapped back to its route pattern (e.g., `/blog/[slug]`) with params.
 *
 * @example
 * // URL: /blog/my-post
 * // Matches pattern: /^\/blog\/([^/]+)$/
 * // Returns: { pathname: "/blog/[slug]", params: { slug: "my-post" } }
 */
export const DYNAMIC_ROUTE_PATTERNS: readonly DynamicRoutePattern[] = [
  {
    pattern: /^\/blog\/([^/]+)$/,
    buildHref: (slug: string): LinkHref => ({
      pathname: "/blog/[slug]",
      params: { slug },
    }),
  },
  {
    pattern: /^\/products\/([^/]+)$/,
    buildHref: (slug: string): LinkHref => ({
      pathname: "/products/[slug]",
      params: { slug },
    }),
  },
] as const;

/**
 * Regex to match and strip locale prefixes from pathnames.
 *
 * NOTE: When adding new locales to the application, this regex
 * must be updated to include them.
 *
 * @example
 * "/en/about".replace(LOCALE_PREFIX_RE, "") // → "/about"
 * "/zh/blog/post".replace(LOCALE_PREFIX_RE, "") // → "/blog/post"
 * "/about".replace(LOCALE_PREFIX_RE, "") // → "/about" (no change)
 */
export const LOCALE_PREFIX_RE = /^\/(en|zh)(?=\/|$)/;

/**
 * Normalizes a pathname by stripping the locale prefix and handling edge cases.
 * Ensures consistent pathname format for Link href construction.
 *
 * @param pathname - Pathname from usePathname() (no query/hash, may have locale prefix)
 * @returns Normalized pathname without locale prefix (guaranteed to start with '/' or be '/')
 *
 * @example
 * normalizePathnameForLink("/en/about")  // → "/about"
 * normalizePathnameForLink("/zh/")       // → "/"
 * normalizePathnameForLink("")           // → "/"
 * normalizePathnameForLink("/about")     // → "/about"
 */
export function normalizePathnameForLink(pathname: string): string {
  const normalized = pathname === "" ? "/" : pathname;
  const stripped = normalized.replace(LOCALE_PREFIX_RE, "");
  return stripped === "" ? "/" : stripped;
}

/**
 * Parses a pathname to build the appropriate href for next-intl's Link component.
 *
 * Handles both:
 * - Static routes: Returns the pathname string directly
 * - Dynamic routes: Returns an object with pathname pattern and params
 *
 * @param currentPathname - Current pathname from usePathname()
 * @returns LinkHref suitable for the Link component's href prop
 *
 * @example
 * // Static route
 * parsePathnameForLink("/en/about")
 * // → "/about"
 *
 * // Dynamic route
 * parsePathnameForLink("/zh/blog/my-post")
 * // → { pathname: "/blog/[slug]", params: { slug: "my-post" } }
 */
export function parsePathnameForLink(currentPathname: string): LinkHref {
  const pathname = normalizePathnameForLink(currentPathname);

  for (const { pattern, buildHref } of DYNAMIC_ROUTE_PATTERNS) {
    const match = pathname.match(pattern);
    if (match?.[1]) {
      return buildHref(match[1]);
    }
  }

  // Static routes - cast required because usePathname returns runtime string
  // Safe because usePathname only returns valid configured pathnames
  return pathname as LinkHref;
}

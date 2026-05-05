import type { PageType } from "@/config/paths/types";
import { getCanonicalPath, getProductMarketPath } from "@/config/paths/utils";
import { getAllMarketSlugs } from "@/constants/product-catalog";
import { getMarketSpecsBySlug } from "@/constants/product-specs/market-spec-registry";

export type SingleSiteSitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

/**
 * Canonical public-static SEO inputs for the current single-site baseline.
 *
 * Split of responsibility:
 * - `single-site.ts`: brand/contact/default SEO identity
 * - `single-site-page-expression.ts`: reusable page-expression inputs
 * - `single-site-seo.ts`: sitemap / robots / public static page SEO defaults
 */

export interface SingleSiteSitemapPageConfig {
  changeFrequency: SingleSiteSitemapChangeFrequency;
  priority: number;
}

const SINGLE_SITE_STATIC_LASTMOD_ISO = "2026-04-26T00:00:00Z";
const UTC_SECONDS_ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

export const SINGLE_SITE_PRODUCT_MARKET_LASTMOD_SOURCE =
  "market-specs.updatedAt" as const;

function toSitemapStaticPath(path: string): string {
  return path === "/" ? "" : path;
}

function fromRouteConfig<T>(
  configByPageType: Partial<Record<PageType, T>>,
): Record<string, T> {
  return Object.fromEntries(
    (Object.entries(configByPageType) as Array<[PageType, T]>).map(
      ([pageType, config]) => [
        toSitemapStaticPath(getCanonicalPath(pageType)),
        config,
      ],
    ),
  );
}

export const SINGLE_SITE_PUBLIC_STATIC_PAGE_ROUTES = [
  "home",
  "about",
  "contact",
  "products",
  "privacy",
  "terms",
  "oem",
] as const satisfies readonly PageType[];

export const SINGLE_SITE_PUBLIC_STATIC_PAGES =
  SINGLE_SITE_PUBLIC_STATIC_PAGE_ROUTES.map((pageType) =>
    toSitemapStaticPath(getCanonicalPath(pageType)),
  );

const SINGLE_SITE_STATIC_SITEMAP_PAGE_CONFIG_BY_ROUTE = {
  home: { changeFrequency: "daily", priority: 1.0 },
  about: { changeFrequency: "monthly", priority: 0.8 },
  contact: { changeFrequency: "monthly", priority: 0.8 },
  products: { changeFrequency: "weekly", priority: 0.9 },
  privacy: { changeFrequency: "monthly", priority: 0.7 },
  terms: { changeFrequency: "monthly", priority: 0.7 },
  oem: { changeFrequency: "monthly", priority: 0.8 },
} as const satisfies Record<PageType, SingleSiteSitemapPageConfig>;

export const SINGLE_SITE_SITEMAP_PAGE_CONFIG: Readonly<
  Record<string, SingleSiteSitemapPageConfig>
> = {
  ...fromRouteConfig<SingleSiteSitemapPageConfig>(
    SINGLE_SITE_STATIC_SITEMAP_PAGE_CONFIG_BY_ROUTE,
  ),
  productMarket: { changeFrequency: "weekly", priority: 0.8 },
} as const;

export const SINGLE_SITE_SITEMAP_DEFAULT_CONFIG = {
  changeFrequency: "weekly",
  priority: 0.5,
} as const satisfies SingleSiteSitemapPageConfig;

const SINGLE_SITE_STATIC_PAGE_LASTMOD_BY_ROUTE = {
  // Non-MDX routes and product market pages use this sidecar date source.
  // MDX-driven pages read updatedAt from content/pages/{locale}/*.mdx.
  home: SINGLE_SITE_STATIC_LASTMOD_ISO,
  products: SINGLE_SITE_STATIC_LASTMOD_ISO,
} as const satisfies Partial<Record<PageType, string>>;

function getRequiredProductMarketUpdatedAt(marketSlug: string): string {
  const updatedAt = getMarketSpecsBySlug(marketSlug)?.updatedAt;
  if (!updatedAt) {
    throw new Error(`Missing product market sitemap updatedAt: ${marketSlug}`);
  }

  const date = new Date(updatedAt);
  const timestamp = date.getTime();
  const normalizedDate = Number.isNaN(timestamp)
    ? undefined
    : date.toISOString().replace(".000Z", "Z");
  if (
    !UTC_SECONDS_ISO_DATE_PATTERN.test(updatedAt) ||
    normalizedDate !== updatedAt
  ) {
    throw new Error(`Invalid product market sitemap updatedAt: ${marketSlug}`);
  }

  return updatedAt;
}

export const SINGLE_SITE_STATIC_PAGE_LASTMOD = {
  ...fromRouteConfig(SINGLE_SITE_STATIC_PAGE_LASTMOD_BY_ROUTE),
} as const satisfies Record<string, string>;

export function getSingleSiteSitemapLastmod(): Record<string, string> {
  return {
    ...SINGLE_SITE_STATIC_PAGE_LASTMOD,
    ...Object.fromEntries(
      getAllMarketSlugs().map((marketSlug) => [
        getProductMarketPath(marketSlug),
        getRequiredProductMarketUpdatedAt(marketSlug),
      ]),
    ),
  };
}

export const SINGLE_SITE_ROBOTS_DISALLOW_PATHS = [
  "/api/",
  "/_next/",
  "/error-test/",
] as const;

export function getSingleSiteSitemapPageConfig(
  path: string,
): SingleSiteSitemapPageConfig {
  return (
    SINGLE_SITE_SITEMAP_PAGE_CONFIG[path] ?? SINGLE_SITE_SITEMAP_DEFAULT_CONFIG
  );
}

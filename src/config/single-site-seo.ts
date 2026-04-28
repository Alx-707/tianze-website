import { PATHS_CONFIG } from "@/config/paths/paths-config";

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

export const SINGLE_SITE_PUBLIC_STATIC_PAGES = Object.values(PATHS_CONFIG).map(
  (paths) => (paths.en === "/" ? "" : paths.en),
);

export const SINGLE_SITE_SITEMAP_PAGE_CONFIG = {
  "": { changeFrequency: "daily", priority: 1.0 },
  "/about": { changeFrequency: "monthly", priority: 0.8 },
  "/contact": { changeFrequency: "monthly", priority: 0.8 },
  "/products": { changeFrequency: "weekly", priority: 0.9 },
  "/privacy": { changeFrequency: "monthly", priority: 0.7 },
  "/terms": { changeFrequency: "monthly", priority: 0.7 },
  "/oem-custom-manufacturing": {
    changeFrequency: "monthly",
    priority: 0.8,
  },
  productMarket: { changeFrequency: "weekly", priority: 0.8 },
} as const satisfies Record<string, SingleSiteSitemapPageConfig>;

export const SINGLE_SITE_SITEMAP_DEFAULT_CONFIG = {
  changeFrequency: "weekly",
  priority: 0.5,
} as const satisfies SingleSiteSitemapPageConfig;

export const SINGLE_SITE_STATIC_PAGE_LASTMOD = {
  // Non-MDX routes and product market pages use this sidecar date source.
  // MDX-driven pages read updatedAt from content/pages/{locale}/*.mdx.
  "": "2026-04-26T00:00:00Z",
  "/products": "2026-04-26T00:00:00Z",
  "/products/north-america": "2026-04-26T00:00:00Z",
  "/products/australia-new-zealand": "2026-04-26T00:00:00Z",
  "/products/mexico": "2026-04-26T00:00:00Z",
  "/products/europe": "2026-04-26T00:00:00Z",
  "/products/pneumatic-tube-systems": "2026-04-26T00:00:00Z",
} as const satisfies Record<string, string>;

export const SINGLE_SITE_ROBOTS_DISALLOW_PATHS = [
  "/api/",
  "/_next/",
  "/error-test/",
] as const;

export function getSingleSiteSitemapPageConfig(
  path: string,
): SingleSiteSitemapPageConfig {
  if (
    Object.prototype.hasOwnProperty.call(SINGLE_SITE_SITEMAP_PAGE_CONFIG, path)
  ) {
    return SINGLE_SITE_SITEMAP_PAGE_CONFIG[
      path as keyof typeof SINGLE_SITE_SITEMAP_PAGE_CONFIG
    ];
  }

  return SINGLE_SITE_SITEMAP_DEFAULT_CONFIG;
}

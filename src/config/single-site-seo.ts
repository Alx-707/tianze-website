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

export const SINGLE_SITE_PUBLIC_STATIC_PAGES = [
  "",
  "/about",
  "/contact",
  "/products",
  "/blog",
  "/privacy",
  "/terms",
  "/capabilities/bending-machines",
  "/oem-custom-manufacturing",
] as const;

export const SINGLE_SITE_SITEMAP_PAGE_CONFIG = {
  "": { changeFrequency: "daily", priority: 1.0 },
  "/about": { changeFrequency: "monthly", priority: 0.8 },
  "/contact": { changeFrequency: "monthly", priority: 0.8 },
  "/products": { changeFrequency: "weekly", priority: 0.9 },
  "/blog": { changeFrequency: "weekly", priority: 0.7 },
  "/privacy": { changeFrequency: "monthly", priority: 0.7 },
  "/terms": { changeFrequency: "monthly", priority: 0.7 },
  "/capabilities/bending-machines": {
    changeFrequency: "monthly",
    priority: 0.8,
  },
  "/oem-custom-manufacturing": {
    changeFrequency: "monthly",
    priority: 0.8,
  },
  blogPost: { changeFrequency: "monthly", priority: 0.6 },
  productMarket: { changeFrequency: "weekly", priority: 0.8 },
} as const satisfies Record<string, SingleSiteSitemapPageConfig>;

export const SINGLE_SITE_SITEMAP_DEFAULT_CONFIG = {
  changeFrequency: "weekly",
  priority: 0.5,
} as const satisfies SingleSiteSitemapPageConfig;

export const SINGLE_SITE_STATIC_PAGE_LASTMOD = {
  "": "2024-12-01T00:00:00Z",
  "/about": "2024-06-01T00:00:00Z",
  "/contact": "2024-06-01T00:00:00Z",
  "/products": "2024-11-01T00:00:00Z",
  "/blog": "2024-11-01T00:00:00Z",
  "/privacy": "2024-06-01T00:00:00Z",
  "/terms": "2024-06-01T00:00:00Z",
  "/capabilities/bending-machines": "2026-03-23T00:00:00Z",
  "/oem-custom-manufacturing": "2026-03-23T00:00:00Z",
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

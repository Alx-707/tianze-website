import { describe, expect, it } from "vitest";
import {
  SINGLE_SITE_PUBLIC_STATIC_PAGES,
  SINGLE_SITE_ROBOTS_DISALLOW_PATHS,
  SINGLE_SITE_SITEMAP_DEFAULT_CONFIG,
  SINGLE_SITE_SITEMAP_PAGE_CONFIG,
  SINGLE_SITE_STATIC_PAGE_LASTMOD,
} from "@/config/single-site-seo";

describe("single-site-seo", () => {
  it("keeps the public static sitemap pages explicit", () => {
    expect(SINGLE_SITE_PUBLIC_STATIC_PAGES).toContain("/about");
    expect(SINGLE_SITE_PUBLIC_STATIC_PAGES).toContain("/contact");
    expect(SINGLE_SITE_PUBLIC_STATIC_PAGES).toContain(
      "/capabilities/bending-machines",
    );
    expect(SINGLE_SITE_PUBLIC_STATIC_PAGES).toContain(
      "/oem-custom-manufacturing",
    );
  });

  it("keeps sitemap configs explicit for special page types", () => {
    expect(SINGLE_SITE_SITEMAP_PAGE_CONFIG["/terms"]).toEqual({
      changeFrequency: "monthly",
      priority: 0.7,
    });
    expect(SINGLE_SITE_SITEMAP_PAGE_CONFIG.productMarket).toEqual({
      changeFrequency: "weekly",
      priority: 0.8,
    });
    expect(SINGLE_SITE_SITEMAP_DEFAULT_CONFIG).toEqual({
      changeFrequency: "weekly",
      priority: 0.5,
    });
  });

  it("keeps static page lastmod defaults and robots disallow list centralized", () => {
    expect(SINGLE_SITE_STATIC_PAGE_LASTMOD["/products"]).toBe(
      "2026-04-26T00:00:00Z",
    );
    expect(SINGLE_SITE_ROBOTS_DISALLOW_PATHS).toEqual([
      "/api/",
      "/_next/",
      "/error-test/",
    ]);
  });
});

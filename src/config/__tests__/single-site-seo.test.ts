import { afterEach, describe, expect, it, vi } from "vitest";
import { PATHS_CONFIG } from "@/config/paths/paths-config";
import { getCanonicalPath, getProductMarketPath } from "@/config/paths/utils";
import {
  SINGLE_SITE_PUBLIC_STATIC_PAGE_ROUTES,
  SINGLE_SITE_PUBLIC_STATIC_PAGES,
  SINGLE_SITE_PRODUCT_MARKET_LASTMOD_SOURCE,
  SINGLE_SITE_ROBOTS_DISALLOW_PATHS,
  SINGLE_SITE_SITEMAP_DEFAULT_CONFIG,
  SINGLE_SITE_SITEMAP_PAGE_CONFIG,
  SINGLE_SITE_STATIC_PAGE_LASTMOD,
  getSingleSiteSitemapLastmod,
} from "@/config/single-site-seo";
import { getAllMarketSlugs } from "@/constants/product-catalog";
import { getMarketSpecsBySlug } from "@/constants/product-specs/market-spec-registry";
import type { MarketSpecs } from "@/constants/product-specs/types";

function createMockMarketSpecs(updatedAt: string): MarketSpecs {
  return {
    updatedAt,
    technical: {},
    certifications: [],
    trade: {
      moq: "100 cartons",
      leadTime: "30 days",
      supplyCapacity: "10000 cartons/month",
      packaging: "Carton",
      portOfLoading: "Ningbo",
    },
    families: [],
  };
}

describe("single-site-seo", () => {
  const RETIRED_BENDING_MACHINES_PATH = "/capabilities/bending-machines";

  afterEach(() => {
    vi.doUnmock("@/constants/product-catalog");
    vi.doUnmock("@/constants/product-specs/market-spec-registry");
    vi.resetModules();
  });

  it("keeps public static sitemap pages as an explicit route allowlist", () => {
    expect(SINGLE_SITE_PUBLIC_STATIC_PAGE_ROUTES).toEqual([
      "home",
      "about",
      "contact",
      "products",
      "blog",
      "privacy",
      "terms",
    ]);
    expect([...SINGLE_SITE_PUBLIC_STATIC_PAGE_ROUTES].sort()).toEqual(
      Object.keys(PATHS_CONFIG).sort(),
    );

    const expectedPages = SINGLE_SITE_PUBLIC_STATIC_PAGE_ROUTES.map(
      (pageType) => {
        const canonicalPath = getCanonicalPath(pageType);
        return canonicalPath === "/" ? "" : canonicalPath;
      },
    );

    expect(SINGLE_SITE_PUBLIC_STATIC_PAGES).toEqual(expectedPages);
    expect(SINGLE_SITE_PUBLIC_STATIC_PAGES).not.toContain(
      RETIRED_BENDING_MACHINES_PATH,
    );
    expect(SINGLE_SITE_PUBLIC_STATIC_PAGES).not.toContain(
      "/oem-custom-manufacturing",
    );
  });

  it("keeps sitemap configs explicit for special page types", () => {
    expect(SINGLE_SITE_SITEMAP_PAGE_CONFIG[getCanonicalPath("terms")]).toEqual({
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
    expect(SINGLE_SITE_STATIC_PAGE_LASTMOD[getCanonicalPath("products")]).toBe(
      "2026-04-26T00:00:00Z",
    );
    for (const marketSlug of getAllMarketSlugs()) {
      const specs = getMarketSpecsBySlug(marketSlug);

      expect(specs, `${marketSlug} should have market specs`).toBeDefined();
      expect(
        getSingleSiteSitemapLastmod()[getProductMarketPath(marketSlug)],
      ).toBe(specs?.updatedAt);
    }
    expect(SINGLE_SITE_ROBOTS_DISALLOW_PATHS).toEqual([
      "/api/",
      "/_next/",
      "/error-test/",
    ]);
  });

  it("declares product market sitemap freshness as market specs updatedAt", () => {
    expect(SINGLE_SITE_PRODUCT_MARKET_LASTMOD_SOURCE).toBe(
      "market-specs.updatedAt",
    );

    for (const marketSlug of getAllMarketSlugs()) {
      const specs = getMarketSpecsBySlug(marketSlug);

      expect(specs?.updatedAt, `${marketSlug} updatedAt`).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
      );
      expect(
        getSingleSiteSitemapLastmod()[getProductMarketPath(marketSlug)],
        `${marketSlug} lastmod`,
      ).toBe(specs?.updatedAt);
    }
  });

  it("throws when a product market has no sitemap updatedAt source", async () => {
    vi.resetModules();
    vi.doMock("@/constants/product-catalog", () => ({
      getAllMarketSlugs: () => ["mock-market"],
    }));
    vi.doMock("@/constants/product-specs/market-spec-registry", () => ({
      getMarketSpecsBySlug: () => undefined,
    }));

    const seoConfig = await import("@/config/single-site-seo");

    expect(() => seoConfig.getSingleSiteSitemapLastmod()).toThrow(
      "Missing product market sitemap updatedAt: mock-market",
    );
  });

  it("does not validate product sitemap dates when reading robots config", async () => {
    vi.resetModules();
    vi.doMock("@/constants/product-catalog", () => ({
      getAllMarketSlugs: () => ["mock-market"],
    }));
    vi.doMock("@/constants/product-specs/market-spec-registry", () => ({
      getMarketSpecsBySlug: () => createMockMarketSpecs("not-a-date"),
    }));

    const seoConfig = await import("@/config/single-site-seo");

    expect(seoConfig.SINGLE_SITE_ROBOTS_DISALLOW_PATHS).toEqual([
      "/api/",
      "/_next/",
      "/error-test/",
    ]);
  });

  it.each([
    "not-a-date",
    "2026-13-01T00:00:00Z",
    "2026-04-26",
    "2026-04-26T00:00:00.000Z",
    "2026-04-26T00:00:00+08:00",
  ])(
    "throws when product market updatedAt is not a UTC seconds ISO string: %s",
    async (updatedAt) => {
      vi.resetModules();
      vi.doMock("@/constants/product-catalog", () => ({
        getAllMarketSlugs: () => ["mock-market"],
      }));
      vi.doMock("@/constants/product-specs/market-spec-registry", () => ({
        getMarketSpecsBySlug: () => createMockMarketSpecs(updatedAt),
      }));

      const seoConfig = await import("@/config/single-site-seo");

      expect(() => seoConfig.getSingleSiteSitemapLastmod()).toThrow(
        "Invalid product market sitemap updatedAt: mock-market",
      );
    },
  );
});

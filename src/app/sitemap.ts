import type { MetadataRoute } from "next";
import type { Locale, PostSummary } from "@/types/content.types";
import { getAllPostsCached } from "@/lib/content/blog";
import {
  getMdxPageLastModified,
  isMdxDrivenPage,
} from "@/lib/content/page-dates";
import {
  getContentLastModified,
  getStaticPageLastModified,
  type StaticPageLastModConfig,
} from "@/lib/sitemap-utils";
import { SITE_CONFIG } from "@/config/paths";
import {
  getSingleSiteSitemapPageConfig,
  SINGLE_SITE_PUBLIC_STATIC_PAGES,
  SINGLE_SITE_STATIC_PAGE_LASTMOD,
  type SingleSiteSitemapPageConfig,
} from "@/config/single-site-seo";
import { routing } from "@/i18n/routing";
import { PRODUCT_CATALOG } from "@/constants/product-catalog";

// Base URL for the site - uses centralized SITE_CONFIG for consistency
const BASE_URL = SITE_CONFIG.baseUrl;

type PageConfig = SingleSiteSitemapPageConfig;

const STATIC_PAGE_LASTMOD: StaticPageLastModConfig = new Map(
  Object.entries(SINGLE_SITE_STATIC_PAGE_LASTMOD).map(([route, isoDate]) => [
    route,
    new Date(isoDate),
  ]),
);

// Helper to get page config
function getPageConfig(path: string): PageConfig {
  return getSingleSiteSitemapPageConfig(path);
}

// Build alternate languages object for a URL path
function buildAlternateLanguages(path: string): Record<string, string> {
  const entries = routing.locales.map((locale) => [
    locale,
    `${BASE_URL}/${locale}${path}`,
  ]);
  // x-default 指向默认语言版本，帮助搜索引擎识别语言选择器页面
  entries.push(["x-default", `${BASE_URL}/${routing.defaultLocale}${path}`]);
  return Object.fromEntries(entries);
}

interface SitemapEntryParams {
  url: string;
  lastModified: Date;
  config: PageConfig;
  alternates: Record<string, string>;
}

// Generate a single sitemap entry
function createSitemapEntry(
  params: SitemapEntryParams,
): MetadataRoute.Sitemap[number] {
  return {
    url: params.url,
    lastModified: params.lastModified,
    changeFrequency: params.config.changeFrequency,
    priority: params.config.priority,
    alternates: {
      languages: params.alternates,
    },
  };
}

// Generate static page entries for all locales
async function generateStaticPageEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const page of SINGLE_SITE_PUBLIC_STATIC_PAGES) {
      const config = getPageConfig(page);
      const url = `${BASE_URL}/${locale}${page}`;
      const alternates = buildAlternateLanguages(page);
      const lastModified = isMdxDrivenPage(page)
        ? await getMdxPageLastModified(page)
        : getStaticPageLastModified(page, STATIC_PAGE_LASTMOD);

      entries.push(
        createSitemapEntry({ url, lastModified, config, alternates }),
      );
    }
  }

  return entries;
}

// Fetch all blog posts for all locales
async function fetchAllPostsByLocale(): Promise<Map<string, PostSummary[]>> {
  const postsByLocale = new Map<string, PostSummary[]>();

  for (const locale of routing.locales) {
    try {
      const posts = await getAllPostsCached(locale as Locale, {
        draft: false,
      });
      postsByLocale.set(locale, posts);
    } catch {
      postsByLocale.set(locale, []);
    }
  }

  return postsByLocale;
}

// Build alternate languages for a blog post across locales
function buildBlogAlternates(
  slug: string,
  currentLocale: string,
  allPostsByLocale: Map<string, PostSummary[]>,
): Record<string, string> {
  const postPath = `/blog/${slug}`;

  const entries = routing.locales
    .filter((locale) => {
      const posts = allPostsByLocale.get(locale);
      if (posts === undefined) return false;
      return locale === currentLocale || posts.some((p) => p.slug === slug);
    })
    .map((locale) => [locale, `${BASE_URL}/${locale}${postPath}`]);

  // x-default 指向默认语言版本
  const defaultLocalePosts = allPostsByLocale.get(routing.defaultLocale);
  if (defaultLocalePosts?.some((p) => p.slug === slug)) {
    entries.push([
      "x-default",
      `${BASE_URL}/${routing.defaultLocale}${postPath}`,
    ]);
  }

  return Object.fromEntries(entries);
}

// Generate blog post page entries for all locales
async function generateBlogEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const config = getPageConfig("blogPost");
  const allPostsByLocale = await fetchAllPostsByLocale();

  // Track processed post slugs to avoid duplicates
  const processedSlugs = new Set<string>();

  for (const locale of routing.locales) {
    const posts = allPostsByLocale.get(locale);
    if (posts === undefined) continue;

    for (const post of posts) {
      const entryKey = `${locale}:${post.slug}`;
      if (processedSlugs.has(entryKey)) continue;
      processedSlugs.add(entryKey);

      const url = `${BASE_URL}/${locale}/blog/${post.slug}`;
      const alternates = buildBlogAlternates(
        post.slug,
        locale,
        allPostsByLocale,
      );
      const lastModified = getContentLastModified({
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
      });

      entries.push(
        createSitemapEntry({ url, lastModified, config, alternates }),
      );
    }
  }

  return entries;
}

// Generate product catalog entries (market + family pages) for all locales
function generateCatalogEntries(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Market landing pages
  const marketConfig = getPageConfig("productMarket");
  for (const market of PRODUCT_CATALOG.markets) {
    const path = `/products/${market.slug}`;
    const lastModified = getStaticPageLastModified(path, STATIC_PAGE_LASTMOD);

    for (const locale of routing.locales) {
      entries.push(
        createSitemapEntry({
          url: `${BASE_URL}/${locale}${path}`,
          lastModified,
          config: marketConfig,
          alternates: buildAlternateLanguages(path),
        }),
      );
    }
  }

  return entries;
}

/**
 * Dynamic sitemap generation for Next.js.
 * Includes static pages, product catalog pages, and blog pages with i18n alternates.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = await generateStaticPageEntries();
  const catalogEntries = generateCatalogEntries();
  const blogEntries = await generateBlogEntries();

  return [...staticEntries, ...catalogEntries, ...blogEntries];
}

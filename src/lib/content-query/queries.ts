/**
 * 内容查询函数
 */

import path from "path";
import type {
  BlogPost,
  BlogPostMetadata,
  ContentMetadata,
  ContentQueryOptions,
  ContentType,
  Locale,
  Page,
  PageMetadata,
  ParsedContent,
} from "@/types/content.types";
import { getContentFiles, parseContentFile } from "@/lib/content-parser";
import { filterPosts } from "@/lib/content-query/filters";
import { paginatePosts, sortPosts } from "@/lib/content-query/sorting";
import { getContentConfig, PAGES_DIR, POSTS_DIR } from "@/lib/content-utils";

/**
 * Get all blog posts
 */
export async function getAllPosts(
  locale?: Locale,
  options: ContentQueryOptions = {},
): Promise<BlogPost[]> {
  const files = await getContentFiles(POSTS_DIR, locale);
  const parsedPosts = await Promise.all(
    files.map((file) => parseContentFile<BlogPostMetadata>(file, "posts")),
  );

  const filteredPosts = filterPosts(parsedPosts, options);
  const sortedPosts = sortPosts(filteredPosts, options);
  const paginatedPosts = paginatePosts(sortedPosts, options);

  return paginatedPosts;
}

/**
 * Get all pages
 */
export async function getAllPages(locale?: Locale): Promise<Page[]> {
  const files = await getContentFiles(PAGES_DIR, locale);
  const parsedPages = await Promise.all(
    files.map((file) => parseContentFile<PageMetadata>(file, "pages")),
  );
  return parsedPages.filter((page) => {
    // Filter drafts in production
    const config = getContentConfig();
    return config.enableDrafts || !page.metadata.draft;
  }) as Page[];
}

/**
 * Get content by slug
 */
export async function getContentBySlug<
  T extends ContentMetadata = ContentMetadata,
>(slug: string, type: ContentType, locale?: Locale): Promise<ParsedContent<T>> {
  const contentDir = type === "posts" ? POSTS_DIR : PAGES_DIR;
  const files = await getContentFiles(contentDir, locale);

  const matchingFile = files.find((file) => {
    const fileSlug = path.basename(file, path.extname(file));
    return fileSlug === slug || fileSlug.startsWith(`${slug}.`);
  });

  if (!matchingFile) {
    throw new Error(`Content not found: ${slug}`);
  }

  return parseContentFile<T>(matchingFile, type);
}

/**
 * Get blog post by slug
 */
export function getPostBySlug(
  slug: string,
  locale?: Locale,
): Promise<BlogPost> {
  return getContentBySlug<BlogPostMetadata>(
    slug,
    "posts",
    locale,
  ) as Promise<BlogPost>;
}

/**
 * Get page by slug
 */
export function getPageBySlug(slug: string, locale?: Locale): Promise<Page> {
  return getContentBySlug<PageMetadata>(slug, "pages", locale) as Promise<Page>;
}

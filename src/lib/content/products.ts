/**
 * Products content wrappers
 *
 * Cache-friendly wrapper implementations for products content.
 *
 * These functions:
 * - use the products query source (getProductListing, getProductDetail, etc.)
 * - expose view-oriented domain models (ProductSummary, ProductDetail)
 * - accept only explicit, serializable arguments (locale, category, slug)
 * - intentionally do NOT use request-scoped APIs (headers, cookies, etc.)
 * - use "use cache" + cacheLife() + cacheTag() for Cache Components integration
 *
 * @see src/lib/cache/cache-tags.ts - Cache tag naming conventions
 */

import { cacheLife, cacheTag } from 'next/cache';
import type {
  GetAllProductsCachedFn,
  GetProductBySlugCachedFn,
  GetProductCategoriesCachedFn,
  GetProductStandardsCachedFn,
  Locale,
  ProductDetail,
  ProductSummary,
} from '@/types/content.types';
import {
  getProductDetail,
  getProductListing,
  getProductCategories,
  getProductStandards,
  getFeaturedProducts,
} from '@/lib/content/products-source';
import { productTags } from '@/lib/cache/cache-tags';

/**
 * Map a ProductDetail to a ProductSummary (list view).
 */
function mapProductDetailToSummary(product: ProductDetail): ProductSummary {
  const summary: ProductSummary = {
    slug: product.slug,
    locale: product.locale,
    title: product.title,
    coverImage: product.coverImage,
    category: product.category,
    publishedAt: product.publishedAt,
  };

  // Timestamp fields
  if (product.updatedAt !== undefined) summary.updatedAt = product.updatedAt;

  if (product.description !== undefined) summary.description = product.description;
  if (product.pdfUrl !== undefined) summary.pdfUrl = product.pdfUrl;
  if (product.images !== undefined) summary.images = product.images;
  if (product.categories !== undefined) summary.categories = product.categories;
  if (product.tags !== undefined) summary.tags = product.tags;
  if (product.standards !== undefined) summary.standards = product.standards;
  if (product.featured !== undefined) summary.featured = product.featured;
  if (product.moq !== undefined) summary.moq = product.moq;
  if (product.leadTime !== undefined) summary.leadTime = product.leadTime;
  if (product.supplyCapacity !== undefined) summary.supplyCapacity = product.supplyCapacity;
  if (product.seo !== undefined) summary.seo = product.seo;

  return summary;
}

/**
 * Get all products as ProductSummary list for a given locale.
 *
 * Cache tags enable selective invalidation:
 * - `product:list:{category|all}:{locale}` - Invalidate product list
 */
/* eslint-disable require-await -- Next.js "use cache" functions must be async even if implementation is sync */
export const getAllProductsCached: GetAllProductsCachedFn = async (
  locale,
  options = {},
) => {
  'use cache';
  cacheLife('days');
  cacheTag(productTags.list(locale, options.category));

  const products = getProductListing(locale, options.category);

  let filtered = products;

  // Filter by standards if specified (OR semantics)
  if (options.standards !== undefined && options.standards.length > 0) {
    filtered = filtered.filter((p) => {
      const pStandards = p.standards ?? [];
      return options.standards!.some((standard) => pStandards.includes(standard));
    });
  }

  // Filter by tags if specified
  if (options.tags !== undefined && options.tags.length > 0) {
    filtered = filtered.filter((p) => {
      const pTags = p.tags ?? [];
      return options.tags!.some((tag) => pTags.includes(tag));
    });
  }

  // Filter by featured if specified
  if (options.featured !== undefined) {
    filtered = filtered.filter((p) => p.featured === options.featured);
  }

  // Apply pagination
  const offset = options.offset ?? 0;
  const { limit } = options;

  if (limit !== undefined) {
    filtered = filtered.slice(offset, offset + limit);
  } else if (offset > 0) {
    filtered = filtered.slice(offset);
  }

  return filtered.map((product) => mapProductDetailToSummary(product));
};
/* eslint-enable require-await */

/**
 * Get a single product by slug as a ProductDetail model.
 *
 * Cache tags enable selective invalidation:
 * - `product:detail:{slug}:{locale}` - Invalidate this specific product
 * - `product:list:all:{locale}` - Also tagged for list invalidation cascade
 */
/* eslint-disable require-await -- Next.js "use cache" functions must be async even if implementation is sync */
export const getProductBySlugCached: GetProductBySlugCachedFn = async (
  locale,
  slug,
) => {
  'use cache';
  cacheLife('days');
  cacheTag(productTags.detail(slug, locale));
  cacheTag(productTags.list(locale));

  const product = getProductDetail(locale, slug);
  return product;
};
/* eslint-enable require-await */

/**
 * Get all unique product categories for a locale.
 *
 * Cache tags enable selective invalidation:
 * - `product:category:{locale}` - Invalidate categories for this locale
 */
/* eslint-disable require-await -- Next.js "use cache" functions must be async even if implementation is sync */
export const getProductCategoriesCached: GetProductCategoriesCachedFn = async (
  locale,
) => {
  'use cache';
  cacheLife('days');
  cacheTag(productTags.categories(locale));

  const categories = getProductCategories(locale);
  return categories;
};
/* eslint-enable require-await */

/**
 * Get all unique product standards for a locale.
 *
 * Cache tags enable selective invalidation:
 * - `product:standard:{locale}` - Invalidate standards for this locale
 */
/* eslint-disable require-await -- Next.js "use cache" functions must be async even if implementation is sync */
export const getProductStandardsCached: GetProductStandardsCachedFn = async (
  locale,
) => {
  'use cache';
  cacheLife('days');
  cacheTag(productTags.standards(locale));

  const standards = getProductStandards(locale);
  return standards;
};
/* eslint-enable require-await */

/**
 * Get featured products for homepage or highlight sections.
 *
 * Cache tags enable selective invalidation:
 * - `product:featured:{locale}` - Invalidate featured products for this locale
 */
/* eslint-disable require-await -- Next.js "use cache" functions must be async even if implementation is sync */
export async function getFeaturedProductsCached(
  locale: Locale,
  limit?: number,
): Promise<ProductSummary[]> {
  'use cache';
  cacheLife('days');
  cacheTag(productTags.featured(locale));

  const products = getFeaturedProducts(locale, limit);
  return products.map((product) => mapProductDetailToSummary(product));
}
/* eslint-enable require-await */

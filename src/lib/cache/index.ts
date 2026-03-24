/**
 * Cache Utilities Index
 *
 * Exports cache tag generation and invalidation utilities.
 */

export {
  CACHE_DOMAINS,
  CACHE_ENTITIES,
  cacheTags,
  i18nTags,
  contentTags,
  productTags,
  seoTags,
  type CacheDomain,
} from "./cache-tags";

export {
  CACHE_INVALIDATION_DOMAINS,
  CACHE_INVALIDATION_ENTITIES,
  CACHE_INVALIDATION_LOCALES,
  invalidate,
  invalidateI18n,
  invalidateContent,
  invalidateProduct,
  invalidateLocale,
  invalidateDomain,
  invalidateCachePath,
  invalidateCacheRequest,
  type CacheInvalidationRequest,
  type CacheInvalidationResult,
  type InvalidationResult,
} from "./invalidate";

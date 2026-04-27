/**
 * Cache Utilities Index
 *
 * Exports cache tag generation utilities used by `unstable_cache`.
 * Runtime invalidation was removed on 2026-04-26; content updates flow through
 * redeploys, not request-time cache mutation APIs.
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

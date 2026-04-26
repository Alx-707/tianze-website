import { z } from "zod";
import type { Locale } from "@/types/content.types";
import { CACHE_DOMAINS } from "@/lib/cache/cache-tags";
import {
  invalidateContent,
  invalidateDomain,
  invalidateI18n,
  invalidateLocale,
  invalidateProduct,
} from "@/lib/cache/invalidate";
import { API_ERROR_CODES } from "@/constants/api-error-codes";

export const VALID_CACHE_LOCALES = ["en", "zh"] as const;
export const VALID_CACHE_DOMAINS = [
  "i18n",
  "content",
  "product",
  "all",
] as const;
export const VALID_CACHE_ENTITIES = [
  "critical",
  "deferred",
  "page",
  "detail",
  "categories",
  "featured",
] as const;

export const cacheInvalidationSchema = z
  .object({
    domain: z.enum(VALID_CACHE_DOMAINS, {
      message: `domain must be one of: ${VALID_CACHE_DOMAINS.join(", ")}`,
    }),
    locale: z.enum(VALID_CACHE_LOCALES).optional(),
    entity: z.enum(VALID_CACHE_ENTITIES).optional(),
    identifier: z.string().min(1).max(256).optional(),
  })
  .strict();

export type InvalidationRequest = z.infer<typeof cacheInvalidationSchema>;

export interface InvalidationResult {
  success: boolean;
  invalidatedTags: string[];
  errors: string[];
}

export type CacheInvalidationResult =
  | InvalidationResult
  | { errorCode: string; status: number };

export function isValidCacheLocale(locale: unknown): locale is Locale {
  return (
    typeof locale === "string" && VALID_CACHE_LOCALES.includes(locale as Locale)
  );
}

function handleI18nInvalidation(
  locale: Locale | undefined,
  entity: string | undefined,
): InvalidationResult {
  if (locale && isValidCacheLocale(locale)) {
    if (entity === "critical") return invalidateI18n.critical(locale);
    if (entity === "deferred") return invalidateI18n.deferred(locale);
    return invalidateI18n.locale(locale);
  }
  return invalidateI18n.all();
}

function handleContentInvalidation(
  locale: Locale,
  entity: string | undefined,
  identifier: string | undefined,
): InvalidationResult {
  if (entity === "page" && identifier) {
    return invalidateContent.page(identifier, locale);
  }
  return invalidateContent.locale(locale);
}

function handleProductInvalidation(
  locale: Locale,
  entity: string | undefined,
  identifier: string | undefined,
): InvalidationResult {
  if (entity === "detail" && identifier) {
    return invalidateProduct.detail(identifier, locale);
  }
  if (entity === "categories") return invalidateProduct.categories(locale);
  if (entity === "featured") return invalidateProduct.featured(locale);
  return invalidateProduct.locale(locale);
}

function handleAllInvalidation(locale: Locale | undefined): InvalidationResult {
  if (locale && isValidCacheLocale(locale)) {
    return invalidateLocale(locale);
  }
  const results = [
    invalidateDomain(CACHE_DOMAINS.I18N),
    invalidateDomain(CACHE_DOMAINS.CONTENT),
    invalidateDomain(CACHE_DOMAINS.PRODUCT),
  ];
  return {
    success: results.every((r) => r.errors.length === 0),
    invalidatedTags: results.flatMap((r) => r.invalidatedTags),
    errors: results.flatMap((r) => r.errors),
  };
}

export function processCacheInvalidation(
  options: InvalidationRequest,
): CacheInvalidationResult {
  const { domain, locale, entity, identifier } = options;

  switch (domain) {
    case "i18n":
      return handleI18nInvalidation(locale, entity);
    case "content":
      if (!locale || !isValidCacheLocale(locale)) {
        return {
          errorCode: API_ERROR_CODES.CACHE_LOCALE_REQUIRED,
          status: 400,
        };
      }
      return handleContentInvalidation(locale, entity, identifier);
    case "product":
      if (!locale || !isValidCacheLocale(locale)) {
        return {
          errorCode: API_ERROR_CODES.CACHE_LOCALE_REQUIRED,
          status: 400,
        };
      }
      return handleProductInvalidation(locale, entity, identifier);
    case "all":
      return handleAllInvalidation(locale);
    default:
      return {
        errorCode: API_ERROR_CODES.CACHE_INVALID_DOMAIN,
        status: 400,
      };
  }
}

import { cache } from "react";
import { getTranslations } from "next-intl/server";
import { isRuntimeCloudflare } from "@/lib/env";

type GetTranslations = typeof getTranslations;
type GetTranslationsOptions = Parameters<GetTranslations>[0];
type GetTranslationsResult = ReturnType<GetTranslations>;

const getTranslationsDirect = getTranslations as (
  options?: GetTranslationsOptions,
) => GetTranslationsResult;

/**
 * Cached wrapper around next-intl/server getTranslations to avoid
 * repeated locale/namespace lookups within a single request lifecycle.
 *
 * Cloudflare local runtime can bind request-scoped I/O to cached functions
 * across requests, so keep that path direct.
 */
const getTranslationsRequestCached = cache(getTranslationsDirect);

export const getTranslationsCached = ((options?: GetTranslationsOptions) =>
  isRuntimeCloudflare()
    ? getTranslationsDirect(options)
    : getTranslationsRequestCached(options)) as GetTranslations;

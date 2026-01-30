/**
 * Translation Message Loader
 *
 * Loads externalized translation files from public/messages/ using Next.js caching.
 * Translation files are copied to public/ during build (prebuild script).
 */

import { readFile } from "fs/promises";
import { join } from "path";
import { unstable_cache } from "next/cache";
import { i18nTags } from "@/lib/cache/cache-tags";
import { logger } from "@/lib/logger";
import { mergeObjects } from "@/lib/merge-objects";
import { MONITORING_INTERVALS } from "@/constants/performance-constants";
import { routing } from "@/i18n/routing";

type Locale = "en" | "zh";
type Messages = Record<string, unknown>;
type MessageType = "critical" | "deferred";

const isCiEnv =
  process.env.CI === "true" || process.env.PLAYWRIGHT_TEST === "true";
const isDev = () => process.env.NODE_ENV === "development";
const isBuild = () => process.env.NEXT_PHASE === "phase-production-build";
const revalidate = () => (isDev() ? 1 : MONITORING_INTERVALS.CACHE_CLEANUP);

function sanitizeLocale(input: string): Locale {
  return ["en", "zh"].includes(input)
    ? (input as Locale)
    : (routing.defaultLocale as Locale);
}

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ??
    `http://localhost:${process.env.PORT || 3000}`
  );
}

async function loadFromPath(
  locale: Locale,
  type: MessageType,
  base: string,
): Promise<Messages> {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- locale is sanitized
  const content = await readFile(
    join(process.cwd(), base, locale, `${type}.json`),
    "utf-8",
  );
  return JSON.parse(content) as Messages;
}

async function loadWithFallback(
  locale: Locale,
  type: MessageType,
): Promise<Messages> {
  try {
    return await loadFromPath(locale, type, "public/messages");
  } catch (e) {
    logger.error(`Failed to read ${type} from public for ${locale}:`, e);
  }
  try {
    return await loadFromPath(locale, type, "messages");
  } catch (e) {
    logger.error(`Failed to read ${type} from source for ${locale}:`, e);
    throw new Error(`Cannot load ${type} messages for ${locale}`);
  }
}

async function fetchWithFallback(
  locale: Locale,
  type: MessageType,
): Promise<Messages> {
  const url = `${getBaseUrl()}/messages/${locale}/${type}.json`;
  try {
    const res = await fetch(url, {
      next: { revalidate: revalidate() },
      cache: "force-cache",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Messages;
  } catch (e) {
    logger.error(`HTTP fetch of ${type} failed for ${locale}:`, e);
    return loadWithFallback(locale, type);
  }
}

function loadCore(locale: Locale, type: MessageType): Promise<Messages> {
  const safe = sanitizeLocale(locale);
  return isBuild() || isDev() || isCiEnv
    ? loadWithFallback(safe, type)
    : fetchWithFallback(safe, type);
}

function createCached(locale: Locale, type: MessageType) {
  return unstable_cache(
    () => loadCore(locale, type),
    [`i18n-${type}`, locale],
    {
      revalidate: revalidate(),
      tags: [
        (type === "critical" ? i18nTags.critical : i18nTags.deferred)(locale),
        i18nTags.all(),
      ],
    },
  );
}

function load(locale: Locale, type: MessageType): Promise<Messages> {
  return isCiEnv ? loadCore(locale, type) : createCached(locale, type)();
}

export function loadCriticalMessages(locale: Locale): Promise<Messages> {
  return load(locale, "critical");
}

export function loadDeferredMessages(locale: Locale): Promise<Messages> {
  return load(locale, "deferred");
}

export async function loadCompleteMessages(locale: Locale): Promise<Messages> {
  const [critical, deferred] = await Promise.all([
    isBuild()
      ? loadFromPath(locale, "critical", "messages")
      : loadCriticalMessages(locale),
    isBuild()
      ? loadFromPath(locale, "deferred", "messages")
      : loadDeferredMessages(locale),
  ]);
  return mergeObjects(critical ?? {}, deferred ?? {}) as Messages;
}

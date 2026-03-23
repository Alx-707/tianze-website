/**
 * Translation Message Loader
 *
 * Runtime canonical source is split message files under `messages/{locale}/`.
 * Flat locale files may still exist for tooling/tests, but server runtime must
 * not depend on them.
 */

import { unstable_cache } from "next/cache";
import { i18nTags } from "@/lib/cache/cache-tags";
import { mergeObjects } from "@/lib/merge-objects";
import { MONITORING_INTERVALS } from "@/constants/performance-constants";
import { routing, type Locale } from "@/i18n/routing";

type Messages = Record<string, unknown>;
type MessageType = "critical" | "deferred";

const isCiEnv =
  process.env.CI === "true" || process.env.PLAYWRIGHT_TEST === "true";
const isProductionBuild = () =>
  process.env.NEXT_PHASE === "phase-production-build";
const isDev = () => process.env.NODE_ENV === "development";
const revalidate = () => (isDev() ? 1 : MONITORING_INTERVALS.CACHE_CLEANUP);

const MESSAGE_LOADERS: Record<
  Locale,
  Record<MessageType, () => Promise<{ default: Messages }>>
> = {
  en: {
    critical: () => import("@messages/en/critical.json"),
    deferred: () => import("@messages/en/deferred.json"),
  },
  zh: {
    critical: () => import("@messages/zh/critical.json"),
    deferred: () => import("@messages/zh/deferred.json"),
  },
};

function sanitizeLocale(input: string): Locale {
  const supportedLocales = routing.locales as readonly string[];
  return supportedLocales.includes(input)
    ? (input as Locale)
    : (routing.defaultLocale as Locale);
}

async function loadMessageSource(
  locale: Locale,
  type: MessageType,
): Promise<Messages> {
  const safeLocale = sanitizeLocale(locale);
  const loadedMessages = await MESSAGE_LOADERS[safeLocale][type]();
  return loadedMessages.default;
}

function createCached(locale: Locale, type: MessageType) {
  return unstable_cache(
    () => loadMessageSource(locale, type),
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
  const safeLocale = sanitizeLocale(locale);
  return isCiEnv || isProductionBuild()
    ? loadMessageSource(safeLocale, type)
    : createCached(safeLocale, type)();
}

export function loadCriticalMessages(locale: Locale): Promise<Messages> {
  return load(locale, "critical");
}

export function loadDeferredMessages(locale: Locale): Promise<Messages> {
  return load(locale, "deferred");
}

export async function loadCompleteMessagesFromSource(
  locale: string,
): Promise<Messages> {
  const safeLocale = sanitizeLocale(locale);
  const [critical, deferred] = await Promise.all([
    loadMessageSource(safeLocale, "critical"),
    loadMessageSource(safeLocale, "deferred"),
  ]);
  return mergeObjects(critical ?? {}, deferred ?? {}) as Messages;
}

export async function loadCompleteMessages(locale: Locale): Promise<Messages> {
  const safeLocale = sanitizeLocale(locale);
  const [critical, deferred] = await Promise.all([
    loadCriticalMessages(safeLocale),
    loadDeferredMessages(safeLocale),
  ]);
  return mergeObjects(critical ?? {}, deferred ?? {}) as Messages;
}

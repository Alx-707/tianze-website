import "server-only";
import equipmentEnCritical from "@/sites/tianze-equipment/messages/en/critical.json";
import equipmentEnDeferred from "@/sites/tianze-equipment/messages/en/deferred.json";
import equipmentZhCritical from "@/sites/tianze-equipment/messages/zh/critical.json";
import equipmentZhDeferred from "@/sites/tianze-equipment/messages/zh/deferred.json";
import type { Locale } from "@/i18n/routing";
import type { SiteKey } from "@/sites/types";

type Messages = Record<string, unknown>;
type MessageType = "critical" | "deferred";

const EMPTY_MESSAGES: Messages = {};

const SITE_MESSAGE_OVERRIDES: Partial<
  Record<SiteKey, Record<Locale, Record<MessageType, Messages>>>
> = {
  "tianze-equipment": {
    en: {
      critical: equipmentEnCritical as Messages,
      deferred: equipmentEnDeferred as Messages,
    },
    zh: {
      critical: equipmentZhCritical as Messages,
      deferred: equipmentZhDeferred as Messages,
    },
  },
};

export function getSiteMessageOverride(
  siteKey: SiteKey,
  locale: Locale,
  type: MessageType,
): Messages {
  return SITE_MESSAGE_OVERRIDES[siteKey]?.[locale]?.[type] ?? EMPTY_MESSAGES;
}

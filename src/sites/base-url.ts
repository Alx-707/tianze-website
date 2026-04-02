import { env } from "@/lib/env";
import type { SiteKey } from "@/sites/types";

const LOCALHOST_BASE_URL = "http://localhost:3000";

const SITE_BASE_URL_ENV_KEYS: Record<SiteKey, string> = {
  tianze: "NEXT_PUBLIC_TIANZE_BASE_URL",
  "tianze-equipment": "NEXT_PUBLIC_TIANZE_EQUIPMENT_BASE_URL",
};

function readSiteSpecificBaseUrl(siteKey: SiteKey): string | undefined {
  const envKey = SITE_BASE_URL_ENV_KEYS[siteKey];
  const value = process.env[envKey];
  return value && value.trim().length > 0 ? value : undefined;
}

export function resolveSiteBaseUrl(
  siteKey: SiteKey,
  defaultBaseUrl: string,
): string {
  const explicitSiteBaseUrl = readSiteSpecificBaseUrl(siteKey);

  if (explicitSiteBaseUrl) {
    return explicitSiteBaseUrl;
  }

  const activeSiteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (activeSiteBaseUrl && activeSiteBaseUrl.trim().length > 0) {
    return activeSiteBaseUrl;
  }

  if (siteKey === "tianze" && env.NEXT_PUBLIC_BASE_URL !== LOCALHOST_BASE_URL) {
    return env.NEXT_PUBLIC_BASE_URL;
  }

  return defaultBaseUrl;
}

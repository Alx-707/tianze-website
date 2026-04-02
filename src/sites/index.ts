import { env } from "@/lib/env";
import { tianzeEquipmentSite } from "@/sites/tianze-equipment";
import { tianzeSite } from "@/sites/tianze";
import type { SiteDefinition, SiteKey } from "@/sites/types";

export type {
  SiteConfig,
  SiteFacts,
  SiteKey,
  ProductCatalog,
  MarketDefinition,
  ProductFamilyDefinition,
  SiteNavigationItem,
  SiteFooterColumnConfig,
  SiteFooterLinkItem,
  CompanyInfo,
  BusinessHours,
  ContactInfo,
  Certification,
  BusinessStats,
  SocialLinks,
  SiteDefinition,
} from "@/sites/types";

export const DEFAULT_SITE_KEY: SiteKey = "tianze";

export const SITE_REGISTRY: Record<SiteKey, SiteDefinition> = {
  tianze: tianzeSite,
  "tianze-equipment": tianzeEquipmentSite,
};

export function resolveSiteKey(siteKey?: string): SiteKey {
  return siteKey === "tianze" || siteKey === "tianze-equipment"
    ? siteKey
    : DEFAULT_SITE_KEY;
}

export function resolveSiteDefinition(siteKey?: string): SiteDefinition {
  return SITE_REGISTRY[resolveSiteKey(siteKey)];
}

export const currentSiteKey = resolveSiteKey(env.NEXT_PUBLIC_SITE_KEY);
export const currentSite = resolveSiteDefinition(currentSiteKey);

export type SiteKey = "tianze";

export interface SiteSeoConfig {
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  keywords: string[];
}

export interface SiteSocialConfig {
  twitter: string;
  linkedin: string;
  github: string;
}

export interface SiteContactConfig {
  phone: string;
  email: string;
  whatsappNumber: string;
}

export interface SiteConfig {
  baseUrl: string;
  name: string;
  description: string;
  seo: SiteSeoConfig;
  social: SiteSocialConfig;
  contact: SiteContactConfig;
}

export interface CompanyInfo {
  name: string;
  established: number;
  yearsInBusiness: number;
  employees: number;
  location: {
    country: string;
    city: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
}

export interface BusinessHours {
  weekdays: string;
  saturday: string;
  sundayClosed: boolean;
}

export interface ContactInfo {
  phone: string;
  email: string;
  whatsapp?: string;
  wechat?: string;
  businessHours?: BusinessHours;
}

export interface Certification {
  name: string;
  certificateNumber?: string;
  file?: string;
  validUntil?: string;
}

export interface BusinessStats {
  exportCountries: number;
  annualCapacity?: string;
  clientsServed?: number;
  factoryAreaAcres?: number;
  onTimeDeliveryRate?: number;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
  instagram?: string;
}

export interface SiteFacts {
  company: CompanyInfo;
  contact: ContactInfo;
  certifications: Certification[];
  stats: BusinessStats;
  social: SocialLinks;
}

export interface SiteNavigationItem {
  key: string;
  href: string;
  translationKey: string;
  icon?: string;
  external?: boolean;
  children?: SiteNavigationItem[];
}

export interface SiteFooterLinkItem {
  key: string;
  label: string;
  href: string;
  external?: boolean;
  showExternalIcon?: boolean;
  translationKey: string;
}

export interface SiteFooterColumnConfig {
  key: string;
  title: string;
  translationKey: string;
  links: SiteFooterLinkItem[];
}

export interface MarketDefinition {
  slug: string;
  label: string;
  standardLabel: string;
  description: string;
  sizeSystem: "inch" | "mm";
  standardIds: readonly string[];
  familySlugs: readonly string[];
}

export interface ProductFamilyDefinition {
  slug: string;
  label: string;
  description: string;
  marketSlug: string;
}

export interface ProductCatalog {
  readonly markets: readonly MarketDefinition[];
  readonly families: readonly ProductFamilyDefinition[];
}

export interface SiteDefinition {
  key: SiteKey;
  config: SiteConfig;
  facts: SiteFacts;
  productCatalog: ProductCatalog;
  navigation: {
    main: SiteNavigationItem[];
  };
  footerColumns: SiteFooterColumnConfig[];
}

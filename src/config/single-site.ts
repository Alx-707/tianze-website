import { env } from "@/lib/env";
import { SINGLE_SITE_ROUTE_HREFS } from "@/config/single-site-links";
import { SINGLE_SITE_NAVIGATION } from "@/config/single-site-navigation";
import { singleSiteProductCatalog } from "@/config/single-site-product-catalog";
import type {
  ProductCatalog,
  SiteConfig,
  SiteDefinition,
  SiteFacts,
  SiteFooterColumnConfig,
} from "@/config/site-types";

export type {
  BusinessHours,
  BusinessStats,
  Certification,
  CompanyInfo,
  ContactInfo,
  MarketDefinition,
  ProductCatalog,
  ProductFamilyDefinition,
  SiteConfig,
  SiteDefinition,
  SiteFacts,
  SiteFooterColumnConfig,
  SiteFooterLinkItem,
  SiteNavigationItem,
  SiteSeoConfig,
  SiteSocialConfig,
  SocialLinks,
} from "@/config/site-types";

function resolveSingleSiteBaseUrl(fallback: string): string {
  const explicitSiteUrl = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicitSiteUrl) return explicitSiteUrl;

  const sharedBaseUrl = env.NEXT_PUBLIC_BASE_URL?.trim();
  if (sharedBaseUrl) return sharedBaseUrl;

  return fallback;
}

const baseUrl = resolveSingleSiteBaseUrl("https://tianze-pipe.com");

const social = {
  twitter: "https://x.com/tianzepipe",
  linkedin: "https://www.linkedin.com/company/tianze-pipe",
} as const;

const contact = {
  phone: "+86-518-0000-0000",
  email: "sales@tianze-pipe.com",
} as const;

const establishedYear = 2018;

/**
 * Single-site canonical source for the current cutover phase.
 */
export const SINGLE_SITE_KEY = "tianze" as const;
export const SINGLE_SITE_DEFINITION: SiteDefinition = {
  key: SINGLE_SITE_KEY,
  config: {
    baseUrl,
    name: "Tianze Pipe",
    description:
      "PVC Conduit Fittings & Pipe Manufacturing for Global B2B Buyers",
    seo: {
      titleTemplate: "%s | Tianze Pipe",
      defaultTitle: "Tianze Pipe - PVC Conduit Fittings Manufacturer",
      defaultDescription:
        "PVC conduit fittings, conduit bends, PETG pneumatic tube products, and OEM manufacturing support from Tianze Pipe in Lianyungang, China.",
      keywords: [
        "PVC conduit fittings",
        "PVC conduit bends",
        "AS/NZS 2053",
        "IEC 61386",
        "PVC pipe fittings",
        "PETG pneumatic tube",
        "OEM conduit fittings",
        "PVC conduit manufacturer China",
        "Schedule 80 conduit",
        "hospital pneumatic tube system",
      ],
    },
    social,
    contact,
  },
  facts: {
    company: {
      name: "Lianyungang Tianze Pipe Industry Co., Ltd.",
      established: establishedYear,
      yearsInBusiness: new Date().getFullYear() - establishedYear,
      employees: 60,
      location: {
        country: "China",
        city: "Lianyungang, Jiangsu",
        address: "No.6 Yulong Road, Dongwangji Industrial Zone, Guanyun County",
      },
    },
    contact: {
      phone: contact.phone,
      email: contact.email,
      businessHours: {
        weekdays: "8:00 - 17:30",
        saturday: "8:00 - 12:00",
        sundayClosed: true,
      },
    },
    certifications: [
      {
        name: "ISO 9001:2015",
        certificateNumber: "240021Q09730R0S",
        validUntil: "2027-03",
      },
    ],
    stats: {
      exportCountries: 20,
      annualCapacity:
        "Integrated conduit fitting, pipe, PETG tube, and OEM production",
      clientsServed: 60,
      factoryAreaAcres: 100,
      onTimeDeliveryRate: 98,
    },
    social: {
      linkedin: social.linkedin,
      twitter: social.twitter,
    },
    // TODO(wave1-blocked): These paths are intentional placeholders.
    // Files do not exist until Task 8/9/10 business assets are delivered.
    // Do NOT convert logo.tsx to next/image static import until files exist.
    brandAssets: {
      logo: {
        horizontal: "/images/logo.svg",
        horizontalPng: "/images/logo.png",
        square: "/images/logo-square.svg",
        width: 200,
        height: 60,
      },
      ogImage: "/images/og-image.jpg",
      favicon: "/favicon.ico",
    },
  },
  productCatalog: singleSiteProductCatalog,
  navigation: {
    main: SINGLE_SITE_NAVIGATION,
  },
  footerColumns: [
    {
      key: "navigation",
      title: "Navigation",
      translationKey: "footer.sections.navigation.title",
      links: [
        {
          key: "home",
          label: "Home",
          href: SINGLE_SITE_ROUTE_HREFS.home,
          external: false,
          translationKey: "footer.sections.navigation.home",
        },
        {
          key: "about",
          label: "About",
          href: SINGLE_SITE_ROUTE_HREFS.about,
          external: false,
          translationKey: "footer.sections.navigation.about",
        },
        {
          key: "products",
          label: "Products",
          href: SINGLE_SITE_ROUTE_HREFS.products,
          external: false,
          translationKey: "footer.sections.navigation.products",
        },
        {
          key: "contact",
          label: "Contact",
          href: SINGLE_SITE_ROUTE_HREFS.contact,
          external: false,
          translationKey: "footer.sections.navigation.contact",
        },
      ],
    },
    {
      key: "support",
      title: "Support",
      translationKey: "footer.sections.support.title",
      links: [
        {
          key: "privacy",
          label: "Privacy Policy",
          href: SINGLE_SITE_ROUTE_HREFS.privacy,
          external: false,
          translationKey: "footer.sections.support.privacy",
        },
        {
          key: "terms",
          label: "Terms of Service",
          href: SINGLE_SITE_ROUTE_HREFS.terms,
          external: false,
          translationKey: "footer.sections.support.terms",
        },
      ],
    },
    {
      key: "social",
      title: "Social",
      translationKey: "footer.sections.social.title",
      links: [
        {
          key: "twitter",
          label: "Twitter",
          href: social.twitter,
          external: true,
          translationKey: "footer.sections.social.twitter",
        },
        {
          key: "linkedin",
          label: "LinkedIn",
          href: social.linkedin,
          external: true,
          translationKey: "footer.sections.social.linkedin",
        },
      ],
    },
  ],
};

export const SINGLE_SITE_CONFIG: SiteConfig = SINGLE_SITE_DEFINITION.config;
export const SINGLE_SITE_FACTS: SiteFacts = SINGLE_SITE_DEFINITION.facts;
export const SINGLE_SITE_PRODUCT_CATALOG: ProductCatalog =
  SINGLE_SITE_DEFINITION.productCatalog;
export const SINGLE_SITE_FOOTER_COLUMNS: SiteFooterColumnConfig[] =
  SINGLE_SITE_DEFINITION.footerColumns;

export { SINGLE_SITE_NAVIGATION } from "@/config/single-site-navigation";

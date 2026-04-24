import { PRODUCT_CATALOG } from "@/constants/product-catalog";

/**
 * Canonical single-site page-expression inputs.
 *
 * Keep reusable page-expression inputs here:
 * - FAQ item keys
 * - card order / display mapping
 * - CTA targets
 * - supported standards / scope keys / process-step counts
 * - fallback copy
 *
 * Keep implementation details out of here:
 * - `contact/page.tsx` `MERGED_MESSAGES`
 * - `products/[market]/page.tsx` `SPECS_BY_MARKET`
 * - `privacy` / `terms` heading-prefix constants
 * - `slugify`, heading parsers, JSON-LD object literals, and page-local helpers
 */

export const SINGLE_SITE_HOME_GRID_SECTION_ORDER = [
  "hero",
  "chain",
  "products",
  "resources",
  "sampleCta",
  "scenarios",
  "quality",
] as const;

export const SINGLE_SITE_HOME_TRAILING_SECTION_ORDER = ["finalCta"] as const;

export type SingleSiteHomeGridSectionId =
  (typeof SINGLE_SITE_HOME_GRID_SECTION_ORDER)[number];
export type SingleSiteHomeTrailingSectionId =
  (typeof SINGLE_SITE_HOME_TRAILING_SECTION_ORDER)[number];

export const SINGLE_SITE_HOME_LINK_TARGETS = {
  contact: "/contact",
  products: "/products",
} as const;

export const SINGLE_SITE_HOME_HERO_PROOF_ITEMS = [
  "est",
  "countries",
  "range",
  "production",
] as const;

export const SINGLE_SITE_HOME_FINAL_TRUST_ITEMS = ["countries"] as const;

export const SINGLE_SITE_HOME_SCENARIO_ITEMS = [
  "item1",
  "item2",
  "item3",
] as const;

export const SINGLE_SITE_ABOUT_VALUE_ITEM_KEYS = [
  "quality",
  "innovation",
  "service",
  "integrity",
] as const;

export const SINGLE_SITE_ABOUT_STATS_ITEMS = [
  {
    key: "years",
    valueSource: "yearsInBusiness",
    labelKey: "yearsExperience",
    suffix: "+",
  },
  {
    key: "countries",
    valueSource: "exportCountries",
    labelKey: "countriesServed",
    suffix: "+",
  },
  {
    key: "team",
    valueSource: "employees",
    labelKey: "happyClients",
    suffix: "+",
  },
  {
    key: "factory",
    valueSource: "factoryAreaAcres",
    labelKey: "productsDelivered",
    suffix: "",
  },
] as const;

export const SINGLE_SITE_HOME_QUALITY_COMMITMENT_ITEMS = [
  "commitment1",
  "commitment2",
  "commitment3",
  "commitment4",
  "commitment5",
] as const;

export const SINGLE_SITE_HOME_QUALITY_STANDARD_ITEMS = [
  "astm",
  "asnzs",
  "iec",
  "nom",
] as const;

export const SINGLE_SITE_HOME_QUALITY_PROOF_STRIP_ITEMS = [
  "iso9001",
  "standards",
  "countries",
] as const;

export const SINGLE_SITE_ABOUT_PAGE_EXPRESSION = {
  ctaHref: "/contact",
} as const;

const PNEUMATIC_MARKET_SLUG = "pneumatic-tube-systems" as const;

const standardMarketSlugs = PRODUCT_CATALOG.markets
  .map((market) => market.slug)
  .filter((slug) => slug !== PNEUMATIC_MARKET_SLUG);

export const SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION = {
  standardMarketSlugs,
  specialtyMarketSlug: PNEUMATIC_MARKET_SLUG,
  marketLanding: {
    ctaHref: "/contact",
  },
  equipmentCard: {
    href: "/capabilities/bending-machines",
    imageSrc: "/images/products/full-auto-bending-machine.svg",
  },
} as const;

export const SINGLE_SITE_BENDING_MACHINES_PAGE_EXPRESSION = {
  whyCardKeys: ["card1", "card2", "card3"],
  stats: [
    {
      key: "monthlyCapacity",
      valueSource: "translation",
      translationKey: "capability.monthlyCapacity",
      suffix: "",
    },
    {
      key: "countries",
      valueSource: "siteFacts.stats.exportCountries",
      translationKey: "capability.countries",
      suffix: "+",
    },
    {
      key: "experience",
      valueSource: "translation",
      translationKey: "capability.experience",
      suffix: "",
    },
  ],
  ctaHref: "/contact",
} as const;

export const SINGLE_SITE_OEM_PAGE_EXPRESSION = {
  supportedStandards: [
    "UL 651 / ASTM D1785",
    "AS/NZS 2053",
    "NOM-001-SEDE",
    "IEC 61386",
  ],
  scopeKeys: [
    "customSizes",
    "privateLabel",
    "moldDevelopment",
    "qualityAssurance",
  ],
  processStepCount: 5,
  ctaHref: "/contact",
} as const;

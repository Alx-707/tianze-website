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

export const SINGLE_SITE_ABOUT_SHELL_COPY = {
  en: {
    valuesTitle: "Manufacturing Excellence",
    values: {
      quality: {
        title: "Precision Engineering",
        description:
          "Every bend is engineered for consistency, with process control built around stable dimensions and repeatable results.",
      },
      innovation: {
        title: "In-House R&D",
        description:
          "From bending machines to custom molds, we develop key production capability inside the factory.",
      },
      service: {
        title: "Technical Support",
        description:
          "Our team supports buyers with product matching, sample review, documentation, and export coordination.",
      },
      integrity: {
        title: "Certified Quality",
        description:
          "ISO 9001:2015 certified production, traceable batches, and clear standard-matching for export projects.",
      },
    },
    stats: {
      yearsExperience: "Years Experience",
      countriesServed: "Export Countries",
      happyClients: "Team Members",
      productsDelivered: "Factory Area (Acres)",
    },
    cta: {
      title: "Partner With Pipe Bending Experts",
      description:
        "Whether you need bending machines, custom molds, or finished fittings, our team is ready to discuss your project.",
      button: "Request Quote",
    },
  },
  zh: {
    valuesTitle: "制造优势",
    values: {
      quality: {
        title: "精密工程",
        description:
          "每一道弯管都围绕稳定尺寸和批量一致性来控制，重点是让成品可重复、可追溯。",
      },
      innovation: {
        title: "自主研发",
        description:
          "从弯管机到定制模具，关键生产能力在工厂内部沉淀，方便快速响应规格变化。",
      },
      service: {
        title: "技术支持",
        description:
          "团队可配合买家完成产品匹配、样品确认、资料文件和出口交付沟通。",
      },
      integrity: {
        title: "品质认证",
        description:
          "ISO 9001:2015 认证生产，批次可追溯，并按出口项目要求匹配对应标准。",
      },
    },
    stats: {
      yearsExperience: "年行业经验",
      countriesServed: "出口国家",
      happyClients: "团队成员",
      productsDelivered: "工厂面积（亩）",
    },
    cta: {
      title: "与弯管专家合作",
      description:
        "无论您需要弯管设备、定制模具还是成品管件，我们都可以根据项目需求继续沟通。",
      button: "获取报价",
    },
  },
} as const;

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

export const SINGLE_SITE_MARKET_FAQ_ITEMS = [
  "sch40vs80",
  "conduitSize",
  "bendingRadius",
  "strengthGrades",
  "lszh",
  "standardsDifference",
  "directBurial",
  "indoorOutdoor",
  "solarDataCenter",
  "corrosion",
] as const;

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

export function getSingleSiteAboutShellCopy(locale: string) {
  return SINGLE_SITE_ABOUT_SHELL_COPY[locale === "zh" ? "zh" : "en"];
}

import { describe, expect, it } from "vitest";
import { PRODUCT_CATALOG } from "@/constants/product-catalog";
import {
  SINGLE_SITE_ABOUT_FAQ_ITEMS,
  SINGLE_SITE_ABOUT_PAGE_EXPRESSION,
  SINGLE_SITE_ABOUT_STATS_ITEMS,
  SINGLE_SITE_ABOUT_VALUE_ITEM_KEYS,
  SINGLE_SITE_BENDING_MACHINES_PAGE_EXPRESSION,
  SINGLE_SITE_CONTACT_FAQ_ITEMS,
  SINGLE_SITE_CONTACT_PAGE_FALLBACK,
  SINGLE_SITE_HOME_FINAL_TRUST_ITEMS,
  SINGLE_SITE_HOME_GRID_SECTION_ORDER,
  SINGLE_SITE_HOME_HERO_PROOF_ITEMS,
  SINGLE_SITE_HOME_LINK_TARGETS,
  SINGLE_SITE_HOME_QUALITY_COMMITMENT_ITEMS,
  SINGLE_SITE_HOME_QUALITY_PROOF_STRIP_ITEMS,
  SINGLE_SITE_HOME_QUALITY_STANDARD_ITEMS,
  SINGLE_SITE_HOME_SCENARIO_ITEMS,
  SINGLE_SITE_HOME_TRAILING_SECTION_ORDER,
  SINGLE_SITE_MARKET_FAQ_ITEMS,
  SINGLE_SITE_OEM_PAGE_EXPRESSION,
  SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION,
  SINGLE_SITE_PRIVACY_SECTION_KEYS,
  SINGLE_SITE_TERMS_SECTION_KEYS,
  getSingleSiteContactPageFallbackCopy,
} from "@/config/single-site-page-expression";
import { SINGLE_SITE_KEY } from "@/config/single-site";

describe("single-site-page-expression", () => {
  it("keeps homepage section order explicit and non-empty", () => {
    expect(SINGLE_SITE_HOME_GRID_SECTION_ORDER).toEqual([
      "hero",
      "chain",
      "products",
      "resources",
      "sampleCta",
      "scenarios",
      "quality",
    ]);
    expect(SINGLE_SITE_HOME_TRAILING_SECTION_ORDER).toEqual(["finalCta"]);
    expect(SINGLE_SITE_HOME_LINK_TARGETS).toEqual({
      contact: "/contact",
      products: "/products",
    });
  });

  it("keeps homepage and about display item order explicit", () => {
    expect(SINGLE_SITE_HOME_HERO_PROOF_ITEMS).toEqual([
      "est",
      "countries",
      "range",
      "production",
    ]);
    expect(SINGLE_SITE_HOME_FINAL_TRUST_ITEMS).toEqual(["countries"]);
    expect(SINGLE_SITE_ABOUT_VALUE_ITEM_KEYS).toEqual([
      "quality",
      "innovation",
      "service",
      "integrity",
    ]);
    expect(SINGLE_SITE_ABOUT_STATS_ITEMS).toEqual([
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
    ]);
    expect(SINGLE_SITE_HOME_SCENARIO_ITEMS).toEqual([
      "item1",
      "item2",
      "item3",
    ]);
    expect(SINGLE_SITE_HOME_QUALITY_COMMITMENT_ITEMS).toEqual([
      "commitment1",
      "commitment2",
      "commitment3",
      "commitment4",
      "commitment5",
    ]);
    expect(SINGLE_SITE_HOME_QUALITY_STANDARD_ITEMS).toEqual([
      "astm",
      "asnzs",
      "iec",
      "nom",
    ]);
    expect(SINGLE_SITE_HOME_QUALITY_PROOF_STRIP_ITEMS).toEqual([
      "iso9001",
      "standards",
      "countries",
    ]);
  });

  it("keeps contact and about FAQ keys explicit", () => {
    expect(SINGLE_SITE_CONTACT_FAQ_ITEMS).toEqual([
      "moq",
      "leadTime",
      "payment",
      "samples",
      "oem",
    ]);
    expect(SINGLE_SITE_ABOUT_FAQ_ITEMS).toEqual([
      "manufacturer",
      "factoryVisit",
      "exportExperience",
      "certifications",
      "verifyCerts",
    ]);
    expect(SINGLE_SITE_MARKET_FAQ_ITEMS).toEqual([
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
    ]);
    expect(SINGLE_SITE_PRIVACY_SECTION_KEYS).toEqual([
      "introduction",
      "informationCollected",
      "howWeUse",
      "sharing",
      "security",
      "retention",
      "rights",
      "children",
      "changes",
      "contact",
    ]);
    expect(SINGLE_SITE_TERMS_SECTION_KEYS).toEqual([
      "introduction",
      "acceptance",
      "services",
      "orders",
      "payment",
      "shipping",
      "warranty",
      "liability",
      "ip",
      "confidentiality",
      "termination",
      "governing",
      "disputes",
      "contact",
    ]);
  });

  it("keeps contact fallback copy and site key in the single-site expression layer", () => {
    expect(SINGLE_SITE_CONTACT_PAGE_FALLBACK.siteKey).toBe(SINGLE_SITE_KEY);
    expect(getSingleSiteContactPageFallbackCopy("en").title).toBe("Contact Us");
    expect(getSingleSiteContactPageFallbackCopy("zh").formTitle).toBe(
      "给我们留言",
    );
  });

  it("keeps product page grouping aligned with the catalog", () => {
    const allMarketSlugs = PRODUCT_CATALOG.markets.map((market) => market.slug);
    const groupedMarketSlugs = [
      ...SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION.standardMarketSlugs,
      SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION.specialtyMarketSlug,
    ];

    expect(groupedMarketSlugs.sort()).toEqual(allMarketSlugs.sort());
    expect(SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION.equipmentCard.href).toBe(
      "/capabilities/bending-machines",
    );
    expect(SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION.equipmentCard.imageSrc).toBe(
      "/images/products/full-auto-bending-machine.svg",
    );
    expect(SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION.marketLanding.ctaHref).toBe(
      "/contact",
    );
    expect(SINGLE_SITE_ABOUT_PAGE_EXPRESSION.ctaHref).toBe("/contact");
    expect(SINGLE_SITE_BENDING_MACHINES_PAGE_EXPRESSION.ctaHref).toBe(
      "/contact",
    );
    expect(SINGLE_SITE_BENDING_MACHINES_PAGE_EXPRESSION.whyCardKeys).toEqual([
      "card1",
      "card2",
      "card3",
    ]);
    expect(SINGLE_SITE_BENDING_MACHINES_PAGE_EXPRESSION.stats).toEqual([
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
    ]);
    expect(SINGLE_SITE_OEM_PAGE_EXPRESSION.ctaHref).toBe("/contact");
  });
});

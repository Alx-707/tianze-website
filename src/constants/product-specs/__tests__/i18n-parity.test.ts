import { describe, expect, it } from "vitest";
import { PRODUCT_CATALOG } from "@/constants/product-catalog";
import { NORTH_AMERICA_SPECS } from "@/constants/product-specs/north-america";
import { AUSTRALIA_NZ_SPECS } from "@/constants/product-specs/australia-new-zealand";
import { MEXICO_SPECS } from "@/constants/product-specs/mexico";
import { EUROPE_SPECS } from "@/constants/product-specs/europe";
import { PNEUMATIC_SPECS } from "@/constants/product-specs/pneumatic-tube-systems";
import type { MarketSpecs } from "@/constants/product-specs/types";
import { EQUIPMENT_SPECS } from "@/constants/equipment-specs";

// Import translation JSON files
import enCritical from "../../../../messages/en/critical.json";
import zhCritical from "../../../../messages/zh/critical.json";
import enDeferred from "../../../../messages/en/deferred.json";
import zhDeferred from "../../../../messages/zh/deferred.json";

/**
 * Helper: Traverse nested objects using dot-separated paths.
 * Example: getNestedValue(obj, "catalog.markets.north-america.label")
 */
function getNestedValue(obj: unknown, dotPath: string): unknown {
  const keys = dotPath.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

// Market specs lookup table
const SPECS_BY_MARKET: Record<string, MarketSpecs> = {
  "north-america": NORTH_AMERICA_SPECS,
  "australia-new-zealand": AUSTRALIA_NZ_SPECS,
  mexico: MEXICO_SPECS,
  europe: EUROPE_SPECS,
  "pneumatic-tube-systems": PNEUMATIC_SPECS,
};

describe("Feature: Product Translation Key Parity", () => {
  describe("Scenario: Market catalog entries have translations", () => {
    it("every market has label and description keys in both locales", () => {
      for (const market of PRODUCT_CATALOG.markets) {
        const enLabelKey = `catalog.markets.${market.slug}.label`;
        const enDescKey = `catalog.markets.${market.slug}.description`;
        const zhLabelKey = `catalog.markets.${market.slug}.label`;
        const zhDescKey = `catalog.markets.${market.slug}.description`;

        expect(
          getNestedValue(enCritical, enLabelKey),
          `missing en: ${enLabelKey}`,
        ).toBeDefined();
        expect(
          getNestedValue(enCritical, enDescKey),
          `missing en: ${enDescKey}`,
        ).toBeDefined();
        expect(
          getNestedValue(zhCritical, zhLabelKey),
          `missing zh: ${zhLabelKey}`,
        ).toBeDefined();
        expect(
          getNestedValue(zhCritical, zhDescKey),
          `missing zh: ${zhDescKey}`,
        ).toBeDefined();
      }
    });
  });

  describe("Scenario: Product families have translations", () => {
    it("every family has label and description keys in both locales", () => {
      for (const family of PRODUCT_CATALOG.families) {
        const enLabelKey = `catalog.families.${family.marketSlug}.${family.slug}.label`;
        const enDescKey = `catalog.families.${family.marketSlug}.${family.slug}.description`;
        const zhLabelKey = `catalog.families.${family.marketSlug}.${family.slug}.label`;
        const zhDescKey = `catalog.families.${family.marketSlug}.${family.slug}.description`;

        expect(
          getNestedValue(enCritical, enLabelKey),
          `missing en: ${enLabelKey}`,
        ).toBeDefined();
        expect(
          getNestedValue(enCritical, enDescKey),
          `missing en: ${enDescKey}`,
        ).toBeDefined();
        expect(
          getNestedValue(zhCritical, zhLabelKey),
          `missing zh: ${zhLabelKey}`,
        ).toBeDefined();
        expect(
          getNestedValue(zhCritical, zhDescKey),
          `missing zh: ${zhDescKey}`,
        ).toBeDefined();
      }
    });
  });

  describe("Scenario: Technical properties have shared label translations", () => {
    it("every technical property key has a shared label translation", () => {
      // Collect all unique technical keys from all market specs
      const allTechnicalKeys = new Set<string>();

      for (const specs of Object.values(SPECS_BY_MARKET)) {
        for (const key of Object.keys(specs.technical)) {
          allTechnicalKeys.add(key);
        }
      }

      for (const key of allTechnicalKeys) {
        const enKey = `catalog.technicalLabels.${key}`;
        const zhKey = `catalog.technicalLabels.${key}`;

        expect(
          getNestedValue(enCritical, enKey),
          `missing en: ${enKey}`,
        ).toBeDefined();
        expect(
          getNestedValue(zhCritical, zhKey),
          `missing zh: ${zhKey}`,
        ).toBeDefined();
      }
    });
  });

  describe("Scenario: Family highlights have translations", () => {
    it("every family highlight count matches translation keys", () => {
      for (const [marketSlug, specs] of Object.entries(SPECS_BY_MARKET)) {
        for (const family of specs.families) {
          for (let i = 0; i < family.highlights.length; i++) {
            const enKey = `catalog.specs.${marketSlug}.families.${family.slug}.highlights.${i}`;
            const zhKey = `catalog.specs.${marketSlug}.families.${family.slug}.highlights.${i}`;

            expect(
              getNestedValue(enCritical, enKey),
              `missing en: ${enKey}`,
            ).toBeDefined();
            expect(
              getNestedValue(zhCritical, zhKey),
              `missing zh: ${zhKey}`,
            ).toBeDefined();
          }
        }
      }
    });
  });

  describe("Scenario: Spec groups have label translations", () => {
    it("every spec group has a label key in both locales", () => {
      for (const [marketSlug, specs] of Object.entries(SPECS_BY_MARKET)) {
        for (const family of specs.families) {
          for (
            let groupIdx = 0;
            groupIdx < family.specGroups.length;
            groupIdx++
          ) {
            const enKey = `catalog.specs.${marketSlug}.families.${family.slug}.groups.${groupIdx}.label`;
            const zhKey = `catalog.specs.${marketSlug}.families.${family.slug}.groups.${groupIdx}.label`;

            expect(
              getNestedValue(enCritical, enKey),
              `missing en: ${enKey}`,
            ).toBeDefined();
            expect(
              getNestedValue(zhCritical, zhKey),
              `missing zh: ${zhKey}`,
            ).toBeDefined();
          }
        }
      }
    });
  });

  describe("Scenario: Equipment specifications have translations", () => {
    it("every equipment spec has name, param labels, and highlights in both locales", () => {
      for (const equipment of EQUIPMENT_SPECS) {
        // Check equipment name key
        const enNameKey = `capabilities.equipment.${equipment.slug}.name`;
        const zhNameKey = `capabilities.equipment.${equipment.slug}.name`;

        expect(
          getNestedValue(enDeferred, enNameKey),
          `missing en: ${enNameKey}`,
        ).toBeDefined();
        expect(
          getNestedValue(zhDeferred, zhNameKey),
          `missing zh: ${zhNameKey}`,
        ).toBeDefined();

        // Check equipment param labels
        for (const paramKey of Object.keys(equipment.params)) {
          const enParamKey = `capabilities.equipment.${equipment.slug}.params.${paramKey}`;
          const zhParamKey = `capabilities.equipment.${equipment.slug}.params.${paramKey}`;

          expect(
            getNestedValue(enDeferred, enParamKey),
            `missing en: ${enParamKey}`,
          ).toBeDefined();
          expect(
            getNestedValue(zhDeferred, zhParamKey),
            `missing zh: ${zhParamKey}`,
          ).toBeDefined();
        }

        // Check equipment highlights
        for (let i = 0; i < equipment.highlights.length; i++) {
          const enHighlightKey = `capabilities.equipment.${equipment.slug}.highlights.${i}`;
          const zhHighlightKey = `capabilities.equipment.${equipment.slug}.highlights.${i}`;

          expect(
            getNestedValue(enDeferred, enHighlightKey),
            `missing en: ${enHighlightKey}`,
          ).toBeDefined();
          expect(
            getNestedValue(zhDeferred, zhHighlightKey),
            `missing zh: ${zhHighlightKey}`,
          ).toBeDefined();
        }
      }
    });
  });
});

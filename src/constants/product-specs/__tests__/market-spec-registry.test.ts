import { describe, expect, it } from "vitest";
import { getAllMarketSlugs } from "@/constants/product-catalog";
import {
  getMarketSpecEntries,
  getMarketSpecsBySlug,
  MARKET_SPECS_BY_SLUG,
} from "@/constants/product-specs/market-spec-registry";

describe("market spec registry", () => {
  it("covers every catalog market exactly once", () => {
    const catalogSlugs = [...getAllMarketSlugs()].sort();
    const registrySlugs = Object.keys(MARKET_SPECS_BY_SLUG).sort();

    expect(registrySlugs).toEqual(catalogSlugs);
  });

  it("exposes stable entries for parity checks", () => {
    const entries = getMarketSpecEntries();
    const entrySlugs = entries.map(([marketSlug]) => marketSlug).sort();

    expect(entrySlugs).toEqual([...getAllMarketSlugs()].sort());
    for (const [, specs] of entries) {
      expect(specs.families.length).toBeGreaterThan(0);
      expect(Object.keys(specs.technical).length).toBeGreaterThan(0);
    }
  });

  it("returns undefined for unknown and prototype-like market slugs", () => {
    expect(getMarketSpecsBySlug("unknown-market")).toBeUndefined();
    expect(getMarketSpecsBySlug("__proto__")).toBeUndefined();
    expect(getMarketSpecsBySlug("constructor")).toBeUndefined();
  });
});

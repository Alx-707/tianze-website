import { describe, expect, it } from "vitest";
import { AUSTRALIA_NZ_SPECS } from "../australia-new-zealand";
import type { MarketSpecs } from "../types";

describe("Feature: AU/NZ Spec Data", () => {
  it("exports a valid MarketSpecs object", () => {
    const specs: MarketSpecs = AUSTRALIA_NZ_SPECS;
    expect(specs).toBeDefined();
  });

  it("includes AS/NZS 2053 certification", () => {
    expect(AUSTRALIA_NZ_SPECS.certifications).toContain("AS/NZS 2053");
  });

  it("uses metric sizes in spec tables", () => {
    const firstFamily = AUSTRALIA_NZ_SPECS.families[0]!;
    const firstRow = firstFamily.specGroups[0]!.rows[0]!;
    expect(firstRow[0]).toMatch(/mm/);
  });

  it("has Medium Duty and Heavy Duty groups", () => {
    const bends = AUSTRALIA_NZ_SPECS.families.find(
      (f) => f.slug === "conduit-bends",
    )!;
    const labels = bends.specGroups.map((g) => g.groupLabel);
    expect(labels).toContain("Medium Duty");
    expect(labels).toContain("Heavy Duty");
  });

  it("includes bellmouths family (unique to AU/NZ)", () => {
    const slugs = AUSTRALIA_NZ_SPECS.families.map((f) => f.slug);
    expect(slugs).toContain("bellmouths");
  });

  it("bellmouths family includes 'Flared Entry Protection' highlight", () => {
    const bellmouths = AUSTRALIA_NZ_SPECS.families.find(
      (f) => f.slug === "bellmouths",
    )!;
    expect(bellmouths.highlights).toContain("Flared Entry Protection");
  });

  it("includes all 4 families matching product-catalog.ts", () => {
    expect(AUSTRALIA_NZ_SPECS.families).toHaveLength(4);
    const slugs = AUSTRALIA_NZ_SPECS.families.map((f) => f.slug);
    expect(slugs).toContain("conduit-bends");
    expect(slugs).toContain("bellmouths");
    expect(slugs).toContain("couplings");
    expect(slugs).toContain("conduit-pipes");
  });

  it("spec group rows match column count", () => {
    for (const family of AUSTRALIA_NZ_SPECS.families) {
      for (const group of family.specGroups) {
        for (const row of group.rows) {
          expect(row).toHaveLength(group.columns.length);
        }
      }
    }
  });
});

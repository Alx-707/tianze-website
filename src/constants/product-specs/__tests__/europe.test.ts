import { describe, expect, it } from "vitest";
import { EUROPE_SPECS } from "../europe";
import type { MarketSpecs } from "../types";

describe("Feature: Europe Spec Data", () => {
  it("exports a valid MarketSpecs object", () => {
    const specs: MarketSpecs = EUROPE_SPECS;
    expect(specs).toBeDefined();
  });

  it("includes IEC 61386 certification", () => {
    expect(EUROPE_SPECS.certifications).toContain("IEC 61386");
  });

  it("uses metric sizes in spec tables", () => {
    const firstFamily = EUROPE_SPECS.families[0]!;
    const firstRow = firstFamily.specGroups[0]!.rows[0]!;
    expect(firstRow[0]).toMatch(/mm/);
  });

  it("has Light, Medium, and Heavy duty groups", () => {
    const bends = EUROPE_SPECS.families.find(
      (f) => f.slug === "conduit-bends",
    )!;
    const labels = bends.specGroups.map((g) => g.groupLabel);
    expect(labels).toContain("Light");
    expect(labels).toContain("Medium");
    expect(labels).toContain("Heavy");
  });

  it("includes exactly 3 families matching product-catalog.ts", () => {
    expect(EUROPE_SPECS.families).toHaveLength(3);
    const slugs = EUROPE_SPECS.families.map((f) => f.slug);
    expect(slugs).toContain("conduit-bends");
    expect(slugs).toContain("couplings");
    expect(slugs).toContain("conduit-pipes");
  });

  it("conduit-bends highlights include 'IEC 61386 Certified'", () => {
    const bends = EUROPE_SPECS.families.find(
      (f) => f.slug === "conduit-bends",
    )!;
    expect(bends.highlights).toContain("IEC 61386 Certified");
  });

  it("spec group rows match column count", () => {
    for (const family of EUROPE_SPECS.families) {
      for (const group of family.specGroups) {
        for (const row of group.rows) {
          expect(row).toHaveLength(group.columns.length);
        }
      }
    }
  });
});

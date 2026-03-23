import { describe, expect, it } from "vitest";
import { MEXICO_SPECS } from "../mexico";
import type { MarketSpecs } from "../types";

describe("Feature: Mexico Spec Data", () => {
  it("exports a valid MarketSpecs object", () => {
    const specs: MarketSpecs = MEXICO_SPECS;
    expect(specs).toBeDefined();
  });

  it("includes NOM-001-SEDE certification", () => {
    expect(MEXICO_SPECS.certifications).toContain("NOM-001-SEDE");
  });

  it("uses metric sizes in spec tables", () => {
    const firstFamily = MEXICO_SPECS.families[0]!;
    const firstRow = firstFamily.specGroups[0]!.rows[0]!;
    expect(firstRow[0]).toMatch(/mm/);
  });

  it("has Tipo Ligero and Tipo Pesado groups", () => {
    const bends = MEXICO_SPECS.families.find(
      (f) => f.slug === "conduit-bends",
    )!;
    const labels = bends.specGroups.map((g) => g.groupLabel);
    expect(labels).toContain("Tipo Ligero");
    expect(labels).toContain("Tipo Pesado");
  });

  it("does not include bellmouths family", () => {
    const slugs = MEXICO_SPECS.families.map((f) => f.slug);
    expect(slugs).not.toContain("bellmouths");
  });

  it("includes exactly 3 families matching product-catalog.ts", () => {
    expect(MEXICO_SPECS.families).toHaveLength(3);
    const slugs = MEXICO_SPECS.families.map((f) => f.slug);
    expect(slugs).toContain("conduit-bends");
    expect(slugs).toContain("couplings");
    expect(slugs).toContain("conduit-pipes");
  });

  it("conduit-bends highlights include 'NOM Compliant'", () => {
    const bends = MEXICO_SPECS.families.find(
      (f) => f.slug === "conduit-bends",
    )!;
    expect(bends.highlights).toContain("NOM Compliant");
  });

  it("spec group rows match column count", () => {
    for (const family of MEXICO_SPECS.families) {
      for (const group of family.specGroups) {
        for (const row of group.rows) {
          expect(row).toHaveLength(group.columns.length);
        }
      }
    }
  });
});

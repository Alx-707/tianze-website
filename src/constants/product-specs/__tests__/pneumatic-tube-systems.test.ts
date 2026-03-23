import { describe, expect, it } from "vitest";
import { PNEUMATIC_SPECS } from "../pneumatic-tube-systems";
import type { MarketSpecs } from "../types";

describe("Feature: Specification Data Architecture", () => {
  describe("Scenario: Pneumatic Tube Systems spec data is available", () => {
    it("exports a valid MarketSpecs object", () => {
      const specs: MarketSpecs = PNEUMATIC_SPECS;
      expect(specs).toBeDefined();
    });

    it("includes technical properties with PETG material", () => {
      expect(PNEUMATIC_SPECS.technical).toHaveProperty("material");
      expect(PNEUMATIC_SPECS.technical.material).toMatch(/PETG/i);
    });

    it("includes certifications with ISO 9001:2015", () => {
      expect(PNEUMATIC_SPECS.certifications).toContain("ISO 9001:2015");
    });

    it("includes trade information with MOQ in meters", () => {
      expect(PNEUMATIC_SPECS.trade.moq).toMatch(/meter/i);
      expect(PNEUMATIC_SPECS.trade.leadTime).toBeDefined();
      expect(PNEUMATIC_SPECS.trade.portOfLoading).toBeDefined();
    });

    it("includes exactly 2 families: petg-tubes and fittings", () => {
      expect(PNEUMATIC_SPECS.families).toHaveLength(2);
      const slugs = PNEUMATIC_SPECS.families.map((f) => f.slug);
      expect(slugs).toContain("petg-tubes");
      expect(slugs).toContain("fittings");
    });

    it("petg-tubes family has groups by OD size", () => {
      const petgTubes = PNEUMATIC_SPECS.families.find(
        (f) => f.slug === "petg-tubes",
      )!;
      const groupLabels = petgTubes.specGroups.map((g) => g.groupLabel);
      expect(groupLabels.some((label) => /110mm/i.test(label))).toBe(true);
      expect(groupLabels.some((label) => /160mm/i.test(label))).toBe(true);
    });

    it("fittings family exists with spec groups", () => {
      const fittings = PNEUMATIC_SPECS.families.find(
        (f) => f.slug === "fittings",
      )!;
      expect(fittings).toBeDefined();
      expect(fittings.specGroups.length).toBeGreaterThan(0);
    });

    it("petg-tubes highlights include Crystal Clear PETG", () => {
      const petgTubes = PNEUMATIC_SPECS.families.find(
        (f) => f.slug === "petg-tubes",
      )!;
      expect(
        petgTubes.highlights.some((h) => /crystal clear petg/i.test(h)),
      ).toBe(true);
    });

    it("spec group rows match column count", () => {
      for (const family of PNEUMATIC_SPECS.families) {
        for (const group of family.specGroups) {
          for (const row of group.rows) {
            expect(row).toHaveLength(group.columns.length);
          }
        }
      }
    });

    it("technical properties include transparency and pressure", () => {
      expect(PNEUMATIC_SPECS.technical).toHaveProperty("transparency");
      expect(PNEUMATIC_SPECS.technical).toHaveProperty("maxWorkingPressure");
      expect(PNEUMATIC_SPECS.technical).toHaveProperty("temperatureRange");
    });
  });
});

import { describe, expect, it } from "vitest";
import { NORTH_AMERICA_SPECS } from "../north-america";
import type { MarketSpecs } from "../types";

describe("Feature: Specification Data Architecture", () => {
  describe("Scenario: North America spec data is available", () => {
    it("exports a valid MarketSpecs object", () => {
      const specs: MarketSpecs = NORTH_AMERICA_SPECS;
      expect(specs).toBeDefined();
    });

    it("includes technical properties", () => {
      expect(NORTH_AMERICA_SPECS.technical).toHaveProperty("material");
      expect(NORTH_AMERICA_SPECS.technical).toHaveProperty("temperatureRange");
    });

    it("includes certifications", () => {
      expect(NORTH_AMERICA_SPECS.certifications).toContain("UL 651");
      expect(NORTH_AMERICA_SPECS.certifications).toContain("ASTM D1785");
    });

    it("includes trade information", () => {
      expect(NORTH_AMERICA_SPECS.trade.moq).toBeDefined();
      expect(NORTH_AMERICA_SPECS.trade.leadTime).toBeDefined();
      expect(NORTH_AMERICA_SPECS.trade.portOfLoading).toBeDefined();
    });

    it("includes spec groups for all 3 families", () => {
      expect(NORTH_AMERICA_SPECS.families).toHaveLength(3);
      const slugs = NORTH_AMERICA_SPECS.families.map((f) => f.slug);
      expect(slugs).toContain("conduit-sweeps-elbows");
      expect(slugs).toContain("couplings");
      expect(slugs).toContain("conduit-pipes");
    });

    it("sweeps family has Schedule 40 and Schedule 80 groups", () => {
      const sweeps = NORTH_AMERICA_SPECS.families.find(
        (f) => f.slug === "conduit-sweeps-elbows",
      )!;
      const groupLabels = sweeps.specGroups.map((g) => g.groupLabel);
      expect(groupLabels).toContain("Schedule 40");
      expect(groupLabels).toContain("Schedule 80");
    });

    it("each family has exactly 3 highlights", () => {
      for (const family of NORTH_AMERICA_SPECS.families) {
        expect(family.highlights).toHaveLength(3);
      }
    });

    it("spec group rows match column count", () => {
      for (const family of NORTH_AMERICA_SPECS.families) {
        for (const group of family.specGroups) {
          for (const row of group.rows) {
            expect(row).toHaveLength(group.columns.length);
          }
        }
      }
    });
  });
});

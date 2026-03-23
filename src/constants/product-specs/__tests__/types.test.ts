import { describe, expect, it } from "vitest";
import type { MarketSpecs, FamilySpecs, SpecGroup } from "../types";

describe("Feature: Specification Data Architecture", () => {
  describe("Scenario: Spec data types enforce completeness", () => {
    it("MarketSpecs requires technical, certifications, trade, and families", () => {
      const specs: MarketSpecs = {
        technical: { material: "PVC" },
        certifications: ["UL 651"],
        trade: {
          moq: "500 pcs",
          leadTime: "15-20 days",
          supplyCapacity: "50,000 pcs/month",
          packaging: "Carton",
          portOfLoading: "Lianyungang",
        },
        families: [],
      };
      expect(specs.technical).toBeDefined();
      expect(specs.certifications).toBeDefined();
      expect(specs.trade).toBeDefined();
      expect(specs.families).toBeDefined();
    });

    it("FamilySpecs requires slug, images, highlights, and specGroups", () => {
      const family: FamilySpecs = {
        slug: "conduit-sweeps-elbows",
        images: ["/images/products/placeholder.svg"],
        highlights: ["highlight1", "highlight2", "highlight3"],
        specGroups: [],
      };
      expect(family.slug).toBe("conduit-sweeps-elbows");
      expect(family.images.length).toBeGreaterThan(0);
      expect(family.highlights).toHaveLength(3);
    });

    it("SpecGroup requires groupLabel, columns, and rows", () => {
      const group: SpecGroup = {
        groupLabel: "Schedule 40",
        columns: ["Size", "Angle", "Wall", "End Type"],
        rows: [['1/2"', "90°", '0.060"', "Bell End"]],
      };
      expect(group.columns).toHaveLength(4);
      expect(group.rows[0]).toHaveLength(4);
    });
  });
});

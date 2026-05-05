import { describe, expect, it } from "vitest";
import {
  assertMarketSpecParity,
  createMarketSpecParityReport,
  formatMarketSpecParityError,
} from "../market-spec-parity";

describe("market spec parity", () => {
  it("reports no live parity drift", () => {
    expect(createMarketSpecParityReport()).toEqual({
      missingSpecFamilies: [],
      orphanSpecFamilies: [],
    });
    expect(() => assertMarketSpecParity()).not.toThrow();
  });

  it("names missing spec families clearly", () => {
    const report = createMarketSpecParityReport({
      catalogFamiliesByMarket: {
        "north-america": ["couplings", "missing-family"],
      },
      specFamiliesByMarket: {
        "north-america": ["couplings"],
      },
    });

    expect(report.missingSpecFamilies).toEqual([
      { marketSlug: "north-america", familySlug: "missing-family" },
    ]);
    expect(formatMarketSpecParityError(report)).toContain(
      "missing spec: north-america/missing-family",
    );
  });

  it("names orphan spec families clearly", () => {
    const report = createMarketSpecParityReport({
      catalogFamiliesByMarket: {
        europe: ["couplings"],
      },
      specFamiliesByMarket: {
        europe: ["couplings", "orphan-family"],
      },
    });

    expect(report.orphanSpecFamilies).toEqual([
      { marketSlug: "europe", familySlug: "orphan-family" },
    ]);
    expect(formatMarketSpecParityError(report)).toContain(
      "orphan spec: europe/orphan-family",
    );
  });
});

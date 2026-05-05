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

  it("reports every catalog family when a market is missing from specs", () => {
    const report = createMarketSpecParityReport({
      catalogFamiliesByMarket: {
        "new-market": ["zeta", "alpha"],
      },
      specFamiliesByMarket: {},
    });

    expect(report.missingSpecFamilies).toEqual([
      { marketSlug: "new-market", familySlug: "alpha" },
      { marketSlug: "new-market", familySlug: "zeta" },
    ]);
    expect(formatMarketSpecParityError(report)).toContain(
      "missing spec: new-market/alpha",
    );
    expect(formatMarketSpecParityError(report)).toContain(
      "missing spec: new-market/zeta",
    );
  });

  it("reports every spec family when a market is missing from catalog", () => {
    const report = createMarketSpecParityReport({
      catalogFamiliesByMarket: {},
      specFamiliesByMarket: {
        "legacy-market": ["zeta", "alpha"],
      },
    });

    expect(report.orphanSpecFamilies).toEqual([
      { marketSlug: "legacy-market", familySlug: "alpha" },
      { marketSlug: "legacy-market", familySlug: "zeta" },
    ]);
    expect(formatMarketSpecParityError(report)).toContain(
      "orphan spec: legacy-market/alpha",
    );
    expect(formatMarketSpecParityError(report)).toContain(
      "orphan spec: legacy-market/zeta",
    );
  });

  it("keeps custom input reports sorted without hiding duplicate drift", () => {
    const report = createMarketSpecParityReport({
      catalogFamiliesByMarket: {
        beta: ["zeta", "alpha", "alpha"],
        alpha: ["delta"],
      },
      specFamiliesByMarket: {
        beta: ["omega", "alpha"],
        alpha: [],
      },
    });

    expect(report.missingSpecFamilies).toEqual([
      { marketSlug: "alpha", familySlug: "delta" },
      { marketSlug: "beta", familySlug: "alpha" },
      { marketSlug: "beta", familySlug: "zeta" },
    ]);
    expect(report.orphanSpecFamilies).toEqual([
      { marketSlug: "beta", familySlug: "omega" },
    ]);
  });

  it("formats mixed drift in a stable multi-line order", () => {
    const report = createMarketSpecParityReport({
      catalogFamiliesByMarket: {
        beta: ["zeta", "alpha", "alpha"],
        alpha: ["delta"],
      },
      specFamiliesByMarket: {
        beta: ["omega", "alpha"],
        alpha: [],
      },
    });

    expect(formatMarketSpecParityError(report)).toBe(
      [
        "missing spec: alpha/delta",
        "missing spec: beta/alpha",
        "missing spec: beta/zeta",
        "orphan spec: beta/omega",
      ].join("\n"),
    );
  });
});

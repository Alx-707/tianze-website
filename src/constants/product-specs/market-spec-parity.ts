import {
  getAllMarketSlugs,
  getFamiliesForMarket,
} from "@/constants/product-catalog";
import {
  getMarketSpecEntries,
  getMarketSpecsBySlug,
} from "@/constants/product-specs/market-spec-registry";

export interface MarketFamilyParityIssue {
  marketSlug: string;
  familySlug: string;
}

export interface MarketSpecParityReport {
  missingSpecFamilies: MarketFamilyParityIssue[];
  orphanSpecFamilies: MarketFamilyParityIssue[];
}

export interface MarketSpecParityInput {
  catalogFamiliesByMarket: Record<string, readonly string[]>;
  specFamiliesByMarket: Record<string, readonly string[]>;
}

function uniqueSorted(values: readonly string[]): string[] {
  return Array.from(new Set(values)).sort();
}

function createLiveParityInput(): MarketSpecParityInput {
  const catalogFamiliesByMarket = Object.fromEntries(
    getAllMarketSlugs().map((marketSlug) => [
      marketSlug,
      uniqueSorted(
        getFamiliesForMarket(marketSlug).map((family) => family.slug),
      ),
    ]),
  );

  const specFamiliesByMarket = Object.fromEntries(
    getMarketSpecEntries().map(([marketSlug, specs]) => [
      marketSlug,
      uniqueSorted(specs.families.map((family) => family.slug)),
    ]),
  );

  return { catalogFamiliesByMarket, specFamiliesByMarket };
}

export function createMarketSpecParityReport(
  input: MarketSpecParityInput = createLiveParityInput(),
): MarketSpecParityReport {
  const marketSlugs = uniqueSorted([
    ...Object.keys(input.catalogFamiliesByMarket),
    ...Object.keys(input.specFamiliesByMarket),
  ]);
  const missingSpecFamilies: MarketFamilyParityIssue[] = [];
  const orphanSpecFamilies: MarketFamilyParityIssue[] = [];

  for (const marketSlug of marketSlugs) {
    const catalogFamilies = new Set(
      uniqueSorted(input.catalogFamiliesByMarket[marketSlug] ?? []),
    );
    const specFamilies = new Set(
      uniqueSorted(input.specFamiliesByMarket[marketSlug] ?? []),
    );

    for (const familySlug of catalogFamilies) {
      if (!specFamilies.has(familySlug)) {
        missingSpecFamilies.push({ marketSlug, familySlug });
      }
    }

    for (const familySlug of specFamilies) {
      if (!catalogFamilies.has(familySlug)) {
        orphanSpecFamilies.push({ marketSlug, familySlug });
      }
    }
  }

  return { missingSpecFamilies, orphanSpecFamilies };
}

export function formatMarketSpecParityError(
  report: MarketSpecParityReport,
): string {
  const lines = [
    ...report.missingSpecFamilies.map(
      (issue) => `missing spec: ${issue.marketSlug}/${issue.familySlug}`,
    ),
    ...report.orphanSpecFamilies.map(
      (issue) => `orphan spec: ${issue.marketSlug}/${issue.familySlug}`,
    ),
  ];

  return lines.join("\n");
}

export function assertMarketSpecParity(): void {
  const report = createMarketSpecParityReport();
  if (
    report.missingSpecFamilies.length > 0 ||
    report.orphanSpecFamilies.length > 0
  ) {
    throw new Error(formatMarketSpecParityError(report));
  }

  for (const marketSlug of getAllMarketSlugs()) {
    const specs = getMarketSpecsBySlug(marketSlug);
    if (!specs) {
      throw new Error(`missing market specs: ${marketSlug}`);
    }
  }
}

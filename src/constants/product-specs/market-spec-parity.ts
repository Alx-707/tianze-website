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

function sorted(values: readonly string[]): string[] {
  return [...values].sort();
}

function uniqueSortedKeys(values: readonly string[]): string[] {
  return Array.from(new Set(values)).sort();
}

function countBySlug(values: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
}

function collectMissingIssues({
  marketSlug,
  sourceFamilies,
  targetFamilies,
}: {
  marketSlug: string;
  sourceFamilies: readonly string[];
  targetFamilies: readonly string[];
}): MarketFamilyParityIssue[] {
  const targetCounts = countBySlug(targetFamilies);
  const issues: MarketFamilyParityIssue[] = [];

  for (const familySlug of sorted(sourceFamilies)) {
    const remaining = targetCounts.get(familySlug) ?? 0;
    if (remaining > 0) {
      targetCounts.set(familySlug, remaining - 1);
      continue;
    }

    issues.push({ marketSlug, familySlug });
  }

  return issues;
}

function createLiveParityInput(): MarketSpecParityInput {
  const catalogFamiliesByMarket = Object.fromEntries(
    getAllMarketSlugs().map((marketSlug) => [
      marketSlug,
      sorted(getFamiliesForMarket(marketSlug).map((family) => family.slug)),
    ]),
  );

  const specFamiliesByMarket = Object.fromEntries(
    getMarketSpecEntries().map(([marketSlug, specs]) => [
      marketSlug,
      sorted(specs.families.map((family) => family.slug)),
    ]),
  );

  return { catalogFamiliesByMarket, specFamiliesByMarket };
}

export function createMarketSpecParityReport(
  input: MarketSpecParityInput = createLiveParityInput(),
): MarketSpecParityReport {
  const marketSlugs = uniqueSortedKeys([
    ...Object.keys(input.catalogFamiliesByMarket),
    ...Object.keys(input.specFamiliesByMarket),
  ]);
  const missingSpecFamilies: MarketFamilyParityIssue[] = [];
  const orphanSpecFamilies: MarketFamilyParityIssue[] = [];

  for (const marketSlug of marketSlugs) {
    missingSpecFamilies.push(
      ...collectMissingIssues({
        marketSlug,
        sourceFamilies: input.catalogFamiliesByMarket[marketSlug] ?? [],
        targetFamilies: input.specFamiliesByMarket[marketSlug] ?? [],
      }),
    );
    orphanSpecFamilies.push(
      ...collectMissingIssues({
        marketSlug,
        sourceFamilies: input.specFamiliesByMarket[marketSlug] ?? [],
        targetFamilies: input.catalogFamiliesByMarket[marketSlug] ?? [],
      }),
    );
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

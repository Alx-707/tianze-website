import {
  getFamiliesForMarket,
  getMarketBySlug,
  type ProductFamilyDefinition,
} from "@/constants/product-catalog";
import { AUSTRALIA_NZ_SPECS } from "@/constants/product-specs/australia-new-zealand";
import { EUROPE_SPECS } from "@/constants/product-specs/europe";
import { MEXICO_SPECS } from "@/constants/product-specs/mexico";
import { NORTH_AMERICA_SPECS } from "@/constants/product-specs/north-america";
import { PNEUMATIC_SPECS } from "@/constants/product-specs/pneumatic-tube-systems";
import type { MarketSpecs } from "@/constants/product-specs/types";

const SPECS_BY_MARKET: Record<string, MarketSpecs> = {
  "north-america": NORTH_AMERICA_SPECS,
  "australia-new-zealand": AUSTRALIA_NZ_SPECS,
  mexico: MEXICO_SPECS,
  europe: EUROPE_SPECS,
  "pneumatic-tube-systems": PNEUMATIC_SPECS,
};

export interface MarketPageData {
  market: NonNullable<ReturnType<typeof getMarketBySlug>>;
  families: readonly ProductFamilyDefinition[];
  marketSpecs: MarketSpecs | undefined;
  familySpecsMap: Map<string, MarketSpecs["families"][number]>;
}

export function getMarketPageData(marketSlug: string): MarketPageData {
  const market = getMarketBySlug(marketSlug);
  if (!market) {
    throw new Error(`Unknown market slug: ${marketSlug}`);
  }

  const families = getFamiliesForMarket(marketSlug);
  const marketSpecs = SPECS_BY_MARKET[marketSlug];
  const familySpecsMap = new Map(
    marketSpecs?.families.map((familySpecs) => [familySpecs.slug, familySpecs]),
  );

  return {
    market,
    families,
    marketSpecs,
    familySpecsMap,
  };
}

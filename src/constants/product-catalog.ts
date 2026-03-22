/**
 * Product catalog configuration — single source of truth.
 *
 * Every route, breadcrumb, card, and navigation element derives from this config.
 * No hardcoded market/family slugs anywhere else in the codebase.
 */
import type { ProductStandardId } from "@/constants/product-standards";

// --- Size System ---

type SizeSystem = "inch" | "mm";

// --- Market Definition ---

export interface MarketDefinition {
  /** URL slug: /products/{slug}/ */
  slug: string;
  /** Navigation label, e.g. "UL / ASTM Series" */
  label: string;
  /** The compliance standard name for SEO/technical contexts */
  standardLabel: string;
  /** Short description for the market landing page */
  description: string;
  /** Measurement system used in this market */
  sizeSystem: SizeSystem;
  /** Which product-standards.ts IDs apply to this market */
  standardIds: readonly ProductStandardId[];
  /** Ordered list of product family slugs available in this market */
  familySlugs: readonly string[];
}

// --- Product Family Definition ---

export interface ProductFamilyDefinition {
  /** URL slug: /products/{market}/{slug}/ */
  slug: string;
  /** Display label, e.g. "Conduit Sweeps & Elbows" */
  label: string;
  /** Short description for the family page */
  description: string;
  /** Which market this family belongs to (back-reference) */
  marketSlug: string;
}

// --- Catalog Config ---

interface CatalogConfig {
  readonly markets: readonly MarketDefinition[];
  readonly families: readonly ProductFamilyDefinition[];
}

export const PRODUCT_CATALOG: CatalogConfig = {
  markets: [
    {
      slug: "north-america",
      label: "UL / ASTM Series",
      standardLabel: "UL 651 / ASTM D1785",
      description:
        "PVC conduit fittings engineered to UL 651 and ASTM D1785 standards for the North American electrical market. Available in Schedule 40 and Schedule 80.",
      sizeSystem: "inch",
      standardIds: ["ul651_sch40", "ul651_sch80", "astm"],
      familySlugs: ["conduit-sweeps-elbows", "couplings", "conduit-pipes"],
    },
    {
      slug: "australia-new-zealand",
      label: "AS/NZS 2053 Series",
      standardLabel: "AS/NZS 2053",
      description:
        "PVC conduit fittings manufactured to AS/NZS 2053 standards for Australian and New Zealand electrical installations. Medium and heavy duty ratings.",
      sizeSystem: "mm",
      standardIds: ["as_nzs"],
      familySlugs: [
        "conduit-bends",
        "bellmouths",
        "couplings",
        "conduit-pipes",
      ],
    },
    {
      slug: "mexico",
      label: "NOM Series",
      standardLabel: "NOM-001-SEDE",
      description:
        "PVC conduit fittings compliant with NOM-001-SEDE standards for the Mexican electrical market.",
      sizeSystem: "mm",
      standardIds: [],
      familySlugs: ["conduit-bends", "couplings", "conduit-pipes"],
    },
    {
      slug: "europe",
      label: "IEC Series",
      standardLabel: "IEC 61386",
      description:
        "PVC conduit fittings manufactured to IEC 61386 standards for European electrical installations.",
      sizeSystem: "mm",
      standardIds: [],
      familySlugs: ["conduit-bends", "couplings", "conduit-pipes"],
    },
    {
      slug: "pneumatic-tube-systems",
      label: "PETG Pneumatic Tubes",
      standardLabel: "PETG",
      description:
        "PETG pneumatic tube systems for hospital logistics and automated material transport.",
      sizeSystem: "mm",
      standardIds: [],
      familySlugs: ["petg-tubes", "fittings"],
    },
  ],

  families: [
    // --- North America ---
    {
      slug: "conduit-sweeps-elbows",
      label: "Conduit Sweeps & Elbows",
      description:
        "PVC conduit sweeps and elbows in standard angles. Bell end and plain end options available.",
      marketSlug: "north-america",
    },
    {
      slug: "couplings",
      label: "Couplings",
      description:
        "PVC conduit couplings for joining straight conduit sections. Double-bell design for secure connections.",
      marketSlug: "north-america",
    },
    {
      slug: "conduit-pipes",
      label: "Conduit Pipes",
      description:
        "Rigid PVC conduit pipes in Schedule 40 and Schedule 80 wall thicknesses.",
      marketSlug: "north-america",
    },

    // --- Australia / NZ ---
    {
      slug: "conduit-bends",
      label: "Conduit Bends",
      description:
        "PVC conduit bends in standard angles. Plain and bell end options for AS/NZS 2053 installations.",
      marketSlug: "australia-new-zealand",
    },
    {
      slug: "bellmouths",
      label: "Bellmouths",
      description:
        "PVC bellmouth fittings for conduit termination. Flared entry protects cable insulation during pulling.",
      marketSlug: "australia-new-zealand",
    },
    {
      slug: "couplings",
      label: "Couplings",
      description:
        "PVC conduit couplings for AS/NZS 2053 conduit systems. Double-bell and flared connector options.",
      marketSlug: "australia-new-zealand",
    },
    {
      slug: "conduit-pipes",
      label: "Conduit Pipes",
      description:
        "Rigid PVC conduit pipes in medium and heavy duty ratings for Australian and NZ installations.",
      marketSlug: "australia-new-zealand",
    },

    // --- Mexico ---
    {
      slug: "conduit-bends",
      label: "Conduit Bends",
      description:
        "PVC conduit bends compliant with NOM-001-SEDE for Mexican electrical installations.",
      marketSlug: "mexico",
    },
    {
      slug: "couplings",
      label: "Couplings",
      description: "PVC conduit couplings for NOM-compliant conduit systems.",
      marketSlug: "mexico",
    },
    {
      slug: "conduit-pipes",
      label: "Conduit Pipes",
      description: "Rigid PVC conduit pipes manufactured to NOM standards.",
      marketSlug: "mexico",
    },

    // --- Europe ---
    {
      slug: "conduit-bends",
      label: "Conduit Bends",
      description:
        "PVC conduit bends manufactured to IEC 61386 standards for European electrical installations.",
      marketSlug: "europe",
    },
    {
      slug: "couplings",
      label: "Couplings",
      description: "PVC conduit couplings for IEC 61386 conduit systems.",
      marketSlug: "europe",
    },
    {
      slug: "conduit-pipes",
      label: "Conduit Pipes",
      description:
        "Rigid PVC conduit pipes manufactured to IEC 61386 standards.",
      marketSlug: "europe",
    },

    // --- Pneumatic Tube Systems ---
    {
      slug: "petg-tubes",
      label: "PETG Tubes",
      description:
        "PETG pneumatic transport tubes for hospital logistics systems. Clear and durable.",
      marketSlug: "pneumatic-tube-systems",
    },
    {
      slug: "fittings",
      label: "Fittings",
      description: "Fittings and connectors for PETG pneumatic tube systems.",
      marketSlug: "pneumatic-tube-systems",
    },
  ],
} as const;

// --- Helper Functions ---

/** Get a market definition by its URL slug */
export function getMarketBySlug(slug: string): MarketDefinition | undefined {
  return PRODUCT_CATALOG.markets.find((m) => m.slug === slug);
}

/** Get all product families for a given market slug */
export function getFamiliesForMarket(
  marketSlug: string,
): readonly ProductFamilyDefinition[] {
  return PRODUCT_CATALOG.families.filter((f) => f.marketSlug === marketSlug);
}

/** Get a specific family by market + family slug combination */
export function getFamilyBySlug(
  marketSlug: string,
  familySlug: string,
): ProductFamilyDefinition | undefined {
  return PRODUCT_CATALOG.families.find(
    (f) => f.marketSlug === marketSlug && f.slug === familySlug,
  );
}

/** Check if a market slug is valid */
export function isValidMarketSlug(slug: string): boolean {
  return PRODUCT_CATALOG.markets.some((m) => m.slug === slug);
}

/** Check if a market + family combination is valid */
export function isValidMarketFamilyCombo(
  marketSlug: string,
  familySlug: string,
): boolean {
  return PRODUCT_CATALOG.families.some(
    (f) => f.marketSlug === marketSlug && f.slug === familySlug,
  );
}

/** Get all market slugs (for generateStaticParams) */
export function getAllMarketSlugs(): readonly string[] {
  return PRODUCT_CATALOG.markets.map((m) => m.slug);
}

/** Get all valid market/family param tuples (for generateStaticParams) */
export function getAllMarketFamilyParams(): readonly {
  market: string;
  family: string;
}[] {
  return PRODUCT_CATALOG.families.map((f) => ({
    market: f.marketSlug,
    family: f.slug,
  }));
}

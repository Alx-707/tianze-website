import type {
  MarketDefinition,
  ProductCatalog,
  ProductFamilyDefinition,
} from "@/config/site-types";

const markets: readonly MarketDefinition[] = [
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
    familySlugs: ["conduit-bends", "bellmouths", "couplings", "conduit-pipes"],
  },
  {
    slug: "mexico",
    label: "NOM Series",
    standardLabel: "NOM-001-SEDE",
    description:
      "PVC conduit fittings compliant with NOM-001-SEDE standards for the Mexican electrical market.",
    sizeSystem: "mm",
    standardIds: ["nom"],
    familySlugs: ["conduit-bends", "couplings", "conduit-pipes"],
  },
  {
    slug: "europe",
    label: "IEC Series",
    standardLabel: "IEC 61386",
    description:
      "PVC conduit fittings manufactured to IEC 61386 standards for European electrical installations.",
    sizeSystem: "mm",
    standardIds: ["iec"],
    familySlugs: ["conduit-bends", "couplings", "conduit-pipes"],
  },
  {
    slug: "pneumatic-tube-systems",
    label: "PETG Pneumatic Tubes",
    standardLabel: "PETG",
    description:
      "PETG pneumatic tube systems for hospital logistics and automated material transport.",
    sizeSystem: "mm",
    standardIds: ["petg"],
    familySlugs: ["petg-tubes", "fittings"],
  },
] as const;

const families: readonly ProductFamilyDefinition[] = [
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
    description: "Rigid PVC conduit pipes manufactured to IEC 61386 standards.",
    marketSlug: "europe",
  },
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
] as const;

export const singleSiteProductCatalog: ProductCatalog = {
  markets,
  families,
};

import type { MarketSpecs } from "@/constants/product-specs/types";

export const MEXICO_SPECS = {
  updatedAt: "2026-04-26T00:00:00Z",
  technical: {
    material: "100% Virgin PVC (UPVC)",
    surface: "Smooth interior, reduces wire pulling friction",
    uvResistance: "UV stabilized for outdoor installations",
    temperatureRange: "-20°C to +60°C",
    lifespan: "30+ years service life",
    fireRating: "Self-extinguishing, flame retardant",
  },

  certifications: ["NOM-001-SEDE", "ISO 9001:2015"],

  trade: {
    moq: "500 pcs",
    leadTime: "15-20 days",
    supplyCapacity: "50,000+ pcs/month",
    packaging: "Carton + Pallet (export standard)",
    portOfLoading: "Lianyungang, China",
  },

  families: [
    {
      slug: "conduit-bends",
      images: ["/images/products/pvc-conduit-bend.svg"],
      highlights: ["NOM Compliant", "Metric Sizes", "Light & Heavy Duty"],
      specGroups: [
        {
          groupLabel: "Tipo Ligero",
          columns: ["Size", "Angle", "Wall Thickness", "End Type"],
          rows: [
            ["16mm", "90°", "1.5mm", "Bell End"],
            ["16mm", "45°", "1.5mm", "Plain End"],
            ["20mm", "90°", "1.5mm", "Bell End"],
            ["20mm", "45°", "1.5mm", "Plain End"],
            ["25mm", "90°", "1.5mm", "Bell End"],
            ["25mm", "45°", "1.5mm", "Plain End"],
            ["32mm", "90°", "1.5mm", "Bell End"],
            ["40mm", "90°", "1.5mm", "Bell End"],
            ["50mm", "90°", "1.5mm", "Bell End"],
            ["63mm", "90°", "1.5mm", "Bell End"],
          ],
        },
        {
          groupLabel: "Tipo Pesado",
          columns: ["Size", "Angle", "Wall Thickness", "End Type"],
          rows: [
            ["16mm", "90°", "2.0mm", "Bell End"],
            ["16mm", "45°", "2.0mm", "Plain End"],
            ["20mm", "90°", "2.0mm", "Bell End"],
            ["20mm", "45°", "2.0mm", "Plain End"],
            ["25mm", "90°", "2.0mm", "Bell End"],
            ["25mm", "45°", "2.0mm", "Plain End"],
            ["32mm", "90°", "2.5mm", "Bell End"],
            ["40mm", "90°", "2.5mm", "Bell End"],
            ["50mm", "90°", "2.5mm", "Bell End"],
            ["63mm", "90°", "2.5mm", "Bell End"],
          ],
        },
      ],
    },
    {
      slug: "couplings",
      images: ["/images/products/placeholder-coupling.svg"],
      highlights: ["NOM Compliant", "Double-Bell Design", "Metric Sizes"],
      specGroups: [
        {
          groupLabel: "Tipo Ligero",
          columns: ["Size", "Type", "Wall Thickness", "End Type"],
          rows: [
            ["16mm", "Standard Coupling", "1.5mm", "Bell End"],
            ["20mm", "Standard Coupling", "1.5mm", "Bell End"],
            ["25mm", "Standard Coupling", "1.5mm", "Bell End"],
            ["32mm", "Standard Coupling", "1.5mm", "Bell End"],
            ["40mm", "Standard Coupling", "1.5mm", "Bell End"],
            ["50mm", "Expansion Coupling", "1.5mm", "Bell End"],
            ["63mm", "Expansion Coupling", "1.5mm", "Bell End"],
          ],
        },
        {
          groupLabel: "Tipo Pesado",
          columns: ["Size", "Type", "Wall Thickness", "End Type"],
          rows: [
            ["16mm", "Standard Coupling", "2.0mm", "Bell End"],
            ["20mm", "Standard Coupling", "2.0mm", "Bell End"],
            ["25mm", "Standard Coupling", "2.0mm", "Bell End"],
            ["32mm", "Standard Coupling", "2.5mm", "Bell End"],
            ["40mm", "Standard Coupling", "2.5mm", "Bell End"],
            ["50mm", "Expansion Coupling", "2.5mm", "Bell End"],
            ["63mm", "Expansion Coupling", "2.5mm", "Bell End"],
          ],
        },
      ],
    },
    {
      slug: "conduit-pipes",
      images: ["/images/products/placeholder-pipe.svg"],
      highlights: ["NOM Compliant", "Standard Lengths", "Metric Sizes"],
      specGroups: [
        {
          groupLabel: "Tipo Ligero",
          columns: ["Size", "Wall Thickness", "Length"],
          rows: [
            ["16mm", "1.5mm", "3 m"],
            ["20mm", "1.5mm", "3 m"],
            ["25mm", "1.5mm", "3 m"],
            ["32mm", "1.5mm", "3 m"],
            ["40mm", "1.5mm", "3 m"],
            ["50mm", "1.5mm", "3 m"],
            ["63mm", "1.5mm", "3 m"],
          ],
        },
        {
          groupLabel: "Tipo Pesado",
          columns: ["Size", "Wall Thickness", "Length"],
          rows: [
            ["16mm", "2.0mm", "3 m"],
            ["20mm", "2.0mm", "3 m"],
            ["25mm", "2.0mm", "3 m"],
            ["32mm", "2.5mm", "3 m"],
            ["40mm", "2.5mm", "3 m"],
            ["50mm", "2.5mm", "3 m"],
            ["63mm", "2.5mm", "3 m"],
          ],
        },
      ],
    },
  ],
} satisfies MarketSpecs;

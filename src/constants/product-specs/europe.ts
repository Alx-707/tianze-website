import type { MarketSpecs } from "@/constants/product-specs/types";

export const EUROPE_SPECS = {
  technical: {
    material: "100% Virgin PVC (UPVC)",
    surface: "Smooth interior, reduces wire pulling friction",
    uvResistance: "UV stabilized for outdoor installations",
    temperatureRange: "-20°C to +60°C",
    lifespan: "30+ years service life",
    fireRating: "Self-extinguishing, flame retardant",
  },

  certifications: ["IEC 61386", "ISO 9001:2015"],

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
      images: ["/images/products/placeholder-sweep.svg"],
      highlights: ["IEC 61386 Certified", "Three Duty Ratings", "Metric Sizes"],
      specGroups: [
        {
          groupLabel: "Light",
          columns: ["Size", "Angle", "Wall Thickness", "End Type"],
          rows: [
            ["16mm", "90°", "1.2mm", "Plain End"],
            ["20mm", "90°", "1.2mm", "Plain End"],
            ["25mm", "90°", "1.2mm", "Plain End"],
            ["32mm", "90°", "1.2mm", "Plain End"],
            ["40mm", "90°", "1.2mm", "Plain End"],
            ["50mm", "90°", "1.2mm", "Plain End"],
            ["63mm", "90°", "1.2mm", "Plain End"],
          ],
        },
        {
          groupLabel: "Medium",
          columns: ["Size", "Angle", "Wall Thickness", "End Type"],
          rows: [
            ["16mm", "90°", "1.5mm", "Plain End"],
            ["20mm", "90°", "1.6mm", "Plain End"],
            ["25mm", "90°", "1.8mm", "Plain End"],
            ["32mm", "90°", "1.8mm", "Plain End"],
            ["40mm", "90°", "2.0mm", "Plain End"],
            ["50mm", "90°", "2.0mm", "Plain End"],
            ["63mm", "90°", "2.0mm", "Plain End"],
          ],
        },
        {
          groupLabel: "Heavy",
          columns: ["Size", "Angle", "Wall Thickness", "End Type"],
          rows: [
            ["16mm", "90°", "2.0mm", "Plain End"],
            ["20mm", "90°", "2.0mm", "Plain End"],
            ["25mm", "90°", "2.2mm", "Plain End"],
            ["32mm", "90°", "2.3mm", "Plain End"],
            ["40mm", "90°", "2.4mm", "Plain End"],
            ["50mm", "90°", "2.5mm", "Plain End"],
            ["63mm", "90°", "2.5mm", "Plain End"],
          ],
        },
      ],
    },
    {
      slug: "couplings",
      images: ["/images/products/placeholder-coupling.svg"],
      highlights: ["IEC 61386 Certified", "Double-Bell Design", "Metric Sizes"],
      specGroups: [
        {
          groupLabel: "Light",
          columns: ["Size", "Type", "Wall Thickness", "End Type"],
          rows: [
            ["16mm", "Standard Coupling", "1.2mm", "Bell End"],
            ["20mm", "Standard Coupling", "1.2mm", "Bell End"],
            ["25mm", "Standard Coupling", "1.2mm", "Bell End"],
            ["32mm", "Standard Coupling", "1.2mm", "Bell End"],
            ["40mm", "Standard Coupling", "1.2mm", "Bell End"],
            ["50mm", "Standard Coupling", "1.2mm", "Bell End"],
            ["63mm", "Standard Coupling", "1.2mm", "Bell End"],
          ],
        },
        {
          groupLabel: "Medium",
          columns: ["Size", "Type", "Wall Thickness", "End Type"],
          rows: [
            ["16mm", "Standard Coupling", "1.5mm", "Bell End"],
            ["20mm", "Standard Coupling", "1.6mm", "Bell End"],
            ["25mm", "Standard Coupling", "1.8mm", "Bell End"],
            ["32mm", "Standard Coupling", "1.8mm", "Bell End"],
            ["40mm", "Standard Coupling", "2.0mm", "Bell End"],
            ["50mm", "Standard Coupling", "2.0mm", "Bell End"],
            ["63mm", "Standard Coupling", "2.0mm", "Bell End"],
          ],
        },
        {
          groupLabel: "Heavy",
          columns: ["Size", "Type", "Wall Thickness", "End Type"],
          rows: [
            ["16mm", "Standard Coupling", "2.0mm", "Bell End"],
            ["20mm", "Standard Coupling", "2.0mm", "Bell End"],
            ["25mm", "Standard Coupling", "2.2mm", "Bell End"],
            ["32mm", "Standard Coupling", "2.3mm", "Bell End"],
            ["40mm", "Standard Coupling", "2.4mm", "Bell End"],
            ["50mm", "Standard Coupling", "2.5mm", "Bell End"],
            ["63mm", "Standard Coupling", "2.5mm", "Bell End"],
          ],
        },
      ],
    },
    {
      slug: "conduit-pipes",
      images: ["/images/products/placeholder-pipe.svg"],
      highlights: ["IEC 61386 Certified", "Standard Lengths", "Metric Sizes"],
      specGroups: [
        {
          groupLabel: "Light",
          columns: ["Size", "Wall Thickness", "Length"],
          rows: [
            ["16mm", "1.2mm", "3m"],
            ["20mm", "1.2mm", "3m"],
            ["25mm", "1.2mm", "3m"],
            ["32mm", "1.2mm", "3m"],
            ["40mm", "1.2mm", "3m"],
            ["50mm", "1.2mm", "3m"],
            ["63mm", "1.2mm", "3m"],
          ],
        },
        {
          groupLabel: "Medium",
          columns: ["Size", "Wall Thickness", "Length"],
          rows: [
            ["16mm", "1.5mm", "3m"],
            ["20mm", "1.6mm", "3m"],
            ["25mm", "1.8mm", "3m"],
            ["32mm", "1.8mm", "3m"],
            ["40mm", "2.0mm", "3m"],
            ["50mm", "2.0mm", "3m"],
            ["63mm", "2.0mm", "3m"],
          ],
        },
        {
          groupLabel: "Heavy",
          columns: ["Size", "Wall Thickness", "Length"],
          rows: [
            ["16mm", "2.0mm", "3m"],
            ["20mm", "2.0mm", "3m"],
            ["25mm", "2.2mm", "3m"],
            ["32mm", "2.3mm", "3m"],
            ["40mm", "2.4mm", "3m"],
            ["50mm", "2.5mm", "3m"],
            ["63mm", "2.5mm", "3m"],
          ],
        },
      ],
    },
  ],
} satisfies MarketSpecs;

import type { MarketSpecs } from "@/constants/product-specs/types";

export const AUSTRALIA_NZ_SPECS = {
  technical: {
    material: "100% Virgin PVC (UPVC)",
    surface: "Smooth interior, reduces wire pulling friction",
    uvResistance: "UV stabilized for outdoor installations",
    temperatureRange: "-15°C to +60°C",
    lifespan: "30+ years service life",
    fireRating: "Self-extinguishing, flame retardant",
    standard: "AS/NZS 2053",
  },

  certifications: ["AS/NZS 2053", "ISO 9001:2015"],

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
      highlights: [
        "AS/NZS 2053 Certified",
        "Medium & Heavy Duty",
        "45°/90°/Custom Angles",
      ],
      specGroups: [
        {
          groupLabel: "Medium Duty",
          columns: ["Size", "Angle", "Wall Thickness", "End Type", "Radius"],
          rows: [
            ["16mm", "90°", "1.5mm", "Bell End", "4D"],
            ["16mm", "45°", "1.5mm", "Plain End", "4D"],
            ["20mm", "90°", "1.5mm", "Bell End", "4D"],
            ["20mm", "45°", "1.5mm", "Plain End", "4D"],
            ["25mm", "90°", "1.6mm", "Bell End", "4D"],
            ["25mm", "45°", "1.6mm", "Plain End", "4D"],
            ["32mm", "90°", "1.8mm", "Bell End", "4D"],
            ["40mm", "90°", "1.9mm", "Bell End", "4D"],
            ["50mm", "90°", "2.0mm", "Bell End", "4D"],
            ["63mm", "90°", "2.0mm", "Bell End", "4D"],
          ],
        },
        {
          groupLabel: "Heavy Duty",
          columns: ["Size", "Angle", "Wall Thickness", "End Type", "Radius"],
          rows: [
            ["16mm", "90°", "2.0mm", "Bell End", "4D"],
            ["16mm", "45°", "2.0mm", "Plain End", "4D"],
            ["20mm", "90°", "2.0mm", "Bell End", "4D"],
            ["20mm", "45°", "2.0mm", "Plain End", "4D"],
            ["25mm", "90°", "2.0mm", "Bell End", "4D"],
            ["25mm", "45°", "2.0mm", "Plain End", "4D"],
            ["32mm", "90°", "2.5mm", "Bell End", "4D"],
            ["40mm", "90°", "2.5mm", "Bell End", "4D"],
            ["50mm", "90°", "3.0mm", "Bell End", "4D"],
            ["63mm", "90°", "3.0mm", "Bell End", "4D"],
          ],
        },
      ],
    },
    {
      slug: "bellmouths",
      images: ["/images/products/sample-product.svg"],
      highlights: [
        "Flared Entry Protection",
        "AS/NZS 2053 Compliant",
        "Cable Insulation Safety",
      ],
      specGroups: [
        {
          groupLabel: "Medium Duty",
          columns: ["Size", "Type", "End Type"],
          rows: [
            ["16mm", "Standard Bellmouth", "Plain End"],
            ["20mm", "Standard Bellmouth", "Plain End"],
            ["25mm", "Standard Bellmouth", "Plain End"],
            ["32mm", "Standard Bellmouth", "Plain End"],
            ["40mm", "Standard Bellmouth", "Plain End"],
            ["50mm", "Standard Bellmouth", "Plain End"],
            ["63mm", "Standard Bellmouth", "Plain End"],
          ],
        },
        {
          groupLabel: "Heavy Duty",
          columns: ["Size", "Type", "End Type"],
          rows: [
            ["16mm", "Heavy Duty Bellmouth", "Plain End"],
            ["20mm", "Heavy Duty Bellmouth", "Plain End"],
            ["25mm", "Heavy Duty Bellmouth", "Plain End"],
            ["32mm", "Heavy Duty Bellmouth", "Plain End"],
            ["40mm", "Heavy Duty Bellmouth", "Plain End"],
            ["50mm", "Heavy Duty Bellmouth", "Plain End"],
            ["63mm", "Heavy Duty Bellmouth", "Plain End"],
          ],
        },
      ],
    },
    {
      slug: "couplings",
      images: ["/images/products/sample-product.svg"],
      highlights: [
        "Double-Bell Design",
        "AS/NZS 2053 Compliant",
        "Medium & Heavy Duty",
      ],
      specGroups: [
        {
          groupLabel: "Medium Duty",
          columns: ["Size", "Type", "Wall Thickness", "End Type"],
          rows: [
            ["16mm", "Standard Coupling", "1.5mm", "Bell End"],
            ["20mm", "Standard Coupling", "1.5mm", "Bell End"],
            ["25mm", "Standard Coupling", "1.6mm", "Bell End"],
            ["32mm", "Standard Coupling", "1.8mm", "Bell End"],
            ["40mm", "Standard Coupling", "1.9mm", "Bell End"],
            ["50mm", "Expansion Coupling", "2.0mm", "Bell End"],
            ["63mm", "Expansion Coupling", "2.0mm", "Bell End"],
          ],
        },
        {
          groupLabel: "Heavy Duty",
          columns: ["Size", "Type", "Wall Thickness", "End Type"],
          rows: [
            ["16mm", "Standard Coupling", "2.0mm", "Bell End"],
            ["20mm", "Standard Coupling", "2.0mm", "Bell End"],
            ["25mm", "Standard Coupling", "2.0mm", "Bell End"],
            ["32mm", "Standard Coupling", "2.5mm", "Bell End"],
            ["40mm", "Standard Coupling", "2.5mm", "Bell End"],
            ["50mm", "Expansion Coupling", "3.0mm", "Bell End"],
            ["63mm", "Expansion Coupling", "3.0mm", "Bell End"],
          ],
        },
      ],
    },
    {
      slug: "conduit-pipes",
      images: ["/images/products/sample-product.svg"],
      highlights: [
        "Medium & Heavy Duty",
        "Standard Metric Lengths",
        "Straight Conduit Runs",
      ],
      specGroups: [
        {
          groupLabel: "Medium Duty",
          columns: ["Size", "Wall Thickness", "Length", "Duty"],
          rows: [
            ["16mm", "1.5mm", "4 m", "Medium Duty"],
            ["20mm", "1.5mm", "4 m", "Medium Duty"],
            ["25mm", "1.6mm", "4 m", "Medium Duty"],
            ["32mm", "1.8mm", "4 m", "Medium Duty"],
            ["40mm", "1.9mm", "4 m", "Medium Duty"],
            ["50mm", "2.0mm", "4 m", "Medium Duty"],
            ["63mm", "2.0mm", "4 m", "Medium Duty"],
          ],
        },
        {
          groupLabel: "Heavy Duty",
          columns: ["Size", "Wall Thickness", "Length", "Duty"],
          rows: [
            ["16mm", "2.0mm", "4 m", "Heavy Duty"],
            ["20mm", "2.0mm", "4 m", "Heavy Duty"],
            ["25mm", "2.0mm", "4 m", "Heavy Duty"],
            ["32mm", "2.5mm", "4 m", "Heavy Duty"],
            ["40mm", "2.5mm", "4 m", "Heavy Duty"],
            ["50mm", "3.0mm", "4 m", "Heavy Duty"],
            ["63mm", "3.0mm", "4 m", "Heavy Duty"],
          ],
        },
      ],
    },
  ],
} satisfies MarketSpecs;

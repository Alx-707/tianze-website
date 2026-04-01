import type { MarketSpecs } from "@/constants/product-specs/types";

export const NORTH_AMERICA_SPECS = {
  technical: {
    material: "100% Virgin PVC (UPVC)",
    surface: "Smooth interior, reduces wire pulling friction",
    uvResistance: "UV stabilized for outdoor installations",
    temperatureRange: "-20°C to +60°C",
    lifespan: "30+ years service life",
    fireRating: "Self-extinguishing, flame retardant",
  },

  certifications: ["UL 651", "ASTM D1785", "ISO 9001:2015"],

  trade: {
    moq: "500 pcs",
    leadTime: "15-20 days",
    supplyCapacity: "50,000+ pcs/month",
    packaging: "Carton + Pallet (export standard)",
    portOfLoading: "Lianyungang, China",
  },

  families: [
    {
      slug: "conduit-sweeps-elbows",
      images: ["/images/products/pvc-conduit-bend.svg"],
      highlights: [
        "UL 651 Certified",
        "100% Virgin PVC",
        "45°/90°/Custom Angles",
      ],
      specGroups: [
        {
          groupLabel: "Schedule 40",
          columns: ["Size", "Angle", "Wall Thickness", "End Type", "Radius"],
          rows: [
            ['1/2"', "90°", '0.060"', "Bell End", "5D"],
            ['1/2"', "45°", '0.060"', "Plain End", "5D"],
            ['3/4"', "90°", '0.060"', "Bell End", "5D"],
            ['3/4"', "45°", '0.060"', "Plain End", "5D"],
            ['1"', "90°", '0.060"', "Bell End", "5D"],
            ['1"', "45°", '0.060"', "Plain End", "5D"],
            ['1-1/4"', "90°", '0.060"', "Bell End", "5D"],
            ['1-1/2"', "90°", '0.065"', "Bell End", "5D"],
            ['2"', "90°", '0.065"', "Bell End", "5D"],
            ['2-1/2"', "90°", '0.073"', "Bell End", "5D"],
            ['3"', "90°", '0.073"', "Bell End", "5D"],
            ['4"', "90°", '0.095"', "Bell End", "5D"],
          ],
        },
        {
          groupLabel: "Schedule 80",
          columns: ["Size", "Angle", "Wall Thickness", "End Type", "Radius"],
          rows: [
            ['1/2"', "90°", '0.084"', "Bell End", "5D"],
            ['1/2"', "45°", '0.084"', "Plain End", "5D"],
            ['3/4"', "90°", '0.084"', "Bell End", "5D"],
            ['3/4"', "45°", '0.084"', "Plain End", "5D"],
            ['1"', "90°", '0.084"', "Bell End", "5D"],
            ['1"', "45°", '0.084"', "Plain End", "5D"],
            ['1-1/4"', "90°", '0.109"', "Bell End", "5D"],
            ['1-1/2"', "90°", '0.109"', "Bell End", "5D"],
            ['2"', "90°", '0.109"', "Bell End", "5D"],
            ['2-1/2"', "90°", '0.120"', "Bell End", "5D"],
            ['3"', "90°", '0.120"', "Bell End", "5D"],
            ['4"', "90°", '0.150"', "Bell End", "5D"],
          ],
        },
      ],
    },
    {
      slug: "couplings",
      images: ["/images/products/sample-product.svg"],
      highlights: [
        "Double-Bell Design",
        "Secure Conduit Joints",
        "Multi-Size Range",
      ],
      specGroups: [
        {
          groupLabel: "Schedule 40",
          columns: ["Size", "Type", "Wall Thickness", "End Type"],
          rows: [
            ['1/2"', "Standard Coupling", '0.060"', "Bell End"],
            ['3/4"', "Standard Coupling", '0.060"', "Bell End"],
            ['1"', "Standard Coupling", '0.060"', "Bell End"],
            ['1-1/4"', "Standard Coupling", '0.060"', "Bell End"],
            ['1-1/2"', "Standard Coupling", '0.065"', "Bell End"],
            ['2"', "Standard Coupling", '0.065"', "Bell End"],
            ['2-1/2"', "Expansion Coupling", '0.073"', "Bell End"],
            ['3"', "Expansion Coupling", '0.073"', "Bell End"],
            ['4"', "Expansion Coupling", '0.095"', "Bell End"],
          ],
        },
        {
          groupLabel: "Schedule 80",
          columns: ["Size", "Type", "Wall Thickness", "End Type"],
          rows: [
            ['1/2"', "Standard Coupling", '0.084"', "Bell End"],
            ['3/4"', "Standard Coupling", '0.084"', "Bell End"],
            ['1"', "Standard Coupling", '0.084"', "Bell End"],
            ['1-1/4"', "Standard Coupling", '0.109"', "Bell End"],
            ['1-1/2"', "Standard Coupling", '0.109"', "Bell End"],
            ['2"', "Standard Coupling", '0.109"', "Bell End"],
            ['2-1/2"', "Expansion Coupling", '0.120"', "Bell End"],
            ['3"', "Expansion Coupling", '0.120"', "Bell End"],
            ['4"', "Expansion Coupling", '0.150"', "Bell End"],
          ],
        },
      ],
    },
    {
      slug: "conduit-pipes",
      images: ["/images/products/sample-product.svg"],
      highlights: [
        "Schedule 40 & 80",
        "Standard Lengths",
        "Straight Conduit Runs",
      ],
      specGroups: [
        {
          groupLabel: "Schedule 40",
          columns: ["Size", "Wall Thickness", "Length", "Schedule"],
          rows: [
            ['1/2"', '0.060"', "10 ft", "Schedule 40"],
            ['3/4"', '0.060"', "10 ft", "Schedule 40"],
            ['1"', '0.060"', "10 ft", "Schedule 40"],
            ['1-1/4"', '0.060"', "10 ft", "Schedule 40"],
            ['1-1/2"', '0.065"', "10 ft", "Schedule 40"],
            ['2"', '0.065"', "10 ft", "Schedule 40"],
            ['2-1/2"', '0.073"', "10 ft", "Schedule 40"],
            ['3"', '0.073"', "10 ft", "Schedule 40"],
            ['4"', '0.095"', "10 ft", "Schedule 40"],
          ],
        },
        {
          groupLabel: "Schedule 80",
          columns: ["Size", "Wall Thickness", "Length", "Schedule"],
          rows: [
            ['1/2"', '0.084"', "10 ft", "Schedule 80"],
            ['3/4"', '0.084"', "10 ft", "Schedule 80"],
            ['1"', '0.084"', "10 ft", "Schedule 80"],
            ['1-1/4"', '0.109"', "10 ft", "Schedule 80"],
            ['1-1/2"', '0.109"', "10 ft", "Schedule 80"],
            ['2"', '0.109"', "10 ft", "Schedule 80"],
            ['2-1/2"', '0.120"', "10 ft", "Schedule 80"],
            ['3"', '0.120"', "10 ft", "Schedule 80"],
            ['4"', '0.150"', "10 ft", "Schedule 80"],
          ],
        },
      ],
    },
  ],
} satisfies MarketSpecs;

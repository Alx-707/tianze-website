import type { MarketSpecs } from "@/constants/product-specs/types";

export const PNEUMATIC_SPECS = {
  technical: {
    material: "PETG (Food-grade available)",
    transparency: "Crystal clear for visual monitoring",
    maxWorkingPressure: "0.5 MPa",
    temperatureRange: "-20°C to +60°C",
    surface: "Smooth interior for silent carrier transport",
    impactResistance: "High impact resistance for carrier collisions",
  },

  certifications: ["ISO 9001:2015"],

  trade: {
    moq: "100 meters",
    leadTime: "20-30 days",
    supplyCapacity: "10,000+ meters/month",
    packaging: "Individual wrapping + Wooden crate",
    portOfLoading: "Lianyungang, China",
  },

  families: [
    {
      slug: "petg-tubes",
      images: ["/images/products/placeholder-petg-tube.svg"],
      highlights: [
        "Crystal Clear PETG",
        "Silent Operation",
        "Leak-Proof Joints",
      ],
      specGroups: [
        {
          groupLabel: "110mm OD",
          columns: [
            "Outer Diameter",
            "Wall Thickness",
            "Length",
            "Bend Radius",
          ],
          rows: [
            ["110mm", "2.3mm", "3m", "R650"],
            ["110mm", "2.3mm", "6m", "R650"],
            ["110mm", "2.3mm", "Custom", "R650"],
            ["110mm", "2.3mm", "3m", "R800"],
            ["110mm", "2.3mm", "6m", "R800"],
            ["110mm", "2.3mm", "Custom", "R800"],
          ],
        },
        {
          groupLabel: "160mm OD",
          columns: [
            "Outer Diameter",
            "Wall Thickness",
            "Length",
            "Bend Radius",
          ],
          rows: [
            ["160mm", "3.0mm", "3m", "R800"],
            ["160mm", "3.0mm", "6m", "R800"],
            ["160mm", "3.0mm", "Custom", "R800"],
            ["160mm", "3.0mm", "3m", "R1000"],
            ["160mm", "3.0mm", "6m", "R1000"],
            ["160mm", "3.0mm", "Custom", "R1000"],
          ],
        },
      ],
    },
    {
      slug: "fittings",
      images: ["/images/products/placeholder-fitting.svg"],
      highlights: [
        "Impact Resistant",
        "Hospital Grade",
        "Multiple Connection Types",
      ],
      specGroups: [
        {
          groupLabel: "110mm Fittings",
          columns: ["Type", "Size", "Connection", "Material"],
          rows: [
            ["Connector", "110mm", "Push-fit", "PETG"],
            ["90° Bend", "110mm", "Push-fit", "PETG"],
            ["45° Bend", "110mm", "Push-fit", "PETG"],
            ["Y-Diverter", "110mm", "Push-fit", "PETG"],
            ["Access Panel", "110mm", "Flange", "PETG"],
          ],
        },
        {
          groupLabel: "160mm Fittings",
          columns: ["Type", "Size", "Connection", "Material"],
          rows: [
            ["Connector", "160mm", "Push-fit", "PETG"],
            ["90° Bend", "160mm", "Push-fit", "PETG"],
            ["45° Bend", "160mm", "Push-fit", "PETG"],
            ["Y-Diverter", "160mm", "Push-fit", "PETG"],
            ["Access Panel", "160mm", "Flange", "PETG"],
          ],
        },
      ],
    },
  ],
} satisfies MarketSpecs;

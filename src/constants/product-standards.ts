export const PRODUCT_STANDARDS = {
  ul651_sch40: {
    label: "UL 651 SCH 40",
  },
  ul651_sch80: {
    label: "UL 651 SCH 80",
  },
  astm: {
    label: "ASTM",
  },
  as_nzs: {
    label: "AS/NZS",
  },
  gb: {
    label: "GB",
  },
} as const satisfies Record<string, { label: string }>;

export type ProductStandardId = keyof typeof PRODUCT_STANDARDS;

export const PRODUCT_STANDARD_IDS = Object.keys(
  PRODUCT_STANDARDS,
) as readonly ProductStandardId[];

import type { ProductStandardId } from "@/constants/product-standards";

export function buildProductsFilterHref({
  pathname,
  category,
  standards,
}: {
  pathname: string;
  category?: string;
  standards?: readonly ProductStandardId[];
}): string {
  const params = new URLSearchParams();

  if (category !== undefined && category.trim() !== "") {
    params.set("category", category);
  }

  if (standards !== undefined) {
    for (const standard of standards) {
      params.append("standard", standard);
    }
  }

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

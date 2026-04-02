import { describe, expect, it } from "vitest";
import {
  getAllMarketSlugs,
  getFamiliesForMarket,
  getMarketBySlug,
  PRODUCT_CATALOG,
} from "@/constants/product-catalog";
import { currentSite } from "@/sites";

describe("product-catalog wrapper", () => {
  it("uses the active site catalog as runtime truth", () => {
    expect(PRODUCT_CATALOG).toBe(currentSite.productCatalog);
  });

  it("keeps market lookups aligned with the current site catalog", () => {
    expect(getMarketBySlug("north-america")?.standardLabel).toBe(
      "UL 651 / ASTM D1785",
    );
    expect(getAllMarketSlugs()).toContain("pneumatic-tube-systems");
    expect(
      getFamiliesForMarket("north-america").map((family) => family.slug),
    ).toContain("conduit-sweeps-elbows");
  });
});

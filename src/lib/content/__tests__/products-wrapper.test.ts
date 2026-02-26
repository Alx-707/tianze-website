/**
 * Tests for products.ts cached wrapper functions.
 *
 * Validates the await migration: each cached function must properly
 * await its underlying products-source call.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  Locale,
  ProductDetail,
} from "@/types/content.types";

// Use vi.hoisted to ensure mocks are set up before the module under test is imported.
const {
  mockGetProductListing,
  mockGetProductDetail,
  mockGetProductCategories,
  mockGetProductStandards,
  mockGetFeaturedProducts,
} = vi.hoisted(() => ({
  mockGetProductListing: vi.fn(),
  mockGetProductDetail: vi.fn(),
  mockGetProductCategories: vi.fn(),
  mockGetProductStandards: vi.fn(),
  mockGetFeaturedProducts: vi.fn(),
}));

vi.mock("@/lib/content/products-source", () => ({
  getProductListing: mockGetProductListing,
  getProductDetail: mockGetProductDetail,
  getProductCategories: mockGetProductCategories,
  getProductStandards: mockGetProductStandards,
  getFeaturedProducts: mockGetFeaturedProducts,
}));

vi.mock("@/lib/cache/cache-tags", () => ({
  productTags: {
    list: vi.fn(() => "product:list"),
    detail: vi.fn(() => "product:detail"),
    categories: vi.fn(() => "product:categories"),
    standards: vi.fn(() => "product:standards"),
    featured: vi.fn(() => "product:featured"),
  },
}));

// Import after mocks
import {
  getAllProductsCached,
  getProductBySlugCached,
  getProductCategoriesCached,
  getProductStandardsCached,
  getFeaturedProductsCached,
} from "@/lib/content/products";

function createProduct(
  locale: Locale,
  overrides: Partial<ProductDetail> = {},
): ProductDetail {
  return {
    slug: "test-product",
    locale,
    title: "Test Product",
    coverImage: "/images/test.png",
    category: "conduit",
    publishedAt: "2024-01-01",
    content: "# Test Content",
    filePath: `/mock/content/products/${locale}/test-product.mdx`,
    ...overrides,
  };
}

describe("products cached wrappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllProductsCached", () => {
    it("should await getProductListing and return mapped summaries", async () => {
      const locale: Locale = "en";
      const products = [
        createProduct(locale, { slug: "product-1", title: "Product 1" }),
        createProduct(locale, { slug: "product-2", title: "Product 2" }),
      ];

      mockGetProductListing.mockResolvedValue(products);

      const result = await getAllProductsCached(locale);

      expect(mockGetProductListing).toHaveBeenCalledTimes(1);
      expect(mockGetProductListing).toHaveBeenCalledWith(locale, undefined);
      expect(result).toHaveLength(2);
      expect(result[0]!.slug).toBe("product-1");
      expect(result[1]!.slug).toBe("product-2");
    });

    it("should return empty array when no products", async () => {
      mockGetProductListing.mockResolvedValue([]);

      const result = await getAllProductsCached("en");

      expect(result).toEqual([]);
    });
  });

  describe("getProductBySlugCached", () => {
    it("should await getProductDetail and return product", async () => {
      const locale: Locale = "en";
      const slug = "test-product";
      const product = createProduct(locale, { slug });

      mockGetProductDetail.mockResolvedValue(product);

      const result = await getProductBySlugCached(locale, slug);

      expect(mockGetProductDetail).toHaveBeenCalledTimes(1);
      expect(mockGetProductDetail).toHaveBeenCalledWith(locale, slug);
      expect(result.slug).toBe(slug);
    });
  });

  describe("getProductCategoriesCached", () => {
    it("should await getProductCategories and return categories", async () => {
      const locale: Locale = "en";
      const categories = ["conduit", "fittings"];

      mockGetProductCategories.mockResolvedValue(categories);

      const result = await getProductCategoriesCached(locale);

      expect(mockGetProductCategories).toHaveBeenCalledTimes(1);
      expect(mockGetProductCategories).toHaveBeenCalledWith(locale);
      expect(result).toEqual(categories);
    });
  });

  describe("getProductStandardsCached", () => {
    it("should await getProductStandards and return standards", async () => {
      const locale: Locale = "en";
      const standards = ["iec-61386", "as-nzs-2053"];

      mockGetProductStandards.mockResolvedValue(standards);

      const result = await getProductStandardsCached(locale);

      expect(mockGetProductStandards).toHaveBeenCalledTimes(1);
      expect(mockGetProductStandards).toHaveBeenCalledWith(locale);
      expect(result).toEqual(standards);
    });
  });

  describe("getFeaturedProductsCached", () => {
    it("should await getFeaturedProducts and return mapped summaries", async () => {
      const locale: Locale = "en";
      const products = [
        createProduct(locale, {
          slug: "featured-1",
          title: "Featured Product",
          featured: true,
        }),
      ];

      mockGetFeaturedProducts.mockResolvedValue(products);

      const result = await getFeaturedProductsCached(locale, 5);

      expect(mockGetFeaturedProducts).toHaveBeenCalledTimes(1);
      expect(mockGetFeaturedProducts).toHaveBeenCalledWith(locale, 5);
      expect(result).toHaveLength(1);
      expect(result[0]!.slug).toBe("featured-1");
    });
  });
});

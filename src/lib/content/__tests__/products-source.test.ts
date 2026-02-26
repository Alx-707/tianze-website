/**
 * Tests for products-source.ts async content query functions.
 *
 * Validates the async fs.promises migration: directory access,
 * file listing, product parsing, filtering, and error paths.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Locale, Product, ProductMetadata } from "@/types/content.types";

// Mock fs before importing module under test
vi.mock("fs", () => ({
  default: {
    promises: {
      access: vi.fn(),
      readdir: vi.fn(),
    },
  },
}));

vi.mock("@/lib/content-parser", () => ({
  parseContentFile: vi.fn(),
}));

vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "zh"] as readonly string[] },
}));

vi.mock("@/lib/content-utils", () => ({
  PRODUCTS_DIR: "/mock/content/products",
}));

const STUB_METADATA: ProductMetadata = {
  title: "Test Product",
  slug: "test-product",
  coverImage: "/images/test.jpg",
  category: "conduit-fittings",
  publishedAt: "2026-01-01",
};

function makeProduct(
  overrides: Partial<ProductMetadata> = {},
): Product {
  return {
    metadata: { ...STUB_METADATA, ...overrides },
    content: "# Product",
    filePath: "/mock/content/products/en/test-product.mdx",
    slug: overrides.slug ?? STUB_METADATA.slug ?? "test-product",
  };
}

describe("products-source", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  async function loadMocks() {
    const fs = await import("fs");
    const { parseContentFile } = await import("@/lib/content-parser");
    return {
      mockAccess: vi.mocked(fs.default.promises.access),
      mockReaddir: vi.mocked(fs.default.promises.readdir),
      mockParse: vi.mocked(parseContentFile),
    };
  }

  async function loadModule() {
    return import("@/lib/content/products-source");
  }

  describe("getProductListing", () => {
    it("returns empty list when locale directory does not exist", async () => {
      const { mockAccess } = await loadMocks();
      mockAccess.mockRejectedValue(new Error("ENOENT"));

      const { getProductListing } = await loadModule();
      const result = await getProductListing("en" as Locale);

      expect(result).toEqual([]);
    });

    it("returns mapped product details for available products", async () => {
      const { mockAccess, mockReaddir, mockParse } = await loadMocks();
      mockAccess.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue(["test-product.mdx"] as unknown as Awaited<
        ReturnType<typeof import("fs").promises.readdir>
      >);
      mockParse.mockResolvedValue(makeProduct());

      const { getProductListing } = await loadModule();
      const result = await getProductListing("en" as Locale);

      expect(result).toHaveLength(1);
      expect(result[0]!.slug).toBe("test-product");
      expect(result[0]!.title).toBe("Test Product");
    });

    it("filters products by category when specified", async () => {
      const { mockAccess, mockReaddir, mockParse } = await loadMocks();
      mockAccess.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue([
        "product-a.mdx",
        "product-b.mdx",
      ] as unknown as Awaited<
        ReturnType<typeof import("fs").promises.readdir>
      >);
      mockParse
        .mockResolvedValueOnce(
          makeProduct({ slug: "a", category: "pipes" }),
        )
        .mockResolvedValueOnce(
          makeProduct({ slug: "b", category: "fittings" }),
        );

      const { getProductListing } = await loadModule();
      const result = await getProductListing("en" as Locale, "fittings");

      expect(result).toHaveLength(1);
      expect(result[0]!.slug).toBe("b");
    });
  });

  describe("getProductDetail", () => {
    it("returns product detail for matching slug", async () => {
      const { mockAccess, mockReaddir, mockParse } = await loadMocks();
      mockAccess.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue(["test-product.mdx"] as unknown as Awaited<
        ReturnType<typeof import("fs").promises.readdir>
      >);
      mockParse.mockResolvedValue(makeProduct());

      const { getProductDetail } = await loadModule();
      const result = await getProductDetail("en" as Locale, "test-product");

      expect(result.slug).toBe("test-product");
      expect(result.locale).toBe("en");
    });

    it("throws on invalid locale", async () => {
      await loadMocks();

      const { getProductDetail } = await loadModule();
      await expect(
        getProductDetail("xx" as Locale, "any-slug"),
      ).rejects.toThrow("Invalid locale");
    });

    it("throws when product slug is not found", async () => {
      const { mockAccess, mockReaddir } = await loadMocks();
      mockAccess.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue(["other.mdx"] as unknown as Awaited<
        ReturnType<typeof import("fs").promises.readdir>
      >);

      const { getProductDetail } = await loadModule();
      await expect(
        getProductDetail("en" as Locale, "missing"),
      ).rejects.toThrow("Product not found");
    });
  });

  describe("getProductCategories", () => {
    it("returns sorted unique categories", async () => {
      const { mockAccess, mockReaddir, mockParse } = await loadMocks();
      mockAccess.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue([
        "a.mdx",
        "b.mdx",
        "c.mdx",
      ] as unknown as Awaited<
        ReturnType<typeof import("fs").promises.readdir>
      >);
      mockParse
        .mockResolvedValueOnce(makeProduct({ category: "pipes" }))
        .mockResolvedValueOnce(makeProduct({ category: "fittings" }))
        .mockResolvedValueOnce(makeProduct({ category: "pipes" }));

      const { getProductCategories } = await loadModule();
      const result = await getProductCategories("en" as Locale);

      expect(result).toEqual(["fittings", "pipes"]);
    });
  });

  describe("getProductStandards", () => {
    it("returns sorted unique standards across products", async () => {
      const { mockAccess, mockReaddir, mockParse } = await loadMocks();
      mockAccess.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue([
        "a.mdx",
        "b.mdx",
      ] as unknown as Awaited<
        ReturnType<typeof import("fs").promises.readdir>
      >);
      // Use type assertion for standards which expects ProductStandardId
      mockParse
        .mockResolvedValueOnce(
          makeProduct({
            standards: ["AS/NZS 2053" as never, "IEC 61386" as never],
          }),
        )
        .mockResolvedValueOnce(
          makeProduct({
            standards: ["IEC 61386" as never, "UL 651" as never],
          }),
        );

      const { getProductStandards } = await loadModule();
      const result = await getProductStandards("en" as Locale);

      expect(result).toHaveLength(3);
      expect(result).toEqual(
        expect.arrayContaining(["AS/NZS 2053", "IEC 61386", "UL 651"]),
      );
    });

    it("handles products without standards", async () => {
      const { mockAccess, mockReaddir, mockParse } = await loadMocks();
      mockAccess.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue(["a.mdx"] as unknown as Awaited<
        ReturnType<typeof import("fs").promises.readdir>
      >);
      mockParse.mockResolvedValue(makeProduct());

      const { getProductStandards } = await loadModule();
      const result = await getProductStandards("en" as Locale);

      expect(result).toEqual([]);
    });
  });

  describe("getFeaturedProducts", () => {
    it("returns only featured products", async () => {
      const { mockAccess, mockReaddir, mockParse } = await loadMocks();
      mockAccess.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue([
        "a.mdx",
        "b.mdx",
      ] as unknown as Awaited<
        ReturnType<typeof import("fs").promises.readdir>
      >);
      mockParse
        .mockResolvedValueOnce(
          makeProduct({ slug: "featured-one", featured: true }),
        )
        .mockResolvedValueOnce(
          makeProduct({ slug: "regular", featured: false }),
        );

      const { getFeaturedProducts } = await loadModule();
      const result = await getFeaturedProducts("en" as Locale);

      expect(result).toHaveLength(1);
      expect(result[0]!.slug).toBe("featured-one");
    });

    it("respects limit parameter", async () => {
      const { mockAccess, mockReaddir, mockParse } = await loadMocks();
      mockAccess.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue([
        "a.mdx",
        "b.mdx",
        "c.mdx",
      ] as unknown as Awaited<
        ReturnType<typeof import("fs").promises.readdir>
      >);
      mockParse
        .mockResolvedValueOnce(
          makeProduct({ slug: "f1", featured: true }),
        )
        .mockResolvedValueOnce(
          makeProduct({ slug: "f2", featured: true }),
        )
        .mockResolvedValueOnce(
          makeProduct({ slug: "f3", featured: true }),
        );

      const { getFeaturedProducts } = await loadModule();
      const result = await getFeaturedProducts("en" as Locale, 2);

      expect(result).toHaveLength(2);
    });
  });
});

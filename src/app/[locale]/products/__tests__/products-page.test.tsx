import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductsPage from "../page";

// Mock sub-components
vi.mock("@/components/products/market-series-card", () => ({
  MarketSeriesCard: ({
    market,
    familyCount,
  }: {
    market: { slug: string; label: string };
    familyCount: number;
  }) => (
    <div data-testid={`market-card-${market.slug}`}>
      {market.label} ({familyCount})
    </div>
  ),
}));

vi.mock("@/components/products/catalog-breadcrumb", () => ({
  CatalogBreadcrumb: () => <nav data-testid="breadcrumb">Products</nav>,
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    className,
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    className?: string;
  }) => (
    // img is acceptable in a test stub — next/image is not available in vitest jsdom
    <img src={src} alt={alt} className={className} />
  ),
}));

vi.mock("@/app/[locale]/generate-static-params", () => ({
  generateLocaleStaticParams: () => [{ locale: "en" }, { locale: "zh" }],
}));

// Render helper for async Server Components
async function renderAsyncComponent(
  component: Promise<React.JSX.Element> | React.JSX.Element,
) {
  const resolved = await Promise.resolve(component);
  return render(resolved);
}

describe("Feature: Product Overview Page", () => {
  const mockParams = { locale: "en" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Scenario 2.1: Buyer sees PVC fittings by market standard", () => {
    it("renders a 'By Market Standard' section heading", async () => {
      await renderAsyncComponent(
        ProductsPage({ params: Promise.resolve(mockParams) }),
      );

      // getTranslations returns key as value — "overview.byStandard"
      expect(screen.getByText("overview.byStandard")).toBeInTheDocument();
    });

    it("renders market cards for all four PVC markets", async () => {
      await renderAsyncComponent(
        ProductsPage({ params: Promise.resolve(mockParams) }),
      );

      expect(
        screen.getByTestId("market-card-north-america"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("market-card-australia-new-zealand"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("market-card-mexico")).toBeInTheDocument();
      expect(screen.getByTestId("market-card-europe")).toBeInTheDocument();
    });

    it("does NOT render pneumatic-tube-systems in the PVC section", async () => {
      await renderAsyncComponent(
        ProductsPage({ params: Promise.resolve(mockParams) }),
      );

      // The PVC section must have exactly 4 cards (no pneumatic-tube-systems)
      const pvcSection = screen
        .getByText("overview.byStandard")
        .closest("section");
      const pvcCards = pvcSection?.querySelectorAll(
        "[data-testid^='market-card-']",
      );
      expect(pvcCards?.length).toBe(4);
    });
  });

  describe("Scenario 2.2: Buyer sees specialty and equipment products", () => {
    it("renders a 'Specialty & Equipment' section heading", async () => {
      await renderAsyncComponent(
        ProductsPage({ params: Promise.resolve(mockParams) }),
      );

      expect(screen.getByText("overview.specialty")).toBeInTheDocument();
    });

    it("renders the PETG pneumatic tubes market card in the specialty section", async () => {
      await renderAsyncComponent(
        ProductsPage({ params: Promise.resolve(mockParams) }),
      );

      expect(
        screen.getByTestId("market-card-pneumatic-tube-systems"),
      ).toBeInTheDocument();
    });

    it("equipment card links to /contact", async () => {
      await renderAsyncComponent(
        ProductsPage({ params: Promise.resolve(mockParams) }),
      );

      // The equipment card is an <a> wrapping the equipment title
      const equipmentHeading = screen.getByText("overview.equipmentTitle");
      const link = equipmentHeading.closest("a");
      expect(link).not.toBeNull();
      expect(link).toHaveAttribute("href", "/contact");
    });
  });

  describe("Scenario 2.3: Breadcrumb shows root level (no market)", () => {
    it("renders breadcrumb without a market argument", async () => {
      await renderAsyncComponent(
        ProductsPage({ params: Promise.resolve(mockParams) }),
      );

      // The mocked CatalogBreadcrumb renders with data-testid="breadcrumb"
      const breadcrumb = screen.getByTestId("breadcrumb");
      expect(breadcrumb).toBeInTheDocument();
      expect(breadcrumb).toHaveTextContent("Products");
    });
  });

  describe("Scenario 2.4: Page header", () => {
    it("renders the h1 page title", async () => {
      await renderAsyncComponent(
        ProductsPage({ params: Promise.resolve(mockParams) }),
      );

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("overview.title");
    });

    it("renders the page description", async () => {
      await renderAsyncComponent(
        ProductsPage({ params: Promise.resolve(mockParams) }),
      );

      expect(screen.getByText("overview.description")).toBeInTheDocument();
    });
  });

  describe("Scenario 2.5: Async Server Component contract", () => {
    it("is an async server component (returns a Promise)", () => {
      const result = ProductsPage({ params: Promise.resolve(mockParams) });
      expect(result).toBeInstanceOf(Promise);
    });

    it("handles zh locale", async () => {
      await renderAsyncComponent(
        ProductsPage({ params: Promise.resolve({ locale: "zh" }) }),
      );

      expect(screen.getByRole("main")).toBeInTheDocument();
    });
  });
});

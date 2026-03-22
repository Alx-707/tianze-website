import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock next-intl
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
  setRequestLocale: vi.fn(),
}));

// Mock i18n routing
vi.mock("@/i18n/routing", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  routing: {
    locales: ["en", "zh"],
    defaultLocale: "en",
  },
}));

vi.mock("@/config/paths", () => ({
  SITE_CONFIG: {
    baseUrl: "https://www.tianze-pipe.com",
  },
}));

// Mock SEO metadata
vi.mock("@/lib/seo-metadata", () => ({
  generateMetadataForPath: vi.fn(async () => ({
    title: "Products",
    description: "Products page",
  })),
}));

// Mock CatalogBreadcrumb
vi.mock("@/components/products/catalog-breadcrumb", () => ({
  CatalogBreadcrumb: () => <nav aria-label="breadcrumb">Breadcrumb</nav>,
}));

// Mock MarketSeriesCard
vi.mock("@/components/products/market-series-card", () => ({
  MarketSeriesCard: ({
    market,
  }: {
    market: { label: string; slug: string };
  }) => (
    <a href={`/products/${market.slug}`}>
      <h2>{market.label}</h2>
    </a>
  ),
}));

describe("Products Overview Page", () => {
  it("renders 5 market series cards with correct labels", async () => {
    const { default: ProductsPage } = await import("../page");
    const page = await ProductsPage({
      params: Promise.resolve({ locale: "en" }),
    });
    render(page);

    expect(screen.getByText("UL / ASTM Series")).toBeInTheDocument();
    expect(screen.getByText("AS/NZS 2053 Series")).toBeInTheDocument();
    expect(screen.getByText("NOM Series")).toBeInTheDocument();
    expect(screen.getByText("IEC Series")).toBeInTheDocument();
    expect(screen.getByText("PETG Pneumatic Tubes")).toBeInTheDocument();
  });

  it("each card links to the correct market URL", async () => {
    const { default: ProductsPage } = await import("../page");
    const page = await ProductsPage({
      params: Promise.resolve({ locale: "en" }),
    });
    render(page);

    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));

    expect(hrefs).toContain("/products/north-america");
    expect(hrefs).toContain("/products/australia-new-zealand");
    expect(hrefs).toContain("/products/mexico");
    expect(hrefs).toContain("/products/europe");
    expect(hrefs).toContain("/products/pneumatic-tube-systems");
  });

  it("renders breadcrumb", async () => {
    const { default: ProductsPage } = await import("../page");
    const page = await ProductsPage({
      params: Promise.resolve({ locale: "en" }),
    });
    render(page);

    expect(screen.getByLabelText("breadcrumb")).toBeInTheDocument();
  });
});

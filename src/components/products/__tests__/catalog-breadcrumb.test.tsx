import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock next-intl routing
vi.mock("@/i18n/routing", () => ({
  routing: {
    locales: ["en", "zh"],
    defaultLocale: "en",
  },
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string | { pathname: string; params: Record<string, string> };
    children: React.ReactNode;
  }) => {
    const resolvedHref =
      typeof href === "string"
        ? href
        : href.pathname.replace(
            /\[(\w+)\]/g,
            (_, key: string) => href.params[key] ?? key,
          );
    return (
      <a href={resolvedHref} {...props}>
        {children}
      </a>
    );
  },
}));

vi.mock("@/config/paths", () => ({
  SITE_CONFIG: {
    baseUrl: "https://www.tianze-pipe.com",
  },
}));

describe("CatalogBreadcrumb", () => {
  async function importComponent() {
    const mod = await import("../catalog-breadcrumb");
    return mod.CatalogBreadcrumb;
  }

  it("renders minimal breadcrumb for products overview (Home > Products)", async () => {
    const CatalogBreadcrumb = await importComponent();
    render(<CatalogBreadcrumb />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();

    // Products is current page (not a link)
    const productsEl = screen.getByText("Products");
    expect(productsEl).toHaveAttribute("aria-current", "page");
  });

  it("renders two-level breadcrumb for market page (Home > Products > Market)", async () => {
    const CatalogBreadcrumb = await importComponent();
    const market = {
      slug: "north-america",
      label: "UL / ASTM Series",
      standardLabel: "UL 651 / ASTM D1785",
      description: "test",
      sizeSystem: "inch" as const,
      standardIds: [],
      familySlugs: [],
    };

    render(<CatalogBreadcrumb market={market} />);

    // Home is a link
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");

    // Products is a link to /products
    const productsLink = screen.getByText("Products").closest("a");
    expect(productsLink).toHaveAttribute("href", "/products");

    // Market label is current page
    const marketEl = screen.getByText("UL / ASTM Series");
    expect(marketEl).toHaveAttribute("aria-current", "page");
  });

  it("renders JSON-LD BreadcrumbList structured data", async () => {
    const CatalogBreadcrumb = await importComponent();
    const market = {
      slug: "north-america",
      label: "UL / ASTM Series",
      standardLabel: "UL 651 / ASTM D1785",
      description: "test",
      sizeSystem: "inch" as const,
      standardIds: [],
      familySlugs: [],
    };

    const { container } = render(<CatalogBreadcrumb market={market} />);

    const scriptTag = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(scriptTag).not.toBeNull();

    const jsonLd = JSON.parse(scriptTag!.textContent!);
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toHaveLength(3);
    expect(jsonLd.itemListElement[0].position).toBe(1);
    expect(jsonLd.itemListElement[0].name).toBe("Home");
    expect(jsonLd.itemListElement[1].name).toBe("Products");
    expect(jsonLd.itemListElement[2].name).toBe("UL / ASTM Series");
  });
});

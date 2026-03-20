import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockNotFound = vi.fn();

vi.mock("next/navigation", () => ({
  notFound: () => {
    mockNotFound();
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("next-intl/server", () => ({
  setRequestLocale: vi.fn(),
}));

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
  LOCALES_CONFIG: {
    locales: ["en", "zh"],
    defaultLocale: "en",
  },
}));

vi.mock("@/components/products/catalog-breadcrumb", () => ({
  CatalogBreadcrumb: () => <nav aria-label="breadcrumb">Breadcrumb</nav>,
}));

vi.mock("@/components/products/family-card", () => ({
  FamilyCard: ({ family }: { family: { label: string; slug: string } }) => (
    <div>
      <h2>{family.label}</h2>
    </div>
  ),
}));

describe("Market Landing Page", () => {
  async function renderPage(market: string, locale = "en") {
    const { default: MarketPage } = await import("../page");
    const page = await MarketPage({
      params: Promise.resolve({ locale, market }),
    });
    return render(page);
  }

  it("renders 3 family cards for north-america market", async () => {
    await renderPage("north-america");

    expect(screen.getByText("Conduit Sweeps & Elbows")).toBeInTheDocument();
    expect(screen.getByText("Couplings")).toBeInTheDocument();
    expect(screen.getByText("Conduit Pipes")).toBeInTheDocument();
  });

  it("renders 4 family cards for australia-new-zealand including Bellmouths", async () => {
    await renderPage("australia-new-zealand");

    expect(screen.getByText("Conduit Bends")).toBeInTheDocument();
    expect(screen.getByText("Bellmouths")).toBeInTheDocument();
    expect(screen.getByText("Couplings")).toBeInTheDocument();
    expect(screen.getByText("Conduit Pipes")).toBeInTheDocument();
  });

  it("calls notFound for invalid market slug", async () => {
    await expect(renderPage("invalid-market")).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("renders breadcrumb", async () => {
    await renderPage("north-america");
    expect(screen.getByLabelText("breadcrumb")).toBeInTheDocument();
  });
});

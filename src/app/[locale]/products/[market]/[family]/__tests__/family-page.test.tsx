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

describe("Product Family Page", () => {
  async function renderPage(market: string, family: string, locale = "en") {
    const { default: FamilyPage } = await import("../page");
    const page = await FamilyPage({
      params: Promise.resolve({ locale, market, family }),
    });
    return render(page);
  }

  it("renders family heading and description for valid combo", async () => {
    await renderPage("north-america", "conduit-sweeps-elbows");

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Conduit Sweeps & Elbows/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/bell end and plain end/i)).toBeInTheDocument();
  });

  it("renders inquiry CTA linking to /contact", async () => {
    await renderPage("north-america", "conduit-sweeps-elbows");

    const ctaLink = screen.getByRole("link", {
      name: /inquiry|quote|contact/i,
    });
    expect(ctaLink).toHaveAttribute("href", "/contact");
  });

  it("calls notFound for invalid market-family combo (bellmouths in north-america)", async () => {
    await expect(renderPage("north-america", "bellmouths")).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(mockNotFound).toHaveBeenCalled();
  });

  it("renders correctly for AU-only family (bellmouths in australia-new-zealand)", async () => {
    await renderPage("australia-new-zealand", "bellmouths");

    expect(
      screen.getByRole("heading", { level: 1, name: /Bellmouths/i }),
    ).toBeInTheDocument();
  });

  it("renders breadcrumb", async () => {
    await renderPage("north-america", "conduit-sweeps-elbows");
    expect(screen.getByLabelText("breadcrumb")).toBeInTheDocument();
  });

  it("works with zh locale", async () => {
    await renderPage("north-america", "conduit-sweeps-elbows", "zh");

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Conduit Sweeps & Elbows/i,
      }),
    ).toBeInTheDocument();
  });
});

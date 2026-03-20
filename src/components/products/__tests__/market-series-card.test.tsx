import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/routing", () => ({
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

describe("MarketSeriesCard", () => {
  async function importComponent() {
    const mod = await import("../market-series-card");
    return mod.MarketSeriesCard;
  }

  const market = {
    slug: "north-america",
    label: "UL / ASTM Series",
    standardLabel: "UL 651 / ASTM D1785",
    description: "PVC conduit fittings for North American market.",
    sizeSystem: "inch" as const,
    standardIds: [] as string[],
    familySlugs: ["conduit-sweeps-elbows", "couplings", "conduit-pipes"],
  };

  it("renders market label as heading", async () => {
    const MarketSeriesCard = await importComponent();
    render(<MarketSeriesCard market={market} familyCount={3} />);

    expect(
      screen.getByRole("heading", { name: "UL / ASTM Series" }),
    ).toBeInTheDocument();
  });

  it("renders standard label badge", async () => {
    const MarketSeriesCard = await importComponent();
    render(<MarketSeriesCard market={market} familyCount={3} />);

    expect(screen.getByText("UL 651 / ASTM D1785")).toBeInTheDocument();
  });

  it("renders market description", async () => {
    const MarketSeriesCard = await importComponent();
    render(<MarketSeriesCard market={market} familyCount={3} />);

    expect(
      screen.getByText("PVC conduit fittings for North American market."),
    ).toBeInTheDocument();
  });

  it("links to the market landing page", async () => {
    const MarketSeriesCard = await importComponent();
    render(<MarketSeriesCard market={market} familyCount={3} />);

    const link = screen
      .getByRole("heading", { name: "UL / ASTM Series" })
      .closest("a");
    expect(link).toHaveAttribute("href", "/products/north-america");
  });

  it("displays family count", async () => {
    const MarketSeriesCard = await importComponent();
    render(<MarketSeriesCard market={market} familyCount={3} />);

    expect(screen.getByText(/3/)).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock next/image — renders as plain <img> in test environment
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill,
    sizes,
    className,
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    className?: string;
  }) => (
    <img
      src={src}
      alt={alt}
      data-fill={fill ? "true" : undefined}
      data-sizes={sizes}
      className={className}
    />
  ),
}));

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
    standardIds: [] as const,
    familySlugs: [
      "conduit-sweeps-elbows",
      "couplings",
      "conduit-pipes",
    ] as const,
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

  it("displays family count with default label", async () => {
    const MarketSeriesCard = await importComponent();
    render(<MarketSeriesCard market={market} familyCount={3} />);

    expect(screen.getByText("3 product families")).toBeInTheDocument();
  });

  it("displays translated family count label when provided", async () => {
    const MarketSeriesCard = await importComponent();
    render(
      <MarketSeriesCard
        market={market}
        familyCount={3}
        familyCountLabel="3 个产品系列"
      />,
    );

    expect(screen.getByText("3 个产品系列")).toBeInTheDocument();
  });

  it("renders a placeholder image", async () => {
    const MarketSeriesCard = await importComponent();
    render(<MarketSeriesCard market={market} familyCount={3} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", expect.stringContaining(market.label));
  });
});

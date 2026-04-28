import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ProductFamilyDefinition } from "@/constants/product-catalog";
import type { FamilySpecs } from "@/constants/product-specs/types";

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
    className,
  }: {
    href: string | { pathname: string; query?: Record<string, string> };
    children: React.ReactNode;
    className?: string;
  }) => {
    const resolvedHref =
      typeof href === "string"
        ? href
        : `${href.pathname}?${new URLSearchParams(href.query)}`;

    return (
      <a href={resolvedHref} className={className}>
        {children}
      </a>
    );
  },
}));

// Mock SpecTable to keep tests focused on FamilySection behavior
vi.mock("../spec-table", () => ({
  SpecTable: ({ specGroups }: { specGroups: unknown[] }) => (
    <div data-testid="spec-table">{specGroups.length} groups</div>
  ),
}));

const mockFamily: ProductFamilyDefinition = {
  slug: "conduit-sweeps-elbows",
  label: "Conduit Sweeps & Elbows",
  description: "PVC conduit sweeps and elbows in standard angles.",
  marketSlug: "north-america",
};

const mockSpecs: FamilySpecs = {
  slug: "conduit-sweeps-elbows",
  images: ["/images/products/placeholder-sweep.svg"],
  highlights: ["UL 651 Certified", "100% Virgin PVC", "45°/90°/Custom"],
  specGroups: [
    {
      groupLabel: "Schedule 40",
      columns: ["Size", "Angle"],
      rows: [['1/2"', "90°"]],
    },
  ],
};

describe("Feature: Market Family Page — Product Family Section", () => {
  async function importComponent() {
    const mod = await import("../family-section");
    return mod.FamilySection;
  }

  describe("Scenario 1.2 / 1.5: Buyer sees product family with image area and spec table", () => {
    it("renders the family name as a heading", async () => {
      const FamilySection = await importComponent();
      render(
        <FamilySection
          family={mockFamily}
          specs={mockSpecs}
          familyLabel="Conduit Sweeps & Elbows"
          familyDescription="PVC conduit sweeps and elbows in standard angles."
        />,
      );

      expect(
        screen.getByRole("heading", { name: "Conduit Sweeps & Elbows" }),
      ).toBeInTheDocument();
    });

    it("renders the family description", async () => {
      const FamilySection = await importComponent();
      render(
        <FamilySection
          family={mockFamily}
          specs={mockSpecs}
          familyLabel="Conduit Sweeps & Elbows"
          familyDescription="PVC conduit sweeps and elbows in standard angles."
        />,
      );

      expect(
        screen.getByText("PVC conduit sweeps and elbows in standard angles."),
      ).toBeInTheDocument();
    });

    it("renders an image area with the first product image", async () => {
      const FamilySection = await importComponent();
      render(
        <FamilySection
          family={mockFamily}
          specs={mockSpecs}
          familyLabel="Conduit Sweeps & Elbows"
          familyDescription="PVC conduit sweeps and elbows in standard angles."
        />,
      );

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute(
        "src",
        "/images/products/placeholder-sweep.svg",
      );
    });

    it("renders 3 key highlights", async () => {
      const FamilySection = await importComponent();
      render(
        <FamilySection
          family={mockFamily}
          specs={mockSpecs}
          familyLabel="Conduit Sweeps & Elbows"
          familyDescription="PVC conduit sweeps and elbows in standard angles."
        />,
      );

      expect(screen.getByText("UL 651 Certified")).toBeInTheDocument();
      expect(screen.getByText("100% Virgin PVC")).toBeInTheDocument();
      expect(screen.getByText("45°/90°/Custom")).toBeInTheDocument();
    });

    it("renders the SpecTable component", async () => {
      const FamilySection = await importComponent();
      render(
        <FamilySection
          family={mockFamily}
          specs={mockSpecs}
          familyLabel="Conduit Sweeps & Elbows"
          familyDescription="PVC conduit sweeps and elbows in standard angles."
        />,
      );

      expect(screen.getByTestId("spec-table")).toBeInTheDocument();
      expect(screen.getByTestId("spec-table")).toHaveTextContent("1 groups");
    });

    it("has an anchor id matching the family slug for sticky nav linking", async () => {
      const FamilySection = await importComponent();
      const { container } = render(
        <FamilySection
          family={mockFamily}
          specs={mockSpecs}
          familyLabel="Conduit Sweeps & Elbows"
          familyDescription="PVC conduit sweeps and elbows in standard angles."
        />,
      );

      const section = container.querySelector("section#conduit-sweeps-elbows");
      expect(section).toBeInTheDocument();
    });

    it("renders an optional inquiry CTA", async () => {
      const FamilySection = await importComponent();
      render(
        <FamilySection
          family={mockFamily}
          specs={mockSpecs}
          familyLabel="Conduit Sweeps & Elbows"
          familyDescription="PVC conduit sweeps and elbows in standard angles."
          inquiry={{
            href: {
              pathname: "/contact",
              query: {
                intent: "product-family",
                market: "north-america",
                family: "conduit-sweeps-elbows",
              },
            },
            label: "Request quote for Conduit Sweeps & Elbows",
          }}
        />,
      );

      expect(
        screen.getByRole("link", {
          name: "Request quote for Conduit Sweeps & Elbows",
        }),
      ).toHaveAttribute(
        "href",
        "/contact?intent=product-family&market=north-america&family=conduit-sweeps-elbows",
      );
    });
  });
});

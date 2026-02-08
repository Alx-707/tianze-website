import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductsSection } from "@/components/sections/products-section";

describe("ProductsSection", () => {
  it("renders without crashing", () => {
    render(<ProductsSection />);
    expect(
      screen.getByRole("heading", { level: 2, name: "products.title" }),
    ).toBeInTheDocument();
  });

  it("renders section subtitle", () => {
    render(<ProductsSection />);
    expect(screen.getByText("products.subtitle")).toBeInTheDocument();
  });

  it("renders CTA button with link to products page", () => {
    render(<ProductsSection />);
    expect(screen.getByText("products.cta")).toBeInTheDocument();
  });

  it("renders 4 product cards with tags, titles, and standards", () => {
    render(<ProductsSection />);

    for (let i = 1; i <= 4; i++) {
      const key = `item${i}`;
      expect(screen.getByText(`products.${key}.tag`)).toBeInTheDocument();
      expect(screen.getByText(`products.${key}.standard`)).toBeInTheDocument();
    }
  });

  it("renders 4 product card h3 headings", () => {
    render(<ProductsSection />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(4);
  });

  it("renders 3 specs per product card", () => {
    render(<ProductsSection />);

    for (let i = 1; i <= 4; i++) {
      const key = `item${i}`;
      for (let j = 1; j <= 3; j++) {
        expect(
          screen.getByText(`products.${key}.spec${j}`),
        ).toBeInTheDocument();
      }
    }
  });
});

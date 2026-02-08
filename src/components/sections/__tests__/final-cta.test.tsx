import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FinalCTA } from "@/components/sections/final-cta";

describe("FinalCTA", () => {
  it("renders without crashing", () => {
    render(<FinalCTA />);
    expect(
      screen.getByRole("heading", { level: 2, name: "title" }),
    ).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<FinalCTA />);
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("renders primary CTA as a link to /contact", () => {
    render(<FinalCTA />);
    const primaryLink = screen.getByText("primary").closest("a");
    expect(primaryLink).toHaveAttribute("href", "/contact");
  });

  it("renders secondary CTA as a link to /products", () => {
    render(<FinalCTA />);
    const secondaryLink = screen.getByText("secondary").closest("a");
    expect(secondaryLink).toHaveAttribute("href", "/products");
  });

  it("renders trust text", () => {
    render(<FinalCTA />);
    expect(screen.getByText("trust")).toBeInTheDocument();
  });
});

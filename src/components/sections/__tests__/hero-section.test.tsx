import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroSection } from "@/components/sections/hero-section";

describe("HeroSection", () => {
  it("renders without crashing", () => {
    render(<HeroSection />);
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
  });

  it("renders the h1 heading with translation key", () => {
    render(<HeroSection />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("hero.title");
  });

  it("renders eyebrow text", () => {
    render(<HeroSection />);
    expect(screen.getByText("hero.eyebrow")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<HeroSection />);
    expect(screen.getByText("hero.subtitle")).toBeInTheDocument();
  });

  it("renders primary CTA as a link to /contact", () => {
    render(<HeroSection />);
    const primaryLink = screen.getByText("hero.cta.primary").closest("a");
    expect(primaryLink).toHaveAttribute("href", "/contact");
  });

  it("renders secondary CTA as a link to /products", () => {
    render(<HeroSection />);
    const secondaryLink = screen.getByText("hero.cta.secondary").closest("a");
    expect(secondaryLink).toHaveAttribute("href", "/products");
  });

  it("renders 4 proof bar items with values and labels", () => {
    render(<HeroSection />);
    // CountUp items render via AnimatedCounter with aria-label
    expect(screen.getByLabelText("hero.proof.countries")).toBeInTheDocument();
    expect(screen.getByText("hero.proof.countriesLabel")).toBeInTheDocument();
    // Static items render as text
    expect(screen.getByText("hero.proof.range")).toBeInTheDocument();
    expect(screen.getByText("hero.proof.rangeLabel")).toBeInTheDocument();
    expect(screen.getByText("hero.proof.production")).toBeInTheDocument();
    expect(screen.getByText("hero.proof.productionLabel")).toBeInTheDocument();
    expect(screen.getByLabelText("hero.proof.est")).toBeInTheDocument();
    expect(screen.getByText("hero.proof.estLabel")).toBeInTheDocument();
  });
});

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

  it("renders primary and secondary CTA buttons", () => {
    render(<HeroSection />);
    expect(screen.getByText("hero.cta.primary")).toBeInTheDocument();
    expect(screen.getByText("hero.cta.secondary")).toBeInTheDocument();
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

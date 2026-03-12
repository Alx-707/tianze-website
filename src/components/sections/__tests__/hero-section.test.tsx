import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeroSection } from "@/components/sections/hero-section";

async function renderAsyncComponent(
  asyncComponent: React.JSX.Element | Promise<React.JSX.Element>,
) {
  const resolvedElement = await Promise.resolve(asyncComponent);
  return render(resolvedElement);
}

describe("HeroSection", () => {
  it("renders without crashing", async () => {
    await renderAsyncComponent(HeroSection());
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
  });

  it("renders the h1 heading with translation key", async () => {
    await renderAsyncComponent(HeroSection());
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("hero.title");
  });

  it("renders eyebrow text", async () => {
    await renderAsyncComponent(HeroSection());
    expect(screen.getByText("hero.eyebrow")).toBeInTheDocument();
  });

  it("renders subtitle", async () => {
    await renderAsyncComponent(HeroSection());
    expect(screen.getByText("hero.subtitle")).toBeInTheDocument();
  });

  it("renders primary CTA as a link to /contact", async () => {
    await renderAsyncComponent(HeroSection());
    const primaryLink = screen.getByText("hero.cta.primary").closest("a");
    expect(primaryLink).toHaveAttribute("href", "/contact");
  });

  it("renders secondary CTA as a link to /products", async () => {
    await renderAsyncComponent(HeroSection());
    const secondaryLink = screen.getByText("hero.cta.secondary").closest("a");
    expect(secondaryLink).toHaveAttribute("href", "/products");
  });

  it("renders 4 proof bar items with values and labels", async () => {
    await renderAsyncComponent(HeroSection());
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

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FinalCTA } from "@/components/sections/final-cta";
import { HeroSection } from "@/components/sections/hero-section";
import { ProductsSection } from "@/components/sections/products-section";
import { ResourcesSection } from "@/components/sections/resources-section";
import { SampleCTA } from "@/components/sections/sample-cta";
import { ScenariosSection } from "@/components/sections/scenarios-section";

async function renderAsyncComponent(
  asyncComponent: React.JSX.Element | Promise<React.JSX.Element>,
) {
  const resolvedElement = await Promise.resolve(asyncComponent);
  return render(resolvedElement);
}

describe("Homepage section cluster contract", () => {
  it("preserves hero and final/sample CTA hierarchy", async () => {
    await renderAsyncComponent(HeroSection());
    expect(screen.getByText("hero.cta.primary").closest("a")).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.getByText("hero.cta.secondary").closest("a")).toHaveAttribute(
      "href",
      "/products",
    );

    await renderAsyncComponent(SampleCTA());
    expect(screen.getByRole("link", { name: "sample.cta" })).toHaveAttribute(
      "href",
      "/contact",
    );

    await renderAsyncComponent(FinalCTA());
    expect(screen.getByText("primary").closest("a")).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.getByText("secondary").closest("a")).toHaveAttribute(
      "href",
      "/products",
    );
  });

  it("keeps section responsibilities present across the cluster", async () => {
    await renderAsyncComponent(ProductsSection());
    expect(
      screen.getByRole("heading", { level: 2, name: "products.title" }),
    ).toBeInTheDocument();

    await renderAsyncComponent(ResourcesSection());
    expect(
      screen.getByRole("heading", { level: 2, name: "resources.title" }),
    ).toBeInTheDocument();

    await renderAsyncComponent(ScenariosSection());
    expect(
      screen.getByRole("heading", { level: 2, name: "title" }),
    ).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FinalCTA } from "@/components/sections/final-cta";

async function renderAsyncComponent(
  asyncComponent: React.JSX.Element | Promise<React.JSX.Element>,
) {
  const resolvedElement = await Promise.resolve(asyncComponent);
  return render(resolvedElement);
}

describe("FinalCTA", () => {
  it("renders without crashing", async () => {
    await renderAsyncComponent(FinalCTA());
    expect(
      screen.getByRole("heading", { level: 2, name: "title" }),
    ).toBeInTheDocument();
  });

  it("renders description text", async () => {
    await renderAsyncComponent(FinalCTA());
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("renders primary CTA as a link to /contact", async () => {
    await renderAsyncComponent(FinalCTA());
    const primaryLink = screen.getByText("primary").closest("a");
    expect(primaryLink).toHaveAttribute("href", "/contact");
  });

  it("renders secondary CTA as a link to /products", async () => {
    await renderAsyncComponent(FinalCTA());
    const secondaryLink = screen.getByText("secondary").closest("a");
    expect(secondaryLink).toHaveAttribute("href", "/products");
  });

  it("renders trust text", async () => {
    await renderAsyncComponent(FinalCTA());
    expect(screen.getByText("trust")).toBeInTheDocument();
  });
});

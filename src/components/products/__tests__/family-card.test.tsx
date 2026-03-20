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

describe("FamilyCard", () => {
  async function importComponent() {
    const mod = await import("../family-card");
    return mod.FamilyCard;
  }

  const family = {
    slug: "conduit-sweeps-elbows",
    label: "Conduit Sweeps & Elbows",
    description: "PVC conduit sweeps and elbows in standard angles.",
    marketSlug: "north-america",
  };

  it("renders family label as heading", async () => {
    const FamilyCard = await importComponent();
    render(<FamilyCard family={family} marketSlug="north-america" />);

    expect(
      screen.getByRole("heading", { name: "Conduit Sweeps & Elbows" }),
    ).toBeInTheDocument();
  });

  it("renders family description", async () => {
    const FamilyCard = await importComponent();
    render(<FamilyCard family={family} marketSlug="north-america" />);

    expect(
      screen.getByText("PVC conduit sweeps and elbows in standard angles."),
    ).toBeInTheDocument();
  });

  it("links to the family page under the market", async () => {
    const FamilyCard = await importComponent();
    render(<FamilyCard family={family} marketSlug="north-america" />);

    const link = screen
      .getByRole("heading", { name: "Conduit Sweeps & Elbows" })
      .closest("a");
    expect(link).toHaveAttribute(
      "href",
      "/products/north-america/conduit-sweeps-elbows",
    );
  });
});

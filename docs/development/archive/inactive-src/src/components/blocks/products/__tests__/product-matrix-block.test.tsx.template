import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductMatrixBlock } from "../product-matrix-block";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("ProductMatrixBlock", () => {
  const RETIRED_BENDING_MACHINES_PATH = "/capabilities/bending-machines";

  it("renders section header", () => {
    render(<ProductMatrixBlock />);

    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("renders live product cards", () => {
    render(<ProductMatrixBlock />);

    const cards = screen.getAllByRole("link");
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });

  it("uses current live product destinations instead of stale template routes", () => {
    render(<ProductMatrixBlock />);

    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toContain("/products");
    expect(hrefs).toContain("/products/pneumatic-tube-systems");
    expect(hrefs).toContain("/contact");
    expect(hrefs).not.toContain(RETIRED_BENDING_MACHINES_PATH);
    expect(hrefs).not.toContain("/products/machines");
    expect(hrefs).not.toContain("/products/pvc-conduits");
    expect(hrefs).not.toContain("/products/pneumatic-tubes");
  });

  it("has correct section id for scroll targeting", () => {
    const { container } = render(<ProductMatrixBlock />);

    const section = container.querySelector("#products");
    expect(section).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductMatrixBlock } from "../product-matrix-block";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("ProductMatrixBlock", () => {
  it("renders section header", () => {
    render(<ProductMatrixBlock />);

    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("renders 4 product cards", () => {
    render(<ProductMatrixBlock />);

    const cards = screen.getAllByRole("link");
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it("has correct section id for scroll targeting", () => {
    const { container } = render(<ProductMatrixBlock />);

    const section = container.querySelector("#products");
    expect(section).toBeInTheDocument();
  });
});

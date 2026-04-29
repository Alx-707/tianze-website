import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductCard } from "../product-card";

describe("ProductCard", () => {
  const props = {
    image: { src: "/images/product.jpg", alt: "PVC 管件" },
    title: "PVC 管件",
    features: ["多市场标准", "稳定供应", "支持询盘"],
    buttonText: "了解更多",
    buttonHref: "/products",
  };

  it("renders title and features", () => {
    render(<ProductCard {...props} />);

    expect(screen.getByText("PVC 管件")).toBeInTheDocument();
    const featureItems = screen.getAllByRole("listitem");
    expect(featureItems).toHaveLength(props.features.length);
    for (const feature of props.features) {
      expect(screen.getByText(feature)).toBeInTheDocument();
    }
  });

  it("renders button with correct href", () => {
    render(<ProductCard {...props} />);

    const button = screen.getByRole("link", { name: /了解更多/i });
    expect(button).toHaveAttribute("href", "/products");
  });

  it("renders primary button variant when isPrimary is true", () => {
    render(<ProductCard {...props} isPrimary buttonText="获取报价" />);

    const button = screen.getByRole("link", { name: /获取报价/i });
    expect(button).toHaveClass("bg-primary");
  });
});

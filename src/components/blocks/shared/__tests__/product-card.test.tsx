import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductCard } from "../product-card";

describe("ProductCard", () => {
  const props = {
    image: { src: "/images/machine.jpg", alt: "弯管机" },
    title: "弯管设备",
    features: ["自主设计研发制造", "半自动/全自动弯管机", "服务国内一线品牌"],
    buttonText: "了解更多",
    buttonHref: "/products/machines",
  };

  it("renders title and features", () => {
    render(<ProductCard {...props} />);

    expect(screen.getByText("弯管设备")).toBeInTheDocument();
    expect(screen.getByText("自主设计研发制造")).toBeInTheDocument();
    expect(screen.getByText("半自动/全自动弯管机")).toBeInTheDocument();
    expect(screen.getByText("服务国内一线品牌")).toBeInTheDocument();
  });

  it("renders button with correct href", () => {
    render(<ProductCard {...props} />);

    const button = screen.getByRole("link", { name: /了解更多/i });
    expect(button).toHaveAttribute("href", "/products/machines");
  });

  it("renders primary button variant when isPrimary is true", () => {
    render(<ProductCard {...props} isPrimary buttonText="获取报价" />);

    const button = screen.getByRole("link", { name: /获取报价/i });
    expect(button).toHaveClass("bg-primary");
  });
});

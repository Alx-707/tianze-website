import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ImageCarousel } from "../image-carousel";

describe("ImageCarousel", () => {
  const images = [
    { src: "/images/machine-1.jpg", alt: "弯管机" },
    { src: "/images/machine-2.jpg", alt: "扩管机" },
    { src: "/images/line.jpg", alt: "生产线" },
  ];

  it("renders all images", () => {
    render(<ImageCarousel images={images} />);

    expect(screen.getByAltText("弯管机")).toBeInTheDocument();
    expect(screen.getByAltText("扩管机")).toBeInTheDocument();
    expect(screen.getByAltText("生产线")).toBeInTheDocument();
  });

  it("applies horizontal scroll on mobile", () => {
    const { container } = render(<ImageCarousel images={images} />);

    const scrollContainer = container.querySelector("[data-scroll-container]");
    expect(scrollContainer).toHaveClass("overflow-x-auto");
  });
});

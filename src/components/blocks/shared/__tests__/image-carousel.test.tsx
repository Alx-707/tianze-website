import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ImageCarousel } from "../image-carousel";

describe("ImageCarousel", () => {
  const images = [
    { src: "/images/process-1.jpg", alt: "成型工艺" },
    { src: "/images/machine-2.jpg", alt: "扩管机" },
    { src: "/images/line.jpg", alt: "生产线" },
  ];

  it("renders all images", () => {
    render(<ImageCarousel images={images} />);

    const renderedImages = screen.getAllByRole("img");
    expect(renderedImages).toHaveLength(images.length);

    for (const image of images) {
      const renderedImage = screen.getByAltText(image.alt);
      const renderedSrc = renderedImage.getAttribute("src") ?? "";
      expect(decodeURIComponent(renderedSrc)).toContain(image.src);
      expect(renderedImage).toHaveAttribute("alt", image.alt);
    }
  });

  it("applies horizontal scroll on mobile", () => {
    const { container } = render(<ImageCarousel images={images} />);

    const scrollContainer = container.querySelector("[data-scroll-container]");
    expect(scrollContainer).toHaveClass("overflow-x-auto");
  });
});

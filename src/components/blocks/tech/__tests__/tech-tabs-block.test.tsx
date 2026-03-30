/**
 * Minimal test for TechTabsBlock.
 *
 * Covers the DEC_0_3 constant import and its usage in
 * useIntersectionObserver({ threshold: DEC_0_3 }) at multiple call sites.
 */
import { describe, expect, it } from "vitest";
import { TechTabsBlock } from "@/components/blocks/tech/tech-tabs-block";
import { render } from "@/test/utils";
import { screen } from "@testing-library/react";

describe("TechTabsBlock", () => {
  it("should render without errors", () => {
    const { container } = render(<TechTabsBlock />);

    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("marks tabs and technology labels as notranslate", () => {
    render(<TechTabsBlock />);

    expect(screen.getByTestId("tech-tabs-list")).toHaveClass("notranslate");
    expect(screen.getByTestId("tech-tabs-list")).toHaveAttribute(
      "translate",
      "no",
    );
    expect(screen.getByTestId("tech-tab-label-core")).toHaveAttribute(
      "translate",
      "no",
    );
    expect(screen.getByTestId("tech-card-title-nextjs")).toHaveAttribute(
      "translate",
      "no",
    );
    expect(screen.getByTestId("tech-card-version-nextjs")).toHaveAttribute(
      "translate",
      "no",
    );
    expect(screen.getByTestId("tech-card-link-label-nextjs")).toHaveAttribute(
      "translate",
      "no",
    );
  });
});

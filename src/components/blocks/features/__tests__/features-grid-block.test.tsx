/**
 * Minimal test for FeaturesGridBlock.
 *
 * Covers the DEC_0_2 constant import and its usage in
 * useIntersectionObserver({ threshold: DEC_0_2 }).
 */
import { describe, expect, it } from "vitest";
import { FeaturesGridBlock } from "@/components/blocks/features/features-grid-block";
import { render } from "@/test/utils";

describe("FeaturesGridBlock", () => {
  it("should render without errors", () => {
    const { container } = render(<FeaturesGridBlock />);

    expect(container.querySelector("section")).toBeInTheDocument();
  });
});

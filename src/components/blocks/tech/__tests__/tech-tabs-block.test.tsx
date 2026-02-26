/**
 * Minimal test for TechTabsBlock.
 *
 * Covers the DEC_0_3 constant import and its usage in
 * useIntersectionObserver({ threshold: DEC_0_3 }) at multiple call sites.
 */
import { describe, expect, it } from "vitest";
import { TechTabsBlock } from "@/components/blocks/tech/tech-tabs-block";
import { render } from "@/test/utils";

describe("TechTabsBlock", () => {
  it("should render without errors", () => {
    const { container } = render(<TechTabsBlock />);

    expect(container.querySelector("section")).toBeInTheDocument();
  });
});

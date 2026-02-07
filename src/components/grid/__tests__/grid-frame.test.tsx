/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GridFrame } from "@/components/grid/grid-frame";

describe("GridFrame", () => {
  it("renders children", () => {
    render(
      <GridFrame>
        <div data-testid="child">Content</div>
      </GridFrame>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders outer frame border element with hidden lg:block", () => {
    const { container } = render(
      <GridFrame>
        <div>Content</div>
      </GridFrame>,
    );

    const frame = container.querySelector("[aria-hidden='true']");
    expect(frame).toBeInTheDocument();
    expect(frame).toHaveClass("hidden", "lg:block");
  });

  it("renders crosshairs matching provided count", () => {
    const { container } = render(
      <GridFrame
        crosshairs={[
          { top: 0, left: 0 },
          { bottom: 0, right: 0 },
        ]}
      >
        <div>Content</div>
      </GridFrame>,
    );

    // 2 crosshair wrapper divs (z-20) — direct children of the root
    const crosshairWrappers = container.querySelectorAll(".z-20");
    expect(crosshairWrappers.length).toBe(2);
  });

  it("renders no crosshairs when none provided", () => {
    const { container } = render(
      <GridFrame>
        <div>Content</div>
      </GridFrame>,
    );

    // Only the frame element should have aria-hidden
    const ariaHiddenElements = container.querySelectorAll(
      "[aria-hidden='true']",
    );
    expect(ariaHiddenElements.length).toBe(1);
  });

  it("applies pointer-events-none on decorative elements", () => {
    const { container } = render(
      <GridFrame crosshairs={[{ top: 0, left: 0 }]}>
        <div>Content</div>
      </GridFrame>,
    );

    const decorativeElements = container.querySelectorAll(
      ".pointer-events-none",
    );
    expect(decorativeElements.length).toBeGreaterThanOrEqual(2);
  });

  it("does not constrain children layout", () => {
    const { container } = render(
      <GridFrame>
        <div data-testid="child">Content</div>
      </GridFrame>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("relative");
    expect(wrapper).not.toHaveClass("max-w-[1080px]");
  });
});

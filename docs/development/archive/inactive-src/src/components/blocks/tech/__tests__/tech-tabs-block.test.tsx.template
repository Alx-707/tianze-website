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

  it("renders package versions that match the current repo baseline", () => {
    let view = render(<TechTabsBlock />);

    expect(screen.getByTestId("tech-card-version-nextjs")).toHaveTextContent(
      "16.2.3",
    );
    expect(screen.getByTestId("tech-card-version-react")).toHaveTextContent(
      "19.2.4",
    );

    view.unmount();
    view = render(<TechTabsBlock defaultCategory="ui" />);
    expect(
      screen.getByTestId("tech-card-version-tailwindcss"),
    ).toHaveTextContent("4.2.2");

    view.unmount();
    view = render(<TechTabsBlock defaultCategory="i18n" />);
    expect(screen.getByTestId("tech-card-version-next-intl")).toHaveTextContent(
      "4.9.1",
    );

    view.unmount();
    view = render(<TechTabsBlock defaultCategory="tools" />);
    expect(screen.getByTestId("tech-card-version-lefthook")).toHaveTextContent(
      "2.1.4",
    );

    view.unmount();
    render(<TechTabsBlock defaultCategory="testing" />);
    expect(screen.getByTestId("tech-card-version-vitest")).toHaveTextContent(
      "4.1.2",
    );
    expect(
      screen.getByTestId("tech-card-version-playwright"),
    ).toHaveTextContent("1.59.0");
  });
});

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BelowTheFoldClient } from "@/components/home/below-the-fold.client";

vi.mock("@/components/blocks/features/features-grid-block", () => ({
  FeaturesGridBlock: () => (
    <div data-testid="features-grid-block">Features Grid Block</div>
  ),
}));

vi.mock("@/components/blocks/cta/cta-banner-block", () => ({
  CTABannerBlock: () => (
    <div data-testid="cta-banner-block">CTA Banner Block</div>
  ),
}));

vi.mock("@/components/home/below-the-fold-skeleton", () => ({
  CallToActionSkeleton: () => (
    <div data-testid="cta-skeleton">CTA Skeleton</div>
  ),
  ProjectOverviewSkeleton: () => (
    <div data-testid="project-skeleton">Project Skeleton</div>
  ),
}));

describe("BelowTheFoldClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all section components", () => {
    render(<BelowTheFoldClient />);

    expect(screen.getByTestId("project-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("cta-skeleton")).toBeInTheDocument();
  });

  it("renders as a fragment with two children", () => {
    const { container } = render(<BelowTheFoldClient />);

    expect(container.children).toHaveLength(2);
  });

  it("has correct component order", () => {
    const { container } = render(<BelowTheFoldClient />);
    const children = Array.from(container.children);

    expect(children[0]).toHaveAttribute("data-testid", "project-skeleton");
    expect(children[1]).toHaveAttribute("data-testid", "cta-skeleton");
  });

  it("exports BelowTheFoldClient as named export", async () => {
    const module = await import("@/components/home/below-the-fold.client");
    expect(module.BelowTheFoldClient).toBeDefined();
    expect(typeof module.BelowTheFoldClient).toBe("function");
  });
});

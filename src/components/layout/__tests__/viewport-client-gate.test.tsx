import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ViewportClientGate } from "@/components/layout/viewport-client-gate";

const { mockUseViewportMatch } = vi.hoisted(() => ({
  mockUseViewportMatch: vi.fn(),
}));

vi.mock("@/hooks/use-viewport-match", () => ({
  useViewportMatch: mockUseViewportMatch,
}));

describe("ViewportClientGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when the requested viewport matches", () => {
    mockUseViewportMatch.mockReturnValue(true);

    render(
      <ViewportClientGate mode="mobile">
        <div data-testid="gated-child">Visible</div>
      </ViewportClientGate>,
    );

    expect(screen.getByTestId("gated-child")).toBeInTheDocument();
    expect(mockUseViewportMatch).toHaveBeenCalledWith("mobile");
  });

  it("renders nothing when the viewport does not match", () => {
    mockUseViewportMatch.mockReturnValue(false);

    const { container } = render(
      <ViewportClientGate mode="desktop">
        <div data-testid="gated-child">Hidden</div>
      </ViewportClientGate>,
    );

    expect(container.firstChild).toBeNull();
  });
});

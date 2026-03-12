import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DesktopDecorationGate } from "@/components/grid/desktop-decoration-gate";

const { mockUseViewportMatch } = vi.hoisted(() => ({
  mockUseViewportMatch: vi.fn(),
}));

vi.mock("@/hooks/use-viewport-match", () => ({
  useViewportMatch: mockUseViewportMatch,
}));

describe("DesktopDecorationGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children on desktop viewports", () => {
    mockUseViewportMatch.mockReturnValue(true);

    render(
      <DesktopDecorationGate>
        <div data-testid="desktop-decoration">Decoration</div>
      </DesktopDecorationGate>,
    );

    expect(screen.getByTestId("desktop-decoration")).toBeInTheDocument();
    expect(mockUseViewportMatch).toHaveBeenCalledWith("desktop");
  });

  it("renders nothing outside desktop viewports", () => {
    mockUseViewportMatch.mockReturnValue(false);

    const { container } = render(
      <DesktopDecorationGate>
        <div data-testid="desktop-decoration">Decoration</div>
      </DesktopDecorationGate>,
    );

    expect(container.firstChild).toBeNull();
  });
});

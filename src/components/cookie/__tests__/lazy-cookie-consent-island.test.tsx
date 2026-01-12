import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUseIdleRender, mockCookieConsentIsland } = vi.hoisted(() => ({
  mockUseIdleRender: vi.fn(),
  mockCookieConsentIsland: vi.fn(() => (
    <div data-testid="cookie-consent-island" />
  )),
}));

vi.mock("@/hooks/use-idle-render", () => ({
  useIdleRender: mockUseIdleRender,
}));

vi.mock("@/components/cookie/cookie-consent-island", () => ({
  CookieConsentIsland: mockCookieConsentIsland,
}));

describe("LazyCookieConsentIsland", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns null when main thread is busy", async () => {
    mockUseIdleRender.mockReturnValue(false);

    const { LazyCookieConsentIsland } =
      await import("../lazy-cookie-consent-island");
    const { container } = render(<LazyCookieConsentIsland />);

    expect(container.firstChild).toBeNull();
    expect(mockCookieConsentIsland).not.toHaveBeenCalled();
  });

  it("renders CookieConsentIsland when main thread is idle", async () => {
    mockUseIdleRender.mockReturnValue(true);

    const { LazyCookieConsentIsland } =
      await import("../lazy-cookie-consent-island");
    render(<LazyCookieConsentIsland />);

    expect(screen.getByTestId("cookie-consent-island")).toBeInTheDocument();
    expect(mockCookieConsentIsland).toHaveBeenCalled();
  });

  it("calls useIdleRender hook without options", async () => {
    mockUseIdleRender.mockReturnValue(true);

    const { LazyCookieConsentIsland } =
      await import("../lazy-cookie-consent-island");
    render(<LazyCookieConsentIsland />);

    expect(mockUseIdleRender).toHaveBeenCalledWith();
  });
});

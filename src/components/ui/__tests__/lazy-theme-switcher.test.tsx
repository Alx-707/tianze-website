import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { THIRTY_SECONDS_MS } from "@/constants/time";
import { LazyThemeSwitcher } from "@/components/ui/lazy-theme-switcher";

const { mockUsePathname, mockUseIdleRender } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(),
  mockUseIdleRender: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}));

vi.mock("@/hooks/use-idle-render", () => ({
  useIdleRender: mockUseIdleRender,
}));

vi.mock("@/components/ui/theme-switcher", () => ({
  ThemeSwitcher: ({ "data-testid": dataTestId = "theme-switcher" }) => (
    <button data-testid={dataTestId} type="button">
      Theme switcher
    </button>
  ),
}));

describe("LazyThemeSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockUsePathname.mockReturnValue("/about");
    mockUseIdleRender.mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stays hidden until idle rendering is allowed on non-home routes", async () => {
    const { rerender } = render(
      <LazyThemeSwitcher data-testid="footer-theme-toggle" />,
    );

    expect(screen.queryByTestId("footer-theme-toggle")).not.toBeInTheDocument();

    mockUseIdleRender.mockReturnValue(true);
    rerender(<LazyThemeSwitcher data-testid="footer-theme-toggle" />);

    await act(async () => {
      await vi.dynamicImportSettled();
    });

    expect(screen.getByTestId("footer-theme-toggle")).toBeInTheDocument();
  });

  it("waits for the homepage delay before importing the switcher", async () => {
    mockUsePathname.mockReturnValue("/en");

    render(<LazyThemeSwitcher data-testid="footer-theme-toggle" />);

    await act(async () => {
      vi.advanceTimersByTime(THIRTY_SECONDS_MS - 1);
      await vi.dynamicImportSettled();
    });

    expect(screen.queryByTestId("footer-theme-toggle")).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.dynamicImportSettled();
    });

    expect(screen.getByTestId("footer-theme-toggle")).toBeInTheDocument();
  });
});

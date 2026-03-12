/**
 * @vitest-environment jsdom
 * Tests for LazyToaster component
 */
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FIVE_SECONDS_MS, THIRTY_SECONDS_MS } from "@/constants/time";
import { LazyToaster } from "../lazy-toaster";

const { mockUsePathname } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(() => "/about"),
}));

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}));

vi.mock("@/components/ui/toaster", () => ({
  Toaster: () => <div data-testid="toaster">Toaster Component</div>,
}));

describe("LazyToaster", () => {
  let mockRequestIdleCallback: ReturnType<typeof vi.fn>;
  let mockCancelIdleCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockUsePathname.mockReturnValue("/about");

    // Mock requestIdleCallback
    mockRequestIdleCallback = vi.fn(
      (cb: IdleRequestCallback, options?: IdleRequestOptions) => {
        const timeout = options?.timeout ?? 0;
        const id = setTimeout(
          () => cb({ didTimeout: false, timeRemaining: () => 50 }),
          timeout,
        );
        return id as unknown as number;
      },
    );
    mockCancelIdleCallback = vi.fn((id: number) => {
      clearTimeout(id);
    });

    Object.defineProperty(window, "requestIdleCallback", {
      value: mockRequestIdleCallback,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "cancelIdleCallback", {
      value: mockCancelIdleCallback,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("renders null initially", () => {
      const { container } = render(<LazyToaster />);

      expect(container.firstChild).toBeNull();
    });

    it("renders Toaster after requestIdleCallback fires", async () => {
      render(<LazyToaster />);

      // Initially not rendered
      expect(screen.queryByTestId("toaster")).not.toBeInTheDocument();

      // Fire idle callback (idle timeout)
      await act(async () => {
        vi.advanceTimersByTime(FIVE_SECONDS_MS);
      });

      await act(async () => {
        await vi.dynamicImportSettled();
      });

      expect(screen.getByTestId("toaster")).toBeInTheDocument();
    });
  });

  describe("requestIdleCallback behavior", () => {
    it("registers requestIdleCallback with idle timeout", () => {
      render(<LazyToaster />);

      expect(mockRequestIdleCallback).toHaveBeenCalledWith(
        expect.any(Function),
        { timeout: FIVE_SECONDS_MS },
      );
    });

    it("cleans up on unmount", () => {
      const { unmount } = render(<LazyToaster />);

      unmount();

      expect(mockCancelIdleCallback).toHaveBeenCalled();
    });
  });

  describe("homepage delay behavior", () => {
    it("defers rendering longer on the homepage", async () => {
      mockUsePathname.mockReturnValue("/en");
      render(<LazyToaster />);

      await act(async () => {
        vi.advanceTimersByTime(FIVE_SECONDS_MS);
      });

      expect(screen.queryByTestId("toaster")).not.toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(THIRTY_SECONDS_MS);
        await vi.dynamicImportSettled();
      });

      expect(screen.getByTestId("toaster")).toBeInTheDocument();
    });
  });

  describe("fallback behavior", () => {
    it("uses setTimeout fallback when requestIdleCallback unavailable", async () => {
      // Remove requestIdleCallback from window completely
      // @ts-expect-error - intentionally deleting for test
      delete (window as Record<string, unknown>).requestIdleCallback;

      const setTimeoutSpy = vi.spyOn(global, "setTimeout");

      render(<LazyToaster />);

      expect(setTimeoutSpy).toHaveBeenCalledWith(
        expect.any(Function),
        FIVE_SECONDS_MS,
      );

      // Advance timer
      await act(async () => {
        vi.advanceTimersByTime(FIVE_SECONDS_MS);
        await vi.dynamicImportSettled();
      });

      expect(screen.getByTestId("toaster")).toBeInTheDocument();
    });

    it("cleans up setTimeout on unmount", () => {
      // Remove requestIdleCallback from window completely
      // @ts-expect-error - intentionally deleting for test
      delete (window as Record<string, unknown>).requestIdleCallback;

      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const { unmount } = render(<LazyToaster />);

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});

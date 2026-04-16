import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LazyTurnstile } from "@/components/forms/lazy-turnstile";

const { idleCallbacks, intersectionCallbacks, mockRequestIdleCallback } =
  vi.hoisted(() => ({
    idleCallbacks: [] as Array<() => void>,
    intersectionCallbacks: [] as Array<IntersectionObserverCallback>,
    mockRequestIdleCallback: vi.fn((callback: () => void) => {
      idleCallbacks.push(callback);
      return () => undefined;
    }),
  }));

vi.mock("@/lib/idle-callback", () => ({
  requestIdleCallback: mockRequestIdleCallback,
}));

vi.mock("next/dynamic", () => ({
  default: (_loader: unknown, _options: Record<string, unknown>) => {
    const MockTurnstile = ({
      action,
      size,
      theme,
      className,
      onSuccess,
      onError,
      onExpire,
      onLoad,
    }: {
      action?: string;
      size?: string;
      theme?: string;
      className?: string;
      onSuccess?: (token: string) => void;
      onError?: (reason?: string) => void;
      onExpire?: () => void;
      onLoad?: () => void;
    }) => (
      <div
        data-testid="turnstile-widget"
        data-action={action}
        data-size={size}
        data-theme={theme}
        data-classname={className}
      >
        <button
          type="button"
          data-testid="turnstile-load"
          onClick={() => onLoad?.()}
        >
          Load
        </button>
        <button
          type="button"
          data-testid="turnstile-success"
          onClick={() => onSuccess?.("lazy-token")}
        >
          Success
        </button>
        <button
          type="button"
          data-testid="turnstile-error"
          onClick={() => onError?.("lazy-error")}
        >
          Error
        </button>
        <button
          type="button"
          data-testid="turnstile-expire"
          onClick={() => onExpire?.()}
        >
          Expire
        </button>
      </div>
    );

    MockTurnstile.displayName = "MockTurnstile";
    return MockTurnstile;
  },
}));

describe("LazyTurnstile", () => {
  beforeEach(() => {
    idleCallbacks.length = 0;
    intersectionCallbacks.length = 0;

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "200px";
      readonly thresholds = [0];

      constructor(callback: IntersectionObserverCallback) {
        intersectionCallbacks.push(callback);
      }

      disconnect() {
        return undefined;
      }

      observe() {
        return undefined;
      }

      takeRecords() {
        return [];
      }

      unobserve() {
        return undefined;
      }
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  it("keeps a placeholder until idle or visibility triggers rendering", () => {
    render(<LazyTurnstile onSuccess={vi.fn()} />);

    expect(screen.queryByTestId("turnstile-widget")).not.toBeInTheDocument();
    expect(document.querySelector('[aria-hidden="true"]')).toBeTruthy();
    expect(mockRequestIdleCallback).toHaveBeenCalledTimes(1);
  });

  it("renders on idle and forwards props and callbacks", () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onExpire = vi.fn();
    const onLoad = vi.fn();

    render(
      <LazyTurnstile
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        onLoad={onLoad}
        action="newsletter_subscribe"
        size="compact"
        theme="auto"
        className="custom-turnstile"
      />,
    );

    act(() => {
      idleCallbacks[0]?.();
    });

    const widget = screen.getByTestId("turnstile-widget");
    expect(widget).toHaveAttribute("data-action", "newsletter_subscribe");
    expect(widget).toHaveAttribute("data-size", "compact");
    expect(widget).toHaveAttribute("data-theme", "auto");
    expect(widget).toHaveAttribute("data-classname", "custom-turnstile");

    fireEvent.click(screen.getByTestId("turnstile-load"));
    fireEvent.click(screen.getByTestId("turnstile-success"));
    fireEvent.click(screen.getByTestId("turnstile-error"));
    fireEvent.click(screen.getByTestId("turnstile-expire"));

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith("lazy-token");
    expect(onError).toHaveBeenCalledWith("lazy-error");
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("renders when the wrapper enters the viewport", () => {
    render(<LazyTurnstile onSuccess={vi.fn()} />);

    act(() => {
      intersectionCallbacks[0]?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByTestId("turnstile-widget")).toBeInTheDocument();
  });
});

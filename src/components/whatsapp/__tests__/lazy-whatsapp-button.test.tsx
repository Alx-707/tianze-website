import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { THIRTY_SECONDS_MS } from "@/constants/time";
import { LazyWhatsAppButton } from "@/components/whatsapp/lazy-whatsapp-button";

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

vi.mock("@/components/whatsapp/whatsapp-floating-button", () => ({
  WhatsAppFloatingButton: ({ number }: { number: string }) => (
    <div data-testid="whatsapp-floating-button">{number}</div>
  ),
}));

describe("LazyWhatsAppButton", () => {
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
    const { rerender } = render(<LazyWhatsAppButton number="+1234567890" />);

    expect(
      screen.queryByTestId("whatsapp-floating-button"),
    ).not.toBeInTheDocument();

    mockUseIdleRender.mockReturnValue(true);
    rerender(<LazyWhatsAppButton number="+1234567890" />);

    await act(async () => {
      await vi.dynamicImportSettled();
    });

    expect(screen.getByTestId("whatsapp-floating-button")).toHaveTextContent(
      "+1234567890",
    );
  });

  it("waits for the homepage delay before importing the WhatsApp button", async () => {
    mockUsePathname.mockReturnValue("/zh");

    render(<LazyWhatsAppButton number="+1234567890" />);

    await act(async () => {
      vi.advanceTimersByTime(THIRTY_SECONDS_MS - 1);
      await vi.dynamicImportSettled();
    });

    expect(
      screen.queryByTestId("whatsapp-floating-button"),
    ).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.dynamicImportSettled();
    });

    expect(screen.getByTestId("whatsapp-floating-button")).toHaveTextContent(
      "+1234567890",
    );
  });
});

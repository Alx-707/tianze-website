"use client";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useContextualMessage } from "../use-contextual-message";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

describe("useContextualMessage", () => {
  const DEFAULT_MESSAGE = "Hello, I have a question.";

  beforeEach(() => {
    vi.clearAllMocks();
    // Default window.location
    Object.defineProperty(window, "location", {
      value: { href: "https://example.com/page" },
      writable: true,
    });
  });

  it("returns original message with page URL on non-product pages", async () => {
    const { usePathname } = await import("next/navigation");
    vi.mocked(usePathname).mockReturnValue("/about");

    const { result } = renderHook(() => useContextualMessage(DEFAULT_MESSAGE));

    expect(result.current).toBe(
      `${DEFAULT_MESSAGE}\n\nPage: https://example.com/page`,
    );
  });

  it("appends product slug on /products/{slug} paths", async () => {
    const { usePathname } = await import("next/navigation");
    vi.mocked(usePathname).mockReturnValue("/products/pvc-conduit");
    Object.defineProperty(window, "location", {
      value: { href: "https://example.com/products/pvc-conduit" },
      writable: true,
    });

    const { result } = renderHook(() => useContextualMessage(DEFAULT_MESSAGE));

    expect(result.current).toContain("Product: pvc-conduit");
    expect(result.current).toContain(
      "Page: https://example.com/products/pvc-conduit",
    );
  });

  it("handles nested product paths correctly", async () => {
    const { usePathname } = await import("next/navigation");
    vi.mocked(usePathname).mockReturnValue("/products/category/sub-product");

    const { result } = renderHook(() => useContextualMessage(DEFAULT_MESSAGE));

    // Should extract only the first segment after /products/
    expect(result.current).toContain("Product: category");
  });

  it("handles /products/ without slug", async () => {
    const { usePathname } = await import("next/navigation");
    vi.mocked(usePathname).mockReturnValue("/products/");

    const { result } = renderHook(() => useContextualMessage(DEFAULT_MESSAGE));

    // Empty slug - should fall through to page URL only
    expect(result.current).not.toContain("Product:");
    expect(result.current).toContain("Page:");
  });

  it("handles home page", async () => {
    const { usePathname } = await import("next/navigation");
    vi.mocked(usePathname).mockReturnValue("/");
    Object.defineProperty(window, "location", {
      value: { href: "https://example.com/" },
      writable: true,
    });

    const { result } = renderHook(() => useContextualMessage(DEFAULT_MESSAGE));

    expect(result.current).toBe(
      `${DEFAULT_MESSAGE}\n\nPage: https://example.com/`,
    );
  });

  it("handles contact page", async () => {
    const { usePathname } = await import("next/navigation");
    vi.mocked(usePathname).mockReturnValue("/contact");
    Object.defineProperty(window, "location", {
      value: { href: "https://example.com/contact" },
      writable: true,
    });

    const { result } = renderHook(() => useContextualMessage(DEFAULT_MESSAGE));

    expect(result.current).toBe(
      `${DEFAULT_MESSAGE}\n\nPage: https://example.com/contact`,
    );
  });

  it("preserves original message content", async () => {
    const { usePathname } = await import("next/navigation");
    vi.mocked(usePathname).mockReturnValue("/about");

    const customMessage = "Custom inquiry about pricing";
    const { result } = renderHook(() => useContextualMessage(customMessage));

    expect(result.current).toContain(customMessage);
  });

  it("handles locale prefixed paths", async () => {
    const { usePathname } = await import("next/navigation");
    vi.mocked(usePathname).mockReturnValue("/en/products/bending-machine");
    Object.defineProperty(window, "location", {
      value: { href: "https://example.com/en/products/bending-machine" },
      writable: true,
    });

    const { result } = renderHook(() => useContextualMessage(DEFAULT_MESSAGE));

    expect(result.current).toContain("Product: bending-machine");
  });
});

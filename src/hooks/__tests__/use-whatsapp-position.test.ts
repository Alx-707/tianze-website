"use client";

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useWhatsAppPosition } from "../use-whatsapp-position";

const STORAGE_KEY = "whatsapp-button-position";

describe("useWhatsAppPosition", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("returns default position when localStorage is empty", () => {
    const { result } = renderHook(() => useWhatsAppPosition());

    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });

  it("reads initial position from localStorage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: 100, y: 200 }));

    const { result } = renderHook(() => useWhatsAppPosition());

    expect(result.current.position).toEqual({ x: 100, y: 200 });
  });

  it("returns default position on JSON parse error", () => {
    localStorage.setItem(STORAGE_KEY, "invalid-json");

    const { result } = renderHook(() => useWhatsAppPosition());

    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });

  it("persistPosition saves to localStorage", () => {
    const { result } = renderHook(() => useWhatsAppPosition());

    act(() => {
      result.current.persistPosition(150, 250);
    });

    expect(result.current.position).toEqual({ x: 150, y: 250 });
    expect(localStorage.getItem(STORAGE_KEY)).toBe(
      JSON.stringify({ x: 150, y: 250 }),
    );
  });

  it("persistPosition dispatches storage event", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    const { result } = renderHook(() => useWhatsAppPosition());

    act(() => {
      result.current.persistPosition(50, 75);
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "storage",
        key: STORAGE_KEY,
      }),
    );
  });

  it("setLocalPosition updates position immediately", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: 10, y: 20 }));
    const { result } = renderHook(() => useWhatsAppPosition());

    act(() => {
      result.current.setLocalPosition({ x: 300, y: 400 });
    });

    expect(result.current.position).toEqual({ x: 300, y: 400 });
    // localStorage should NOT be updated by setLocalPosition
    expect(localStorage.getItem(STORAGE_KEY)).toBe(
      JSON.stringify({ x: 10, y: 20 }),
    );
  });

  it("local position takes priority over stored position", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: 10, y: 20 }));
    const { result } = renderHook(() => useWhatsAppPosition());

    // Initially reads from localStorage
    expect(result.current.position).toEqual({ x: 10, y: 20 });

    // Set local position
    act(() => {
      result.current.setLocalPosition({ x: 500, y: 600 });
    });

    // Local position takes priority
    expect(result.current.position).toEqual({ x: 500, y: 600 });
  });

  it("handles localStorage errors gracefully (private mode)", () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new Error("QuotaExceededError");
    });

    const { result } = renderHook(() => useWhatsAppPosition());

    // Should not throw
    expect(() => {
      act(() => {
        result.current.persistPosition(100, 200);
      });
    }).not.toThrow();

    // Position should still be updated locally
    expect(result.current.position).toEqual({ x: 100, y: 200 });

    localStorage.setItem = originalSetItem;
  });

  it("clears local position when set to null", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: 10, y: 20 }));
    const { result } = renderHook(() => useWhatsAppPosition());

    // Set local position
    act(() => {
      result.current.setLocalPosition({ x: 500, y: 600 });
    });
    expect(result.current.position).toEqual({ x: 500, y: 600 });

    // Clear local position - should fall back to stored
    act(() => {
      result.current.setLocalPosition(null);
    });
    expect(result.current.position).toEqual({ x: 10, y: 20 });
  });
});

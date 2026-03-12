"use client";

import { useSyncExternalStore } from "react";
import { BREAKPOINT_LG } from "@/constants/breakpoints";

type ViewportMode = "desktop" | "mobile";

function matchesViewport(mode: ViewportMode): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return mode === "desktop"
    ? window.innerWidth >= BREAKPOINT_LG
    : window.innerWidth < BREAKPOINT_LG;
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

export function useViewportMatch(mode: ViewportMode): boolean {
  return useSyncExternalStore(
    subscribe,
    () => matchesViewport(mode),
    () => false,
  );
}

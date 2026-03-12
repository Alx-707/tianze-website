"use client";

import { type ReactNode } from "react";
import { useViewportMatch } from "@/hooks/use-viewport-match";

interface DesktopDecorationGateProps {
  children: ReactNode;
}

/**
 * Avoids sending decorative desktop-only DOM in the initial HTML response.
 * This keeps mobile/CI first paint focused on content, then mounts the grid
 * decorations after hydration on large viewports only.
 */
export function DesktopDecorationGate({
  children,
}: DesktopDecorationGateProps) {
  const shouldRender = useViewportMatch("desktop");

  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}

"use client";

import { type ReactNode } from "react";
import { useViewportMatch } from "@/hooks/use-viewport-match";

interface ViewportClientGateProps {
  children: ReactNode;
  mode: "desktop" | "mobile";
}

export function ViewportClientGate({
  children,
  mode,
}: ViewportClientGateProps) {
  const shouldRender = useViewportMatch(mode);

  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}

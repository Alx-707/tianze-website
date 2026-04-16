"use client";

import { useEffect } from "react";
import { isRuntimeDevelopment } from "@/lib/env";

export function ReactGrabLoader() {
  useEffect(() => {
    if (isRuntimeDevelopment()) {
      import("react-grab").catch((err) => {
        console.error("Failed to load react-grab:", err);
      });
    }
  }, []);

  return null;
}

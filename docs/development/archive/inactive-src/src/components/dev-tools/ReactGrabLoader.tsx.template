"use client";

import { useEffect } from "react";
import { isPublicRuntimeDevelopment } from "@/lib/public-env";

export function ReactGrabLoader() {
  useEffect(() => {
    if (isPublicRuntimeDevelopment()) {
      import("react-grab").catch((err) => {
        console.error("Failed to load react-grab:", err);
      });
    }
  }, []);

  return null;
}

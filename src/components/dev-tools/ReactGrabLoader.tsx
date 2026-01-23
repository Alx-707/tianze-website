"use client";

import { useEffect } from "react";

export function ReactGrabLoader() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("react-grab").catch((err) => {
        console.error("Failed to load react-grab:", err);
      });
    }
  }, []);

  return null;
}

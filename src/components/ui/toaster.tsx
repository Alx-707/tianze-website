"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Toaster component using Sonner
 * Integrated with the project's theme system and internationalization
 */
export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  // Handle exactOptionalPropertyTypes by building props conditionally
  const baseProps = {
    className: "toaster group",
    toastOptions: {
      classNames: {
        toast:
          "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        description: "group-[.toast]:text-muted-foreground",
        actionButton:
          "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButton:
          "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      },
    },
    ...props,
  };

  // Only add theme if it's defined and valid
  const validTheme: "light" | "dark" | "system" =
    theme && ["light", "dark", "system"].includes(theme)
      ? (theme as "light" | "dark" | "system")
      : "system";

  return <Sonner {...baseProps} theme={validTheme} />;
}

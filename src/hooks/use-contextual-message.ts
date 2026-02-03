"use client";

import { usePathname } from "next/navigation";

/**
 * Generate contextual default message based on current page.
 * Adds page URL context and product info when on product pages.
 */
export function useContextualMessage(defaultMessage: string): string {
  const pathname = usePathname();

  // If on product page, add product context
  if (pathname.includes("/products/")) {
    const productSlug = pathname.split("/products/")[1]?.split("/")[0];
    if (productSlug) {
      return `${defaultMessage}\n\nProduct: ${productSlug}\nPage: ${typeof window !== "undefined" ? window.location.href : ""}`;
    }
  }

  // Add page URL for context
  if (typeof window !== "undefined") {
    return `${defaultMessage}\n\nPage: ${window.location.href}`;
  }

  return defaultMessage;
}

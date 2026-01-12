import localFont from "next/font/local";

/**
 * IBM Plex Sans font configuration
 * Manufacturing-First Design System v2.1
 *
 * Why IBM Plex over Geist:
 * - Industrial heritage (designed by IBM for engineering contexts)
 * - Excellent CJK compatibility
 * - Timeless design (2017) vs trendy (Geist 2024)
 * - Differentiates from "AI template" aesthetic
 *
 * Using local fonts for Turbopack compatibility
 */
export const ibmPlexSans = localFont({
  src: [
    {
      path: "./ibm-plex-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./ibm-plex-sans-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./ibm-plex-sans-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./ibm-plex-sans-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

/**
 * Get font class names string for body element
 * Returns CSS variable class for IBM Plex Sans
 */
export function getFontClassNames(): string {
  return ibmPlexSans.variable;
}

import localFont from "next/font/local";

/**
 * Open Sans - Twitter Theme Font
 *
 * 友好现代的无衬线字体，适合社交媒体风格
 * Latin subset with 4 weights: 400, 500, 600, 700
 */
export const openSans = localFont({
  src: [
    {
      path: "./open-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./open-sans-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./open-sans-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./open-sans-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-open-sans",
  display: "swap",
  preload: true,
});

// Re-export for backwards compatibility
export const ibmPlexSans = openSans;

/**
 * Get font class names string for body element
 * Returns CSS variable class for Open Sans
 */
export function getFontClassNames(): string {
  return openSans.variable;
}

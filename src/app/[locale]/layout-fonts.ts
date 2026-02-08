import { Figtree, JetBrains_Mono } from "next/font/google";

/**
 * Figtree — Primary typeface
 *
 * Geometric sans-serif with technical precision.
 * Weights: 400 (body), 500 (medium), 600 (semi), 700 (bold), 800 (extra-bold for H1)
 */
export const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});

/**
 * JetBrains Mono — Monospace typeface
 *
 * Used for spec values, step numbers, standards, proof metrics.
 * Weights: 400, 500
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// Backwards compatibility alias
export const ibmPlexSans = figtree;

/**
 * Get font class names string for html element.
 * Returns CSS variable classes for Figtree + JetBrains Mono.
 */
export function getFontClassNames(): string {
  return `${figtree.variable} ${jetbrainsMono.variable}`;
}

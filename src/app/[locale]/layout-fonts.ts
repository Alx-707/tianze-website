import { Figtree } from "next/font/google";

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
 * Monospace fallback token
 *
 * Used for spec values, step numbers, standards, proof metrics.
 * We intentionally avoid a network-fetched secondary font here so builds
 * remain stable when Google Fonts is unreachable in CI or pre-push hooks.
 */
export const jetbrainsMono = {
  variable: "--font-jetbrains-mono",
  className: "",
  style: {
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
} as const;

/**
 * Get font class names string for html element.
 * Returns CSS variable classes for Figtree + JetBrains Mono.
 */
export function getFontClassNames(): string {
  return `${figtree.variable} ${jetbrainsMono.variable}`;
}

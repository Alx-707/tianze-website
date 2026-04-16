/**
 * Turnstile widget layout constants.
 * Based on Cloudflare's documented widget sizes.
 */
export const TURNSTILE_WIDGET_HEIGHT_PX = {
  normal: 65,
  compact: 140,
} as const;

export const TURNSTILE_PLACEHOLDER_HEIGHT_CSS_VAR =
  "--turnstile-placeholder-height" as const;

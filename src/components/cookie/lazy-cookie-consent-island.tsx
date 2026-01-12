"use client";

import { useIdleRender } from "@/hooks/use-idle-render";
import { CookieConsentIsland } from "@/components/cookie/cookie-consent-island";

/**
 * Lazy Cookie Consent Island
 *
 * Defers CookieConsentProvider initialization until after the main thread is idle,
 * reducing Total Blocking Time (TBT) during initial page load.
 *
 * The cookie consent banner is non-critical for initial render,
 * so deferring it improves Core Web Vitals without impacting UX.
 */
export function LazyCookieConsentIsland() {
  const shouldRender = useIdleRender();

  if (!shouldRender) {
    return null;
  }

  return <CookieConsentIsland />;
}

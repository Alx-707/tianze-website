"use client";

import { useEffect } from "react";

const ATTRIBUTION_PARAM_PATTERN = /(?:^|[?&])(utm_|gclid=|fbclid=|msclkid=)/i;

export function loadAttributionModule() {
  return import("@/lib/utm");
}

export function shouldLoadAttribution(search: string) {
  return ATTRIBUTION_PARAM_PATTERN.test(search);
}

/**
 * Attribution Bootstrap
 *
 * P1-1 Fix: Captures UTM parameters and click IDs on initial page load.
 * Uses first-touch attribution model - only stores if no existing data.
 * Renders nothing; exists solely for the side effect.
 *
 * This consolidates storeAttributionData() calls from 4 separate components
 * into a single location in the layout.
 */
export function AttributionBootstrap() {
  useEffect(() => {
    if (!shouldLoadAttribution(window.location.search)) {
      return undefined;
    }

    let cancelled = false;

    loadAttributionModule()
      .then(({ storeAttributionData }) => {
        if (!cancelled) {
          storeAttributionData();
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

const ATTRIBUTION_PARAM_PATTERN = /(?:^|[?&])(utm_|gclid=|fbclid=|msclkid=)/i;

export function loadAttributionModule() {
  return import("@/lib/utm");
}

export function shouldLoadAttribution(search: string) {
  return ATTRIBUTION_PARAM_PATTERN.test(search);
}

export function AttributionBootstrap() {
  useEffect(() => {
    if (!shouldLoadAttribution(window.location.search)) {
      return undefined;
    }

    let cancelled = false;
    let removeFlushListeners: (() => void) | undefined;

    loadAttributionModule()
      .then(({ flushPendingAttribution, storeAttributionData }) => {
        if (!cancelled) {
          storeAttributionData();

          const flushEvents = ["storage", "visibilitychange"] as const;

          for (const eventName of flushEvents) {
            window.addEventListener(eventName, flushPendingAttribution);
          }

          removeFlushListeners = () => {
            for (const eventName of flushEvents) {
              window.removeEventListener(eventName, flushPendingAttribution);
            }
          };
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      removeFlushListeners?.();
    };
  }, []);

  return null;
}

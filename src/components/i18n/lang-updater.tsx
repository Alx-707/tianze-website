"use client";

import { useEffect } from "react";

interface LangUpdaterProps {
  locale: string;
}

/**
 * Client component that updates the html[lang] attribute after hydration.
 *
 * In PPR (Partial Prerendering) mode, the root layout is statically generated
 * with a default locale (e.g., "en"). This component corrects the lang attribute
 * on the client side once hydration completes.
 *
 * @see docs/known-issue/cache-components-plan.md for PPR constraints
 */
export function LangUpdater({ locale }: LangUpdaterProps) {
  useEffect(() => {
    if (document.documentElement.lang !== locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return null;
}

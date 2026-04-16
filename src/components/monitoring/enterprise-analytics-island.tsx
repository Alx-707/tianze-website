"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useCookieConsentOptional } from "@/lib/cookie-consent";
import { getRuntimeEnvString, isRuntimeProduction } from "@/lib/env";

const Analytics = dynamic(
  () => import("@vercel/analytics/next").then((mod) => mod.Analytics),
  { ssr: false },
);

const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false },
);

function ensureGa4QueueInitialized(measurementId: string): void {
  if (!Array.isArray(window.dataLayer)) {
    window.dataLayer = [];
  }
  if (typeof window.gtag !== "function") {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer.push(args);
    };
  }
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    page_path: window.location.pathname,
    send_page_view: false,
  });
}

export function EnterpriseAnalyticsIsland() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isProd = isRuntimeProduction();
  const gaMeasurementId = getRuntimeEnvString("NEXT_PUBLIC_GA_MEASUREMENT_ID");
  const isVercel =
    getRuntimeEnvString("NEXT_PUBLIC_DEPLOYMENT_PLATFORM") === "vercel";
  const cookieConsent = useCookieConsentOptional();

  const analyticsAllowed = cookieConsent
    ? cookieConsent.ready
      ? cookieConsent.consent.analytics
      : false
    : true;

  const gaEnabled = Boolean(gaMeasurementId) && analyticsAllowed && isProd;
  const gaInitRef = useRef(false);

  useEffect(() => {
    if (!gaEnabled || gaInitRef.current) return;
    ensureGa4QueueInitialized(gaMeasurementId!);
    gaInitRef.current = true;
  }, [gaEnabled, gaMeasurementId]);

  useEffect(() => {
    if (!gaEnabled || typeof window.gtag !== "function") return;
    const url =
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    window.gtag("config", gaMeasurementId!, {
      page_path: url,
      page_location: window.location.href,
    });
  }, [pathname, searchParams, gaEnabled, gaMeasurementId]);

  if (!analyticsAllowed) return null;

  return (
    <>
      {gaEnabled && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
      )}
      {isProd && isVercel && <Analytics />}
      {isProd && isVercel && <SpeedInsights />}
    </>
  );
}

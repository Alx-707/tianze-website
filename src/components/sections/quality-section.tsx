"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHead } from "@/components/ui/section-head";

const COMMITMENT_KEYS = [
  "commitment1",
  "commitment2",
  "commitment3",
  "commitment4",
  "commitment5",
] as const;

const CERT_KEYS = ["cert1", "cert2", "cert3", "cert4"] as const;

/** Simple inline SVG icons for each commitment slot. */
const COMMITMENT_ICONS: Record<string, React.ReactNode> = {
  commitment1: (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  commitment2: (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  commitment3: (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  commitment4: (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  commitment5: (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
};

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-primary"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function QualitySection() {
  const t = useTranslations("home.quality");

  return (
    <section className="py-14 md:py-[72px]">
      <ScrollReveal className="mx-auto max-w-[1080px] px-6">
        <SectionHead title={t("title")} subtitle={t("subtitle")} />

        {/* Commitments grid */}
        <div className="grid grid-cols-1 gap-[2px] overflow-hidden rounded-lg border bg-border sm:grid-cols-3 lg:grid-cols-5">
          {COMMITMENT_KEYS.map((key) => (
            <div key={key} className="bg-white p-5">
              <div className="mb-3">{COMMITMENT_ICONS[key]}</div>
              <strong className="block text-sm">{t(`${key}.title`)}</strong>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {t(`${key}.desc`)}
              </p>
            </div>
          ))}
        </div>

        {/* Cert badges */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {CERT_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-center gap-1.5 rounded-md bg-muted/50 px-3 py-1.5 text-[13px] font-medium"
            >
              <CheckIcon />
              <span>{t(key)}</span>
            </div>
          ))}
        </div>

        {/* Logo wall placeholder */}
        <div className="mt-8 flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-border">
          <span className="text-sm text-muted-foreground">{t("logoWall")}</span>
        </div>
      </ScrollReveal>
    </section>
  );
}

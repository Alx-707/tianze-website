"use client";

import { useTranslations } from "next-intl";

import { AnimatedCounter, formatters } from "@/components/ui/animated-counter";
import { Button } from "@/components/ui/button";
import { HeroGuideOverlay } from "@/components/grid";

const COUNTUP_DURATION = 1200;
const PROOF_COUNTRIES_END = 20;
const PROOF_EST_END = 2006;

interface ProofItemConfig {
  valueKey: string;
  labelKey: string;
  countUp?: { end: number; suffix?: string };
}

const PROOF_ITEMS: ProofItemConfig[] = [
  {
    valueKey: "hero.proof.countries",
    labelKey: "hero.proof.countriesLabel",
    countUp: { end: PROOF_COUNTRIES_END, suffix: "+" },
  },
  { valueKey: "hero.proof.range", labelKey: "hero.proof.rangeLabel" },
  { valueKey: "hero.proof.production", labelKey: "hero.proof.productionLabel" },
  {
    valueKey: "hero.proof.est",
    labelKey: "hero.proof.estLabel",
    countUp: { end: PROOF_EST_END },
  },
];

function HeroEyebrow({ text }: { text: string }) {
  return (
    <div className="hero-stagger-1 flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
      <span className="text-[13px] font-semibold uppercase tracking-[0.04em] text-primary">
        {text}
      </span>
    </div>
  );
}

function ProofBar({ t }: { t: ReturnType<typeof useTranslations<"home">> }) {
  return (
    <div className="hero-stagger-5 mt-7 flex flex-wrap gap-6 border-t border-border-light pt-6 md:gap-8">
      {PROOF_ITEMS.map(({ valueKey, labelKey, countUp }) => (
        <div key={valueKey} className="flex flex-col gap-1.5">
          <span className="font-mono text-xl font-medium">
            {countUp ? (
              <AnimatedCounter
                to={countUp.end}
                duration={COUNTUP_DURATION}
                formatter={
                  countUp.suffix
                    ? (v: number) => `${formatters.default(v)}${countUp.suffix}`
                    : formatters.default
                }
                triggerOnVisible
                role="text"
                aria-label={t(valueKey)}
              />
            ) : (
              t(valueKey)
            )}
          </span>
          <span className="text-[13px] text-muted-foreground">
            {t(labelKey)}
          </span>
        </div>
      ))}
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="hero-stagger-6 grid grid-cols-2 grid-rows-[180px_160px] gap-3">
      <div className="col-span-2 rounded-lg bg-white shadow-border" />
      <div className="rounded-lg bg-white shadow-border" />
      <div className="rounded-lg bg-white shadow-border" />
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("home");

  return (
    <section
      data-testid="hero-section"
      className="relative px-6 py-10 pb-14 md:py-16 md:pb-[72px]"
    >
      <HeroGuideOverlay />
      <div className="relative z-[1] mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-12 md:grid-cols-2">
        {/* Left column — Copy */}
        <div className="flex flex-col">
          <HeroEyebrow text={t("hero.eyebrow")} />

          <h1 className="hero-stagger-2 mt-4 text-[36px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[48px] md:leading-[1.0] md:tracking-[-0.05em]">
            {t("hero.title")}
          </h1>

          <p className="hero-stagger-3 mt-4 max-w-[480px] text-lg text-muted-foreground">
            {t("hero.subtitle")}
          </p>

          <div className="hero-stagger-4 mt-7 flex flex-wrap gap-3">
            <Button>{t("hero.cta.primary")}</Button>
            <Button variant="secondary">{t("hero.cta.secondary")}</Button>
          </div>

          <ProofBar t={t} />
        </div>

        {/* Right column — Visual grid */}
        <HeroVisual />
      </div>
    </section>
  );
}

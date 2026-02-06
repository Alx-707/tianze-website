"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const PROOF_ITEMS = [
  { valueKey: "hero.proof.countries", labelKey: "hero.proof.countriesLabel" },
  { valueKey: "hero.proof.range", labelKey: "hero.proof.rangeLabel" },
  { valueKey: "hero.proof.production", labelKey: "hero.proof.productionLabel" },
  { valueKey: "hero.proof.est", labelKey: "hero.proof.estLabel" },
] as const;

function HeroEyebrow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
      <span className="text-[13px] font-semibold uppercase tracking-[0.04em] text-primary">
        {text}
      </span>
    </div>
  );
}

function ProofBar({ t }: { t: ReturnType<typeof useTranslations<"home">> }) {
  return (
    <div className="mt-7 flex flex-wrap gap-6 border-t border-border-light pt-6 md:gap-8">
      {PROOF_ITEMS.map(({ valueKey, labelKey }) => (
        <div key={valueKey} className="flex flex-col gap-1.5">
          <span className="font-mono text-xl font-medium">{t(valueKey)}</span>
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
    <div className="grid grid-cols-2 grid-rows-[180px_160px] gap-3">
      <div className="col-span-2 rounded-lg border border-border bg-white" />
      <div className="rounded-lg border border-border bg-white" />
      <div className="rounded-lg border border-border bg-white" />
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("home");

  return (
    <section className="px-6 py-10 pb-14 md:py-16 md:pb-[72px]">
      <div className="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-12 md:grid-cols-2">
        {/* Left column — Copy */}
        <div className="flex flex-col">
          <HeroEyebrow text={t("hero.eyebrow")} />

          <h1 className="mt-4 text-[36px] font-extrabold leading-[1.12] tracking-[-0.025em] md:text-[44px]">
            {t("hero.title")}
          </h1>

          <p className="mt-4 max-w-[480px] text-lg text-muted-foreground">
            {t("hero.subtitle")}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
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

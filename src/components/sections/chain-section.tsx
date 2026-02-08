"use client";

import { useTranslations } from "next-intl";
import { SectionHead } from "@/components/ui/section-head";

const STEP_COUNT = 5;
const STAT_COUNT = 3;

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6 10l3 3 5-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepCard({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-background p-6 transition-colors hover:bg-[var(--primary-50)]">
      <span className="font-mono text-sm text-muted-foreground">{num}</span>
      <h3 className="mt-2 text-[15px] font-semibold leading-snug">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

function StatCard({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--success-light)] bg-[var(--success-light)] px-5 py-4">
      <span className="text-green-600">
        <CheckIcon />
      </span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

export function ChainSection() {
  const t = useTranslations("home");

  const steps = Array.from({ length: STEP_COUNT }, (_, i) => {
    const key = `step${String(i + 1)}`;
    return {
      num: String(i + 1).padStart(2, "0"),
      title: t(`chain.${key}.title`),
      desc: t(`chain.${key}.desc`),
    };
  });

  const stats = Array.from({ length: STAT_COUNT }, (_, i) =>
    t(`chain.stat${String(i + 1)}`),
  );

  return (
    <section className="section-divider py-14 md:py-[72px]">
      <div className="mx-auto max-w-[1080px] px-6">
        <SectionHead title={t("chain.title")} subtitle={t("chain.subtitle")} />

        {/* Steps grid */}
        <div className="overflow-hidden rounded-lg border bg-border">
          <div className="grid grid-cols-1 gap-[2px] sm:grid-cols-3 lg:grid-cols-5">
            {steps.map((step) => (
              <StepCard key={step.num} {...step} />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((text) => (
            <StatCard key={text} text={text} />
          ))}
        </div>
      </div>
    </section>
  );
}

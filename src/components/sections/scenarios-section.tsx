"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHead } from "@/components/ui/section-head";

const SCENARIO_KEYS = ["item1", "item2", "item3"] as const;

export function ScenariosSection() {
  const t = useTranslations("home.scenarios");

  return (
    <section className="py-14 md:py-[72px]">
      <ScrollReveal className="mx-auto max-w-[1080px] px-6">
        <SectionHead title={t("title")} subtitle={t("subtitle")} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {SCENARIO_KEYS.map((key, index) => (
            <ScrollReveal key={key} staggerIndex={index} staggerInterval={120}>
              <div className="group overflow-hidden rounded-lg bg-white shadow-card transition-shadow hover:shadow-card-hover">
                {/* Image placeholder */}
                <div className="h-40 bg-gradient-to-br from-muted to-muted/60" />

                {/* Body */}
                <div className="p-5">
                  <h3 className="text-[18px] font-bold leading-snug">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(`${key}.desc`)}
                  </p>

                  {/* Quote */}
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-[13px] italic text-muted-foreground">
                      {t(`${key}.quote`)}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

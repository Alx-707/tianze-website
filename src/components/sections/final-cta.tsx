"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function FinalCTA() {
  const t = useTranslations("home.finalCta");

  return (
    <section className="bg-primary py-14 md:py-[72px]">
      <ScrollReveal
        direction="fade"
        className="mx-auto max-w-[1080px] px-6 text-center"
      >
        <h2 className="text-[36px] font-bold leading-[1.2] tracking-[-0.02em] text-white">
          {t("title")}
        </h2>

        <p className="mx-auto mt-4 max-w-[560px] text-white/75">
          {t("description")}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="on-dark" size="lg">
            {t("primary")}
          </Button>
          <Button variant="ghost-dark" size="lg">
            {t("secondary")}
          </Button>
        </div>

        <p className="mt-6 text-[13px] text-white/50">{t("trust")}</p>
      </ScrollReveal>
    </section>
  );
}

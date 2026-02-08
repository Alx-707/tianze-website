"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function SampleCTA() {
  const t = useTranslations("home");

  return (
    <section className="section-divider py-14 md:py-[72px]">
      <ScrollReveal className="mx-auto max-w-[1080px] px-6">
        <div className="flex flex-col items-start gap-6 rounded-xl border border-[var(--primary-light)] bg-[var(--primary-light)] p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold leading-tight">
              {t("sample.title")}
            </h2>
            <p className="mt-2 max-w-[480px] text-sm leading-relaxed text-muted-foreground">
              {t("sample.description")}
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/contact">{t("sample.cta")}</Link>
          </Button>
        </div>
      </ScrollReveal>
    </section>
  );
}

import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { DesktopDecorationGate } from "@/components/grid/desktop-decoration-gate";
import { HeroGuideOverlay } from "@/components/grid";
import { Link } from "@/i18n/routing";

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

function ProofLine({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  return (
    <div className="hero-stagger-5 mt-7 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border-light pt-5 font-mono text-[13px] text-muted-foreground">
      <span>
        <span className="font-semibold text-foreground">
          {t("hero.proof.est")}
        </span>
      </span>
      <span aria-hidden="true" className="text-border">
        ·
      </span>
      <span>
        <span className="font-semibold text-foreground">
          {t("hero.proof.countries")}
        </span>{" "}
        {t("hero.proof.countriesLabel")}
      </span>
      <span aria-hidden="true" className="text-border">
        ·
      </span>
      <span>
        <span className="font-semibold text-foreground">
          {t("hero.proof.range")}
        </span>{" "}
        {t("hero.proof.rangeLabel")}
      </span>
      <span aria-hidden="true" className="text-border">
        ·
      </span>
      <span>
        <span className="font-semibold text-foreground">
          {t("hero.proof.production")}
        </span>{" "}
        {t("hero.proof.productionLabel")}
      </span>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="hero-stagger-6 grid grid-cols-2 grid-rows-[180px_160px] gap-3">
      <div className="col-span-2 rounded-lg bg-card shadow-border" />
      <div className="rounded-lg bg-card shadow-border" />
      <div className="rounded-lg bg-card shadow-border" />
    </div>
  );
}

export async function HeroSection() {
  const t = await getTranslations("home");

  return (
    <section
      data-testid="hero-section"
      className="relative px-6 py-10 pb-14 md:py-16 md:pb-[72px]"
    >
      <DesktopDecorationGate>
        <HeroGuideOverlay />
      </DesktopDecorationGate>
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
            <Button asChild>
              <Link href="/contact" prefetch={false}>
                {t("hero.cta.primary")}
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/products" prefetch={false}>
                {t("hero.cta.secondary")}
              </Link>
            </Button>
          </div>

          <ProofLine t={t} />
        </div>

        {/* Right column — Visual grid */}
        <HeroVisual />
      </div>
    </section>
  );
}

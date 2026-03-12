import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function SampleCTA() {
  const t = await getTranslations("home");

  return (
    <section className="section-divider py-14 md:py-[72px]">
      <div className="mx-auto max-w-[1080px] px-6">
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
            <Link href="/contact" prefetch={false}>
              {t("sample.cta")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export async function FinalCTA() {
  const t = await getTranslations("home.finalCta");

  return (
    <section className="bg-primary py-14 md:py-[72px]">
      <div className="mx-auto max-w-[1080px] px-6 text-center">
        <h2 className="text-[36px] font-bold leading-[1.2] tracking-[-0.02em] text-white">
          {t("title")}
        </h2>

        <p className="mx-auto mt-4 max-w-[560px] text-white/75">
          {t("description")}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="on-dark" size="lg" asChild>
            <Link href="/contact" prefetch={false}>
              {t("primary")}
            </Link>
          </Button>
          <Button variant="ghost-dark" size="lg" asChild>
            <Link href="/products" prefetch={false}>
              {t("secondary")}
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-[13px] text-white/50">{t("trust")}</p>
      </div>
    </section>
  );
}

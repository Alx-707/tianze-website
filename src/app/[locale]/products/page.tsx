import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  generateMetadataForPath,
  type Locale as SeoLocale,
} from "@/lib/seo-metadata";
import {
  PRODUCT_CATALOG,
  getFamiliesForMarket,
} from "@/constants/product-catalog";
import { CatalogBreadcrumb } from "@/components/products/catalog-breadcrumb";
import { MarketSeriesCard } from "@/components/products/market-series-card";
import { Link } from "@/i18n/routing";
import { generateLocaleStaticParams } from "@/app/[locale]/generate-static-params";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;

  return generateMetadataForPath({
    locale: locale as SeoLocale,
    pageType: "products",
    path: "/products",
  });
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "catalog" });

  const pvcMarkets = PRODUCT_CATALOG.markets.filter(
    (m) => m.slug !== "pneumatic-tube-systems",
  );
  const pneumaticMarket = PRODUCT_CATALOG.markets.find(
    (m) => m.slug === "pneumatic-tube-systems",
  );

  return (
    <main className="mx-auto max-w-[1080px] px-6 py-8 md:py-12">
      <CatalogBreadcrumb />

      <header className="mb-8 md:mb-12">
        <h1 className="text-heading mb-4">{t("overview.title")}</h1>
        <p className="text-body max-w-2xl text-muted-foreground">
          {t("overview.description")}
        </p>
      </header>

      {/* Section 1: By Market Standard */}
      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold">
          {t("overview.byStandard")}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {pvcMarkets.map((market) => {
            const count = getFamiliesForMarket(market.slug).length;
            return (
              <MarketSeriesCard
                key={market.slug}
                slug={market.slug}
                label={t(`markets.${market.slug}.label`)}
                description={t(`markets.${market.slug}.description`)}
                standardLabel={market.standardLabel}
                familyCountLabel={t("familyCount", { count })}
              />
            );
          })}
        </div>
      </section>

      {/* Section 2: Specialty & Equipment */}
      <section>
        <h2 className="mb-6 text-xl font-semibold">
          {t("overview.specialty")}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* PETG Pneumatic Tubes card */}
          {pneumaticMarket && (
            <MarketSeriesCard
              slug={pneumaticMarket.slug}
              label={t(`markets.${pneumaticMarket.slug}.label`)}
              description={t(`markets.${pneumaticMarket.slug}.description`)}
              standardLabel={pneumaticMarket.standardLabel}
              familyCountLabel={t("familyCount", {
                count: getFamiliesForMarket(pneumaticMarket.slug).length,
              })}
            />
          )}
          {/* Bending Machines card — links to /capabilities/bending-machines */}
          <Link
            href="/capabilities/bending-machines"
            className="group block rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
              <Image
                src="/images/products/full-auto-bending-machine.svg"
                alt={t("overview.equipmentTitle")}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-contain p-4"
              />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary">
              {t("overview.equipmentTitle")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("overview.equipmentDescription")}
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}

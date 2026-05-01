import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  generateMetadataForPath,
  type Locale as SeoLocale,
} from "@/lib/seo-metadata";
import {
  PRODUCT_CATALOG,
  getFamiliesForMarket,
} from "@/constants/product-catalog";
import {
  SINGLE_SITE_HOME_LINK_TARGETS,
  SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION,
} from "@/config/single-site-page-expression";
import { getLocalizedPath } from "@/config/paths";
import {
  CatalogBreadcrumb,
  buildCatalogBreadcrumbJsonLd,
} from "@/components/products/catalog-breadcrumb";
import { JsonLdGraphScript } from "@/components/seo";
import { MarketSeriesCard } from "@/components/products/market-series-card";
import { generateLocaleStaticParams } from "@/app/[locale]/generate-static-params";
import { Link } from "@/i18n/routing";

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
  const t = await getTranslations({ locale, namespace: "catalog" });

  return generateMetadataForPath({
    locale: locale as SeoLocale,
    pageType: "products",
    path: getLocalizedPath("products", locale as SeoLocale),
    config: {
      title: t("overview.title"),
      description: t("overview.description"),
    },
  });
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "catalog" });
  const breadcrumbSchema = await buildCatalogBreadcrumbJsonLd({});

  const pvcMarkets = PRODUCT_CATALOG.markets.filter((market) =>
    SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION.standardMarketSlugs.includes(
      market.slug,
    ),
  );
  const pneumaticMarket = PRODUCT_CATALOG.markets.find(
    (market) =>
      market.slug === SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION.specialtyMarketSlug,
  );

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-8 md:py-12">
      <JsonLdGraphScript
        locale={locale as SeoLocale}
        data={[breadcrumbSchema]}
      />
      <CatalogBreadcrumb renderJsonLd={false} />

      <header className="mb-8 md:mb-12">
        <h1 className="text-heading mb-4">{t("overview.title")}</h1>
        <p className="text-body max-w-2xl text-muted-foreground">
          {t("overview.description")}
        </p>
        <Link
          href={SINGLE_SITE_HOME_LINK_TARGETS.contact}
          prefetch={false}
          className="mt-6 inline-flex items-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t("market.cta.button")}
        </Link>
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

      {pneumaticMarket && (
        <section>
          <h2 className="mb-6 text-xl font-semibold">
            {t("overview.specialty")}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <MarketSeriesCard
              slug={pneumaticMarket.slug}
              label={t(`markets.${pneumaticMarket.slug}.label`)}
              description={t(`markets.${pneumaticMarket.slug}.description`)}
              standardLabel={pneumaticMarket.standardLabel}
              familyCountLabel={t("familyCount", {
                count: getFamiliesForMarket(pneumaticMarket.slug).length,
              })}
            />
          </div>
        </section>
      )}
    </div>
  );
}

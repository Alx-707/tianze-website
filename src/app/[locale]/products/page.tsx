import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
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

  return (
    <main className="mx-auto max-w-[1080px] px-6 py-8 md:py-12">
      <CatalogBreadcrumb />

      <header className="mb-8 md:mb-12">
        <h1 className="text-heading mb-4">Products</h1>
        <p className="text-body max-w-2xl text-muted-foreground">
          PVC conduit fittings and pipes manufactured to international
          standards. Select your market to view products by compliance standard.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_CATALOG.markets.map((market) => (
          <MarketSeriesCard
            key={market.slug}
            market={market}
            familyCount={getFamiliesForMarket(market.slug).length}
          />
        ))}
      </div>
    </main>
  );
}

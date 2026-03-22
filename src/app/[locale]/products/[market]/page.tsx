import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  getMarketBySlug,
  getFamiliesForMarket,
  getAllMarketSlugs,
  isValidMarketSlug,
} from "@/constants/product-catalog";
import { SITE_CONFIG } from "@/config/paths";
import { CatalogBreadcrumb } from "@/components/products/catalog-breadcrumb";
import { FamilyCard } from "@/components/products/family-card";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  const markets = getAllMarketSlugs();
  return routing.locales.flatMap((locale) =>
    markets.map((market) => ({ locale, market })),
  );
}

interface MarketPageProps {
  params: Promise<{ locale: string; market: string }>;
}

export async function generateMetadata({
  params,
}: MarketPageProps): Promise<Metadata> {
  const { locale, market: marketSlug } = await params;
  const market = getMarketBySlug(marketSlug);

  if (!market) return {};

  const path = `/products/${market.slug}`;
  const canonical = `${SITE_CONFIG.baseUrl}/${locale}${path}`;

  return {
    title: `${market.label} | Tianze`,
    description: market.description,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE_CONFIG.baseUrl}/${l}${path}`]),
      ),
    },
    openGraph: {
      title: `${market.label} | Tianze`,
      description: market.description,
      type: "website",
    },
  };
}

export default async function MarketPage({ params }: MarketPageProps) {
  const { locale, market: marketSlug } = await params;
  setRequestLocale(locale);

  if (!isValidMarketSlug(marketSlug)) {
    notFound();
  }

  const market = getMarketBySlug(marketSlug)!;
  const families = getFamiliesForMarket(marketSlug);

  return (
    <main className="mx-auto max-w-[1080px] px-6 py-8 md:py-12">
      <CatalogBreadcrumb market={market} />

      <header className="mb-8 md:mb-12">
        <span className="mb-2 inline-block rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {market.standardLabel}
        </span>
        <h1 className="text-heading mb-4">{market.label}</h1>
        <p className="text-body max-w-2xl text-muted-foreground">
          {market.description}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {families.map((family) => (
          <FamilyCard
            key={family.slug}
            family={family}
            marketSlug={marketSlug}
          />
        ))}
      </div>
    </main>
  );
}

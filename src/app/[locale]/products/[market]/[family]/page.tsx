import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  getMarketBySlug,
  getFamilyBySlug,
  getAllMarketFamilyParams,
  isValidMarketFamilyCombo,
} from "@/constants/product-catalog";
import { SITE_CONFIG } from "@/config/paths";
import { Link, routing } from "@/i18n/routing";
import { CatalogBreadcrumb } from "@/components/products/catalog-breadcrumb";

export function generateStaticParams() {
  const combos = getAllMarketFamilyParams();
  return routing.locales.flatMap((locale) =>
    combos.map((combo) => ({ locale, ...combo })),
  );
}

interface FamilyPageProps {
  params: Promise<{ locale: string; market: string; family: string }>;
}

export async function generateMetadata({
  params,
}: FamilyPageProps): Promise<Metadata> {
  const { locale, market: marketSlug, family: familySlug } = await params;
  const market = getMarketBySlug(marketSlug);
  const family = getFamilyBySlug(marketSlug, familySlug);

  if (!market || !family) return {};

  const path = `/products/${market.slug}/${family.slug}`;
  const canonical = `${SITE_CONFIG.baseUrl}/${locale}${path}`;

  return {
    title: `${family.label} — ${market.standardLabel} | Tianze`,
    description: family.description,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE_CONFIG.baseUrl}/${l}${path}`]),
      ),
    },
    openGraph: {
      title: `${family.label} — ${market.standardLabel} | Tianze`,
      description: family.description,
      type: "website",
    },
  };
}

export default async function FamilyPage({ params }: FamilyPageProps) {
  const { locale, market: marketSlug, family: familySlug } = await params;
  setRequestLocale(locale);

  if (!isValidMarketFamilyCombo(marketSlug, familySlug)) {
    notFound();
  }

  const market = getMarketBySlug(marketSlug)!;
  const family = getFamilyBySlug(marketSlug, familySlug)!;

  return (
    <main className="mx-auto max-w-[1080px] px-6 py-8 md:py-12">
      <CatalogBreadcrumb market={market} family={family} />

      <header className="mb-8 md:mb-12">
        <span className="mb-2 inline-block rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {market.standardLabel}
        </span>
        <h1 className="text-heading mb-4">{family.label}</h1>
        <p className="text-body max-w-2xl text-muted-foreground">
          {family.description}
        </p>
      </header>

      <section className="mb-12 rounded-lg border border-border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">
          Specifications coming soon. Contact us for detailed product data.
        </p>
      </section>

      <section className="rounded-lg border border-primary/20 bg-primary/5 p-8 text-center">
        <h2 className="mb-4 text-xl font-semibold">
          Interested in {family.label}?
        </h2>
        <p className="mb-6 text-muted-foreground">
          Request a quote or ask about specifications, MOQ, and lead times.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Request a Quote
        </Link>
      </section>
    </main>
  );
}

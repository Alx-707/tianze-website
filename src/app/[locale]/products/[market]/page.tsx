import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getMarketBySlug,
  getFamiliesForMarket,
  getAllMarketSlugs,
  isValidMarketSlug,
} from "@/constants/product-catalog";
import { NORTH_AMERICA_SPECS } from "@/constants/product-specs/north-america";
import { AUSTRALIA_NZ_SPECS } from "@/constants/product-specs/australia-new-zealand";
import { MEXICO_SPECS } from "@/constants/product-specs/mexico";
import { EUROPE_SPECS } from "@/constants/product-specs/europe";
import { PNEUMATIC_SPECS } from "@/constants/product-specs/pneumatic-tube-systems";
import type { MarketSpecs } from "@/constants/product-specs/types";
import { SITE_CONFIG } from "@/config/paths";
import { CatalogBreadcrumb } from "@/components/products/catalog-breadcrumb";
import { FamilySection } from "@/components/products/family-section";
import {
  ProductCertifications,
  ProductSpecs,
  ProductTradeInfo,
} from "@/components/products/product-specs";
import { StickyFamilyNav } from "@/components/products/sticky-family-nav";
import { Link, routing } from "@/i18n/routing";

// --- Spec data lookup ---

const SPECS_BY_MARKET: Record<string, MarketSpecs> = {
  "north-america": NORTH_AMERICA_SPECS,
  "australia-new-zealand": AUSTRALIA_NZ_SPECS,
  mexico: MEXICO_SPECS,
  europe: EUROPE_SPECS,
  "pneumatic-tube-systems": PNEUMATIC_SPECS,
};

function getMarketSpecs(marketSlug: string): MarketSpecs | undefined {
  return SPECS_BY_MARKET[marketSlug];
}

// --- Static params ---

export function generateStaticParams() {
  const markets = getAllMarketSlugs();
  return routing.locales.flatMap((locale) =>
    markets.map((market) => ({ locale, market })),
  );
}

// --- Metadata ---

interface MarketPageProps {
  params: Promise<{ locale: string; market: string }>;
}

export async function generateMetadata({
  params,
}: MarketPageProps): Promise<Metadata> {
  const { locale, market: marketSlug } = await params;
  const market = getMarketBySlug(marketSlug);

  if (!market) return {};

  const t = await getTranslations({ locale, namespace: "catalog" });
  const marketLabel = t(`markets.${marketSlug}.label`);
  const marketDescription = t(`markets.${marketSlug}.description`);
  const path = `/products/${market.slug}`;
  const canonical = `${SITE_CONFIG.baseUrl}/${locale}${path}`;

  return {
    title: `${marketLabel} | Tianze`,
    description: marketDescription,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE_CONFIG.baseUrl}/${l}${path}`]),
      ),
    },
    openGraph: {
      title: `${marketLabel} | Tianze`,
      description: marketDescription,
      type: "website",
    },
  };
}

// --- Extracted sub-sections (keep MarketPage under 120 lines) ---

interface TrustSignalsSectionProps {
  marketSpecs: MarketSpecs;
  technicalTitle: string;
  certificationsTitle: string;
  tradeTitle: string;
  tradeLabels: {
    moq: string;
    leadTime: string;
    supplyCapacity: string;
    packaging: string;
    portOfLoading: string;
  };
}

function TrustSignalsSection({
  marketSpecs,
  technicalTitle,
  certificationsTitle,
  tradeTitle,
  tradeLabels,
}: TrustSignalsSectionProps) {
  return (
    <div className="mt-16 space-y-8">
      <ProductSpecs specs={marketSpecs.technical} title={technicalTitle} />
      <ProductCertifications
        certifications={marketSpecs.certifications}
        title={certificationsTitle}
      />
      <ProductTradeInfo
        moq={marketSpecs.trade.moq}
        leadTime={marketSpecs.trade.leadTime}
        supplyCapacity={marketSpecs.trade.supplyCapacity}
        packaging={marketSpecs.trade.packaging}
        portOfLoading={marketSpecs.trade.portOfLoading}
        title={tradeTitle}
        labels={tradeLabels}
      />
    </div>
  );
}

interface CtaSectionProps {
  heading: string;
  description: string;
  buttonText: string;
}

function CtaSection({ heading, description, buttonText }: CtaSectionProps) {
  return (
    <section className="mt-16 rounded-lg border border-primary/20 bg-primary/5 p-8 text-center">
      <h2 className="mb-2 text-xl font-semibold">{heading}</h2>
      <p className="mb-6 text-muted-foreground">{description}</p>
      <Link
        href="/contact"
        className="inline-flex items-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {buttonText}
      </Link>
    </section>
  );
}

// --- Page component ---

export default async function MarketPage({ params }: MarketPageProps) {
  const { locale, market: marketSlug } = await params;
  setRequestLocale(locale);

  if (!isValidMarketSlug(marketSlug)) {
    notFound();
  }

  const market = getMarketBySlug(marketSlug)!;
  const families = getFamiliesForMarket(marketSlug);
  const marketSpecs = getMarketSpecs(marketSlug);
  const t = await getTranslations({ locale, namespace: "catalog" });
  const marketLabel = t(`markets.${marketSlug}.label`);
  const marketDescription = t(`markets.${marketSlug}.description`);

  // Build family specs lookup for FamilySection rendering
  const familySpecsMap = new Map(
    marketSpecs?.families.map((fs) => [fs.slug, fs]),
  );

  return (
    <main className="mx-auto max-w-[1080px] px-6 py-8 md:py-12">
      <CatalogBreadcrumb market={market} marketLabel={marketLabel} />

      <header className="mb-8 md:mb-12">
        <span className="mb-2 inline-block rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {market.standardLabel}
        </span>
        <h1 className="text-heading mb-4">{marketLabel}</h1>
        <p className="text-body max-w-2xl text-muted-foreground">
          {marketDescription}
        </p>
      </header>

      {marketSpecs && (
        <StickyFamilyNav
          families={families
            .filter((f) => familySpecsMap.has(f.slug))
            .map((f) => ({ slug: f.slug, label: f.label }))}
        />
      )}

      <div className="space-y-16">
        {families.map((family) => {
          const specs = familySpecsMap.get(family.slug);
          if (!specs) return null;
          return (
            <FamilySection key={family.slug} family={family} specs={specs} />
          );
        })}
      </div>

      {!marketSpecs && (
        <section className="mb-12 rounded-lg border border-border bg-muted/30 p-8 text-center">
          <p className="text-muted-foreground">{t("market.specsComingSoon")}</p>
        </section>
      )}

      {marketSpecs && (
        <TrustSignalsSection
          marketSpecs={marketSpecs}
          technicalTitle={t("market.technical.title")}
          certificationsTitle={t("market.certifications.title")}
          tradeTitle={t("market.trade.title")}
          tradeLabels={{
            moq: t("market.trade.moq"),
            leadTime: t("market.trade.leadTime"),
            supplyCapacity: t("market.trade.supplyCapacity"),
            packaging: t("market.trade.packaging"),
            portOfLoading: t("market.trade.portOfLoading"),
          }}
        />
      )}

      <CtaSection
        heading={t("market.cta.heading", { marketLabel })}
        description={t("market.cta.description")}
        buttonText={t("market.cta.button")}
      />
    </main>
  );
}

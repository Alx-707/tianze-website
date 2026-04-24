import { type ComponentProps } from "react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getMarketBySlug,
  getFamiliesForMarket,
  getAllMarketSlugs,
  isValidMarketSlug,
  type ProductFamilyDefinition,
} from "@/constants/product-catalog";
import { SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION } from "@/config/single-site-page-expression";
import { NORTH_AMERICA_SPECS } from "@/constants/product-specs/north-america";
import { AUSTRALIA_NZ_SPECS } from "@/constants/product-specs/australia-new-zealand";
import { MEXICO_SPECS } from "@/constants/product-specs/mexico";
import { EUROPE_SPECS } from "@/constants/product-specs/europe";
import { PNEUMATIC_SPECS } from "@/constants/product-specs/pneumatic-tube-systems";
import type { MarketSpecs, SpecGroup } from "@/constants/product-specs/types";
import type { FaqItem, Locale } from "@/types/content.types";
import {
  getColumnTranslationKey,
  getGroupLabelTranslationKey,
  getRowValueTranslationKey,
} from "@/lib/spec-table-translator";
import { DYNAMIC_PATHS_CONFIG, SITE_CONFIG } from "@/config/paths";
import { contentTags } from "@/lib/cache/cache-tags";
import { getPageBySlug } from "@/lib/content";
import { extractFaqFromMetadata } from "@/lib/content/mdx-faq";
import { generateMetadataForPath } from "@/lib/seo-metadata";
import { JsonLdScript } from "@/components/seo";
import { FaqSection } from "@/components/sections/faq-section";
import { CatalogBreadcrumb } from "@/components/products/catalog-breadcrumb";
import { FamilySection } from "@/components/products/family-section";
import {
  ProductCertifications,
  ProductSpecs,
  ProductTradeInfo,
} from "@/components/products/product-specs";
import { StickyFamilyNav } from "@/components/products/sticky-family-nav";
import { Link, routing } from "@/i18n/routing";
import { generateProductGroupData } from "@/lib/structured-data-generators";

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

async function getProductMarketFaqItems(locale: Locale): Promise<FaqItem[]> {
  "use cache";
  cacheLife("days");
  cacheTag(contentTags.page("product-market", locale));

  const faqPage = await getPageBySlug("product-market", locale);
  return extractFaqFromMetadata(faqPage.metadata);
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
  return generateMetadataForPath({
    locale: locale as Locale,
    pageType: "products",
    path: DYNAMIC_PATHS_CONFIG.productMarket.pattern.replace(
      "[market]",
      market.slug,
    ),
    config: {
      title: `${marketLabel} | ${SITE_CONFIG.name}`,
      description: marketDescription,
    },
  });
}

// --- Extracted sub-sections (keep MarketPage under 120 lines) ---

interface TrustSignalsSectionProps {
  translatedTechnical: Record<string, string>;
  certifications: string[];
  translatedTrade: {
    moq: string;
    leadTime: string;
    supplyCapacity: string;
    packaging: string;
    portOfLoading: string;
  };
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
  translatedTechnical,
  certifications,
  translatedTrade,
  technicalTitle,
  certificationsTitle,
  tradeTitle,
  tradeLabels,
}: TrustSignalsSectionProps) {
  return (
    <div className="mt-16 space-y-8">
      <ProductSpecs specs={translatedTechnical} title={technicalTitle} />
      <ProductCertifications
        certifications={certifications}
        title={certificationsTitle}
      />
      <ProductTradeInfo
        moq={translatedTrade.moq}
        leadTime={translatedTrade.leadTime}
        supplyCapacity={translatedTrade.supplyCapacity}
        packaging={translatedTrade.packaging}
        portOfLoading={translatedTrade.portOfLoading}
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
  href: ComponentProps<typeof Link>["href"];
}

function CtaSection({
  heading,
  description,
  buttonText,
  href,
}: CtaSectionProps) {
  return (
    <section className="mt-16 rounded-lg border border-primary/20 bg-primary/5 p-8 text-center">
      <h2 className="mb-2 text-xl font-semibold">{heading}</h2>
      <p className="mb-6 text-muted-foreground">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {buttonText}
      </Link>
    </section>
  );
}

function MarketHero({
  standardLabel,
  marketLabel,
  marketDescription,
}: {
  standardLabel: string;
  marketLabel: string;
  marketDescription: string;
}) {
  return (
    <header className="mb-8 md:mb-12">
      <span className="mb-2 inline-block rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
        {standardLabel}
      </span>
      <h1 className="text-heading mb-4">{marketLabel}</h1>
      <p className="text-body max-w-2xl text-muted-foreground">
        {marketDescription}
      </p>
    </header>
  );
}

// --- Helper functions for spec translation ---

function translateSpecColumns(
  columns: string[],
  t: (key: string) => string,
): string[] {
  return columns.map((col) => {
    const colKey = getColumnTranslationKey(col);
    return t(colKey);
  });
}

function translateSpecRows(
  rows: string[][],
  t: (key: string) => string,
): string[][] {
  return rows.map((row) =>
    row.map((cell) => {
      const cellKey = getRowValueTranslationKey(cell);
      return cellKey ? t(cellKey) : cell;
    }),
  );
}

function translateTechnicalSpecs(
  technical: Record<string, string>,
  marketSlug: string,
  t: (key: string) => string,
): Record<string, string> {
  const translated: Record<string, string> = {};
  for (const key of Object.keys(technical)) {
    const labelKey = `technicalLabels.${key}`;
    const valueKey = `specs.${marketSlug}.technical.${key}`;
    const translatedLabel = t(labelKey);
    const translatedValue = t(valueKey);
    translated[translatedLabel] = translatedValue;
  }
  return translated;
}

function buildTrustSignalsSectionProps(
  marketSpecs: MarketSpecs,
  marketSlug: string,
  t: (key: string) => string,
): TrustSignalsSectionProps {
  return {
    translatedTechnical: translateTechnicalSpecs(
      marketSpecs.technical,
      marketSlug,
      t,
    ),
    certifications: marketSpecs.certifications,
    translatedTrade: {
      moq: t(`specs.${marketSlug}.trade.moq`),
      leadTime: t(`specs.${marketSlug}.trade.leadTime`),
      supplyCapacity: t(`specs.${marketSlug}.trade.supplyCapacity`),
      packaging: t(`specs.${marketSlug}.trade.packaging`),
      portOfLoading: t(`specs.${marketSlug}.trade.portOfLoading`),
    },
    technicalTitle: t("market.technical.title"),
    certificationsTitle: t("market.certifications.title"),
    tradeTitle: t("market.trade.title"),
    tradeLabels: {
      moq: t("market.trade.moq"),
      leadTime: t("market.trade.leadTime"),
      supplyCapacity: t("market.trade.supplyCapacity"),
      packaging: t("market.trade.packaging"),
      portOfLoading: t("market.trade.portOfLoading"),
    },
  };
}

function buildProductGroupSchema({
  families,
  familySpecsMap,
  marketSlug,
  marketLabel,
  marketDescription,
  marketUrl,
  t,
}: {
  families: readonly ProductFamilyDefinition[];
  familySpecsMap: Map<string, MarketSpecs["families"][number]>;
  marketSlug: string;
  marketLabel: string;
  marketDescription: string;
  marketUrl: string;
  t: (key: string) => string;
}) {
  return generateProductGroupData({
    name: marketLabel,
    description: marketDescription,
    url: marketUrl,
    brand: SITE_CONFIG.name,
    products: families.map((family) => {
      const image = familySpecsMap.get(family.slug)?.images[0];

      return {
        name: t(`families.${marketSlug}.${family.slug}.label`),
        description: t(`families.${marketSlug}.${family.slug}.description`),
        ...(image ? { image: `${SITE_CONFIG.baseUrl}${image}` } : {}),
        url: `${marketUrl}#${family.slug}`,
      };
    }),
  });
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
  const faqItems = await getProductMarketFaqItems(locale as Locale);
  const t = await getTranslations({ locale, namespace: "catalog" });
  const marketLabel = t(`markets.${marketSlug}.label`);
  const marketDescription = t(`markets.${marketSlug}.description`);

  // Build family specs lookup for FamilySection rendering and structured data.
  const familySpecsMap = new Map(
    marketSpecs?.families.map((fs) => [fs.slug, fs]),
  );
  const marketUrl = `${SITE_CONFIG.baseUrl}/${locale}/products/${market.slug}`;
  const productGroupSchema = buildProductGroupSchema({
    families,
    familySpecsMap,
    marketSlug,
    marketLabel,
    marketDescription,
    marketUrl,
    t,
  });

  return (
    <main
      className="notranslate mx-auto max-w-[1080px] px-6 py-8 md:py-12"
      data-testid="market-page-content"
      translate="no"
    >
      <JsonLdScript data={productGroupSchema} />
      <CatalogBreadcrumb market={market} marketLabel={marketLabel} />

      <MarketHero
        standardLabel={market.standardLabel}
        marketLabel={marketLabel}
        marketDescription={marketDescription}
      />

      {marketSpecs && (
        <StickyFamilyNav
          families={families
            .filter((f) => familySpecsMap.has(f.slug))
            .map((f) => ({
              slug: f.slug,
              label: t(`families.${marketSlug}.${f.slug}.label`),
            }))}
          ariaLabel={t("market.familyNav.jumpTo")}
        />
      )}

      <div className="space-y-16">
        {families.map((family) => {
          const specs = familySpecsMap.get(family.slug);
          if (!specs) return null;
          const familyLabel = t(`families.${marketSlug}.${family.slug}.label`);
          const familyDescription = t(
            `families.${marketSlug}.${family.slug}.description`,
          );
          // Translate highlights from catalog keys
          const translatedHighlights = specs.highlights.map((_, index) =>
            t(
              `specs.${marketSlug}.families.${family.slug}.highlights.${index}`,
            ),
          );
          // Translate spec groups (column headers, group labels, row values)
          const translatedSpecGroups: SpecGroup[] = specs.specGroups.map(
            (group, groupIndex) => {
              const groupLabelKey = getGroupLabelTranslationKey(
                marketSlug,
                family.slug,
                groupIndex,
              );
              const translatedLabel = t(groupLabelKey);
              const translatedColumns = translateSpecColumns(group.columns, t);
              const translatedRows = translateSpecRows(group.rows, t);

              return {
                ...group,
                groupLabel: translatedLabel,
                columns: translatedColumns,
                rows: translatedRows,
              };
            },
          );
          const specsWithTranslations = {
            ...specs,
            highlights: translatedHighlights,
            specGroups: translatedSpecGroups,
          };
          return (
            <FamilySection
              key={family.slug}
              family={family}
              specs={specsWithTranslations}
              familyLabel={familyLabel}
              familyDescription={familyDescription}
            />
          );
        })}
      </div>

      {!marketSpecs && (
        <section className="mb-12 rounded-lg border border-border bg-muted/30 p-8 text-center">
          <p className="text-muted-foreground">{t("market.cta.description")}</p>
        </section>
      )}

      {marketSpecs && (
        <TrustSignalsSection
          {...buildTrustSignalsSectionProps(marketSpecs, marketSlug, t)}
        />
      )}

      <FaqSection faqItems={faqItems} locale={locale as Locale} />

      <CtaSection
        heading={t("market.cta.heading", { marketLabel })}
        description={t("market.cta.description")}
        buttonText={t("market.cta.button")}
        href={SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION.marketLanding.ctaHref}
      />
    </main>
  );
}

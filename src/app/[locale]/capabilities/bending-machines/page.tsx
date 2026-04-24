import { Suspense, type ComponentProps } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { generateMetadataForPath } from "@/lib/seo-metadata";
import { getLocalizedPath } from "@/config/paths";
import { SINGLE_SITE_BENDING_MACHINES_PAGE_EXPRESSION } from "@/config/single-site-page-expression";
import { siteFacts } from "@/config/site-facts";
import { JsonLdScript } from "@/components/seo";
import { FaqSection } from "@/components/sections/faq-section";
import { Link } from "@/i18n/routing";
import { generateLocaleStaticParams } from "@/app/[locale]/generate-static-params";
import { getPageBySlug } from "@/lib/content";
import {
  LAYER1_FACTS,
  extractFaqFromMetadata,
  interpolateFaqAnswer,
} from "@/lib/content/mdx-faq";
import { buildEquipmentListSchema } from "@/lib/structured-data-generators";
import {
  EQUIPMENT_SPECS,
  type EquipmentSpec,
} from "@/constants/equipment-specs";
import type { FaqItem, Locale } from "@/types/content.types";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug("bending-machines", locale as Locale);
  const description =
    page.metadata.seo?.description ?? page.metadata.description;

  return generateMetadataForPath({
    locale: locale as Locale,
    pageType: "bendingMachines",
    path: getLocalizedPath("bendingMachines", locale as Locale),
    config: {
      title: page.metadata.seo?.title ?? page.metadata.title,
      ...(description ? { description } : {}),
    },
  });
}

// --- Extracted sub-sections (keep main function under 120 lines) ---

interface WhyCardData {
  title: string;
  desc: string;
}

function WhyItMattersSection({
  title,
  cards,
}: {
  title: string;
  cards: WhyCardData[];
}) {
  return (
    <section className="mt-16">
      <h2 className="mb-8 text-2xl font-bold">{title}</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-lg border border-border bg-muted/30 p-6"
          >
            <h3 className="mb-2 text-lg font-semibold">{card.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MachineCard({
  machine,
  locale,
  t,
}: {
  machine: EquipmentSpec;
  locale: Locale;
  t: (key: string) => string;
}) {
  const highlights = machine.highlights[locale];

  return (
    <section className="rounded-lg border border-border p-6 md:p-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
          <Image
            src={machine.image}
            alt={t(`equipment.${machine.slug}.name`)}
            fill
            className="object-contain"
          />
        </div>
        <div>
          <h3 className="mb-4 text-xl font-semibold">
            {t(`equipment.${machine.slug}.name`)}
          </h3>
          <dl className="space-y-2">
            {Object.entries(machine.params).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between border-b border-border/50 pb-1"
              >
                <dt className="text-sm text-muted-foreground">
                  {t(`equipment.${machine.slug}.params.${key}`)}
                </dt>
                <dd className="font-mono text-sm">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4">
            <ul className="flex flex-wrap gap-2">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

interface StatItem {
  value: string;
  label: string;
}

function getCapabilityStatValue(
  stat: (typeof SINGLE_SITE_BENDING_MACHINES_PAGE_EXPRESSION.stats)[number],
  t: (key: string) => string,
) {
  if (stat.valueSource === "translation") {
    return t(`${stat.translationKey}.value`);
  }

  return `${siteFacts.stats.exportCountries}${stat.suffix}`;
}

function ProductionCapabilitySection({
  title,
  stats,
}: {
  title: string;
  stats: StatItem[];
}) {
  return (
    <section className="mt-16">
      <h2 className="mb-8 text-center text-2xl font-bold">{title}</h2>
      <div className="grid gap-8 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="mb-1 font-mono text-4xl font-bold text-primary">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection({
  heading,
  description,
  buttonText,
  href,
}: {
  heading: string;
  description: string;
  buttonText: string;
  href: ComponentProps<typeof Link>["href"];
}) {
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

// --- Page component ---

async function BendingMachinesContent({ locale }: { locale: string }) {
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "capabilities" });
  const page = await getPageBySlug("bending-machines", locale as Locale);
  const faqItems: FaqItem[] = extractFaqFromMetadata(page.metadata).map(
    (item) => ({
      ...item,
      answer: interpolateFaqAnswer(item.answer, LAYER1_FACTS),
    }),
  );

  const whyCards: WhyCardData[] =
    SINGLE_SITE_BENDING_MACHINES_PAGE_EXPRESSION.whyCardKeys.map((cardKey) => ({
      title: t(`why.${cardKey}.title`),
      desc: t(`why.${cardKey}.desc`),
    }));

  const stats: StatItem[] =
    SINGLE_SITE_BENDING_MACHINES_PAGE_EXPRESSION.stats.map((stat) => ({
      value: getCapabilityStatValue(stat, t),
      label: t(`${stat.translationKey}.label`),
    }));
  const equipmentSchema = buildEquipmentListSchema({
    name: "PVC Pipe Bending Machines",
    items: EQUIPMENT_SPECS.map((spec) => ({
      name: t(`equipment.${spec.slug}.name`),
      description: spec.highlights[locale as Locale].join(", "),
    })),
  });

  return (
    <main className="mx-auto max-w-[1080px] px-6 py-8 md:py-12">
      <JsonLdScript data={equipmentSchema} />

      <header className="mb-8 md:mb-12">
        <h1 className="text-heading mb-4">{page.metadata.title}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {page.metadata.description}
        </p>
      </header>

      <WhyItMattersSection title={t("why.title")} cards={whyCards} />

      <section className="mt-16">
        <h2 className="mb-8 text-2xl font-bold">{t("machines.title")}</h2>
        <div className="space-y-8">
          {EQUIPMENT_SPECS.map((machine) => (
            <MachineCard
              key={machine.slug}
              machine={machine}
              locale={locale as Locale}
              t={t}
            />
          ))}
        </div>
      </section>

      <ProductionCapabilitySection
        title={t("capability.title")}
        stats={stats}
      />

      <Suspense fallback={null}>
        <FaqSection faqItems={faqItems} locale={locale as Locale} />
      </Suspense>

      <CtaSection
        heading={t("cta.heading")}
        description={t("cta.description")}
        buttonText={t("cta.button")}
        href={SINGLE_SITE_BENDING_MACHINES_PAGE_EXPRESSION.ctaHref}
      />
    </main>
  );
}

function BendingMachinesLoadingSkeleton() {
  return (
    <main className="mx-auto max-w-[1080px] px-6 py-8 md:py-12">
      <div className="mb-8 h-10 w-72 animate-pulse rounded bg-muted" />
      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-4 w-full animate-pulse rounded bg-muted"
          />
        ))}
      </div>
    </main>
  );
}

export default async function BendingMachinesPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <Suspense fallback={<BendingMachinesLoadingSkeleton />}>
      <BendingMachinesContent locale={locale} />
    </Suspense>
  );
}

import { Suspense, type ComponentProps } from "react";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import {
  ArrowRight,
  BadgeCheck,
  Crosshair,
  HeadphonesIcon,
  Wrench,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { generateMetadataForPath, type Locale } from "@/lib/seo-metadata";
import { siteFacts } from "@/config/site-facts";
import { FaqSection } from "@/components/sections/faq-section";
import { Button } from "@/components/ui/button";
import {
  SINGLE_SITE_ABOUT_FAQ_ITEMS,
  SINGLE_SITE_ABOUT_PAGE_EXPRESSION,
  SINGLE_SITE_ABOUT_STATS_ITEMS,
  SINGLE_SITE_ABOUT_VALUE_ITEM_KEYS,
} from "@/config/single-site-page-expression";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateLocaleStaticParams } from "@/app/[locale]/generate-static-params";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

function AboutLoadingSkeleton() {
  return (
    <div>
      <div className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl space-y-4">
            <div className="h-12 w-64 animate-pulse rounded bg-muted" />
            <div className="h-6 w-48 animate-pulse rounded bg-muted" />
            <div className="h-20 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="mx-auto h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface AboutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "about",
  });

  return generateMetadataForPath({
    locale: locale as Locale,
    pageType: "about",
    path: "/about",
    config: {
      title: t("pageTitle"),
      description: t("pageDescription"),
    },
  });
}

// Hero section component
interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
}

function HeroSection({ title, subtitle, description }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-heading mb-4">{title}</h1>
          <p className="mb-4 text-xl font-medium text-primary">{subtitle}</p>
          <p className="text-body text-muted-foreground">{description}</p>
        </div>
      </div>
    </section>
  );
}

// Mission section component
interface MissionSectionProps {
  title: string;
  content: string;
}

function MissionSection({ title, content }: MissionSectionProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-2xl font-bold">{title}</h2>
          <p className="text-body leading-relaxed text-muted-foreground">
            {content}
          </p>
        </div>
      </div>
    </section>
  );
}

// Value card component
interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ValueCard({ icon, title, description }: ValueCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

// Values section component
interface ValuesSectionProps {
  title: string;
  items: Array<{
    key: string;
    title: string;
    description: string;
    icon: React.ReactNode;
  }>;
}

function ValuesSection({ title, items }: ValuesSectionProps) {
  return (
    <section className="bg-muted/30 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-center text-2xl font-bold">{title}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <ValueCard
              key={item.key}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Stats section component
interface StatsSectionProps {
  stats: {
    yearsExperience: string;
    countriesServed: string;
    happyClients: string;
    productsDelivered: string;
  };
}

function resolveAboutStatValue(
  source: (typeof SINGLE_SITE_ABOUT_STATS_ITEMS)[number]["valueSource"],
): string {
  switch (source) {
    case "yearsInBusiness":
      return `${siteFacts.company.yearsInBusiness}`;
    case "exportCountries":
      return `${siteFacts.stats.exportCountries}`;
    case "employees":
      return `${siteFacts.company.employees}`;
    case "factoryAreaAcres":
      return `${siteFacts.stats.factoryAreaAcres}`;
    default:
      return "";
  }
}

function StatsSection({ stats }: StatsSectionProps) {
  const statItems = SINGLE_SITE_ABOUT_STATS_ITEMS.map((item) => ({
    key: item.key,
    value: `${resolveAboutStatValue(item.valueSource)}${item.suffix}`,
    label: stats[item.labelKey],
  }));

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((item) => (
            <div key={item.key} className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">
                {item.value}
              </div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA section component
interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
  href: ComponentProps<typeof Link>["href"];
}

function CTASection({ title, description, buttonText, href }: CTASectionProps) {
  return (
    <section className="bg-primary py-12 md:py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 text-2xl font-bold text-primary-foreground">
          {title}
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/80">
          {description}
        </p>
        <Button asChild size="lg" variant="secondary">
          <Link href={href}>
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

async function AboutContent({ locale }: { locale: string }) {
  setRequestLocale(locale);

  const t = await getTranslations({
    locale,
    namespace: "about",
  });

  const heroProps = {
    title: t("hero.title"),
    subtitle: t("hero.subtitle"),
    description: t("hero.description"),
  };

  const missionProps = {
    title: t("mission.title"),
    content: t("mission.content"),
  };

  const valuesProps = {
    title: t("values.title"),
    items: SINGLE_SITE_ABOUT_VALUE_ITEM_KEYS.map((key) => ({
      key,
      title: t(`values.${key}.title`),
      description: t(`values.${key}.description`),
      icon:
        key === "quality" ? (
          <Crosshair className="h-6 w-6" />
        ) : key === "innovation" ? (
          <Wrench className="h-6 w-6" />
        ) : key === "service" ? (
          <HeadphonesIcon className="h-6 w-6" />
        ) : (
          <BadgeCheck className="h-6 w-6" />
        ),
    })),
  };

  const statsProps = {
    stats: {
      yearsExperience: t("stats.yearsExperience"),
      countriesServed: t("stats.countriesServed"),
      happyClients: t("stats.happyClients"),
      productsDelivered: t("stats.productsDelivered"),
    },
  };

  const ctaProps = {
    title: t("cta.title"),
    description: t("cta.description"),
    buttonText: t("cta.button"),
    href: SINGLE_SITE_ABOUT_PAGE_EXPRESSION.ctaHref,
  };

  return (
    <main>
      <HeroSection {...heroProps} />
      <MissionSection {...missionProps} />
      <ValuesSection {...valuesProps} />
      <StatsSection {...statsProps} />
      <FaqSection
        items={[...SINGLE_SITE_ABOUT_FAQ_ITEMS]}
        locale={locale as Locale}
      />
      <CTASection {...ctaProps} />
    </main>
  );
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  return (
    <Suspense fallback={<AboutLoadingSkeleton />}>
      <AboutContent locale={locale} />
    </Suspense>
  );
}

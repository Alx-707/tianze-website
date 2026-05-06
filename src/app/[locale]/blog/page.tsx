import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { generateLocaleStaticParams } from "@/app/[locale]/generate-static-params";
import { JsonLdGraphScript } from "@/components/seo";
import { SINGLE_SITE_HOME_LINK_TARGETS } from "@/config/single-site-page-expression";
import { getLocalizedPath } from "@/config/paths";
import { Link } from "@/i18n/routing";
import {
  generateMetadataForPath,
  type Locale as SeoLocale,
} from "@/lib/seo-metadata";

const BLOG_TOPIC_KEYS = ["standards", "inquiry", "pneumatic"] as const;

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return generateMetadataForPath({
    locale: locale as SeoLocale,
    pageType: "blog",
    path: getLocalizedPath("blog", locale as SeoLocale),
    config: {
      title: t("title"),
      description: t("description"),
    },
  });
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const typedLocale = locale as SeoLocale;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("title"),
    description: t("description"),
    inLanguage: typedLocale,
  };

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10 md:py-16">
      <JsonLdGraphScript locale={typedLocale} data={[collectionPageSchema]} />
      <header className="mb-10 max-w-3xl md:mb-14">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="text-heading mb-4">{t("title")}</h1>
        <p className="text-body text-muted-foreground">{t("description")}</p>
        <p className="mt-4 text-sm text-muted-foreground">{t("intro")}</p>
      </header>

      <section aria-labelledby="blog-topics-heading">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="blog-topics-heading" className="text-xl font-semibold">
            {t("topicsTitle")}
          </h2>
          <Link
            href={SINGLE_SITE_HOME_LINK_TARGETS.contact}
            prefetch={false}
            className="inline-flex w-fit items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("contactCta")}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {BLOG_TOPIC_KEYS.map((key) => (
            <article
              key={key}
              className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-xs)]"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {t(`topics.${key}.label`)}
              </p>
              <h3 className="mb-3 text-lg font-semibold">
                {t(`topics.${key}.title`)}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {t(`topics.${key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

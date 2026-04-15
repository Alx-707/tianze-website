import { Suspense } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import enCritical from "@messages/en/critical.json";
import enDeferred from "@messages/en/deferred.json";
import zhCritical from "@messages/zh/critical.json";
import zhDeferred from "@messages/zh/deferred.json";
import { JsonLdScript } from "@/components/seo";
import { ContactForm } from "@/components/contact/contact-form";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { SectionHead } from "@/components/ui/section-head";
import { Card } from "@/components/ui/card";
import { generateLocaleStaticParams } from "@/app/[locale]/generate-static-params";
import {
  ContactFormFallback,
  ContactPageHeader,
  getContactPageFallbackCopy,
} from "@/app/[locale]/contact/contact-page-shell";
import type { Locale } from "@/types/i18n";
import { pickMessages } from "@/lib/i18n/client-messages";
import {
  generateMetadataForPath,
  type Locale as SeoLocale,
} from "@/lib/seo-metadata";
import { mergeObjects } from "@/lib/merge-objects";
import { getContactCopy } from "@/lib/contact/getContactCopy";
import { generateFAQSchema } from "@/lib/structured-data";
import { siteFacts } from "@/config/site-facts";
import { COUNT_TWO } from "@/constants";

type Messages = Record<string, unknown>;

const CONTACT_FAQ_ITEMS = [
  "moq",
  "leadTime",
  "payment",
  "samples",
  "oem",
] as const;

const MERGED_MESSAGES = {
  en: mergeObjects(enCritical as Messages, enDeferred as Messages),
  zh: mergeObjects(zhCritical as Messages, zhDeferred as Messages),
} as const;

function getMessagesForLocale(locale: string): Messages {
  return locale === "zh" ? MERGED_MESSAGES.zh : MERGED_MESSAGES.en;
}

function getNestedMessage(
  messages: Messages,
  path: string,
): string | undefined {
  const value = path.split(".").reduce<unknown>((current, segment) => {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }
    return (current as Record<string, unknown>)[segment];
  }, messages);

  return typeof value === "string" ? value : undefined;
}

function interpolateMessage(
  template: string | undefined,
  values: Record<string, string | number>,
): string {
  if (!template) return "";
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}

function buildFaqItems(messages: Messages) {
  const faqValues = {
    established: siteFacts.company.established,
    countries: siteFacts.stats.exportCountries,
    employees: siteFacts.company.employees,
  };

  return CONTACT_FAQ_ITEMS.map((key) => ({
    key,
    question: interpolateMessage(
      getNestedMessage(messages, `faq.items.${key}.question`),
      faqValues,
    ),
    answer: interpolateMessage(
      getNestedMessage(messages, `faq.items.${key}.answer`),
      faqValues,
    ),
  }));
}

interface ContactPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const copy = await getContactCopy(locale as Locale);

  const metadata = generateMetadataForPath({
    locale: locale as SeoLocale,
    pageType: "contact",
    path: "/contact",
    config: {
      title: copy.header.title,
      description: copy.header.description,
    },
  });

  return {
    ...metadata,
    other: {
      ...metadata.other,
      google: "notranslate",
    },
  };
}

function ContactMethodsCard({
  copy,
}: {
  copy: Awaited<ReturnType<typeof getContactCopy>>["panel"]["contact"];
}) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-xl font-semibold">{copy.title}</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <svg
              className="h-5 w-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={COUNT_TWO}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium">{copy.emailLabel}</p>
            <p className="text-muted-foreground">{siteFacts.contact.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <svg
              className="h-5 w-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={COUNT_TWO}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium">{copy.phoneLabel}</p>
            <p className="text-muted-foreground">{siteFacts.contact.phone}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ResponseExpectationsCard({
  responseCopy,
  hoursCopy,
}: {
  responseCopy: Awaited<ReturnType<typeof getContactCopy>>["panel"]["response"];
  hoursCopy: Awaited<ReturnType<typeof getContactCopy>>["panel"]["hours"];
}) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-xl font-semibold">{responseCopy.title}</h3>
      <dl className="space-y-4 text-sm">
        <div className="space-y-1">
          <dt className="font-medium">{responseCopy.responseTimeLabel}</dt>
          <dd className="text-muted-foreground">
            {responseCopy.responseTimeValue}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="font-medium">{responseCopy.bestForLabel}</dt>
          <dd className="text-muted-foreground">{responseCopy.bestForValue}</dd>
        </div>
        <div className="space-y-1">
          <dt className="font-medium">{responseCopy.prepareLabel}</dt>
          <dd className="text-muted-foreground">{responseCopy.prepareValue}</dd>
        </div>
      </dl>

      <div className="mt-6 border-t pt-6">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {hoursCopy.title}
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span>{hoursCopy.weekdaysLabel}</span>
            <span className="text-muted-foreground">
              {siteFacts.contact.businessHours?.weekdays}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>{hoursCopy.saturdayLabel}</span>
            <span className="text-muted-foreground">
              {siteFacts.contact.businessHours?.saturday}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>{hoursCopy.sundayLabel}</span>
            <span className="text-muted-foreground">
              {hoursCopy.closedLabel}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = getMessagesForLocale(locale);
  const copy = await getContactCopy(locale as Locale);
  const faqItems = buildFaqItems(messages);
  const faqTitle = getNestedMessage(messages, "faq.sectionTitle") ?? "FAQ";
  const faqSchema = generateFAQSchema(
    faqItems.map(({ question, answer }) => ({ question, answer })),
    locale as Locale,
  );
  const contactClientMessages = pickMessages(messages, [
    "contact",
    "apiErrors",
  ]);
  const fallbackCopy = getContactPageFallbackCopy(locale);

  return (
    <div
      className="notranslate min-h-[80vh] px-4 py-16"
      data-testid="contact-page-content"
      translate="no"
    >
      <div className="mx-auto max-w-4xl">
        <ContactPageHeader
          title={copy.header.title}
          description={copy.header.description}
        />

        <div className="grid gap-8 md:grid-cols-2">
          <Suspense
            fallback={
              <ContactFormFallback
                title={fallbackCopy.formTitle}
                description={fallbackCopy.formDescription}
                labels={fallbackCopy.labels}
              />
            }
          >
            <NextIntlClientProvider
              locale={locale}
              messages={contactClientMessages}
            >
              <ContactForm />
            </NextIntlClientProvider>
          </Suspense>

          <div className="space-y-6">
            <ContactMethodsCard copy={copy.panel.contact} />
            <ResponseExpectationsCard
              responseCopy={copy.panel.response}
              hoursCopy={copy.panel.hours}
            />
          </div>
        </div>
      </div>

      <section className="section-divider py-14 md:py-[72px]">
        <div className="mx-auto max-w-[1080px] px-6">
          <JsonLdScript data={faqSchema} />
          <SectionHead title={faqTitle} />
          <FaqAccordion items={faqItems} />
        </div>
      </section>
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact/contact-form";
import { FaqSection } from "@/components/sections/faq-section";
import { Card } from "@/components/ui/card";
import {
  generateLocaleStaticParams,
  type LocaleParam,
} from "@/app/[locale]/generate-static-params";
import { siteFacts } from "@/config/site-facts";
import { COUNT_TWO } from "@/constants";
import { getPageBySlug } from "@/lib/content";
import {
  extractFaqFromMetadata,
  interpolateFaqAnswer,
} from "@/lib/content/mdx-faq";
import { renderLegalContent } from "@/lib/content/render-legal-content";
import { getContactCopy } from "@/lib/contact/getContactCopy";
import { pickMessages } from "@/lib/i18n/client-messages";
import {
  generateMetadataForPath,
  type Locale as SeoLocale,
} from "@/lib/seo-metadata";
import type { FaqItem, Locale } from "@/types/content.types";

const LAYER1_FACTS: Record<string, string | number> = {
  companyName: siteFacts.company.name,
  established: siteFacts.company.established,
  exportCountries: siteFacts.stats.exportCountries,
  employees: siteFacts.company.employees,
};

interface ContactPageProps {
  params: Promise<LocaleParam>;
}

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug("contact", locale as Locale);
  const description =
    page.metadata.seo?.description ?? page.metadata.description;

  const metadata = generateMetadataForPath({
    locale: locale as SeoLocale,
    pageType: "contact",
    path: "/contact",
    config: {
      title: page.metadata.seo?.title ?? page.metadata.title,
      ...(description ? { description } : {}),
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
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={COUNT_TWO}
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={COUNT_TWO}
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

function ContactFormSkeleton() {
  return (
    <Card className="space-y-4 p-6">
      <div className="h-6 w-40 animate-pulse rounded bg-muted" />
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="h-10 animate-pulse rounded bg-muted" />
      ))}
    </Card>
  );
}

async function ContactContent({ locale }: { locale: string }) {
  setRequestLocale(locale);

  const page = await getPageBySlug("contact", locale as Locale);
  const messages = await getMessages({ locale });
  const copy = await getContactCopy(locale as Locale);
  const faqItems: FaqItem[] = extractFaqFromMetadata(
    page.metadata as unknown as Record<string, unknown>,
  ).map((item) => ({
    ...item,
    answer: interpolateFaqAnswer(item.answer, LAYER1_FACTS),
  }));
  const contactClientMessages = pickMessages(messages, [
    "contact",
    "apiErrors",
  ]);

  return (
    <main
      className="notranslate min-h-[80vh] px-4 py-16"
      data-testid="contact-page-content"
      translate="no"
    >
      <div className="mx-auto max-w-4xl">
        <header className="mb-12 text-center">
          <h1 className="text-heading mb-4">{page.metadata.title}</h1>
          {page.metadata.description ? (
            <p className="text-body mx-auto max-w-2xl text-muted-foreground">
              {page.metadata.description}
            </p>
          ) : null}
        </header>

        <article className="prose mb-12 max-w-none">
          {renderLegalContent(page.content)}
        </article>

        <div className="grid gap-8 md:grid-cols-2">
          <Suspense fallback={<ContactFormSkeleton />}>
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

      {faqItems.length > 0 ? (
        <Suspense fallback={null}>
          <FaqSection faqItems={faqItems} locale={locale as Locale} />
        </Suspense>
      ) : null}
    </main>
  );
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;

  return (
    <Suspense
      fallback={
        <main className="min-h-[80vh] px-4 py-16">
          <div className="mx-auto max-w-4xl space-y-4">
            <div className="mx-auto h-10 w-64 animate-pulse rounded bg-muted" />
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-4 w-full animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        </main>
      }
    >
      <ContactContent locale={locale} />
    </Suspense>
  );
}

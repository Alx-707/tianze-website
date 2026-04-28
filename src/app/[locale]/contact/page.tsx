import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ContactFormIsland } from "@/components/contact/contact-form-island";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { JsonLdGraphScript } from "@/components/seo";
import { Card } from "@/components/ui/card";
import { SectionHead } from "@/components/ui/section-head";
import {
  generateLocaleStaticParams,
  type LocaleParam,
} from "@/app/[locale]/generate-static-params";
import { siteFacts } from "@/config/site-facts";
import { COUNT_TWO } from "@/constants";
import {
  LAYER1_FACTS,
  extractFaqFromMetadata,
  generateFaqSchemaFromItems,
  interpolateFaqAnswer,
} from "@/lib/content/mdx-faq";
import { renderLegalContent } from "@/lib/content/render-legal-content";
import { getContactCopyFromMessages } from "@/lib/contact/getContactCopy";
import { CONTENT_MANIFEST } from "@/lib/content-manifest.generated";
import { readMessagePath } from "@/lib/i18n/read-message-path";
import { mergeObjects } from "@/lib/merge-objects";
import { generateMetadataForPath } from "@/lib/seo-metadata";
import { getLocalizedPath } from "@/config/paths";
import type { FaqItem, Locale, Page } from "@/types/content.types";
import enCriticalMessages from "@messages/en/critical.json";
import enDeferredMessages from "@messages/en/deferred.json";
import zhCriticalMessages from "@messages/zh/critical.json";
import zhDeferredMessages from "@messages/zh/deferred.json";

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
  const typedLocale = locale as Locale;
  const page = getStaticContactPage(typedLocale);
  const description =
    page.metadata.seo?.description ?? page.metadata.description;

  const metadata = generateMetadataForPath({
    locale: typedLocale,
    pageType: "contact",
    path: getLocalizedPath("contact", typedLocale),
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
  copy: ReturnType<typeof getContactCopyFromMessages>["panel"]["contact"];
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
  responseCopy: ReturnType<
    typeof getContactCopyFromMessages
  >["panel"]["response"];
  hoursCopy: ReturnType<typeof getContactCopyFromMessages>["panel"]["hours"];
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

function ContactFaqSection({
  faqItems,
  title,
}: {
  faqItems: FaqItem[];
  title: string;
}) {
  const accordionItems = faqItems.map((item) => ({
    key: item.id,
    question: item.question,
    answer: item.answer,
  }));

  return (
    <section
      className="section-divider py-14 md:py-[72px]"
      data-testid="faq-section"
    >
      <div className="mx-auto max-w-[1080px] px-6">
        <SectionHead title={title} />
        <FaqAccordion items={accordionItems} />
      </div>
    </section>
  );
}

function pickContactFormCopy(
  messages: Record<string, unknown>,
  key: string,
  fallback: string,
) {
  return readMessagePath(messages, ["contact", "form", key], fallback);
}

function ContactFormStaticFallback({
  messages,
}: {
  messages: Record<string, unknown>;
}) {
  const pick = (key: string, fallback: string) =>
    pickContactFormCopy(messages, key, fallback);

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <form
        aria-busy="true"
        aria-label={pick("title", "Contact form")}
        className="space-y-6 p-6"
        data-contact-form-fallback="static"
        noValidate
      >
        <p className="text-sm text-muted-foreground">
          {pick("description", "Loading the secure inquiry form.")}
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm" htmlFor="firstName">
              {pick("firstName", "First Name")}
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              disabled
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm" htmlFor="lastName">
              {pick("lastName", "Last Name")}
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              disabled
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm" htmlFor="email">
              {pick("email", "Email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              disabled
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm" htmlFor="company">
              {pick("company", "Company Name")}
            </label>
            <input
              id="company"
              name="company"
              type="text"
              disabled
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm" htmlFor="message">
            {pick("message", "Message")}
          </label>
          <textarea
            id="message"
            name="message"
            disabled
            required
            rows={4}
            className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="acceptPrivacy"
            name="acceptPrivacy"
            type="checkbox"
            disabled
            required
            className="h-4 w-4 rounded border border-input"
          />
          <label className="text-sm" htmlFor="acceptPrivacy">
            {pick("acceptPrivacy", "I agree to the privacy policy")}
          </label>
        </div>
        <button
          aria-disabled="true"
          className="inline-flex h-10 w-full items-center justify-center rounded-[6px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground opacity-60"
          disabled
          type="submit"
        >
          {pick("submit", "Submit")}
        </button>
      </form>
    </Card>
  );
}

const STATIC_MESSAGES_BY_LOCALE: Record<Locale, Record<string, unknown>> = {
  en: mergeObjects(
    enCriticalMessages as Record<string, unknown>,
    enDeferredMessages as Record<string, unknown>,
  ) as Record<string, unknown>,
  zh: mergeObjects(
    zhCriticalMessages as Record<string, unknown>,
    zhDeferredMessages as Record<string, unknown>,
  ) as Record<string, unknown>,
};

function getStaticMessages(locale: Locale): Record<string, unknown> {
  return STATIC_MESSAGES_BY_LOCALE[locale];
}

function getStaticContactPage(locale: Locale): Page {
  const entry = CONTENT_MANIFEST.byKey[`pages/${locale}/contact`];

  if (entry === undefined) {
    throw new Error(`Static contact page not found for locale: ${locale}`);
  }

  return {
    slug: entry.slug,
    filePath: entry.filePath,
    metadata: entry.metadata,
    content: entry.content,
  } as unknown as Page;
}

function ContactPageHeader({ page }: { page: Page }) {
  return (
    <header className="mb-12 text-center">
      <h1 className="text-heading mb-4">{page.metadata.title}</h1>
      {page.metadata.description ? (
        <p className="text-body mx-auto max-w-2xl text-muted-foreground">
          {page.metadata.description}
        </p>
      ) : null}
    </header>
  );
}

function ContactPageFallback({ locale }: { locale: Locale }) {
  const page = getStaticContactPage(locale);
  const messages = getStaticMessages(locale);

  return (
    <main
      aria-busy="true"
      className="notranslate min-h-[80vh] px-4 py-16"
      data-testid="contact-page-fallback"
      translate="no"
    >
      <div className="mx-auto max-w-4xl">
        <ContactPageHeader page={page} />
        <ContactFormStaticFallback messages={messages} />
      </div>
    </main>
  );
}

function ContactContentBody({ locale }: { locale: Locale }) {
  const page = getStaticContactPage(locale);
  const messages = getStaticMessages(locale);
  const copy = getContactCopyFromMessages(messages);
  const formLoadError = pickContactFormCopy(
    messages,
    "loadError",
    "The secure inquiry form could not load. Retry, or use the contact methods on this page.",
  );
  const formRetryLabel = pickContactFormCopy(
    messages,
    "retryLoad",
    "Retry loading form",
  );
  const faqItems: FaqItem[] = extractFaqFromMetadata(page.metadata).map(
    (item) => ({
      ...item,
      answer: interpolateFaqAnswer(item.answer, LAYER1_FACTS),
    }),
  );
  const faqSectionTitle = readMessagePath(
    messages,
    ["faq", "sectionTitle"],
    "FAQ",
  );
  const faqSchema =
    faqItems.length > 0 ? generateFaqSchemaFromItems(faqItems, locale) : null;

  return (
    <main
      className="notranslate min-h-[80vh] px-4 py-16"
      data-testid="contact-page-content"
      translate="no"
    >
      <JsonLdGraphScript locale={locale} data={faqSchema ? [faqSchema] : []} />
      <div className="mx-auto max-w-4xl">
        <ContactPageHeader page={page} />

        <article className="prose mb-12 max-w-none">
          {renderLegalContent(page.content)}
        </article>

        <div className="grid gap-8 md:grid-cols-2">
          <ContactFormIsland
            errorMessage={formLoadError}
            fallback={<ContactFormStaticFallback messages={messages} />}
            retryLabel={formRetryLabel}
          />

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
        <ContactFaqSection faqItems={faqItems} title={faqSectionTitle} />
      ) : null}
    </main>
  );
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(typedLocale);

  return (
    <Suspense fallback={<ContactPageFallback locale={typedLocale} />}>
      <ContactContentBody locale={typedLocale} />
    </Suspense>
  );
}

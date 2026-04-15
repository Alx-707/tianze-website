import { Suspense } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { MessageCircle } from "lucide-react";
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
import { generateFAQSchema } from "@/lib/structured-data";
import { siteFacts } from "@/config/site-facts";
import { isWhatsAppConfigured as checkWhatsApp } from "@/config/paths/site-config";
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

function buildWhatsAppUrl(whatsappNumber: string | undefined) {
  return whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`
    : undefined;
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

function getContactCopy(messages: Messages, locale: string) {
  const fallbackCopy = getContactPageFallbackCopy(locale);

  return {
    header: {
      title:
        getNestedMessage(messages, "underConstruction.pages.contact.title") ??
        fallbackCopy.title,
      description:
        getNestedMessage(
          messages,
          "underConstruction.pages.contact.description",
        ) ?? fallbackCopy.description,
    },
    panel: {
      contact: {
        title:
          getNestedMessage(
            messages,
            "underConstruction.pages.contact.panel.contactTitle",
          ) ?? "Contact Methods",
        emailLabel:
          getNestedMessage(
            messages,
            "underConstruction.pages.contact.panel.email",
          ) ?? "Email",
        phoneLabel:
          getNestedMessage(
            messages,
            "underConstruction.pages.contact.panel.phone",
          ) ?? "Phone",
      },
      hours: {
        title:
          getNestedMessage(
            messages,
            "underConstruction.pages.contact.panel.hoursTitle",
          ) ?? "Business Hours",
        weekdaysLabel:
          getNestedMessage(
            messages,
            "underConstruction.pages.contact.panel.weekdays",
          ) ?? "Weekdays",
        saturdayLabel:
          getNestedMessage(
            messages,
            "underConstruction.pages.contact.panel.saturday",
          ) ?? "Saturday",
        sundayLabel:
          getNestedMessage(
            messages,
            "underConstruction.pages.contact.panel.sunday",
          ) ?? "Sunday",
        closedLabel:
          getNestedMessage(
            messages,
            "underConstruction.pages.contact.panel.closed",
          ) ?? "Closed",
      },
      whatsapp: {
        label:
          getNestedMessage(
            messages,
            "underConstruction.pages.contact.panel.whatsapp",
          ) ?? "WhatsApp",
        chatNow:
          getNestedMessage(
            messages,
            "underConstruction.pages.contact.panel.chatNow",
          ) ?? "Chat now",
        comingSoon:
          getNestedMessage(
            messages,
            "underConstruction.pages.contact.panel.comingSoon",
          ) ?? "Coming soon",
      },
    },
  };
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
  const messages = getMessagesForLocale(locale);
  const title =
    getNestedMessage(messages, "underConstruction.pages.contact.title") ??
    siteFacts.company.name;
  const description =
    getNestedMessage(messages, "underConstruction.pages.contact.description") ??
    "Get in touch with our team for inquiries, support, or partnership opportunities.";

  const metadata = generateMetadataForPath({
    locale: locale as SeoLocale,
    pageType: "contact",
    path: "/contact",
    config: {
      title,
      description,
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

interface ContactMethodsCardProps {
  copy: {
    title: string;
    emailLabel: string;
    phoneLabel: string;
  };
  whatsappCopy: {
    label: string;
    chatNow: string;
    comingSoon: string;
  };
  isWhatsAppConfigured: boolean;
  whatsappNumber: string | undefined;
  whatsAppUrl: string | undefined;
}

function ContactMethodsCard({
  copy,
  whatsappCopy,
  isWhatsAppConfigured,
  whatsappNumber,
  whatsAppUrl,
}: ContactMethodsCardProps) {
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

        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{whatsappCopy.label}</p>
            <p className="text-muted-foreground" translate="no">
              {isWhatsAppConfigured ? whatsappNumber : whatsappCopy.comingSoon}
            </p>
          </div>
          {whatsAppUrl !== undefined && (
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              {whatsappCopy.chatNow} →
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = getMessagesForLocale(locale);
  const copy = getContactCopy(messages, locale);
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
  const whatsappNumber = siteFacts.contact.whatsapp;
  const whatsappConfigured = checkWhatsApp(whatsappNumber);
  const whatsAppUrl = whatsappConfigured
    ? buildWhatsAppUrl(whatsappNumber)
    : undefined;

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
            <ContactMethodsCard
              copy={copy.panel.contact}
              whatsappCopy={copy.panel.whatsapp}
              isWhatsAppConfigured={whatsappConfigured}
              whatsappNumber={whatsappNumber}
              whatsAppUrl={whatsAppUrl}
            />

            <Card className="p-6">
              <h3 className="mb-4 text-xl font-semibold">
                {copy.panel.hours.title}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{copy.panel.hours.weekdaysLabel}</span>
                  <span className="text-muted-foreground">
                    {siteFacts.contact.businessHours?.weekdays}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{copy.panel.hours.saturdayLabel}</span>
                  <span className="text-muted-foreground">
                    {siteFacts.contact.businessHours?.saturday}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{copy.panel.hours.sundayLabel}</span>
                  <span className="text-muted-foreground">
                    {copy.panel.hours.closedLabel}
                  </span>
                </div>
              </div>
            </Card>
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

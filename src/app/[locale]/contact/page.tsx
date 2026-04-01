import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { MessageCircle } from "lucide-react";
import type { Locale } from "@/types/i18n";
import { getContactCopy } from "@/lib/contact/getContactCopy";
import { pickMessages } from "@/lib/i18n/client-messages";
import { getTranslationsCached } from "@/lib/i18n/server/getTranslationsCached";
import {
  loadCriticalMessages,
  loadDeferredMessages,
} from "@/lib/load-messages";
import {
  generateMetadataForPath,
  type Locale as SeoLocale,
} from "@/lib/seo-metadata";
import {
  ContactFaqFallback,
  ContactFormFallback,
  ContactPageFallback,
  ContactPageHeader,
} from "@/app/[locale]/contact/contact-page-shell";
import { ContactForm } from "@/components/contact/contact-form";
import { FaqSection } from "@/components/sections/faq-section";
import { Card } from "@/components/ui/card";
import { generateLocaleStaticParams } from "@/app/[locale]/generate-static-params";
import { siteFacts } from "@/config/site-facts";
import { isWhatsAppConfigured as checkWhatsApp } from "@/config/paths/site-config";
import { COUNT_TWO } from "@/constants";

const CONTACT_FAQ_ITEMS = [
  "moq",
  "leadTime",
  "payment",
  "samples",
  "oem",
] as const;

function buildWhatsAppUrl(whatsappNumber: string | undefined) {
  return whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`
    : undefined;
}

function buildFaqItems(
  faqT: Awaited<ReturnType<typeof getTranslationsCached>>,
) {
  return CONTACT_FAQ_ITEMS.map((key) => ({
    key,
    question: faqT(`items.${key}.question`, {
      established: siteFacts.company.established,
      countries: siteFacts.stats.exportCountries,
      employees: siteFacts.company.employees,
    }),
    answer: faqT(`items.${key}.answer`, {
      established: siteFacts.company.established,
      countries: siteFacts.stats.exportCountries,
      employees: siteFacts.company.employees,
    }),
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
  const t = await getTranslationsCached({
    locale,
    namespace: "underConstruction.pages.contact",
  });

  return generateMetadataForPath({
    locale: locale as SeoLocale,
    pageType: "contact",
    path: "/contact",
    config: {
      title: t("title"),
      description: t("description"),
    },
  });
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
            <p className="text-muted-foreground">
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

async function ContactContent({ locale }: { locale: string }) {
  setRequestLocale(locale);

  const [copy, formT, faqT, criticalMessages, deferredMessages] =
    await Promise.all([
      getContactCopy(locale as Locale),
      getTranslationsCached({
        locale,
        namespace: "contact.form",
      }),
      getTranslationsCached({
        locale,
        namespace: "faq",
      }),
      loadCriticalMessages(locale as Locale),
      loadDeferredMessages(locale as Locale),
    ]);
  const mergedMessages = {
    ...criticalMessages,
    ...deferredMessages,
  };

  const whatsappNumber = siteFacts.contact.whatsapp;
  const whatsappConfigured = checkWhatsApp(whatsappNumber);
  const whatsAppUrl = whatsappConfigured
    ? buildWhatsAppUrl(whatsappNumber)
    : undefined;
  const faqItems = buildFaqItems(faqT);
  const contactClientMessages = pickMessages(mergedMessages, [
    "contact",
    "apiErrors",
  ]);

  return (
    <div className="min-h-[80vh] px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <ContactPageHeader
          title={copy.header.title}
          description={copy.header.description}
        />

        <div className="grid gap-8 md:grid-cols-2">
          <Suspense
            fallback={
              <ContactFormFallback
                title={formT("title")}
                description={formT("description")}
                labels={{
                  firstName: formT("firstName"),
                  lastName: formT("lastName"),
                  email: formT("email"),
                  company: formT("company"),
                  subject: formT("subject"),
                  message: formT("message"),
                  acceptPrivacy: formT("acceptPrivacy"),
                  submit: formT("submit"),
                }}
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

          {/* 联系信息 */}
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

      <Suspense
        fallback={
          <ContactFaqFallback title={faqT("sectionTitle")} items={faqItems} />
        }
      >
        <FaqSection items={[...CONTACT_FAQ_ITEMS]} locale={locale as Locale} />
      </Suspense>
    </div>
  );
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;

  return (
    <Suspense fallback={<ContactPageFallback locale={locale} />}>
      <ContactPageInner locale={locale} />
    </Suspense>
  );
}

async function ContactPageInner({ locale }: { locale: string }) {
  await connection();

  return <ContactContent locale={locale} />;
}

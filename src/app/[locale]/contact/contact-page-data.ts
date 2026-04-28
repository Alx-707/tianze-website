import "server-only";

import {
  LAYER1_FACTS,
  extractFaqFromMetadata,
  generateFaqSchemaFromItems,
  interpolateFaqAnswer,
} from "@/lib/content/mdx-faq";
import { getContactCopyFromMessages } from "@/lib/contact/getContactCopy";
import { CONTENT_MANIFEST } from "@/lib/content-manifest.generated";
import { readRequiredMessagePath } from "@/lib/i18n/read-message-path";
import { mergeObjects } from "@/lib/merge-objects";
import type { FaqItem, Locale, Page } from "@/types/content.types";
import enCriticalMessages from "@messages/en/critical.json";
import enDeferredMessages from "@messages/en/deferred.json";
import zhCriticalMessages from "@messages/zh/critical.json";
import zhDeferredMessages from "@messages/zh/deferred.json";

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

export interface ContactPageData {
  page: Page;
  messages: Record<string, unknown>;
  copy: ReturnType<typeof getContactCopyFromMessages>;
  faqItems: FaqItem[];
  faqSectionTitle: string;
  faqSchema: ReturnType<typeof generateFaqSchemaFromItems> | null;
}

export function getStaticMessages(locale: Locale): Record<string, unknown> {
  return STATIC_MESSAGES_BY_LOCALE[locale];
}

export function getStaticContactPage(locale: Locale): Page {
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

export function getContactPageData(locale: Locale): ContactPageData {
  const page = getStaticContactPage(locale);
  const messages = getStaticMessages(locale);
  const copy = getContactCopyFromMessages(messages);
  const faqItems: FaqItem[] = extractFaqFromMetadata(page.metadata).map(
    (item) => ({
      ...item,
      answer: interpolateFaqAnswer(item.answer, LAYER1_FACTS),
    }),
  );
  const faqSectionTitle = readRequiredMessagePath(messages, [
    "faq",
    "sectionTitle",
  ]);
  const faqSchema =
    faqItems.length > 0 ? generateFaqSchemaFromItems(faqItems, locale) : null;

  return {
    page,
    messages,
    copy,
    faqItems,
    faqSectionTitle,
    faqSchema,
  };
}

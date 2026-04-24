import type { FaqItem } from "@/types/content.types";

export function extractFaqFromMetadata(
  metadata: Record<string, unknown>,
): FaqItem[] {
  const { faq } = metadata;
  if (!Array.isArray(faq)) return [];

  return faq.filter(
    (item): item is FaqItem =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as FaqItem).id === "string" &&
      typeof (item as FaqItem).question === "string" &&
      typeof (item as FaqItem).answer === "string",
  );
}

export function interpolateFaqAnswer(
  answer: string,
  facts: Record<string, string | number>,
): string {
  return answer.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = facts[key];
    return value !== undefined ? String(value) : match;
  });
}

interface FaqSchemaQuestion {
  "@type": "Question";
  name: string;
  acceptedAnswer: {
    "@type": "Answer";
    text: string;
  };
}

interface FaqSchema {
  "@context": string;
  "@type": "FAQPage";
  inLanguage: string;
  mainEntity: FaqSchemaQuestion[];
}

export function generateFaqSchemaFromItems(
  items: FaqItem[],
  locale: string,
): FaqSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

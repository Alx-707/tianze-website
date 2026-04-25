import { getTranslations } from "next-intl/server";
import { JsonLdScript } from "@/components/seo";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { SectionHead } from "@/components/ui/section-head";
import { siteFacts } from "@/config/site-facts";
import { generateFaqSchemaFromItems } from "@/lib/content/mdx-faq";
import type { FaqItem, Locale } from "@/types/content.types";

const FAQ_ICU_VALUES = {
  established: siteFacts.company.established,
  countries: siteFacts.stats.exportCountries,
  employees: siteFacts.company.employees,
};

interface FaqSectionKeyProps {
  items: string[];
  faqItems?: never;
  title?: string;
  subtitle?: string;
  locale: Locale;
}

interface FaqSectionDirectProps {
  items?: never;
  faqItems: FaqItem[];
  title?: string;
  subtitle?: string;
  locale: Locale;
}

type FaqSectionProps = FaqSectionKeyProps | FaqSectionDirectProps;

export async function FaqSection(props: FaqSectionProps) {
  const { title, subtitle, locale } = props;
  const t = await getTranslations("faq");

  let faqData: Array<{ key: string; question: string; answer: string }>;
  let schemaData: unknown;

  if ("faqItems" in props && props.faqItems) {
    faqData = props.faqItems.map((item) => ({
      key: item.id,
      question: item.question,
      answer: item.answer,
    }));
    schemaData = generateFaqSchemaFromItems(props.faqItems, locale);
  } else {
    const keys = props.items ?? [];
    faqData = keys.map((key) => ({
      key,
      question: t(`items.${key}.question`, FAQ_ICU_VALUES),
      answer: t(`items.${key}.answer`, FAQ_ICU_VALUES),
    }));
    schemaData = generateFaqSchemaFromItems(
      faqData.map(({ key, question, answer }) => ({
        id: key,
        question,
        answer,
      })),
      locale,
    );
  }

  return (
    <>
      <JsonLdScript data={schemaData} />
      <section className="section-divider py-14 md:py-[72px]">
        <div className="mx-auto max-w-[1080px] px-6">
          <SectionHead
            title={title ?? t("sectionTitle")}
            {...(subtitle ? { subtitle } : {})}
          />
          <FaqAccordion items={faqData} />
        </div>
      </section>
    </>
  );
}

import { getTranslationsCached } from "@/lib/i18n/server/getTranslationsCached";
import { JsonLdScript } from "@/components/seo";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { SectionHead } from "@/components/ui/section-head";
import { generateFAQSchema } from "@/lib/structured-data";
import { siteFacts } from "@/config/site-facts";
import type { Locale } from "@/types/content.types";

interface FaqSectionProps {
  items: string[];
  title?: string;
  subtitle?: string;
  locale: Locale;
}

/** ICU interpolation values for FAQ content that references company numbers */
const FAQ_ICU_VALUES = {
  established: siteFacts.company.established,
  countries: siteFacts.stats.exportCountries,
  employees: siteFacts.company.employees,
};

export async function FaqSection({
  items,
  title,
  subtitle,
  locale,
}: FaqSectionProps) {
  const t = await getTranslationsCached({ locale, namespace: "faq" });

  const faqData = items.map((key) => ({
    key,
    question: t(`items.${key}.question`, FAQ_ICU_VALUES),
    answer: t(`items.${key}.answer`, FAQ_ICU_VALUES),
  }));

  const faqSchema = generateFAQSchema(
    faqData.map(({ question, answer }) => ({ question, answer })),
    locale,
  );

  return (
    <>
      <JsonLdScript data={faqSchema} />
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

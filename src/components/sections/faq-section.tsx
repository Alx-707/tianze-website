import { getTranslations } from "next-intl/server";
import { JsonLdScript } from "@/components/seo";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { SectionHead } from "@/components/ui/section-head";
import { generateFAQSchema } from "@/lib/structured-data";
import type { Locale } from "@/types/content.types";

interface FaqSectionProps {
  items: string[];
  title?: string;
  subtitle?: string;
  locale: Locale;
}

export async function FaqSection({
  items,
  title,
  subtitle,
  locale,
}: FaqSectionProps) {
  const t = await getTranslations("faq");

  const faqData = items.map((key) => ({
    key,
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
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

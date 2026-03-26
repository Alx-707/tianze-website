import { getTranslations } from "next-intl/server";
import { siteFacts } from "@/config/site-facts";
import { HomepageSectionShell } from "@/components/sections/homepage-section-shell";

const SCENARIO_KEYS = ["item1", "item2", "item3"] as const;

export async function ScenariosSection() {
  const t = await getTranslations("home.scenarios");

  return (
    <HomepageSectionShell
      sectionClassName="py-14 md:py-[72px]"
      title={t("title")}
      subtitle={t("subtitle", { countries: siteFacts.stats.exportCountries })}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SCENARIO_KEYS.map((key) => (
          <div
            key={key}
            className="group overflow-hidden rounded-lg bg-card shadow-card transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            {/* Image placeholder */}
            <div className="h-40 bg-gradient-to-br from-muted to-muted/60 transition-transform duration-300 group-hover:scale-[1.02]" />

            {/* Body */}
            <div className="p-5">
              <h3 className="text-[18px] font-bold leading-snug">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`${key}.desc`)}
              </p>

              {/* Quote */}
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-[13px] italic text-muted-foreground">
                  {t(`${key}.quote`)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </HomepageSectionShell>
  );
}

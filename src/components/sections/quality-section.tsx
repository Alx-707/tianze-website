import {
  type LucideIcon,
  Check,
  Clock,
  FileText,
  LayoutGrid,
  Package,
  User,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { HomepageSectionShell } from "@/components/sections/homepage-section-shell";

const COMMITMENT_KEYS = [
  "commitment1",
  "commitment2",
  "commitment3",
  "commitment4",
  "commitment5",
] as const;

const STANDARD_KEYS = ["astm", "asnzs", "iec", "nom"] as const;

const COMMITMENT_ICONS: Record<string, LucideIcon> = {
  commitment1: Clock,
  commitment2: FileText,
  commitment3: Package,
  commitment4: User,
  commitment5: LayoutGrid,
};

export async function QualitySection() {
  const t = await getTranslations("home.quality");

  return (
    <HomepageSectionShell
      sectionClassName="py-14 md:py-[72px]"
      title={t("title")}
      subtitle={t("subtitle")}
    >
      {/* Commitment list — stacked on mobile, 2 columns on desktop */}
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-2">
        {COMMITMENT_KEYS.map((key) => {
          const Icon = COMMITMENT_ICONS[key];
          return (
            <div
              key={key}
              className="flex items-start gap-4 bg-card px-6 py-5 transition-colors duration-150 hover:bg-[var(--primary-50)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-primary">
                {Icon ? <Icon size={20} /> : null}
              </div>
              <div>
                <h3 className="text-[15px] font-semibold">
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {t(`${key}.desc`)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certification — verified */}
      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("certifications.title")}
        </h3>
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Check size={16} className="text-primary" aria-hidden />
          </div>
          <div>
            <span className="font-semibold">{t("certifications.iso9001")}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              <span aria-hidden>#</span>
              {t("certifications.iso9001Num")}
            </span>
          </div>
          <span className="ml-auto rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {t("certifications.certified")}
          </span>
        </div>
      </div>

      {/* Standards compliance */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {STANDARD_KEYS.map((key) => (
          <div
            key={key}
            className="flex items-center gap-1.5 rounded-md bg-muted/50 px-3 py-1.5 text-[13px] font-medium"
          >
            <span>{t(`standards.${key}`)}</span>
            {key === "asnzs" ? (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {t("certifications.applying")}
              </span>
            ) : (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                {t("certifications.compliant")}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Logo wall placeholder */}
      <div className="mt-8 flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-border">
        <span className="text-sm text-muted-foreground">{t("logoWall")}</span>
      </div>
    </HomepageSectionShell>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHead } from "@/components/ui/section-head";

const RESOURCE_COUNT = 4;

const ICONS = [
  /* Catalog */
  <svg
    key="catalog"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden
  >
    <path
      d="M3 4h5l2 2h7v10H3V4z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>,
  /* Specs */
  <svg
    key="specs"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden
  >
    <rect
      x="4"
      y="3"
      width="12"
      height="14"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M7 7h6M7 10h6M7 13h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>,
  /* CAD */
  <svg
    key="cad"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden
  >
    <rect
      x="3"
      y="3"
      width="14"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M7 13l3-4 3 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  /* Certs */
  <svg
    key="certs"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden
  >
    <circle cx="10" cy="9" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M7.5 13.5L7 18l3-1.5L13 18l-.5-4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>,
] as const;

function ResourceCard({
  icon,
  title,
  desc,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  link: string;
}) {
  return (
    <a
      href={link}
      className="flex flex-col gap-3 bg-background p-6 transition-colors hover:bg-[var(--primary-50)]"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-light)] text-primary">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold leading-snug">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <span className="mt-auto text-sm font-medium text-primary">&rarr;</span>
    </a>
  );
}

export function ResourcesSection() {
  const t = useTranslations("home");

  const resources = Array.from({ length: RESOURCE_COUNT }, (_, i) => {
    const key = `item${String(i + 1)}`;
    return {
      icon: ICONS[i],
      title: t(`resources.${key}.title`),
      desc: t(`resources.${key}.desc`),
      link: t(`resources.${key}.link`),
    };
  });

  return (
    <section className="section-divider py-14 md:py-[72px]">
      <ScrollReveal className="mx-auto max-w-[1080px] px-6">
        <SectionHead
          title={t("resources.title")}
          subtitle={t("resources.subtitle")}
        />
        <div className="overflow-hidden rounded-lg border bg-border">
          <div className="grid grid-cols-1 gap-[2px] sm:grid-cols-2 lg:grid-cols-4">
            {resources.map((resource) => (
              <ResourceCard key={resource.title} {...resource} />
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

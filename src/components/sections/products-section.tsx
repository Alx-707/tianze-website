"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHead } from "@/components/ui/section-head";

const PRODUCT_COUNT = 4;
const SPECS_PER_PRODUCT = 3;

function ProductCard({
  tag,
  title,
  specs,
  standard,
  link,
}: {
  tag: string;
  title: string;
  specs: string[];
  standard: string;
  link: string;
}) {
  return (
    <div className="group rounded-lg bg-background p-6 shadow-card transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-active)]">
      <span className="inline-block rounded bg-[var(--primary-light)] px-2.5 py-1 text-xs font-semibold text-primary">
        {tag}
      </span>
      <h3 className="mt-3 text-lg font-semibold leading-snug">{title}</h3>
      <ul className="mt-3 space-y-1.5">
        {specs.map((spec) => (
          <li
            key={spec}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
            {spec}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <span className="font-mono text-xs text-muted-foreground">
          {standard}
        </span>
        <Link
          href={link}
          className="text-sm font-medium text-primary hover:underline"
        >
          {title} &rarr;
        </Link>
      </div>
    </div>
  );
}

export function ProductsSection() {
  const t = useTranslations("home");

  const products = Array.from({ length: PRODUCT_COUNT }, (_, i) => {
    const key = `item${String(i + 1)}`;
    return {
      tag: t(`products.${key}.tag`),
      title: t(`products.${key}.title`),
      specs: Array.from({ length: SPECS_PER_PRODUCT }, (_unused, j) =>
        t(`products.${key}.spec${String(j + 1)}`),
      ),
      standard: t(`products.${key}.standard`),
      link: t(`products.${key}.link`),
    };
  });

  const action = (
    <Button variant="secondary" asChild>
      <Link href="/products">{t("products.cta")}</Link>
    </Button>
  );

  return (
    <section className="section-divider py-14 md:py-[72px]">
      <ScrollReveal className="mx-auto max-w-[1080px] px-6">
        <SectionHead
          title={t("products.title")}
          subtitle={t("products.subtitle")}
          action={action}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {products.map((product, index) => (
            <ScrollReveal
              key={product.tag}
              direction="scale"
              staggerIndex={index}
            >
              <ProductCard {...product} />
            </ScrollReveal>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

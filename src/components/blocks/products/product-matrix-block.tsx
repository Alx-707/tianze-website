"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/blocks/shared/product-card";
import { SectionHeader } from "@/components/blocks/shared/section-header";

export interface ProductMatrixBlockProps {
  className?: string;
  i18nNamespace?: string;
}

interface ProductConfig {
  image: { src: string; altKey: string };
  titleKey: string;
  featureKeys: readonly [string, string, string];
  buttonKey: string;
  href: string;
  isPrimary?: boolean;
}

const PRODUCTS: readonly ProductConfig[] = [
  {
    image: {
      src: "/images/products/bending-machine.jpg",
      altKey: "machines.image",
    },
    titleKey: "machines.title",
    featureKeys: [
      "machines.feature1",
      "machines.feature2",
      "machines.feature3",
    ],
    buttonKey: "machines.button",
    href: "/products/machines",
  },
  {
    image: { src: "/images/products/pvc-bends.jpg", altKey: "pvc.image" },
    titleKey: "pvc.title",
    featureKeys: ["pvc.feature1", "pvc.feature2", "pvc.feature3"],
    buttonKey: "pvc.button",
    href: "/products/pvc-conduits",
  },
  {
    image: {
      src: "/images/products/pneumatic-tubes.jpg",
      altKey: "pneumatic.image",
    },
    titleKey: "pneumatic.title",
    featureKeys: [
      "pneumatic.feature1",
      "pneumatic.feature2",
      "pneumatic.feature3",
    ],
    buttonKey: "pneumatic.button",
    href: "/products/pneumatic-tubes",
  },
  {
    image: { src: "/images/products/custom.jpg", altKey: "custom.image" },
    titleKey: "custom.title",
    featureKeys: ["custom.feature1", "custom.feature2", "custom.feature3"],
    buttonKey: "custom.button",
    href: "/contact",
    isPrimary: false,
  },
] as const;

export function ProductMatrixBlock({
  className,
  i18nNamespace = "home.products",
}: ProductMatrixBlockProps) {
  const t = useTranslations(i18nNamespace);

  return (
    <section
      id="products"
      className={cn("py-20 sm:py-28", className)}
      aria-labelledby="products-heading"
    >
      <div className="container mx-auto px-4">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <ProductCard
              key={product.titleKey}
              image={{
                src: product.image.src,
                alt: t(product.image.altKey),
              }}
              title={t(product.titleKey)}
              features={product.featureKeys.map((key) => t(key))}
              buttonText={t(product.buttonKey)}
              buttonHref={product.href}
              {...(product.isPrimary !== undefined
                ? { isPrimary: product.isPrimary }
                : {})}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

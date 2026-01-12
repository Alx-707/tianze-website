import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/types/content.types";
import {
  getAllProductsCached,
  getProductCategoriesCached,
  getProductStandardsCached,
} from "@/lib/content/products";
import {
  generateMetadataForPath,
  type Locale as SeoLocale,
} from "@/lib/seo-metadata";
import { ProductGrid } from "@/components/products/product-grid";
import { generateLocaleStaticParams } from "@/app/[locale]/generate-static-params";
import { ProductCategoryFilter } from "@/app/[locale]/products/product-category-filter";
import { ProductStandardsFilter } from "@/app/[locale]/products/product-standards-filter";
import {
  PRODUCT_STANDARDS,
  type ProductStandardId,
} from "@/constants/product-standards";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

function isProductStandardId(value: string): value is ProductStandardId {
  return Object.prototype.hasOwnProperty.call(PRODUCT_STANDARDS, value);
}

type ProductsSearchParams = {
  category?: string;
  standard?: string | string[];
};

interface ProductsPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams?: Promise<ProductsSearchParams>;
}

export async function generateMetadata({
  params,
}: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "products",
  });

  return generateMetadataForPath({
    locale: locale as SeoLocale,
    pageType: "products",
    path: "/products",
    config: {
      title: t("pageTitle"),
      description: t("pageDescription"),
    },
  });
}

function ProductsLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <div className="mb-4 h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="h-6 w-96 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="mb-8 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 w-24 animate-pulse rounded-full bg-muted"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}

// eslint-disable-next-line complexity -- filtering logic requires multiple conditions
async function ProductsContent({
  locale,
  searchParams,
}: {
  locale: string;
  searchParams?: ProductsSearchParams;
}) {
  setRequestLocale(locale);

  const t = await getTranslations({
    locale,
    namespace: "products",
  });

  const currentCategory =
    searchParams?.category !== undefined && searchParams.category.trim() !== ""
      ? searchParams.category
      : undefined;

  const currentStandardsRaw = searchParams?.standard;
  const currentStandardsList = Array.isArray(currentStandardsRaw)
    ? currentStandardsRaw
    : currentStandardsRaw !== undefined
      ? [currentStandardsRaw]
      : [];

  const currentStandards = currentStandardsList
    .map((s) => s.trim())
    .filter((s): s is ProductStandardId => {
      if (s === "") return false;
      return isProductStandardId(s);
    });

  const [products, categories, standards] = await Promise.all([
    getAllProductsCached(locale as Locale, {
      ...(currentCategory !== undefined && { category: currentCategory }),
      ...(currentStandards.length > 0 && { standards: currentStandards }),
    }),
    getProductCategoriesCached(locale as Locale),
    getProductStandardsCached(locale as Locale),
  ]);

  const linkPrefix = `/${locale}/products`;

  const cardLabels = {
    moq: t("card.moq"),
    leadTime: t("card.leadTime"),
    supplyCapacity: t("card.supplyCapacity"),
    featured: t("featured"),
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <header className="mb-8 md:mb-12">
        <h1 className="text-heading mb-4">{t("pageTitle")}</h1>
        <p className="text-body max-w-2xl text-muted-foreground">
          {t("pageDescription")}
        </p>
      </header>

      {/* Category Filter */}
      {categories.length > 0 && (
        <ProductCategoryFilter
          categories={categories}
          {...(currentCategory !== undefined && { currentCategory })}
          {...(currentStandards.length > 0 && { currentStandards })}
          allCategoriesLabel={t("allCategories")}
          pathname={linkPrefix}
          className="mb-8"
        />
      )}

      {/* Standards Filter */}
      {standards.length > 0 && (
        <ProductStandardsFilter
          standards={standards}
          {...(currentStandards.length > 0 && { currentStandards })}
          {...(currentCategory !== undefined && { currentCategory })}
          allStandardsLabel={t("allStandards")}
          ariaLabel={t("standardsFilterAriaLabel")}
          pathname={linkPrefix}
          className="mb-8"
        />
      )}

      {/* Product Grid */}
      {products.length > 0 ? (
        <ProductGrid
          products={products}
          linkPrefix={linkPrefix}
          labels={cardLabels}
          lg={3}
          md={2}
          sm={1}
          gap={6}
        />
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{t("emptyState")}</p>
        </div>
      )}
    </main>
  );
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <Suspense fallback={<ProductsLoadingSkeleton />}>
      <ProductsContent
        locale={locale}
        {...(resolvedSearchParams && { searchParams: resolvedSearchParams })}
      />
    </Suspense>
  );
}

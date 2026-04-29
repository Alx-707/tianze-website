import type { ProductSummary } from "@/types/content.types";
import { cn } from "@/lib/utils";
import {
  ProductCard,
  type ProductCardLabels,
} from "@/components/products/product-card";
import {
  getGapClass,
  getLgColumnClass,
  getMdColumnClass,
  getSmColumnClass,
} from "@/components/products/grid-utils";

export interface ProductGridProps {
  products: ProductSummary[];
  /** Prefix for product links */
  linkPrefix?: string;
  /** Number of columns on small screens (sm breakpoint) */
  sm?: 1 | 2;
  /** Number of columns on medium screens (md breakpoint) */
  md?: 2 | 3;
  /** Number of columns on large screens (lg breakpoint) */
  lg?: 3 | 4;
  /** Gap between grid items */
  gap?: 4 | 6 | 8;
  /** Whether to show cover images */
  showCoverImage?: boolean;
  /** Whether to show category badges */
  showCategory?: boolean;
  /** Whether to show B2B trade info */
  showTradeInfo?: boolean;
  /** Custom class name for the grid container */
  className?: string;
  /** Localized labels for product cards */
  labels?: ProductCardLabels;
}

/**
 * Responsive grid layout for product cards.
 *
 * Supports configurable columns at different breakpoints for flexible layouts.
 * Designed as a Server Component.
 */
export function ProductGrid({
  products,
  linkPrefix = "/products",
  sm = 1,
  md = 2,
  lg = 3,
  gap = 6,
  showCoverImage = true,
  showCategory = true,
  showTradeInfo = true,
  className,
  labels,
}: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  const gridClasses = cn(
    "grid grid-cols-1",
    getSmColumnClass(sm),
    getMdColumnClass(md),
    getLgColumnClass(lg),
    getGapClass(gap),
    className,
  );

  return (
    <div className={gridClasses}>
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          product={product}
          linkPrefix={linkPrefix}
          showCoverImage={showCoverImage}
          showCategory={showCategory}
          showTradeInfo={showTradeInfo}
          {...(labels !== undefined && { labels })}
        />
      ))}
    </div>
  );
}

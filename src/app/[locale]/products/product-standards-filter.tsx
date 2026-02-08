// eslint-disable-next-line no-restricted-imports -- filter constructs locale-prefixed URLs via buildProductsFilterHref
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  PRODUCT_STANDARDS,
  type ProductStandardId,
} from "@/constants/product-standards";
import { buildProductsFilterHref } from "@/app/[locale]/products/product-filter-utils";

export interface ProductStandardsFilterProps {
  standards: ProductStandardId[];
  currentStandards?: ProductStandardId[];
  currentCategory?: string;
  allStandardsLabel: string;
  ariaLabel: string;
  pathname: string;
  className?: string;
}

function toggleStandard(
  selected: ProductStandardId[] | undefined,
  standard: ProductStandardId,
): ProductStandardId[] {
  const current = selected ?? [];
  if (current.includes(standard)) {
    return current.filter((s) => s !== standard);
  }
  return [...current, standard];
}

export function ProductStandardsFilter({
  standards,
  currentStandards,
  currentCategory,
  allStandardsLabel,
  ariaLabel,
  pathname,
  className,
}: ProductStandardsFilterProps) {
  const hasSelection =
    currentStandards !== undefined && currentStandards.length > 0;

  return (
    <nav
      className={cn("flex flex-wrap gap-2", className)}
      aria-label={ariaLabel}
    >
      <Link
        href={buildProductsFilterHref({
          pathname,
          ...(currentCategory && { category: currentCategory }),
        })}
        className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Badge
          variant={hasSelection ? "outline" : "default"}
          className="cursor-pointer transition-colors hover:bg-primary/90"
        >
          {allStandardsLabel}
        </Badge>
      </Link>

      {standards.map((standard) => {
        const nextSelection = toggleStandard(currentStandards, standard);
        const isSelected = currentStandards?.includes(standard) === true;
        const { label } = PRODUCT_STANDARDS[standard];

        return (
          <Link
            key={standard}
            href={buildProductsFilterHref({
              pathname,
              ...(currentCategory && { category: currentCategory }),
              ...(nextSelection.length > 0 && { standards: nextSelection }),
            })}
            className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Badge
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer transition-colors hover:bg-primary/90"
            >
              {label}
            </Badge>
          </Link>
        );
      })}
    </nav>
  );
}

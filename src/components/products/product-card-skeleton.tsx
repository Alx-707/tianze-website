import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export interface ProductCardSkeletonProps {
  /** Whether to show cover image skeleton */
  showCoverImage?: boolean;
  /** Whether to show category badge skeleton */
  showCategory?: boolean;
  /** Whether to show trade info skeleton */
  showTradeInfo?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Skeleton loading state for ProductCard.
 *
 * Matches the structure of ProductCard for smooth loading transitions.
 */
export function ProductCardSkeleton({
  showCoverImage = true,
  showCategory = true,
  showTradeInfo = true,
  className,
}: ProductCardSkeletonProps) {
  return (
    <Card className={cn("h-full overflow-hidden", className)}>
      {showCoverImage && (
        <div className="aspect-[4/3] w-full animate-pulse bg-muted" />
      )}

      <CardHeader className="gap-3">
        {showCategory && (
          <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
        )}
        <div className="space-y-2">
          <div className="h-5 w-full animate-pulse rounded bg-muted" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>

      {showTradeInfo && (
        <CardFooter className="mt-auto gap-4">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </CardFooter>
      )}
    </Card>
  );
}

export interface ProductGridSkeletonProps {
  /** Number of skeleton cards to display */
  count?: number;
  /** Number of columns on small screens */
  sm?: 1 | 2;
  /** Number of columns on medium screens */
  md?: 2 | 3;
  /** Number of columns on large screens */
  lg?: 3 | 4;
  /** Gap between grid items */
  gap?: 4 | 6 | 8;
  /** Custom class name */
  className?: string;
}

// Static column class getters
function getSmColumnClass(sm: 1 | 2): string {
  if (sm === 1) return "sm:grid-cols-1";
  return "sm:grid-cols-2";
}

function getMdColumnClass(md: 2 | 3): string {
  if (md === 2) return "md:grid-cols-2";
  return "md:grid-cols-3";
}

function getLgColumnClass(lg: 3 | 4): string {
  if (lg === 3) return "lg:grid-cols-3";
  return "lg:grid-cols-4";
}

function getGapClass(gap: 4 | 6 | 8): string {
  if (gap === 4) return "gap-4";
  if (gap === 6) return "gap-6";
  return "gap-8";
}

/**
 * Skeleton loading state for ProductGrid.
 *
 * Displays multiple ProductCardSkeleton components in a grid layout.
 */
export function ProductGridSkeleton({
  count = 6,
  sm = 1,
  md = 2,
  lg = 3,
  gap = 6,
  className,
}: ProductGridSkeletonProps) {
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
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

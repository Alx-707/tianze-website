import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export interface PostCardSkeletonProps {
  /** Whether to show the cover image skeleton */
  showCoverImage?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Skeleton loading state for PostCard component.
 *
 * Matches the layout of PostCard to prevent layout shift during loading.
 */
export function PostCardSkeleton({
  showCoverImage = true,
  className,
}: PostCardSkeletonProps) {
  return (
    <Card className={cn("h-full overflow-hidden", className)}>
      {/* Cover Image Skeleton */}
      {showCoverImage && (
        <div className="relative aspect-[16/9] w-full animate-pulse bg-muted" />
      )}

      <CardHeader className="gap-3">
        {/* Tags Skeleton */}
        <div className="flex gap-1.5">
          <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-full animate-pulse rounded bg-muted" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </CardHeader>

      {/* Description Skeleton */}
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>

      {/* Footer Skeleton */}
      <CardFooter className="mt-auto gap-4">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </CardFooter>
    </Card>
  );
}

export interface PostGridSkeletonProps {
  /** Number of skeleton cards to display */
  count?: number;
  /** Whether to show cover image in skeletons */
  showCoverImage?: boolean;
  /** Custom class name for the grid container */
  className?: string;
}

/**
 * Skeleton loading state for PostGrid component.
 *
 * Displays multiple PostCardSkeleton components in a grid layout.
 */
export function PostGridSkeleton({
  count = 6,
  showCoverImage = true,
  className,
}: PostGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <PostCardSkeleton
          key={`skeleton-${index}`}
          showCoverImage={showCoverImage}
        />
      ))}
    </div>
  );
}

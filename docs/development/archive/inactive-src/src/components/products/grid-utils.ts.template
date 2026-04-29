/**
 * Shared grid utility functions for product grid layouts.
 *
 * Used by both ProductGrid and ProductGridSkeleton to generate
 * responsive Tailwind CSS grid classes without dynamic class names.
 */

/** Static column class getter for sm breakpoint to avoid object injection */
export function getSmColumnClass(sm: 1 | 2): string {
  if (sm === 1) return "sm:grid-cols-1";
  return "sm:grid-cols-2";
}

/** Static column class getter for md breakpoint to avoid object injection */
export function getMdColumnClass(md: 2 | 3): string {
  if (md === 2) return "md:grid-cols-2";
  return "md:grid-cols-3";
}

/** Static column class getter for lg breakpoint to avoid object injection */
export function getLgColumnClass(lg: 3 | 4): string {
  if (lg === 3) return "lg:grid-cols-3";
  return "lg:grid-cols-4";
}

/** Static gap class getter to avoid object injection */
export function getGapClass(gap: 4 | 6 | 8): string {
  if (gap === 4) return "gap-4";
  if (gap === 6) return "gap-6";
  return "gap-8";
}

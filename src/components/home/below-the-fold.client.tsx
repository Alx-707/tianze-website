"use client";

import dynamic from "next/dynamic";
import {
  CallToActionSkeleton,
  ProjectOverviewSkeleton,
} from "@/components/home/below-the-fold-skeleton";

// Dynamic imports for below-the-fold content
// ProductMatrix: 4-column product grid with category cards
const ProductMatrix = dynamic(
  () =>
    import("@/components/blocks/products/product-matrix-block").then(
      (m) => m.ProductMatrixBlock,
    ),
  { loading: () => <ProjectOverviewSkeleton /> },
);

// CTA: simplified gradient banner
const CallToAction = dynamic(
  () =>
    import("@/components/blocks/cta/cta-banner-block").then(
      (m) => m.CTABannerBlock,
    ),
  { loading: () => <CallToActionSkeleton /> },
);

export function BelowTheFoldClient() {
  return (
    <>
      <ProductMatrix />
      <CallToAction />
    </>
  );
}

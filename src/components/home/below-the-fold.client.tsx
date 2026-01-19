"use client";

import dynamic from "next/dynamic";
import {
  CallToActionSkeleton,
  ProjectOverviewSkeleton,
} from "@/components/home/below-the-fold-skeleton";

// Dynamic imports for below-the-fold content
// Simplified for Tianze Pipe Industry - focus on capabilities and CTA
const ProjectOverview = dynamic(
  () =>
    import("@/components/blocks/features/features-grid-block").then(
      (m) => m.FeaturesGridBlock,
    ),
  { loading: () => <ProjectOverviewSkeleton /> },
);
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
      <ProjectOverview />
      <CallToAction />
    </>
  );
}

import type { Metadata } from "next";
import { generateMetadataForPath, type Locale } from "@/lib/seo-metadata";
import { GridFrame } from "@/components/grid";
import { HeroSection } from "@/components/sections/hero-section";
import { ChainSection } from "@/components/sections/chain-section";
import { ProductsSection } from "@/components/sections/products-section";
import { ResourcesSection } from "@/components/sections/resources-section";
import { SampleCTA } from "@/components/sections/sample-cta";
import { ScenariosSection } from "@/components/sections/scenarios-section";
import { QualitySection } from "@/components/sections/quality-section";
import { FinalCTA } from "@/components/sections/final-cta";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface HomePageProps {
  params: Promise<{ locale: "en" | "zh" }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateMetadataForPath({
    locale: locale as Locale,
    pageType: "home",
    path: "",
  });
}

export default async function Home({ params }: HomePageProps) {
  // Await params per Next.js async page convention
  await params;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GridFrame
        crosshairs={[
          { top: 0, left: 0 },
          { bottom: 0, right: 0 },
        ]}
      >
        <HeroSection />
        <ChainSection />
        <ProductsSection />
        <ResourcesSection />
        <SampleCTA />
        <ScenariosSection />
        <QualitySection />
      </GridFrame>
      <FinalCTA />
    </div>
  );
}

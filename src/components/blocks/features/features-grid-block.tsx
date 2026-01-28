"use client";

import {
  ArrowRight,
  CheckCircle,
  Code,
  ExternalLink,
  Globe,
  Palette,
  Rocket,
  Shield,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MAGIC_0_2 } from "@/constants/decimal";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

export interface FeatureItem {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  badge: string;
}

type ArchitectureColor = "blue" | "green" | "purple";

export interface ArchitectureLayer {
  titleKey: string;
  descriptionKey: string;
  technologies: string[];
  color: ArchitectureColor;
}

export interface CTAConfig {
  titleKey: string;
  descriptionKey: string;
  primaryButtonKey: string;
  secondaryButtonKey: string;
  secondaryButtonHref: string;
}

export interface FeaturesGridBlockProps {
  features?: FeatureItem[];
  highlights?: string[];
  architecture?: {
    frontend: ArchitectureLayer;
    ui: ArchitectureLayer;
    tooling: ArchitectureLayer;
  };
  cta?: CTAConfig;
  i18nNamespace?: string;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    icon: Zap,
    titleKey: "features.performance.title",
    descriptionKey: "features.performance.description",
    badge: "High Output",
  },
  {
    icon: Shield,
    titleKey: "features.security.title",
    descriptionKey: "features.security.description",
    badge: "ISO 9001",
  },
  {
    icon: Globe,
    titleKey: "features.i18n.title",
    descriptionKey: "features.i18n.description",
    badge: "100+",
  },
  {
    icon: Palette,
    titleKey: "features.themes.title",
    descriptionKey: "features.themes.description",
    badge: "Custom",
  },
  {
    icon: Code,
    titleKey: "features.typescript.title",
    descriptionKey: "features.typescript.description",
    badge: "ASTM",
  },
  {
    icon: Rocket,
    titleKey: "features.deployment.title",
    descriptionKey: "features.deployment.description",
    badge: "48h",
  },
];

const DEFAULT_HIGHLIGHTS: string[] = [
  "highlights.modern",
  "highlights.scalable",
  "highlights.accessible",
  "highlights.performant",
  "highlights.secure",
  "highlights.maintainable",
];

const DEFAULT_ARCHITECTURE = {
  frontend: {
    titleKey: "architecture.frontend.title",
    descriptionKey: "architecture.frontend.description",
    technologies: [],
    color: "blue" as const,
  },
  ui: {
    titleKey: "architecture.ui.title",
    descriptionKey: "architecture.ui.description",
    technologies: [],
    color: "green" as const,
  },
  tooling: {
    titleKey: "architecture.tooling.title",
    descriptionKey: "architecture.tooling.description",
    technologies: [],
    color: "purple" as const,
  },
};

const DEFAULT_CTA: CTAConfig = {
  titleKey: "cta.title",
  descriptionKey: "cta.description",
  primaryButtonKey: "cta.getStarted",
  secondaryButtonKey: "cta.viewSource",
  secondaryButtonHref: "/products",
};

const COLOR_CLASSES: Record<ArchitectureColor, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
};

interface TranslationFn {
  (key: string): string;
}

function FeatureGrid({
  t,
  features,
}: {
  t: TranslationFn;
  features: FeatureItem[];
}) {
  return (
    <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card
            key={index}
            className="group transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <Icon className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{feature.badge}</Badge>
              </div>
              <CardTitle className="text-xl">{t(feature.titleKey)}</CardTitle>
              <CardDescription>{t(feature.descriptionKey)}</CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}

function ProjectHighlights({
  t,
  highlights,
}: {
  t: TranslationFn;
  highlights: string[];
}) {
  return (
    <div className="mb-16">
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="text-2xl">{t("highlights.title")}</CardTitle>
          <CardDescription className="text-lg text-foreground/90">
            {t("highlights.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((key, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">{t(key)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TechnicalArchitecture({
  t,
  architecture,
}: {
  t: TranslationFn;
  architecture: FeaturesGridBlockProps["architecture"];
}) {
  if (!architecture) return null;

  const layers = [architecture.frontend, architecture.ui, architecture.tooling];

  return (
    <div className="mb-16">
      <h3 className="mb-8 text-center text-2xl font-bold">
        {t("architecture.title")}
      </h3>
      <div className="grid gap-6 lg:grid-cols-3">
        {layers.map((layer, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${COLOR_CLASSES[layer.color]}`}
                />
                {t(layer.titleKey)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-foreground/85">
                {t(layer.descriptionKey)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CTASection({ t, cta }: { t: TranslationFn; cta: CTAConfig }) {
  return (
    <div className="text-center">
      <Card className="mx-auto max-w-2xl bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle className="text-2xl">{t(cta.titleKey)}</CardTitle>
          <CardDescription className="text-lg text-foreground/90">
            {t(cta.descriptionKey)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="group">
              {t(cta.primaryButtonKey)}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a
                href={cta.secondaryButtonHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                {t(cta.secondaryButtonKey)}
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FeaturesGridBlock({
  features = DEFAULT_FEATURES,
  highlights = DEFAULT_HIGHLIGHTS,
  architecture = DEFAULT_ARCHITECTURE,
  cta = DEFAULT_CTA,
  i18nNamespace = "home.overview",
}: FeaturesGridBlockProps = {}) {
  const t = useTranslations(i18nNamespace);

  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: MAGIC_0_2,
    triggerOnce: true,
  });

  return (
    <section className="cv-1000 py-20">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`mx-auto max-w-6xl transition-all duration-700 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-foreground/85">
              {t("subtitle")}
            </p>
          </div>

          <FeatureGrid t={t} features={features} />
          <ProjectHighlights t={t} highlights={highlights} />
          <TechnicalArchitecture t={t} architecture={architecture} />
          <CTASection t={t} cta={cta} />
        </div>
      </div>
    </section>
  );
}

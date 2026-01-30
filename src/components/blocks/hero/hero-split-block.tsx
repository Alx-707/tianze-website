import Link from "next/link";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ImageCarousel } from "@/components/blocks/shared/image-carousel";
import { StatBar } from "@/components/blocks/shared/stat-bar";

export interface HeroSplitBlockMessages {
  badge?: string;
  title?: { line1?: string; line2?: string };
  subtitle?: string;
  scrollCta?: string;
  stats?: {
    factory?: string;
    material?: string;
    production?: string;
    repurchase?: string;
  };
  images?: { bender?: string; expander?: string; line?: string };
}

export interface HeroSplitBlockProps {
  messages: HeroSplitBlockMessages;
  className?: string;
}

const DEFAULT_IMAGES = [
  { src: "/images/hero/bending-machine.svg", altKey: "bender" },
  { src: "/images/hero/expander.svg", altKey: "expander" },
  { src: "/images/hero/production-line.svg", altKey: "line" },
];

// 安全的嵌套属性访问 - 数据来自开发者维护的 messages 对象，无外部攻击面
function getNestedValue(obj: HeroSplitBlockMessages, path: string): string {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (typeof cur !== "object" || cur === null) return "";
    // eslint-disable-next-line security/detect-object-injection -- 内部 i18n messages，路径由开发者硬编码
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : "";
}

export function HeroSplitBlockStatic({
  messages,
  className,
}: HeroSplitBlockProps) {
  const t = (key: string): string => getNestedValue(messages, key);

  const stats = [
    { label: t("stats.factory") || "Factory Direct" },
    { label: t("stats.material") || "100% Virgin Material" },
    { label: t("stats.production") || "Fully Automated" },
    { label: t("stats.repurchase") || "60% Repurchase Rate" },
  ];

  const images = DEFAULT_IMAGES.map((img) => ({
    src: img.src,
    alt: t(`images.${img.altKey}`) || img.altKey,
  }));

  return (
    <section
      data-testid="hero-section"
      className={cn(
        "relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-16 sm:py-24",
        className,
      )}
      aria-labelledby="hero-heading"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6">
            <Link href="/about">
              <Badge className="cursor-pointer px-4 py-2 text-sm">
                {t("badge") || "About Us →"}
              </Badge>
            </Link>
          </div>

          {/* Title */}
          <h1
            id="hero-heading"
            className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            data-testid="home-hero-title"
          >
            <span className="block">
              {t("title.line1") || "Equipment + Fittings"}
            </span>
            <span className="block text-primary">
              {t("title.line2") || "Integrated Manufacturer"}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {t("subtitle") ||
              "Self-developed bending machines, self-produced precision fittings."}
          </p>

          {/* Image Carousel */}
          <div className="mb-10">
            <ImageCarousel images={images} />
          </div>

          {/* Stat Bar */}
          <StatBar stats={stats} className="mb-10" />

          {/* Scroll CTA */}
          <a
            href="#products"
            className="group inline-flex flex-col items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>{t("scrollCta") || "Learn More"}</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}

// Re-export for backward compatibility
export { HeroSplitBlockStatic as HeroSplitBlock };

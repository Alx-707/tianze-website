# 首页重构实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 重构首页，突出"设备+管件一体化制造商"差异化定位，三段式结构：Hero → 产品矩阵 → CTA

**Architecture:**
- Hero 区块：居中布局，2-3张设备图片横向排列（移动端横滚），数据条在图片下方
- 产品矩阵：4列详细卡片（弯管机、PVC弯管、气动物流管、弯管定制），4:3图片，移动端2x2网格
- CTA：极简单行渐变背景，服务导向文案

**Tech Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui + next-intl

---

## 设计规范速查

| 项目 | 规范 |
|------|------|
| 主色 | 工业蓝 (已有 `--primary: oklch(0.672 0.161 245)`) |
| 圆角 | 卡片 12px / 按钮 8px |
| 按钮层级 | 实心蓝 = 仅CTA获取报价；描边蓝 = 其他所有 |
| 区块间距 | 80-120px |
| 区块内间距 | 40-60px |
| 卡片间距 | 24px |

---

## Task 1: 创建公共组件 - SectionHeader

**Files:**
- Create: `src/components/blocks/shared/section-header.tsx`
- Test: `src/components/blocks/shared/__tests__/section-header.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/components/blocks/shared/__tests__/section-header.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionHeader } from "../section-header";

describe("SectionHeader", () => {
  it("renders eyebrow and title", () => {
    render(<SectionHeader eyebrow="产品中心" title="设备与管件 一站式供应" />);

    expect(screen.getByText("产品中心")).toBeInTheDocument();
    expect(screen.getByText("设备与管件 一站式供应")).toBeInTheDocument();
  });

  it("renders without eyebrow when not provided", () => {
    render(<SectionHeader title="测试标题" />);

    expect(screen.getByText("测试标题")).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/components/blocks/shared/__tests__/section-header.test.tsx`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

```typescript
// src/components/blocks/shared/section-header.tsx
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  className?: string;
}

export function SectionHeader({ eyebrow, title, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-12 text-center", className)}>
      {eyebrow ? (
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/components/blocks/shared/__tests__/section-header.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/blocks/shared/
git commit -m "$(cat <<'EOF'
feat(ui): add SectionHeader component

Reusable section header with optional eyebrow text.
Used in product matrix and other homepage sections.
EOF
)"
```

---

## Task 2: 创建公共组件 - StatBar

**Files:**
- Create: `src/components/blocks/shared/stat-bar.tsx`
- Test: `src/components/blocks/shared/__tests__/stat-bar.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/components/blocks/shared/__tests__/stat-bar.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatBar } from "../stat-bar";

describe("StatBar", () => {
  const stats = [
    { label: "工厂直供" },
    { label: "100% 新料" },
    { label: "全自动生产" },
    { label: "60% 复购率" },
  ];

  it("renders all stat items", () => {
    render(<StatBar stats={stats} />);

    expect(screen.getByText("工厂直供")).toBeInTheDocument();
    expect(screen.getByText("100% 新料")).toBeInTheDocument();
    expect(screen.getByText("全自动生产")).toBeInTheDocument();
    expect(screen.getByText("60% 复购率")).toBeInTheDocument();
  });

  it("renders separators between items", () => {
    const { container } = render(<StatBar stats={stats} />);

    // 4 items = 3 separators
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators.length).toBe(3);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/components/blocks/shared/__tests__/stat-bar.test.tsx`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

```typescript
// src/components/blocks/shared/stat-bar.tsx
import { cn } from "@/lib/utils";

export interface StatItem {
  label: string;
}

export interface StatBarProps {
  stats: StatItem[];
  className?: string;
}

export function StatBar({ stats, className }: StatBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground",
        className
      )}
    >
      {stats.map((stat, index) => (
        <div key={stat.label} className="flex items-center gap-6">
          <span className="font-medium">{stat.label}</span>
          {index < stats.length - 1 ? (
            <span aria-hidden="true" className="text-border">·</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/components/blocks/shared/__tests__/stat-bar.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/blocks/shared/stat-bar.tsx src/components/blocks/shared/__tests__/stat-bar.test.tsx
git commit -m "$(cat <<'EOF'
feat(ui): add StatBar component

Horizontal stat display with dot separators.
Used in Hero section for key metrics display.
EOF
)"
```

---

## Task 3: 创建公共组件 - ImageCarousel

**Files:**
- Create: `src/components/blocks/shared/image-carousel.tsx`
- Test: `src/components/blocks/shared/__tests__/image-carousel.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/components/blocks/shared/__tests__/image-carousel.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageCarousel } from "../image-carousel";

describe("ImageCarousel", () => {
  const images = [
    { src: "/images/machine-1.jpg", alt: "弯管机" },
    { src: "/images/machine-2.jpg", alt: "扩管机" },
    { src: "/images/line.jpg", alt: "生产线" },
  ];

  it("renders all images", () => {
    render(<ImageCarousel images={images} />);

    expect(screen.getByAltText("弯管机")).toBeInTheDocument();
    expect(screen.getByAltText("扩管机")).toBeInTheDocument();
    expect(screen.getByAltText("生产线")).toBeInTheDocument();
  });

  it("applies horizontal scroll on mobile", () => {
    const { container } = render(<ImageCarousel images={images} />);

    const scrollContainer = container.querySelector('[data-scroll-container]');
    expect(scrollContainer).toHaveClass("overflow-x-auto");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/components/blocks/shared/__tests__/image-carousel.test.tsx`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

```typescript
// src/components/blocks/shared/image-carousel.tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface CarouselImage {
  src: string;
  alt: string;
}

export interface ImageCarouselProps {
  images: CarouselImage[];
  className?: string;
}

export function ImageCarousel({ images, className }: ImageCarouselProps) {
  return (
    <div
      data-scroll-container
      className={cn(
        "flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide",
        "md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0",
        className
      )}
    >
      {images.map((image) => (
        <div
          key={image.src}
          className="relative aspect-[4/3] min-w-[280px] flex-shrink-0 snap-center overflow-hidden rounded-xl md:min-w-0"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 280px, 33vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/components/blocks/shared/__tests__/image-carousel.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/blocks/shared/image-carousel.tsx src/components/blocks/shared/__tests__/image-carousel.test.tsx
git commit -m "$(cat <<'EOF'
feat(ui): add ImageCarousel component

Horizontal scroll on mobile, grid on desktop.
Supports snap scrolling and 4:3 aspect ratio images.
EOF
)"
```

---

## Task 4: 创建公共组件 - ProductCard

**Files:**
- Create: `src/components/blocks/shared/product-card.tsx`
- Test: `src/components/blocks/shared/__tests__/product-card.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/components/blocks/shared/__tests__/product-card.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductCard } from "../product-card";

describe("ProductCard", () => {
  const props = {
    image: { src: "/images/machine.jpg", alt: "弯管机" },
    title: "弯管设备",
    features: ["自主设计研发制造", "半自动/全自动弯管机", "服务国内一线品牌"],
    buttonText: "了解更多",
    buttonHref: "/products/machines",
  };

  it("renders title and features", () => {
    render(<ProductCard {...props} />);

    expect(screen.getByText("弯管设备")).toBeInTheDocument();
    expect(screen.getByText("自主设计研发制造")).toBeInTheDocument();
    expect(screen.getByText("半自动/全自动弯管机")).toBeInTheDocument();
    expect(screen.getByText("服务国内一线品牌")).toBeInTheDocument();
  });

  it("renders button with correct href", () => {
    render(<ProductCard {...props} />);

    const button = screen.getByRole("link", { name: /了解更多/i });
    expect(button).toHaveAttribute("href", "/products/machines");
  });

  it("renders primary button variant when isPrimary is true", () => {
    render(<ProductCard {...props} isPrimary buttonText="获取报价" />);

    const button = screen.getByRole("link", { name: /获取报价/i });
    expect(button).toHaveClass("bg-primary");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/components/blocks/shared/__tests__/product-card.test.tsx`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

```typescript
// src/components/blocks/shared/product-card.tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ProductCardProps {
  image: { src: string; alt: string };
  title: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
  isPrimary?: boolean;
  className?: string;
}

export function ProductCard({
  image,
  title,
  features,
  buttonText,
  buttonHref,
  isPrimary = false,
  className,
}: ProductCardProps) {
  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              {feature}
            </li>
          ))}
        </ul>
        <Button
          variant={isPrimary ? "default" : "outline"}
          className="w-full"
          asChild
        >
          <Link href={buttonHref} className="flex items-center justify-center gap-2">
            {buttonText}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test src/components/blocks/shared/__tests__/product-card.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/blocks/shared/product-card.tsx src/components/blocks/shared/__tests__/product-card.test.tsx
git commit -m "$(cat <<'EOF'
feat(ui): add ProductCard component

Product card with 4:3 image, title, feature list, and CTA button.
Supports primary variant for highlighted actions.
EOF
)"
```

---

## Task 5: 重构 Hero 区块

**Files:**
- Modify: `src/components/blocks/hero/hero-split-block.tsx`
- Modify: `messages/en/critical.json` (home.hero section)
- Modify: `messages/zh/critical.json` (home.hero section)
- Test: `src/components/blocks/hero/__tests__/hero-split-block.test.tsx`

**Step 1: Update i18n messages**

在 `messages/en/critical.json` 的 `home.hero` 部分更新：

```json
{
  "home": {
    "hero": {
      "badge": "About Us →",
      "title": {
        "line1": "Equipment + Fittings",
        "line2": "Integrated Manufacturer"
      },
      "subtitle": "Self-developed bending machines, self-produced precision fittings. From equipment to finished products, full chain control.",
      "scrollCta": "Learn More",
      "stats": {
        "factory": "Factory Direct",
        "material": "100% Virgin Material",
        "production": "Fully Automated",
        "repurchase": "60% Repurchase Rate"
      },
      "images": {
        "bender": "Pipe Bending Machine",
        "expander": "Pipe Expander",
        "line": "Production Line"
      }
    }
  }
}
```

**Step 2: Rewrite Hero component**

```typescript
// src/components/blocks/hero/hero-split-block.tsx
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
  stats?: { factory?: string; material?: string; production?: string; repurchase?: string };
  images?: { bender?: string; expander?: string; line?: string };
}

export interface HeroSplitBlockProps {
  messages: HeroSplitBlockMessages;
  className?: string;
}

const DEFAULT_IMAGES = [
  { src: "/images/hero/bending-machine.jpg", altKey: "bender" },
  { src: "/images/hero/expander.jpg", altKey: "expander" },
  { src: "/images/hero/production-line.jpg", altKey: "line" },
];

export function HeroSplitBlockStatic({ messages, className }: HeroSplitBlockProps) {
  const t = (key: string): string => {
    const parts = key.split(".");
    let cur: unknown = messages;
    for (const p of parts) {
      if (typeof cur !== "object" || cur === null) return "";
      cur = (cur as Record<string, unknown>)[p];
    }
    return typeof cur === "string" ? cur : "";
  };

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
        className
      )}
      aria-labelledby="hero-heading"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6">
            <Badge asChild className="cursor-pointer px-4 py-2 text-sm">
              <Link href="/about">{t("badge") || "About Us →"}</Link>
            </Badge>
          </div>

          {/* Title */}
          <h1
            id="hero-heading"
            className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            data-testid="home-hero-title"
          >
            <span className="block">{t("title.line1") || "Equipment + Fittings"}</span>
            <span className="block text-primary">{t("title.line2") || "Integrated Manufacturer"}</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {t("subtitle") || "Self-developed bending machines, self-produced precision fittings."}
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
```

**Step 3: Run existing tests**

Run: `pnpm test src/components/blocks/hero/`
Expected: Tests may need updates based on new structure

**Step 4: Update tests if needed**

**Step 5: Commit**

```bash
git add src/components/blocks/hero/ messages/
git commit -m "$(cat <<'EOF'
refactor(hero): redesign with centered layout and image carousel

- Centered layout with badge → title → subtitle → images → stats
- Image carousel with mobile horizontal scroll
- Stat bar below images
- Scroll CTA with animated chevron
EOF
)"
```

---

## Task 6: 创建产品矩阵区块

**Files:**
- Create: `src/components/blocks/products/product-matrix-block.tsx`
- Test: `src/components/blocks/products/__tests__/product-matrix-block.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/components/blocks/products/__tests__/product-matrix-block.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductMatrixBlock } from "../product-matrix-block";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("ProductMatrixBlock", () => {
  it("renders section header", () => {
    render(<ProductMatrixBlock />);

    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("renders 4 product cards", () => {
    render(<ProductMatrixBlock />);

    const cards = screen.getAllByRole("link");
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it("has correct section id for scroll targeting", () => {
    const { container } = render(<ProductMatrixBlock />);

    const section = container.querySelector("#products");
    expect(section).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test src/components/blocks/products/__tests__/product-matrix-block.test.tsx`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

```typescript
// src/components/blocks/products/product-matrix-block.tsx
"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/blocks/shared/product-card";
import { SectionHeader } from "@/components/blocks/shared/section-header";

export interface ProductMatrixBlockProps {
  className?: string;
  i18nNamespace?: string;
}

interface ProductConfig {
  image: { src: string; altKey: string };
  titleKey: string;
  featureKeys: string[];
  buttonKey: string;
  href: string;
  isPrimary?: boolean;
}

const PRODUCTS: ProductConfig[] = [
  {
    image: { src: "/images/products/bending-machine.jpg", altKey: "machines.image" },
    titleKey: "machines.title",
    featureKeys: ["machines.feature1", "machines.feature2", "machines.feature3"],
    buttonKey: "machines.button",
    href: "/products/machines",
  },
  {
    image: { src: "/images/products/pvc-bends.jpg", altKey: "pvc.image" },
    titleKey: "pvc.title",
    featureKeys: ["pvc.feature1", "pvc.feature2", "pvc.feature3"],
    buttonKey: "pvc.button",
    href: "/products/pvc-conduits",
  },
  {
    image: { src: "/images/products/pneumatic-tubes.jpg", altKey: "pneumatic.image" },
    titleKey: "pneumatic.title",
    featureKeys: ["pneumatic.feature1", "pneumatic.feature2", "pneumatic.feature3"],
    buttonKey: "pneumatic.button",
    href: "/products/pneumatic-tubes",
  },
  {
    image: { src: "/images/products/custom.jpg", altKey: "custom.image" },
    titleKey: "custom.title",
    featureKeys: ["custom.feature1", "custom.feature2", "custom.feature3"],
    buttonKey: "custom.button",
    href: "/contact",
    isPrimary: false, // 按设计：所有按钮都是描边，只有 CTA 区块用实心
  },
];

export function ProductMatrixBlock({
  className,
  i18nNamespace = "home.products",
}: ProductMatrixBlockProps) {
  const t = useTranslations(i18nNamespace);

  return (
    <section
      id="products"
      className={cn("py-20 sm:py-28", className)}
      aria-labelledby="products-heading"
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <ProductCard
              key={product.titleKey}
              image={{
                src: product.image.src,
                alt: t(product.image.altKey),
              }}
              title={t(product.titleKey)}
              features={product.featureKeys.map((key) => t(key))}
              buttonText={t(product.buttonKey)}
              buttonHref={product.href}
              isPrimary={product.isPrimary}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 4: Add i18n messages**

在 `messages/en/critical.json` 添加 `home.products`：

```json
{
  "home": {
    "products": {
      "eyebrow": "Product Center",
      "title": "Equipment & Fittings One-Stop Supply",
      "machines": {
        "image": "Pipe Bending Machine",
        "title": "Bending Machines",
        "feature1": "Self-designed & Manufactured",
        "feature2": "Semi-auto / Full-auto",
        "feature3": "Serving Top Domestic Brands",
        "button": "Learn More"
      },
      "pvc": {
        "image": "PVC Conduit Bends",
        "title": "PVC Conduits",
        "feature1": "International Standards",
        "feature2": "Bell-end / Socket Bends",
        "feature3": "UL651 / AS / NZS / GB",
        "button": "Learn More"
      },
      "pneumatic": {
        "image": "Pneumatic Tubes",
        "title": "Pneumatic Tubes",
        "feature1": "High Transparency & Quiet",
        "feature2": "PVC / PMMA / PETG",
        "feature3": "Hospital / Lab / Industrial",
        "button": "Learn More"
      },
      "custom": {
        "image": "Custom Solutions",
        "title": "Custom Solutions",
        "feature1": "Low MOQ Fast Sampling",
        "feature2": "Non-standard Specs / OEM",
        "feature3": "AU / US / GB Standards",
        "button": "Get Quote"
      }
    }
  }
}
```

**Step 5: Run test to verify it passes**

Run: `pnpm test src/components/blocks/products/`
Expected: PASS

**Step 6: Commit**

```bash
git add src/components/blocks/products/ messages/
git commit -m "$(cat <<'EOF'
feat(ui): add ProductMatrixBlock for homepage

4-column product grid with responsive 2x2 layout on mobile.
Products: Bending Machines, PVC Conduits, Pneumatic Tubes, Custom Solutions.
EOF
)"
```

---

## Task 7: 简化 CTA 区块

**Files:**
- Modify: `src/components/blocks/cta/cta-banner-block.tsx`
- Modify: `messages/en/critical.json` (home.cta section)

**Step 1: Simplify CTA component**

```typescript
// src/components/blocks/cta/cta-banner-block.tsx
"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CTABannerBlockProps {
  className?: string;
  i18nNamespace?: string;
}

export function CTABannerBlock({
  className,
  i18nNamespace = "home.cta",
}: CTABannerBlockProps) {
  const t = useTranslations(i18nNamespace);

  return (
    <section
      className={cn(
        "bg-gradient-to-r from-primary to-primary/80 py-16 sm:py-20",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-6 text-center sm:flex-row sm:gap-8">
          <p className="text-lg font-medium text-primary-foreground sm:text-xl">
            {t("message")}
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/contact" className="flex items-center gap-2">
              {t("button")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Update i18n messages**

```json
{
  "home": {
    "cta": {
      "message": "Contact us for samples or technical support",
      "button": "Get Quote"
    }
  }
}
```

**Step 3: Run tests**

Run: `pnpm test src/components/blocks/cta/`
Expected: May need test updates

**Step 4: Commit**

```bash
git add src/components/blocks/cta/ messages/
git commit -m "$(cat <<'EOF'
refactor(cta): simplify to single-line gradient banner

- Gradient background from primary color
- Single message + primary CTA button
- Service-oriented copy: samples & technical support
EOF
)"
```

---

## Task 8: 集成首页

**Files:**
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/components/home/below-the-fold.client.tsx`

**Step 1: Update page structure**

```typescript
// src/app/[locale]/page.tsx
import type { Metadata } from "next";
import { extractHeroMessages } from "@/lib/i18n/extract-hero-messages";
import { loadCriticalMessages } from "@/lib/load-messages";
import { generateMetadataForPath, type Locale } from "@/lib/seo-metadata";
import { HeroSplitBlockStatic } from "@/components/blocks/hero/hero-split-block";
import { BelowTheFoldClient } from "@/components/home/below-the-fold.client";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface HomePageProps {
  params: Promise<{ locale: "en" | "zh" }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateMetadataForPath({
    locale: locale as Locale,
    pageType: "home",
    path: "",
  });
}

type TranslationValue = string | Record<string, unknown>;
type TranslationMessages = Record<string, TranslationValue>;

async function getHomeHeroMessages(locale: "en" | "zh"): Promise<TranslationMessages> {
  const messages = await loadCriticalMessages(locale);
  return extractHeroMessages(messages) as TranslationMessages;
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;
  const heroNs = await getHomeHeroMessages(locale);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSplitBlockStatic messages={heroNs} />
      <BelowTheFoldClient />
    </div>
  );
}
```

**Step 2: Update below-the-fold client**

```typescript
// src/components/home/below-the-fold.client.tsx
"use client";

import dynamic from "next/dynamic";
import {
  CallToActionSkeleton,
  ProjectOverviewSkeleton,
} from "@/components/home/below-the-fold-skeleton";

const ProductMatrix = dynamic(
  () =>
    import("@/components/blocks/products/product-matrix-block").then(
      (m) => m.ProductMatrixBlock
    ),
  { loading: () => <ProjectOverviewSkeleton /> }
);

const CallToAction = dynamic(
  () =>
    import("@/components/blocks/cta/cta-banner-block").then(
      (m) => m.CTABannerBlock
    ),
  { loading: () => <CallToActionSkeleton /> }
);

export function BelowTheFoldClient() {
  return (
    <>
      <ProductMatrix />
      <CallToAction />
    </>
  );
}
```

**Step 3: Run full test suite**

Run: `pnpm test`
Expected: PASS

**Step 4: Commit**

```bash
git add src/app/[locale]/page.tsx src/components/home/below-the-fold.client.tsx
git commit -m "$(cat <<'EOF'
refactor(home): integrate new Hero + ProductMatrix + CTA structure

Three-section homepage layout:
1. Hero: centered with image carousel
2. ProductMatrix: 4-column product grid
3. CTA: simplified gradient banner
EOF
)"
```

---

## Task 9: 创建 scrollbar-hide 工具类

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add scrollbar-hide utility**

在 `globals.css` 添加：

```css
/* Hide scrollbar for horizontal scroll containers */
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

**Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(css): add scrollbar-hide utility for mobile carousels"
```

---

## Task 10: 验证与清理

**Step 1: Run full CI**

```bash
pnpm ci:local
```

Expected: All checks pass

**Step 2: Visual verification**

```bash
pnpm dev
```

Open http://localhost:3000 and verify:
- [ ] Hero displays correctly with image carousel
- [ ] Mobile horizontal scroll works
- [ ] Product matrix shows 4 cards
- [ ] Mobile shows 2x2 grid
- [ ] CTA gradient displays correctly
- [ ] All links work

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: homepage redesign complete"
```

---

## 待补充内容

以下内容需要后续提供后更新 i18n 文件：

1. **产品矩阵卡片详细信息** — 每个产品线的 2-3 个核心卖点
2. **Hero 设备图片** — 需要放置到 `/public/images/hero/` 目录
3. **产品卡片图片** — 需要放置到 `/public/images/products/` 目录
4. **中文翻译** — 更新 `messages/zh/critical.json`

---

## 变更记录

| 日期 | 变更 |
|------|------|
| 2026-01-28 | 初版实现计划 |

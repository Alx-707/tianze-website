# Twitter 风格视觉审计与修复计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 逐个排查首页组件，修复不符合 Twitter 风格的 Vercel 模板残留元素

**Architecture:** 采用增量修复策略，保留组件结构，仅更新数据层（徽章文字、图标、链接、统计数据）。每个组件独立修复并验证测试，确保改动可控、可回滚。

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, next-intl, Vitest

---

## 问题清单总览

| 组件文件 | 问题数 | 问题类型 |
|----------|--------|----------|
| `features-grid-block.tsx` | 4 | 徽章、技术标签、GitHub CTA |
| `cta-banner-block.tsx` | 5 | GitHub 图标、链接、统计数据 |
| `site-config.ts` | 3 | 技术统计常量 |
| 测试文件 (5个) | 8 | 断言内容需同步 |
| i18n JSON | 0 | ✅ 已更新为管业语义 |

**总计：20 处修改**

---

## Pre-Flight

**Step 1: 创建功能分支**

```bash
git checkout -b refactor/twitter-style-audit
```

**Step 2: 验证当前测试状态**

```bash
pnpm test --run
```

Expected: 所有测试通过（当前状态基线）

---

### Task 1: 修复 features-grid-block 徽章

**Files:**
- Modify: `src/components/blocks/features/features-grid-block.tsx:69-106`
- Test: `src/components/home/__tests__/project-overview.test.tsx:189-199`

**Step 1: 更新 DEFAULT_FEATURES 徽章值**

将技术徽章改为管业相关值。打开 `src/components/blocks/features/features-grid-block.tsx`，找到 `DEFAULT_FEATURES` 数组（约第 69 行），修改：

```typescript
const DEFAULT_FEATURES: FeatureItem[] = [
  {
    icon: Zap,
    titleKey: "features.performance.title",
    descriptionKey: "features.performance.description",
    badge: "High Output",  // 原: "A+"
  },
  {
    icon: Shield,
    titleKey: "features.security.title",
    descriptionKey: "features.security.description",
    badge: "ISO 9001",  // 原: "100%"
  },
  {
    icon: Globe,
    titleKey: "features.i18n.title",
    descriptionKey: "features.i18n.description",
    badge: "100+",  // 原: "2" (改为出口国家数)
  },
  {
    icon: Palette,
    titleKey: "features.themes.title",
    descriptionKey: "features.themes.description",
    badge: "Custom",  // 原: "Multiple"
  },
  {
    icon: Code,
    titleKey: "features.typescript.title",
    descriptionKey: "features.typescript.description",
    badge: "ASTM",  // 原: "TS 5.9.3"
  },
  {
    icon: Rocket,
    titleKey: "features.deployment.title",
    descriptionKey: "features.deployment.description",
    badge: "48h",  // 原: "Vercel" (改为交货时间)
  },
];
```

**Step 2: 更新测试断言**

打开 `src/components/home/__tests__/project-overview.test.tsx`，找到第 196-198 行，修改：

```typescript
it("should render feature badges", () => {
  render(<ProjectOverview />);

  const badges = screen.getAllByTestId("badge");
  expect(badges.length).toBeGreaterThan(0);

  // 更新为管业相关徽章
  expect(screen.getByText("ISO 9001")).toBeInTheDocument();
  expect(screen.getByText("100+")).toBeInTheDocument();
});
```

**Step 3: 运行测试验证**

```bash
pnpm test src/components/home/__tests__/project-overview.test.tsx --run
```

Expected: PASS

**Step 4: Commit**

```bash
git add src/components/blocks/features/features-grid-block.tsx src/components/home/__tests__/project-overview.test.tsx
git commit -m "$(cat <<'EOF'
refactor(ui): replace tech badges with industry-relevant values

- A+ → High Output
- 100% → ISO 9001
- 2 → 100+ (export countries)
- TS 5.9.3 → ASTM
- Vercel → 48h (delivery time)
EOF
)"
```

---

### Task 2: 移除 features-grid-block 技术标签

**Files:**
- Modify: `src/components/blocks/features/features-grid-block.tsx:119-138, 218-261`
- Test: `src/components/home/__tests__/project-overview.test.tsx:202-227`

**Step 1: 清空 DEFAULT_ARCHITECTURE 的 technologies 数组**

找到 `DEFAULT_ARCHITECTURE`（约第 119 行），将 `technologies` 改为空数组：

```typescript
const DEFAULT_ARCHITECTURE = {
  frontend: {
    titleKey: "architecture.frontend.title",
    descriptionKey: "architecture.frontend.description",
    technologies: [],  // 原: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS"]
    color: "blue" as const,
  },
  ui: {
    titleKey: "architecture.ui.title",
    descriptionKey: "architecture.ui.description",
    technologies: [],  // 原: ["shadcn/ui", "Radix UI", "Lucide Icons", "CSS Variables"]
    color: "green" as const,
  },
  tooling: {
    titleKey: "architecture.tooling.title",
    descriptionKey: "architecture.tooling.description",
    technologies: [],  // 原: ["ESLint", "Prettier", "Lefthook", "Vitest"]
    color: "purple" as const,
  },
};
```

**Step 2: 更新 TechnicalArchitecture 组件渲染**

找到 `TechnicalArchitecture` 函数（约第 218 行），修改 CardContent 部分，移除 Badge 列表：

```typescript
<CardContent className="space-y-2">
  <div className="text-sm text-foreground/85">
    {t(layer.descriptionKey)}
  </div>
  {/* 移除技术标签渲染 */}
</CardContent>
```

**Step 3: 更新测试断言**

打开 `src/components/home/__tests__/project-overview.test.tsx`，修改第 202-227 行：

```typescript
describe("Tech Architecture", () => {
  it("should render architecture section", () => {
    render(<ProjectOverview />);

    // 检查架构区块存在（通过标题）
    expect(mockT).toHaveBeenCalledWith("architecture.title");
  });

  it("should render architecture categories", () => {
    render(<ProjectOverview />);

    // 检查各分类的描述被调用
    expect(mockT).toHaveBeenCalledWith("architecture.frontend.description");
    expect(mockT).toHaveBeenCalledWith("architecture.ui.description");
    expect(mockT).toHaveBeenCalledWith("architecture.tooling.description");
  });

  // 删除 "should render technology items" 测试
  // 因为不再渲染技术标签
});
```

**Step 4: 运行测试验证**

```bash
pnpm test src/components/home/__tests__/project-overview.test.tsx --run
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/blocks/features/features-grid-block.tsx src/components/home/__tests__/project-overview.test.tsx
git commit -m "$(cat <<'EOF'
refactor(ui): remove tech stack tags from architecture cards

Empty technologies arrays to hide version numbers (Next.js 16, React 19, etc.)
EOF
)"
```

---

### Task 3: 修复 features-grid-block CTA 链接

**Files:**
- Modify: `src/components/blocks/features/features-grid-block.tsx:141-148`

**Step 1: 更新 DEFAULT_CTA**

找到 `DEFAULT_CTA`（约第 141 行），修改 `secondaryButtonHref`：

```typescript
const DEFAULT_CTA: CTAConfig = {
  titleKey: "cta.title",
  descriptionKey: "cta.description",
  primaryButtonKey: "cta.getStarted",
  secondaryButtonKey: "cta.viewSource",
  secondaryButtonHref: "/products",  // 原: SITE_CONFIG.social.github
};
```

**Step 2: 运行测试验证**

```bash
pnpm test src/components/home/__tests__/project-overview.test.tsx --run
```

Expected: PASS

**Step 3: Commit**

```bash
git add src/components/blocks/features/features-grid-block.tsx
git commit -m "refactor(ui): change CTA link from GitHub to /products"
```

---

### Task 4: 修复 cta-banner-block 统计数据

**Files:**
- Modify: `src/components/blocks/cta/cta-banner-block.tsx:222-229`

**Step 1: 更新 getDefaultData 的 stats**

找到 `getDefaultData` 函数中的 `stats` 数组（约第 222 行），修改：

```typescript
stats: [
  { value: "100+", label: t("stats.technologies") },  // 原: "22+"
  { value: "60+", label: t("stats.typescript") },     // 原: "100%"
  { value: "98%", label: t("stats.performance") },    // 原: "A+"
  { value: "6+", label: t("stats.languages") },       // 原: "2"
],
```

**Step 2: 运行测试验证**

```bash
pnpm test src/components/home/__tests__/call-to-action.test.tsx --run
```

Expected: PASS（测试使用 i18n keys，不检查具体值）

**Step 3: Commit**

```bash
git add src/components/blocks/cta/cta-banner-block.tsx
git commit -m "$(cat <<'EOF'
refactor(ui): update CTA stats to business metrics

- 22+ → 100+ (export countries)
- 100% → 60+ (employees)
- A+ → 98% (on-time delivery)
- 2 → 6+ (years experience)
EOF
)"
```

---

### Task 5: 替换 cta-banner-block GitHub 图标

**Files:**
- Modify: `src/components/blocks/cta/cta-banner-block.tsx:4-10, 196-220`

**Step 1: 更新 import**

找到文件顶部 import（约第 4-10 行），修改：

```typescript
import {
  ArrowRight,
  ExternalLink,
  FileText,      // 新增
  MessageCircle,
  Phone,         // 新增，替换 Github
  // Github,     // 移除
  // Star,       // 移除
} from "lucide-react";
```

**Step 2: 更新 getDefaultData actions**

找到 `getDefaultData` 函数中的 `actions` 数组（约第 196 行），修改：

```typescript
actions: [
  {
    icon: Phone,  // 原: Github
    title: t("actions.github.title"),
    description: t("actions.github.description"),
    href: "/contact",  // 原: DEFAULT_GITHUB_HREF
    primary: true,
    external: false,   // 原: true
  },
  {
    icon: FileText,  // 原: Star
    title: t("actions.download.title"),
    description: t("actions.download.description"),
    href: "/products",  // 原: DEFAULT_GITHUB_DOWNLOAD_HREF
    primary: false,
    external: false,    // 原: true
  },
  {
    icon: MessageCircle,
    title: t("actions.docs.title"),
    description: t("actions.docs.description"),
    href: "/support",  // 原: "/docs"
    primary: false,
    external: false,
  },
],
```

**Step 3: 运行测试验证**

```bash
pnpm test src/components/home/__tests__/call-to-action.test.tsx --run
```

Expected: PASS

**Step 4: Commit**

```bash
git add src/components/blocks/cta/cta-banner-block.tsx
git commit -m "$(cat <<'EOF'
refactor(ui): replace GitHub icons with business-focused icons

- Github → Phone (contact sales)
- Star → FileText (product catalog)
- Update hrefs to internal pages
EOF
)"
```

---

### Task 6: 更新 cta-banner-block 主按钮

**Files:**
- Modify: `src/components/blocks/cta/cta-banner-block.tsx:288-312`

**Step 1: 更新主 CTA 按钮区域**

找到主按钮渲染部分（约第 288 行），修改：

```typescript
{/* Primary buttons */}
<div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
  <Button size="lg" className="group px-8 py-4 text-lg" asChild>
    <a href="/contact" className="flex items-center gap-2">
      <Phone className="h-5 w-5" />
      {t("primary.github")}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </a>
  </Button>

  <Button
    variant="outline"
    size="lg"
    className="px-8 py-4 text-lg"
    asChild
  >
    <a href="/products" className="flex items-center gap-2">
      {t("primary.demo")}
      <ArrowRight className="h-4 w-4" />
    </a>
  </Button>
</div>
```

**Step 2: 移除 Badge 中的 Star 图标**

找到 Badge 渲染部分（约第 272 行），修改：

```typescript
<Badge className="mb-4 px-4 py-2 text-sm font-medium">
  {t("badge")}
</Badge>
```

**Step 3: 运行测试验证**

```bash
pnpm test src/components/home/__tests__/call-to-action.test.tsx --run
```

Expected: PASS

**Step 4: Commit**

```bash
git add src/components/blocks/cta/cta-banner-block.tsx
git commit -m "refactor(ui): update main CTA buttons to contact/products"
```

---

### Task 7: 清理 cta-banner-block 未使用的常量和 props

**Files:**
- Modify: `src/components/blocks/cta/cta-banner-block.tsx:59-62, 233-241`

**Step 1: 移除未使用的 GitHub 常量**

找到常量定义部分（约第 59 行），删除：

```typescript
// 删除这些行
// const DEFAULT_GITHUB_HREF = SITE_CONFIG.social.github;
// const DEFAULT_GITHUB_DOWNLOAD_HREF = `${DEFAULT_GITHUB_HREF}/archive/main.zip`;
// const DEFAULT_GITHUB_DISCUSSIONS_HREF = `${DEFAULT_GITHUB_HREF}/discussions`;
// const DEFAULT_GITHUB_ISSUES_HREF = `${DEFAULT_GITHUB_HREF}/issues`;
```

**Step 2: 更新组件 props 默认值**

找到组件函数签名（约第 233 行），更新：

```typescript
export function CTABannerBlock({
  actions,
  stats,
  i18nNamespace = "home.cta",
  // 移除 githubHref, demoHref, discussionsHref, issuesHref
}: CTABannerBlockProps = {}) {
```

**Step 3: 更新 CTABannerBlockProps interface**

找到 interface 定义（约第 43 行），简化：

```typescript
export interface CTABannerBlockProps {
  actions?: ActionItem[];
  stats?: StatItem[];
  i18nNamespace?: string;
}
```

**Step 4: 更新 CommunitySection 调用**

找到 CommunitySection 调用（约第 321 行），改为硬编码 WhatsApp/Email：

```typescript
<CommunitySection
  t={t}
  discussionsHref="https://wa.me/8618000000000"
  issuesHref="mailto:sales@tianzepipe.com"
/>
```

**Step 5: 运行测试验证**

```bash
pnpm test src/components/home/__tests__/call-to-action.test.tsx --run
```

Expected: PASS

**Step 6: Commit**

```bash
git add src/components/blocks/cta/cta-banner-block.tsx
git commit -m "$(cat <<'EOF'
refactor(ui): remove unused GitHub constants and simplify props

- Remove DEFAULT_GITHUB_* constants
- Simplify CTABannerBlockProps interface
- Update CommunitySection to WhatsApp/Email
EOF
)"
```

---

### Task 8: 更新 site-config.ts 常量

**Files:**
- Modify: `src/lib/site-config.ts:9-62`
- Test: `src/lib/__tests__/site-config.test.ts`

**Step 1: 更新 PROJECT_STATS**

打开 `src/lib/site-config.ts`，修改 `PROJECT_STATS`（约第 9 行）：

```typescript
export const PROJECT_STATS = {
  // 业务统计
  business: {
    exportCountries: 100,
    employees: 60,
    onTimeDelivery: "98%",
    yearsExperience: 6,
  },

  // 产品指标
  products: {
    certifications: ["ISO 9001", "ASTM", "UL651"],
    productLines: 3,
    customMolds: "500+",
  },

  // 社区数据（保留用于其他用途）
  community: {
    initialLikeCount: 42,
  },
} as const;
```

**Step 2: 更新 TECH_ARCHITECTURE**

修改 `TECH_ARCHITECTURE`（约第 46 行）为产品线：

```typescript
export const TECH_ARCHITECTURE = {
  equipment: {
    title: "Bending Equipment",
    description: "Semi-auto and full-auto PVC pipe bending machines",
    color: "blue",
  },
  conduit: {
    title: "PVC Conduit System",
    description: "Schedule 40/80 conduits, bends, and fittings",
    color: "green",
  },
  pneumatic: {
    title: "Pneumatic Tubes",
    description: "PETG/PMMA/PVC tubes for hospital logistics",
    color: "purple",
  },
} as const;
```

**Step 3: 更新测试文件**

打开 `src/lib/__tests__/site-config.test.ts`，更新断言以匹配新结构。

**Step 4: 运行测试验证**

```bash
pnpm test src/lib/__tests__/site-config.test.ts --run
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/site-config.ts src/lib/__tests__/site-config.test.ts
git commit -m "$(cat <<'EOF'
refactor(config): update site-config to business metrics

- Replace tech stats with business stats (countries, employees, delivery)
- Replace tech architecture with product lines (equipment, conduit, pneumatic)
EOF
)"
```

---

### Task 9: 最终验证

**Step 1: 运行完整测试套件**

```bash
pnpm test --run
```

Expected: All tests PASS

**Step 2: 运行类型检查**

```bash
pnpm type-check
```

Expected: No errors

**Step 3: 运行构建**

```bash
pnpm build
```

Expected: Build succeeds

**Step 4: 视觉验证**

```bash
pnpm dev
```

手动检查：
- [ ] Features 区域：徽章显示 "High Output", "ISO 9001", "100+" 等
- [ ] Architecture 区域：无技术版本标签
- [ ] CTA 区域：Phone 图标，统计显示 100+/60+/98%/6+
- [ ] 无 GitHub/Star 图标

**Step 5: 最终 Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor(ui): complete Twitter style audit for homepage

Summary:
- Replace tech badges with industry values (ISO 9001, ASTM, etc.)
- Remove tech stack version tags
- Replace GitHub icons/links with contact/products
- Update stats to business metrics
- Simplify CTA component props

All tests pass, build succeeds.
EOF
)"
```

---

## 验收标准

| 检查项 | 状态 |
|--------|------|
| 无技术版本徽章 (TS 5.9.3, React 19, Next.js 16) | ☐ |
| 无 GitHub/Star 图标 | ☐ |
| 无 GitHub 链接 | ☐ |
| 统计数据为业务指标 (100+, 60+, 98%, 6+) | ☐ |
| CTA 指向 /contact, /products | ☐ |
| `pnpm test --run` 通过 | ☐ |
| `pnpm type-check` 通过 | ☐ |
| `pnpm build` 通过 | ☐ |

---

## 文件修改清单

| 文件 | 修改类型 | Task |
|------|----------|------|
| `src/components/blocks/features/features-grid-block.tsx` | Modify | 1, 2, 3 |
| `src/components/blocks/cta/cta-banner-block.tsx` | Modify | 4, 5, 6, 7 |
| `src/lib/site-config.ts` | Modify | 8 |
| `src/components/home/__tests__/project-overview.test.tsx` | Modify | 1, 2 |
| `src/lib/__tests__/site-config.test.ts` | Modify | 8 |

**总计：5 个文件，9 个任务**

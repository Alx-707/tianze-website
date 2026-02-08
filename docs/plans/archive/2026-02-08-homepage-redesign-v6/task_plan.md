# Homepage Redesign v6 — Task Plan

## 状态
- 当前: 完成
- 进度: 10/10
- 模式: 挂机
- 分支: `feat/homepage-redesign-v6`

## 设计来源
- 原型: `docs/design/homepage/prototype/v6-swagelok-vercel/index.html`
- Tokens: `docs/S/tokens.md`
- Grid: `docs/S/grid.md`
- Components: `docs/S/components.md`

## Tasks

### Task 1: 替换设计 Token (globals.css)
- 状态: completed
- 文件: `src/app/globals.css`
- 描述: 用 docs/S/tokens.md 的新设计系统替换 Twitter-inspired tokens。保留 Tailwind v4 @import/@plugin/@theme 结构，替换 :root 变量为 Figtree/JetBrains Mono 字体 + #004D9E 色系 + 8px radius。移除 Twitter 特定样式（.twitter-bg, .hover-card, .twitter-divider, .precision-grid-*）。保留 a11y/reduced-motion/高对比度规则。保留 @layer base 的 focus-visible, sr-only, skip-link。保留 CLS 优化和 content-visibility 工具。删除旧的 header responsive contract 和 Vercel Line Design System 工具（将在 Task 9 重建）。
- TDD: 无测试（纯 CSS token 替换）
- 验证: `pnpm type-check && pnpm build`

### Task 2: 更新字体配置 (layout.tsx)
- 状态: completed
- 文件: `src/app/[locale]/layout.tsx`, `src/app/layout.tsx`
- 描述: 将 Open Sans 替换为 Figtree (主字体) + JetBrains Mono (等宽)。使用 next/font/google 加载。更新 CSS 变量绑定。
- TDD: 构建验证
- 验证: `pnpm type-check && pnpm build`

### Task 3: 适配 Button 组件
- 状态: completed
- 文件: `src/components/ui/button.tsx`
- 描述: 更新 Button variants 匹配新设计系统：primary (#004D9E), secondary (border + shadow), on-dark (白底蓝字), ghost (透明+白边框)。border-radius: 6px, font-size: 14px/600, padding: 10px 20px, transition: 150ms。
- TDD: 更新 button 测试（如存在）
- 验证: `pnpm type-check && pnpm lint`

### Task 4: 创建 SectionHead 组件
- 状态: completed
- 文件: `src/components/ui/section-head.tsx`（新建）
- 描述: 可复用 section header: H2 32px/700 + optional subtitle + optional right-side action (row layout)。替代现有 SectionHeader（shared/section-header.tsx）的功能。
- TDD: 创建 section-head.test.tsx
- 验证: `pnpm test -- section-head`

### Task 5: 创建 HeroSection 组件
- 状态: completed
- 文件: `src/components/sections/hero-section.tsx`（新建）
- 描述: 两列布局: 左侧 copy (eyebrow + H1 + subtitle + CTA buttons + proof metrics), 右侧 2x2 image grid。全部文案走 i18n keys (hero.*)。Server Component，图片用 next/image placeholder。
- 依赖: Task 1, 2, 3, 4
- TDD: hero-section.test.tsx (渲染测试)
- 验证: `pnpm test -- hero-section`

### Task 6: 创建内容区块组件
- 状态: completed
- 文件:
  - `src/components/sections/chain-section.tsx`
  - `src/components/sections/products-section.tsx`
  - `src/components/sections/resources-section.tsx`
  - `src/components/sections/sample-cta.tsx`
  - `src/components/sections/scenarios-section.tsx`
  - `src/components/sections/quality-section.tsx`
  - `src/components/sections/final-cta.tsx`
- 描述: 7 个内容区块，均按原型 HTML 结构实现。全部文案走 i18n。Server Components。图片用 placeholder。响应式按 tokens.md breakpoints。
- 依赖: Task 1, 3, 4
- TDD: 各区块 render 测试
- 验证: `pnpm test -- sections/`

### Task 7: 创建 SiteFooter 组件
- 状态: completed
- 文件: `src/components/sections/site-footer.tsx`（新建）
- 描述: 深色背景 (#2C353B) 四列 footer，替换现有 Footer。4 列: About (1.5fr) / Products (1fr) / Resources (1fr) / Contact (1.2fr)。Bottom bar with copyright。i18n namespace: footer.*。
- 依赖: Task 1
- TDD: footer render 测试
- 验证: `pnpm test -- site-footer`

### Task 8: 页面组装 + i18n
- 状态: completed
- 文件:
  - `src/app/[locale]/page.tsx`
  - `messages/en/critical.json`
  - `messages/zh/critical.json`
  - `messages/en/deferred.json` (如需)
  - `messages/zh/deferred.json` (如需)
- 描述: 重写 page.tsx 组装新组件。更新/创建所有 i18n keys (hero.*, chain.*, products.*, resources.*, sample.*, scenarios.*, quality.*, finalCta.*, footer.*)。保留 LCP 优化策略（hero 静态，below-fold 延迟）。
- 依赖: Task 5, 6, 7
- TDD: page render 测试
- 验证: `pnpm build && pnpm test`

### Task 9: Vercel CSS Grid 装饰系统
- 状态: completed
- 文件:
  - `src/components/grid/grid-system.tsx`
  - `src/components/grid/grid-section.tsx`
  - `src/components/grid/grid-block.tsx`
- 描述: 按 docs/S/grid.md 规范实现三层 CSS Grid 装饰系统。GridSystem (外框+crosshairs) → GridSection (display:grid + guides) → GridBlock (z-index:2 + 1px margin)。>1024px 显示, ≤1024px 隐藏。
- 依赖: Task 8
- TDD: grid 组件测试
- 验证: `pnpm test -- grid/`

### Task 10: 集成验证 + CI
- 状态: completed
- 文件: 全局
- 描述: 完整 CI 验证: type-check → lint → format → test → build → lighthouse。修复所有 gate failures。清理废弃代码（旧 blocks/、旧 home/、旧 layout components 中不再使用的部分）。
- 依赖: Task 9
- TDD: 全套
- 验证: `pnpm ci:local`

## 阻塞记录
| Task | 原因 | 待解决 |
|------|------|--------|
| — | — | — |

## 自主决策（挂机模式）
| 决策 | 理由 | Task |
|------|------|------|
| SiteFooter 不纳入 page.tsx | layout.tsx 已有 Footer 组件，避免重复 | Task 8 |
| 移除 LCP 优化（HeroSectionStatic） | 简化初始重构，后续可恢复 | Task 8 |
| i18n scanner 失败延迟到 Task 10 | 旧 src/components/home/ 仍被扫描，不影响新页面 | Task 8 |

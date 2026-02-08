# Homepage Redesign v6 — Progress Log

## 初始化
- 分支: `feat/homepage-redesign-v6` (from `main`)
- 模式: 挂机
- 设计规范: docs/S/ (tokens.md, grid.md, components.md)
- 原型: docs/design/homepage/prototype/v6-swagelok-vercel/index.html

## Session 1: Task 1-7

### Task 1: 替换设计 Token (globals.css)
状态: completed
- Figtree + JetBrains Mono 字体变量
- #004D9E Tianze Blue 色系
- 8px radius system
- 移除 Twitter-inspired tokens

### Task 2: 更新字体配置 (layout.tsx)
状态: completed
- next/font/google: Figtree (400-700) + JetBrains Mono (400-700)
- CSS 变量绑定到 @theme inline

### Task 3: 适配 Button 组件
状态: completed
- CVA variants: default/secondary/on-dark/ghost-dark/destructive/outline/ghost/link
- h-[38px] px-5 py-2.5, rounded-md, font-semibold

### Task 4: 创建 SectionHead 组件
状态: completed
- src/components/ui/section-head.tsx
- H2 + optional subtitle + optional action

### Task 5-7: 区块组件 (子代理)
状态: completed
- hero-section.tsx, chain-section.tsx, products-section.tsx
- resources-section.tsx, sample-cta.tsx, scenarios-section.tsx
- quality-section.tsx, final-cta.tsx, site-footer.tsx

## Session 2: Task 8 + 测试修复

### Task 8: 页面组装 + i18n
状态: completed
- 重写 messages/en/critical.json 和 messages/zh/critical.json — home.* 全部替换
- 重写 src/app/[locale]/page.tsx — 8 个区块组件直接组装
- 移除: loadCriticalMessages, extractHeroMessages, HeroSectionStatic, BelowTheFoldClient
- 验证: type-check ✓, build ✓ (58 pages), JSON ✓, lint ✓

### 测试修复
- button.test.tsx: 8 处断言更新匹配新 variant classes
- page.test.tsx: 完全重写 (102 行)，mock 8 个区块组件
- mobile-navigation-items-accessibility.test.tsx: focus-visible classes 更新
- 结果: 340 passed, 1 failed (i18n-scanner — 已知问题，延迟到 Task 10)

## Session 2 (续): Task 9-10

### Task 9: Vercel CSS Grid 装饰系统
状态: completed
- src/components/grid/grid-system.tsx — 外框 + crosshair marks
- src/components/grid/grid-section.tsx — display:grid + 选择性 guide borders + heroGuides()
- src/components/grid/grid-block.tsx — z-index:2 内容块 + 1px margin peek-through
- src/components/grid/index.ts — barrel export
- 18 个测试全部通过

### Task 10: 集成验证 + CI + 清理
状态: completed
- 删除废弃代码: src/components/home/ (26 文件), src/components/blocks/hero/ (2 文件)
- 删除废弃代码: src/lib/i18n/extract-hero-messages.ts, blocks/index.ts hero exports
- 删除废弃测试: tests/integration/pages/home.test.tsx
- i18n scanner: 0 missing keys ✓ (之前 8 个)
- 验证结果:
  - type-check ✓
  - lint ✓ (0 production code errors; 15 errors in .claude/skills/ + docs/ reference files)
  - test ✓ (331 files, 5568 tests, 0 failures)
  - build ✓

## 完成总结

10/10 Tasks 全部完成。首页重构 v6-swagelok-vercel 原型已转化为 React 组件：

| 组件 | 文件 |
|------|------|
| 设计 Token | globals.css |
| 字体 | layout.tsx (Figtree + JetBrains Mono) |
| Button | button.tsx (8 variants) |
| SectionHead | section-head.tsx |
| Hero | sections/hero-section.tsx |
| Chain | sections/chain-section.tsx |
| Products | sections/products-section.tsx |
| Resources | sections/resources-section.tsx |
| Sample CTA | sections/sample-cta.tsx |
| Scenarios | sections/scenarios-section.tsx |
| Quality | sections/quality-section.tsx |
| Final CTA | sections/final-cta.tsx |
| Grid System | grid/grid-system.tsx, grid-section.tsx, grid-block.tsx |
| i18n | messages/en/critical.json, messages/zh/critical.json |
| Page | app/[locale]/page.tsx |

# Motion Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish homepage motion to close the quality gap with Vercel-tier sites — reduce scroll-reveal jitter, add countUp numbers, integrate grid decorations, add section rhythm variation, tune micro-interaction timing.

**Architecture:** CSS token tuning + new CountUp client component + Grid integration from existing components + selective ScrollReveal direction changes. Zero new dependencies.

**Tech Stack:** React 19, Tailwind CSS 4, existing ScrollReveal/Grid components, CSS keyframes.

---

## 状态
- 当前: Task 1
- 进度: 0/8
- 模式: 挂机

## Tasks

### Task 1: Tune scroll-reveal CSS tokens
- 状态: pending
- 文件: `src/app/globals.css`
- P0: `--scroll-reveal-distance: 20px` → `12px`

### Task 2: CountUp component + tests
- 状态: pending
- 文件: `src/components/ui/count-up.tsx`, `src/components/ui/__tests__/count-up.test.tsx`
- P0: Animated number counter for proof bar

### Task 3: Integrate CountUp into hero ProofBar
- 状态: pending
- 文件: `src/components/sections/hero-section.tsx`
- P0: Replace static numbers with CountUp

### Task 4: Integrate GridFrame + HeroGuideOverlay
- 状态: pending
- 文件: `src/app/[locale]/page.tsx`, `src/components/sections/hero-section.tsx`
- P1: Wire existing grid components into page

### Task 5: Section rhythm variation
- 状态: pending
- 文件: `src/components/sections/products-section.tsx`, `src/components/sections/scenarios-section.tsx`
- P2: Products → `scale` direction, Scenarios → `120ms` stagger

### Task 6: Nav link transition speed
- 状态: pending
- 文件: `src/app/globals.css` or nav component
- P2: Nav links `0.15s → 0.1s`

### Task 7: Full verification
- 状态: pending
- 验证: type-check + lint + test + build

### Task 8: CI loop
- 状态: pending
- 推送 + CI 监控

## 阻塞记录
| Task | 原因 | 待解决 |

## 自主决策（挂机模式）
| 决策 | 理由 | Task |

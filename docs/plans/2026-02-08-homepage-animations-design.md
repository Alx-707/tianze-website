# Homepage Animation Design

Date: 2026-02-08

## Context

### Current State
- 首页 8 个 section 全部静态，仅有 hover 过渡效果
- 基础设施完备但未使用：duration/easing CSS tokens、`useIntersectionObserver` hook、4 个 keyframe 动画、`prefers-reduced-motion` 支持
- 无外部动画库依赖（无 framer-motion）
- 所有 section 均为 `"use client"` 组件，可直接使用 hooks

### Design Principles (from MOTION-PRINCIPLES.md)
- B2B 工业站：restraint + speed + purposeful motion
- 交互动画 < 300ms，滚动入场 ~500-600ms
- 仅动画 `transform` + `opacity`（GPU 加速）
- 必须尊重 `prefers-reduced-motion`
- Entrance 用 `ease-out`

---

## Architecture Decision

### 方案比较

| 方案 | 描述 | 优势 | 劣势 |
|------|------|------|------|
| A. `<ScrollReveal>` 包裹组件 | 声明式 wrapper | 零改动 section 内部、可复用 | 多一层 div |
| B. 直接 hook + className | 每个 section 内部调用 hook | 无额外 DOM、颗粒度最细 | 每个 section 都要改 |
| C. CSS `@starting-style` | 纯 CSS 方案 | 零 JS 成本 | 无滚动触发能力 |

### 选定方案：A + B 混合

- **`<ScrollReveal>`** — 通用 wrapper，用于 section 级整体入场 + card 级 stagger
- **Hero 直接 hook** — Hero 需要 6 段 stagger 序列，用 wrapper 太嵌套

### 为什么不引入 framer-motion

| 考量 | 结论 |
|------|------|
| Bundle size | 34KB gzip，对此项目过重 |
| 功能需求 | 只需 scroll-reveal + stagger，CSS transition 足够 |
| 现有基础 | `useIntersectionObserver` 已生产就绪 |
| 维护成本 | 零新依赖 = 零升级负担 |

---

## Component Design

### 1. `<ScrollReveal>` Component

**位置**: `src/components/ui/scroll-reveal.tsx`

**API**:
```tsx
interface ScrollRevealProps {
  children: React.ReactNode;
  /** Animation direction */
  direction?: "up" | "down" | "fade" | "scale";
  /** Delay in ms (for manual stagger) */
  delay?: number;
  /** Index-based stagger (delay = index × staggerInterval) */
  staggerIndex?: number;
  /** Stagger interval per item (default 80ms) */
  staggerInterval?: number;
  /** Animation duration override */
  duration?: number;
  /** IntersectionObserver threshold */
  threshold?: number;
  /** HTML tag to render */
  as?: "div" | "section" | "article";
  /** Additional className */
  className?: string;
}
```

**实现策略**:
- 使用 `useIntersectionObserver` (triggerOnce: true)
- delay > 0 时使用 `useIntersectionObserverWithDelay`
- 初始态：CSS class 控制 `opacity: 0` + transform offset
- 可见态：切换到 `opacity: 1` + `transform: none`
- `transition` 属性（非 `animation`）—— 更适合 class toggle 模式
- `prefers-reduced-motion`：hook 内部已处理，立即返回 `isVisible: true`

**CSS tokens 新增** (globals.css):
```css
--scroll-reveal-distance: 20px;
--scroll-reveal-duration: 600ms;
--scroll-reveal-stagger: 80ms;
```

### 2. Hero Stagger Animation

**位置**: 直接在 `hero-section.tsx` 中实现

**Stagger 序列** (总时长 ~400ms):
| Element | Delay | Duration |
|---------|-------|----------|
| Eyebrow | 0ms | 500ms |
| H1 Title | 80ms | 500ms |
| Subtitle | 160ms | 500ms |
| CTA Buttons | 240ms | 500ms |
| Proof Bar | 320ms | 500ms |
| Hero Visual | 200ms | 600ms |

**方式**：每个 child 用 `<ScrollReveal>` 包裹，传不同 `staggerIndex`。Hero section 本身不需要 wrapper（它在 viewport 顶部，页面加载时就可见）。

但 Hero 在首屏——它不是滚动触发的，是**页面加载触发的**。所以 Hero 需要不同逻辑：

**Hero 特殊处理**：
- 不用 IntersectionObserver
- 使用 CSS `animation` + `animation-delay`（页面加载自动播放）
- 或者使用 `useEffect` + state toggle（mount 后触发）

选定：**CSS animation 方案**。在 globals.css 定义 `hero-stagger-{N}` utility classes：
```css
.hero-stagger-1 { animation: slideUp 500ms var(--ease-out) 0ms both; }
.hero-stagger-2 { animation: slideUp 500ms var(--ease-out) 80ms both; }
.hero-stagger-3 { animation: slideUp 500ms var(--ease-out) 160ms both; }
.hero-stagger-4 { animation: slideUp 500ms var(--ease-out) 240ms both; }
.hero-stagger-5 { animation: slideUp 500ms var(--ease-out) 320ms both; }
.hero-stagger-6 { animation: slideUp 600ms var(--ease-out) 200ms both; }
```

好处：纯 CSS 无 JS 开销，SSR 友好，`prefers-reduced-motion` 已全局处理。

---

## Per-Section Animation Plan

| Section | Animation Type | Detail |
|---------|---------------|--------|
| **Hero** | CSS stagger on mount | 6 elements 依次 slideUp, 0-320ms delay |
| **Chain** | ScrollReveal(up) | 整个 section 作为一个单元 fade-up |
| **Products** | ScrollReveal(up) + card stagger | SectionHead 先入，4 cards stagger 80ms 间隔 |
| **Resources** | ScrollReveal(up) + card stagger | 同 Products 模式 |
| **SampleCTA** | ScrollReveal(up) | 单一 CTA banner，整体 fade-up |
| **Scenarios** | ScrollReveal(up) + card stagger | 同 Products 模式 |
| **Quality** | ScrollReveal(up) + card stagger | Commitments grid + cert badges 两段 stagger |
| **FinalCTA** | ScrollReveal(fade) | 轻量 fade（bg-primary 全宽，不需要位移） |

---

## Technical Constraints

1. **仅 `transform` + `opacity`** — 不动画 layout 属性
2. **`will-change: auto`** — 不预设 `will-change`（element 少、动画短）
3. **Stagger 总时长 ≤ 400ms** — 避免用户等待感
4. **Threshold 0.15** — section 15% 可见时触发（略高于默认 0.1）
5. **triggerOnce: true** — 入场动画只播放一次

## Accessibility

- `prefers-reduced-motion: reduce` → `useIntersectionObserver` 立即返回 visible，跳过动画
- CSS 全局已有 `animation-duration: 0.01ms !important` 降级
- 无 ARIA 变更需要（装饰性动画，不影响内容可达性）

## Testing Strategy

1. **Unit tests** — `<ScrollReveal>` 组件：渲染 children、class toggle、reduced motion 行为
2. **E2E stability** — 现有 homepage.spec.ts 不应受影响（动画后内容仍可见）
3. **Visual regression** — 需要更新 baselines（header 不变，其他 optional）
4. **Performance** — Lighthouse 检查 CLS 不增加

## File Changes Summary

| Action | File |
|--------|------|
| CREATE | `src/components/ui/scroll-reveal.tsx` |
| CREATE | `src/components/ui/__tests__/scroll-reveal.test.tsx` |
| MODIFY | `src/app/globals.css` — 新增 scroll-reveal tokens + hero-stagger classes |
| MODIFY | `src/components/sections/hero-section.tsx` — 添加 stagger classes |
| MODIFY | `src/components/sections/chain-section.tsx` — 包裹 ScrollReveal |
| MODIFY | `src/components/sections/products-section.tsx` — SectionHead + cards stagger |
| MODIFY | `src/components/sections/resources-section.tsx` — 同上 |
| MODIFY | `src/components/sections/sample-cta.tsx` — 包裹 ScrollReveal |
| MODIFY | `src/components/sections/scenarios-section.tsx` — 同 Products |
| MODIFY | `src/components/sections/quality-section.tsx` — 包裹 ScrollReveal + stagger |
| MODIFY | `src/components/sections/final-cta.tsx` — 包裹 ScrollReveal(fade) |

## Risks

| Risk | Mitigation |
|------|-----------|
| CLS 增加（元素初始 opacity:0） | 初始态用 `opacity: 0` 不占 layout 变化；transform 不改尺寸 |
| E2E 测试不稳定 | 动画 triggerOnce + reduced-motion 降级；test env 已 disable animations |
| Hero stagger 在慢网络下闪烁 | CSS animation `both` fill-mode 确保初始帧不闪 |
| LCP 受 Hero opacity:0 影响 | Hero H1 的 animation-delay 仅 80ms，对 LCP 影响可忽略 |

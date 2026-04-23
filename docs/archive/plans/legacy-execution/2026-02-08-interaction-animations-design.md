# Interaction Animations Design

## Problem

首页只有入场动画（ScrollReveal + Hero stagger），缺少交互反馈层。用户 hover 卡片/按钮时反馈太弱，网站感觉"静态"。

## Design Principles

1. **补齐交互层，不加装饰层** — 只做 hover/active 微交互，不做渐变光晕/粒子等
2. **B2B 克制** — 效果微妙但可感知，不花哨
3. **复用现有变量** — `--duration-fast`, `--ease-out`, `--ease-spring` 等
4. **性能优先** — 只用 `transform`, `box-shadow`, `opacity`（GPU 加速属性）

## Current State Audit

| Component | Current Hover | Missing |
|-----------|--------------|---------|
| ProductCard | shadow-card → shadow-card-active | **No translateY lift** |
| ScenarioCard | shadow-card → shadow-card-hover | **No translateY lift**, no internal reaction |
| ChainStepCard | bg → primary-50 | OK for grid cell (no lift needed) |
| ResourceCard | bg → primary-50 | **No arrow movement on hover** |
| QualityCommitment | **None** | Needs subtle hover |
| Buttons (all) | Color/opacity changes | **No active:scale press** |
| Section dividers | Static border-t | OK (keep static) |

## Proposed Changes

### 1. Card Hover Lift (ProductCard + ScenarioCard)

Add `hover:-translate-y-0.5` (2px lift) + combine with existing shadow transition.

**ProductCard:**
```
Before: transition-shadow hover:shadow-[var(--shadow-card-active)]
After:  transition-[box-shadow,transform] hover:shadow-[var(--shadow-card-active)] hover:-translate-y-0.5
```

**ScenarioCard:**
```
Before: transition-shadow hover:shadow-card-hover
After:  transition-[box-shadow,transform] hover:shadow-card-hover hover:-translate-y-0.5
```

Why 2px not 4px: B2B 克制。2px 够感知但不夸张。

### 2. Resource Card Arrow Slide

ResourceCard already has `group` class implicit in `<a>`. Add arrow `→` sliding right on hover:
```
Before: <span>→</span>
After:  <span className="transition-transform group-hover:translate-x-1">→</span>
```

### 3. Button Active Press

Add `active:scale-[0.98]` to button base variant. This gives tactile feedback on click.

```
Before: transition-all duration-150
After:  transition-all duration-150 active:scale-[0.98]
```

### 4. Quality Commitment Card Hover

Add subtle bg shift on hover (same pattern as ChainStepCard):
```
Before: bg-white p-5
After:  bg-white p-5 transition-colors hover:bg-[var(--primary-50)]
```

### 5. Scenario Card Image Scale on Hover

The scenario card has a placeholder image div. Add subtle scale on card hover:
```
Before: <div className="h-40 bg-gradient-to-br ..." />
After:  <div className="h-40 bg-gradient-to-br ... transition-transform group-hover:scale-[1.02]" />
```

Need to ensure `overflow-hidden` on parent (already present).

## Not Doing

- Section divider animations — they're simple `border-t`, animating them adds complexity for no perceived value
- Parallax effects — performance cost too high for B2B
- Gradient animations — off-brand for industrial
- Complex `group-hover` chains — one reaction per card is enough

## Risks

| Risk | Mitigation |
|------|-----------|
| `transition-all` on button is broad | Already exists, just adding `active:scale` |
| Card lift causes layout shift | `transform` doesn't affect layout |
| `transition-[box-shadow,transform]` verbose | Cleaner than `transition-all`, only transitions what changes |

# Design: Manufacturing-First Design Token System v2.1

## Context

Tianze Pipe Industry requires a distinctive visual identity that communicates manufacturing expertise and industrial authority. The current generic shadcn/ui theme fails to differentiate the brand.

### Stakeholders
- **End Users**: B2B buyers, engineering contractors, OEM factories
- **Brand**: Tianze Pipe Industry (天泽管业)
- **Technical**: Next.js 16 + Tailwind CSS 4 + shadcn/ui

### Constraints
- Must maintain WCAG AA accessibility (4.5:1 contrast minimum)
- Must work with existing shadcn/ui component structure
- Must support light/dark themes
- Must not significantly impact performance (Lighthouse ≥0.85)
- Must not introduce runtime external font requests; prefer bundled fonts (or explicitly accept build-time download behavior)

## Goals / Non-Goals

### Goals
- Establish distinctive manufacturing brand identity
- Avoid "AI slop" aesthetics (generic tech blue, Geist Sans, large radius)
- Maintain accessibility compliance
- Provide complete token coverage (color, typography, spacing, animation)

### Non-Goals
- Component redesign (use existing shadcn/ui structure)
- Custom icon set (continue using Lucide)
- Marketing copy changes
- Logo redesign

## Decisions

### Decision 1: Industrial Amber as Primary

**What**: Use `oklch(0.75 0.160 75)` (Industrial Amber) as `--primary` for CTA buttons and key interactive elements.

**Why**:
- Amber is the universal color of industrial safety signage
- Creates immediate visual distinction from tech blue competitors
- High chroma ensures unmistakable call-to-action
- Validated in tweakcn preview with positive results

**Alternatives considered**:
- Deep Graphite as Primary (v2.0) — rejected because CTA buttons were not prominent enough
- Steel Blue (v1.0) — rejected as too close to generic tech blue

### Decision 2: Deep Graphite as Accent

**What**: Use `oklch(0.20 0.015 250)` (Deep Graphite) as `--accent` for secondary emphasis and structural elements.

**Why**:
- Provides sophisticated, substantial feel
- Near-achromatic with cool undertone (hue 250) avoids pure black harshness
- Works well for text, borders, and secondary buttons

### Decision 3: IBM Plex Sans Typography

**What**: Replace Geist Sans with IBM Plex Sans as primary font.

**Why**:
- Industrial heritage (designed by IBM for engineering contexts)
- Works well alongside explicit CJK fallbacks (important for Chinese locale)
- Timeless design (2017) vs trendy (Geist 2024)
- Differentiates from "AI template" aesthetic

**Trade-offs**:
- Additional font loading (~20-40KB)
- Mitigation: Use `font-display: swap` and subset if needed

### Decision 4: Sharp Radius (0-4px)

**What**: Reduce `--radius` from `0.625rem` (10px) to `4px`.

**Why**:
- Reflects CNC-machined precision aesthetic
- Differentiates from soft, rounded "friendly" SaaS designs
- Aligns with manufacturing visual language

**Trade-offs**:
- May feel less "modern" to some users
- Existing components will look different

### Decision 5: Mechanical Animation Easing

**What**: Use `cubic-bezier(0, 0, 0.2, 1)` (snap) and `cubic-bezier(0.4, 0, 0.2, 1)` (mechanical) instead of spring/bounce.

**Why**:
- Industrial motion = mechanical precision
- No playful bounce effects (inappropriate for B2B manufacturing)
- Fast response times (efficient, not leisurely)

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Visual regression in existing components | Medium | Thorough visual testing in light/dark modes |
| Font loading performance impact | Low | Use `font-display: swap`, consider subsetting |
| Existing spring/bounce easing in UI | Medium | Audit and replace with mechanical easing tokens (no overshoot/bezier "spring" curves) |
| Shadow tokens not applied by utilities | Medium | Ensure Tailwind `shadow-*` utilities resolve to tokenized shadows (or explicitly scope where custom shadows are used) |
| User unfamiliarity with amber CTA | Low | Amber is universally recognized as action color |
| Radius change breaks layouts | Low | CSS variables ensure consistent application |

## Migration Plan

### Phase 1: Token Foundation
1. Update `globals.css` with v2.1 tokens
2. Add font loading for IBM Plex Sans (this repo wires fonts via `src/app/[locale]/layout-fonts.ts` + `src/app/layout.tsx`)
3. Run full test suite

### Phase 2: Visual Validation
1. Manual inspection of all pages in light/dark modes
2. Lighthouse performance check
3. Accessibility audit

### Phase 3: Refinement
1. Address any visual issues discovered
2. Update documentation
3. Archive change proposal

### Rollback
If issues arise, revert `globals.css` to previous commit. Token-based system ensures clean rollback.

## Open Questions

1. **Font subsetting**: Should we subset IBM Plex Sans for Latin-only to reduce bundle size?
   - Recommendation: Start without subsetting, optimize if Lighthouse flags it

2. **Font sourcing**: Bundle IBM Plex as local `.woff2` (preferred for reproducibility) or use `next/font/google` (build-time download)?
   - Recommendation: Prefer bundled local fonts to avoid network coupling and keep current "local font" posture consistent.

3. **Dark mode amber brightness**: Is `oklch(0.80 0.160 75)` bright enough for dark mode CTA?
   - Validated in tweakcn, appears sufficient

4. **Shadow integration**: Should token shadows map to Tailwind `shadow-*` utilities, or be used only via explicit custom classes?
   - Recommendation: Map to `shadow-*` where feasible to avoid "two shadow systems".

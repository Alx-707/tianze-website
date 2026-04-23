# FAQ Prototype v1 — Design Audit Report

**File audited**: `docs/impeccable/faq/prototype/v1/index.html`
**Date**: 2026-03-25
**Auditor**: Claude Code (design systems audit)
**References**: `PAGE-PATTERNS.md`, `TIANZE-DESIGN-TOKENS.md`, `src/app/globals.css`

---

## Summary

| Dimension | Score | Status |
|-----------|-------|--------|
| Accessibility | 7/10 | Pass with issues |
| Performance | 8/10 | Good |
| Theming | 6/10 | Several mismatches |
| Responsive | 7/10 | Pass with issues |
| Anti-patterns | 8/10 | Good |
| **Overall** | **7.2/10** | **Acceptable — fix Critical/High before implementation** |

The prototype has a solid structural foundation and correct page-level decisions (no GridFrame, correct container, correct section rhythm). The main concerns are: shadow-card token mismatch, missing focus states on the CTA buttons, accordion using display:none instead of a WCAG-compliant disclosure pattern, and several minor spacing/sizing deviations from the canonical spec.

---

## Dimension 1 — Accessibility

**Score: 7/10**

### Issues

**[Critical] Accordion uses `display:none` — content hidden from screen readers when collapsed**

The collapsed `.accordion-content` is toggled with `display: none` / `display: block`. Screen readers in "browse mode" skip `display:none` content entirely, which is correct — but the element is not associated with its trigger via `aria-controls`. Without this association, a screen reader user cannot know what the button controls or navigate to the region when it expands.

Fix: Add `id` to each `.accordion-content`, and `aria-controls="<id>"` to each `.accordion-trigger`. Example:
```html
<button aria-expanded="false" aria-controls="faq-answer-1" ...>
<div id="faq-answer-1" role="region" aria-labelledby="faq-trigger-1" ...>
```

**[High] CTA buttons lack `focus-visible` states**

`.btn-on-dark` and `.btn-ghost-dark` have no `:focus-visible` rule. On the primary blue background, a keyboard user tabbing to these buttons will see no focus indicator at all. This fails WCAG 2.4.7 (Focus Visible, Level AA).

Fix: Add to both button classes:
```css
.btn-on-dark:focus-visible,
.btn-ghost-dark:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}
```

**[High] Category index touch targets below 44px on mobile**

On `max-width: 640px`, category pills are reduced to `padding: 6px 12px` with `font-size: 13px`. The resulting tap target is approximately 29–32px tall — well below the WCAG 2.5.5 / Apple HIG minimum of 44px.

Fix: Change mobile override to `padding: 10px 14px` to maintain at least 44px height.

**[Medium] `<section class="category-index">` has no heading or `aria-label`**

The category index is a navigational chunk with no accessible label. The inner `<nav aria-label="FAQ categories">` is correct, but the containing `<section>` is an unlabelled landmark. Screen readers list page landmarks; an anonymous `<section>` becomes a generic region with no name.

Fix: Either promote the `<nav>` to sit directly at the top level (removing the outer `<section>`), or add `aria-label="Jump to section"` to the `<section>`.

**[Medium] `<section class="faq-cta">` is outside `<main>`**

The CTA section is placed after `</main>` in the HTML. This is structurally incorrect — the CTA is page content, not a footer. Screen readers and crawlers that operate within the `<main>` landmark will skip it entirely.

Fix: Move `.faq-cta` inside `<main>` as the final child, immediately before the closing `</main>` tag.

**[Low] SVG chevrons have no `aria-hidden="true"`**

Each `<svg class="accordion-chevron">` is a purely decorative icon. Without `aria-hidden="true"`, some screen readers will attempt to read the unnamed SVG element. Add `aria-hidden="true"` to every chevron SVG.

**[Low] Accordion JS does not announce expanded state change via `aria-live`**

When an accordion opens, `aria-expanded` is updated correctly — but the revealed content region has no `role="region"` to form a proper ARIA disclosure widget pair. On some screen reader + browser combinations, the user will not be automatically moved to the answer. Adding `role="region"` + `aria-labelledby` (pointing to the trigger) on each `.accordion-content` resolves this.

### Passing checks

- `aria-expanded` is toggled correctly via JS.
- `aria-label="FAQ categories"` on the nav element is correct.
- `.category-index a:focus-visible` and `.accordion-trigger:focus-visible` both have explicit outline rules.
- Color contrast: `--primary` (#004d9e) on white = ~7.1:1 (exceeds WCAG AA 4.5:1 and meets AAA 7:1). `--muted-foreground` (#5f6b73) on `--background` (#fafafa) = ~5.1:1, meeting AA for normal text.
- Single `<h1>` per page. Heading hierarchy (h1 → h2 inside sections) is correct.
- `<main>` landmark is present (though CTA is outside it).
- `<html lang="en">` is set.

---

## Dimension 2 — Performance

**Score: 8/10**

### Issues

**[Medium] Accordion uses `display:none` toggle instead of CSS height animation**

The current implementation hides content with `display: none` and reveals it with `display: block`. This is instant — no layout thrash — but provides zero visual continuity and is not composited. More importantly, an animated height approach using `grid-template-rows: 0fr → 1fr` (the modern CSS technique) would provide smoother UX with zero JavaScript involvement and no reflow. Not a blocking issue for prototype, but relevant for implementation.

**[Medium] Google Fonts loaded synchronously via `<link rel="stylesheet">`**

Two Google Fonts families (Figtree + JetBrains Mono) are loaded with standard `<link>` tags. In production (Next.js), these will be handled by `next/font` which self-hosts and eliminates the external network dependency entirely. This is a prototype-only concern — not an issue for implementation — but worth noting so the implementation does not replicate this pattern.

**[Low] `scroll-behavior: smooth` on `<html>`**

Combined with the JS `scrollIntoView({ behavior: 'smooth' })` on category links, the smooth scroll fires twice (CSS + JS). The JS override suppresses the CSS behavior in modern browsers, but in some older engines both fire. Prefer one mechanism — the JS `scrollIntoView` is correct; remove `scroll-behavior: smooth` from the `<html>` reset.

### Passing checks

- No external JS frameworks or libraries. Minimal inline script (~15 lines).
- No unnecessary animations. Chevron rotate and transition-color are GPU-compositable (transform + color only).
- CSS is entirely inline — no render-blocking external stylesheets beyond fonts.
- No `will-change` abuse.
- Animation durations are fast (150–200ms), within the design system's defined values.
- Tables are used correctly for tabular spec data (not layout).

---

## Dimension 3 — Theming

**Score: 6/10**

### Issues

**[Critical] `--shadow-card` token value does not match `globals.css`**

The prototype defines:
```css
--shadow-card: 0 0 0 1px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
```

Production `globals.css` defines:
```css
--shadow-card:
  0 0 0 1px rgba(0,0,0,0.08), 0px 1px 1px rgba(0,0,0,0.02),
  0px 4px 8px rgba(0,0,0,0.04);
```

The middle layer differs: prototype uses `0 1px 3px rgba(0,0,0,0.06)` vs production `0px 1px 1px rgba(0,0,0,0.02)`. The prototype shadow is visibly heavier than what the production site renders.

Similarly, `--shadow-card-hover` differs:
- Prototype: `0 0 0 1px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)`
- Production: `0 0 0 1px rgba(0,0,0,0.12), 0px 2px 4px rgba(0,0,0,0.04), 0px 8px 16px -4px rgba(0,0,0,0.06)`

Fix: Copy the exact token values verbatim from `globals.css`.

**[High] `--primary-light` token value mismatch**

The prototype defines `--primary-light: #e8f0fe`. Production `globals.css` defines `--primary-light: #e8f0fe`. These match. However, `--primary-50` in the prototype is `#f0f6ff`, which also matches production. No fix needed here — this passes. Marking as reviewed.

**[High] `--font-sans` fallback stack differs from production**

Prototype:
```css
--font-sans: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Production `globals.css`:
```css
--font-sans:
  var(--font-figtree), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif;
```

The prototype uses the string `'Figtree'` directly instead of `var(--font-figtree)`. In the Next.js implementation, `next/font` injects Figtree as `--font-figtree` CSS variable; if the prototype pattern is copied verbatim, the font binding will be broken (falling back to system fonts until the correct var reference is used). This is a translation-time trap.

**[High] `--muted` value is `#f0f1f3` in prototype but `globals.css` defines `--muted: #f0f1f3`**

These match. No fix needed — marking as reviewed.

**[Medium] FinalCTA `<h2>` typography deviates from PAGE-PATTERNS spec**

The prototype CTA h2 is `font-size: 36px`, which matches the `PAGE-PATTERNS.md` FinalCTA H2 spec (`text-[36px]`). However, `letter-spacing: -0.02em` is correct per spec. The `font-weight: 700` matches `font-bold`. This passes.

**[Medium] Section h2 mobile override reduces to `font-size: 24px` on small screens**

At `max-width: 640px`, `.section-head h2` drops to `24px`. `PAGE-PATTERNS.md` specifies H2 as `32px` with no responsive reduction documented. The homepage SectionHead component does not appear to scale H2 down on mobile. This creates a visual discrepancy between the prototype and the implementation.

Fix: Remove the `font-size: 24px` mobile override for `.section-head h2` or confirm it is intentional and document it in PAGE-PATTERNS.md.

**[Medium] `--radius` is `0.5rem` (8px) in both prototype and production — match confirmed**

The button radius of `6px` (`--button-radius: 6px`) also matches production. No fix needed.

**[Low] `--divider` token usage on `.faq-section` is correct**

The prototype correctly uses `border-top: 1px solid var(--divider)` with `#ebebeb`, matching the `section-divider` pattern in PAGE-PATTERNS.md. The first-section `border-top: none` exception is also correctly implemented. This passes.

**[Low] Footer placeholder color `#2c353b` matches `--footer-bg` and `--gray-800`**

The footer placeholder uses `background: #2c353b`, which is identical to `--footer-bg` / `--gray-800` in production. This passes.

**[Low] Hardcoded `#f0f6ff` in `.btn-on-dark:hover`**

The hover background is hardcoded as `#f0f6ff` instead of `var(--primary-50)`. In the prototype this is functionally identical, but in implementation it should use the token.

---

## Dimension 4 — Responsive

**Score: 7/10**

### Issues

**[High] Category pill touch targets below 44px on mobile (see Accessibility section)**

Documented above. Padding `6px 12px` at 13px font produces ~29px height. Minimum 44px required.

**[High] Tables inside accordions have no mobile scroll wrapper**

Five sections contain tables (certifications comparison, Schedule 40/80, conduit size guide, bending radius, mechanical grades, indoor/outdoor). On narrow viewports (320–480px), these tables will overflow the container or compress columns to near-unreadable widths. There is no `overflow-x: auto` wrapper and no responsive handling.

Fix: Wrap each `<table>` in:
```html
<div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
  <table>...</table>
</div>
```
Or in the React implementation, create a `<ScrollTable>` component.

**[Medium] No `sm` breakpoint (640px) — jumps directly from mobile to `md` (768px)**

The prototype has two breakpoints: default (mobile) and `@media (min-width: 768px)`. There is no `sm: 640px` treatment. For tablets held in portrait mode (768–1024px), the category pills and accordion padding scale up correctly. However, the gap between "mobile with cramped pills" and "desktop with comfortable pills" has no mid-point. Consider adding a `sm` breakpoint for the category index pill gap to prevent pill wrapping on mid-size screens.

**[Low] Hero section `max-width: 640px` on `.hero-description` is correct and intentional**

The description is capped at 640px to prevent excessively long line lengths. This is consistent with PAGE-PATTERNS best practice. Passes.

**[Low] CTA button group `flex-wrap: wrap` is correct**

At narrow widths, the two CTA buttons will stack. This is correct behavior. The `gap: 12px` is adequate. Passes.

**[Low] `accordion-trigger` font reduces to `14px` on mobile**

The trigger text drops from `15px` to `14px` on small screens. This is reasonable for body-weight interactive text. Passes.

---

## Dimension 5 — Anti-patterns / Brand Consistency

**Score: 8/10**

### Issues

**[Medium] `--ease-smooth` definition in prototype is `cubic-bezier(0.25, 0.1, 0.25, 1)` — this is `ease` not the project's `ease-smooth`**

Production `globals.css` defines `--ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1)`. These match. However, the prototype also defines `--ease-out: cubic-bezier(0, 0, 0.2, 1)`, which matches production. This passes.

**[Medium] No grid decoration system, but this is correct per PAGE-PATTERNS.md**

PAGE-PATTERNS.md explicitly states: "Contact / Blog / FAQ — not use (content-type pages don't need decoration)". The prototype correctly omits GridFrame and HeroGuideOverlay. This passes and is a positive finding.

**[Low] No gradient usage found — passes the "no gradient abuse" check**

Zero instances of `linear-gradient` or `radial-gradient` in the prototype CSS. The primary background is a flat `#fafafa` and CTA uses solid `--primary`. This is correct per the brand principle "Restraint signals confidence." Passes.

**[Low] No decorative flourishes or stock-photo patterns**

The prototype has no hero images, no testimonial carousels, no animated counters, no floating icons. Content is text-first with structured tables and lists — appropriate for a B2B technical FAQ. Passes.

**[Low] Brand differentiation visible in typography and spacing**

Figtree + JetBrains Mono combination is present. `--mono` class on standards codes (ISO, ASTM, UL) is used correctly — industrial engineering aesthetic applied to technical content. Passes.

**[Low] Color palette is disciplined**

Only `--primary`, `--foreground`, `--muted-foreground`, `--card`, `--muted`, `--border`, `--divider` are used. No extraneous colors introduced. The CTA section correctly uses `var(--primary)` as background with white text at `rgba(255,255,255,0.75)` for body and `rgba(255,255,255,0.5)` for trust line — consistent with PAGE-PATTERNS.md's `text-white/75` and `text-white/50` conventions. Passes.

---

## PAGE-PATTERNS.md Compliance Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Container `max-w-[1080px] px-6` | PASS | `max-width: 1080px; padding: 0 24px` |
| Section spacing `py-14 md:py-[72px]` | PASS | `56px` mobile, `72px` desktop |
| Hero spacing `py-10 pb-14 md:py-16 md:pb-[72px]` | PASS | 40px/56px mobile, 64px/72px desktop |
| H1 `36/48px extrabold tracking` | PASS | Exact match to spec |
| H2 `32px bold tracking via SectionHead` | PARTIAL | 32px desktop correct; 24px mobile is an undocumented deviation |
| H2 FinalCTA `36px bold text-white` | PASS | Correct |
| Card system `shadow-card` (not border) | PASS | Accordion group uses shadow-card |
| No `border border-border` as card | PASS | Internal borders only for dividers |
| No GridFrame | PASS | Correct for content page |
| FinalCTA outside GridFrame | PASS | (No GridFrame present; CTA is after `</main>` — see Accessibility issue) |
| `section-divider` pattern | PASS | `border-top: 1px solid var(--divider)` with first-child exception |
| Eyebrow typography `13px semibold uppercase tracking-[0.04em]` | PASS | Matches spec |
| `on-dark` / `ghost-dark` button variants | PASS | Correct variants used |
| i18n (all user-facing text via translation keys) | N/A | Prototype — hard-coded text expected |

---

## Prioritised Fix List

### Must Fix Before Implementation

1. **[Critical] `aria-controls` + `role="region"` on accordion** — WCAG 2 compliance for keyboard/screen reader users.
2. **[Critical] `shadow-card` token value** — Copy exact 3-layer definition from `globals.css` to avoid visual regression on implementation.
3. **[High] `focus-visible` on CTA buttons** — White outline, 2px, 2px offset on the primary blue surface.
4. **[High] Table overflow wrapper** — `overflow-x: auto` on all `<table>` elements for mobile.
5. **[High] Move `.faq-cta` inside `<main>`** — Structural correctness and landmark compliance.

### Fix Before Dev Handoff

6. **[High] Category pill touch targets** — Increase mobile padding to maintain 44px minimum height.
7. **[Medium] `var(--font-figtree)` instead of `'Figtree'` string** — Avoid broken font binding in Next.js implementation.
8. **[Medium] Section H2 mobile size** — Clarify or remove `24px` override; align with production SectionHead behaviour.
9. **[Medium] `display:none` accordion** — Consider CSS `grid-template-rows` animation for production implementation (quality-of-life, not blocking).
10. **[Low] `aria-hidden="true"` on chevron SVGs** — Minor screen reader noise.
11. **[Low] Remove duplicate `scroll-behavior: smooth`** — Keep JS `scrollIntoView` only.
12. **[Low] `var(--primary-50)` instead of `#f0f6ff`** — Token hygiene in btn-on-dark hover.

---

## Overall Assessment

The prototype demonstrates sound structural judgment: correct container width, correct section rhythm, correct CTA placement pattern, no gradient abuse, no GridFrame on a content page, and disciplined color use. The accordion interaction model is appropriate for a B2B FAQ.

The primary gaps are accessibility (accordion ARIA pattern incomplete, CTA focus states missing) and one token value mismatch (shadow-card) that would produce a visible shadow discrepancy at implementation time. All Critical and High items have straightforward fixes and can be resolved before the design is handed to the TDD phase.

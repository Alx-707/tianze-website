# Design Tokens

> Tianze Website Design System — Single Source of Truth
> Origin: v6-swagelok-vercel prototype (Swagelok structure + Vercel craft)

## Colors

### Primary

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#004D9E` | CTA buttons, links, accents, eyebrow text |
| `--primary-dark` | `#003B7A` | Button hover, pressed states |
| `--primary-light` | `#E8F0FE` | Tag backgrounds, icon containers, banner bg |
| `--primary-50` | `#F0F6FF` | Card hover state background |

### Neutrals

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#FAFAFA` | Page background |
| `--surface` | `#FFFFFF` | Cards, nav, content surfaces |
| `--text` | `#36424A` | Body text, headings |
| `--text-secondary` | `#5F6B73` | Descriptions, secondary copy |
| `--text-muted` | `#8D969D` | Labels, captions, placeholders |
| `--border` | `#E2E5E9` | Card borders, nav bottom border |
| `--border-light` | `#F0F1F3` | Internal dividers (hero-proof, chain-stats, certs) |
| `--divider` | `#EBEBEB` | Section boundary lines (≈ `rgba(0,0,0,0.08)`) |

### Semantic

| Token | Value | Usage |
|-------|-------|-------|
| `--success` | `#0F7B5F` | Checkmarks, cert badge icons |
| `--success-light` | `#EEFBF4` | Success stat card backgrounds |

### Grid System (component phase)

| Token | Value | Usage |
|-------|-------|-------|
| `--grid-guide` | `rgba(0,0,0,0.05)` | Cell border lines |
| `--grid-divider` | `rgb(235,235,235)` | Section border-top/bottom |
| `--grid-crosshair` | `rgb(168,168,168)` | Crosshair marks at anchor points |

### Dark Surfaces (Footer)

| Token | Value | Usage |
|-------|-------|-------|
| Footer bg | `#2C353B` | Footer background |
| Footer text | `#C1CAD0` | Footer body text |
| Footer heading | `#8A969E` | Footer section labels |
| Footer link | `#B4BEC6` | Footer links (hover: `#FFFFFF`) |
| Footer divider | `rgba(255,255,255,0.08)` | Footer border-top |

## Typography

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font` | `'Figtree', -apple-system, system-ui, sans-serif` | All headings and body text |
| `--mono` | `'JetBrains Mono', 'SF Mono', monospace` | Specs, step numbers, standards, proof values |

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Font |
|---------|------|--------|-------------|----------------|------|
| H1 (hero) | 44px | 800 | 1.12 | -0.025em | --font |
| H2 (section) | 32px | 700 | 1.2 | -0.02em | --font |
| H2 (banner/CTA) | 24px | 700 | 1.2 | — | --font |
| H2 (final CTA) | 36px | 700 | — | -0.02em | --font |
| H3 (card title) | 20px | 700 | 1.3 | — | --font |
| H3 (small card) | 15px–18px | 700 | 1.3 | — | --font |
| Body | 16px | 400 | 1.6 | — | --font |
| Body large | 18px | 400 | 1.6 | — | --font |
| Body small | 14px | 400 | 1.55 | — | --font |
| Caption | 13px | 400–600 | 1.5 | — | --font |
| Eyebrow | 13px | 600 | — | 0.04em | --font |
| Tag | 12px | 600 | — | 0.02em | --font |
| Mono value | 20px | 500 | — | — | --mono |
| Mono label | 12px | 500 | — | — | --mono |

### Mobile Overrides (≤768px)

| Element | Desktop | Mobile |
|---------|---------|--------|
| H1 | 44px | 36px |
| H2 (section) | 32px | 26px |
| Hero padding | 64px 0 72px | 40px 0 56px |
| Section padding | 72px 0 | 56px 0 |

## Spacing

### Base Unit: 4px

| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | — |
| sm | 6px | Spec list gap, proof item gap |
| md | 8px | Section-head p margin-top |
| lg | 12px | Card gap (products), chain-step margins |
| xl | 16px | Product card padding-top, card gaps |
| 2xl | 20px | Card body padding |
| 3xl | 24px | Container horizontal padding, section-head → gap, chain-step padding |
| 4xl | 28px | Hero CTA margin-top, hero-proof margin-top |
| 5xl | 32px | Nav-left gap, footer gap, banner padding-y |
| 6xl | 36px | Section-head margin-bottom, banner padding-x |
| 7xl | 48px | Hero grid gap, footer padding-top |
| 8xl | 64px | Hero padding-top |
| 9xl | 72px | Section padding, final CTA padding |

### Container

| Token | Value |
|-------|-------|
| `--container` | `1140px` (prototype) → `1080px` (component phase, align to Vercel) |
| Horizontal padding | `24px` |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Secondary button default |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.03)` | Secondary button hover |
| `--shadow` | `0 4px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)` | Elevated cards (reserved) |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Tags, cert badges |
| `--radius` | `8px` | Cards, resource icons, chain-steps container |
| `--radius-lg` | `12px` | Banners, large containers |
| Button radius | `6px` | All buttons |

## Transitions

| Property | Duration | Easing | Usage |
|----------|----------|--------|-------|
| color | 150ms | ease | Nav links |
| border-color, box-shadow | 150ms | ease | Product cards |
| background | 150ms | ease | Resource items, chain steps |
| all | 150ms | ease | Buttons |
| opacity | 150ms | ease | Product links |

## Interactive States

### Buttons

| Variant | Default | Hover |
|---------|---------|-------|
| Primary | bg: `--primary`, color: `#fff` | bg: `--primary-dark` |
| Secondary | bg: `--surface`, border: `--border`, shadow-xs | border: `#C8CDD2`, shadow-sm |
| On-dark | bg: `#fff`, color: `--primary` | bg: `rgba(255,255,255,0.9)` |
| Ghost | bg: transparent, border: `rgba(255,255,255,0.3)` | bg: `rgba(255,255,255,0.08)`, border: `rgba(255,255,255,0.5)` |

### Cards

| Component | Default Border | Hover |
|-----------|---------------|-------|
| Product card | `--border` | border: `--primary` + box-shadow: `0 0 0 1px var(--primary)` |
| Scenario card | `--border` | border: `#C8CDD2` |
| Chain step | bg: `--surface` | bg: `--primary-50` |
| Resource item | bg: `--surface` | bg: `--primary-50` |

### Focus

```css
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

## Responsive Breakpoints

| Breakpoint | Width | Grid Changes |
|------------|-------|-------------|
| Desktop | >1024px | Full layout (all columns) |
| Tablet | ≤1024px | Chain steps: 5→3 col, Commitments: 5→3, Resources: 4→2 |
| Mobile | ≤768px | All grids: 1 col, Nav links hidden, Footer: 2 col |

### Component Phase Breakpoints (align to Vercel)

| Breakpoint | Width | Purpose |
|------------|-------|---------|
| `--bp-nav` | `1150px` | Nav layout switch |
| `--bp-lg` | `1024px` | Content grid changes |
| `--bp-md` | `768px` | Mobile layout |
| `--bp-sm` | `480px` | Compact mobile |

## Accessibility

| Rule | Value |
|------|-------|
| Reduced motion | `transition-duration: 0.01ms` on all elements |
| Focus indicator | 2px solid `--primary`, offset 2px |
| Color contrast | `--text` on `--bg` = 8.2:1 (AAA), `--text-secondary` on `--bg` = 5.1:1 (AA) |
| Min touch target | 44×44px (buttons achieve via padding) |

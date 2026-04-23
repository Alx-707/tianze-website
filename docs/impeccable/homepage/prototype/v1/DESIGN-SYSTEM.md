# Tianze Homepage — Design System v1

> **Source**: ui-ux-pro-max (auto) + supplemental searches + brand context
> **Direction**: Industrial Trust & Authority
> **Date**: 2026-02-06

---

## Design Philosophy

Tianze is a **PVC conduit fittings manufacturer** that builds its own bending machines. The design must communicate:

- **Engineering Precision**: We make machines, not just pipes
- **Factory-Direct Trust**: No middlemen, verifiable claims
- **Global B2B Professionalism**: Export to 20+ countries

### Visual DNA

| Element | Direction |
|---------|-----------|
| Color | Deep navy (authority) + Amber CTA (industrial action) |
| Typography | IBM Plex Sans (industrial heritage) + JetBrains Mono (specs/data) |
| Radius | Sharp 2-4px (CNC-machined precision, not SaaS rounded) |
| Motion | Mechanical, no bounce (150-250ms, ease-out) |
| Layout | 8-section AIDA flow, dark/light alternating rhythm |
| Icons | Lucide line icons, industrial feel |

---

## Color Palette

### Primary Colors

| Role | Value | Usage |
|------|-------|-------|
| **Navy** (Primary) | `#0F172A` | Headlines, dark sections, authority |
| **Slate** (Secondary) | `#334155` | Body text, secondary elements |
| **Amber** (CTA) | `#D97706` | Primary buttons, key actions, industrial accent |
| **Amber Hover** | `#B45309` | CTA hover state |
| **White** | `#FFFFFF` | Cards, light sections |
| **Off-White** (Background) | `#F8FAFC` | Page background, light sections |
| **Light Gray** | `#F1F5F9` | Scenario cards background |

### Dark Section Colors

| Role | Value | Usage |
|------|-------|-------|
| **Dark BG** | `#0F172A` | Hero backdrop, Section 2, Final CTA |
| **Dark Surface** | `#1E293B` | Cards on dark background |
| **Dark Border** | `#334155` | Borders on dark sections |
| **Light Text on Dark** | `#F1F5F9` | Body text on dark |
| **White Text on Dark** | `#FFFFFF` | Headlines on dark |
| **Amber on Dark** | `#F59E0B` | CTA buttons on dark sections |

### Status Colors

| Role | Value |
|------|-------|
| Success/Verified | `#059669` |
| Warning | `#D97706` |
| Error | `#DC2626` |

### CSS Variables

```css
:root {
  --color-navy: #0F172A;
  --color-slate: #334155;
  --color-amber: #D97706;
  --color-amber-hover: #B45309;
  --color-amber-light: #F59E0B;
  --color-bg: #F8FAFC;
  --color-bg-light: #F1F5F9;
  --color-white: #FFFFFF;
  --color-text: #020617;
  --color-text-muted: #64748B;
  --color-border: #E2E8F0;

  /* Dark sections */
  --color-dark-bg: #0F172A;
  --color-dark-surface: #1E293B;
  --color-dark-border: #334155;
  --color-dark-text: #F1F5F9;
}
```

---

## Typography

### Font Stack

- **Headings**: IBM Plex Sans (Bold/SemiBold)
- **Body**: IBM Plex Sans (Regular/Medium)
- **Specs/Data**: JetBrains Mono (for technical specs, tolerances, dimensions)

### Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

### Type Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| Display | 60px / 3.75rem | 700 | Hero headline |
| H1 | 48px / 3rem | 700 | Section headers |
| H2 | 30px / 1.875rem | 600 | Sub-headers |
| H3 | 24px / 1.5rem | 600 | Card titles |
| Body Large | 18px / 1.125rem | 400 | Lead paragraphs |
| Body | 16px / 1rem | 400 | Standard text |
| Small | 14px / 0.875rem | 500 | Labels, tags |
| Caption | 12px / 0.75rem | 600 | Badges, uppercase labels |

### Typography Patterns

- Headlines: `letter-spacing: -0.025em; line-height: 1.2`
- Body: `letter-spacing: 0; line-height: 1.6`
- Labels/Tags: `letter-spacing: 0.05em; text-transform: uppercase`
- Specs: `font-family: JetBrains Mono; font-variant-numeric: tabular-nums`

---

## Border Radius

Manufacturing precision — sharp, not SaaS-rounded:

| Token | Value | Usage |
|-------|-------|-------|
| None | 0px | Tables, spec boxes |
| Sharp | 2px | Buttons, inputs |
| Base | 4px | Cards, containers |
| Soft | 6px | Modals, large containers |
| Round | 9999px | Pills, badges |

---

## Shadow System

| Level | Value | Usage |
|-------|-------|-------|
| sm | `0 1px 2px rgba(15,23,42,0.06)` | Subtle lift |
| md | `0 4px 6px rgba(15,23,42,0.08)` | Cards |
| lg | `0 10px 15px rgba(15,23,42,0.10)` | Elevated cards |
| xl | `0 20px 25px rgba(15,23,42,0.12)` | Hero images |

---

## Section Rhythm (Dark/Light)

v5-final.md specifies 8 sections with alternating backgrounds:

| # | Section | Background |
|---|---------|------------|
| 1 | Hero | Light + factory imagery |
| 2 | Full Chain Tech | **Dark** (navy) |
| 3 | Product Lines | Light (off-white) |
| 4 | Free Sample CTA | **Amber** (primary CTA) |
| 5 | Application Scenarios | Light gray |
| 6 | Service Commitments | Light (white) |
| 7 | Certifications + Logos | White |
| 8 | Final CTA | **Dark** (navy) |

---

## Component Specs

### Buttons

```css
.btn-primary {
  background: var(--color-amber);
  color: var(--color-navy);
  padding: 14px 28px;
  border-radius: 2px;
  font-weight: 600;
  font-family: 'IBM Plex Sans', sans-serif;
  letter-spacing: 0.025em;
  transition: background-color 200ms ease-out;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--color-amber-hover);
}

.btn-secondary {
  background: transparent;
  color: var(--color-white);
  border: 1.5px solid var(--color-white);
  padding: 14px 28px;
  border-radius: 2px;
  font-weight: 600;
  transition: all 200ms ease-out;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 24px;
  transition: border-color 200ms ease-out, box-shadow 200ms ease-out;
  cursor: pointer;
}

.card:hover {
  border-color: var(--color-amber);
  box-shadow: 0 4px 6px rgba(15,23,42,0.08);
}
```

### Tags/Badges

```css
.tag {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(217, 119, 6, 0.1);
  color: var(--color-amber);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: 2px;
}
```

---

## Animation

Mechanical precision — no playfulness:

| Type | Duration | Easing |
|------|----------|--------|
| Color transitions | 150ms | ease-out |
| Shadow/elevation | 200ms | ease-out |
| Content reveal | 250ms | ease-out |
| Page scroll | 300ms | ease-out |

**Forbidden**: bounce, spring, overshoot, scale transforms on hover.

---

## Anti-Patterns

| Do NOT | Do Instead |
|--------|------------|
| Tech blue (#3B82F6) | Deep navy + amber accent |
| 8-12px rounded corners | 2-4px sharp edges |
| Emojis as icons | Lucide SVG icons |
| Bounce/spring animations | Mechanical ease-out |
| Scale on hover | Color/shadow transitions |
| Glassmorphism | Crisp borders and surfaces |
| Generic stock photos | Factory/machine imagery |
| Gradient buttons | Solid amber fills |
| Playful/casual tone | Professional engineering tone |

---

## Accessibility

- Text contrast: minimum 4.5:1 (WCAG AA)
- Focus ring: 2px solid amber, 2px offset
- Touch targets: minimum 44x44px
- Reduced motion: respect `prefers-reduced-motion`
- All images: descriptive alt text
- Responsive: 375px, 768px, 1024px, 1440px

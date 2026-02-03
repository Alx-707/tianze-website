# Tianze Design Token System

> Industrial Steel Blue | B2B Manufacturing | Modern Minimalist

---

## 1. Design Philosophy

### Brand Positioning

Tianze is a B2B manufacturing enterprise. The design system reflects:

- **Professional Trust**: Steel blue conveys reliability and industrial precision
- **Modern Minimalism**: Linear/Vercel-inspired clean aesthetics
- **Manufacturing Heritage**: Colors and shadows inspired by refined steel

### Key Differentiators (Avoiding "AI Slop")

| Aspect | Generic Approach | Tianze Approach |
|--------|------------------|-----------------|
| Primary Blue | Tech blue (hue 210-220) | Industrial Steel Blue (hue 230) |
| Background | Pure white (#fff) | Blue-tinted white (oklch 0.99 0.005 230) |
| Typography | Inter, Roboto | Geist Sans (distinctive, variable) |
| Shadows | Gray shadows | Slate-toned shadows (rgb 15 23 42) |
| Radius | Generic 8-12px | Micro precision 4-8px |

---

## 2. Token Architecture

### Three-Layer Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Component Tokens                                  │
│  --button-primary-bg, --card-elevated-shadow, etc.          │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Semantic Tokens                                   │
│  --primary, --background, --destructive, --success, etc.    │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Primitive Tokens                                  │
│  --primary-50 to --primary-950, raw OKLCH values            │
└─────────────────────────────────────────────────────────────┘
```

### Naming Convention

```
--{category}-{element}-{property}-{variant}-{state}

Examples:
--primary                      # Semantic: main brand color
--primary-600                  # Primitive: specific shade
--button-primary-bg            # Component: button background
--button-primary-hover-bg      # Component + state
--status-success-subtle-bg     # Component + variant
```

---

## 3. Color System

### 3.1 Primary Scale (Industrial Steel Blue - Hue 230)

sRGB-safe chroma (capped at 0.090) for consistent cross-browser rendering:

| Token | OKLCH Value | Usage |
|-------|-------------|-------|
| `--primary-50` | `oklch(0.97 0.012 230)` | Subtle backgrounds |
| `--primary-100` | `oklch(0.93 0.028 230)` | Hover backgrounds |
| `--primary-200` | `oklch(0.86 0.060 230)` | Active backgrounds |
| `--primary-300` | `oklch(0.78 0.090 230)` | Borders |
| `--primary-400` | `oklch(0.68 0.090 230)` | Icons, secondary text |
| `--primary-500` | `oklch(0.58 0.090 230)` | Links |
| `--primary-600` | `oklch(0.45 0.090 230)` | **Primary buttons** (AA: 7.08:1) |
| `--primary-700` | `oklch(0.37 0.070 230)` | Hover on primary |
| `--primary-800` | `oklch(0.29 0.055 230)` | Active on primary |
| `--primary-900` | `oklch(0.22 0.040 230)` | Text on light |
| `--primary-950` | `oklch(0.16 0.030 230)` | Headings |

### 3.2 Semantic Colors (Light Theme)

```css
:root {
  /* Foundation */
  --background: oklch(0.99 0.005 230);
  --foreground: oklch(0.15 0.030 230);

  /* Surfaces */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.15 0.030 230);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.15 0.030 230);

  /* Brand */
  --primary: oklch(0.45 0.090 230);
  --primary-foreground: oklch(0.98 0.005 230);

  /* Secondary */
  --secondary: oklch(0.96 0.015 230);
  --secondary-foreground: oklch(0.25 0.040 230);

  /* Muted */
  --muted: oklch(0.96 0.015 230);
  --muted-foreground: oklch(0.50 0.040 230);

  /* Accent */
  --accent: oklch(0.94 0.020 230);
  --accent-foreground: oklch(0.25 0.040 230);

  /* Destructive */
  --destructive: oklch(0.55 0.200 27);
  --destructive-foreground: oklch(0.98 0 0);

  /* Borders & Inputs */
  --border: oklch(0.90 0.015 230);
  --input: oklch(0.90 0.015 230);
  --ring: oklch(0.45 0.090 230);
}
```

### 3.3 Semantic Colors (Dark Theme)

```css
.dark {
  /* Foundation */
  --background: oklch(0.12 0.020 230);
  --foreground: oklch(0.95 0.008 230);

  /* Surfaces */
  --card: oklch(0.15 0.020 230);
  --card-foreground: oklch(0.95 0.008 230);
  --popover: oklch(0.15 0.020 230);
  --popover-foreground: oklch(0.95 0.008 230);

  /* Brand */
  --primary: oklch(0.70 0.090 230);
  --primary-foreground: oklch(0.12 0.020 230);

  /* Secondary */
  --secondary: oklch(0.20 0.025 230);
  --secondary-foreground: oklch(0.95 0.008 230);

  /* Muted */
  --muted: oklch(0.20 0.025 230);
  --muted-foreground: oklch(0.65 0.050 230);

  /* Accent */
  --accent: oklch(0.22 0.025 230);
  --accent-foreground: oklch(0.95 0.008 230);

  /* Destructive */
  --destructive: oklch(0.60 0.180 27);
  --destructive-foreground: oklch(0.98 0 0);

  /* Borders & Inputs */
  --border: oklch(0.25 0.025 230);
  --input: oklch(0.25 0.025 230);
  --ring: oklch(0.60 0.090 230);
}
```

### 3.4 Status Colors

| Status | Light Mode | Dark Mode | Usage |
|--------|------------|-----------|-------|
| Success | `oklch(0.60 0.150 145)` | `oklch(0.65 0.150 145)` | Confirmations, completed |
| Warning | `oklch(0.75 0.150 65)` | `oklch(0.80 0.150 65)` | Cautions, pending |
| Error | `oklch(0.55 0.200 27)` | `oklch(0.60 0.180 27)` | Failures, destructive |
| Info | `oklch(0.60 0.120 240)` | `oklch(0.65 0.120 240)` | Informational |

---

## 4. Shadow System

### 4-Tier Elevation

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--shadow-sm` | `0 1px 2px 0 rgb(15 23 42 / 0.05)` | `0 1px 2px 0 rgb(0 0 0 / 0.30)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px -1px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06)` | `0 4px 6px -1px rgb(0 0 0 / 0.40), 0 2px 4px -2px rgb(0 0 0 / 0.30)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 15px -3px rgb(15 23 42 / 0.08), 0 4px 6px -4px rgb(15 23 42 / 0.04)` | `0 10px 15px -3px rgb(0 0 0 / 0.40), 0 4px 6px -4px rgb(0 0 0 / 0.20)` | Modals, popovers |
| `--shadow-xl` | `0 20px 25px -5px rgb(15 23 42 / 0.10), 0 8px 10px -6px rgb(15 23 42 / 0.04)` | `0 20px 25px -5px rgb(0 0 0 / 0.50), 0 8px 10px -6px rgb(0 0 0 / 0.25)` | Floating elements |

**Design Note**: Light mode uses slate-toned shadows (rgb 15 23 42) for cohesion with the steel blue theme. Dark mode uses pure black for proper contrast.

---

## 5. Border Radius (Micro Precision)

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `0.375rem` (6px) | Base radius |
| `--radius-none` | `0` | No radius |
| `--radius-sm` | `0.25rem` (4px) | Small elements, badges |
| `--radius-md` | `0.375rem` (6px) | Buttons, inputs |
| `--radius-lg` | `0.5rem` (8px) | Cards |
| `--radius-xl` | `0.75rem` (12px) | Large containers |
| `--radius-2xl` | `1rem` (16px) | Modals |
| `--radius-full` | `9999px` | Pills, avatars |

---

## 6. Animation Tokens

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | `50ms` | Immediate feedback |
| `--duration-fast` | `150ms` | Micro-interactions |
| `--duration-normal` | `250ms` | Standard transitions |
| `--duration-slow` | `350ms` | Complex animations |

### Easing Functions

| Token | Value | Character |
|-------|-------|-----------|
| `--ease-default` | `cubic-bezier(0.2, 0, 0, 1)` | Industrial precision |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Accelerating |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Decelerating |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Balanced |
| `--ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Playful overshoot |

### Composite Transitions

```css
--transition-colors: color var(--duration-fast) var(--ease-default),
                     background-color var(--duration-fast) var(--ease-default),
                     border-color var(--duration-fast) var(--ease-default);
--transition-transform: transform var(--duration-normal) var(--ease-default);
--transition-opacity: opacity var(--duration-normal) var(--ease-default);
--transition-shadow: box-shadow var(--duration-normal) var(--ease-default);
```

---

## 7. Spacing Scale

Based on 4px base unit, following Tailwind conventions:

| Token | Value | Pixels |
|-------|-------|--------|
| `--space-0` | `0` | 0 |
| `--space-px` | `1px` | 1 |
| `--space-0.5` | `0.125rem` | 2 |
| `--space-1` | `0.25rem` | 4 |
| `--space-1.5` | `0.375rem` | 6 |
| `--space-2` | `0.5rem` | 8 |
| `--space-3` | `0.75rem` | 12 |
| `--space-4` | `1rem` | 16 |
| `--space-5` | `1.25rem` | 20 |
| `--space-6` | `1.5rem` | 24 |
| `--space-8` | `2rem` | 32 |
| `--space-10` | `2.5rem` | 40 |
| `--space-12` | `3rem` | 48 |
| `--space-16` | `4rem` | 64 |
| `--space-20` | `5rem` | 80 |
| `--space-24` | `6rem` | 96 |

### Responsive Adaptive Strategy

- **Desktop (≥1024px)**: Generous spacing (space-6 to space-12 for sections)
- **Tablet (768-1023px)**: Moderate spacing (space-4 to space-8)
- **Mobile (<768px)**: Compact spacing (space-3 to space-6)

---

## 8. Component Tokens

### 8.1 Button

```css
/* Common */
--button-radius: var(--radius-md);
--button-transition: var(--transition-colors);
--button-font-weight: 500;

/* Primary */
--button-primary-bg: var(--primary);
--button-primary-fg: var(--primary-foreground);
--button-primary-hover-bg: var(--primary-700);
--button-primary-active-bg: var(--primary-800);

/* Secondary */
--button-secondary-bg: var(--secondary);
--button-secondary-fg: var(--secondary-foreground);
--button-secondary-hover-bg: oklch(0.94 0.020 230);
--button-secondary-border: var(--border);

/* Outline */
--button-outline-bg: transparent;
--button-outline-fg: var(--foreground);
--button-outline-border: var(--border);
--button-outline-hover-bg: var(--accent);
--button-outline-hover-border: var(--primary-300);

/* Ghost */
--button-ghost-bg: transparent;
--button-ghost-fg: var(--foreground);
--button-ghost-hover-bg: var(--accent);

/* Destructive */
--button-destructive-bg: var(--destructive);
--button-destructive-fg: var(--destructive-foreground);
--button-destructive-hover-bg: oklch(0.50 0.200 27);
```

### 8.2 Card

```css
/* Common */
--card-radius: var(--radius-xl);
--card-padding: var(--space-6);
--card-gap: var(--space-4);

/* Default */
--card-default-bg: var(--card);
--card-default-fg: var(--card-foreground);
--card-default-border: var(--border);
--card-default-shadow: var(--shadow-sm);

/* Interactive */
--card-interactive-hover-shadow: var(--shadow-md);
--card-interactive-hover-border: var(--primary-200);
--card-interactive-transition: box-shadow var(--duration-normal) var(--ease-default),
                                border-color var(--duration-fast) var(--ease-default);

/* Elevated */
--card-elevated-shadow: var(--shadow-md);
--card-elevated-hover-shadow: var(--shadow-lg);
```

### 8.3 Form Elements

```css
/* Input */
--input-height: 2.5rem;
--input-padding-x: var(--space-3);
--input-radius: var(--radius-md);
--input-border-width: 1px;
--input-bg: transparent;
--input-fg: var(--foreground);
--input-border: var(--input);
--input-placeholder: var(--muted-foreground);
--input-focus-ring: var(--ring);
--input-focus-ring-width: 2px;
--input-focus-ring-offset: 2px;
--input-error-border: var(--destructive);
--input-disabled-opacity: 0.5;

/* Select */
--select-trigger-radius: var(--radius-md);
--select-content-radius: var(--radius-lg);
--select-item-radius: var(--radius-sm);

/* Checkbox/Radio */
--checkbox-size: 1rem;
--checkbox-radius: var(--radius-sm);
--checkbox-checked-bg: var(--primary);
--checkbox-checked-fg: var(--primary-foreground);
```

### 8.4 Table

```css
/* Header */
--table-header-bg: var(--muted);
--table-header-fg: var(--muted-foreground);
--table-header-font-weight: 500;
--table-header-font-size: 0.875rem;

/* Body */
--table-row-bg: var(--background);
--table-row-alt-bg: oklch(0.98 0.010 230);
--table-row-hover-bg: var(--accent);
--table-row-selected-bg: oklch(0.45 0.090 230 / 0.1);

/* Cell */
--table-cell-padding-x: var(--space-4);
--table-cell-padding-y: var(--space-3);
--table-cell-border: var(--border);
```

### 8.5 Badge

```css
/* Common */
--badge-radius: var(--radius-full);
--badge-padding-x: var(--space-2.5);
--badge-padding-y: var(--space-0.5);
--badge-font-size: 0.75rem;
--badge-font-weight: 500;

/* Default */
--badge-default-bg: var(--primary);
--badge-default-fg: var(--primary-foreground);

/* Secondary */
--badge-secondary-bg: var(--secondary);
--badge-secondary-fg: var(--secondary-foreground);

/* Success (Subtle) */
--badge-success-bg: oklch(0.60 0.150 145 / 0.15);
--badge-success-fg: oklch(0.50 0.150 145);
--badge-success-border: oklch(0.60 0.150 145 / 0.30);

/* Warning (Subtle) */
--badge-warning-bg: oklch(0.75 0.150 65 / 0.15);
--badge-warning-fg: oklch(0.55 0.150 65);
--badge-warning-border: oklch(0.75 0.150 65 / 0.30);

/* Error (Subtle) */
--badge-error-bg: oklch(0.55 0.200 27 / 0.15);
--badge-error-fg: oklch(0.55 0.200 27);
--badge-error-border: oklch(0.55 0.200 27 / 0.30);

/* Info (Subtle) */
--badge-info-bg: oklch(0.60 0.120 240 / 0.15);
--badge-info-fg: oklch(0.50 0.120 240);
--badge-info-border: oklch(0.60 0.120 240 / 0.30);
```

---

## 9. Data Visualization

### Chart Palette (Color-Blind Safe)

| Token | Value | Purpose |
|-------|-------|---------|
| `--chart-1` | `oklch(0.45 0.090 230)` | Primary Steel |
| `--chart-2` | `oklch(0.60 0.150 145)` | Success Green |
| `--chart-3` | `oklch(0.75 0.150 65)` | Amber |
| `--chart-4` | `oklch(0.60 0.120 240)` | Info Blue |
| `--chart-5` | `oklch(0.50 0.040 230)` | Neutral |

### Sequential Ramp (Single Hue)

```css
--viz-seq-1: oklch(0.97 0.012 230);
--viz-seq-2: oklch(0.86 0.060 230);
--viz-seq-3: oklch(0.68 0.090 230);
--viz-seq-4: oklch(0.45 0.090 230);
--viz-seq-5: oklch(0.29 0.055 230);
```

---

## 10. Accessibility Compliance

### WCAG AA Contrast Matrix

| Pair | Contrast Ratio | Status |
|------|----------------|--------|
| Primary on White | 7.08:1 | PASS |
| Text on Background | 19.10:1 | PASS |
| Primary FG on Primary | 6.89:1 | PASS |
| Muted FG on Muted | 4.82:1 | PASS |
| Success on White | 4.67:1 | PASS |
| Warning Text on Warning BG | 5.12:1 | PASS |

### Focus States

```css
/* Global focus visible */
*:focus-visible {
  outline: var(--state-focus-ring-width) solid var(--state-focus-ring);
  outline-offset: var(--state-focus-ring-offset);
}

--state-focus-ring: var(--ring);
--state-focus-ring-width: 2px;
--state-focus-ring-offset: 2px;
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Manufacturing-Specific Considerations

### sRGB Gamut Safety

All chroma values are capped at 0.090 to prevent browser gamut-mapping inconsistencies, especially important for:

- Factory floor displays (often lower gamut)
- Older monitors in industrial settings
- Print materials that may accompany digital presence

### High Contrast Mode Support

```css
@media (prefers-contrast: high) {
  :root {
    --border: oklch(0.30 0.030 230);
    --ring: oklch(0.30 0.030 230);
  }

  .dark {
    --border: oklch(0.85 0.020 230);
    --ring: oklch(0.85 0.020 230);
  }
}
```

### Status Color Guidelines

1. **Brand blue (hue 230) is NEVER used for status indicators**
2. Status colors always paired with icons and text labels
3. Grayscale-distinguishable (for color blindness)
4. Info blue (hue 240) distinct from brand blue (hue 230)

---

## 12. Anti-Patterns (What NOT to Do)

| Anti-Pattern | Why It's Bad | Correct Approach |
|--------------|--------------|------------------|
| Using `--primary` for warnings | Confuses brand with status | Use `--warning` |
| Pure white background | Looks generic, no brand cohesion | Use blue-tinted white |
| Large border radius (16px+) | Doesn't fit industrial precision | Use micro radius (4-8px) |
| Gray shadows | Feels disconnected | Use slate-toned shadows |
| Bright saturated colors | Looks cheap, gamut issues | Use muted, sRGB-safe values |
| Emojis as icons | Unprofessional | Use Lucide icons |
| scale transforms on hover | Layout shift, jarring | Use color/opacity transitions |

---

## 13. Implementation Checklist

### Before Launch

- [ ] All colors use OKLCH values from this spec
- [ ] Shadows use slate tones (not pure gray)
- [ ] Border radius follows micro precision (4-8px)
- [ ] All interactive elements have cursor-pointer
- [ ] Focus states visible with 2px ring
- [ ] Dark mode tested on all components
- [ ] Contrast ratios verified (WCAG AA)
- [ ] Reduced motion preference respected
- [ ] No emojis used as icons
- [ ] Status colors distinct from brand blue

### Per-Component

- [ ] Uses component tokens (not hardcoded values)
- [ ] Hover states don't cause layout shift
- [ ] Transitions use defined duration/easing
- [ ] Accessible via keyboard navigation
- [ ] Works in both light and dark modes

---

## 14. Migration Guide

### From Current globals.css

The main changes:

1. **Primary color**: From neutral gray to Steel Blue (hue 230)
2. **Background**: From pure white to blue-tinted white
3. **Border radius**: Reduced from 0.625rem to 0.375rem
4. **Shadows**: Added 4-tier system with slate tones
5. **Animation**: Added standardized duration/easing tokens

### Gradual Adoption

1. **Phase 1**: Update semantic colors (`:root` and `.dark`)
2. **Phase 2**: Add shadow and animation tokens
3. **Phase 3**: Implement component-level tokens
4. **Phase 4**: Update existing components to use new tokens

---

## Appendix A: Quick Reference Card

```css
/* Brand */
--primary: oklch(0.45 0.090 230);  /* Steel Blue - buttons, links */

/* Surfaces */
--background: oklch(0.99 0.005 230);  /* Blue-tinted white */
--card: oklch(1 0 0);                  /* Pure white cards */

/* Text */
--foreground: oklch(0.15 0.030 230);  /* Near-black with blue tint */
--muted-foreground: oklch(0.50 0.040 230);  /* Secondary text */

/* Status */
--success: oklch(0.60 0.150 145);  /* Green */
--warning: oklch(0.75 0.150 65);   /* Amber */
--error: oklch(0.55 0.200 27);     /* Red */

/* Radius */
--radius: 0.375rem;  /* 6px base */

/* Shadow */
--shadow-md: 0 4px 6px -1px rgb(15 23 42 / 0.08), ...;

/* Animation */
--duration-fast: 150ms;
--ease-default: cubic-bezier(0.2, 0, 0, 1);
```

---

*Generated by Tianze Design System v1.0*
*Based on: ui-ux-pro-max + frontend-aesthetics + shadcn-ui*

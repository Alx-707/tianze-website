# Change: Apply Manufacturing-First Design Token System v2.1

## Why

The current design system uses generic neutral grays with no chromatic identity, making the website indistinguishable from standard shadcn/ui templates. For a B2B manufacturing enterprise (Tianze Pipe Industry), the visual identity must communicate:

- **Industrial Authority**: Weight, substance, precision
- **Brand Recognition**: Distinctive color palette that avoids "AI slop" aesthetics
- **Manufacturing DNA**: Visual language rooted in industrial safety standards

The v2.1 Manufacturing-First token system has been designed and validated in tweakcn, featuring:
- **Industrial Amber** as Primary (CTA/action color)
- **Deep Graphite** as Accent (structural/text emphasis)
- **IBM Plex Sans** typography (industrial heritage)
- **Sharp radius** (0-4px, CNC-machined precision)
- **Mechanical animations** (no bounce/spring)

## What Changes

### 1. Color System Overhaul

| Token | Current (Generic) | New (Manufacturing v2.1) |
|-------|-------------------|--------------------------|
| `--primary` | `oklch(0.205 0 0)` neutral gray | `oklch(0.75 0.160 75)` Industrial Amber |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.15 0.010 250)` Deep Graphite |
| `--accent` | `oklch(0.97 0 0)` neutral | `oklch(0.20 0.015 250)` Deep Graphite |
| `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.98 0.005 250)` Light |
| `--background` | `oklch(1 0 0)` pure white | `oklch(0.98 0.005 250)` Precision White |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.15 0.010 250)` Deep Graphite |
| `--ring` | `oklch(0.708 0 0)` gray | `oklch(0.75 0.160 75)` Amber focus ring |

### 2. Typography System

| Token | Current | New |
|-------|---------|-----|
| `--font-sans` | Geist Sans | IBM Plex Sans |
| `--font-mono` | System mono stack | IBM Plex Mono |

### 3. Border Radius

| Token | Current | New |
|-------|---------|-----|
| `--radius` | `0.625rem` (10px) | `4px` |
| Button/Input radius | ~6-8px | `2px` (sharp) |
| Card radius | ~10px | `4px` (base) |

### 4. Animation Tokens (New)

```css
--duration-instant: 50ms;
--duration-fast: 100ms;
--duration-normal: 150ms;
--duration-slow: 250ms;
--ease-snap: cubic-bezier(0, 0, 0.2, 1);
--ease-mechanical: cubic-bezier(0.4, 0, 0.2, 1);
```

### 5. Shadow System (New)

Graphite-toned shadows with 5-tier scale (xs/sm/md/lg/xl).

### 6. Manufacturing Visual Elements (New)

- `.precision-grid` — Engineering grid background
- `.technical-callout` — Amber left-border callout
- `.spec-box` — Blueprint-style specification box

## Impact

- **Affected files**:
  - `src/app/globals.css` — Primary token definitions
  - `src/app/[locale]/layout-fonts.ts` — Font loading + CSS variables (IBM Plex Sans)
  - `src/app/layout.tsx` — Document shell applies font class names
  - Tailwind theme tokens (`@theme inline` in `src/app/globals.css`; `tailwind.config.ts` only if required for shadow/easing mappings)
  - Component files using hardcoded colors/radius

- **Breaking changes**:
  - Visual appearance changes significantly
  - Components using `primary` variant will change from gray to amber
  - Radius reduction may affect existing layouts

- **Accessibility**: Target WCAG AA; re-validate after implementation (the documented contrast table is a starting point, not a substitute for app-wide verification)

## Design Documentation

- Specification: `docs/design-system/TIANZE-MANUFACTURING-TOKENS.md`
- CSS Reference: `docs/design-system/manufacturing-tokens.css`

## Verification

```bash
# Verify token application
rg "oklch\(0\.75 0\.160 75\)" src/app/globals.css

# Verify font wiring (repo uses next/font CSS variables)
rg -- "--font-" src/app/[locale]/layout-fonts.ts src/app/globals.css

# Verify docs and implementation stay aligned
rg "IBM Plex" docs/design-system/TIANZE-MANUFACTURING-TOKENS.md

# Run visual regression (if available)
pnpm test:visual || pnpm test:e2e

# Lighthouse check for performance impact
pnpm perf:lighthouse
```

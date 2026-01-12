# Tianze Design Token System v2.1

> **Manufacturing-First Design** | Industrial Amber (Primary) + Deep Graphite (Accent) | Precision Aesthetics

---

## Design Philosophy

### Brand Essence

Tianze is a **precision manufacturing** enterprise. The design system must communicate:

- **Weight & Substance**: Physical products, not abstract software
- **Precision & Reliability**: Engineering excellence, not startup hustle
- **Functional Beauty**: Form follows function, no decorative excess

### Visual DNA: "Precision Made Visible"

| Element | Manufacturing Interpretation |
|---------|------------------------------|
| Color | Industrial amber (CTA/primary) + Deep graphite (accent/text) |
| Typography | IBM Plex (industrial heritage) + geometric precision |
| Radius | Sharp edges (CNC-machined precision) |
| Motion | Mechanical accuracy (no bounce/spring) |
| Texture | Precision grid (engineering drawings) |

### Why This Direction Stands Out

| Generic B2B | Tianze Manufacturing |
|-------------|----------------------|
| Tech blue (#3B82F6) | Industrial amber primary (safety signage color) |
| Geist Sans / Inter | IBM Plex Sans (industrial DNA) |
| 8-12px radius | 0-4px (machined edges) |
| Blue/purple accents | Deep graphite accent (refined steel) |
| Flat white background | Precision grid texture |

---

## 1. Color System

### 1.1 Design Rationale

**Industrial Amber (Primary)**: The universal color of safety signage, heavy machinery, and quality markings. Hue 75 with high chroma for unmistakable call-to-action. Used for primary buttons and key interactive elements.

**Deep Graphite (Accent)**: Not black, not gray — the color of refined steel under workshop lighting. Hue 250 (cool undertone) with minimal chroma creates sophistication. Used for text, secondary emphasis, and structural elements.

**Precision White (Background)**: Slightly cool to complement graphite, like technical paper or factory floor epoxy.

### 1.2 Primitive Scale — Graphite (Hue 250)

```css
:root {
  /* Graphite Scale — The color of precision */
  --graphite-50:  oklch(0.98 0.005 250);  /* Near white */
  --graphite-100: oklch(0.94 0.010 250);  /* Subtle tint */
  --graphite-200: oklch(0.88 0.015 250);  /* Light gray */
  --graphite-300: oklch(0.75 0.015 250);  /* Medium-light */
  --graphite-400: oklch(0.60 0.015 250);  /* Medium */
  --graphite-500: oklch(0.45 0.015 250);  /* Medium-dark */
  --graphite-600: oklch(0.35 0.015 250);  /* Dark */
  --graphite-700: oklch(0.28 0.015 250);  /* Darker */
  --graphite-800: oklch(0.20 0.015 250);  /* Near black */
  --graphite-900: oklch(0.15 0.010 250);  /* Deep */
  --graphite-950: oklch(0.10 0.008 250);  /* Deepest */
}
```

### 1.3 Primitive Scale — Amber (Hue 75)

```css
:root {
  /* Amber Scale — Industrial safety & action */
  --amber-50:  oklch(0.98 0.020 75);
  --amber-100: oklch(0.95 0.050 75);
  --amber-200: oklch(0.90 0.100 75);
  --amber-300: oklch(0.85 0.140 75);
  --amber-400: oklch(0.80 0.160 75);
  --amber-500: oklch(0.75 0.160 75);  /* Primary accent */
  --amber-600: oklch(0.65 0.150 75);
  --amber-700: oklch(0.55 0.130 75);
  --amber-800: oklch(0.45 0.100 75);
  --amber-900: oklch(0.35 0.070 75);
  --amber-950: oklch(0.25 0.040 75);
}
```

### 1.4 Semantic Tokens — Light Theme

```css
:root {
  /* ==================== FOUNDATION ==================== */
  --background: oklch(0.98 0.005 250);      /* Precision white */
  --foreground: oklch(0.15 0.010 250);      /* Deep graphite */

  /* ==================== SURFACES ==================== */
  --card: oklch(1 0 0);                      /* Pure white cards */
  --card-foreground: oklch(0.15 0.010 250);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.15 0.010 250);

  /* ==================== BRAND PRIMARY ==================== */
  /* Industrial Amber — unmistakable CTA action */
  --primary: oklch(0.75 0.160 75);
  --primary-foreground: oklch(0.15 0.010 250);

  /* ==================== ACCENT ==================== */
  /* Deep Graphite — secondary emphasis, structural */
  --accent: oklch(0.20 0.015 250);
  --accent-foreground: oklch(0.98 0.005 250);

  /* ==================== SECONDARY ==================== */
  /* Steel gray — supporting elements */
  --secondary: oklch(0.94 0.010 250);
  --secondary-foreground: oklch(0.25 0.015 250);

  /* ==================== MUTED ==================== */
  --muted: oklch(0.94 0.010 250);
  --muted-foreground: oklch(0.45 0.015 250);

  /* ==================== DESTRUCTIVE ==================== */
  /* Industrial red — clear warning */
  --destructive: oklch(0.55 0.200 25);
  --destructive-foreground: oklch(0.98 0 0);

  /* ==================== BORDERS & INPUTS ==================== */
  --border: oklch(0.88 0.015 250);
  --input: oklch(0.88 0.015 250);
  --ring: oklch(0.75 0.160 75);  /* Amber focus ring */

  /* ==================== STATUS COLORS ==================== */
  /* Distinct from brand colors, functional only */
  --success: oklch(0.65 0.180 145);        /* Industrial green */
  --success-foreground: oklch(0.98 0 0);
  --warning: oklch(0.80 0.160 75);         /* Same hue family as accent */
  --warning-foreground: oklch(0.15 0.010 250);
  --error: oklch(0.55 0.200 25);           /* Industrial red */
  --error-foreground: oklch(0.98 0 0);
  --info: oklch(0.60 0.100 250);           /* Cool graphite-blue */
  --info-foreground: oklch(0.98 0 0);

  /* ==================== CHARTS ==================== */
  --chart-1: oklch(0.75 0.160 75);   /* Amber (primary) */
  --chart-2: oklch(0.20 0.015 250);  /* Graphite */
  --chart-3: oklch(0.65 0.180 145);  /* Green */
  --chart-4: oklch(0.60 0.100 250);  /* Steel blue */
  --chart-5: oklch(0.55 0.150 25);   /* Copper red */

  /* ==================== SELECTION ==================== */
  --selection-background: oklch(0.75 0.160 75 / 25%);
  --selection-foreground: oklch(0.15 0.010 250);

  /* ==================== SIDEBAR ==================== */
  --sidebar: oklch(0.15 0.010 250);          /* Dark graphite sidebar */
  --sidebar-foreground: oklch(0.94 0.010 250);
  --sidebar-primary: oklch(0.75 0.160 75);   /* Amber highlights */
  --sidebar-primary-foreground: oklch(0.15 0.010 250);
  --sidebar-accent: oklch(0.25 0.015 250);
  --sidebar-accent-foreground: oklch(0.94 0.010 250);
  --sidebar-border: oklch(0.28 0.015 250);
  --sidebar-ring: oklch(0.75 0.160 75);
}
```

### 1.5 Semantic Tokens — Dark Theme

```css
.dark {
  /* ==================== FOUNDATION ==================== */
  --background: oklch(0.12 0.010 250);      /* Deep workshop */
  --foreground: oklch(0.94 0.010 250);      /* Light graphite */

  /* ==================== SURFACES ==================== */
  --card: oklch(0.16 0.010 250);
  --card-foreground: oklch(0.94 0.010 250);
  --popover: oklch(0.16 0.010 250);
  --popover-foreground: oklch(0.94 0.010 250);

  /* ==================== BRAND PRIMARY ==================== */
  /* Industrial Amber — brighter for dark mode */
  --primary: oklch(0.80 0.160 75);
  --primary-foreground: oklch(0.12 0.010 250);

  /* ==================== ACCENT ==================== */
  /* Light Graphite — secondary emphasis on dark */
  --accent: oklch(0.94 0.010 250);
  --accent-foreground: oklch(0.12 0.010 250);

  /* ==================== SECONDARY ==================== */
  --secondary: oklch(0.22 0.015 250);
  --secondary-foreground: oklch(0.94 0.010 250);

  /* ==================== MUTED ==================== */
  --muted: oklch(0.22 0.015 250);
  --muted-foreground: oklch(0.60 0.015 250);

  /* ==================== DESTRUCTIVE ==================== */
  --destructive: oklch(0.60 0.180 25);
  --destructive-foreground: oklch(0.98 0 0);

  /* ==================== BORDERS & INPUTS ==================== */
  --border: oklch(0.28 0.015 250);
  --input: oklch(0.28 0.015 250);
  --ring: oklch(0.80 0.160 75);

  /* ==================== STATUS COLORS ==================== */
  --success: oklch(0.70 0.180 145);
  --success-foreground: oklch(0.12 0.010 250);
  --warning: oklch(0.85 0.160 75);
  --warning-foreground: oklch(0.12 0.010 250);
  --error: oklch(0.60 0.180 25);
  --error-foreground: oklch(0.98 0 0);
  --info: oklch(0.65 0.100 250);
  --info-foreground: oklch(0.12 0.010 250);

  /* ==================== CHARTS ==================== */
  --chart-1: oklch(0.80 0.160 75);   /* Amber (primary) */
  --chart-2: oklch(0.94 0.010 250);  /* Light graphite */
  --chart-3: oklch(0.70 0.180 145);
  --chart-4: oklch(0.65 0.100 250);
  --chart-5: oklch(0.60 0.150 25);

  /* ==================== SELECTION ==================== */
  --selection-background: oklch(0.80 0.160 75 / 30%);
  --selection-foreground: oklch(0.94 0.010 250);

  /* ==================== SIDEBAR ==================== */
  --sidebar: oklch(0.10 0.008 250);
  --sidebar-foreground: oklch(0.94 0.010 250);
  --sidebar-primary: oklch(0.80 0.160 75);
  --sidebar-primary-foreground: oklch(0.12 0.010 250);
  --sidebar-accent: oklch(0.18 0.012 250);
  --sidebar-accent-foreground: oklch(0.94 0.010 250);
  --sidebar-border: oklch(0.22 0.015 250);
  --sidebar-ring: oklch(0.80 0.160 75);
}
```

---

## 2. Typography System

### 2.1 Font Family: IBM Plex Sans

**Why IBM Plex over Geist**:

| Geist Sans | IBM Plex Sans |
|------------|---------------|
| Vercel ecosystem default | Industrial heritage (IBM engineering) |
| AI/template signal | Professional differentiation |
| Limited CJK | Excellent CJK support |
| Trendy (2024) | Timeless (designed 2017) |

### 2.2 Font Stack

```css
:root {
  /* Latin: IBM Plex Sans */
  --font-sans: "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI",
               Roboto, "Helvetica Neue", Arial, sans-serif;

  /* Monospace: IBM Plex Mono (for specs, data, code) */
  --font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, "SF Mono",
               Menlo, Consolas, "Liberation Mono", monospace;

  /* Chinese: Source Han Sans SC (同源字体) */
  --font-chinese: "Source Han Sans SC", "Noto Sans SC", "PingFang SC",
                  "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}
```

### 2.3 Type Scale

```css
:root {
  /* Size Scale — Based on 16px base */
  --text-xs: 0.75rem;     /* 12px — Fine print, labels */
  --text-sm: 0.875rem;    /* 14px — Secondary text, captions */
  --text-base: 1rem;      /* 16px — Body text */
  --text-lg: 1.125rem;    /* 18px — Lead paragraphs */
  --text-xl: 1.25rem;     /* 20px — Section headers */
  --text-2xl: 1.5rem;     /* 24px — Card titles */
  --text-3xl: 1.875rem;   /* 30px — Page headers */
  --text-4xl: 2.25rem;    /* 36px — Hero subheadings */
  --text-5xl: 3rem;       /* 48px — Hero headings */
  --text-6xl: 3.75rem;    /* 60px — Display */

  /* Weight Scale */
  --font-light: 300;
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Height */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}
```

### 2.4 Typography Patterns

```css
/* Headlines — Bold, tight tracking */
.headline {
  font-family: var(--font-sans);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
}

/* Body — Regular, comfortable reading */
.body {
  font-family: var(--font-sans);
  font-weight: var(--font-regular);
  letter-spacing: var(--tracking-normal);
  line-height: var(--leading-relaxed);
}

/* Data/Specs — Monospace, precise */
.spec-text {
  font-family: var(--font-mono);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  font-variant-numeric: tabular-nums;
}

/* Labels — Small, uppercase, wide tracking */
.label {
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}
```

---

## 3. Border Radius System

### 3.1 Design Rationale

**Manufacturing truth**: CNC-machined edges are precise, not rounded. The radius system reflects this:

| Radius | Value | Usage | Metaphor |
|--------|-------|-------|----------|
| `--radius-none` | 0px | Tables, code blocks, technical data | Sheet metal, machined parts |
| `--radius-sharp` | 2px | Buttons, inputs, small interactive | Precision tooling |
| `--radius-base` | 4px | Cards, containers | Structural components |
| `--radius-soft` | 6px | Modals, larger containers | Assembly housings |
| `--radius-round` | 9999px | Pills, avatars, tags | Fasteners, bearings |

### 3.2 Token Definition

```css
:root {
  --radius: 4px;                     /* Base radius */
  --radius-none: 0;                  /* Technical precision */
  --radius-sharp: 2px;               /* Minimal softening */
  --radius-base: 4px;                /* Standard containers */
  --radius-soft: 6px;                /* Larger surfaces */
  --radius-round: 9999px;            /* Circular elements */

  /* Semantic aliases */
  --radius-button: var(--radius-sharp);
  --radius-input: var(--radius-sharp);
  --radius-card: var(--radius-base);
  --radius-modal: var(--radius-soft);
  --radius-badge: var(--radius-round);
}
```

---

## 4. Shadow System

### 4.1 Design Rationale

**Industrial environments use strong ambient light** — shadows are minimal but defined. The system uses deep graphite tone for cohesion.

### 4.2 Token Definition

```css
:root {
  /* Graphite-toned shadows */
  --shadow-color: 250 15% 10%;  /* HSL for graphite */

  --shadow-xs: 0 1px 2px hsl(var(--shadow-color) / 0.04);
  --shadow-sm: 0 1px 3px hsl(var(--shadow-color) / 0.06),
               0 1px 2px hsl(var(--shadow-color) / 0.04);
  --shadow-md: 0 4px 6px hsl(var(--shadow-color) / 0.07),
               0 2px 4px hsl(var(--shadow-color) / 0.04);
  --shadow-lg: 0 10px 15px hsl(var(--shadow-color) / 0.08),
               0 4px 6px hsl(var(--shadow-color) / 0.03);
  --shadow-xl: 0 20px 25px hsl(var(--shadow-color) / 0.10),
               0 8px 10px hsl(var(--shadow-color) / 0.04);

  /* Inset shadow for pressed/machined effect */
  --shadow-inset: inset 0 1px 2px hsl(var(--shadow-color) / 0.06);

  /* Amber glow for focus/active CTA */
  --shadow-accent: 0 0 0 3px oklch(0.75 0.160 75 / 0.25);
}

.dark {
  --shadow-color: 250 10% 5%;

  --shadow-xs: 0 1px 2px hsl(var(--shadow-color) / 0.20);
  --shadow-sm: 0 1px 3px hsl(var(--shadow-color) / 0.30),
               0 1px 2px hsl(var(--shadow-color) / 0.20);
  --shadow-md: 0 4px 6px hsl(var(--shadow-color) / 0.35),
               0 2px 4px hsl(var(--shadow-color) / 0.20);
  --shadow-lg: 0 10px 15px hsl(var(--shadow-color) / 0.40),
               0 4px 6px hsl(var(--shadow-color) / 0.15);
  --shadow-xl: 0 20px 25px hsl(var(--shadow-color) / 0.45),
               0 8px 10px hsl(var(--shadow-color) / 0.20);
}
```

---

## 5. Animation System

### 5.1 Design Rationale

**Industrial motion = mechanical precision**:
- No bounce or spring effects (that's playful, not industrial)
- Linear or sharp easing (like CNC machines)
- Fast response times (efficient, not leisurely)
- Progress indicators move linearly (conveyor belt metaphor)

### 5.2 Token Definition

```css
:root {
  /* Duration Scale — Efficient, not leisurely */
  --duration-instant: 50ms;
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-slow: 250ms;
  --duration-slower: 350ms;

  /* Easing Functions — Mechanical precision */
  --ease-linear: linear;
  --ease-snap: cubic-bezier(0, 0, 0.2, 1);        /* Quick start, smooth end */
  --ease-precise: cubic-bezier(0.25, 0, 0.25, 1); /* Symmetric, controlled */
  --ease-mechanical: cubic-bezier(0.4, 0, 0.2, 1);/* Standard but crisp */

  /* NO spring/bounce effects */

  /* Composite Transitions */
  --transition-colors: color var(--duration-fast) var(--ease-snap),
                       background-color var(--duration-fast) var(--ease-snap),
                       border-color var(--duration-fast) var(--ease-snap);
  --transition-opacity: opacity var(--duration-normal) var(--ease-precise);
  --transition-transform: transform var(--duration-normal) var(--ease-mechanical);
  --transition-shadow: box-shadow var(--duration-normal) var(--ease-precise);

  /* Progress/Loading — Linear like conveyor belt */
  --transition-progress: width var(--duration-slower) var(--ease-linear);
}
```

---

## 6. Manufacturing Visual Elements

### 6.1 Precision Grid Background

```css
/* Subtle engineering grid — like technical drawings */
.precision-grid {
  background-image:
    linear-gradient(oklch(0.88 0.015 250) 1px, transparent 1px),
    linear-gradient(90deg, oklch(0.88 0.015 250) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: -1px -1px;
}

/* Dark mode variant */
.dark .precision-grid {
  background-image:
    linear-gradient(oklch(0.22 0.015 250) 1px, transparent 1px),
    linear-gradient(90deg, oklch(0.22 0.015 250) 1px, transparent 1px);
}

/* Fine grid for data-dense areas */
.precision-grid-fine {
  background-size: 12px 12px;
}
```

### 6.2 Technical Border Accent

```css
/* Left border accent — like engineering callouts */
.technical-callout {
  border-left: 3px solid var(--accent);
  padding-left: 1rem;
  background: linear-gradient(
    90deg,
    oklch(0.75 0.160 75 / 0.08) 0%,
    transparent 100%
  );
}

/* Blueprint-style specification box */
.spec-box {
  border: 1px solid var(--border);
  border-left: 3px solid var(--primary);
  background: var(--card);
  font-family: var(--font-mono);
}
```

### 6.3 Measurement Scale Pattern

```css
/* Ruler/measurement marks — for precision feel */
.measurement-scale {
  background-image: repeating-linear-gradient(
    90deg,
    var(--border) 0px,
    var(--border) 1px,
    transparent 1px,
    transparent 10px
  );
  background-size: 100px 8px;
  background-repeat: repeat-x;
  background-position: bottom;
}
```

---

## 7. Component Tokens

### 7.1 Button

```css
:root {
  /* Button Foundation */
  --button-radius: var(--radius-sharp);
  --button-font-weight: var(--font-semibold);
  --button-transition: var(--transition-colors);

  /* Primary — Industrial Amber (CTA) */
  --button-primary-bg: var(--primary);
  --button-primary-fg: var(--primary-foreground);
  --button-primary-hover-bg: oklch(0.70 0.160 75);
  --button-primary-active-bg: oklch(0.65 0.150 75);

  /* Accent — Deep Graphite (secondary action) */
  --button-accent-bg: var(--accent);
  --button-accent-fg: var(--accent-foreground);
  --button-accent-hover-bg: oklch(0.25 0.015 250);
  --button-accent-active-bg: oklch(0.15 0.010 250);

  /* Secondary */
  --button-secondary-bg: var(--secondary);
  --button-secondary-fg: var(--secondary-foreground);
  --button-secondary-border: var(--border);
  --button-secondary-hover-bg: oklch(0.90 0.010 250);

  /* Outline */
  --button-outline-bg: transparent;
  --button-outline-fg: var(--foreground);
  --button-outline-border: var(--border);
  --button-outline-hover-bg: var(--secondary);
  --button-outline-hover-border: var(--primary);

  /* Ghost */
  --button-ghost-bg: transparent;
  --button-ghost-fg: var(--foreground);
  --button-ghost-hover-bg: var(--secondary);

  /* Destructive */
  --button-destructive-bg: var(--destructive);
  --button-destructive-fg: var(--destructive-foreground);
  --button-destructive-hover-bg: oklch(0.50 0.200 25);
}
```

### 7.2 Card

```css
:root {
  --card-radius: var(--radius-base);
  --card-padding: 1.5rem;
  --card-gap: 1rem;

  /* Default */
  --card-default-bg: var(--card);
  --card-default-border: var(--border);
  --card-default-shadow: var(--shadow-xs);

  /* Interactive — Amber accent on hover */
  --card-interactive-hover-border: var(--accent);
  --card-interactive-hover-shadow: var(--shadow-sm);

  /* Elevated */
  --card-elevated-shadow: var(--shadow-md);

  /* Spec Card — Technical data display */
  --card-spec-bg: var(--card);
  --card-spec-border-left: 3px solid var(--primary);
  --card-spec-font: var(--font-mono);
}
```

### 7.3 Form Elements

```css
:root {
  --input-height: 2.5rem;
  --input-padding-x: 0.75rem;
  --input-radius: var(--radius-sharp);
  --input-border-width: 1px;

  --input-bg: var(--background);
  --input-fg: var(--foreground);
  --input-border: var(--input);
  --input-placeholder: var(--muted-foreground);

  /* Focus — Amber ring */
  --input-focus-ring: var(--ring);
  --input-focus-ring-width: 2px;
  --input-focus-ring-offset: 2px;

  /* Error */
  --input-error-border: var(--error);
  --input-error-ring: oklch(0.55 0.200 25 / 0.25);

  /* Disabled */
  --input-disabled-opacity: 0.5;
}
```

### 7.4 Table

```css
:root {
  /* Table uses sharp radius (technical data) */
  --table-radius: var(--radius-none);

  /* Header — Subtle graphite background */
  --table-header-bg: oklch(0.94 0.010 250);
  --table-header-fg: var(--foreground);
  --table-header-font-weight: var(--font-semibold);
  --table-header-font-size: var(--text-sm);

  /* Body */
  --table-row-bg: var(--background);
  --table-row-alt-bg: oklch(0.96 0.008 250);
  --table-row-hover-bg: oklch(0.75 0.160 75 / 0.08);  /* Amber tint */
  --table-row-selected-bg: oklch(0.75 0.160 75 / 0.15);

  /* Cell */
  --table-cell-padding-x: 1rem;
  --table-cell-padding-y: 0.75rem;
  --table-cell-border: var(--border);
}
```

### 7.5 Badge

```css
:root {
  --badge-radius: var(--radius-round);
  --badge-padding-x: 0.625rem;
  --badge-padding-y: 0.125rem;
  --badge-font-size: var(--text-xs);
  --badge-font-weight: var(--font-semibold);

  /* Default — Graphite */
  --badge-default-bg: var(--primary);
  --badge-default-fg: var(--primary-foreground);

  /* Secondary */
  --badge-secondary-bg: var(--secondary);
  --badge-secondary-fg: var(--secondary-foreground);

  /* Accent — Amber */
  --badge-accent-bg: var(--accent);
  --badge-accent-fg: var(--accent-foreground);

  /* Status variants — Subtle backgrounds */
  --badge-success-bg: oklch(0.65 0.180 145 / 0.15);
  --badge-success-fg: oklch(0.50 0.180 145);
  --badge-success-border: oklch(0.65 0.180 145 / 0.30);

  --badge-warning-bg: oklch(0.80 0.160 75 / 0.15);
  --badge-warning-fg: oklch(0.55 0.160 75);
  --badge-warning-border: oklch(0.80 0.160 75 / 0.30);

  --badge-error-bg: oklch(0.55 0.200 25 / 0.15);
  --badge-error-fg: oklch(0.55 0.200 25);
  --badge-error-border: oklch(0.55 0.200 25 / 0.30);

  --badge-info-bg: oklch(0.60 0.100 250 / 0.15);
  --badge-info-fg: oklch(0.45 0.100 250);
  --badge-info-border: oklch(0.60 0.100 250 / 0.30);
}
```

---

## 8. Accessibility Compliance

### 8.1 Contrast Verification (WCAG AA)

| Pair | Foreground | Background | Ratio | Status |
|------|------------|------------|-------|--------|
| Body text | `oklch(0.15 0.010 250)` | `oklch(0.98 0.005 250)` | 16.2:1 | ✅ AAA |
| Primary button | `oklch(0.15 0.010 250)` | `oklch(0.75 0.160 75)` | 7.3:1 | ✅ AAA |
| Accent button | `oklch(0.98 0.005 250)` | `oklch(0.20 0.015 250)` | 12.8:1 | ✅ AAA |
| Muted text | `oklch(0.45 0.015 250)` | `oklch(0.98 0.005 250)` | 5.1:1 | ✅ AA |
| Link on white | `oklch(0.20 0.015 250)` | `oklch(0.98 0.005 250)` | 12.8:1 | ✅ AAA |

### 8.2 Focus States

```css
/* Amber focus ring — distinct, unmistakable */
*:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --border: oklch(0.40 0.015 250);
    --ring: oklch(0.65 0.160 75);
  }

  *:focus-visible {
    outline-width: 3px;
  }
}
```

### 8.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0.01ms;
    --duration-fast: 0.01ms;
    --duration-normal: 0.01ms;
    --duration-slow: 0.01ms;
    --duration-slower: 0.01ms;
  }

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

## 9. Anti-Patterns Checklist

### What This System Avoids

| ❌ Anti-Pattern | ✅ This System |
|-----------------|----------------|
| Tech blue (#3B82F6, hue 210-230) | Deep graphite (hue 250, near-achromatic) |
| Geist Sans / Inter | IBM Plex Sans (industrial heritage) |
| 8-12px generic radius | 0-4px precision (CNC-machined edges) |
| Blue/purple accents | Industrial amber (safety signage color) |
| Pure white background | Precision white with cool undertone |
| Bounce/spring animations | Mechanical, linear motion |
| Emoji icons | Lucide icons only |
| Gradient buttons | Solid, substantial fills |
| Glassmorphism | Crisp, defined edges |
| Scale on hover | Color/opacity transitions only |

### Manufacturing DNA Checklist

- [x] Color references physical materials (graphite, steel, amber)
- [x] Typography has industrial heritage (IBM Plex)
- [x] Radius reflects machining (sharp, precise)
- [x] Motion feels mechanical (no playfulness)
- [x] Visual elements reference engineering (grid, callouts)
- [x] Accent color from safety/industrial standard (amber)
- [x] Dark sidebar (control panel aesthetic)

---

## 10. Quick Reference

```css
/* Brand */
--primary: oklch(0.75 0.160 75);    /* Industrial Amber (CTA) */
--accent: oklch(0.20 0.015 250);    /* Deep Graphite (secondary) */

/* Surfaces */
--background: oklch(0.98 0.005 250); /* Precision White */
--card: oklch(1 0 0);                /* Pure White */

/* Text */
--foreground: oklch(0.15 0.010 250); /* Deep Graphite */
--muted-foreground: oklch(0.45 0.015 250);

/* Status */
--success: oklch(0.65 0.180 145);    /* Industrial Green */
--warning: oklch(0.80 0.160 75);     /* Amber Warning */
--error: oklch(0.55 0.200 25);       /* Industrial Red */

/* Radius */
--radius-sharp: 2px;                 /* Buttons, inputs */
--radius-base: 4px;                  /* Cards */

/* Animation */
--duration-fast: 100ms;
--ease-snap: cubic-bezier(0, 0, 0.2, 1);

/* Font */
--font-sans: "IBM Plex Sans", ...;
--font-mono: "IBM Plex Mono", ...;
```

---

*Tianze Design System v2.1 — Manufacturing-First*
*Industrial Amber (Primary) + Deep Graphite (Accent) | Precision Aesthetics*

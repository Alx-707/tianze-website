# Page Visual Design Direction — Tianze Website

> Ring 3, Task 2.5 | Status: Confirmed by owner (2026-03-30)
> Inputs: Design system (TIANZE-DESIGN-TOKENS.md), Task 2.2 (copy strategy), Task 2.3 (conversion paths)
> Note: This is the strategic DIRECTION for visual design. Actual page designs are produced via /dwf workflow.

## Design System Recap (Existing, Confirmed)

- **Primary**: Steel Blue #004d9e
- **Personality**: Precise. Substantial. Trustworthy.
- **Aesthetic**: Industrial Steel Blue + Vercel craft
- **Radius**: 8px base, buttons 6px
- **Typography**: Figtree (modern, clean) + JetBrains Mono (specs/data)
- **References**: Swagelok (B2B structure), Linear/Vercel (digital craft)
- **Anti-references**: Alibaba storefront, generic SaaS, oversaturated colors

This direction is confirmed and does not change. What follows is how to APPLY it across the new page structure.

## Visual Design Principles for This Site

### 1. Engineering Precision as Visual Language

The site's visual system should feel like an engineering document that happens to be beautiful.

| Element | Treatment |
|---------|----------|
| Product specs | JetBrains Mono, table format, precise numbers prominent |
| Tolerance data | Large type, highlighted — this IS the hero content on product pages |
| Standards tables | Clean grid, comparison format, checkmarks for compliance |
| Machine evolution | Timeline or comparison cards with delta metrics ("+40% faster") |

### 2. Show, Don't Decorate

Every visual element must communicate manufacturing capability or product quality (Design Principle #1 from CLAUDE.md).

| Do | Don't |
|----|-------|
| Factory floor photos showing real machines | Stock photos of generic factories |
| Product photos with dimension annotations | Bare product photos with no context |
| Process diagrams showing manufacturing steps | Decorative abstract graphics |
| Standards comparison tables | Marketing copy in fancy layouts |

### 3. Information-Dense, Not Content-Heavy

B2B buyers scan, not read. Pages should be visually scannable with data-rich sections.

| Pattern | Use for |
|---------|---------|
| Spec tables with JetBrains Mono | Product detail pages — hero content |
| Side-by-side comparison | Standards compliance, hot-bend vs injection, machine generations |
| Icon + number + label grid | Trust bar, factory stats, about page metrics |
| Card grid with product images | Product overview pages, business line routing |

## Per-Page Visual Direction

### Homepage

```
Layout: Full-width hero → trust bar → 3-line routing cards → company story → final CTA

Hero:
  - Left: Headline + subhead + dual CTA
  - Right: Split image — bending machine + finished product side by side
  - Treatment: Machine image in context (factory floor), product isolated

Trust bar:
  - Horizontal strip: ISO icon + "20+ Countries" + "98% On-Time" + "60% Repeat"
  - JetBrains Mono for numbers, small label text below

3-line routing:
  - Three cards, equal weight
  - Each: hero product image + line name + 1-line description + "Explore" link
  - Hover: subtle elevation change (Vercel-style shadow-border)

Company story:
  - Split layout: text left, factory photo right
  - GridFrame decorative grid (existing pattern)

Final CTA:
  - Full-width, bg-primary, white text
  - "Test Before You Commit" + sample offer
```

### Product Pages (PVC by Market)

```
Layout: Hero banner → standards table → product grid → certification → spec download + sample CTA

Hero:
  - Market-specific banner: "[Standard] PVC Conduit Fittings"
  - Subtitle with certification status (Option A wording)

Standards table (HERO CONTENT):
  - Full-width comparison: Standard requirement vs Tianze spec
  - JetBrains Mono for all numbers
  - Green checkmarks for met, amber for "in progress"
  - This table IS the most important visual element on the page

Product grid:
  - Card per product type with annotated product photo
  - Annotations: dimensions, material, standard mark
  - Each card links to spec detail or triggers sample request

Bottom CTA:
  - Dual: "Download Spec Sheet" (secondary) + "Request Free Samples" (primary)
```

### Equipment Page (Bending Machines)

```
Layout: Hero → machine specs → evolution timeline → self-validation → support → CTA

Hero:
  - Full-width machine photo (in-context, factory floor, showing scale)
  - Headline: "PVC Bending Machines — Built by the Factory That Uses Them"

Machine specs (once available):
  - Large spec card: diameter range, production rate, power
  - JetBrains Mono, prominent numbers

Evolution timeline:
  - Horizontal timeline or comparison cards
  - Gen 1 → Gen 2 → Gen 3 with delta metrics
  - Visual: machine photos per generation if available

Self-validation section:
  - Split: machine photo left, pipe product grid right
  - "Every fitting in our catalog proves our machines work"

CTA:
  - "Request Detailed Specifications" + "Book Technical Consultation"
```

### About Page

```
Layout: Hero → numbers grid → story → certifications → factory gallery → visit CTA

Numbers grid:
  - 4-6 large metrics: factory size, team, countries, repeat rate, years
  - JetBrains Mono for numbers, Figtree for labels
  - Industrial grid layout

Certifications:
  - Certificate images/badges in a row
  - Below: timeline for in-progress certs
  - Option A wording text

Factory gallery:
  - Responsive grid of factory photos
  - Authentic, color-graded to brand palette
```

### Contact Page

```
Layout: Split — form left, info right

Left: Inquiry form (detailed variant)
Right:
  - Email address (prominent)
  - Phone number
  - Factory address with map
  - "Response within 24 hours" commitment
  - Office hours
```

## Visual Benchmarks for /dwf Execution

When executing page designs via /dwf workflow, reference these sites:

| Benchmark | What to reference | What to avoid |
|-----------|-------------------|--------------|
| **Swagelok** (swagelok.com) | Product page structure, spec table format, industrial authority feel | Their outdated navigation patterns |
| **Linear** (linear.app) | Shadow-border technique, spacing precision, dark-on-light clarity | SaaS-specific interaction patterns |
| **Vercel** (vercel.com) | Grid systems, card hover states, typography rhythm | Consumer-tech visual language |
| **Georg Fischer** (georgfischer.com) | B2B industrial product categorization, multilingual handling | Heavy European corporate styling |

## Case Study Analysis Timing

Per Phase 2 execution plan: detailed benchmark analysis of competitor sites should happen BEFORE /dwf execution starts. Specifically analyze:
- Swagelok product page layout and spec table design
- Ledes/Ctube conversion path UX and trust signal placement
- How top industrial sites handle certification display

This calibrates the visual execution against real-world quality standards.

---

**Owner confirmed (2026-03-30):**
1. "Engineering document that happens to be beautiful" — confirmed
2. Annotated product photos with rich information overlay — confirmed
3. Homepage split image (machine + product side by side) — confirmed

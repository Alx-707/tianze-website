# Homepage Component Inventory

> Prototype → Component mapping for development
> Source: `docs/design/homepage/prototype/v6-swagelok-vercel/index.html`

## Layout Components

### 1. GridSystem

Wraps entire page content. Provides the Vercel-style decorative grid frame.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | — | Page sections |

**Renders:** Outer 1px border frame via `::before`, crosshair marks at anchor points.
**Grid config:** See `docs/S/grid.md`

### 2. GridSection

Each page section rendered as a CSS Grid with optional guide cells.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | number | 3 | Grid columns |
| rows | number | 1 | Grid rows |
| guides | GuideConfig[] | [] | Which cells show borders |
| as | 'section' \| 'div' | 'section' | HTML element |
| borderTop | boolean | false | Section top divider |
| borderBottom | boolean | false | Section bottom divider |
| className | string | — | Additional classes |

### 3. GridBlock

Content block within a GridSection. Applies 1px margin for guide peek-through.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| column | [start, span] | [1, 1] | Grid column placement |
| row | [start, span] | [1, 1] | Grid row placement |
| padding | string | — | Cell padding |
| children | ReactNode | — | Content |

### 4. Container

Standard width wrapper (shared with non-grid sections).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | 'default' \| 'narrow' \| 'wide' | 'default' | 1080px / 860px / 1280px |

---

## Navigation

### 5. SiteNav

Sticky nav bar with blur backdrop.

| Prop | Type | Description |
|------|------|-------------|
| logo | ReactNode | Logo/brand element |
| links | NavLink[] | Navigation items |
| cta | { label: string, href: string } | Primary CTA button |

**States:** Desktop (full links), Mobile (links hidden, hamburger TBD)
**CSS:** `position: sticky`, `backdrop-filter: blur(12px)`, `border-bottom: 1px solid var(--border)`

**i18n keys:**
| Key | EN | ZH |
|-----|----|----|
| `nav.products` | Products | 产品 |
| `nav.resources` | Resources | 资源 |
| `nav.industries` | Industries | 行业 |
| `nav.quality` | Quality | 质量 |
| `nav.about` | About | 关于 |
| `nav.cta` | Request Quote | 获取报价 |

---

## Hero Section

### 6. HeroSection

Two-column layout: copy left, visual grid right.

**Grid config:** `columns: 12, rows: 8` (dense grid with fade-out guides)

| Sub-component | Description |
|---------------|-------------|
| HeroEyebrow | Icon dot + uppercase label |
| HeroTitle | H1, 44px/800 weight |
| HeroSubtitle | 18px secondary text |
| HeroCTA | Button group (primary + secondary) |
| HeroProof | Metrics bar with border-top divider |
| HeroVisual | 2×2 image grid |

**i18n keys:**
| Key | EN |
|-----|-----|
| `hero.eyebrow` | ISO 9001 Certified Manufacturer |
| `hero.title` | PVC Conduit Bends & Fittings. Factory Direct. |
| `hero.subtitle` | From the manufacturer that designs and builds its own bending machines... |
| `hero.cta.primary` | Get a Quote |
| `hero.cta.secondary` | View Product Catalog |
| `hero.proof.countries` | 20+ |
| `hero.proof.countries.label` | Countries |
| `hero.proof.range` | 16-168 |
| `hero.proof.range.label` | mm Range |
| `hero.proof.production` | 24/7 |
| `hero.proof.production.label` | Production |
| `hero.proof.est` | 2006 |
| `hero.proof.est.label` | Est. |

**Assets needed:**
- Factory floor / bending machine photo (main, 2:1 aspect)
- Product photo: conduit bends (1:1)
- Product photo: bell end fittings (1:1)

---

## Content Sections

### 7. ChainSection (Full-Chain Control)

5-step horizontal process strip + 3 stat cards.

| Sub-component | Props |
|---------------|-------|
| ChainStep | `num: string, title: string, description: string` |
| ChainStat | `icon: ReactNode, text: string` |

**Responsive:** 5→3→1 columns

**i18n namespace:** `chain.*`

### 8. ProductsSection

Section header with CTA + 2×2 product card grid.

| Sub-component | Props |
|---------------|-------|
| ProductCard | `tag: string, title: string, specs: string[], standard: string, link: { label: string, href: string }` |

**Interaction:** Border turns `--primary` + 1px ring on hover
**Responsive:** 2→1 columns

**i18n namespace:** `products.*`
**Products:** Standard Bends, Bell End Joints, Flared Fittings, Custom/OEM

### 9. ResourcesSection (Swagelok-inspired)

4-column resource bar with icon + title + description + arrow link.

| Sub-component | Props |
|---------------|-------|
| ResourceItem | `icon: ReactNode, title: string, description: string, linkLabel: string, href: string` |

**Interaction:** Background turns `--primary-50` on hover
**Responsive:** 4→2→1 columns

**Resources:** Product Catalog, Technical Specs, CAD Downloads, Certifications
**i18n namespace:** `resources.*`

**Assets needed:**
- PDF catalog (or link)
- Datasheet files
- CAD file packages (DWG, STEP, IGES)
- Certification scans (ISO 9001, UL651, AS/NZS 2053, ASTM)

### 10. SampleCTA

Horizontal banner: copy left, button right.

**i18n keys:**
| Key | EN |
|-----|-----|
| `sample.title` | Test Before You Commit. |
| `sample.description` | Verify the quality yourself. Free samples ship within 3 business days... |
| `sample.cta` | Request Free Samples |

### 11. ScenariosSection

3-column card grid with image, body, and testimonial quote.

| Sub-component | Props |
|---------------|-------|
| ScenarioCard | `image: string, title: string, description: string, quote: { text: string, author: string }` |

**Responsive:** 3→1 columns

**Scenarios:** Underground Pre-Burial, Commercial & Data Center, Municipal Infrastructure
**i18n namespace:** `scenarios.*`

**Assets needed:**
- Photo: underground conduit installation
- Photo: commercial building electrical
- Photo: municipal infrastructure

### 12. QualitySection

5-column commitments strip + cert badges + logo wall.

| Sub-component | Props |
|---------------|-------|
| Commitment | `icon: ReactNode, title: string, description: string` |
| CertBadge | `label: string` |
| LogoWall | `logos: { src: string, alt: string }[]` |

**Responsive:** 5→3→1 columns

**Commitments:** 48-Hour Drawings, Batch Traceability, Export-Ready Packaging, Dedicated Contact, Flexible MOQ
**i18n namespace:** `quality.*`

**Assets needed:**
- Customer/partner logos for LogoWall

### 13. FinalCTA

Blue background (`--primary`) full-width CTA with two buttons.

**i18n keys:**
| Key | EN |
|-----|-----|
| `finalCta.title` | Ready to Get Started? |
| `finalCta.description` | Get a quote, request samples, or book a technical consultation... |
| `finalCta.primary` | Get Factory-Direct Quote |
| `finalCta.secondary` | Book Technical Consultation |
| `finalCta.trust` | 24-hour response · Factory direct · 20+ countries served |

---

## Footer

### 14. SiteFooter

4-column grid on dark background.

| Column | Content |
|--------|---------|
| About (1.5fr) | Company description |
| Products (1fr) | 4 product links |
| Resources (1fr) | 4 resource links |
| Contact (1.2fr) | 4 contact links |
| Bottom bar | Copyright + location |

**Responsive:** 4→2 columns (mobile)
**i18n namespace:** `footer.*`

---

## Shared UI Components

### 15. Button

| Variant | Usage |
|---------|-------|
| `primary` | Main CTAs |
| `secondary` | Alternative actions |
| `on-dark` | On blue/dark backgrounds |
| `ghost` | Subtle on dark backgrounds |

All variants: `font-size: 14px`, `font-weight: 600`, `padding: 10px 20px`, `border-radius: 6px`, `transition: 150ms`

### 16. SectionHead

Reusable section header with title + optional subtitle.

| Prop | Type | Description |
|------|------|-------------|
| title | string | H2 heading |
| subtitle | string? | Description paragraph |
| layout | 'stack' \| 'row' | Stack (default) or side-by-side with CTA |
| action | ReactNode? | Optional right-side button |

---

## Asset Requirements Summary

| Category | Items | Format |
|----------|-------|--------|
| Product photos | 4 (bends, bell end, flared, custom) | WebP, 800×600 min |
| Factory photo | 1 (bending machine / floor) | WebP, 1200×600 min |
| Scenario photos | 3 (underground, commercial, municipal) | WebP, 800×500 min |
| Certification scans | 4 (ISO, UL, AS/NZS, ASTM) | PDF |
| Customer logos | 6–12 | SVG preferred |
| Icons | Chain steps (5), Commitments (5), Resources (4) | Inline SVG |

## Page Section Order

```
SiteNav
HeroSection          → grid: 12×8 (dense)
ChainSection         → grid: 3×1
ProductsSection      → grid: 3×2
ResourcesSection     → grid: 3×1
SampleCTA            → grid: 3×1
ScenariosSection     → grid: 3×1
QualitySection       → grid: 3×1
FinalCTA             → grid: 3×1
SiteFooter           → grid: 3×3
```

# Product Pages Redesign — Design Spec

> Date: 2026-03-23
> Status: Draft
> Scope: Product catalog pages overhaul — North America market as template

## 1. Context

Tianze (天泽管业) is a PVC conduit fittings manufacturer exporting to 100+ countries. The website's product pages currently exist as a skeleton: routing works, but pages contain no real content — the L2 family pages show only "Specifications coming soon."

The product catalog was restructured (2026-03-20) to classify by market compliance standard (UL/ASTM, AS/NZS, NOM, IEC) rather than by product type. This redesign implements that structure with real content.

## 2. Goals

1. **Buyer can select by specs** — Professional buyers (distributors, importers) arrive to verify that Tianze carries the exact size/angle/schedule they need. The spec table is the core deliverable.
2. **Trust through substance** — Certifications, material quality, and factory capability are communicated through content, not marketing fluff.
3. **Inquiry as natural outcome** — CTA exists but is not aggressive. Buyers who find the right specs will reach out on their own.
4. **Template for replication** — North America is built first; other markets reuse the same page structure with different data.

### Buyer behavior priority

```
1. Select by specs (primary)    → Spec matrix table
2. Build trust (secondary)      → Certifications, material, factory
3. Inquire (natural outcome)    → Contact CTA, not pushed
```

## 3. Page Hierarchy — Two Levels

The original three-level hierarchy (products → market → family) is collapsed to two levels. Rationale: buyers procure by standard, not by individual product family. A North American distributor wants to see all UL 651 products on one page — bends, couplings, and pipes together.

| Level | Route | Responsibility |
|-------|-------|----------------|
| **L0 Product Overview** | `/products` | Market standard selection + equipment/pneumatic entry |
| **L1 Market Page** | `/products/[market]` | All product families for that standard: images + spec tables + trust signals + CTA |

### Removed

- `/products/[market]/[family]` route — deleted. Family-level content is now sections within the L1 market page, navigable via anchor links (`#sweeps`, `#couplings`, `#conduit-pipes`).

### Out of scope (route reserved)

- `/capabilities/bending-machines` — Equipment showcase page (links to `/contact` as placeholder)
- `/oem-custom-manufacturing` — OEM service page (links to `/contact` as placeholder)

## 4. L1 Market Page — Core Page Design

The most important page. Example: `/products/north-america` (UL / ASTM Series).

### 4.1 Page structure

```
Breadcrumb: Products > UL / ASTM Series

Page Header
  - Standard tag (mono): UL 651 / ASTM D1785
  - Title: UL / ASTM Series
  - Description: 2-3 sentences about the standard and its market
  - Sticky family nav: [Sweeps & Elbows] [Couplings] [Pipes]

Family Section #1: Conduit Sweeps & Elbows  (#sweeps)
  - Image area (left) + Overview (right)
    - Product gallery with placeholder images
    - Family name + short description
    - 3 key highlights (icon + one-liner)
  - Spec matrix table
    - Grouped by Schedule (40, 80)
    - Columns: Size | Angle | Wall Thickness | End Type | Radius

Family Section #2: Couplings  (#couplings)
  - Same structure, different columns:
    Size | Type | Wall Thickness | End Type

Family Section #3: Conduit Pipes  (#conduit-pipes)
  - Same structure, different columns:
    Size | Length | Wall Thickness | Schedule

Technical Properties (shared across market)
  - 2x2 grid: Material | Surface | Protection | Temperature Range

Certifications & Compliance (shared)
  - Badge row: UL 651 | ASTM D1785 | ISO 9001:2015

Trade Information (shared)
  - MOQ | Lead Time | Port | Packaging

CTA
  - "Need UL / ASTM conduit fittings?"
  - Request a Quote button → /contact
```

### 4.2 Responsive behavior

- **Desktop**: Image + overview in side-by-side layout; spec table full width
- **Mobile**: Vertical stack (image above text); spec table horizontally scrollable
- **Sticky nav**: Family nav bar sticks below header on scroll

### 4.3 Cross-market differences handled by data

| Dimension | North America | Australia/NZ | Mexico | Europe |
|-----------|--------------|--------------|--------|--------|
| Size system | inch | mm | mm | mm |
| Grouping | Schedule (40/80) | Duty (Medium/Heavy) | Standard | Standard |
| Families | 3 | 4 (includes Bellmouths) | 3 | 3 |
| Table columns | Vary per family | Vary per family | Vary per family | Vary per family |

Same page template, different data. No market-specific code.

## 5. L0 Product Overview Page

`/products` — Entry point to the product catalog.

### 5.1 Page structure

```
Breadcrumb: Products

Page Header
  - Title + description (including factory capability one-liner)

Section: "By Market Standard" (PVC Conduit Fittings)
  - Card grid (2 cols desktop, 1 col mobile)
  - Each card: placeholder image + standard tag + market label + description + family count
  - 4 cards: UL/ASTM, AS/NZS, NOM, IEC

Section: "Specialty & Equipment"
  - 2 cards side by side:
    - PETG Pneumatic Tubes → /products/pneumatic-tube-systems
    - Bending Machines → /capabilities/bending-machines (placeholder: /contact)
```

### 5.2 Design notes

- PVC section is visually dominant (core business)
- Specialty section is secondary, slightly smaller cards
- Market cards upgraded from text-only to include placeholder images and standard tags

## 6. Homepage Product Section Update

The current homepage product section references old URLs (`/products/machines`, `/products/pvc-conduits`). Updated to match new catalog structure.

### 6.1 New card content (2x2 grid, same layout)

| Card | Tag | Key specs | Link |
|------|-----|-----------|------|
| PVC Conduit Fittings | 4 Market Standards | UL/ASTM, AS/NZS, NOM, IEC; Bends, couplings, pipes; 16-168mm | `/products` |
| PETG Pneumatic Tubes | Hospital Logistics | 110mm, 160mm OD; Clear, durable; R650-R1000 | `/products/pneumatic-tube-systems` |
| Bending Machines | Core Capability | Full/Semi-auto; DN25-DN160mm; 150-200 pcs/hr | `/capabilities/bending-machines` (placeholder: `/contact`) |
| OEM & Custom Mfg | Service | Your specs, our production; Prototype to mass production | `/contact` |

### 6.2 Implementation

Reuse existing `ProductsSection` component structure. Update translation keys in `messages/[locale]/critical.json` to reflect new content and links.

## 7. Data Architecture

### 7.1 Spec data location

```
src/constants/
  product-catalog.ts            (existing — market + family definitions)
  product-standards.ts          (existing — standard IDs)
  product-specs/
    types.ts                    (new — TypeScript interfaces)
    north-america.ts            (new — North America spec data)
    australia-new-zealand.ts    (future)
    mexico.ts                   (future)
    europe.ts                   (future)
    pneumatic-tube-systems.ts   (future)
```

### 7.2 Data structure

```typescript
interface MarketSpecs {
  technical: Record<string, string>;          // Shared material/physical properties
  certifications: string[];                    // Standard names
  trade: {
    moq: string;
    leadTime: string;
    port: string;
    packaging: string;
  };
  families: FamilySpecs[];
}

interface FamilySpecs {
  slug: string;                                // Matches product-catalog.ts family slug
  images: string[];                            // Placeholder paths
  highlights: string[];                        // 3 key selling points (i18n keys)
  specGroups: SpecGroup[];
}

interface SpecGroup {
  groupLabel: string;                          // e.g. "Schedule 40"
  columns: string[];                           // e.g. ["Size", "Angle", "Wall", "End Type"]
  rows: string[][];                            // Actual data values
}
```

### 7.3 Data source strategy (progressive)

```
Phase 1 (now):  TypeScript constants — updated via Claude Code
Phase 2 (later): JSON/YAML files — editable without TypeScript knowledge
Phase 3 (later): Notion CMS — GUI editing with auto-sync
```

Each phase only changes the data source; page components and types remain unchanged.

### 7.4 Spec data content

North America specs are populated from:
- Existing project data (`products.yaml`, archived MDX files, `proof-points.md`)
- Industry standard references (ASTM D1785, UL 651) for reasonable placeholders
- Owner to verify and replace placeholder values post-launch

### 7.5 Legacy data system

`src/lib/content/products-source.ts` and `products.ts` (MDX-based product system) are **not used** by the new product pages. Content is archived in `content/_archive/products/`. These files are retained but not consumed; cleanup is a separate future task.

## 8. i18n Strategy

| Content type | Translation approach |
|-------------|---------------------|
| Page titles, descriptions, buttons | Translation keys in `messages/[locale]/critical.json` |
| Family names, highlights | Translation keys (referenced from `product-catalog.ts`) |
| Spec table headers (Size, Angle...) | Translation keys |
| Spec data values (1/2", 90°...) | **Not translated** — technical data is universal |
| Certification names (UL 651...) | **Not translated** — proper nouns |
| Trade info labels (MOQ, Lead Time...) | Translation keys |

Minimal translation workload: only page framework copy needs en/zh versions. Spec data is language-agnostic.

## 9. Component Plan

### 9.1 Reused (existing)

| Component | Modification needed |
|-----------|-------------------|
| `CatalogBreadcrumb` | Remove family-level support |
| `MarketSeriesCard` | Add placeholder image, visual upgrade |
| `ProductGallery` | None — use as-is for family image area |
| `ProductSpecs` | None — use for technical properties |
| `ProductCertifications` | None — use for certification badges |
| `ProductTradeInfo` | None — use for trade information |
| `ProductsSection` (homepage) | Update translation keys and card content |

### 9.2 New components

| Component | Purpose |
|-----------|---------|
| `SpecTable` | Renders a spec matrix with grouped rows, responsive horizontal scroll |
| `FamilySection` | Container for one product family: image area + overview + spec table |
| `StickyFamilyNav` | Sticky anchor navigation for jumping between family sections |

### 9.3 Removed

| Component/File | Reason |
|----------------|--------|
| `src/app/[locale]/products/[market]/[family]/page.tsx` | Route eliminated |
| `FamilyCard` | No longer needed as navigation element (families are page sections now) |

### 9.4 Retained but unused

| Component | Reason to keep |
|-----------|---------------|
| `ProductCard` | May be used for search results or cross-sell in future |
| `ProductGrid` | May be used for search results in future |
| `InquiryDrawer` | May be used for inline inquiry in future |
| `ProductInquiryForm` | May be used for inline inquiry in future |

## 10. Deliverables

### In scope (this iteration)

1. L0 product overview page — redesigned with sections and visual cards
2. L1 North America market page — full implementation (images + spec tables + trust + CTA)
3. Homepage product section — updated to match new catalog structure
4. Data architecture — `product-specs/types.ts` + `north-america.ts`
5. New components — `SpecTable`, `FamilySection`, `StickyFamilyNav`
6. Full i18n — all user-facing text via translation keys
7. Remove `[family]` route and `FamilyCard` component
8. Update `CatalogBreadcrumb` — remove family level
9. Upgrade `MarketSeriesCard` — add placeholder images

### Out of scope

- Other 4 markets' spec data (structure ready, data filled later)
- `/capabilities/bending-machines` page (link placeholder only)
- `/oem-custom-manufacturing` page (link placeholder only)
- Real product photography (placeholder images used)
- Legacy MDX product system cleanup

## 11. Design Principles Applied

1. **Substance over decoration** — Spec tables are the hero, not images
2. **Precision communicates quality** — Consistent grid, clean data tables, monospace for specs
3. **Engineering as identity** — Table-driven layout borrowed from engineering data sheets
4. **Restraint signals confidence** — One CTA at the bottom, no popups, no floating buttons
5. **Function drives form** — Every element serves spec lookup or trust building

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Placeholder spec data is inaccurate | Buyer confusion | Mark as "typical values" + owner verifies before launch |
| Page too long on mobile (3 families + shared sections) | Scroll fatigue | Sticky nav + collapsible spec groups |
| SEO loss from removing family pages | Fewer indexable URLs | Anchor links + structured data per family section |
| Placeholder images look unprofessional | Trust reduction | Use clean SVG illustrations, not stock photos |

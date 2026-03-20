# Product Catalog Architecture Plan

> **SUPERSEDED**: This document's routing strategy (Section 4) claimed `[slug]` and `[market]` could coexist via `generateStaticParams`. This is incorrect — Next.js App Router does not allow two dynamic segments at the same directory level. The authoritative plan is `docs/plans/2026-03-20-product-catalog-plan/_index.md` (v2), which requires deleting `[slug]` before creating `[market]`. All other sections (config structure, components, types) remain valid reference material.

> Date: 2026-03-20
> Scope: Route skeleton + basic usable pages (title, breadcrumb, product list placeholder)
> Status: Superseded by v2 plan (routing section invalid)

---

## 1. Configuration Constant Structure

### File: `src/constants/product-catalog.ts`

The catalog is the single source of truth for all market/family combinations. Every route, breadcrumb, and navigation element derives from this config. No hardcoded slugs anywhere else.

```typescript
import type { ProductStandardId } from "@/constants/product-standards";

// --- Size System ---

type SizeSystem = "inch" | "mm";

// --- Market Definition ---

interface MarketDefinition {
  /** URL slug: /products/{slug}/ */
  slug: string;
  /** Navigation label, e.g. "UL / ASTM Series" */
  label: string;
  /** The compliance standard name for SEO/technical contexts */
  standardLabel: string;
  /** Short description for the market landing page */
  description: string;
  /** Measurement system used in this market */
  sizeSystem: SizeSystem;
  /** Which product-standards.ts IDs apply to this market */
  standardIds: ProductStandardId[];
  /** Ordered list of product family slugs available in this market */
  familySlugs: string[];
}

// --- Product Family Definition ---

interface ProductFamilyDefinition {
  /** URL slug: /products/{market}/{slug}/ — per-market since terminology differs */
  slug: string;
  /** Display label, e.g. "Conduit Sweeps & Elbows" */
  label: string;
  /** Short description for the family page */
  description: string;
  /** Which market this family belongs to (back-reference for validation) */
  marketSlug: string;
}

// --- Catalog Config (top-level export) ---

interface CatalogConfig {
  markets: readonly MarketDefinition[];
  families: readonly ProductFamilyDefinition[];
}

export const PRODUCT_CATALOG: CatalogConfig = {
  markets: [
    {
      slug: "north-america",
      label: "UL / ASTM Series",
      standardLabel: "UL 651 / ASTM D1785",
      description: "PVC conduit fittings for the North American market...",
      sizeSystem: "inch",
      standardIds: ["ul651_sch40", "ul651_sch80", "astm"],
      familySlugs: ["conduit-sweeps-elbows", "couplings", "conduit-pipes"],
    },
    {
      slug: "australia-new-zealand",
      label: "AS/NZS 2053 Series",
      standardLabel: "AS/NZS 2053",
      description: "PVC conduit fittings for the Australian and NZ market...",
      sizeSystem: "mm",
      standardIds: ["as_nzs"],
      familySlugs: ["conduit-bends", "bellmouths", "couplings", "conduit-pipes"],
    },
    {
      slug: "mexico",
      label: "NOM Series",
      standardLabel: "NOM-001-SEDE",
      description: "PVC conduit fittings for the Mexican market...",
      sizeSystem: "mm",
      standardIds: [],  // NOM not yet in product-standards.ts — add when needed
      familySlugs: ["conduit-bends", "couplings", "conduit-pipes"],
    },
    {
      slug: "europe",
      label: "IEC Series",
      standardLabel: "IEC 61386",
      description: "PVC conduit fittings for the European market...",
      sizeSystem: "mm",
      standardIds: [],  // IEC not yet in product-standards.ts — add when needed
      familySlugs: ["conduit-bends", "couplings", "conduit-pipes"],
    },
    {
      slug: "pneumatic-tube-systems",
      label: "PETG Pneumatic Tubes",
      standardLabel: "PETG",
      description: "PETG pneumatic tube systems for hospital logistics...",
      sizeSystem: "mm",
      standardIds: [],
      familySlugs: ["petg-tubes", "fittings"],
    },
  ],

  families: [
    // --- North America ---
    { slug: "conduit-sweeps-elbows", label: "Conduit Sweeps & Elbows", description: "...", marketSlug: "north-america" },
    { slug: "couplings",            label: "Couplings",                description: "...", marketSlug: "north-america" },
    { slug: "conduit-pipes",        label: "Conduit Pipes",            description: "...", marketSlug: "north-america" },

    // --- Australia / NZ ---
    { slug: "conduit-bends", label: "Conduit Bends",  description: "...", marketSlug: "australia-new-zealand" },
    { slug: "bellmouths",    label: "Bellmouths",      description: "...", marketSlug: "australia-new-zealand" },
    { slug: "couplings",     label: "Couplings",       description: "...", marketSlug: "australia-new-zealand" },
    { slug: "conduit-pipes", label: "Conduit Pipes",   description: "...", marketSlug: "australia-new-zealand" },

    // --- Mexico ---
    { slug: "conduit-bends", label: "Conduit Bends",  description: "...", marketSlug: "mexico" },
    { slug: "couplings",     label: "Couplings",       description: "...", marketSlug: "mexico" },
    { slug: "conduit-pipes", label: "Conduit Pipes",   description: "...", marketSlug: "mexico" },

    // --- Europe ---
    { slug: "conduit-bends", label: "Conduit Bends",  description: "...", marketSlug: "europe" },
    { slug: "couplings",     label: "Couplings",       description: "...", marketSlug: "europe" },
    { slug: "conduit-pipes", label: "Conduit Pipes",   description: "...", marketSlug: "europe" },

    // --- Pneumatic Tube Systems ---
    { slug: "petg-tubes", label: "PETG Tubes", description: "...", marketSlug: "pneumatic-tube-systems" },
    { slug: "fittings",   label: "Fittings",   description: "...", marketSlug: "pneumatic-tube-systems" },
  ],
} as const;
```

### Design Decisions

**Mental model**: The catalog is a flat-then-indexed structure, not a deeply nested tree. Markets and families are stored in flat arrays, linked by `marketSlug` / `familySlugs`. This is deliberate:

- Flat arrays are trivially iterable for `generateStaticParams`
- Index lookups are built via helper functions (see below), not baked into the shape
- Adding a new market or family is a single array push, no tree restructuring

**Why family slugs repeat across markets**: "couplings" appears in 4 markets. The slug is the same but the `ProductFamilyDefinition` is a separate entry per market because the label, description, and eventually the product data behind it differ. The `(marketSlug, familySlug)` tuple is the unique key.

**Why not i18n for labels yet**: Labels in this config are English-only display defaults. They will be replaced by i18n translation keys in the page components. The config labels serve as fallbacks and as the source for `generateStaticParams` / validation — contexts where i18n is not available.

### Helper Functions (same file)

```typescript
// --- Lookup helpers ---

export function getMarketBySlug(slug: string): MarketDefinition | undefined {
  return PRODUCT_CATALOG.markets.find((m) => m.slug === slug);
}

export function getFamiliesForMarket(marketSlug: string): ProductFamilyDefinition[] {
  return PRODUCT_CATALOG.families.filter((f) => f.marketSlug === marketSlug);
}

export function getFamilyBySlug(
  marketSlug: string,
  familySlug: string,
): ProductFamilyDefinition | undefined {
  return PRODUCT_CATALOG.families.find(
    (f) => f.marketSlug === marketSlug && f.slug === familySlug,
  );
}

// --- Validation helpers (used by generateStaticParams and route guards) ---

export function isValidMarketSlug(slug: string): boolean {
  return PRODUCT_CATALOG.markets.some((m) => m.slug === slug);
}

export function isValidMarketFamilyCombo(
  marketSlug: string,
  familySlug: string,
): boolean {
  const market = getMarketBySlug(marketSlug);
  if (!market) return false;
  return market.familySlugs.includes(familySlug);
}

/** All valid (market, family) tuples — for generateStaticParams */
export function getAllMarketFamilyParams(): Array<{
  market: string;
  family: string;
}> {
  return PRODUCT_CATALOG.markets.flatMap((market) =>
    market.familySlugs.map((familySlug) => ({
      market: market.slug,
      family: familySlug,
    })),
  );
}

/** All market slugs — for generateStaticParams */
export function getAllMarketSlugs(): string[] {
  return PRODUCT_CATALOG.markets.map((m) => m.slug);
}
```

### Type Exports (same file)

```typescript
export type { MarketDefinition, ProductFamilyDefinition, CatalogConfig, SizeSystem };
```

---

## 2. Route Structure

### File System Layout

```
src/app/[locale]/products/
  page.tsx                           ← Products overview (MODIFY existing)
  [market]/
    page.tsx                         ← Market series landing
    [family]/
      page.tsx                       ← Product family page
```

**[CORRECTED in v2]** The legacy `src/app/[locale]/products/[slug]/page.tsx` must be **deleted before** creating the `[market]` route. Next.js App Router does not allow two different dynamic segments (`[slug]` and `[market]`) at the same directory level — `generateStaticParams` cannot resolve this collision. Task 000 in the v2 plan handles the full removal of `[slug]`, its MDX content, config references, and sitemap entries. See `docs/plans/2026-03-20-product-catalog-plan/_index.md` for the authoritative execution plan.

### `generateStaticParams` for Each Route

#### `src/app/[locale]/products/page.tsx` (existing, no change needed)

Already uses `generateLocaleStaticParams()` — returns `[{ locale: "en" }, { locale: "zh" }]`.

#### `src/app/[locale]/products/[market]/page.tsx`

```typescript
import { routing } from "@/i18n/routing";
import { getAllMarketSlugs } from "@/constants/product-catalog";

export function generateStaticParams() {
  const markets = getAllMarketSlugs();
  return routing.locales.flatMap((locale) =>
    markets.map((market) => ({ locale, market })),
  );
}
```

This produces `2 locales * 5 markets = 10` static pages.

#### `src/app/[locale]/products/[market]/[family]/page.tsx`

```typescript
import { routing } from "@/i18n/routing";
import { getAllMarketFamilyParams } from "@/constants/product-catalog";

export function generateStaticParams() {
  const combos = getAllMarketFamilyParams();
  return routing.locales.flatMap((locale) =>
    combos.map(({ market, family }) => ({ locale, market, family })),
  );
}
```

This produces `2 locales * ~15 combos = ~30` static pages.

### Param Validation (404 for invalid combos)

Each page validates params before rendering. Pattern (applied in both `[market]` and `[market]/[family]`):

```typescript
import { notFound } from "next/navigation";
import { isValidMarketSlug, isValidMarketFamilyCombo } from "@/constants/product-catalog";

// In market page:
const market = await params;
if (!isValidMarketSlug(market.market)) {
  notFound();
}

// In family page:
const { market, family } = await params;
if (!isValidMarketFamilyCombo(market, family)) {
  notFound();
}
```

Because we use `generateStaticParams`, invalid combos will not be pre-rendered. The `notFound()` guard is a defense-in-depth measure for ISR/on-demand and development mode.

---

## 3. Page Components

### 3a. Products Overview Page (MODIFY existing)

**File**: `src/app/[locale]/products/page.tsx`

Current state: Shows a flat grid of all MDX products with category/standard filters.

**Changes needed**: Replace the flat product grid with a market-series card grid. Each card links to `/{locale}/products/{market-slug}`. Keep the existing page structure (Suspense wrapper, metadata generation) but swap the content.

```
Layout:
  Page Header (h1 + description)
  Market Series Grid (2-col md, 1-col mobile)
    MarketSeriesCard (for each market)
      - Standard label badge
      - Market name (h2)
      - Description
      - Product family count
      - Link to market page
```

The existing category/standard filters and the MDX product grid become unnecessary on this page. They can be removed or moved to the family pages where filtering by variant (size, angle, etc.) will eventually live.

### 3b. Market Series Landing Page (NEW)

**File**: `src/app/[locale]/products/[market]/page.tsx`

Displays all product families within one market series.

```
Layout:
  Breadcrumb: Home > Products > {Market Label}
  Page Header (h1: market label, description, standard badge)
  Product Family Grid (3-col lg, 2-col md, 1-col mobile)
    FamilyCard (for each family in this market)
      - Family name (h2)
      - Description
      - Placeholder image or icon
      - Link to family page
```

**Key props flow**:

```typescript
interface MarketPageProps {
  params: Promise<{ locale: string; market: string }>;
}
```

The page reads params, validates via `isValidMarketSlug`, looks up market definition via `getMarketBySlug`, gets families via `getFamiliesForMarket`, renders.

### 3c. Product Family Page (NEW)

**File**: `src/app/[locale]/products/[market]/[family]/page.tsx`

The actual product page. This is where buyers land from search. Contains the product description and a spec table placeholder.

```
Layout:
  Breadcrumb: Home > Products > {Market Label} > {Family Label}
  Page Header (h1: family label, market standard badge)
  Description section
  Spec Table Placeholder (empty state with "Specifications coming soon")
  Inquiry CTA (link to contact or inline form)
```

**Key props flow**:

```typescript
interface FamilyPageProps {
  params: Promise<{ locale: string; market: string; family: string }>;
}
```

Validates via `isValidMarketFamilyCombo`, looks up both market and family definitions, renders.

### 3d. Shared Components (NEW)

#### `src/components/products/catalog-breadcrumb.tsx`

A reusable breadcrumb builder for the catalog hierarchy. Wraps the existing shadcn/ui `Breadcrumb` components.

```typescript
interface CatalogBreadcrumbProps {
  locale: string;
  /** If provided, shows market in breadcrumb trail */
  market?: MarketDefinition;
  /** If provided, shows family as the current page */
  family?: ProductFamilyDefinition;
}
```

Generates breadcrumb items:
- Always: `Home > Products`
- If market: `> {market.label}`
- If family: `> {family.label}` (market becomes a link, family becomes current page)

Uses `<Link>` from `@/i18n/routing` for locale-aware navigation. Also generates the corresponding breadcrumb structured data (JSON-LD) via `createBreadcrumbStructuredData`.

#### `src/components/products/market-series-card.tsx`

Card for the overview page linking to a market.

```typescript
interface MarketSeriesCardProps {
  market: MarketDefinition;
  familyCount: number;
  locale: string;
}
```

Server Component. Uses the shadow-card system per PAGE-PATTERNS.md.

#### `src/components/products/family-card.tsx`

Card for the market landing page linking to a product family.

```typescript
interface FamilyCardProps {
  family: ProductFamilyDefinition;
  marketSlug: string;
  locale: string;
}
```

Server Component. Uses the shadow-card system.

#### `src/components/products/market-navigation.tsx` (optional, Phase 2)

A horizontal nav bar showing all market series, highlighting the active one. Lives above the breadcrumb or in the page header area. Not needed for MVP skeleton but worth noting for later.

---

## 4. Routing Config Updates

### `src/config/paths/types.ts`

Add new page types:

```typescript
export type PageType =
  | "home"
  | "about"
  | "contact"
  | "blog"
  | "products"
  | "faq"
  | "privacy"
  | "terms"
  | "productMarket"    // NEW
  | "productFamily";   // NEW

export type DynamicPageType =
  | "blogDetail"
  | "productDetail"
  | "productMarket"    // NEW
  | "productFamily";   // NEW
```

### `src/config/paths/paths-config.ts`

Add entries for the new page types:

```typescript
// In PATHS_CONFIG — these are the static base paths (no dynamic segments)
// productMarket and productFamily are dynamic, so they only need DYNAMIC_PATHS_CONFIG entries.

// In DYNAMIC_PATHS_CONFIG:
export const DYNAMIC_PATHS_CONFIG = Object.freeze({
  blogDetail: Object.freeze({
    pattern: "/blog/[slug]",
    paramName: "slug",
  }),
  productDetail: Object.freeze({
    pattern: "/products/[slug]",
    paramName: "slug",
  }),
  productMarket: Object.freeze({
    pattern: "/products/[market]",
    paramName: "market",
  }),
  productFamily: Object.freeze({
    pattern: "/products/[market]/[family]",
    paramName: "family",  // primary param; market is parent
  }),
} as const satisfies Record<DynamicPageType, DynamicRoutePattern>);
```

### `src/config/paths/utils.ts` (PATHNAMES)

Add the new dynamic route patterns to the `PATHNAMES` object consumed by next-intl:

```typescript
export const PATHNAMES = {
  "/": "/",
  "/about": "/about",
  "/contact": "/contact",
  "/blog": "/blog",
  "/blog/[slug]": "/blog/[slug]",
  "/products": "/products",
  "/products/[slug]": "/products/[slug]",
  "/products/[market]": "/products/[market]",                  // NEW
  "/products/[market]/[family]": "/products/[market]/[family]", // NEW
  "/faq": "/faq",
  "/privacy": "/privacy",
  "/terms": "/terms",
} as const;
```

Both locales use the same paths (shared pathnames pattern, consistent with existing project convention).

### next-intl Routing Concern

The routing config uses `pathnames` from `PATHNAMES`. Adding the new entries is sufficient — next-intl will recognize the dynamic segments and the `Link` component will accept `params` for them. No changes to `routing-config.ts` or `routing.ts` are needed beyond what flows through `PATHNAMES`.

**Potential conflict**: `/products/[slug]` and `/products/[market]` both match a single segment after `/products/`. next-intl treats these as the same pattern structurally. This is actually fine because:
1. Next.js file-system routing resolves which page handles the request (based on `generateStaticParams` output)
2. next-intl's `Link` component is used with explicit `href` paths, not pattern matching

If this causes build warnings, we can resolve by giving the legacy `[slug]` route a more specific path prefix (e.g., `/products/item/[slug]`) in a future migration. For now, the file system layout handles disambiguation.

---

## 5. Type Definitions

### New Types in `src/constants/product-catalog.ts`

(See Section 1 — all types are co-located with the config for cohesion.)

```typescript
// Exported from product-catalog.ts:
export type { MarketDefinition, ProductFamilyDefinition, CatalogConfig, SizeSystem };
```

### Relationship to Existing Types

| New Type | Existing Type | Relationship |
|----------|--------------|--------------|
| `MarketDefinition` | — | New concept; no existing equivalent |
| `ProductFamilyDefinition` | — | New concept; a family groups multiple products |
| `MarketDefinition.standardIds` | `ProductStandardId` | References existing standard IDs from `product-standards.ts` |
| (future) Family page data | `ProductSummary` | Family pages will eventually list `ProductSummary[]` items filtered by market+family |
| (future) Family page detail | `ProductDetail` | Individual product specs will use existing `ProductDetail.specs` |

The catalog config is **orthogonal** to the existing content types. `MarketDefinition` and `ProductFamilyDefinition` are route/navigation concepts. `ProductSummary` and `ProductDetail` are content/data concepts. They connect at the page level:

```
Route: /products/{market}/{family}
  → Catalog config tells us: which market, which family, valid?
  → Content layer tells us: what products belong to this family? (future)
```

For the MVP skeleton, the family page does NOT fetch from the MDX content layer. It renders static information from the catalog config. Content integration is Phase 2.

### No Changes to `src/types/content.types.ts`

The existing content types remain untouched. When we later need to link MDX products to catalog families, we will add a `marketSlug` and `familySlug` field to `ProductMetadata` — but that is out of scope for this phase.

---

## 6. SEO & Metadata

### generateMetadata for Each New Page

Both new pages follow the existing pattern (see `products/[slug]/page.tsx` as reference):

```typescript
export async function generateMetadata({ params }: MarketPageProps): Promise<Metadata> {
  const { locale, market: marketSlug } = await params;
  const market = getMarketBySlug(marketSlug);
  if (!market) return { title: "Not Found" };

  return generateMetadataForPath({
    locale: locale as SeoLocale,
    pageType: "productMarket",
    path: `/products/${marketSlug}`,
    config: {
      title: market.label,           // e.g. "UL / ASTM Series"
      description: market.description,
    },
  });
}
```

Family page follows the same pattern with `pageType: "productFamily"` and `path: `/products/${marketSlug}/${familySlug}``.

### Structured Data

Each page emits:
1. **BreadcrumbList** JSON-LD via `createBreadcrumbStructuredData` (already exists in codebase)
2. **Product** JSON-LD is deferred to Phase 2 when real product data populates the family pages

### Cache Tags

Extend `src/lib/cache/cache-tags.ts` with catalog-specific tags if needed. For the MVP skeleton (static config data, no dynamic fetching), cache tags are not required. When content integration happens, we add:

```typescript
// Future: product:catalog:{market}:{locale}
```

---

## 7. Implementation File List

Ordered by dependency (implement top-to-bottom):

| # | File | Action | Description |
|---|------|--------|-------------|
| 1 | `src/constants/product-catalog.ts` | CREATE | Catalog config + types + helpers |
| 2 | `src/config/paths/types.ts` | MODIFY | Add `productMarket`, `productFamily` to `PageType` and `DynamicPageType` |
| 3 | `src/config/paths/paths-config.ts` | MODIFY | Add `productMarket`, `productFamily` to `DYNAMIC_PATHS_CONFIG` |
| 4 | `src/config/paths/utils.ts` | MODIFY | Add new routes to `PATHNAMES` |
| 5 | `src/components/products/catalog-breadcrumb.tsx` | CREATE | Shared breadcrumb for catalog pages |
| 6 | `src/components/products/market-series-card.tsx` | CREATE | Card component for overview page |
| 7 | `src/components/products/family-card.tsx` | CREATE | Card component for market landing page |
| 8 | `src/components/products/index.ts` | MODIFY | Re-export new components |
| 9 | `src/app/[locale]/products/page.tsx` | MODIFY | Replace flat product grid with market series grid |
| 10 | `src/app/[locale]/products/[market]/page.tsx` | CREATE | Market series landing page |
| 11 | `src/app/[locale]/products/[market]/[family]/page.tsx` | CREATE | Product family page |

### Files NOT Changed

- `src/app/[locale]/products/[slug]/page.tsx` — Legacy product detail, untouched
- `src/types/content.types.ts` — No content type changes
- `src/lib/content/products.ts` — No cache layer changes
- `src/lib/content/products-source.ts` — No MDX source changes
- `src/i18n/routing-config.ts` — Consumes PATHNAMES indirectly, no direct change
- `messages/` — i18n message additions are out of scope

---

## 8. Out of Scope (NOT in this phase)

| Item | Why deferred |
|------|-------------|
| Spec table with real data | Requires product data modeling per family; Phase 2 |
| Filtering / search | Family pages will eventually have size/angle filters; Phase 2 |
| MDX content migration | Existing MDX products need `marketSlug`/`familySlug` fields added; Phase 2 |
| i18n message additions | Beyond basic page titles; needs copywriting first |
| Market navigation bar | Horizontal nav across markets; nice-to-have after skeleton works |
| OEM/Custom Manufacturing page | Separate from catalog; `/oem-custom-manufacturing/` |
| Capabilities/Bending Machines page | Separate from catalog; `/capabilities/bending-machines/` |
| `product-standards.ts` expansion | NOM and IEC standard IDs; add when product data arrives |
| Cache tag extensions | No dynamic data fetching in skeleton phase |
| Sitemap updates | Add market/family URLs to `src/app/sitemap.ts` after pages are confirmed working |

---

## 9. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Route collision between `[slug]` and `[market]` | Medium | `generateStaticParams` on both routes ensures no overlap. Market slugs (`north-america`, etc.) will never be MDX product file names. If collision occurs, build fails loudly. |
| next-intl pathname ambiguity | Low | Both `/products/[slug]` and `/products/[market]` in PATHNAMES. next-intl does not resolve routes — Next.js file system does. Link components use explicit paths. |
| Product catalog config grows large | Low | Config is ~15 families across 5 markets. Even at 10x growth, it's a trivial constant. |
| Breaking existing `/products` page | Medium | The overview page modification replaces the existing product grid. If we need the old behavior, it can be preserved at a different route (e.g., `/products/all`). Confirm with owner before implementing. |

---

## 10. Validation Checklist (post-implementation)

- [ ] `pnpm type-check` passes
- [ ] `pnpm build` succeeds (all static pages generated)
- [ ] `pnpm build:cf` succeeds (Cloudflare compatible)
- [ ] Navigate to `/en/products/` — shows 5 market series cards
- [ ] Navigate to `/en/products/north-america/` — shows 3 family cards
- [ ] Navigate to `/en/products/north-america/conduit-sweeps-elbows/` — shows family page
- [ ] Navigate to `/en/products/australia-new-zealand/bellmouths/` — shows bellmouths (AU-only product)
- [ ] Navigate to `/en/products/north-america/bellmouths/` — returns 404
- [ ] Navigate to `/en/products/invalid-market/` — returns 404
- [ ] Breadcrumbs render correctly at each level
- [ ] Locale switching works (`/en/products/north-america/` <-> `/zh/products/north-america/`)
- [ ] Existing `/en/products/[slug]` MDX product pages still work

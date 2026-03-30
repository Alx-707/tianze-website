# Information Architecture — Tianze Website

> Ring 2, Task 7 | Status: Confirmed by owner (2026-03-30)
> Inputs: Task 6 (buyer question chains), Section 3 (business line taxonomy)

## Current Site Structure (Actual)

```
/                                      Homepage
/products/                             Products overview
/products/[market]/                    Product by market (e.g., north-america)
/capabilities/bending-machines/        Bending machines (framed as "capability")
/oem-custom-manufacturing/             OEM / custom manufacturing
/about/                                About us
/contact/                              Contact
/blog/                                 Blog listing
/blog/[slug]/                          Blog post
/faq/                                  FAQ (referenced in sitemap but no page file found)
/privacy/                              Privacy policy
/terms/                                Terms of service
```

## Issues with Current Structure

| Issue | Impact |
|-------|--------|
| Bending machines under `/capabilities/` | Frames equipment as trust signal, not sellable product. Owner confirmed it IS a sellable product line |
| No PETG pneumatic section | PETG has distinct buyers (hospital integrators) with 9 unanswered questions. Currently invisible |
| No FAQ page file found | Referenced in sitemap but `src/app/[locale]/faq/page.tsx` not found in glob |
| Equipment page has 0 buyer questions answered | 19 questions, zero content — biggest content gap |
| OEM page thin on detail | 21 buyer questions, most only partially answered |
| Three business lines scattered across different URL hierarchies | `/products/`, `/capabilities/`, `/oem-custom-manufacturing/` — no unified product tree |

## Proposed Site Structure (Owner Confirmed)

All sellable products/services live under `/products/` as a unified tree.

```
/                                          Homepage (company narrative -> 3 business lines)
│
├── /products/                             Products overview (3 lines entry)
│   │
│   ├── /products/pipes/                   Pipes overview (PVC + PETG)
│   │   ├── /products/pipes/[market]/      PVC conduit by market standard
│   │   │   (e.g., /products/pipes/australia, /products/pipes/north-america)
│   │   └── /products/pipes/pneumatic-tubes/   PETG pneumatic tubes
│   │
│   ├── /products/equipment/               Equipment overview
│   │   └── /products/equipment/bending-machines/  Bending machines
│   │
│   └── /products/custom-manufacturing/    OEM / Custom molds
│
├── /about/                                About us
├── /contact/                              Contact
├── /blog/                                 Blog listing
│   └── /blog/[slug]/                      Blog post
├── /faq/                                  FAQ
├── /privacy/                              Privacy policy
└── /terms/                                Terms of service
```

### Why this structure

- **Unified product tree**: everything Tianze sells is under `/products/`, one mental model
- **Clean hierarchy**: Products -> Business Line -> Specific Product
- **SEO friendly**: URL path reflects content hierarchy
- **Scalable**: adding a new market or product type is just another node

## Change Summary

| Change | Type | Current path | New path | Effort |
|--------|------|-------------|----------|--------|
| Products overview | RESTRUCTURE | `/products/` (was pipe-only) | `/products/` (3-line hub) | Medium |
| PVC conduit by market | MIGRATE | `/products/[market]/` | `/products/pipes/[market]/` | High (existing pages + routes) |
| PVC pipes overview | NEW | — | `/products/pipes/` | Medium |
| PETG pneumatic tubes | NEW | — | `/products/pipes/pneumatic-tubes/` | Medium |
| Bending machines | MIGRATE | `/capabilities/bending-machines/` | `/products/equipment/bending-machines/` | Medium |
| Equipment overview | NEW | — | `/products/equipment/` | Low |
| OEM / Custom | MIGRATE | `/oem-custom-manufacturing/` | `/products/custom-manufacturing/` | Medium |
| FAQ | CREATE/VERIFY | — | `/faq/` | Low |
| All other pages | KEEP | — | — | None |

**All migrated paths need 301 redirects from old to new.**

## Navigation Scheme

### Main Navigation

```
Products ▾                       About      [Contact - CTA button]
├── Pipes
│   ├── Australia Standard
│   ├── North America
│   ├── Southeast Asia
│   └── Pneumatic Tubes
├── Equipment
│   └── Bending Machines
└── Custom Manufacturing
```

### Design notes:
- **Products** is the single top-level nav item for all sellable offerings
- Dropdown shows three business lines with sub-items
- **About** and **Contact** stay at top level
- **Blog** and **FAQ** move to footer (not primary conversion paths)
- **Contact** styled as CTA button (existing pattern)

### Footer Navigation

| Column: Products | Column: Company | Column: Support |
|-----------------|-----------------|-----------------|
| PVC Conduit | About | FAQ |
| Pneumatic Tubes | Blog | Privacy Policy |
| Bending Machines | Contact | Terms of Service |
| Custom Manufacturing | | |

## Shared Trust Assets

These pages/sections serve ALL business lines and should be accessible from every product context:

| Asset | Location | Serves |
|-------|----------|--------|
| Company story ("we make the machines") | Homepage hero, About page | All lines |
| Certifications section | About page, inline on product pages | Pipes + OEM |
| Factory photos/video | About page | All lines |
| Free sample CTA | Product pages, homepage | Pipes + OEM |
| Factory visit invitation | About page, contact page | All lines (especially Equipment + OEM) |

## Cross-Guidance Between Lines

Minimal cross-guidance, only where natural:

- **Equipment -> Pipes**: USEFUL — "see the products we make with our own machines"
- **OEM -> Equipment**: USEFUL — "we have in-house equipment capability"
- **All -> About**: Always useful — shared trust assets
- **Pipes -> Equipment**: NOT needed (different buyers)

Implementation: subtle "Related" links, not forced navigation.

## URL Migration Plan

### 3 paths to migrate + 301 redirects

**1. `/products/[market]/` -> `/products/pipes/[market]/`**

This is the highest-effort migration (existing implemented pages):
- Move `src/app/[locale]/products/[market]/page.tsx` to `src/app/[locale]/products/pipes/[market]/page.tsx`
- Create `src/app/[locale]/products/pipes/page.tsx` (pipes overview)
- Update `DYNAMIC_PATHS_CONFIG.productMarket.pattern` in `paths-config.ts`
- Update `src/lib/i18n/route-parsing.ts` dynamic route patterns
- Update `src/app/sitemap.ts` URL generation
- Add 301 redirect: `/products/[market]` -> `/products/pipes/[market]`
- Grep and update all internal links referencing `/products/north-america` etc.

**2. `/capabilities/bending-machines/` -> `/products/equipment/bending-machines/`**

- Move page file from `capabilities/` to `products/equipment/`
- Create `src/app/[locale]/products/equipment/page.tsx` (equipment overview)
- Update `PATHS_CONFIG.bendingMachines` in `paths-config.ts`
- Add 301 redirect
- Update internal links

**3. `/oem-custom-manufacturing/` -> `/products/custom-manufacturing/`**

- Move page file
- Update `PATHS_CONFIG.oem` in `paths-config.ts`
- Add 301 redirect
- Update internal links

### New pages needed

| Page | Priority | Content dependency |
|------|----------|-------------------|
| `/products/` (restructured as 3-line hub) | P0 | All question chains |
| `/products/pipes/` (pipes overview) | P0 | PVC + PETG question chains |
| `/products/pipes/pneumatic-tubes/` | P1 | PETG question chain |
| `/products/equipment/` (equipment overview) | P1 | Equipment question chain |
| `/faq/` (verify/create) | P2 | Cross-line FAQ aggregation |

### Route config changes (`src/config/paths/paths-config.ts`)

```
Current:                              Proposed:
products: "/products"                 products: "/products"
                                      pipes: "/products/pipes"               (NEW)
                                      pneumaticTubes: "/products/pipes/pneumatic-tubes" (NEW)
                                      equipment: "/products/equipment"        (NEW)
bendingMachines: "/capabilities/..."  bendingMachines: "/products/equipment/bending-machines"
oem: "/oem-custom-manufacturing"      customManufacturing: "/products/custom-manufacturing"
```

Dynamic routes:
```
productMarket: "/products/[market]"   -> pipesMarket: "/products/pipes/[market]"
```

---

**Owner confirmed (2026-03-30):**
1. All three business lines under `/products/` as unified tree — confirmed
2. Pipes as second level with markets as third level — confirmed
3. Equipment and Custom Manufacturing as sibling second-level categories — confirmed
4. Minimal cross-guidance between lines — confirmed

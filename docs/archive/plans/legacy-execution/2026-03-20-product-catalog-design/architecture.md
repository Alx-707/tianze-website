# Architecture: Product Catalog Page Structure

> Full architecture details: `docs/plans/2026-03-20-product-catalog-architecture.md`

## Summary

### Route Structure
```
src/app/[locale]/products/
  page.tsx                    ← Products overview (MODIFY)
  [market]/
    page.tsx                  ← Market series landing (CREATE)
    [family]/
      page.tsx                ← Product family page (CREATE)
```

### Data Model
- Configuration constants in `src/constants/product-catalog.ts`
- 5 markets, ~15 product families, flat-then-indexed structure
- `(marketSlug, familySlug)` tuple as unique key
- Helper functions for lookup and validation

### Page Types
| Page | Route | Content |
|------|-------|---------|
| Products Overview | `/products/` | 5 market series cards |
| Market Landing | `/products/[market]/` | Product family cards for that market |
| Product Family | `/products/[market]/[family]/` | Family description + spec table placeholder + inquiry CTA |

### New Components
| Component | Type | Purpose |
|-----------|------|---------|
| `catalog-breadcrumb.tsx` | Server | 3-level breadcrumb with JSON-LD |
| `market-series-card.tsx` | Server | Card linking to market landing |
| `family-card.tsx` | Server | Card linking to product family |

### Key Decisions
1. **Dynamic routes over static folders** — data-driven, adding market = config change not file creation
2. **Config constants over MDX** — market/family structure is stable, not content
3. **Orthogonal to existing content layer** — no changes to ProductMetadata, products-source.ts, or cache
4. **Legacy [slug] route preserved** — coexists via generateStaticParams disambiguation

### Implementation Order (11 files)
1. `src/constants/product-catalog.ts` — CREATE
2. `src/config/paths/types.ts` — MODIFY
3. `src/config/paths/paths-config.ts` — MODIFY
4. `src/config/paths/utils.ts` — MODIFY
5. `src/components/products/catalog-breadcrumb.tsx` — CREATE
6. `src/components/products/market-series-card.tsx` — CREATE
7. `src/components/products/family-card.tsx` — CREATE
8. `src/components/products/index.ts` — MODIFY
9. `src/app/[locale]/products/page.tsx` — MODIFY
10. `src/app/[locale]/products/[market]/page.tsx` — CREATE
11. `src/app/[locale]/products/[market]/[family]/page.tsx` — CREATE

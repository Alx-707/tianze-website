# Task 001: Catalog Config + Route Config Setup

**type**: setup
**depends-on**: ["000"]

## Goal

Create the catalog configuration constant and update routing config to support `[market]/[family]` dynamic routes.

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/constants/product-catalog.ts` | CREATE |
| `src/config/paths/types.ts` | MODIFY — add new dynamic page types |
| `src/config/paths/paths-config.ts` | MODIFY — add new dynamic route patterns |
| `src/config/paths/utils.ts` | MODIFY — add new PATHNAMES entries |
| `src/lib/i18n/route-parsing.ts` | MODIFY — add new DYNAMIC_ROUTE_PATTERNS |
| `src/components/products/index.ts` | MODIFY — prep re-exports barrel |

## Steps

1. Create `src/constants/product-catalog.ts` with:
   - `MarketDefinition` and `ProductFamilyDefinition` interfaces
   - `PRODUCT_CATALOG` constant with 5 markets and ~15 families (per CATALOG-STRUCTURE.md)
   - Helper functions: `getMarketBySlug`, `getFamiliesForMarket`, `getFamilyBySlug`, `isValidMarketSlug`, `isValidMarketFamilyCombo`, `getAllMarketFamilyParams`, `getAllMarketSlugs`
   - Type exports

2. Add `"productMarket"` and `"productFamily"` to `DynamicPageType` in types.ts

3. Add `productMarket` and `productFamily` entries to `DYNAMIC_PATHS_CONFIG` in paths-config.ts:
   - `productMarket`: pattern `/products/[market]`, paramName `market`
   - `productFamily`: pattern `/products/[market]/[family]`, paramNames `market`, `family`

4. Add `/products/[market]` and `/products/[market]/[family]` to `PATHNAMES` in utils.ts

5. Add two new patterns to `DYNAMIC_ROUTE_PATTERNS` in route-parsing.ts:
   - `/products/{market}` → `{ pathname: "/products/[market]", params: { market } }`
   - `/products/{market}/{family}` → `{ pathname: "/products/[market]/[family]", params: { market, family } }`
   - Note: the two-segment pattern must come before the one-segment pattern to avoid false matches

6. Update route-parsing tests and paths tests to cover the new patterns

## Metadata Strategy Decision

Market and family pages **do NOT use `generateMetadataForPath`** (which requires `PageType`). Instead, each page builds its own `Metadata` object directly:

- **Title**: Constructed from catalog config data (e.g., `"UL / ASTM Series | Tianze"`, `"Conduit Sweeps & Elbows — UL / ASTM | Tianze"`)
- **Description**: From market/family `description` field in catalog config
- **Canonical / alternates**: Use `generateCanonicalURL()` and `generateLanguageAlternates()` from `@/services/url-generator` (these accept arbitrary paths, no `PageType` needed)
- **Open Graph type**: `"website"` for market pages, `"product"` for family pages

This means:
- `PageType` is NOT extended (stays `home | about | contact | ...`)
- `DynamicPageType` gets `productMarket` and `productFamily` (for routing only)
- No new SEO translation keys needed — titles come from the catalog config, not i18n messages
- The overview page (`/products/`) continues to use `generateMetadataForPath` with `pageType: "products"` as before

## Verification

```bash
pnpm type-check   # All new types compile
pnpm lint:check   # No lint errors
pnpm test          # Updated tests pass
```

Manually verify:
- `getAllMarketSlugs()` returns 5 slugs
- `getAllMarketFamilyParams()` returns ~15 tuples
- `isValidMarketFamilyCombo("north-america", "bellmouths")` returns false
- `isValidMarketFamilyCombo("australia-new-zealand", "bellmouths")` returns true

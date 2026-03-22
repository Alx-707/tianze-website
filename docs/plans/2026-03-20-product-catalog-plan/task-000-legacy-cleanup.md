# Task 000: Legacy Product Route Cleanup

**type**: cleanup
**depends-on**: []

## BDD Scenario

```gherkin
Scenario: Legacy product detail routes are removed
  Given the old route /en/products/pvc-conduit-bend existed
  When running pnpm build
  Then no /products/[slug] pages are generated
  And navigating to /en/products/pvc-conduit-bend/ returns 404
```

## Goal

Remove the entire legacy `/products/[slug]` route system and all supporting infrastructure before introducing the new `[market]/[family]` routes. This eliminates the App Router route collision between `[slug]` and `[market]` at the same level.

The site is not indexed by search engines, so no 301 redirects are needed.

## Files to Delete

| File | Reason |
|------|--------|
| `src/app/[locale]/products/[slug]/page.tsx` | Legacy route (collision source) |
| `src/app/[locale]/products/[slug]/__tests__/page.test.tsx` | Tests for deleted route |
| `src/app/[locale]/products/[slug]/__tests__/page-download-pdf.test.tsx` | Tests for deleted route |

## Files to Move

| From | To | Reason |
|------|-----|--------|
| `content/products/` | `content/_archive/products/` | MDX no longer consumed by any route; isolate to prevent false signals |

## Files to Modify

| File | Change |
|------|--------|
| `src/config/paths/types.ts` | Remove `"productDetail"` from `DynamicPageType` |
| `src/config/paths/paths-config.ts` | Remove `productDetail` entry from `DYNAMIC_PATHS_CONFIG` |
| `src/config/paths/utils.ts` | Remove `"/products/[slug]"` from `PATHNAMES` |
| `src/lib/i18n/route-parsing.ts` | Remove `/products/[slug]` pattern from `DYNAMIC_ROUTE_PATTERNS` |
| `src/i18n/__tests__/routing.test.ts` | Remove assertions referencing `/products/[slug]` (note: `src/i18n/`, not `src/lib/i18n/`) |
| `src/config/__tests__/paths.test.ts` | Remove assertions referencing `/products/[slug]` |
| `src/lib/i18n/__tests__/route-parsing.test.ts` | Remove test cases for `/products/[slug]` |
| `src/app/sitemap.ts` | Remove `generateProductEntries()`, `fetchAllProductsByLocale()`, `buildProductAlternates()`, and related imports. Remove `"product"` from `PAGE_CONFIG_MAP`. Remove `productEntries` from sitemap output. (New catalog sitemap entries will be added in Task 007.) |
| `src/app/__tests__/sitemap.test.ts` | Remove product-related mock and assertions |

## Files to Regenerate

| File | How |
|------|-----|
| `src/lib/content-manifest.generated.ts` | Run `pnpm content:manifest` after moving MDX |
| `src/lib/mdx-importers.generated.ts` | Run `pnpm content:manifest` after moving MDX |

## Steps

1. Delete `src/app/[locale]/products/[slug]/` directory entirely
2. Move `content/products/` to `content/_archive/products/`
3. Run `pnpm content:manifest` to regenerate manifest (products removed)
4. Remove `productDetail` from `DynamicPageType` in types.ts
5. Remove `productDetail` config from paths-config.ts
6. Remove `/products/[slug]` from PATHNAMES in utils.ts
7. Remove `/products/[slug]` pattern from route-parsing.ts `DYNAMIC_ROUTE_PATTERNS`
8. Remove `generateProductEntries`, `fetchAllProductsByLocale`, `buildProductAlternates`, related imports and config from sitemap.ts
9. Update all affected test files: remove references to `/products/[slug]`, productDetail, and MDX product mocks
10. Verify no remaining references to deleted paths: search for `products/[slug]`, `productDetail`, `getProductBySlugCached`, `getAllProductsCached` in `src/`

## Verification

```bash
# No references to deleted paths remain
grep -r "products/\[slug\]" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
grep -r "productDetail" src/ --include="*.ts" --include="*.tsx"
grep -r "getProductBySlugCached" src/ --include="*.ts" --include="*.tsx"

# All checks pass
pnpm type-check
pnpm lint:check
pnpm test
pnpm build
```

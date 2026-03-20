# Task 004: Products Overview Page — Implementation (Green)

**type**: impl
**depends-on**: ["004-overview-page-test", "002-breadcrumb-impl", "003-cards-impl"]

## BDD Scenario

```gherkin
Scenario: User views products overview page
  Given the user navigates to /en/products/
  Then they see 5 market series cards
  And each card links to its market landing page
```

## Files to Modify

| File | Action |
|------|--------|
| `src/app/[locale]/products/page.tsx` | REWRITE — replace MDX-based filtering page with catalog market cards |

## Steps

1. Rewrite `src/app/[locale]/products/page.tsx` as async Server Component
2. Remove all imports from `@/lib/content/products` (dead code after Task 000)
3. Remove filtering components and Suspense wrappers (old MDX-based UI)
4. Import `PRODUCT_CATALOG`, `getFamiliesForMarket` from catalog config
5. Import `MarketSeriesCard`, `CatalogBreadcrumb` from products components
6. Render `CatalogBreadcrumb` (no market/family props = overview level)
7. Map over `PRODUCT_CATALOG.markets` to render `MarketSeriesCard` for each
8. Keep `generateStaticParams` (locale only) and update `generateMetadata`

## Verification

```bash
pnpm test -- src/app/[locale]/products/__tests__/page.test.tsx
# Expected: ALL TESTS PASS (Green phase)
pnpm type-check
```

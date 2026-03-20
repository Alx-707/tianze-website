# Task 007: Integration Validation

**type**: integration
**depends-on**: ["004-overview-page-impl", "005-market-page-impl", "006-family-page-impl"]

## BDD Scenario

```gherkin
Scenario: All market pages are statically generated
  When running pnpm build
  Then 10 market landing pages are generated (5 markets x 2 locales)

Scenario: All family pages are statically generated
  When running pnpm build
  Then approximately 30 family pages are generated (~15 combos x 2 locales)

Scenario: Legacy product detail routes are removed
  When running pnpm build
  Then no /products/[slug] pages are generated
  And navigating to /en/products/pvc-conduit-bend/ returns 404

Scenario: Locale switching preserves route
  Given the user is on /en/products/north-america/
  When they switch locale to Chinese
  Then they are navigated to /zh/products/north-america/
```

## Steps

1. Run `pnpm type-check` — zero errors
2. Run `pnpm lint:check` — zero warnings
3. Run `pnpm test` — all tests pass (including new + existing)
4. Run `pnpm build` — verify:
   - Market pages generated (check build output for /products/north-america etc.)
   - Family pages generated
   - **No** /products/[slug] pages in build output (legacy fully removed)
   - No route collision errors
5. Update `src/app/sitemap.ts`: add catalog-based product entries using `PRODUCT_CATALOG` config (market pages + family pages) to replace the removed MDX-based product entries
6. Update `src/app/__tests__/sitemap.test.ts`: verify new catalog entries appear in sitemap
7. Run `pnpm build` again — verify sitemap includes new catalog URLs
8. Run `pnpm dev` and manually navigate:
   - /en/products/ — 5 market cards
   - /en/products/north-america/ — 3 family cards
   - /en/products/north-america/conduit-sweeps-elbows/ — family page with CTA
   - /en/products/australia-new-zealand/bellmouths/ — bellmouths page
   - /en/products/north-america/bellmouths/ — 404
   - /zh/products/north-america/ — Chinese locale
   - /en/products/pvc-conduit-bend — 404 (legacy removed)

## Verification

```bash
pnpm ci:local:quick   # Full quick CI
pnpm build            # Production build
```

# Task 005: Market Landing Page — Implementation (Green)

**type**: impl
**depends-on**: ["005-market-page-test", "002-breadcrumb-impl", "003-cards-impl"]

## BDD Scenario

```gherkin
Scenario: User navigates to a market series
  Given the user clicks on "UL / ASTM Series"
  Then they see family cards for that market

Scenario: Invalid market slug returns 404
  Given the user navigates to /en/products/invalid-market/
  Then they see the 404 page
```

## Files to Create

| File | Action |
|------|--------|
| `src/app/[locale]/products/[market]/page.tsx` | CREATE |

## Steps

1. Create market landing page as async Server Component
2. Await params, validate market slug via `isValidMarketSlug`, call `notFound()` if invalid
3. Look up market via `getMarketBySlug`, get families via `getFamiliesForMarket`
4. Render `CatalogBreadcrumb` with market prop
5. Render page header with market label, standard label badge, description
6. Render family cards grid using `FamilyCard` component
7. Add `generateStaticParams` using `getAllMarketSlugs` × locales
8. Add `generateMetadata`: build `Metadata` directly from catalog config (NOT via `generateMetadataForPath`). Title from `market.label`, description from `market.description`. Use `generateCanonicalURL` and `generateLanguageAlternates` for canonical/alternates. OG type: `"website"`. See Task 001 Metadata Strategy Decision.

## Verification

```bash
pnpm test -- src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx
# Expected: ALL TESTS PASS (Green phase)
pnpm type-check
```

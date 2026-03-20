# Task 006: Product Family Page — Implementation (Green)

**type**: impl
**depends-on**: ["006-family-page-test", "002-breadcrumb-impl"]

## BDD Scenario

```gherkin
Scenario: User navigates to a product family page
  Then they see the product family heading and description
  And they see an inquiry CTA

Scenario: Invalid market-family combination returns 404
  Given /en/products/north-america/bellmouths/
  Then 404
```

## Files to Create

| File | Action |
|------|--------|
| `src/app/[locale]/products/[market]/[family]/page.tsx` | CREATE |

## Steps

1. Create family page as async Server Component
2. Await params, validate via `isValidMarketFamilyCombo`, call `notFound()` if invalid
3. Look up market and family definitions
4. Render `CatalogBreadcrumb` with both market and family props
5. Render page header: family label (h1), market standard badge
6. Render description section
7. Render spec table placeholder: "Specifications coming soon" empty state
8. Render inquiry CTA: Button linking to /contact with contextual text
9. Add `generateStaticParams` using `getAllMarketFamilyParams` × locales
10. Add `generateMetadata`: build `Metadata` directly from catalog config (NOT via `generateMetadataForPath`). Title from `family.label` + `market.standardLabel`, description from `family.description`. Use `generateCanonicalURL` and `generateLanguageAlternates` for canonical/alternates. OG type: `"product"`. See Task 001 Metadata Strategy Decision.

## Verification

```bash
pnpm test -- src/app/[locale]/products/[market]/[family]/__tests__/family-page.test.tsx
# Expected: ALL TESTS PASS (Green phase)
pnpm type-check
```

# Task 006: Product Family Page — Test (Red)

**type**: test
**depends-on**: ["001"]

## BDD Scenario

```gherkin
Scenario: User navigates to a product family page
  Given the user is on /en/products/north-america/
  When they click on "Conduit Sweeps & Elbows"
  Then they are navigated to /en/products/north-america/conduit-sweeps-elbows/
  And they see a breadcrumb: Home > Products > UL / ASTM Series > Conduit Sweeps & Elbows
  And they see the product family heading and description
  And they see an inquiry CTA

Scenario: Invalid market-family combination returns 404
  Given the user navigates to /en/products/north-america/bellmouths/
  Then they see the 404 page
  Because bellmouths only exists in the australia-new-zealand market

Scenario: Valid market-family combination renders correctly
  Given the user navigates to /en/products/australia-new-zealand/bellmouths/
  Then the page renders with the Bellmouths family information

Scenario: Family page shows three-level breadcrumb
  Given the user is on /en/products/north-america/conduit-sweeps-elbows/
  Then the breadcrumb shows: Home > Products > UL / ASTM Series > Conduit Sweeps & Elbows (current)
  And "Products" links to /en/products/
  And "UL / ASTM Series" links to /en/products/north-america/

Scenario: Products pages work in both locales
  Given the user navigates to /zh/products/north-america/conduit-sweeps-elbows/
  Then the page renders in Chinese locale context
```

## Files to Create

| File | Action |
|------|--------|
| `src/app/[locale]/products/[market]/[family]/__tests__/family-page.test.tsx` | CREATE |

## Steps

1. Write test: valid family renders heading, description, and inquiry CTA link to /contact
2. Write test: invalid market-family combo (north-america + bellmouths) triggers notFound()
3. Write test: valid AU-only family (australia-new-zealand + bellmouths) renders correctly
4. Write test: breadcrumb renders all 3 levels with correct links
5. Write test: page works with zh locale

## Verification

```bash
pnpm test -- src/app/[locale]/products/[market]/[family]/__tests__/family-page.test.tsx
# Expected: ALL TESTS FAIL (Red phase — page does not exist)
```

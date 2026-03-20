# Task 002: Catalog Breadcrumb — Test (Red)

**type**: test
**depends-on**: ["001"]

## BDD Scenario

```gherkin
Scenario: Products overview has minimal breadcrumb
  Given the user is on /en/products/
  Then the breadcrumb shows: Home > Products (current)

Scenario: Market page shows two-level breadcrumb
  Given the user is on /en/products/north-america/
  Then the breadcrumb shows: Home > Products > UL / ASTM Series (current)
  And "Products" is a link to /en/products/

Scenario: Family page shows three-level breadcrumb
  Given the user is on /en/products/north-america/conduit-sweeps-elbows/
  Then the breadcrumb shows: Home > Products > UL / ASTM Series > Conduit Sweeps & Elbows (current)
  And "Products" links to /en/products/
  And "UL / ASTM Series" links to /en/products/north-america/
```

## Files to Create

| File | Action |
|------|--------|
| `src/components/products/__tests__/catalog-breadcrumb.test.tsx` | CREATE |

## Steps

1. Write test for products-overview breadcrumb: renders "Home > Products", Products is current (no link)
2. Write test for market-level breadcrumb: renders "Home > Products > {market.label}", Products links to /products/
3. Write test for family-level breadcrumb: renders all 3 levels, Products and market are links, family is current
4. Write test for breadcrumb with no market/family props: renders minimal breadcrumb
5. Write test: breadcrumb renders JSON-LD `BreadcrumbList` structured data with correct `@type`, `itemListElement`, `position`, `name`, and `item` URL for each level

## Verification

```bash
pnpm test -- src/components/products/__tests__/catalog-breadcrumb.test.tsx
# Expected: ALL TESTS FAIL (Red phase — component does not exist yet)
```

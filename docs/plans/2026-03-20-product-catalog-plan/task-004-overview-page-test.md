# Task 004: Products Overview Page — Test (Red)

**type**: test
**depends-on**: ["001"]

## BDD Scenario

```gherkin
Scenario: User views products overview page
  Given the user navigates to /en/products/
  Then they see 5 market series cards:
    | Label                  |
    | UL / ASTM Series       |
    | AS/NZS 2053 Series     |
    | NOM Series             |
    | IEC Series             |
    | PETG Pneumatic Tubes   |
  And each card links to its market landing page

Scenario: Products overview has minimal breadcrumb
  Given the user is on /en/products/
  Then the breadcrumb shows: Home > Products (current)
```

## Files to Modify

| File | Action |
|------|--------|
| `src/app/[locale]/products/__tests__/page.test.tsx` | REWRITE — replace existing MDX-based tests with catalog-based tests |

## Steps

1. Rewrite existing test file (do NOT create a separate parallel test file)
2. Remove all MDX product mocks (`getAllProductsCached`, `getProductCategoriesCached`, etc.)
3. Write test: page renders 5 market series cards with correct labels
4. Write test: each card links to correct market URL (/products/north-america, etc.)
5. Write test: breadcrumb shows "Home > Products"

## Verification

```bash
pnpm test -- src/app/[locale]/products/__tests__/page.test.tsx
# Expected: TESTS FAIL (Red phase — page not yet rewritten)
```

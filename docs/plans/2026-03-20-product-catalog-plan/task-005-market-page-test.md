# Task 005: Market Landing Page — Test (Red)

**type**: test
**depends-on**: ["001"]

## BDD Scenario

```gherkin
Scenario: User navigates to a market series
  Given the user clicks on "UL / ASTM Series"
  Then they are navigated to /en/products/north-america/
  And they see a breadcrumb: Home > Products > UL / ASTM Series
  And they see 3 product family cards:
    | Label                      |
    | Conduit Sweeps & Elbows    |
    | Couplings                  |
    | Conduit Pipes              |

Scenario: User navigates to AU market with unique product
  Given the user clicks on "AS/NZS 2053 Series"
  Then they are navigated to /en/products/australia-new-zealand/
  And they see 4 product family cards including "Bellmouths"

Scenario: Invalid market slug returns 404
  Given the user navigates to /en/products/invalid-market/
  Then they see the 404 page

Scenario: Market page shows two-level breadcrumb
  Given the user is on /en/products/north-america/
  Then the breadcrumb shows: Home > Products > UL / ASTM Series (current)
  And "Products" is a link to /en/products/
```

## Files to Create

| File | Action |
|------|--------|
| `src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx` | CREATE |

## Steps

1. Write test: north-america market renders 3 family cards with correct labels
2. Write test: australia-new-zealand market renders 4 family cards including Bellmouths
3. Write test: invalid market slug triggers notFound()
4. Write test: breadcrumb renders market label with Products as link

## Verification

```bash
pnpm test -- src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx
# Expected: ALL TESTS FAIL (Red phase — page does not exist)
```

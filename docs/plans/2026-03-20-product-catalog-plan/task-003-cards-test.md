# Task 003: Market Series Card + Family Card — Test (Red)

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

Scenario: User navigates to a market series
  Given the user clicks on "UL / ASTM Series"
  Then they see 3 product family cards:
    | Label                      |
    | Conduit Sweeps & Elbows    |
    | Couplings                  |
    | Conduit Pipes              |
```

## Files to Create

| File | Action |
|------|--------|
| `src/components/products/__tests__/market-series-card.test.tsx` | CREATE |
| `src/components/products/__tests__/family-card.test.tsx` | CREATE |

## Steps

1. Write MarketSeriesCard test: renders market label, standard badge, family count, links to /products/{slug}
2. Write FamilyCard test: renders family label, description, links to /products/{marketSlug}/{familySlug}

## Verification

```bash
pnpm test -- src/components/products/__tests__/market-series-card.test.tsx src/components/products/__tests__/family-card.test.tsx
# Expected: ALL TESTS FAIL (Red phase)
```

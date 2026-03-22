# Task 003: Market Series Card + Family Card — Implementation (Green)

**type**: impl
**depends-on**: ["003-cards-test"]

## Files to Create

| File | Action |
|------|--------|
| `src/components/products/market-series-card.tsx` | CREATE |
| `src/components/products/family-card.tsx` | CREATE |
| `src/components/products/index.ts` | MODIFY (add re-exports) |

## Steps

1. Create `MarketSeriesCard` Server Component:
   - Props: market definition, family count, locale
   - Renders: standard label badge, market name (h2), description, family count, link to market page
   - Uses shadow-card system from globals.css

2. Create `FamilyCard` Server Component:
   - Props: family definition, market slug, locale
   - Renders: family name (h2), description, placeholder icon, link to family page
   - Uses shadow-card system

3. Update `src/components/products/index.ts` with new re-exports

## Verification

```bash
pnpm test -- src/components/products/__tests__/market-series-card.test.tsx src/components/products/__tests__/family-card.test.tsx
# Expected: ALL TESTS PASS (Green phase)
pnpm type-check
```

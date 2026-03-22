# Task 002: Catalog Breadcrumb — Implementation (Green)

**type**: impl
**depends-on**: ["002-breadcrumb-test"]

## Files to Create

| File | Action |
|------|--------|
| `src/components/products/catalog-breadcrumb.tsx` | CREATE |
| `src/components/products/index.ts` | MODIFY (add re-export) |

## Steps

1. Create `CatalogBreadcrumb` Server Component that accepts optional `market` and `family` props
2. Use existing shadcn/ui `Breadcrumb` components from `src/components/ui/breadcrumb.tsx`
3. Build breadcrumb items conditionally:
   - Always: Home (link) > Products (link or current)
   - If market: > market.label (link or current)
   - If family: > family.label (current)
4. Use `Link` from `@/i18n/routing` for locale-aware URLs
5. Render a `<script type="application/ld+json">` block with JSON-LD `BreadcrumbList` schema:
   - Build `itemListElement` array matching the visible breadcrumb levels
   - Each item: `@type: "ListItem"`, `position`, `name`, `item` (absolute URL)
   - Use `SITE_CONFIG.baseUrl` for absolute URL construction
6. Add re-export in `src/components/products/index.ts`

## Verification

```bash
pnpm test -- src/components/products/__tests__/catalog-breadcrumb.test.tsx
# Expected: ALL TESTS PASS (Green phase)
pnpm type-check
```

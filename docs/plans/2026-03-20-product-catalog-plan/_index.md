# Implementation Plan: Product Catalog Page Structure

> Date: 2026-03-20
> Historical design package retired from the live docs surface; use this plan plus `docs/plans/2026-03-20-product-catalog-architecture.md` as the active reference.
> Architecture: `docs/plans/2026-03-20-product-catalog-architecture.md`
> Status: Ready for execution (v2 — post-Codex audit)

## Goal

Implement the product catalog route structure with dynamic `[market]/[family]` routes, driven by configuration constants. Deliver basic usable pages with breadcrumb navigation, market series cards, family cards, and spec table placeholders.

## Constraints

- Next.js 16 App Router + next-intl
- Server Components only (no "use client")
- TypeScript strict mode
- **Legacy `/products/[slug]` must be fully removed first** (App Router cannot have `[slug]` and `[market]` at the same level)
- All pages statically generated at build time
- No real product data — placeholder content only
- Site not indexed — no 301 redirects needed for removed URLs

## Execution Plan

```yaml
tasks:
  - id: "000"
    subject: "Legacy Product Route Cleanup"
    slug: "legacy-cleanup"
    type: "cleanup"
    depends-on: []
  - id: "001"
    subject: "Catalog Config + Route Config Setup"
    slug: "catalog-config-setup"
    type: "setup"
    depends-on: ["000"]
  - id: "002-test"
    subject: "Catalog Breadcrumb Test"
    slug: "breadcrumb-test"
    type: "test"
    depends-on: ["001"]
  - id: "002-impl"
    subject: "Catalog Breadcrumb Implementation"
    slug: "breadcrumb-impl"
    type: "impl"
    depends-on: ["002-test"]
  - id: "003-test"
    subject: "Market Series Card + Family Card Test"
    slug: "cards-test"
    type: "test"
    depends-on: ["001"]
  - id: "003-impl"
    subject: "Market Series Card + Family Card Implementation"
    slug: "cards-impl"
    type: "impl"
    depends-on: ["003-test"]
  - id: "004-test"
    subject: "Products Overview Page Test"
    slug: "overview-page-test"
    type: "test"
    depends-on: ["001"]
  - id: "004-impl"
    subject: "Products Overview Page Implementation"
    slug: "overview-page-impl"
    type: "impl"
    depends-on: ["004-test", "002-impl", "003-impl"]
  - id: "005-test"
    subject: "Market Landing Page Test"
    slug: "market-page-test"
    type: "test"
    depends-on: ["001"]
  - id: "005-impl"
    subject: "Market Landing Page Implementation"
    slug: "market-page-impl"
    type: "impl"
    depends-on: ["005-test", "002-impl", "003-impl"]
  - id: "006-test"
    subject: "Product Family Page Test"
    slug: "family-page-test"
    type: "test"
    depends-on: ["001"]
  - id: "006-impl"
    subject: "Product Family Page Implementation"
    slug: "family-page-impl"
    type: "impl"
    depends-on: ["006-test", "002-impl"]
  - id: "007"
    subject: "Integration Validation"
    slug: "integration-validation"
    type: "integration"
    depends-on: ["004-impl", "005-impl", "006-impl"]
```

## Task File References

- [Task 000: Legacy Cleanup](./task-000-legacy-cleanup.md)
- [Task 001: Catalog Config Setup](./task-001-catalog-config-setup.md)
- [Task 002: Breadcrumb Test (Red)](./task-002-breadcrumb-test.md)
- [Task 002: Breadcrumb Implementation (Green)](./task-002-breadcrumb-impl.md)
- [Task 003: Cards Test (Red)](./task-003-cards-test.md)
- [Task 003: Cards Implementation (Green)](./task-003-cards-impl.md)
- [Task 004: Overview Page Test (Red)](./task-004-overview-page-test.md)
- [Task 004: Overview Page Implementation (Green)](./task-004-overview-page-impl.md)
- [Task 005: Market Landing Page Test (Red)](./task-005-market-page-test.md)
- [Task 005: Market Landing Page Implementation (Green)](./task-005-market-page-impl.md)
- [Task 006: Family Page Test (Red)](./task-006-family-page-test.md)
- [Task 006: Family Page Implementation (Green)](./task-006-family-page-impl.md)
- [Task 007: Integration Validation](./task-007-integration-validation.md)

## BDD Coverage

| BDD Scenario | Task(s) |
|-------------|---------|
| User views products overview page | 004-test, 004-impl |
| User navigates to a market series | 005-test, 005-impl |
| User navigates to AU market with unique product | 005-test, 005-impl |
| User navigates to a product family page | 006-test, 006-impl |
| Invalid market slug returns 404 | 005-test, 005-impl |
| Invalid market-family combination returns 404 | 006-test, 006-impl |
| Valid market-family combination renders correctly | 006-test, 006-impl |
| Legacy product detail routes are removed | 000, 007 |
| Products pages work in both locales | 006-test, 007 |
| Locale switching preserves route | 007 |
| All market pages are statically generated | 007 |
| All family pages are statically generated | 007 |
| Products overview has minimal breadcrumb | 002-test, 004-test |
| Market page shows two-level breadcrumb | 002-test, 005-test |
| Family page shows three-level breadcrumb | 002-test, 006-test |

All 15 BDD scenarios covered. No orphaned scenarios.

## Dependency Chain

```
000 (legacy cleanup)
 └── 001 (config setup)
      ├── 002-test (breadcrumb) ──→ 002-impl
      ├── 003-test (cards) ──→ 003-impl
      ├── 004-test (overview) ──→ 004-impl ←── 002-impl + 003-impl
      ├── 005-test (market) ──→ 005-impl ←── 002-impl + 003-impl
      └── 006-test (family) ──→ 006-impl ←── 002-impl
                                               ↓
                                   007 (integration) ←── 004-impl + 005-impl + 006-impl
```

**Parallelizable groups after 001**:
- Group A: 002-test, 003-test, 004-test, 005-test, 006-test (all independent tests)
- Group B: 002-impl, 003-impl (independent component implementations)
- Group C: 004-impl, 005-impl, 006-impl (page implementations, depend on Group B)
- Final: 007 (integration, depends on all of Group C)

## Key Changes from v1

| Issue | v1 (original) | v2 (current) |
|-------|--------------|--------------|
| Route collision | Assumed `[slug]` + `[market]` could coexist | Task 000 deletes `[slug]` first |
| Legacy route test | "Legacy route must still work" | "Legacy route must NOT exist" |
| Old MDX content | Not addressed | Moved to `content/_archive/products/` |
| productDetail config | Not cleaned up | Removed from types/paths/routing |
| Sitemap | Not addressed | Product entries removed in 000, catalog entries added in 007 |
| route-parsing.ts | Not addressed | Old pattern removed in 000, new patterns added in 001 |
| Breadcrumb JSON-LD | Not included | Added to Task 002 |
| Overview page test | CREATE new test file | REWRITE existing test file |
| Overview page impl | MODIFY existing page | REWRITE existing page |

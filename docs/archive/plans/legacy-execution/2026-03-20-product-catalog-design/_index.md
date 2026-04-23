# Product Catalog Page Structure — Design

> Date: 2026-03-20
> Status: Design complete, pending implementation
> Scope: Route skeleton + basic usable pages

## Context

Tianze needs product catalog pages to support 4 market standards (UL/ASTM, AS/NZS 2053, NOM, IEC) plus PETG pneumatic tubes. The catalog structure was decided through a 4-source cross-validated research process documented in `docs/impeccable/products/CATALOG-STRUCTURE.md`.

## Requirements

1. **Route structure**: Dynamic routes `[market]/[family]` driven by configuration constants
2. **Page types**: Products overview → Market series landing → Product family page
3. **Navigation**: Breadcrumb trail at each level, market series cards on overview
4. **Validation**: 404 for invalid market/family combinations
5. **i18n**: Both en/zh locales, URL segments stay English
6. **Static generation**: All pages pre-rendered at build time
7. **Compatibility**: Coexist with existing `/products/[slug]` MDX product routes

## Rationale

- **Standard-first classification**: Tianze's customers are distributors who procure by compliance standard, not end-users browsing by product type
- **Dynamic routes over static folders**: Adding a market = config change, not file creation
- **Config constants over MDX**: Market/family structure is stable infrastructure, not content
- **Separate from content layer**: Catalog config is navigation; product data integration is Phase 2

## Detailed Design

- Full architecture: `docs/plans/2026-03-20-product-catalog-architecture.md`
- Implementation: 11 files, ordered by dependency

## Design Documents

- [BDD Specifications](./bdd-specs.md) - Behavior scenarios and testing strategy
- [Architecture](./architecture.md) - System architecture and component details
- [Best Practices](./best-practices.md) - Security, performance, and code quality guidelines

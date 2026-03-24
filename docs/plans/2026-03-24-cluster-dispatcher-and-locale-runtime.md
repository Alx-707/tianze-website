# Cluster Dispatcher And Locale Runtime Operationalization

## Objective
Reduce repeated cluster automation logic and elevate the locale runtime path into an explicit structural review surface.

## Completed Work

### Shared Cluster Dispatcher
- Added:
  - [run-cluster-review.js](/Users/Data/Warehouse/Pipe/tianze-website/scripts/run-cluster-review.js)
- Updated `lefthook.yml` to route cluster checks through the shared dispatcher for:
  - translation quartet
  - lead API family
  - homepage section cluster

### Locale Runtime Surface
- Added contract:
  - [LOCALE-RUNTIME-CONTRACT.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/LOCALE-RUNTIME-CONTRACT.md)
- Added review entrypoint:
  - `pnpm review:locale-runtime`
- Reused existing regression assets:
  - `tests/unit/middleware.test.ts`
  - `src/__tests__/middleware-locale-cookie.test.ts`
  - `src/i18n/__tests__/request.test.ts`
  - `src/lib/__tests__/load-messages.fallback.test.ts`

## Validation
- `pnpm review:cluster lead-family`
  - 2 files passed
  - 10 tests passed
- `pnpm review:locale-runtime`
  - 4 files passed
  - 23 tests passed

## Result
- Cluster review automation is less repetitive and easier to extend.
- Middleware / locale / i18n runtime is now an explicit review surface instead of a loosely connected set of critical files.

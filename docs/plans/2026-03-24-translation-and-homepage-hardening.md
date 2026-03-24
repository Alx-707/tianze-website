# Translation And Homepage Hardening

## Objective
Push beyond workflow wiring and reduce residual structural drift in:
- the translation quartet
- the homepage section cluster

## Completed Work

### Translation Quartet
- Added flat regeneration script:
  - [regenerate-flat-translations.js](/Users/Data/Warehouse/Pipe/tianze-website/scripts/regenerate-flat-translations.js)
- Added command:
  - `pnpm i18n:regenerate-flat`
- Updated:
  - `pnpm review:translation-quartet`
  - now regenerates flat compatibility artifacts before validation
- Updated contract:
  - [TRANSLATION-QUARTET-CONTRACT.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/TRANSLATION-QUARTET-CONTRACT.md)

### Homepage Section Cluster
- Added cluster contract regression test:
  - [homepage-cluster-contract.test.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/components/sections/__tests__/homepage-cluster-contract.test.tsx)
- Updated review entry:
  - `pnpm review:homepage-sections`
  - now includes the cluster contract test in addition to per-section tests

## Validation
- `pnpm review:translation-quartet`
  - passed
- `pnpm review:homepage-sections`
  - 7 files passed
  - 32 tests passed

## Result
- Translation quartet is now closer to a true generated-flow model, not just a documented co-change cluster.
- Homepage section cluster is now protected by both component-level tests and cluster-level contract coverage.

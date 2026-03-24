# Notes: Runtime Surface And Cluster Framework Expansion

## Objectives
- extend the structural framework to more runtime-critical surfaces
- keep the automation/review model reusable instead of bespoke

## Current Understanding
- The dispatcher was flexible enough to absorb more structural objects.
- `locale runtime` and `cache invalidation + health` were the next most valuable runtime surfaces.

## Changes Applied
- Added locale runtime contract:
  - `docs/guides/LOCALE-RUNTIME-CONTRACT.md`
- Added cache/health contract:
  - `docs/guides/CACHE-HEALTH-CONTRACT.md`
- Added review entrypoint:
  - `pnpm review:cache-health`
- Extended shared dispatcher to support:
  - `locale-runtime`
  - `cache-health`
- Updated:
  - `docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md`
  - `package.json`
  - `scripts/run-cluster-review.js`

## Validation
- `pnpm review:locale-runtime`
- Result: `4` files passed, `23` tests passed
- `pnpm review:cache-health`
- Result: `2` files passed, `6` tests passed
- `pnpm review:cluster locale-runtime`
- Result: `4` files passed, `23` tests passed

## Outcome
- The structural framework now covers another critical runtime surface without growing a second automation style.
- Cache invalidation and health signals are now treated as a first-class structural review object.

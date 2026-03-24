# Cluster Automation And Homepage Operationalization

## Objective
Move structural clusters from passive documentation into executable review and automation paths.

## Completed Work

### Lead API Family
- Review entrypoint:
  - `pnpm review:lead-family`
- Wired into:
  - `package.json`
  - `lefthook.yml`
  - `.claude/rules/review-checklist.md`
  - `.github/workflows/ci.yml`

### Translation Quartet
- Review entrypoint:
  - `pnpm review:translation-quartet`
- Wired into:
  - `package.json`
  - `lefthook.yml`
  - `.claude/rules/review-checklist.md`
  - `.github/workflows/ci.yml`

### Homepage Section Cluster
- Contract document:
  - [HOMEPAGE-SECTION-CLUSTER-CONTRACT.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/HOMEPAGE-SECTION-CLUSTER-CONTRACT.md)
- Review entrypoint:
  - `pnpm review:homepage-sections`
- Wired into:
  - `package.json`
  - `lefthook.yml`
  - `.claude/rules/review-checklist.md`
  - `.github/workflows/ci.yml`
  - `docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md`

## Validation
- `pnpm review:lead-family` → 2 files passed, 10 tests passed
- `pnpm review:translation-quartet` → validation + copy + shape parity passed
- `pnpm review:homepage-sections` → 6 files passed, 30 tests passed

## Result
The repository now has three high-value structural clusters that are:
- explicitly documented
- executable through review commands
- referenced in reviewer guidance
- partially integrated into automation paths

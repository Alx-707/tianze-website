# Performance Dormant Truth Audit (2026-04-15)

## Purpose

This document records the dormant-component truth audit for the performance-governance workstream.

This is **not** a cleanup plan.
It exists to answer one narrower question first:

- which components are part of current runtime truth
- which are mainly kept alive by tests or stale docs
- which still need document sync before any cleanup lane can make a safe decision

## Audit Dimensions

Each target was checked against four evidence dimensions:

1. production/runtime references under `src/**`
2. test-only references under `__tests__` / `tests/**`
3. documentation references under `docs/**`
4. indirect references such as barrels, registry, MDX, or loader-like surfaces

## Classification Legend

- `retire-to-trash`: no current production/runtime evidence; cleanup lane can consider removal after routine doc sync
- `needs-followup`: not part of current runtime truth, but active docs still create ambiguity that should be resolved before cleanup
- `retain-governed`: current runtime evidence exists; do not treat as dormant cleanup candidates

## Results

### 1. `HeroProofCounter`

- File: `src/components/sections/hero-proof-counter.tsx`
- Production/runtime evidence:
  - only self-definition found in `src/components/sections/hero-proof-counter.tsx`
  - no other non-test `src/**` references found
- Test evidence:
  - none found
- Documentation evidence:
  - none found
- Indirect evidence:
  - no barrel, MDX, manifest, or loader references found

**Classification:** `retire-to-trash`

Reason:

- this component currently has no runtime consumer, no test consumer, and no active doc surface keeping it as current truth

### 2. `TrustStats`

- File: `src/components/trust/trust-stats.tsx`
- Production/runtime evidence:
  - only self-definition found in `src/components/trust/trust-stats.tsx`
  - no other non-test `src/**` references found
- Test evidence:
  - `src/components/trust/__tests__/trust-stats.test.tsx`
- Documentation evidence:
  - `docs/component-registry.md` had been presenting it as current Homepage truth before this workstream corrected the live registry
- Indirect evidence:
  - no barrel / MDX / loader references found

**Classification:** `retire-to-trash`

Reason:

- current repo evidence says this is not in the active runtime
- the only active-document ambiguity was the live registry, and this workstream corrects that surface

### 3. `TechTabsBlock`

- File: `src/components/blocks/tech/tech-tabs-block.tsx`
- Production/runtime evidence:
  - only self-definition found in `src/components/blocks/tech/tech-tabs-block.tsx`
  - no other non-test `src/**` references found
- Test evidence:
  - `src/components/blocks/tech/__tests__/tech-tabs-block.test.tsx`
- Documentation evidence:
  - `docs/guides/BROWSER-TRANSLATION-COMPATIBILITY.md`
  - `docs/guides/template-usage.md`
- Indirect evidence:
  - no barrel / MDX / loader references found

**Classification:** `needs-followup`

Reason:

- this component is not part of current runtime truth
- but active guides still mention it, so cleanup should not jump ahead before document intent is clarified

### 4. `FeaturesGridBlock`

- File: `src/components/blocks/features/features-grid-block.tsx`
- Production/runtime evidence:
  - only self-definition found in `src/components/blocks/features/features-grid-block.tsx`
  - no other non-test `src/**` references found
- Test evidence:
  - `src/components/blocks/features/__tests__/features-grid-block.test.tsx`
- Documentation evidence:
  - `docs/guides/template-usage.md`
  - multiple historical plan references under `docs/plans/**`
- Indirect evidence:
  - no barrel / MDX / loader references found

**Classification:** `needs-followup`

Reason:

- this component does not appear in current runtime paths
- but active guidance still names the file directly, so cleanup should wait until document intent is explicitly downgraded or synced

### 5. `ProductMatrixBlock`

- File: `src/components/blocks/products/product-matrix-block.tsx`
- Production/runtime evidence:
  - only self-definition found in `src/components/blocks/products/product-matrix-block.tsx`
  - no other non-test `src/**` references found
- Test evidence:
  - `src/components/blocks/products/__tests__/product-matrix-block.test.tsx`
- Documentation evidence:
  - `docs/component-registry.md` had been presenting it as current Homepage truth before this workstream corrected the live registry
  - `docs/superpowers/specs/2026-03-23-product-pages-design.md` explicitly says it is a legacy component and is not consumed by the current homepage
  - historical plan references exist under `docs/plans/**`
- Indirect evidence:
  - no barrel / MDX / loader references found

**Classification:** `retire-to-trash`

Reason:

- runtime evidence says it is dormant
- the live registry conflict is resolved in this workstream, and the remaining spec evidence already describes it as legacy and unused

## Current Decision Boundary

The audit does **not** authorize broad cleanup yet.

What it does authorize:

- treat `HeroProofCounter`, `TrustStats`, and `ProductMatrixBlock` as current `retire-to-trash` candidates
- treat `TechTabsBlock` and `FeaturesGridBlock` as dormant in runtime, but not fully decision-clean until active-doc ambiguity is reduced

## Minimal Doc Sync Performed In This Workstream

- `docs/component-registry.md` has been updated where it was presenting `TrustStats`, `AnimatedStatItem`, `ProductMatrixBlock`, and the legacy homepage ProductCard entry as current or recommended Homepage truth

## Suggested Next Step

If the cleanup lane is opened later:

1. only start with objects already classified `retire-to-trash`
2. resolve remaining active-doc ambiguity for `TechTabsBlock` and `FeaturesGridBlock` first
3. keep the eventual cleanup lane reversible until it records the exact repo-removal mechanics

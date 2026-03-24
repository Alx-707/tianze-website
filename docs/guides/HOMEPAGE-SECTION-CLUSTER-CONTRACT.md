# Homepage Section Cluster Contract

## Scope
This contract covers the homepage section cluster:
- `src/components/sections/hero-section.tsx`
- `src/components/sections/products-section.tsx`
- `src/components/sections/final-cta.tsx`
- `src/components/sections/sample-cta.tsx`
- `src/components/sections/resources-section.tsx`
- `src/components/sections/scenarios-section.tsx`

## Purpose
These sections are a known co-change cluster. This file defines the minimum structural expectations reviewers should preserve when this cluster changes.

## Shared Expectations

### 1. Section Roles Must Stay Clear
- `hero` owns first impression and primary CTA framing
- `products` owns product discovery framing
- `resources` owns supporting knowledge/next-step content
- `sample/final CTA` own conversion reinforcement
- `scenarios` owns application-context explanation

### 2. Shared Structure Should Stay Centralized
- Shared section chrome belongs in `src/components/sections/homepage-section-shell.tsx`, not repeated across individual sections.
- Shared CTA destinations belong in `src/components/sections/homepage-section-links.ts` so hero, product, sample, and final CTA links stay aligned.

### 3. CTA Hierarchy Must Remain Intentional
- Primary CTA emphasis should not become ambiguous across hero/final/sample CTA sections.
- Section changes should not accidentally produce duplicate competing primaries without deliberate decision.

### 4. Proof / Trust Rhythm Must Stay Coherent
- Homepage proof elements should remain structurally consistent across the cluster.
- Changes to proof density in one section should be reviewed in neighboring sections, not treated as isolated polish.
- Inline proof / trust copy should use the shared list-based strip contract in `src/components/sections/homepage-trust-strip.tsx` rather than bespoke span stacks.
- Hero owns the strongest proof strip; final CTA owns the closing trust strip. Their shared structure is intentional and should stay queryable in tests.

### 5. Review as One Cluster
If one cluster file changes materially:
- inspect the other cluster files for hierarchy drift
- run the cluster review command

## Review Command

```bash
pnpm review:homepage-sections
```

## Regression Coverage
- Existing section tests under `src/components/sections/__tests__/`
- Aggregated via `pnpm review:homepage-sections`

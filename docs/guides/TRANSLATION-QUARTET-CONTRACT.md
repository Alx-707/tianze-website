# Translation Quartet Contract

## Scope
This contract covers the runtime-facing translation quartet and its generated views:
- Split canonical source: `messages/{locale}/critical.json` and `messages/{locale}/deferred.json`
- Flat compatibility view: `messages/{locale}.json`
- Runtime copy: `public/messages/{locale}/critical.json` and `public/messages/{locale}/deferred.json`

## Purpose
These files are the strongest logical-coupling cluster in the repository.
This file makes the source/generated/runtime roles explicit so humans do not have to infer them from implementation details.

## Shared Rules

### 1. Review by Role, Not by Filename
If split source changes, inspect the derived flat file and the copied public runtime bundles.
If only the flat file changes, regenerate it from split source rather than editing it by hand.

### 2. Split Is Canonical
- Runtime critical paths depend on the split files under `messages/{locale}/`.
- `messages/{locale}.json` is a generated compatibility view, not an input source.
- `public/messages/{locale}/` is a copied runtime bundle that must match the split source.

### 3. Expected Validation Path
For quartet changes, run:

```bash
pnpm review:translation-quartet
```

This validates:
- regenerated flat compatibility artifacts
- translation key consistency across split source
- copied public runtime bundles
- split/flat/public shape parity

### 4. Responsibility Split
- `scripts/translation-flat-utils.js`: owns shared split/flat paths, nested-path traversal, and nested read/write helpers.
- `scripts/regenerate-flat-translations.js`: derive flat from split only.
- `scripts/translation-sync.js`: read and update split source, then regenerate flat as a side effect.
- `scripts/validate-translations.js`: validate split completeness and locale symmetry using shared leaf traversal.
- `scripts/i18n-shape-check.js`: compare split source against public and flat generated views using the same shared traversal primitives.

### 5. Runtime-Facing Risk
Quartet changes can affect:
- first-screen copy
- error-code translation behavior
- locale-specific SSR/runtime semantics

### 6. Proof Level
- Ordinary quartet edits: at least `local-full proof`
- Quartet edits affecting Tier A runtime behavior: follow the Tier A proof rules

## Related Files
- [`QUALITY-PROOF-LEVELS.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [`STRUCTURAL-CHANGE-CLUSTERS.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md)

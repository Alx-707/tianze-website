# Translation Quartet Contract

## Scope
This contract covers the runtime-facing translation quartet:
- `messages/en.json`
- `messages/zh.json`
- `messages/en/critical.json`
- `messages/zh/critical.json`

## Purpose
These four files are the strongest logical-coupling cluster in the repository.
This file makes their shared review and proof expectations explicit.

## Shared Rules

### 1. Review as One Structural Unit
If one file in the quartet changes, inspect all four.

### 2. Split Runtime Source Matters
- Runtime critical paths depend on the split files under `messages/{locale}/`.
- Flat files at `messages/{locale}.json` are compatibility/generated views, not the only runtime truth.

### 3. Expected Validation Path
For quartet changes, run:

```bash
pnpm review:translation-quartet
```

This validates:
- regenerated flat compatibility artifacts
- translation key consistency
- copied public runtime bundles
- split/flat/public shape parity

### 4. Runtime-Facing Risk
Quartet changes can affect:
- first-screen copy
- error-code translation behavior
- locale-specific SSR/runtime semantics

### 5. Proof Level
- Ordinary quartet edits: at least `local-full proof`
- Quartet edits affecting Tier A runtime behavior: follow the Tier A proof rules

## Related Files
- [`QUALITY-PROOF-LEVELS.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [`STRUCTURAL-CHANGE-CLUSTERS.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md)

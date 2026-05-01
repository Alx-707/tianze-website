# Hotspot Slimming Register

This is a candidate register, not permission to refactor immediately.

## Source

- Generated at: 2026-05-01T13:34:44.126Z
- Input: `reports/architecture/structural-hotspots-latest.json`
- Ranking formula: metric value x real file lines
- Top candidates: 5
- Current-tree filter: skipped 1 structural hotspot paths that no longer exist in this checkout.

## Non-negotiable rule

> No behavior change is allowed without a failing characterization test.

Use each row as a slimming plan: prove current behavior first, make one small extraction, then rerun the narrow proof before touching the next seam.

## Candidates

| Rank | File | Change touches | Lines | Score | Slimming plan |
|---:|---|---:|---:|---:|---|
| 1 | `scripts/quality-gate.js` | 17 | 2033 | 34561 | Characterize current behavior first, then extract one small seam around scripts/quality-gate.js. |
| 2 | `src/app/globals.css` | 16 | 863 | 13808 | Characterize current behavior first, then extract one small seam around src/app/globals.css. |
| 3 | `src/lib/idempotency.ts` | 14 | 480 | 6720 | Characterize current behavior first, then extract one small seam around src/lib/idempotency.ts. |
| 4 | `src/app/[locale]/layout.tsx` | 18 | 200 | 3600 | Characterize current behavior first, then extract one small seam around src/app/[locale]/layout.tsx. |
| 5 | `src/app/api/inquiry/route.ts` | 15 | 231 | 3465 | Characterize current behavior first, then extract one small seam around src/app/api/inquiry/route.ts. |

## Metric notes

- Change touches: sourced from `summary.hotspots[].commits`.
- Change touches are commit touch counts, not cyclomatic complexity or proof of bad code.
- Lines are real file line counts for structural-hotspots input; flat input may provide lines for future complexity tooling tests.
- Structural history can contain deleted or renamed files; those paths are excluded because this register is for current files only.
- Score is only a prioritization aid. Final work order still needs characterization-test coverage and owner judgment.

## Working sequence

1. Pick one candidate and write a failing characterization test for the behavior that must not change.
2. Extract one small helper, adapter, or presenter seam.
3. Rerun the focused test and the smallest relevant quality check.
4. Stop if the proof is unclear; do not batch-refactor the whole file.

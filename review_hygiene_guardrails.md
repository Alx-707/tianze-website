# Review Hygiene Guardrails

## Goal
Turn the repeated cleanup patterns from CR-085 through CR-089 into a reusable guardrail instead of continuing purely manual scans.

## What was added
- `scripts/check-review-hygiene.js`
- `pnpm review:hygiene`
- `scripts/quality-gate.js` integration under the code-quality gate

## What the guard checks
- Top-level production-namespace entrypoints under:
  - `src/lib/*.ts`
  - `src/types/*.ts`
  - `src/config/*.ts`
- It flags two cases:
  - zero-consumer top-level entrypoints
  - top-level entrypoints only consumed by tests

## How it works
- Scans `src/` and `tests/`
- Resolves both alias imports (`@/...`) and relative imports
- Classifies consumers as production or test based on path patterns
- Ignores declaration files and generated files to avoid noise

## Verification
- `pnpm review:hygiene`
- `node scripts/quality-gate.js --mode=fast --output=json`

## Result
- The repository now has an executable guard against the same class of namespace and dead-surface regressions that previously produced CR-085 through CR-089.
- Current fast quality gate still fails because of unrelated ESLint errors elsewhere in the working tree, but the new hygiene check itself is wired in and passing.

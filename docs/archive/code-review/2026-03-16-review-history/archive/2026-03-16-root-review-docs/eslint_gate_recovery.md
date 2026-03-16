# ESLint Gate Recovery

## Goal
Restore `quality:gate:fast` to green by fixing the current blocking ESLint errors.

## Blocking files
- `src/lib/__tests__/colors-contrast-compliance.test.ts`
- `src/lib/i18n/route-parsing.ts`
- `src/lib/idempotency.ts`
- `src/test/test-types.ts`

## Fix summary
- Removed an unused test import.
- Corrected the placement of the `route-parsing` regex lint suppression.
- Refactored `withIdempotentResult` support logic into smaller helpers to satisfy complexity and statement-count rules.
- Removed stale eslint-disable comments from the relocated test types file.

## Verification
- `pnpm lint:check`
- `pnpm quality:gate:fast -- --silent`

## Result
- ESLint is green again.
- `quality:gate:fast` is green again.
- The review hygiene guardrail remains active inside the quality gate.

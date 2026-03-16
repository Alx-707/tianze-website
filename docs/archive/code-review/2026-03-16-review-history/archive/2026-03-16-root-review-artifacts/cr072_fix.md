# CR-072 Fix Summary

## Problem
The codebase still used deprecated count aliases such as `COUNT_PAIR`, `COUNT_TRIPLE`, `COUNT_QUAD`, and `COUNT_FOUR` across active production modules. This kept an old constant vocabulary alive even after the canonical count constants already existed.

## Fix
- Replaced production usage of deprecated count aliases with canonical constants:
  - `COUNT_PAIR` -> `COUNT_TWO`
  - `COUNT_TRIPLE` -> `COUNT_THREE`
  - `COUNT_QUAD` / `COUNT_FOUR` -> `COUNT_4`
- Removed the deprecated alias exports from `src/constants/count.ts` and `src/constants/index.ts`

## Verification
- `pnpm type-check`
- `pnpm exec vitest run src/config/__tests__/paths.test.ts src/lib/__tests__/structured-data.test.ts src/components/security/__tests__/turnstile.test.tsx src/lib/lead-pipeline/__tests__/utils.test.ts`

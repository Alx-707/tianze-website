# CR-081 Fix Summary

## Problem
Two legacy underscore aliases were still being kept alive:
- `_TEST_CONSTANTS` in `src/constants/test-constants.ts`
- `_Locale` in `src/types/i18n.ts`

They no longer added value and only preserved old naming shapes.

## Fix
- Removed `_TEST_CONSTANTS`
- Removed `_Locale`
- Updated the only real consumer of `_TEST_CONSTANTS` to use `TEST_CONSTANTS`

## Verification
- `pnpm exec vitest run src/lib/__tests__/colors-contrast-compliance.test.ts`
- `pnpm type-check`
- `rg -n "_TEST_CONSTANTS\\b|_Locale\\b" src tests -S`

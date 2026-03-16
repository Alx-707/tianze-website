# CR-069 Fix Summary

## Problem
`src/lib/lead-pipeline/utils.ts` still exposed a deprecated `sanitizeInput()` wrapper that had no real production consumers and was only being kept alive by its own unit tests.

## Fix
- Removed the deprecated `sanitizeInput()` wrapper from `lead-pipeline/utils.ts`
- Removed the legacy wrapper assertions from the utils test suite

## Verification
- `pnpm exec vitest run src/lib/lead-pipeline/__tests__/utils.test.ts`

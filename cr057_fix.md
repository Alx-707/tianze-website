# CR-057 Fix Summary

## Problem
`src/lib/i18n-performance.ts` still carried a fetch-based translation helper stack that was no longer the canonical runtime message loader, but it remained in a formal runtime namespace and continued to mislead the codebase about the active truth source.

## Fix
- Kept `src/lib/i18n-performance.ts` focused on monitoring/scoring responsibilities
- Moved the fetch-based translation helper stack into `src/lib/i18n-message-cache.ts`
- Updated tests to import the helper path from the new non-canonical module boundary

## Verification
- `pnpm exec vitest run src/lib/__tests__/i18n-performance.test.ts`
- `pnpm exec vitest run src/lib/__tests__/i18n-performance.network-failure.test.ts src/lib/__tests__/i18n-performance-cache.test.ts`
- `pnpm exec vitest run src/i18n/__tests__/request.test.ts`

# CR-056 Fix Summary

## Problem
`src/i18n/request.ts` was still deriving `metadata.cacheUsed` from `TranslationCache`, even though the actual runtime message path had already moved to `loadCompleteMessages(locale)`. That made request metadata report cache semantics from an obsolete seam.

## Fix
- Removed `TranslationCache` from `src/i18n/request.ts`
- Replaced the old cache-hit/miss inference with request-level load-time recording only
- Request metadata now returns `cacheUsed: false` instead of pretending to know canonical runtime cache-hit state

## Verification
- `pnpm exec vitest run src/i18n/__tests__/request.test.ts`
- `pnpm exec vitest run src/lib/__tests__/load-messages.fallback.test.ts`

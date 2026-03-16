# CR-061 Fix Summary

## Problem
After CR-056, `src/i18n/request.ts` still returned `metadata.cacheUsed`, but only as a conservative placeholder. The field no longer carried trustworthy runtime semantics and had no real production consumers.

## Fix
- Removed `cacheUsed` from the request metadata shape
- Updated the request test suite to assert the simplified metadata contract

## Verification
- `pnpm exec vitest run src/i18n/__tests__/request.test.ts`

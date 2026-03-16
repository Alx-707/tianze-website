# CR-065 Fix Summary

## Problem
`src/i18n/__tests__/request.test.ts` had drifted away from the real implementation. It still asserted removed concepts like `smartDetection`, `cacheUsed`, and `metadata.timestamp`, and module caching meant later tests were not exercising fresh module initialization.

## Fix
- Rewrote the test suite to capture and execute the real `getRequestConfig` callback per test
- Removed assertions for implementation details that no longer exist
- Added a real fallback-path check via a targeted `load-messages` mock

## Verification
- `pnpm exec vitest run src/i18n/__tests__/request.test.ts`

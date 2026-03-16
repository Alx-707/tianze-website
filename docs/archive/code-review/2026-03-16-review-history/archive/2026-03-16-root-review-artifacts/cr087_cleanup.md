# CR-087 Cleanup

## Summary
- Removed `src/lib/i18n-message-cache.ts`.
- Removed the two test files that only preserved its legacy fetch/cache behavior.
- Replaced the broad integration-style test with a smaller `i18n-performance` suite focused on the still-live monitor and scoring logic.

## Why it was safe
- The cache helper had no production consumers.
- Its exports were only imported by its own test files.
- The module itself was already documented as a legacy/test-side helper, not a production runtime source.

## Verification
- `rg -n 'i18n-message-cache|TranslationCache|getCachedMessages|getCachedTranslations|preloadTranslations' src tests`
- `pnpm exec vitest run src/lib/__tests__/i18n-performance.test.ts`
- `pnpm type-check`

## Result
- The repository no longer keeps a dead fetch-based i18n cache path alive under `src/lib/`.
- Remaining i18n performance coverage now focuses on the monitor logic that active runtime code still uses.

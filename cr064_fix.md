# CR-064 Fix Summary

## Problem
Multiple shared type files still declared their own `Locale = "en" | "zh"` unions:
- `src/config/paths/types.ts`
- `src/types/content.types.ts`
- `src/types/i18n.ts`

That kept spreading the locale list across unrelated layers instead of reusing the canonical routing source.

## Fix
- Replaced the duplicated locale unions with imports/re-exports from `src/i18n/routing-config.ts`

## Verification
- `pnpm exec vitest run src/config/__tests__/paths.test.ts`
- `pnpm exec vitest run src/lib/content/__tests__/products-source.test.ts src/lib/content/__tests__/products-wrapper.test.ts`
- `pnpm exec vitest run tests/integration/i18n-components.test.tsx`

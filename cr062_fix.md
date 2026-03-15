# CR-062 Fix Summary

## Problem
`src/lib/structured-data-types.ts` still defined its own `Locale = "en" | "zh"` union even though the canonical locale list already lives in `src/i18n/routing-config.ts`.

## Fix
- Replaced the duplicated locale union with a type re-export from `routing-config`

## Verification
- `pnpm exec vitest run src/app/[locale]/__tests__/layout-structured-data.test.ts`
- `pnpm exec vitest run src/lib/__tests__/structured-data.test.ts`

# CR-063 Fix Summary

## Problem
`src/lib/load-messages.ts` still defined its own `Locale = "en" | "zh"` union even though the canonical locale list already lives in `src/i18n/routing-config.ts` and is re-exported through `src/i18n/routing.ts`.

## Fix
- Replaced the local `Locale` union with the canonical imported `Locale` type from the routing layer

## Verification
- `pnpm exec vitest run src/lib/__tests__/load-messages.fallback.test.ts src/i18n/__tests__/request.test.ts`

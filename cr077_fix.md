# CR-077 Fix Summary

## Problem
`src/types/whatsapp-service-types.ts` still exposed dead convenience factory helpers (`createDefaultConfig`, `createDefaultServiceOptions`, `createDefaultServiceStatus`) that had no real consumers.

## Fix
- Removed the dead convenience factory helpers from `whatsapp-service-types.ts`
- Cleaned up the now-unused imports left behind by that helper block

## Verification
- `pnpm exec vitest run src/lib/__tests__/whatsapp-service.test.ts`
- `pnpm type-check`

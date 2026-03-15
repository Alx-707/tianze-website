# CR-076 Fix Summary

## Problem
`src/types/whatsapp-api-types.ts` still carried a backward-compatibility alias block that had no real consumers and only expanded the top-level API types surface.

## Fix
- Removed the dead backward-compatibility alias exports from `whatsapp-api-types.ts`
- Removed the import groups that only existed to support those aliases

## Verification
- `pnpm exec vitest run src/app/api/whatsapp/send/__tests__/route.test.ts`
- `pnpm type-check`

# CR-075 Fix Summary

## Problem
`src/types/whatsapp-webhook-types.ts` still exported a block of backward-compatibility alias names even though repository-wide search found no real consumers for those aliases.

## Fix
- Removed the dead webhook alias exports from `src/types/whatsapp-webhook-types.ts`
- Cleaned up the now-unused imports left behind by that alias layer

## Verification
- `pnpm exec vitest run src/app/api/whatsapp/webhook/__tests__/route.test.ts`
- `pnpm type-check`

# CR-074 Fix Summary

## Problem
`src/types/whatsapp.ts` still re-exported a large set of backward-compatibility alias names that no longer had real consumers from the top-level WhatsApp type entrypoint.

## Fix
- Removed the dead alias re-exports from `src/types/whatsapp.ts`
- Restored the shared core constants entrypoint through `src/constants/core.ts` so the broader cleanup remains type-safe after `magic-numbers.ts` removal

## Verification
- `pnpm type-check`

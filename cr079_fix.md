# CR-079 Fix Summary

## Problem
After removing dead convenience helpers and aliases, `src/types/whatsapp-service-types.ts` still carried import groups that only existed to support the old compatibility layer. The module should now behave as a clean re-export surface.

## Fix
- Removed the leftover import groups so `whatsapp-service-types.ts` is now a pure re-export module for the active symbols it still owns

## Verification
- `pnpm type-check`

# CR-059 Cleanup Summary

## Problem
Two i18n-related files still occupied formal runtime-like namespaces even though they were no longer part of the active runtime chain:
- `src/app/[locale]/layout-test.tsx`
- `src/lib/i18n/server/getMessagesComplete.ts`

They mainly referenced each other and did not have active production or test consumers.

## Cleanup
- Removed `src/app/[locale]/layout-test.tsx`
- Removed `src/lib/i18n/server/getMessagesComplete.ts`

## Rationale
- Avoid keeping test-only or dead helper entrypoints inside formal runtime namespaces
- Reduce future confusion about which layout/message loader path is actually authoritative

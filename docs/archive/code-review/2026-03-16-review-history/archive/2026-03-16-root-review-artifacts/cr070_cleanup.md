# CR-070 Cleanup Summary

## Problem
`src/lib/locale-constants.ts` still maintained its own locale constants and locale maps, but repository-wide search showed no active production or test consumers.

## Cleanup
- Removed `src/lib/locale-constants.ts`

## Rationale
- Avoid keeping dead locale truth sources in formal runtime namespaces
- Reduce future confusion about where locale configuration actually lives

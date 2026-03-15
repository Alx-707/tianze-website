# CR-084 Cleanup Summary

## Problem
A group of barrel files had no active consumers and only expanded the codebase's entrypoint surface:
- `src/components/blocks/index.ts`
- `src/components/trust/index.ts`
- `src/emails/index.ts`
- `src/lib/security/stores/index.ts`

## Cleanup
- Removed the dead barrel files listed above

## Rationale
- Reduce dead entrypoint surface
- Remove import-path ambiguity where no actual consumers exist

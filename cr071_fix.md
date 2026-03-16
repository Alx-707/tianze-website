# CR-071 Fix Summary

## Problem
`src/app/[locale]/layout-fonts.ts` still exported a backwards-compatibility alias `ibmPlexSans`, but repository-wide search showed no real consumers beyond its own unit test.

## Fix
- Removed the dead `ibmPlexSans` alias
- Removed the compatibility-only assertion from the layout fonts test suite

## Verification
- `pnpm exec vitest run src/app/[locale]/__tests__/layout-fonts.test.ts`

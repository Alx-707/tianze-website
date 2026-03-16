# CR-060 Fix Summary

## Problem
`src/lib/i18n/route-parsing.ts` hardcoded `en|zh` into `LOCALE_PREFIX_RE`, even though the authoritative locale list already lives in `src/i18n/routing-config.ts`.

## Fix
- Imported `routing` from `src/i18n/routing-config.ts`
- Derived `LOCALE_PREFIX_RE` from `routing.locales`
- Added a small regex-escaping helper so locale values remain safe if the list evolves

## Verification
- `pnpm exec vitest run src/lib/i18n/__tests__/route-parsing.test.ts`
- `pnpm exec vitest run src/components/__tests__/language-toggle.test.tsx`

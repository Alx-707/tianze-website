# CR-068 Fix Summary

## Problem
`src/config/footer-links.ts` still declared `WhatsAppStyleTokensLegacy`, but repository-wide search showed no real consumers. The deprecated type was just occupying formal config namespace and implying a compatibility surface that no longer existed.

## Fix
- Removed `WhatsAppStyleTokensLegacy` from `src/config/footer-links.ts`

## Verification
- `pnpm exec vitest run src/components/footer/__tests__/Footer.test.tsx`
- `pnpm exec vitest run src/components/whatsapp/__tests__/whatsapp-floating-button.test.tsx`

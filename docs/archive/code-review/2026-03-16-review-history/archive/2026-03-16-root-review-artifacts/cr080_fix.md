# CR-080 Fix Summary

## Problem
`src/types/whatsapp.ts` still re-exported a small set of dead top-level alias names that had no direct consumers:
- `ServiceMessageType`
- `ServiceMessageStatus`
- `WhatsAppApiErrorClass`
- `Config`
- `ServiceOptions`
- `Status`
- `Health`
- `Metrics`
- `ServiceInterface`

## Fix
- Removed those dead alias re-exports from the top-level WhatsApp type entrypoint

## Verification
- `pnpm exec vitest run src/lib/__tests__/whatsapp-service.test.ts src/app/api/whatsapp/send/__tests__/route.test.ts src/app/api/whatsapp/webhook/__tests__/route.test.ts`
- `pnpm type-check`

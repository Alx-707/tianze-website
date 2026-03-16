# CR-054 Fix Summary

## Problem
The contact flow had rate limiting but no idempotency protection. Browser retries, duplicate clicks, or repeated submissions could create duplicate side effects on a core write path.

## Fix
- `/api/contact` now requires `Idempotency-Key` and wraps successful processing with `withIdempotency()`
- `contactFormAction` now uses `withIdempotentResult()` with a contact-specific fingerprint
- `ContactFormContainer` now generates and reuses an `idempotencyKey` field for the Server Action path, clearing it only after success
- Added `resetIdempotencyState()` for stable test isolation

## Regression Coverage
- API route:
  - missing idempotency key returns `IDEMPOTENCY_KEY_REQUIRED`
  - duplicate requests with the same key replay the cached success
- Server Action:
  - missing idempotency key returns `IDEMPOTENCY_KEY_REQUIRED`
  - duplicate submissions with the same key invoke processing only once

## Verification
- `pnpm exec vitest run src/app/api/contact/__tests__/route-post.test.ts`
- `pnpm exec vitest run src/app/api/contact/__tests__/route.test.ts`
- `pnpm exec vitest run src/app/__tests__/actions.test.ts src/app/__tests__/contact-integration.test.ts`
- `pnpm exec vitest run tests/integration/api/contact.test.ts`

# CR-058 Fix Summary

## Problem
`src/middleware.ts` had an explicit-locale early return that set the locale cookie with `NextResponse.next()` and returned before calling `next-intl` middleware. That duplicated the later cookie-sync path and kept a second runtime branch alive for explicit locale requests.

## Fix
- Removed the `tryHandleExplicitLocalizedRequest()` early-return branch
- Explicit locale requests now always flow through `intlMiddleware(request)`
- Cookie synchronization and security headers still apply afterward through the shared post-processing path

## Verification
- `pnpm exec vitest run tests/unit/middleware.test.ts`
- `pnpm exec vitest run src/__tests__/middleware-locale-cookie.test.ts`

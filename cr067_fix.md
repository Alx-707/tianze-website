# CR-067 Fix Summary

## Problem
`TurnstileWidget` still carried the deprecated `onVerify` callback even though production consumers had already moved to `onSuccess`. The old callback was mainly being kept alive by tests.

## Fix
- Removed the deprecated `onVerify` prop from `TurnstileWidget`
- Simplified success handling to call only `onSuccess`
- Removed the legacy `handlers.onVerify` alias from `useTurnstile`
- Updated the test suite to reflect the current public API

## Verification
- `pnpm exec vitest run src/components/security/__tests__/turnstile.test.tsx`
- `pnpm type-check:tests`

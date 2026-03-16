# CR-086 Cleanup

## Summary
- Removed `src/lib/api/api-response-schema.ts`.
- Removed the test block in `src/lib/__tests__/validations.test.ts` that was only preserving this legacy helper.

## Why it was safe
- Repository-wide search showed `api-response-schema.ts` had no production consumers.
- Its only consumer was `src/lib/__tests__/validations.test.ts`.
- The file itself was explicitly documented as a legacy/test-side validation helper rather than an active API contract source.

## Verification
- `rg -n 'api-response-schema|apiResponseSchema' src tests`
- `pnpm exec vitest run src/lib/__tests__/validations.test.ts`
- `pnpm type-check`

## Result
- The repository no longer exposes a dead API response helper in the production namespace.
- The remaining validation tests are focused on schemas and helpers that still matter to active code paths.

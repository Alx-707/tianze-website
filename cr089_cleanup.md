# CR-089 Cleanup

## Summary
- Moved `src/types/test-types.ts` to `src/test/test-types.ts`.
- Updated all test and test-helper imports to the new path.

## Why it was safe
- The file was only consumed by tests and test helpers.
- No production code imported it, so this was a namespace cleanup rather than a runtime behavior change.
- The move aligns the file location with its real responsibility: test-only typing support.

## Verification
- `rg -n '@/types/test-types|@/test/test-types' src tests`
- `pnpm exec vitest run src/lib/__tests__/airtable.test.ts src/lib/__tests__/resend.test.ts`
- `pnpm type-check`

## Result
- The production type namespace no longer exposes a misleading test-only entrypoint.
- Test infrastructure keeps the same behavior while using a path that matches its role.

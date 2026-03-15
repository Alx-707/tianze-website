# CR-088 Cleanup

## Summary
- Removed `src/lib/security-file-upload.ts`.
- Removed `src/lib/security-tokens.ts`.
- Removed their dedicated test files under `src/lib/__tests__/` and `tests/unit/security/`.
- Trimmed `src/lib/__tests__/security.test.ts` so it only covers still-live `security-validation` behavior.

## Why it was safe
- Neither module had any production consumers.
- All imports of these helpers came from tests that were preserving the helpers themselves.
- The still-live security logic in `src/lib/security-validation.ts` remains covered by the surviving test file.

## Verification
- `rg -n '@/lib/security-file-upload|@/lib/security-tokens|security-file-upload|security-tokens' src tests`
- `pnpm exec vitest run src/lib/__tests__/security.test.ts`
- `pnpm type-check`

## Result
- The production namespace no longer exposes two dead security helper modules.
- Security tests now focus on behavior that still belongs to active code paths.

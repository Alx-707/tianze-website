# CR-085 Cleanup

## Summary
- Removed `src/types/whatsapp-service-types.ts`.
- This file was a zero-consumer standalone facade that only re-exported existing WhatsApp service submodules.

## Why it was safe
- Repository-wide search found no direct imports of `@/types/whatsapp-service-types` in `src/**` or `tests/**`.
- The underlying WhatsApp service modules remain available through their direct module paths.
- The higher-level WhatsApp type entrypoint `@/types/whatsapp` remains intact for active consumers.

## Verification
- `rg -n 'whatsapp-service-types' src tests`
- `pnpm type-check`

## Result
- The dead facade no longer expands the public type-entry surface.
- Active WhatsApp type consumers remain on real entrypoints rather than an unconsumed compatibility wrapper.

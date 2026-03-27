# Release Proof Runbook

## Purpose
This file defines the serial release-proof flow for Tier A and production-sensitive changes.

Use this when changes affect:
- `src/middleware.ts`
- locale redirect / nonce / security headers
- Cloudflare / OpenNext build chain
- Tier A translation critical path
- contact / inquiry / abuse-protection runtime behavior

## Release-Proof Flow

Run in this order:

```bash
pnpm review:tier-a:staged
pnpm review:clusters:staged
pnpm validate:translations
pnpm build
pnpm build:cf
CI=1 pnpm test:e2e
```

## Why This Order
- Tier A scan first: know whether you are in a critical review path.
- Cluster scan next: know whether the change is part of a co-change family.
- Translation validation before builds for faster failure on i18n drift.
- `build` before `build:cf` because `build:cf` already runs the build chain and must not run in parallel with `build`.
- E2E last because it is the heaviest proof step.

## Important Constraints
- Do not run `pnpm build` and `pnpm build:cf` in parallel.
- Fast local gates are not release proof.
- Release proof is stronger than CI proof because it is change-type aware and platform aware.
- If the change touches the Cloudflare build chain itself, add `pnpm build:cf:turbo` as a comparison check before signoff.

## Minimal Accept/Reject Rule
- If any step in the release-proof flow fails, do not treat the change as release-proven.
- For Tier A changes, a green fast gate does not override a missing release-proof run.

## After Release-Proof
After a change becomes release-proven, use:
- [`RELEASE-SIGNOFF.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/RELEASE-SIGNOFF.md)

to determine whether the release is actually approved.

Release-proof ends the technical evidence stage.
Release signoff starts the release decision stage.

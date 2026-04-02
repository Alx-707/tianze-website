# Release Proof Runbook

## Purpose
This file defines the serial release-proof flow for Tier A and production-sensitive changes.

Use this when changes affect:
- `src/middleware.ts`
- locale redirect / nonce / security headers
- Cloudflare / OpenNext build chain
- Tier A translation critical path
- `src/sites/**` or `src/sites/**/messages/**`
- contact / inquiry / abuse-protection runtime behavior

Before naming a Cloudflare failure, classify it with:
- [`CLOUDFLARE-ISSUE-TAXONOMY.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CLOUDFLARE-ISSUE-TAXONOMY.md)

## Release-Proof Flow

Run in this order:

```bash
pnpm review:tier-a:staged
pnpm review:clusters:staged
pnpm validate:translations
pnpm clean:next-artifacts
pnpm build
pnpm build:cf
pnpm deploy:cf:phase6:dry-run
CI=1 pnpm test:e2e
```

## Why This Order
- Tier A scan first: know whether you are in a critical review path.
- Cluster scan next: know whether the change is part of a co-change family.
- Translation validation before builds for faster failure on i18n drift.
- `clean:next-artifacts` before `build` because stale `.next` state can still produce misleading stack-overflow build failures.
- `build` before `build:cf` because both lines still share the same build-artifact family even though `build:cf` now uses the repo-local Webpack wrapper and self-cleans before rebuilding.
- `deploy:cf:phase6:dry-run` after `build:cf` because it is the stronger local Cloudflare proof for the current split-worker line.
- E2E last because it is the heaviest proof step.
- If the change is site-aware, add `pnpm build:site:equipment` and, when relevant, `pnpm build:cf:site:equipment` before signoff.

## Important Constraints
- Do not run `pnpm build` and `pnpm build:cf` in parallel.
- Fast local gates are not release proof.
- Release proof is stronger than CI proof because it is change-type aware and platform aware.
- If the change touches the Cloudflare build chain itself, add `pnpm build:cf:turbo` as a comparison check before signoff.
- For the final deployed Cloudflare proof, follow release-proof with a real preview publish plus `pnpm smoke:cf:deploy -- --base-url <deployment-url>`.
- When a Cloudflare-related step fails, record whether it is a platform-entry issue, generated-artifact issue, current-site runtime regression, or final deployed behavior issue.

## Minimal Accept/Reject Rule
- If any step in the release-proof flow fails, do not treat the change as release-proven.
- For Tier A changes, a green fast gate does not override a missing release-proof run.

## After Release-Proof
After a change becomes release-proven, use:
- [`RELEASE-SIGNOFF.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/RELEASE-SIGNOFF.md)

to determine whether the release is actually approved.

Release-proof ends the technical evidence stage.
Release signoff starts the release decision stage.

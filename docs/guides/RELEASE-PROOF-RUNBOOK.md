# Release Proof Runbook

## Purpose
This file defines the serial release-proof flow for Tier A and production-sensitive changes.

Use this when changes affect:
- `src/middleware.ts`
- locale redirect / nonce / security headers
- Cloudflare / OpenNext build chain
- Tier A translation critical path
- `src/config/single-site.ts`, `src/config/site-types.ts`, or `src/config/single-site-product-catalog.ts`
- contact / inquiry / abuse-protection runtime behavior

Before naming a Cloudflare failure, classify it with:
- [`CLOUDFLARE-ISSUE-TAXONOMY.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CLOUDFLARE-ISSUE-TAXONOMY.md)

## Proof Lanes

- `pnpm preview:preflight:cf` → preview preflight lane; allows degraded-mode placeholders by contract and is used only before preview deploys.
- `pnpm proof:cf:preview-deployed` → canonical formal Cloudflare preview proof; runs real preview publish plus deployed smoke.
- `pnpm release:verify` → Route B release-proof lane; rejects degraded overrides and is required for production-sensitive confidence.

## Release-Proof Flow

Run in this order:

```bash
pnpm review:tier-a:staged
pnpm review:clusters:staged
pnpm validate:translations
pnpm clean:next-artifacts
pnpm build
pnpm build:cf
pnpm smoke:cf:preview
CI=1 pnpm test:e2e
```

## Why This Order
- Tier A scan first: know whether you are in a critical review path.
- Cluster scan next: know whether the change is part of a co-change family.
- Translation validation before builds for faster failure on i18n drift.
- `clean:next-artifacts` before `build` because stale `.next` state can still produce misleading stack-overflow build failures.
- `build` before `build:cf` because both lines still share the same build-artifact family and stale `.next` state can still mislead verification.
- Route B no longer makes generated-artifact compat/blocker checks or phase6 dry-run part of the canonical release gate.
- `smoke:cf:preview` after `build:cf` because Route B treats stock local preview as the canonical local Cloudflare proof lane.
- E2E last because it is the heaviest proof step.
- If the change rewires single-site truth or cutover gates, run `pnpm preflight:site-cutover:strict` before signoff.
- Preview deploy workflows must use `pnpm preview:preflight:cf` before deploy, while production deploys continue to use `pnpm release:verify`.

## Site Cutover Preflight
Before any change that touches single-site truth or verifies skeleton removal, run:

```bash
NODE_ENV=production VALIDATE_CONFIG_SKIP_RUNTIME=true pnpm validate:config
pnpm truth:check
pnpm validate:translations
pnpm compat-import-audit
pnpm build
```

Only use the strict variant (`pnpm preflight:site-cutover:strict`) when the branch is intentionally proving skeleton removal readiness. Deploy/release workflows must not rely on `VALIDATE_CONFIG_SKIP_RUNTIME=true` for final release proof.

## Preview Degraded-Mode Exception Contract
- Current contract source: retired from the main tree
- Contract checker: retired from the main tree
- Current status: historical only; active preview workflow now requires real preview secrets and no degraded flags.

## Alias / Shim Exception Contract
- Current contract source: retired from the main tree in wave 7
- Single-worker guard: retired from the main tree in wave 6
- Why it exists: the old phase6 alias contract is gone; the live single-worker alias now sits directly in `wrangler.jsonc`.

## Generated-Artifact Exception Contract
- Current contract source: retired from the main tree in wave 8
- Current status: historical only; current Route B release proof no longer depends on this layer.

## Important Constraints
- Do not run `pnpm build` and `pnpm build:cf` in parallel.
- Fast local gates are not release proof.
- Release proof is stronger than CI proof because it is change-type aware and platform aware.
- If the change touches the Cloudflare build chain itself, add one extra fresh `pnpm build:cf` rerun before signoff.
- For the canonical final Cloudflare preview proof, use `pnpm proof:cf:preview-deployed`. After the contact-page fix, that proof means the current-site runtime regression is gone for `/en/contact` and `/zh/contact`, but it does not close the deeper API debt boundary.
- Known API failure families still live below the stock build/deploy surface; keep those as runtime debt unless stronger deployed proof says otherwise.
- If you need the lower-level primitive, follow release-proof with a real preview publish plus `pnpm smoke:cf:deploy -- --base-url <deployment-url>`.
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

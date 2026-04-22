# Release Proof Runbook

## Purpose
This file defines the serial release-proof flow for Tier A and production-sensitive changes.

Use this when changes affect:
- `src/middleware.ts`
- locale redirect / nonce / security headers
- Cloudflare / OpenNext build chain
- Tier A translation critical path
- `src/config/single-site*.ts` or compatibility wrappers that forward site identity truth
- contact / inquiry / abuse-protection runtime behavior

Current single-site authoring split to keep in mind:
- `src/config/single-site.ts`
- `src/config/single-site-page-expression.ts`
- `src/config/single-site-seo.ts`

Before naming a Cloudflare failure, classify it with:
- [`CLOUDFLARE-ISSUE-TAXONOMY.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CLOUDFLARE-ISSUE-TAXONOMY.md)

## Release-Proof Flow

Run in this order:

```bash
pnpm review:docs-truth
pnpm review:tier-a:staged
pnpm review:clusters:staged
pnpm validate:translations
pnpm type-check:source
pnpm clean:next-artifacts
pnpm build
CF_APPLY_GENERATED_PATCH=true pnpm build:cf
pnpm smoke:cf:preview
pnpm smoke:cf:preview:strict
CI=1 pnpm test:e2e
```

## Why This Order
- Docs-truth first: if the branch changes current-truth guidance, catch stale runtime claims before build proof makes them look legitimate.
- Tier A scan first: know whether you are in a critical review path.
- Cluster scan next: know whether the change is part of a co-change family.
- Translation validation before builds for faster failure on i18n drift.
- `type-check:source` before builds because fast gates must distinguish source truth from stale generated artifacts.
- `clean:next-artifacts` before `build` because stale `.next` state can still produce misleading stack-overflow build failures.
- `build` before `build:cf` because both lines still share the same build-artifact family and stale `.next` state can still mislead verification.
- `CF_APPLY_GENERATED_PATCH=true pnpm build:cf` is the current stronger local Cloudflare build proof lane; plain `pnpm build:cf` is not the authoritative preview-proof command.
- `smoke:cf:preview` after `build:cf` because Route B treats stock local preview as the canonical local Cloudflare proof lane.
- E2E last because it is the heaviest proof step.
- If the change rewires single-site truth or cutover gates, run `pnpm truth:check`, `pnpm review:translation-quartet`, and `pnpm review:translate-compat` before signoff.
- Contact page proof should be read as **Contact page Server Action** proof, not as the old `/api/contact` path.
- Preview deploy workflows now use `pnpm proof:cf:preview-deployed` as the canonical repo-side entrypoint for fresh preview deploy + deployed smoke. Production release proof continues to use `pnpm release:verify`.
- The Cloudflare deploy workflow no longer calls the retired `preview:preflight:cf` lane.
- The Cloudflare production workflow now deploys through `pnpm deploy:cf:phase6:production`, not a direct `opennextjs-cloudflare deploy` call.
- In preview, the proof script is now the single source of deploy + smoke truth; the workflow reads `reports/deploy/cloudflare-preview-proof.json` to resolve the deployed preview URL.

## Dirty Worktree vs Clean Branch Rule
If the current branch is a **dirty worktree** with unrelated changes, split the
completion evidence into two layers:

### 1. Dirty worktree targeted proof
Use this to prove the seam you actually changed:

```bash
pnpm review:docs-truth
pnpm review:cf:official-compare
pnpm review:derivative-readiness
```

Then add the relevant change-scoped suites plus the serial build lane:

```bash
pnpm clean:next-artifacts && pnpm build
CF_APPLY_GENERATED_PATCH=true pnpm build:cf
```

This is **targeted proof**. It is enough to say the touched governance lane or
page-expression lane is locally defended.
- If the change is on `src/config/single-site-page-expression.ts` or `src/config/single-site-seo.ts`, say that explicitly instead of collapsing it into a vague “single-site config changed”.

### 2. Clean branch full proof
Use this only after unrelated dirty changes are isolated into a **clean branch**
or separate worktree:

```bash
pnpm ci:local:quick
```

If the change is release-facing or still touches Cloudflare/runtime-sensitive
surfaces, continue with the heavier release-proof bundle after that.

Rule:
- do not claim full close from dirty-worktree targeted proof alone
- do not blame unrelated dirty failures on the governance line you just changed
- report targeted proof and clean branch proof as separate verdicts

## Site Cutover Preflight
There is no longer a canonical `pnpm preflight:site-cutover` command in the main tree. For changes that touch single-site truth or verify skeleton removal, run the live baseline explicitly:

```bash
APP_ENV=preview NEXT_PUBLIC_SITE_URL=https://preview.tianze-pipe.com NODE_ENV=production pnpm validate:config
pnpm truth:check
pnpm review:translation-quartet
pnpm review:translate-compat
pnpm clean:next-artifacts && pnpm build
```

For final signoff, treat `pnpm truth:check`, `pnpm review:translation-quartet`, and `pnpm review:translate-compat` as the baseline single-site truth proof. Deploy/release workflows must not rely on `VALIDATE_CONFIG_SKIP_RUNTIME=true` for final release proof.

## Preview Degraded-Mode Exception Contract
- Current contract source: retired from the main tree
- Contract checker: retired from the main tree
- Current status: historical only; active preview workflow now requires real preview secrets and no degraded flags.

## Important Constraints
- Do not run `pnpm build` and `pnpm build:cf` in parallel.
- Fast local gates are not release proof.
- Release proof is stronger than CI proof because it is change-type aware and platform aware.
- If the change touches the Cloudflare build chain itself, add one extra fresh `pnpm build:cf` rerun before signoff.
- For the canonical final Cloudflare preview proof, use `pnpm proof:cf:preview-deployed`. That script must emit `pass`, `blocked`, or `fail`; only `pass` closes the deployed preview proof. After the contact-page fix, that proof means the current-site runtime regression is gone for `/en/contact` and `/zh/contact`, but it does not close the deeper API debt boundary.
- Preview proof already includes the deployed smoke phase, so the workflow should not run a second post-deploy verification job for preview.
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

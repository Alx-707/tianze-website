# Dependency Upgrade Playbook

This document records the project's dependency upgrade workflow, current constraints, and the verified outcomes from the 2026-03-19, 2026-03-27, and 2026-04-01 upgrade rounds, including the active upgrade branch execution on 2026-04-01.

## Why This Lives In `docs/guides/`

This is not a one-off migration report.
It is a repeatable maintenance playbook with project-specific constraints, validation steps, and known upgrade traps.

`docs/guides/` is the best fit because:
- it is operational guidance, not archived history
- it should be reused in future upgrade rounds
- it belongs next to other engineering workflow documents

## Upgrade Strategy

Use small batches, not a repo-wide version jump.

Recommended order:
1. Upgrade low-risk patch and minor releases first.
2. Run validation after every batch.
3. Upgrade higher-risk packages only after the previous batch is green.
4. Keep runtime-aligned packages pinned to supported runtime majors, not npm `latest`.

Validation checklist for each batch:
- `pnpm install`
- `pnpm ci:local:quick` for validated patch/minor batches, Next/React/TypeScript changes, or security-sensitive changes
- `pnpm type-check`
- `pnpm lint:check`
- `pnpm build`
- `pnpm build:cf`

Do not run `pnpm build` and `pnpm build:cf` in parallel.
`build:cf` shells into `pnpm build`, and running both together causes false failures like `Another next build process is already running`.

## Verified Upgrade Round

Date:
- `2026-03-19`

Completed upgrades in this round:
- `next` `16.1.6 -> 16.2.0`
- `@next/mdx` `16.1.6 -> 16.2.0`
- `@next/bundle-analyzer` `16.1.6 -> 16.2.0`
- `@next/eslint-plugin-next` `16.1.6 -> 16.2.0`
- `eslint-config-next` `16.1.6 -> 16.2.0`
- `@opennextjs/cloudflare` `1.16.5 -> 1.17.1`
- `wrangler` `4.65.0 -> 4.75.0`
- `next-intl` `4.7.0 -> 4.8.3`
- `react` `19.2.3 -> 19.2.4`
- `react-dom` `19.2.3 -> 19.2.4`
- `tailwindcss` `4.1.18 -> 4.2.2`
- `@tailwindcss/postcss` `4.1.18 -> 4.2.2`
- `tailwind-merge` `3.4.0 -> 3.5.0`
- `vitest` `4.0.18 -> 4.1.0`
- `@vitest/coverage-v8` `4.0.18 -> 4.1.0`
- `playwright` `1.57.0 -> 1.58.2`
- `@playwright/test` `1.57.0 -> 1.58.2`
- `@vercel/analytics` `1.6.1 -> 2.0.1`
- `@vercel/speed-insights` `1.3.1 -> 2.0.0`
- `lucide-react` `0.562.0 -> 0.577.0`
- `react-grab` `0.0.98 -> 0.1.28`

Follow-up verified upgrade:
- `@opennextjs/cloudflare` `1.17.1 -> 1.17.3` (`2026-03-27`)

Post-upgrade validation status:
- `pnpm type-check`: pass
- `pnpm lint:check`: pass
- `pnpm build`: pass
- `pnpm build:cf`: pass
- `pnpm audit --prod --audit-level moderate`: pass

## Verified Assessment Round

Date:
- `2026-04-01`

Scope:
- isolate and re-check the current Cloudflare baseline
- test whether OpenNext `minify` can safely be re-enabled
- test `next@16.2.2` with current OpenNext
- test `next@16.2.2` with latest OpenNext `1.18.0`
- spot-check the previously suspected "duplicate translation" behavior

Current verified baseline:
- `next` `16.2.0`
- `@next/mdx` `16.2.0`
- `@next/bundle-analyzer` `16.2.0`
- `@next/eslint-plugin-next` `16.2.0`
- `eslint-config-next` `16.2.0`
- `@opennextjs/cloudflare` `1.17.3`

Observed results:
- `pnpm build:cf`: pass on the current baseline
- `pnpm build:cf:turbo`: pass on the current baseline
- stock `opennextjs-cloudflare preview` + `pnpm smoke:cf:preview`: pass on the current baseline
- stock `opennextjs-cloudflare preview` + `pnpm smoke:cf:preview:strict`: still fails on `/api/health` on the current baseline

OpenNext `minify` re-check:
- re-enabling `minify` no longer reproduced the old `pnpm build:cf` build failure in the isolated test
- however, local Cloudflare preview safety was still not proven after re-enabling it
- page routes fell back to the `middleware-manifest.json` dynamic-require error family during local preview validation

`next@16.2.2` assessment:
- `next` `16.2.0 -> 16.2.2`
- matching Next companion packages also moved to `16.2.2`
- `pnpm build:cf`: pass
- `pnpm build:cf:turbo`: pass
- stock `opennextjs-cloudflare preview`: regression on page routes

Observed regression shape with `next@16.2.2`:
- `/en`, `/zh`, `/en/contact`, `/zh/contact` returned `500`
- the failure family again pointed to `/.next/server/middleware-manifest.json` dynamic require behavior

`@opennextjs/cloudflare@1.18.0` follow-up:
- upgrading `@opennextjs/cloudflare` `1.17.3 -> 1.18.0` did not resolve the `next@16.2.2` stock preview page-route regression

Repo-local compatibility follow-up:
- the failing call path was narrowed to generated `getMiddlewareManifest()` code still using `require(this.middlewareManifestPath)` inside the default handler bundle
- this repo now patches that generated code in `scripts/cloudflare/patch-prefetch-hints-manifest.mjs`
- the local compatibility patch rewrites that call to `_loadmanifestexternal.loadManifest(...)`
- after a clean `pnpm build:cf`, the patched upgraded line now restores page-route preview behavior:
  - `/en`: `200`
  - `/zh`: `200`
  - `/en/contact`: `200`
  - `/zh/contact`: `200`
  - `pnpm smoke:cf:preview -- --base-url http://127.0.0.1:8787`: pass
- `pnpm smoke:cf:preview:strict` still fails on `/api/health`
- the current strict failure is a different local-preview boundary: Wrangler still reports a dynamic require failure against generated `app/api/health/route.js`
- local page proof is restored, but local API proof is still not complete

Translation duplication check:
- a text-content comparison between plain `next start` and stock `opennextjs-cloudflare preview` on `/en` and `/en/contact` did not reproduce any duplicate translation issue on the current baseline

Assessment summary:
- `next@16.2.2` is no longer blocked by the earlier local page-preview regression once the repo-local compatibility patch is applied
- the upgraded line still needs deployed smoke and stricter API proof before it can be called fully closed
- do not rewrite the minify rule as "safe now"; rewrite it as "old build crash no longer reproduced, but runtime-safe proof is still missing"

Important interpretation note:
- the repo's dependency-check scripts are version-oriented and may still label Next/OpenNext/Wrangler patch releases as recommended updates
- for this repo, Cloudflare-specific verification overrides semver-only optimism

## Active Upgrade Branch Progress

Date:
- `2026-04-01`

Branch:
- `chore/dependency-upgrade-2026-04`

Completed safe batch on this branch:
- `next-intl` `4.8.3 -> 4.8.4`
- `@react-email/components` `1.0.10 -> 1.0.11`
- `@react-email/render` `2.0.4 -> 2.0.5`
- `vitest` `4.1.0 -> 4.1.2`
- `@vitest/coverage-v8` `4.1.0 -> 4.1.2`
- `axe-core` `4.11.1 -> 4.11.2`
- `dependency-cruiser` `17.3.9 -> 17.3.10`
- `@t3-oss/env-nextjs` `0.13.10 -> 0.13.11`
- `resend` `6.9.4 -> 6.10.0`
- `typescript-eslint` `8.57.1 -> 8.58.0`
- `react-grab` `0.1.28 -> 0.1.29`

Completed browser-tooling batch on this branch:
- `@playwright/test` `1.58.2 -> 1.59.0`
- `playwright` `1.58.2 -> 1.59.0`
- `@marsidev/react-turnstile` `1.4.2 -> 1.5.0`

Completed framework and tooling support batches on this branch:
- `next` `16.2.0 -> 16.2.2`
- `@next/mdx` `16.2.0 -> 16.2.2`
- `@next/bundle-analyzer` `16.2.0 -> 16.2.2`
- `@next/eslint-plugin-next` `16.2.0 -> 16.2.2`
- `eslint-config-next` `16.2.0 -> 16.2.2`
- `@opennextjs/cloudflare` `1.17.3 -> 1.18.0`
- `wrangler` `4.75.0 -> 4.79.0`
- `react-server-dom-webpack` `added (19.2.4)`
- `react-server-dom-turbopack` `added (19.2.4)`
- `critters` `added (0.0.25)`
- `lucide-react` `0.577.0 -> 1.7.0`
- `jsdom` `27.4.0 -> 29.0.1`
- `knip` `5.88.0 -> 6.1.1`
- `@types/node` `22.19.1 -> 22.19.15`

Verification completed on this branch:
- `pnpm ci:local:quick`: pass
- `pnpm exec playwright test --list`: pass
- `pnpm build`: pass
- `pnpm build:cf`: pass

Execution note:
- this branch now carries both the lower-risk dependency updates and the additional framework/tooling upgrades that were re-verified locally
- the `jsdom` upgrade exposed a real tab-focus edge case; the repo now fixes it in `src/components/ui/tabs.tsx` instead of weakening the test
- `knip 6` ran clean after removing two stale ignore entries from `knip.jsonc`
- the Next/OpenNext/Wrangler line now includes a repo-local compatibility patch for the generated middleware manifest loader, which restores local page preview on the upgraded stack

Current branch truth after re-validation:
- `pnpm type-check`: pass
- `pnpm lint:check`: pass
- `pnpm unused:check`: pass
- `pnpm unused:production`: pass
- `pnpm ci:local:quick`: pass
- `rm -rf .next && pnpm build`: pass
- `pnpm build:cf`: pass
- `pnpm smoke:cf:preview -- --base-url http://127.0.0.1:8787`: pass
- `pnpm smoke:cf:preview:strict -- --base-url http://127.0.0.1:8787`: still fails on `/api/health`
- current strict-failure family: dynamic require of generated `app/api/health/route.js`
- the main remaining Cloudflare blocker on this branch is no longer page preview, but the stricter local API proof / deployed proof boundary
- `preview:cf`, `deploy:cf:*`, and `deploy:cf:phase6:*` now self-clean `.next`, `.open-next`, and `.wrangler/tmp` before rebuilding so repeated verification does not falsely regress into `Maximum call stack size exceeded`
- `preview:cf` now points at stock `opennextjs-cloudflare preview`; the raw `wrangler dev --env preview` path remains available as `preview:cf:wrangler` for diagnostics only
- latest local re-check showed:
  - `preview:cf` + `pnpm smoke:cf:preview`: pass
  - `preview:cf:wrangler` still returns page-route `500`s and logs `Cannot perform I/O on behalf of a different request`, so treat that path as a local Wrangler-runtime boundary, not as page-proof truth
- phase6 line re-check showed:
  - before adding explicit support deps, `deploy:cf:phase6:dry-run` failed because split workers pulled in unresolved `react-server-dom-*` and `critters`
  - after adding `react-server-dom-webpack`, `react-server-dom-turbopack`, and `critters`, the phase6 failure narrowed to a single dev-only Turbopack HMR runtime path
  - `scripts/cloudflare/build-phase6-workers.mjs` now injects a Wrangler alias from `@vercel/turbopack-ecmascript-runtime/browser/dev/hmr-client/hmr-client.ts` to `scripts/cloudflare/shims/empty-module.mjs`
  - with that alias in place, `pnpm deploy:cf:phase6:dry-run` now passes
  - this is enough to restore phase6 dry-run proof, but it is not yet the same thing as a real authenticated preview deploy plus post-deploy smoke
- latest integration re-check also verified:
  - a plain `pnpm build` can still occasionally hit `Maximum call stack size exceeded` if it reuses an existing `.next` state
  - the strongest current proof for the standard build line remains `pnpm clean:next-artifacts && pnpm build`
  - `scripts/cloudflare/build-webpack.mjs` now self-cleans `.next`, `.open-next`, and `.wrangler/tmp` before the Cloudflare build, so `pnpm build:cf` can be safely re-run after a prior standard build without manual cleanup
  - `pnpm ci:local:quick`: pass after the contact-page test refresh and the property-test data-bound fix
  - the last local flaky failure on this branch came from `src/lib/lead-pipeline/__tests__/lead-schema.property.test.ts`, where `fast-check` could generate dates outside the valid `toISOString()` range; the arb is now bounded to a safe ISO date window
  - the contact route no-JS regression was caused by an empty route-level `loading.tsx`; removing that file and keeping a meaningful page fallback restored the no-JS HTML contract
  - `pnpm test:release-smoke`: pass (`43 passed / 1 skipped`)
  - strengthened `pnpm release:verify`: pass after adding:
    - `pnpm clean:next-artifacts` before the standard build
    - `pnpm deploy:cf:phase6:dry-run` into the unified release gate
    - the contact/no-JS and mobile-navigation stabilization fixes

## Current Constraints

### 1. Keep `@types/node` aligned with the declared runtime majors

Current stable rule:
- keep `@types/node` on `22.x` while `engines.node` remains `>=20.19 <23`
- do not follow `npm latest` into `25.x` just because local type-check still passes

Reason:
- newer Node typings can silently expose APIs that the declared runtime support window does not actually guarantee
- several direct dev/build dependencies now already require the Node 20 line to be at least `20.19.x`, so the older broad `>=20 <23` wording was no longer precise enough
- this repo has already re-checked that the safer `22.x` line remains green, so treat that as the current stable truth

Current stable status:
- `@types/node`: `22.19.15`
- local verification after realignment:
  - `pnpm type-check`: pass
  - `pnpm build`: pass
  - `pnpm build:cf`: pass

### 2. Do not keep `NEXT_IGNORE_BUILD_TYPE_ERRORS` in the stable branch

Current stable rule:
- remove the `next.config.ts` `typescript.ignoreBuildErrors` escape hatch from the main upgrade branch
- if TypeScript migration work temporarily needs a bypass, keep it in an isolated experiment branch only

Reason:
- this repo already decided not to continue the TypeScript 6 line in the current stable upgrade batch
- leaving a silent type-check bypass in shared config weakens the quality gate even when no active migration depends on it

Project runtime support is defined by:
- `package.json > engines.node`

Current declared range:
- `>=20.19 <23`

That means the supported Node majors are:
- `20`
- `21`
- `22`

Current runtime truth:
- default local baseline: `.nvmrc` / `.node-version` pin `20.19.0`
- remote CI truth: GitHub Actions also pin `20.19.0`
- local Node `22.x` remains allowed by policy, but it is not the final merge truth

Current branch result:
- `@types/node@22.19.15` now matches the declared runtime range
- the earlier `25.x` experiment is no longer the branch truth
- treat runtime-aligned typings as the stable default going forward

Alignment note:
- `@types/node@22.x` matches the declared runtime range
- do not reintroduce `@types/node@25.x` without a conscious policy change
- if the direct dependency floor moves again, update `package.json > engines.node`, `.nvmrc`, `.node-version`, and the workflow `setup-node` version together in one batch

### 3. ESLint 10 is not ready in this repo yet

Attempted but intentionally rolled back:
- `eslint` `9.39.2 -> 10.0.3`
- `@eslint/js` `9.39.2 -> 10.0.1`
- `eslint-plugin-security` `3.0.1 -> 4.0.0`
- `eslint-plugin-react-you-might-not-need-an-effect` `0.8.5 -> 0.9.2`

Why it was rolled back:
- the peer warnings were real, not cosmetic
- `pnpm lint:check` failed at runtime

Observed failure:
```text
TypeError: Error while loading rule 'react/display-name':
contextOrFilename.getFilename is not a function
```

Current blocker:
- `eslint-plugin-react@7.37.5` is a confirmed hard blocker
- `eslint-config-next@16.2.2` / `eslint-config-next/parser` is a confirmed hard blocker

Minimal isolated findings from the ESLint 10 repro (`2026-04-01`):
- `eslint-plugin-react@7.37.5`
  - peer range only declares support through `^9.7`
  - isolated ESLint 10 repro crashed on `react/display-name` with:
    - `contextOrFilename.getFilename is not a function`
  - isolated ESLint 10 repro also crashed on `react/jsx-filename-extension` with:
    - `context.getFilename is not a function`
- `eslint-config-next/parser`
  - isolated ESLint 10 repro crashed even when the parser was used alone
  - observed failure:
    - `scopeManager.addGlobals is not a function`
- `eslint-config-next/core-web-vitals`
  - also crashed under ESLint 10
  - this is consistent with the parser/config layer being the blocker, not the standalone Next plugin
- `@next/eslint-plugin-next`
  - standalone rule repro passed under ESLint 10
  - so the first proven Next-side blocker is the config/parser layer, not the plugin by itself
- the following plugins passed minimal isolated ESLint 10 repros and are therefore **not** the first proven blockers in this repo:
  - `eslint-plugin-react-hooks`
  - `eslint-plugin-import`
  - `eslint-plugin-promise`
  - `eslint-plugin-security@4.0.0`
  - `eslint-plugin-react-you-might-not-need-an-effect@0.9.2`

Interpretation:
- the repo-wide ESLint 10 failure is real
- but it should not be described as "the whole plugin ecosystem is broken"
- the currently nailed-down hard blockers are:
  - `eslint-plugin-react`
  - `eslint-config-next` parser/config layer

Rule:
- do not upgrade ESLint to 10 until the full Next/React lint chain supports it cleanly
- current branch policy is intentional:
  - keep `eslint` on `9.39.2`
  - keep `@eslint/js` on `9.39.2`
  - treat this as an explicit hold, not as an unfinished upgrade

### 3. TypeScript 6 is currently deferred on this repo

Current branch truth:
- `typescript 6.0.2` was attempted on this branch
- the repo needed `"ignoreDeprecations": "6.0"` in `tsconfig.json` to satisfy the TypeScript 6 deprecation gate
- but `pnpm build` then stopped being a reliable green check:
  - one failure mode was `Maximum call stack size exceeded` during `next build`
  - after downgrading back to `typescript 5.9.3`, that `tsconfig.json` value also became invalid and had to return to `"ignoreDeprecations": "5.0"`

Decision:
- keep `typescript` on `5.9.3` for this branch
- do not describe TypeScript 6 as "completed" in this repo

Rule:
- treat TypeScript 6 as deferred, not as a safe follow-up patch
- if revisiting it later, require all of:
  - `pnpm type-check`
  - `pnpm build`
  - `pnpm build:cf`
  - pre-push `build:check`
- only promote it after the standard Next build line is green without hand-waving

### 4. OpenNext Cloudflare minify should stay disabled by default

Originally, after upgrading to:
- `next@16.2.0`
- `@opennextjs/cloudflare@1.17.3`

`pnpm build:cf` failed when OpenNext minification was enabled.

Observed failure shape:
```text
ENOENT: no such file or directory, stat
'.open-next/server-functions/.../node_modules/.pnpm/node_modules/semver'
```

Impact:
- the failure happened in OpenNext's server bundle minification step
- `pnpm build` still passed
- the broken step was specific to the Cloudflare OpenNext pipeline

Old mitigation:
- set `minify: false` for split server functions
- set `cloudflareConfig.default.minify = false`

Current file:
- `open-next.config.ts`

Updated rule after the `2026-04-01` isolated re-check:
- the old build-time failure no longer reproduced in the latest re-test
- but local Cloudflare preview safety still was not proven after re-enabling minification
- keep OpenNext minification disabled by default in this repo
- if re-testing it, require all of:
  - `pnpm build:cf`
  - local Cloudflare page smoke
  - deploy smoke on the real target
- do not treat this flag as a casual performance tweak

Current branch note:
- this branch is now on `@opennextjs/cloudflare@1.18.0`
- the earlier `next@16.2.2` stock-preview regression now has a repo-local compatibility patch and a stronger deployed phase6 proof path
- that does **not** change the minify decision
- OpenNext minification still is **not** considered safe to re-enable by default in this repository

Expected tradeoff:
- slightly larger worker/server bundle output
- no functional behavior regression
- acceptable until upstream packaging is fixed

### 5. Middleware deprecation is still warning-only in this repo

`next build` and `build:cf` still emit:
- `The "middleware" file convention is deprecated. Please use "proxy" instead.`

This repo intentionally keeps `src/middleware.ts` for Cloudflare compatibility.
Do not treat that warning as an immediate migration action unless Cloudflare validation has been re-run.

## Remaining Non-Blocking Holds

This branch is now locally green and the stronger deployed phase6 smoke path has already passed.
The items below are still open as future-upgrade holds or policy cautions, not as merge blockers for the current branch:
- default-worker preview still is not the full Cloudflare truth for strict API proof
- ESLint 10 ecosystem support
- OpenNext minify re-enable proof

Reason summary:
- Next/OpenNext/Wrangler line:
  - `pnpm clean:next-artifacts && pnpm build`, `pnpm build:cf`, and local page preview now pass with the repo-local compatibility patch
  - real phase6 preview deploy is now runnable with the repo-local phase6 fixes
  - `pnpm smoke:cf:deploy -- --base-url <preview-url>` now passes once it points at the real preview deploy URL produced by the current run
  - the strengthened `pnpm release:verify` flow now also passes end-to-end on this branch
  - the remaining caution is that stock/default-worker preview still should not be treated as the final truth for `/api/health`
- ESLint 10 line: current React lint plugin chain still fails at runtime
- OpenNext minify: old build crash no longer reproduced, but runtime-safe proof is still missing

## Recommended Next Upgrade Round

Suggested order for the next round:
1. Keep the current branch as the integration branch for the upgrades already proven locally.
2. Keep `@types/node` aligned with the declared runtime range unless the runtime support policy itself changes.
3. Re-check the Next/OpenNext/Wrangler line at the deployed smoke layer, because the local page-preview regression now has a repo-local explanation and fix.
   Update after the latest phase6 work:
   - deployed phase6 preview smoke is now available as the stronger proof path
   - do not regress this back to stock preview-only reasoning
4. Re-check whether the React/Next lint plugin ecosystem supports ESLint 10 without runtime failures.
5. Revisit OpenNext minification only after checking upstream fixes and re-running preview + deploy proof.
6. Before promoting the branch, keep the “clean standard build + self-cleaning Cloudflare build + deployed smoke” verification trio as the final proof set.

## Command Reference

Dependency-only checks:
```bash
pnpm deps:check
```

Full stack check:
```bash
pnpm tech:check
```

Core validation:
```bash
pnpm type-check
pnpm lint:check
pnpm build
pnpm build:cf
```

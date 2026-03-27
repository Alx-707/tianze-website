# Dependency Upgrade Playbook

This document records the project's dependency upgrade workflow, current constraints, and the verified outcomes from the 2026-03-19 and 2026-03-27 upgrade rounds.

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

## Current Constraints

### 1. `@types/node` must track supported runtime majors

Do not upgrade `@types/node` just because npm `latest` moved.

Project runtime support is defined by:
- `package.json > engines.node`

Current declared range:
- `>=20 <23`

That means the supported Node majors are:
- `20`
- `21`
- `22`

Result:
- `@types/node@22.x` is aligned
- `@types/node@25.x` is not aligned

Rule:
- keep `@types/node` aligned with supported runtime majors
- do not upgrade it beyond the declared runtime range unless runtime support changes first

### 2. ESLint 10 is not ready in this repo yet

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
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`
- `eslint-plugin-import`
- `eslint-plugin-jsx-a11y`
- `eslint-plugin-promise`

These packages do not yet declare stable ESLint 10 support in the versions currently used by this repo.

Rule:
- do not upgrade ESLint to 10 until the full Next/React lint chain supports it cleanly

### 3. OpenNext Cloudflare minify is temporarily disabled

After upgrading to:
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

Temporary mitigation:
- set `minify: false` for split server functions
- set `cloudflareConfig.default.minify = false`

Current file:
- `open-next.config.ts`

Rule:
- keep OpenNext minification disabled until the upstream bug is fixed
- once upstream fixes the minifier, re-enable and retest `pnpm build:cf`

Current baseline note:
- `1.17.3` resolved the old optional-manifest crash family that affected local Cloudflare preview page routes
- it did **not** make OpenNext minification safe to re-enable by default in this repository

Expected tradeoff:
- slightly larger worker/server bundle output
- no functional behavior regression
- acceptable until upstream packaging is fixed

### 4. Middleware deprecation is still warning-only in this repo

`next build` and `build:cf` still emit:
- `The "middleware" file convention is deprecated. Please use "proxy" instead.`

This repo intentionally keeps `src/middleware.ts` for Cloudflare compatibility.
Do not treat that warning as an immediate migration action unless Cloudflare validation has been re-run.

## Remaining Deferred Upgrades

Still intentionally deferred after the 2026-03-19 round:
- `eslint` `9.39.2 -> 10.0.3`
- `@eslint/js` `9.39.2 -> 10.0.1`
- `eslint-plugin-security` `3.0.1 -> 4.0.0`
- `eslint-plugin-react-you-might-not-need-an-effect` `0.8.5 -> 0.9.2`
- `jsdom` `27.4.0 -> 29.0.0`
- `@types/node` `22.19.1 -> 25.5.0`

Reason summary:
- ESLint 10 line: ecosystem support gap
- `jsdom`: test-environment upgrade, needs broader test verification
- `@types/node`: runtime alignment risk

## Recommended Next Upgrade Round

Suggested order for the next round:
1. Re-check whether the ESLint plugin ecosystem supports ESLint 10.
2. Upgrade `jsdom` only with a fuller test run, not just build validation.
3. Revisit OpenNext minification only after checking upstream fixes.
4. Revisit `@types/node` only if `engines.node` changes.

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

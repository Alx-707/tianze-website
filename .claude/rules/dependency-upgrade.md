# Dependency Upgrade Protocol

Primary reference:
- `docs/guides/dependency-upgrade-playbook.md`
- `docs/guides/CLOUDFLARE-ISSUE-TAXONOMY.md`

Use this rule file for execution-time guardrails only.
Do not duplicate the full upgrade narrative here.

## Mandatory Validation

For dependency upgrades that affect runtime, framework, lint, build, deployment, or shared tooling, run:

```bash
pnpm install
pnpm ci:local:quick
pnpm type-check
pnpm lint:check
pnpm build
pnpm build:cf
```

For upgrades that touch `next`, `@opennextjs/cloudflare`, `wrangler`, release proof, or Cloudflare deploy tooling, also run:

```bash
pnpm release:verify
```

Recommended extras when relevant:

```bash
pnpm test
pnpm test:e2e
pnpm perf:lighthouse
```

Do not run `pnpm build` and `pnpm build:cf` in parallel.

## Project Constraints

- `@types/node` must align with `package.json > engines.node`, not npm `latest`
- current Node runtime policy is `>=20.19 <23`, with `20.19.0` as the default local + CI baseline
- local `22.x` may still be supported by policy, but it is not the canonical merge-proof environment
- `eslint@10` is currently blocked by the active Next/React ESLint plugin chain
- `typescript@6` is currently deferred on this repo; keep the branch on `typescript@5.9.3` until standard `next build` is stable again
- keep `eslint` / `@eslint/js` on `9.x` until the current Next/React ESLint chain supports ESLint 10 cleanly
- `@opennextjs/cloudflare@1.18.0` is the current project baseline on the active upgrade line
- OpenNext `minify` remains disabled in `open-next.config.ts`; if an upgrade aims to re-enable it, treat that as a separate compatibility validation task

## Core Dependencies

These require full validation and careful batching:
- `next`
- `react` / `react-dom`
- `typescript`
- `next-intl`
- `tailwindcss`
- `@opennextjs/cloudflare`
- `wrangler`

## Practical Rules

- Upgrade in small batches, not all at once
- Keep low-risk patch/minor upgrades separate from higher-risk major upgrades
- Treat Cloudflare deploy-path changes as incomplete until `pnpm build:cf` passes
- If the upgrade touches the Cloudflare build chain itself, also run `pnpm build:cf:turbo` to keep the comparison path from silently rotting
- If the upgrade touches Next/OpenNext/Wrangler/Cloudflare proof scripts, do not stop at local build success; also run `pnpm release:verify`
- When a Cloudflare-related upgrade fails, classify it first:
  - platform entry / local runtime issue
  - generated artifact compatibility issue
  - current site runtime regression
  - final deployed behavior issue
- If a package also drives a CDN asset, update the CDN version together
- If an upgrade changes the verified project truth, update both `docs/guides/**` and the matching `.claude/rules/**` entries in the same batch

Current example:
- `react-scan` CDN version in `src/app/[locale]/layout.tsx`

## Rollback

If an upgrade batch fails validation:

```bash
git checkout package.json pnpm-lock.yaml
pnpm install
```

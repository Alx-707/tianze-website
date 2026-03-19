# Dependency Upgrade Protocol

Primary reference:
- `docs/guides/dependency-upgrade-playbook.md`

Use this rule file for execution-time guardrails only.
Do not duplicate the full upgrade narrative here.

## Mandatory Validation

For dependency upgrades that affect runtime, framework, lint, build, deployment, or shared tooling, run:

```bash
pnpm type-check
pnpm lint:check
pnpm build
pnpm build:cf
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
- `eslint@10` is currently blocked by the active Next/React ESLint plugin chain
- `@opennextjs/cloudflare@1.17.1` currently requires OpenNext `minify` to remain disabled in `open-next.config.ts`

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
- If a package also drives a CDN asset, update the CDN version together

Current example:
- `react-scan` CDN version in `src/app/[locale]/layout.tsx`

## Rollback

If an upgrade batch fails validation:

```bash
git checkout package.json pnpm-lock.yaml
pnpm install
```

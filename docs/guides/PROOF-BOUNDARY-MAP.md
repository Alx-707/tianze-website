# Proof Boundary Map

This document maps each proof command to what it actually validates. The goal is to prevent a green check from being treated as broader evidence than it is.

## Local proof on a developer machine

| Command | What it proves | What it does not prove |
|---------|----------------|------------------------|
| `pnpm test` / `pnpm exec vitest run` | Vitest unit and integration assertions pass against the current mocks, test fixtures, and local runtime. | Real browser behavior, visual layout quality, live network behavior, Cloudflare compatibility, or deployed site health. |
| `pnpm type-check` | TypeScript can type the project under the current strict configuration. | Runtime correctness, content quality, SEO correctness, data freshness, or whether external systems respond correctly. |
| `pnpm lint:check` | ESLint and project quality rules pass with zero warnings. | Business logic correctness, accessibility completeness, visual polish, or production behavior. |
| `pnpm build` | The Next.js production build succeeds and static/prerendered routes can be generated locally. | Cloudflare adapter compatibility, Cloudflare Pages deployment success, edge runtime behavior, or live request routing. |
| `pnpm build:cf` | The OpenNext/Cloudflare build path can produce a Cloudflare worker bundle and assets locally. | Actual Cloudflare deployment success, real edge request behavior, production environment variables, DNS, cache behavior, or smoke-test health. |
| `pnpm review:translation-quartet` | Split translation files, flat compatibility files, and public runtime copies are shape-consistent across locales. | Translation quality, market-specific wording accuracy, or whether page prose belongs in translations. |
| `pnpm review:docs-truth` | Current truth-doc guardrails still mention required files, paths, and policy anchors. | Documentation completeness, strategic correctness, or whether every doc is up to date. |

## CI proof

CI proof means the same command set runs in a clean, repeatable environment.

It proves:

- the result is not just a local-machine accident;
- generated files and dependency installation are reproducible;
- the branch can pass the configured repository gate.

It does not prove:

- Cloudflare edge behavior unless the CI job actually deploys and smokes a Cloudflare target;
- browser rendering quality unless CI includes browser-level checks;
- content or translation quality beyond the assertions encoded in tests and review scripts.

## Deployment proof

Deployment proof starts only after a Cloudflare Pages build is actually deployed.

Minimum deployment-level evidence:

- deployment succeeds on Cloudflare;
- the deployed URL responds;
- critical routes return expected status codes;
- representative localized pages load;
- structured data, canonical URLs, hreflang, and sitemap output are checked against the deployed URL when SEO behavior matters;
- form and API paths are smoke-tested when conversion behavior matters.

`pnpm build` and `pnpm build:cf` are necessary local proof. They are not deployment proof.

## Current confidence gaps

- Tests passing does not mean the deployed site works.
- Type-check passing does not mean content is correct.
- Lint passing does not mean logic is good.
- `pnpm build` passing does not mean Cloudflare Pages will deploy.
- `pnpm build:cf` passing does not mean Cloudflare edge behavior is correct.
- Translation parity does not mean the translations read naturally.
- A test using a mocked content loader proves the mock contract, not the real content corpus.
- A successful build with stale content proves the build can use that content, not that the content is current.

## How to state proof accurately

Use precise claims:

- "Vitest passed" means the test suite passed.
- "Type-check passed" means the TypeScript contract is valid.
- "Next build passed" means the local production build succeeds.
- "Cloudflare build passed" means the local OpenNext/Cloudflare bundle can be produced.
- "Deployment works" requires a deployed target plus smoke evidence.

Do not collapse these into a generic "everything works" unless the local, CI, and deployment proof levels have all been exercised.

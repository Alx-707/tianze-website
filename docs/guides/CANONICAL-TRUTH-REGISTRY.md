# Canonical Truth Registry

## Purpose
This file records the current runtime truth for the repository.

Use this when multiple files appear to describe the same system surface.
If another document conflicts with this file, treat this file plus the linked canonical sources as authoritative.

## Project Identity
- Current business project: **Tianze Website**
- Repository path: `tianze-website`
- Historical internal package name: `b2b-web-template`
- Rule:
  - treat the repository as Tianze Website in docs, reviews, and deployment decisions
  - do not use the package name as proof of current product identity

## Runtime Entrypoints

### Web request entry
- Canonical file: [`src/middleware.ts`](../../src/middleware.ts)
- Why:
  - current locale redirect, security header, and Cloudflare client-IP derivation logic live here
  - current Cloudflare build path still depends on `middleware.ts`, not `src/proxy.ts`

### Root layout truth
- Canonical file: [`src/app/[locale]/layout.tsx`](../../src/app/[locale]/layout.tsx)
- Why:
  - SSR locale and `<html lang>` truth live here
  - do not treat client-side `document.documentElement.lang` patches as runtime truth

## i18n Runtime Truth
- Canonical loader: [`src/lib/load-messages.ts`](../../src/lib/load-messages.ts)
- Canonical runtime sources:
  - [`messages/en/critical.json`](../../messages/en/critical.json)
  - [`messages/en/deferred.json`](../../messages/en/deferred.json)
  - [`messages/zh/critical.json`](../../messages/zh/critical.json)
  - [`messages/zh/deferred.json`](../../messages/zh/deferred.json)
- Important non-truth sources:
  - `messages/en.json`
  - `messages/zh.json`
- Rule:
  - the flat files are for tests and validation shape checks
  - runtime does not load them directly

## Main Shipped Lead Path
- Canonical production path: **Contact page Server Action**
- Canonical files:
  - [`src/app/[locale]/contact/page.tsx`](../../src/app/[locale]/contact/page.tsx)
  - [`src/lib/actions/contact.ts`](../../src/lib/actions/contact.ts)
- Supporting security path:
  - [`src/lib/security/client-ip.ts`](../../src/lib/security/client-ip.ts)
  - [`src/lib/security/client-ip-headers.ts`](../../src/lib/security/client-ip-headers.ts)
- Rule:
  - do not treat `/api/inquiry` or `/api/subscribe` as the default primary conversion surface without current reachability evidence

## Cloudflare Build and Proof Model

### Canonical build path
- `pnpm build:cf`
- Backed by: [`scripts/cloudflare/build-webpack.mjs`](../../scripts/cloudflare/build-webpack.mjs)

### Comparison-only path
- `pnpm build:cf:turbo`
- Use only for:
  - upstream compatibility checks
  - debugging Cloudflare/OpenNext toolchain differences

### Proof boundary
- Local page/header/cookie/redirect proof:
  - `pnpm smoke:cf:preview`
- Local strict diagnostic:
  - `pnpm smoke:cf:preview:strict`
- Stronger local split-worker proof:
  - `pnpm deploy:cf:phase6:dry-run`
- Stronger real preview publish path:
  - `pnpm deploy:cf:phase6:preview`
- Final deployed Cloudflare proof:
  - `pnpm smoke:cf:deploy -- --base-url <url>`

### Rule
- stock local preview is useful, but bounded
- stock local preview is not the same thing as split-worker proof
- phase6 dry-run is the stronger local Cloudflare proof for the current repo
- deployed smoke is the final proof for Cloudflare API behavior
- do not treat local preview alone as complete deployed truth

## Release Gate Truth
- Canonical release command: `pnpm release:verify`
- Canonical script:
  - [`scripts/release-proof.sh`](../../scripts/release-proof.sh)
- Rule:
  - this is the repository’s unified technical release gate
  - release signoff is still a separate human decision

## Production Config Truth
- Canonical validation script:
  - [`scripts/validate-production-config.ts`](../../scripts/validate-production-config.ts)
- Current production-critical env families:
  - Cloudflare deployment credentials
  - Contact / Turnstile / Server Actions secrets
  - Airtable / Resend integration secrets
  - explicit degraded overrides such as `ALLOW_MEMORY_RATE_LIMIT` and `ALLOW_MEMORY_IDEMPOTENCY`

## Test-Only / Tooling-Only Surfaces
- `messages/en.json` and `messages/zh.json`
- historical plan files under `docs/plans/**` unless a canonical guide explicitly points to them
- archive content under `docs/archive/**`
- generated and experimental worktree copies under `.claude/worktrees/**`

## Current Canonical Companions
- [`POLICY-SOURCE-OF-TRUTH.md`](../../docs/guides/POLICY-SOURCE-OF-TRUTH.md)
- [`QUALITY-PROOF-LEVELS.md`](../../docs/guides/QUALITY-PROOF-LEVELS.md)
- [`RELEASE-PROOF-RUNBOOK.md`](../../docs/guides/RELEASE-PROOF-RUNBOOK.md)
- [`.claude/rules/architecture.md`](../../.claude/rules/architecture.md)

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

## Site Identity Truth
- Canonical single-site source:
  - [`src/config/single-site.ts`](../../src/config/single-site.ts)
- Canonical site types:
  - [`src/config/site-types.ts`](../../src/config/site-types.ts)
- Canonical product catalog:
  - [`src/config/single-site-product-catalog.ts`](../../src/config/single-site-product-catalog.ts)
- Canonical compatibility consumers:
  - [`src/config/paths/site-config.ts`](../../src/config/paths/site-config.ts)
  - [`src/config/site-facts.ts`](../../src/config/site-facts.ts)
  - [`src/constants/product-catalog.ts`](../../src/constants/product-catalog.ts)
  - [`src/config/footer-links.ts`](../../src/config/footer-links.ts)
  - [`src/lib/navigation.ts`](../../src/lib/navigation.ts)
- Rule:
  - when site identity, contact facts, default SEO, navigation, footer, or market structure change, update `src/config/single-site.ts` first
  - keep wrapper modules as consumption surfaces, not places to invent new truth
  - the current cutover no longer relies on a multi-site registry or per-site message overlays
  - `pnpm compat-import-audit:strict` is now the final proof that site-skeleton dependencies are gone

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
- Canonical shared runtime sources:
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
  - runtime message truth is the shared split bundles under `messages/**`
  - do not reintroduce per-site runtime overlays without a new structural decision

## About Page Runtime Truth
- Canonical runtime route:
  - [`src/app/[locale]/about/page.tsx`](../../src/app/[locale]/about/page.tsx)
- Supplemental content assets:
  - [`content/pages/en/about.mdx`](../../content/pages/en/about.mdx)
  - [`content/pages/zh/about.mdx`](../../content/pages/zh/about.mdx)
- Rule:
  - current `/about` output comes from the route component plus translation bundles, not directly from the MDX files
  - treat the MDX files as content assets and draft truth, not the active route renderer, until the route is explicitly migrated

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
- Current Route B command truth: `pnpm build:cf`
- Underlying script: `pnpm build:cf`
- Backed by: stock `opennextjs-cloudflare build` via `package.json`

### Comparison-only path
- retired from the main tree in wave 3
  - debugging Cloudflare/OpenNext toolchain differences

### Proof boundary
- Local preview startup for current retained-patch proof mode:
  - `pnpm preview:cf`
- Local page/header/cookie/redirect diagnostic:
  - `pnpm smoke:cf:preview`
- Local strict diagnostic:
  - `pnpm smoke:cf:preview:strict`
- Preview preflight:
  - `pnpm preview:preflight:cf`
- Canonical formal Cloudflare preview proof:
  - `pnpm proof:cf:preview-deployed`
- Real preview publish primitive:
  - `pnpm deploy:cf:preview`
- Final deployed Cloudflare proof:
  - `pnpm smoke:cf:deploy -- --base-url <url>`

### Rule
- stock local preview is useful, but bounded and diagnostic
- stock local preview is the Route B canonical local Cloudflare proof lane
- `pnpm proof:cf:preview-deployed` is the canonical formal Cloudflare preview proof
- deployed smoke is the final deployed proof primitive for Cloudflare API behavior
- do not treat local preview alone as complete deployed truth

## Site Cutover Gate Truth
- Canonical preflight commands:
  - `pnpm preflight:site-cutover`
  - `pnpm preflight:site-cutover:strict`
- Why:
  - the lightweight preflight now proves single-site readiness without a pilot-site build
  - the strict variant is the final proof that the former site skeleton no longer has tracked runtime, test, build, or governance consumers

## Cloudflare Exception Contract Truth
- Canonical release-proof driver:
  - [`scripts/release-proof.sh`](../../scripts/release-proof.sh)
- Canonical exception contracts:
  - none currently active in the main tree
- Canonical exception checkers:
  - none currently active in the main tree
- Rule:
  - keep any future Cloudflare operational/build exceptions explicit instead of re-explaining them in every workflow or plan note

## Release Gate Truth
- Canonical release command: `pnpm release:verify` (Route B stock build + local stock preview release semantics)
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
  - Upstash Redis runtime store credentials

## Test-Only / Tooling-Only Surfaces
- `messages/en.json` and `messages/zh.json`
- historical plan files under `docs/plans/**` unless a canonical guide explicitly points to them
- archive content under `docs/archive/**`
- generated and experimental worktree copies under `.claude/worktrees/**`

## Current Canonical Companions
- [`POLICY-SOURCE-OF-TRUTH.md`](../../docs/guides/POLICY-SOURCE-OF-TRUTH.md)
- [`QUALITY-PROOF-LEVELS.md`](../../docs/guides/QUALITY-PROOF-LEVELS.md)
- [`RELEASE-PROOF-RUNBOOK.md`](../../docs/guides/RELEASE-PROOF-RUNBOOK.md)
- [`PREVIEW-DEGRADED-RETIREMENT-RUNBOOK.md`](../../docs/guides/PREVIEW-DEGRADED-RETIREMENT-RUNBOOK.md) (historical migration record)
- [`.claude/rules/architecture.md`](../../.claude/rules/architecture.md)

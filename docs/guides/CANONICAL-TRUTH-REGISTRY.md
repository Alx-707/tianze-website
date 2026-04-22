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
- Canonical authoring sources:
  - [`src/config/single-site.ts`](../../src/config/single-site.ts)
  - [`src/config/single-site-product-catalog.ts`](../../src/config/single-site-product-catalog.ts)
  - [`src/config/single-site-page-expression.ts`](../../src/config/single-site-page-expression.ts)
  - [`src/config/single-site-seo.ts`](../../src/config/single-site-seo.ts)
  - [`src/config/site-types.ts`](../../src/config/site-types.ts)
- Compatibility wrappers that still point at the active site truth:
  - [`src/config/paths/site-config.ts`](../../src/config/paths/site-config.ts)
  - [`src/config/site-facts.ts`](../../src/config/site-facts.ts)
  - [`src/constants/product-catalog.ts`](../../src/constants/product-catalog.ts)
  - [`src/config/footer-links.ts`](../../src/config/footer-links.ts)
  - [`src/lib/navigation.ts`](../../src/lib/navigation.ts)
- Rule:
  - when site identity, contact facts, default SEO, navigation, footer, or market structure change, update `src/config/single-site.ts` first
  - when homepage/contact/products/about/privacy/terms expression changes are intended as reusable baseline inputs, update `src/config/single-site-page-expression.ts`
  - when sitemap/robots/public-page SEO defaults change, update `src/config/single-site-seo.ts`
  - do not keep pulling implementation details into the page-expression layer; `MERGED_MESSAGES`, `SPECS_BY_MARKET`, heading-prefix constants, slugify/parsers, and JSON-LD object literals stay in the implementation layer
  - keep wrapper modules as compatibility surfaces, not the place to invent new Tianze-only truth
  - the current repository does not use a runtime `src/sites/**` registry or per-site message overlays
  - `NEXT_PUBLIC_SITE_KEY` and `build:site:equipment` are future derivative-project seams, not proof of an active multi-site runtime

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
  - current runtime message truth is the shared split bundles under `messages/**`
  - per-site overlays remain a future-only idea and must not be treated as active runtime structure
  - do not put future derivative-project facts straight into shared bundles unless they are intentionally part of the single-site baseline

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

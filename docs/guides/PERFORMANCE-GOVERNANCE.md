# Performance Governance

## Purpose
This is the single current rule for how this repository interprets performance work.

Use this document when deciding:

- what performance ideas are worth borrowing
- what should stay as backlog
- which paths must stay conservative
- which proof boundary is required before calling a change safe

If another note or plan conflicts with this file, treat this file plus the linked canonical docs as authoritative.

## One-Sentence Rule

`nextjs-perf-showcase` is a reference repo for ideas, not a template to copy into Tianze Website.

What we want is:

- less unnecessary client JavaScript
- better use of `Suspense` around real slow blocks
- tighter cache boundaries

What we do **not** want is:

- demo-style rewrites of stable pages
- page-level cache experiments on critical conversion paths
- mixing runtime/platform proof with cleanup work

## Current Good Patterns to Keep

These are already the right direction and should not be rewritten just to imitate a showcase demo:

- intent-driven islands:
  - [`src/components/layout/header-client.tsx`](../../src/components/layout/header-client.tsx)
  - [`src/components/forms/lazy-turnstile.tsx`](../../src/components/forms/lazy-turnstile.tsx)
  - [`src/components/cookie/lazy-cookie-consent-island.tsx`](../../src/components/cookie/lazy-cookie-consent-island.tsx)
  - [`src/components/monitoring/enterprise-analytics-island.tsx`](../../src/components/monitoring/enterprise-analytics-island.tsx)
- content cache boundaries:
  - [`src/lib/content/blog.ts`](../../src/lib/content/blog.ts)
  - [`src/lib/content/products.ts`](../../src/lib/content/products.ts)
  - [`src/lib/cache/invalidate.ts`](../../src/lib/cache/invalidate.ts)
  - [`src/app/api/cache/invalidate/route.ts`](../../src/app/api/cache/invalidate/route.ts)
- key pages using local `Suspense` instead of empty route-level shells:
  - [`src/app/[locale]/contact/page.tsx`](../../src/app/[locale]/contact/page.tsx)
  - [`src/app/[locale]/blog/page.tsx`](../../src/app/[locale]/blog/page.tsx)
  - [`src/app/[locale]/blog/[slug]/page.tsx`](../../src/app/[locale]/blog/[slug]/page.tsx)
  - [`src/app/[locale]/about/page.tsx`](../../src/app/[locale]/about/page.tsx)
  - [`src/app/[locale]/terms/page.tsx`](../../src/app/[locale]/terms/page.tsx)
  - [`src/app/[locale]/privacy/page.tsx`](../../src/app/[locale]/privacy/page.tsx)

## What We Borrow From the Showcase

### 1. Load non-critical JS by user intent

Default rule:

- do not push new third-party widgets, modal flows, drawers, calculators, charts, maps, video enhancement, or similar heavy UI into the initial bundle by default
- first ask whether the feature can be loaded on click, hover, visibility, or idle

Why this matters here:

- it reduces the chance that future features quietly bloat the first load
- it is a low-drama way to keep the site from getting slower over time

### 2. Use `Suspense` for slow blocks, not whole-page theater

Default rule:

- keep a meaningful page shell on the server first
- wrap the actually slow part, not the entire route just to imitate a demo
- for critical conversion pages, do not hide the real first screen behind empty route-level skeletons

Why this matters here:

- it preserves no-JS and SSR first-screen contracts
- it avoids turning stable pages into teaching demos

### 3. Keep cache boundaries narrow and boring

Default rule:

- use cache features for content reads, lists, detail pages, and paths with explicit invalidation semantics
- do **not** spread page-level `'use cache'` into critical conversion or platform-sensitive routes

High-risk paths that should stay conservative:

- Contact
- inquiry
- subscribe
- health
- server-action-heavy paths
- Cloudflare-coupled runtime paths

Why this matters here:

- this repo already has the right direction on content caching
- the real risk is not “missing a fancy cache trick”; it is accidentally expanding cache into routes where freshness, abuse protection, or runtime proof are more important than a small synthetic win

## What Is Not a Current Priority

These stay as backlog unless fresh evidence says otherwise:

- FAQ-specific bundle trimming
- demo-style streaming choreography
- turning stable routes into showcase-style rendering examples
- introducing extra local backend simulation just to mirror a showcase repo

In plain language:

- if it is not backed by route-level evidence, it is not a mainline performance project yet

## Proof Environment and Boundaries

### Node truth

For performance proof, the truth environment is Node `20.19.x`.

Do not treat a passing local result on Node `22.x` as the final answer for merge or release confidence.

### Standard build proof

When performance work affects runtime, build, or delivery behavior, keep the build proof serial:

1. `pnpm clean:next-artifacts && pnpm build`
2. `pnpm build:cf` when the change touches the Cloudflare path

Do not run `pnpm build` and `pnpm build:cf` in parallel.

### Cloudflare proof boundary

For Cloudflare behavior, use the existing proof model instead of inventing a new one here:

- current runtime truth: [`CANONICAL-TRUTH-REGISTRY.md`](./CANONICAL-TRUTH-REGISTRY.md)
- proof semantics: [`QUALITY-PROOF-LEVELS.md`](./QUALITY-PROOF-LEVELS.md)
- release sequence: [`RELEASE-PROOF-RUNBOOK.md`](./RELEASE-PROOF-RUNBOOK.md)

Practical rule:

- do not call a change “safe” for Cloudflare just because a stock local preview looked okay once

## Preferred Implementation Order

When this repo needs more performance governance work, keep the order fixed:

1. write the governance truth
2. add architecture guardrails
3. unify `LazyTurnstile` usage where applicable
4. audit dormant islands and stale docs
5. clean up only after the audit is decision-complete

This order exists to stop the common failure mode:

- documenting several ideas
- cleaning or unifying things early
- but never actually locking in the rule that prevents the same mistake from coming back

## Related Canonical Documents

- [`POLICY-SOURCE-OF-TRUTH.md`](./POLICY-SOURCE-OF-TRUTH.md)
- [`CANONICAL-TRUTH-REGISTRY.md`](./CANONICAL-TRUTH-REGISTRY.md)
- [`QUALITY-PROOF-LEVELS.md`](./QUALITY-PROOF-LEVELS.md)
- [`RELEASE-PROOF-RUNBOOK.md`](./RELEASE-PROOF-RUNBOOK.md)

## Update Rule

- if performance policy changes, update this file first
- other docs should point back here instead of redefining the same policy in parallel
- if a known issue is downgraded, migrated, or superseded, say so explicitly and link back here

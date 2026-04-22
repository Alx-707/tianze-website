# Structural Change Clusters

## Purpose
This file captures recurring co-change clusters that should be reviewed as one structural area, not as isolated files.

Source:
- [`reports/architecture/structural-hotspots-latest.md`](/Users/Data/Warehouse/Pipe/tianze-website/reports/architecture/structural-hotspots-latest.md)

## Cluster 1: Translation Critical Quartet

Files:
- `messages/en.json`
- `messages/zh.json`
- `messages/en/critical.json`
- `messages/zh/critical.json`

Why it matters:
- This is the strongest logical-coupling cluster in the repository.
- These files participate in runtime user-facing semantics, not only content storage.

Review rule:
- If one file in the quartet changes, reviewers should inspect the other three.
- If the change affects runtime-facing copy or error semantics, use at least `local-full proof`.
- Run `pnpm review:translation-quartet` to execute the quartet validation path.

## Cluster 2: Lead Submission Surfaces

Files:
- `src/lib/actions/contact.ts`
- `src/app/api/inquiry/route.ts`
- `src/app/api/subscribe/route.ts`
- `src/lib/api/lead-route-response.ts`

Why it matters:
- These submission surfaces move together historically and form one operational family.
- Changes in error handling, validation, abuse protection, or response semantics should be assessed family-wide.

Review rule:
- If one submission surface changes materially, reviewers should inspect the other family members for contract drift.
- If validation, rate-limit, or abuse logic changes, require security-aware review.
- Use [`LEAD-API-FAMILY-CONTRACT.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/LEAD-API-FAMILY-CONTRACT.md) as the explicit shared contract for this family.
- Run `pnpm review:lead-family` to execute the family contract/protection regression suite.

## Cluster 3: Homepage Section Cluster

Files:
- `src/components/sections/hero-section.tsx`
- `src/components/sections/products-section.tsx`
- `src/components/sections/final-cta.tsx`
- `src/components/sections/sample-cta.tsx`
- `src/components/sections/resources-section.tsx`
- `src/components/sections/scenarios-section.tsx`

Why it matters:
- These sections are historically co-edited and behave like one structural surface.
- Local polish in one section often implies broader page-structure drift risk.

Review rule:
- Review homepage-section changes as a cluster, especially when changing layout rhythm, proof hierarchy, or CTA sequencing.
- Use [`HOMEPAGE-SECTION-CLUSTER-CONTRACT.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/HOMEPAGE-SECTION-CLUSTER-CONTRACT.md) as the cluster contract.
- Run `pnpm review:homepage-sections` to execute the homepage section regression suite.

## Cluster 4: Locale Runtime Surface

Files:
- `src/middleware.ts`
- `src/i18n/request.ts`
- `src/i18n/locale-utils.ts`
- `src/i18n/locale-presentation.ts`
- `src/lib/load-messages.ts`
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/head.tsx`
- `src/app/global-error.tsx`
- `src/lib/seo-metadata.ts`
- `src/lib/content-utils.ts`
- `src/app/global-error.tsx`

Review rule:
- Use [`LOCALE-RUNTIME-CONTRACT.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/LOCALE-RUNTIME-CONTRACT.md) as the cluster contract.
- Run `pnpm review:locale-runtime` to execute the locale runtime regression suite.

## Cluster 5: Cache Invalidation + Health Signals

Files:
- `src/app/api/cache/invalidate/route.ts`
- `src/lib/cache/invalidate.ts`
- `src/lib/cache/cache-tags.ts`
- `src/app/api/health/route.ts`
- `src/lib/api/cache-health-response.ts`
- `src/lib/cache/invalidation-policy.ts`
- `src/lib/cache/invalidation-guards.ts`
- `tests/integration/api/cache-health-contract.test.ts`

Review rule:
- Use [`CACHE-HEALTH-CONTRACT.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CACHE-HEALTH-CONTRACT.md) as the cluster contract.
- Run `pnpm review:cache-health` to execute the cache/health regression suite.

## Usage
- Use `pnpm review:tier-a:staged` first if the staged diff touches Tier A paths.
- Use `pnpm review:clusters:staged` for the default staged structural-cluster pass. It scans the staged diff and runs every matching cluster review automatically.
- Use `pnpm review:cluster <name> --staged` when you already know a single cluster is in scope and want only that cluster's review.
- In practice, `review:clusters:staged` is the broad staged entrypoint, and `review:cluster <name> --staged` is the targeted fallback when the scope is already known.
- Use this file together with:
  - [`docs/guides/TIER-A-OWNER-MAP.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/TIER-A-OWNER-MAP.md)
  - [`docs/guides/QUALITY-PROOF-LEVELS.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
  - [`docs/guides/TRANSLATION-QUARTET-CONTRACT.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/TRANSLATION-QUARTET-CONTRACT.md)
  - [`docs/guides/HOMEPAGE-SECTION-CLUSTER-CONTRACT.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/HOMEPAGE-SECTION-CLUSTER-CONTRACT.md)
  - [`docs/guides/LOCALE-RUNTIME-CONTRACT.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/LOCALE-RUNTIME-CONTRACT.md)
  - [`docs/guides/CACHE-HEALTH-CONTRACT.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CACHE-HEALTH-CONTRACT.md)

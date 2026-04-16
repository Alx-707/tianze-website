# Architecture Guide

> For Next.js API reference, consult `.next-docs/` (indexed in CLAUDE.md).
> This file only contains **project-specific decisions** not covered by official docs.

## Project Decisions

- Node runtime truth:
  - `package.json > engines.node`: `>=20.19 <21`
  - `.nvmrc` / `.node-version`: `20.19.0`
  - GitHub Actions merge-proof baseline: `20.19.0`
  - local validation should use the same `20.19.0` baseline unless an explicit experiment branch says otherwise
- `cacheComponents: true` enabled in `next.config.ts` — Cache Components (`"use cache"`) are enabled
- **PPR** (`experimental.ppr`): Not enabled — it still requires canary and remains commented out. Note: `dynamicIO` was an older Next.js 15 canary flag that has already been superseded by `cacheComponents`; they are not two separate features.
- **Optional Cache APIs** (not yet used): `cacheTag()`, `revalidateTag()`, `updateTag()`
- Migration record: `docs/known-issues/cache-i18n-upgrade-status.md`
- Current execution order for repository evolution:
  - non-structural adoption first
  - current single-site cleanup second
  - second real site pilot next
  - formal multi-site structure last
- Current site identity truth-source:
  - `src/sites/index.ts`
  - `src/sites/tianze.ts`
  - `src/sites/tianze-equipment.ts`
  - `src/sites/tianze/product-catalog.ts`
  - `src/sites/message-overrides.ts`
  - `src/sites/types.ts`
- Compatibility wrappers remain in:
  - `src/config/paths/site-config.ts`
  - `src/config/site-facts.ts`
  - `src/constants/product-catalog.ts`
  - `src/config/footer-links.ts`
  - `src/lib/navigation.ts`
  - New site identity work should prefer `src/sites/**`, not duplicate values in wrappers
  - Site-specific copy work should prefer `src/sites/**/messages/**`, not direct edits to shared bundles unless the copy is intentionally global

### Page Props Convention

```typescript
interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}
```

## Routing & Layout

- **Locale-based**: `/[locale]/page-name` (en, zh)
- **Root layout**: Minimal wrapper
- **Locale layout**: Fonts, metadata, providers
- **Rule**: Push Client boundaries as low as possible in component tree

## Content Strategy

The project uses **dual content strategies** (details in `.claude/rules/content.md`):

| Content type | Strategy | Location |
|-------------|----------|----------|
| Blog, FAQ, Legal | MDX | `content/{posts,pages}/{locale}/` |
| About route runtime | Route component + translation bundles | `src/app/[locale]/about/page.tsx` + `messages/**` / `src/sites/**/messages/**` |
| Product catalog (specs, markets, families) | Site-layer truth + compatibility wrapper | `src/sites/**` + `src/constants/product-{catalog,specs,standards}.ts` |

**Decision rule**: Structured/tabular data consumed by multiple components → TypeScript. Narrative/editorial content → MDX, except when the active route runtime has already moved into `src/app/**` and MDX is only a supporting content asset.

## Data Fetching

**Blog/pages**: Content query system in `src/lib/content-query/`
**Product catalog**: Current site truth in `src/sites/**`, consumed through `src/constants/product-catalog.ts` + `src/constants/product-specs/`
**Site-specific copy**: shared messages in `messages/**`, optional per-site overlays in `src/sites/**/messages/**`

## Project-Specific Pitfalls

### Production Truth-Source Hygiene

- Do not trust labels like `legacy`, `deprecated`, or "currently used by" without checking actual production references.
- Before keeping, deleting, or migrating a shared helper / top-level entrypoint, distinguish:
  - production consumers under `src/**`
  - test-only consumers under `__tests__`, `tests/**`, or test helpers
- Zero-consumer or test-only top-level files should not remain in formal production namespaces such as `src/lib/*`, `src/types/*`, or `src/config/*`.
- If a module survives only because tests still import it, treat that as a migration smell, not as proof that the module is still part of the runtime truth.

### Radix UI + Dynamic Import

Radix UI + `next/dynamic` **must** use `ssr: false` to prevent hydration mismatch.

Applies to: Tabs, Dialog, Accordion, Select, DropdownMenu, Popover.

For LCP-critical content, avoid `dynamic` and use direct import.

### Hydration — Project-Specific Causes

| Cause | Fix |
|-------|-----|
| Radix UI + dynamic | `ssr: false` (see above) |
| Date/Time rendering | Use `useEffect` in Client Component |
| Invalid HTML nesting (div inside p) | Fix DOM structure |
| `next/script` `beforeInteractive` + CSP nonce | Use `afterInteractive` or `lazyOnload` |

## Middleware / Proxy

Project currently uses `src/middleware.ts`:
- ✅ Locale detection and redirect (next-intl)
- ✅ Security headers injection (CSP nonce)
- ✅ Compatible with current `pnpm build:cf` / OpenNext Cloudflare chain
- ❌ **No authentication**

Notes:
- `src/app/[locale]/layout.tsx` remains the true root layout; server-side `<html lang>` output was not rolled back.
- `src/components/language-toggle.tsx` and `src/components/layout/mobile-navigation.tsx` still consume locale from `next-intl` context.
- Re-migrating to `src/proxy.ts` stays a future task after Cloudflare/OpenNext support is verified.

**Compatibility record**: See `docs/known-issues/middleware-to-proxy-migration.md`

## Cloudflare Verification Policy

> [2026-03-26] Decision — local stock preview cannot faithfully reproduce `/api/health` under the split-worker topology. The failure is an upstream OpenNext/Wrangler local-preview limitation, not an application defect.

**Cloudflare is the primary deployment platform.** Verification is split into two layers:

- Current canonical build chain:
  - `pnpm build:cf` → formal Cloudflare build path, now backed by the repo's Webpack-based wrapper
  - `pnpm preview:cf` / `pnpm deploy:cf` → follow the same current canonical `build:cf` output
  - `pnpm build:cf:turbo` → comparison / fallback path for debugging upstream Turbopack/OpenNext behavior, not the default production build path
- `pnpm release:verify` → current unified release gate; now includes clean standard build, `build:site:equipment`, `build:cf`, `deploy:cf:phase6:dry-run` (dry-run only, not a real publish), and release smoke
  - `node scripts/cloudflare/deploy-phase6.mjs --env preview` → current stronger real preview path for Cloudflare proof

| Layer | Scope | Command | Release-blocking? |
|-------|-------|---------|-------------------|
| **Local preview** | Pages, redirects, cookies, headers, middleware behavior | `pnpm smoke:cf:preview` | Yes |
| **Deployed smoke** | API routes (`/api/health`, Server Actions) | `node scripts/deploy/post-deploy-smoke.mjs --base-url <url>` | Yes (post-deploy) |

- `pnpm smoke:cf:preview:strict` (includes `/api/health` in local preview) is a **diagnostic tool**, not a release gate. Its failure does not block releases.
- Local preview is still a bounded proof surface even though `build:cf` now uses Webpack by default; do not treat local Wrangler behavior as a complete substitute for deployed Cloudflare evidence.
- As of 2026-04-01, the repo-local compatibility patch in `scripts/cloudflare/patch-prefetch-hints-manifest.mjs` restores stock local page preview on the upgraded stack; page routes are no longer the main blocker.
- `pnpm preview:cf:wrangler` remains a diagnostics-only path. If it still hangs or returns request-context/runtime errors while `pnpm smoke:cf:preview` passes, treat that as a Wrangler local-runtime boundary rather than a page-level regression.
- The strongest current proof surface is the real phase6 preview deploy plus post-deploy smoke, not stock local preview alone.
- `pnpm release:verify` still stops at `pnpm deploy:cf:phase6:dry-run`; do not describe that dry-run path as the same thing as a real preview publish.
- Final API proof happens **only after real Cloudflare deployment**, via the post-deploy smoke in the deploy workflow.
- If post-deploy smoke fails, rollback to the previous deployment.

**Upstream reference**: [opennextjs/opennextjs-cloudflare#1157](https://github.com/opennextjs/opennextjs-cloudflare/issues/1157), [#1082](https://github.com/opennextjs/opennextjs-cloudflare/issues/1082)

## Route Deletion Checklist

When removing any route (page), grep and clean ALL of these:

| Location | What to check |
|----------|--------------|
| `src/app/sitemap.ts` | Remove URL generation for deleted route |
| `src/config/paths/paths-config.ts` | Remove route from `DYNAMIC_PATHS_CONFIG` |
| `src/config/paths/types.ts` | Remove from `DynamicPageType` union |
| `src/lib/i18n/route-parsing.ts` | Remove from `DYNAMIC_ROUTE_PATTERNS` |
| Test files | Remove/update test cases referencing the route |
| Navigation components | Remove links to the deleted route |
| `src/constants/` | Remove helper functions for the deleted route's params |

> [2026-03-23] Origin — PR #41 Codex review caught sitemap dead links after family route deletion.

## Key Files

| File | Purpose |
|------|---------|
| `src/i18n/request.ts` | Translation loading |
| `src/i18n/routing.ts` | Locale config |

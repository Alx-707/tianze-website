# Architecture Guide

> For Next.js API reference, consult `.next-docs/` (indexed in CLAUDE.md).
> This file only contains **project-specific decisions** not covered by official docs.

## Project Decisions

- `cacheComponents: true` enabled in `next.config.ts` — Cache Components (`"use cache"`) are enabled
- **PPR** (`experimental.ppr`): Not enabled — it still requires canary and remains commented out. Note: `dynamicIO` was an older Next.js 15 canary flag that has already been superseded by `cacheComponents`; they are not two separate features.
- **Optional Cache APIs** (not yet used): `cacheTag()`, `revalidateTag()`, `updateTag()`
- Migration record: `docs/known-issues/cache-i18n-upgrade-status.md`

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
| Blog, About, FAQ, Legal | MDX | `content/{posts,pages}/{locale}/` |
| Product catalog (specs, markets, families) | TypeScript constants | `src/constants/product-{catalog,specs,standards}.ts` |

**Decision rule**: Structured/tabular data consumed by multiple components → TypeScript. Narrative/editorial content → MDX.

## Data Fetching

**Blog/pages**: Content query system in `src/lib/content-query/`
**Product catalog**: Direct imports from `src/constants/product-catalog.ts` + `src/constants/product-specs/`

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

| Layer | Scope | Command | Release-blocking? |
|-------|-------|---------|-------------------|
| **Local preview** | Pages, redirects, cookies, headers, middleware behavior | `pnpm smoke:cf:preview` | Yes |
| **Deployed smoke** | API routes (`/api/health`, Server Actions) | `node scripts/deploy/post-deploy-smoke.mjs --base-url <url>` | Yes (post-deploy) |

- `pnpm smoke:cf:preview:strict` (includes `/api/health` in local preview) is a **diagnostic tool**, not a release gate. Its failure does not block releases.
- Local preview is still a bounded proof surface even though `build:cf` now uses Webpack by default; do not treat local Wrangler behavior as a complete substitute for deployed Cloudflare evidence.
- As of 2026-03-27, the local preview server can still render middleware-only redirects correctly while returning 500 for page requests like `/en` and `/en/contact` because Wrangler local runtime hits a `middleware-manifest.json` dynamic-require failure. Treat that as a local preview limitation unless the same failure reproduces after deployment.
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

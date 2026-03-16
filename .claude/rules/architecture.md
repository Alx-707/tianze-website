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

## Data Fetching

**Project data**: Cached functions in `src/lib/content/` (e.g., `getAllProductsCached()`)

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

## Key Files

| File | Purpose |
|------|---------|
| `src/i18n/request.ts` | Translation loading |
| `src/i18n/routing.ts` | Locale config |

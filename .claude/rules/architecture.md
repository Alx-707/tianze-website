# Architecture Guide

> For Next.js API reference, consult `.next-docs/` (indexed in CLAUDE.md).
> This file only contains **project-specific decisions** not covered by official docs.

## Project Decisions

- `cacheComponents: true` enabled in `next.config.ts`
- **PPR / dynamicIO**: Not enabled. See `docs/known-issue/nextjs-i18n-future-upgrade-checklist.md`.
- **Optional Cache APIs** (not yet used): `cacheTag()`, `revalidateTag()`, `updateTag()`

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

Project uses `middleware.ts`:
- ✅ Locale detection and redirect (next-intl)
- ✅ Security headers injection (CSP nonce)
- ❌ **No authentication**

**Proxy migration**: See `docs/known-issue/middleware-to-proxy-migration.md`

## Key Files

| File | Purpose |
|------|---------|
| `src/i18n/request.ts` | Translation loading |
| `src/i18n/routing.ts` | Locale config |

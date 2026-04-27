# Architecture Constraints

> For Next.js API reference, consult `.next-docs/` (indexed in CLAUDE.md).
> This file mixes Next.js official constraints with repo-only pitfalls. Repo-only items are labeled below.

## Page Props Convention

Matches Next.js 16 async request APIs: `params` / `searchParams` are Promises in App Router pages and layouts.

```typescript
interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}
```

## Routing & Layout

- **Locale-based**: `/[locale]/page-name` (en, zh)
- **Rule**: Push `"use client"` as low as possible — wrap only the interactive leaf, not the layout. This matches Next.js guidance to keep non-interactive UI in Server Components and reduce client JavaScript.

```typescript
// ❌ Entire section is client
'use client';
export function ProductSection({ products }) { ... }

// ✅ Only the interactive part is client
export function ProductSection({ products }) {       // Server Component
  return products.map(p => <ProductCard key={p.id} product={p} />);
}
// separate file:
'use client';
export function ProductCard({ product }) { ... }     // Client only where needed
```

## Route Error Boundary Policy

Use route-level `error.tsx` for pages where a buyer-facing flow depends on dynamic data, form/runtime services, or route parameters:

- `contact` has a route boundary because it contains the lead form path.
- `products` has a route boundary because catalog/product rendering is a main buyer path.
- `blog/[slug]` has a route boundary because every request depends on a dynamic content slug.

Pure static MDX/legal/about-style pages may rely on the layout/global fallback unless they add external fetches, user actions, or dynamic route parameters. If a static page later becomes interactive or externally data-backed, add a route-level boundary in the same change.

## Cache Policy

- `React.cache()` is for request-level dedupe: same request, same arguments, same result. Use it for low-level content reads like `getPageBySlug()` and `getPostBySlug()` when metadata and page rendering can ask for the same file.
- `'use cache'`, `cacheLife()`, and `cacheTag()` are cross-request Cache Components APIs. Non-conversion pages may use a narrow `"use cache"` + `cacheLife()` boundary when Next.js build requires it, but `cacheTag()` and runtime tag invalidation are not part of the current launch path without an explicit Cloudflare/OpenNext proof plan.
- Reserve the `*Cached` suffix for exported cross-request/cache-components wrappers. Do not use `*Cached` for a plain low-level helper unless it actually defines the cache boundary.

## Project-Specific Pitfalls

### Radix UI + Dynamic Import

This is a **repo mitigation**, not a universal Next.js rule:

- If a Radix-based interactive widget is dynamically imported and SSR causes hydration mismatch in this repo, default to a client wrapper with `next/dynamic(..., { ssr: false })`
- If the component is LCP-critical or renders correctly on the server, prefer direct import instead of forcing `ssr: false`

Applies to: Tabs, Dialog, Accordion, Select, DropdownMenu, Popover.

For LCP-critical content, avoid `dynamic` and use direct import.

### Hydration — Project-Specific Causes

| Cause | Fix |
|-------|-----|
| Radix UI + dynamic | First classify it as a repo-specific mismatch; if SSR is the cause here, use `ssr: false` (see above) |
| Date/Time rendering | Use `useEffect` in Client Component |
| Invalid HTML nesting (div inside p) | Fix DOM structure |
| `next/script` `beforeInteractive` + CSP nonce | Use `afterInteractive` or `lazyOnload` |

### Production Truth-Source Hygiene

- Before keeping or deleting a shared helper, distinguish production consumers (`src/**`) from test-only consumers (`__tests__/`, `tests/**`).
- Zero-consumer or test-only files should not remain in `src/lib/*`, `src/types/*`, or `src/config/*`.

## Route Deletion Steps

When removing any route (page), follow this order:

1. Delete the route directory under `src/app/[locale]/`
2. Remove from `src/config/paths/types.ts` — delete from `DynamicPageType` union
3. Remove from `src/config/paths/paths-config.ts` — delete from `DYNAMIC_PATHS_CONFIG`
4. Remove from `src/lib/i18n/route-parsing.ts` — delete from `DYNAMIC_ROUTE_PATTERNS`
5. Remove from `src/app/sitemap.ts` — delete URL generation for the route
6. Remove navigation links — grep `src/components/` for the route path
7. Remove param helpers — grep `src/constants/` for the route's slug/params
8. Remove/update tests — grep `__tests__/` and `tests/` for route references
9. Run `pnpm type-check` — TypeScript will catch remaining dangling imports

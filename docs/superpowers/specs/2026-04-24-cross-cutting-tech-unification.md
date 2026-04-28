# Cross-Cutting Technical Unification Spec

> PR #84 unified **content truth** (what information lives where).
> This spec unifies **technical patterns** (how the same technical problem is solved across all pages).

## Principle

Each cross-cutting technical concern has exactly one canonical implementation. Pages use it; they don't reinvent it.

---

## Item 1: Structured Data / JSON-LD — FRAGMENTED

### Current State

Three generations of schema builders coexist:

| Layer | File | Used By |
|-------|------|---------|
| Generic | `src/lib/structured-data.ts` | Layout (Organization, WebSite) |
| Type-specific | `src/lib/structured-data-generators.ts` | Blog, Product market |
| Legacy helpers | `src/lib/structured-data-helpers.ts` | Blog (article), FAQ (unused!) |
| FAQ-specific | `src/lib/content/mdx-faq.ts` (`generateFaqSchemaFromItems`) | Nobody — dead code |

Two pages inline their own schemas instead of using helpers:
- Retired equipment capability page — historical inline ItemList schema
- `oem-custom-manufacturing/page.tsx` — inline WebPage schema

FAQ schema helpers exist but are never called. FaqSection component generates FAQ JSON-LD internally via the legacy `generateFAQSchema` from `structured-data-helpers.ts`.

Two injection points: layout-level `<JsonLdScript>` (Organization+WebSite) and page-level `<JsonLdScript>` (per-page schemas). No documented split.

### Target State

1. One schema builder module: consolidate into `src/lib/structured-data-generators.ts`
2. Every page calls a typed builder function — no inline `@context` objects
3. FAQ schema goes through `generateFaqSchemaFromItems` (already accepts `FaqItem[]` + locale)
4. Remove unused `generateFAQSchema` from `structured-data-helpers.ts` after migration
5. Document layout vs page JSON-LD split in `.claude/rules/`

### Files to Change

- Create: `buildEquipmentListSchema()`, `buildOemPageSchema()` in `structured-data-generators.ts`
- Modify: `oem-custom-manufacturing/page.tsx` — use builders; the old equipment capability page is no longer live
- Modify: `faq-section.tsx` — use `generateFaqSchemaFromItems` instead of `generateFAQSchema`
- Delete: `generateFAQSchema` from `structured-data-helpers.ts` (after all callers migrated)
- Delete: dead `generateBreadcrumbSchema` from `structured-data-helpers.ts` if unused
- Create: `.claude/rules/structured-data.md` documenting the split

---

## Item 2: Error Boundaries — INCONSISTENT

### Current State

Only 2 of 11 pages have `error.tsx`:
- `contact/error.tsx` ✓
- `products/error.tsx` ✓

Both use `<RouteErrorView>` with i18n error messages. Other 9 pages have no error boundary — errors bubble to layout-level default.

No documented policy explaining why only these two pages have boundaries.

### Target State

Decision required (pick one):

**Option A: All pages get error.tsx**
- Every `src/app/[locale]/*/` directory gets an `error.tsx`
- Uses shared `<RouteErrorView>` component
- Add per-page error translation keys

**Option B: Only interactive/data-fetching pages get error.tsx**
- Contact ✓ (form submission)
- Products ✓ (catalog data)
- Blog detail (external content)
- About, Privacy, Terms, Home, OEM, Bending — static enough to skip
- Document this policy in `.claude/rules/conventions.md`

**Recommendation: Option B** — static content pages fail gracefully via layout error boundary. Document the policy.

### Files to Change

- Create: `blog/[slug]/error.tsx` (fetches dynamic content, should have boundary)
- Create: Document error boundary policy in `.claude/rules/conventions.md`

---

## Item 3: Route Configuration — SCATTERED

### Current State

Route paths exist in 4+ locations:
1. `src/config/paths/types.ts` — `PageType` union (canonical page types)
2. `src/config/paths/paths-config.ts` — `DYNAMIC_PATHS_CONFIG` (partial)
3. `src/lib/i18n/route-parsing.ts` — `DYNAMIC_ROUTE_PATTERNS` (duplicate path strings)
4. `src/config/single-site-seo.ts` — `SINGLE_SITE_PUBLIC_STATIC_PAGES` array
5. Individual page files — path strings in `generateMetadataForPath({ path: "/contact" })`
6. Navigation config — `src/lib/navigation.ts` or similar

No single file answers "what are ALL the routes in this project?"

### Target State

1. `src/config/paths/paths-config.ts` is the single source of truth for all route paths
2. `PageType` union auto-derives from the config (already partially true)
3. SEO, sitemap, navigation all reference this config — no duplicate path strings
4. `generateMetadataForPath` reads path from config instead of receiving it as a string param

### Files to Change

- Modify: `paths-config.ts` — ensure all routes are listed with their paths
- Modify: Page files — import path from config instead of hardcoding `/contact` etc.
- Modify: `single-site-seo.ts` — derive `SINGLE_SITE_PUBLIC_STATIC_PAGES` from paths config
- Modify: `route-parsing.ts` — derive patterns from paths config

---

## Item 4: Caching Strategy — MIXED

### Current State

Three caching mechanisms in use:
1. `React.cache()` — used for `getTranslationsCached` (request-level dedup)
2. `unstable_cache()` — used for message loading (build/ISR cache with tags)
3. Blog: `getAllPostsCached` / `getPostBySlugCached` — name implies caching but need to verify implementation

`getPageBySlug()` has NO caching — called twice per page render (once in `generateMetadata`, once in content component). This was identified in the simplify review but not yet fixed.

### Target State

1. Wrap `getPageBySlug` with `React.cache()` for request-level dedup (eliminates double reads)
2. Document the caching layers in `.claude/rules/conventions.md`:
   - `React.cache()` = request-level dedup (same request, same args → same result)
   - `unstable_cache()` / `'use cache'` = cross-request cache (ISR/build)
3. Naming convention: `*Cached` suffix for `React.cache()` wrapped functions

### Files to Change

- Modify: `src/lib/content-query/queries.ts` — wrap `getPageBySlug` with `React.cache()`
- Verify: `getAllPostsCached`, `getPostBySlugCached` actually use caching
- Document: Caching strategy in `.claude/rules/conventions.md`

---

## Item 5: Static Params — ONE DEVIATION

### Current State

`generateLocaleStaticParams()` helper exists and is used by all pages except:
- Home page (`src/app/[locale]/page.tsx`) — inlines identical logic

Multi-param pages (blog/[slug], products/[market], [...rest]) intentionally deviate — these are correct.

### Target State

Home page calls `generateLocaleStaticParams()` instead of inlining.

### Files to Change

- Modify: `src/app/[locale]/page.tsx` — import and use helper

---

## Item 6: Structured Data Injection Points — UNDOCUMENTED

### Current State

JSON-LD is injected at two levels:
1. **Layout level** (`layout.tsx`) — Organization + WebSite (site-wide, once per page)
2. **Page level** (individual pages) — per-page schemas (FAQ, Article, Product, etc.)

This split is correct but not documented anywhere.

### Target State

Document in `.claude/rules/structured-data.md`:
- Layout: site-wide identity schemas (Organization, WebSite)
- Page: page-specific schemas (FAQ, Article, Product, AboutPage, etc.)
- Component: never (FaqSection should NOT generate its own schema — page should pass it)

This is covered by Item 1's documentation task.

---

## Priority Order

| # | Item | Effort | Impact | Priority |
|---|------|--------|--------|----------|
| 4 | Cache `getPageBySlug` | Small | High (eliminates N double reads) | P0 |
| 1 | Structured data consolidation | Medium | Medium (SEO quality + maintainability) | P1 |
| 5 | Home page static params | Trivial | Low (consistency) | P1 |
| 2 | Error boundary policy | Small | Medium (resilience) | P1 |
| 3 | Route config centralization | Medium | Medium (maintainability) | P2 |
| 6 | Documentation | Small | Low (clarity) | P2 |

## Acceptance Criteria

- `pnpm type-check` passes
- `pnpm test` passes
- `pnpm ci:local:quick` passes
- `pnpm test:coverage` confirms incremental coverage ≥ 70%
- No inline `@context` objects remain in page files
- `getPageBySlug` wrapped with `React.cache()`
- Error boundary policy documented

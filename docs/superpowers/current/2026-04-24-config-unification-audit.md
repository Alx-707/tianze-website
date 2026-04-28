# Project Configuration Unification Audit

Date: 2026-04-24

This is the current-state audit for project-wide "same problem, different scheme" drift after PR #84. It verifies the two supplied issue sources against live code, merges overlaps, adds missed findings, and classifies each item as either "must unify" or "reasonable exception to document".

## Repair status

The confirmed "must unify" items from this audit have been repaired in the follow-up commits listed in `docs/superpowers/plans/2026-04-24-config-unification-governance.md`.

Two items remain as documented exceptions, not open repair tasks:

- Home page content is still a structured campaign landing page instead of MDX. This is intentional for now and documented in `.claude/rules/content.md`.
- Product market pages stay mixed by design: FAQ belongs to MDX, catalog/spec data stays typed config, and reusable market labels/descriptions stay in i18n.

## Executive verdict

The problem is real. PR #84 unified most content authorship, but several cross-cutting systems still have old and new patterns living together:

- Structured data has the most visible drift: page/component-level inline JSON-LD, legacy helper exports, and multiple builder locations.
- Content/config ownership still has two important leftovers: About shell prose in Layer 2 config, and product market FAQ in the shared translation pool.
- Route, sitemap, cache, and error-boundary policies mostly work at runtime but do not have one obvious project contract.
- Environment variable access is technically guarded, but the production runtime contract uses variables that are not all declared in the central app env schema.

I will treat this as a repair lane, not a rewrite lane: unify the high-risk duplicate mechanisms, and document intentional mixed-page exceptions instead of forcing every page into MDX if that would make the page less maintainable.

## Source A verification

| Source A item | Status | Evidence | Decision |
|---|---|---|---|
| Structured data fragmented | Confirmed | `src/lib/structured-data-generators.ts`, `src/lib/structured-data-helpers.ts`, `src/lib/structured-data.ts`, `src/lib/content/mdx-faq.ts`; inline `@context` in the then-live equipment capability page, `src/app/[locale]/oem-custom-manufacturing/page.tsx`, `src/components/content/about-page-shell.tsx`, `src/components/content/legal-page-shell.tsx`, `src/components/products/catalog-breadcrumb.tsx` | Must unify. Builders stay in `structured-data-generators.ts`; components/pages call builders, not hand-roll schema objects. |
| Error boundaries inconsistent | Confirmed | Only `src/app/[locale]/contact/error.tsx` and `src/app/[locale]/products/error.tsx` exist; blog detail fetches dynamic content without a route error boundary. | Must unify by policy: add blog detail boundary; document why pure static pages can rely on global/layout fallback. |
| Route configuration scattered | Confirmed | Routes exist in `src/config/paths/paths-config.ts`, `src/config/paths/utils.ts`, `src/lib/i18n/route-parsing.ts`, `src/config/single-site-seo.ts`, and hardcoded page metadata calls. | Must unify enough to make `paths-config.ts` the route source for static sitemap/metadata paths. Dynamic route regex can derive from dynamic path config. |
| Caching strategy mixed | Confirmed | Blog wrappers use `'use cache'`; `getPageBySlug()` is uncached and called in both metadata and page rendering for About/Contact/OEM/Bending. | Must unify: wrap page/post slug lookup with `React.cache()` for request-level dedupe and document cache layers. |
| Static params one deviation | Confirmed | Home page imports `routing` and maps locales inline instead of using `generateLocaleStaticParams()`. | Must unify. |
| JSON-LD injection split undocumented | Confirmed | Layout injects Organization/WebSite; pages/components inject page-specific schemas; no rule file records the split. | Must document in `.claude/rules/structured-data.md`. |

## Source B verification

| Source B item | Status | Evidence | Decision |
|---|---|---|---|
| About values/stats/CTA prose in Layer 2 | Confirmed | `SINGLE_SITE_ABOUT_SHELL_COPY` in `src/config/single-site-page-expression.ts`; comment already marks it as known debt. | Must unify: move prose into About MDX frontmatter; keep only item keys/stats mapping/CTA href in Layer 2. |
| Product market FAQ uses shared translation pool | Confirmed | `SINGLE_SITE_MARKET_FAQ_ITEMS` plus `messages/*/deferred.json` `faq.items.*`; `products/[market]/page.tsx` passes shared keys to `FaqSection`. | Must unify: move product market FAQ content to page-owned MDX frontmatter and pass direct FAQ items. |
| Structured data each page builds itself | Confirmed and overlaps Source A | Inline builders in page/components. | Must unify under Source A structured-data task. |
| Home has no content layer | Confirmed | `src/app/[locale]/page.tsx` builds from section order + `home` translation namespace; no `content/pages/*/home.mdx`. | Reasonable exception for now, but must document. Home is a structured campaign landing assembled from reusable sections; migrating the whole home page to MDX is a separate conversion-copy rewrite, not a safe cross-cutting repair. Metadata path should still use route config. |
| Product market content ownership unclear | Confirmed | Product catalog in `src/config/single-site-product-catalog.ts`, specs in `src/constants/product-specs/*`, market copy in `messages/*`, FAQ in shared pool. | Mixed page design is reasonable if documented. FAQ moves to MDX; catalog/spec tables remain typed structured data; market labels/descriptions remain i18n because they are catalog labels used by cards and dynamic routes. |
| Sitemap lastmod half manual | Confirmed | `SINGLE_SITE_STATIC_PAGE_LASTMOD` manually covers home/products/blog/product markets; MDX pages use `getMdxPageLastModified()`. | Must document/update contract and reduce static public pages duplication. Full automatic lastmod for non-MDX product/home is not available without a content source. |
| Env vars lack one contract across app/scripts/deploy | Partly confirmed | App code uses `@/lib/env`; review scripts pass. But `validate-production-config.ts` requires `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, `ALLOW_MEMORY_RATE_LIMIT`, `ALLOW_MEMORY_IDEMPOTENCY`, which are not declared in `src/lib/env.ts`. | Must unify contract by adding missing runtime/degraded flags to central schema and documenting which layer owns app, script, and deployment env. |

## Additional findings from live scan

| Finding | Evidence | Decision |
|---|---|---|
| Breadcrumb JSON-LD is component-local | `src/components/products/catalog-breadcrumb.tsx` has a private `buildJsonLd()` with inline `@context`. | Fold into structured-data builders. |
| Legal page JSON-LD is shell-local | `src/components/content/legal-page-shell.tsx` builds schema inline. | Fold into structured-data builders. |
| About JSON-LD is shell-local | `src/components/content/about-page-shell.tsx` builds schema inline. | Fold into structured-data builders. |
| `PATHNAMES` hardcodes static and dynamic routes separately | `src/config/paths/utils.ts` duplicates paths already in `PATHS_CONFIG` and `DYNAMIC_PATHS_CONFIG`. | Derive from config. |
| Dynamic route regex duplicates dynamic route paths | `src/lib/i18n/route-parsing.ts` hardcodes `/products/...` and `/blog/...`. | Derive regex/link builders from dynamic path config. |
| Page metadata still passes literal paths | Multiple `generateMetadataForPath({ path: "/..." })` calls. | Use `getLocalizedPath(pageType, locale)` for static pages. Keep dynamic paths composed from config + slug. |

## Priority and repair classification

### P0 - immediate correctness / repeated work

1. Cache page/post slug lookups with `React.cache()`.
2. Switch Home static params to `generateLocaleStaticParams()`.

### P1 - unified cross-cutting implementation

3. Structured data builders and JSON-LD policy.
4. Blog detail error boundary and error-boundary policy.
5. About prose and product market FAQ ownership fixes.

### P2 - governance and drift prevention

6. Route/static sitemap derivation from path config.
7. Env contract schema/doc alignment.
8. Content-rule documentation for intentional Home/Product-market mixed-page exceptions.

## Non-goals

- Do not migrate the full Home landing page into MDX in this repair lane. It is a campaign-style composed page; forcing all section copy through one MDX frontmatter block would be a content rewrite, not a config-unification repair.
- Do not remove product catalog/spec typed config. Product families, standards, dimensions, and equipment specs are structured data, not prose.
- Do not push or create a PR.

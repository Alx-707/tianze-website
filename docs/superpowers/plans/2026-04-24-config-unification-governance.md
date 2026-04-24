# Config Unification Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the confirmed "same problem, different scheme" drift in configuration, structured data, content ownership, routes, cache policy, error boundaries, sitemap policy, and environment contracts.

**Architecture:** Keep the repair narrow: move reusable mechanics to single builders/config helpers, move confirmed prose leftovers into MDX, and document intentional mixed-page exceptions. Do not rewrite the Home landing page or product catalog architecture; those are documented exceptions, not safe quick migrations.

**Tech Stack:** Next.js 16.2 App Router, Cache Components, React 19.2 `cache`, next-intl 4.8, TypeScript strict, MDX content, Vitest.

---

## Execution status

Completed on `main` as isolated commits:

| Area | Commit |
|---|---|
| Request-level content cache and Home static params | `16d13e5 fix(content): cache slug queries` |
| Canonical JSON-LD builders and policy | `71ac649 fix(seo): unify json ld builders` |
| About/product-market content ownership | `90f8ff9 fix(content): align page ownership` |
| Blog error boundary and cache/error policy docs | `acf1ad5 fix(routes): add blog error policy` |
| Route/static sitemap derivation | `44cbda7 fix(routes): derive route config` |
| Environment runtime contract | `9969a94 fix(env): align runtime contract` |
| Legacy schema helper cleanup | `fb8545a refactor(seo): remove legacy schema helpers` |

Implementation note: `PATHNAMES` stayed as literal `as const` route data because deriving it with `Object.fromEntries()` breaks `next-intl` typed-route inference. The duplicated dynamic parsing/static sitemap pieces were still moved to derive from route config.

## Files map

- `src/lib/content-query/queries.ts` - wrap slug lookups in `React.cache()` for request-level dedupe.
- `src/app/[locale]/page.tsx` - reuse locale static params helper and route path config.
- `src/lib/structured-data-generators.ts` - canonical structured-data builders.
- `src/components/content/about-page-shell.tsx` - read About prose from MDX metadata and call schema builder.
- `content/pages/en/about.mdx`, `content/pages/zh/about.mdx` - own About values/stats/CTA prose.
- `src/components/content/legal-page-shell.tsx` - call schema builder.
- `src/components/products/catalog-breadcrumb.tsx` - call schema builder.
- `src/components/sections/faq-section.tsx` - remove legacy FAQ schema path.
- `src/app/[locale]/capabilities/bending-machines/page.tsx` - call equipment schema builder.
- `src/app/[locale]/oem-custom-manufacturing/page.tsx` - call OEM schema builder.
- `.claude/rules/structured-data.md` - JSON-LD contract.
- `.claude/rules/conventions.md` - error-boundary and cache policy.
- `.claude/rules/content.md` - documented exceptions for Home and product market mixed pages.
- `src/app/[locale]/blog/[slug]/error.tsx` - dynamic blog route error boundary.
- `messages/en.json`, `messages/zh.json` - blog route error copy.
- `content/pages/en/product-market.mdx`, `content/pages/zh/product-market.mdx` - product-market FAQ ownership.
- `src/app/[locale]/products/[market]/page.tsx` - pass MDX FAQ items instead of shared translation keys.
- `src/config/single-site-page-expression.ts` - remove About prose and market FAQ key pool.
- `src/types/content.types.ts` - typed optional frontmatter for About page sections.
- `src/config/paths/paths-config.ts`, `src/config/paths/utils.ts`, `src/lib/i18n/route-parsing.ts`, `src/config/single-site-seo.ts`, `src/app/sitemap.ts` - route/sitemap config derivation.
- `src/lib/env.ts`, `.claude/rules/security.md` - env contract alignment.
- Tests under existing colocated `__tests__` folders - update assertions for changed contracts.

## Task 1: Request-level content cache and Home static params

- [ ] **Step 1: Read current tests**

Run:

```bash
pnpm vitest src/lib/content-query/__tests__/queries.test.ts 'src/app/[locale]/__tests__/page.test.tsx' --run
```

Expected: existing tests pass or expose baseline assumptions before edits.

- [ ] **Step 2: Update `queries.ts`**

Wrap `getPostBySlug` and `getPageBySlug` with `cache()` from React:

```ts
import { cache } from "react";

export const getPostBySlug = cache(function getPostBySlug(
  slug: string,
  locale?: Locale,
): Promise<BlogPost> {
  return getContentBySlug<BlogPostMetadata>(
    slug,
    "posts",
    locale,
  ) as Promise<BlogPost>;
});

export const getPageBySlug = cache(function getPageBySlug(
  slug: string,
  locale?: Locale,
): Promise<Page> {
  return getContentBySlug<PageMetadata>(slug, "pages", locale) as Promise<Page>;
});
```

- [ ] **Step 3: Update Home page static params**

Replace inline locale mapping with:

```ts
import {
  generateLocaleStaticParams,
  type LocaleParam,
} from "@/app/[locale]/generate-static-params";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface HomePageProps {
  params: Promise<LocaleParam>;
}
```

- [ ] **Step 4: Verify**

Run:

```bash
pnpm vitest src/lib/content-query/__tests__/queries.test.ts 'src/app/[locale]/__tests__/page.test.tsx' --run
pnpm type-check
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/content-query/queries.ts 'src/app/[locale]/page.tsx' 'src/app/[locale]/__tests__/page.test.tsx'
git commit -m "fix(content): cache slug queries"
```

## Task 2: Structured data unification

- [ ] **Step 1: Add canonical builders**

Add typed builders to `src/lib/structured-data-generators.ts`:

```ts
export function buildEquipmentListSchema(input: {
  name: string;
  items: Array<{ name: string; description: string }>;
}): Record<string, unknown> { ... }

export function buildOemPageSchema(input: {
  name: string;
  description?: string;
  locale: string;
  specialty: string;
}): Record<string, unknown> { ... }

export function buildAboutPageSchema(input: {
  title: string;
  description?: string;
  locale: string;
  companyName: string;
  established: string | number;
  employees: number;
}): Record<string, unknown> { ... }

export function buildLegalPageSchema(input: {
  schemaType: "PrivacyPolicy" | "WebPage";
  additionalType?: string;
  locale: string;
  name: string;
  description?: string;
  publishedAt?: string;
  modifiedAt?: string;
}): Record<string, unknown> { ... }

export function buildBreadcrumbListSchema(
  items: Array<{ name: string; url: string }>,
): Record<string, unknown> { ... }
```

- [ ] **Step 2: Replace inline schema call sites**

Update:

- `src/app/[locale]/capabilities/bending-machines/page.tsx`
- `src/app/[locale]/oem-custom-manufacturing/page.tsx`
- `src/components/content/about-page-shell.tsx`
- `src/components/content/legal-page-shell.tsx`
- `src/components/products/catalog-breadcrumb.tsx`

Each file should import the relevant builder and should not contain literal `"@context": "https://schema.org"`.

- [ ] **Step 3: Remove legacy FAQ schema path**

Update `src/components/sections/faq-section.tsx` so both `faqItems` and key-based fallback data pass through `generateFaqSchemaFromItems()`.

- [ ] **Step 4: Add structured-data rule doc**

Create `.claude/rules/structured-data.md` documenting:

- Layout-level JSON-LD owns Organization and WebSite.
- Page-level JSON-LD owns page-specific schemas.
- Component shells may render `<JsonLdScript>`, but schema objects must come from `structured-data-generators.ts`.
- No page/component should hand-roll an `@context` object.

- [ ] **Step 5: Update structured-data tests**

Run and update only affected assertions:

```bash
pnpm vitest src/lib/__tests__/structured-data.test.ts src/components/sections/__tests__/faq-section.test.tsx src/components/content/__tests__/about-page-shell.test.tsx src/components/products/__tests__/catalog-breadcrumb.test.tsx --run
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/structured-data-generators.ts src/components/content/about-page-shell.tsx src/components/content/legal-page-shell.tsx src/components/products/catalog-breadcrumb.tsx src/components/sections/faq-section.tsx 'src/app/[locale]/capabilities/bending-machines/page.tsx' 'src/app/[locale]/oem-custom-manufacturing/page.tsx' .claude/rules/structured-data.md
git commit -m "fix(seo): unify json ld builders"
```

## Task 3: Content ownership leftovers

- [ ] **Step 1: Move About prose to MDX**

Add `aboutSections` frontmatter to both About MDX files with `valuesTitle`, `values`, `statLabels`, and `cta`.

- [ ] **Step 2: Type and consume About frontmatter**

Add interfaces in `src/types/content.types.ts`, then update `AboutPageShell` to read `metadata.aboutSections`. If missing, throw a clear error instead of silently falling back to Layer 2 prose.

- [ ] **Step 3: Remove Layer 2 About prose**

Delete `SINGLE_SITE_ABOUT_SHELL_COPY` and `getSingleSiteAboutShellCopy()` from `src/config/single-site-page-expression.ts`; keep structural item keys/stats/CTA href.

- [ ] **Step 4: Move product market FAQ to MDX**

Create `content/pages/en/product-market.mdx` and `content/pages/zh/product-market.mdx` with frontmatter `faq` copied from the current product-market FAQ pool.

- [ ] **Step 5: Consume product market FAQ directly**

Update `src/app/[locale]/products/[market]/page.tsx` to load `getPageBySlug("product-market", locale)` once in the page render and pass `faqItems` to `FaqSection`.

- [ ] **Step 6: Remove shared FAQ key pool**

Delete `SINGLE_SITE_MARKET_FAQ_ITEMS` from `src/config/single-site-page-expression.ts` and remove unused product-market `faq.items.*` translation keys only if no other route consumes them. If translation cleanup is risky, leave the keys but remove production consumers.

- [ ] **Step 7: Document exceptions**

Update `.claude/rules/content.md`:

- Home is a structured campaign landing exception; full copy migration is separate.
- Product market dynamic pages are mixed structured pages: MDX owns FAQ; catalog/spec tables stay typed config; market labels/descriptions stay i18n.

- [ ] **Step 8: Verify**

Run:

```bash
pnpm vitest src/components/content/__tests__/about-page-shell.test.tsx 'src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx' --run
pnpm type-check
```

- [ ] **Step 9: Commit**

```bash
git add content/pages/en/about.mdx content/pages/zh/about.mdx content/pages/en/product-market.mdx content/pages/zh/product-market.mdx src/types/content.types.ts src/config/single-site-page-expression.ts src/components/content/about-page-shell.tsx 'src/app/[locale]/products/[market]/page.tsx' .claude/rules/content.md
git commit -m "fix(content): align page ownership"
```

## Task 4: Error-boundary and cache policy docs

- [ ] **Step 1: Add blog detail error boundary**

Create `src/app/[locale]/blog/[slug]/error.tsx` using the same `RouteErrorView` contract as Contact and Products, with namespace `errors.blog`.

- [ ] **Step 2: Add translations**

Add `errors.blog` to `messages/en.json` and `messages/zh.json`.

- [ ] **Step 3: Document route error policy**

Update `.claude/rules/conventions.md` with:

- Interactive and dynamic content pages need `error.tsx`.
- Static MDX/legal/about-style pages can rely on layout/global fallback unless they add external fetches.

- [ ] **Step 4: Document cache policy**

In the same conventions file, add:

- `React.cache()` is request-level dedupe.
- `'use cache'`, `cacheLife()`, `cacheTag()` are cross-request/cache-components cache.
- `*Cached` suffix is reserved for exported cross-request/cache-components wrappers.

- [ ] **Step 5: Verify and commit**

```bash
pnpm type-check
git add 'src/app/[locale]/blog/[slug]/error.tsx' messages/en.json messages/zh.json .claude/rules/conventions.md
git commit -m "fix(routes): add blog error policy"
```

## Task 5: Route and sitemap config derivation

- [ ] **Step 1: Derive static public pages**

In `src/config/single-site-seo.ts`, derive `SINGLE_SITE_PUBLIC_STATIC_PAGES` from `PATHS_CONFIG` instead of duplicating literals.

- [ ] **Step 2: Derive `PATHNAMES`**

In `src/config/paths/utils.ts`, build `PATHNAMES` from `PATHS_CONFIG` and `DYNAMIC_PATHS_CONFIG`, keeping `/products/[market]/[family]` only if it is still a typed-route placeholder needed by current tests.

- [ ] **Step 3: Derive dynamic parsing patterns**

In `src/lib/i18n/route-parsing.ts`, derive the regex and typed href builder from `DYNAMIC_PATHS_CONFIG` for `blogDetail` and `productMarket`.

- [ ] **Step 4: Use route config in page metadata**

Update static page metadata calls to use `getLocalizedPath(pageType, locale)` for:

- Home
- About
- Contact
- Products
- Blog
- Privacy
- Terms
- Bending machines
- OEM

Dynamic market paths should compose from `DYNAMIC_PATHS_CONFIG.productMarket.pattern` plus slug or a small helper, not a freehand `"/products/"` literal.

- [ ] **Step 5: Verify**

```bash
pnpm vitest src/config/__tests__/paths.test.ts src/config/__tests__/single-site-seo.test.ts src/lib/i18n/__tests__/route-parsing.test.ts src/app/__tests__/sitemap.test.ts --run
pnpm type-check
```

- [ ] **Step 6: Commit**

```bash
git add src/config/single-site-seo.ts src/config/paths/utils.ts src/lib/i18n/route-parsing.ts src/app/sitemap.ts src/config/__tests__/paths.test.ts src/config/__tests__/single-site-seo.test.ts src/lib/i18n/__tests__/route-parsing.test.ts
git commit -m "fix(routes): derive route config"
```

## Task 6: Environment contract alignment

- [ ] **Step 1: Add missing schema keys**

Add `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, `ALLOW_MEMORY_RATE_LIMIT`, and `ALLOW_MEMORY_IDEMPOTENCY` to `src/lib/env.ts` server schema and runtimeEnv mapping.

- [ ] **Step 2: Document app/script/deploy env ownership**

Update `.claude/rules/security.md` Environment Variables section:

- App runtime reads through `@/lib/env`.
- Scripts read through `scripts/lib/runtime-env.js` or local explicit validator functions.
- Deploy workflows and `wrangler.jsonc` supply values; they are not separate schemas.
- Production contract is enforced by `scripts/validate-production-config.ts`.

- [ ] **Step 3: Verify**

```bash
node scripts/review-env-boundaries.js
node scripts/review-server-env-boundaries.js
node scripts/review-ci-env-boundaries.js
pnpm vitest src/lib/__tests__/env.test.ts --run
pnpm type-check
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/env.ts .claude/rules/security.md src/lib/__tests__/env.test.ts
git commit -m "fix(env): align runtime contract"
```

## Task 7: Final verification

- [ ] **Step 1: Run fast local CI**

```bash
pnpm ci:local:quick
```

- [ ] **Step 2: Run coverage gate if source files changed**

```bash
pnpm test:coverage
```

- [ ] **Step 3: Run governance scripts**

```bash
node scripts/review-env-boundaries.js
node scripts/review-server-env-boundaries.js
node scripts/review-ci-env-boundaries.js
node scripts/review-derivative-readiness.js
```

- [ ] **Step 4: Final status**

Collect:

- commit list,
- verification commands and results,
- remaining documented exceptions,
- untracked files that pre-existed this run.

# Route Locale Truth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close FPH-006, FPH-007, FPH-009, and FPH-018 by reducing duplicated product-market, locale, route, sitemap, CTA, and cache-tag truth sources without changing buyer-visible behavior.

**Architecture:** Keep this as one architecture truth-source simplification line, not a broad rewrite. Existing route behavior stays the same; route files should depend on typed registries and small domain modules instead of owning product spec maps, duplicated locale facts, route literals, and unused future cache abstractions. FPH-016 is explicitly out of scope and must stay on a separate `Alx-707/csp-inline-proof` branch.

**Tech Stack:** Next.js 16.2 App Router, React 19.2, TypeScript 5.9, next-intl 4.9, Vitest, dependency-cruiser/Knip checks, project architecture guardrails.

---

## Scope and stop lines

In scope:

- `FPH-006`: product market route should no longer own market spec registration.
- `FPH-007`: locale/default/time-zone/currency metadata should derive from one registry where practical.
- `FPH-009`: static route/pathnames/sitemap/CTA route literals should derive from route IDs or path config.
- `FPH-018`: delete unused content/product/SEO cache tag families and keep only actual i18n cache tags.

Out of scope:

- `FPH-016`: CSP inline script proof.
- Product copy, product images, phone number, buyer-facing CTA strategy, Cloudflare deploy smoke.
- Adding a third production locale.
- Adding runtime `cacheTag()`, `revalidateTag()`, `revalidatePath()`, R2/D1/DO cache infrastructure, or any Cloudflare cache re-decision.

Fresh baseline facts already observed before writing this plan:

- Branch: `Alx-707/route-locale-truth`
- Baseline commit: `6ea7d98 test: prove product family contact handoff (#98)`
- `src/app/[locale]/products/[market]/page.tsx` is currently 150 lines, so FPH-006 is no longer a simple "split this 510-line file" task.
- Product-market route-adjacent files still own a route-local `SPECS_BY_MARKET` in `src/app/[locale]/products/[market]/market-page-data.ts`.
- `src/lib/load-messages.ts` is the only production i18n cache tag consumer.
- `src/lib/cache/cache-tags.ts` still exports unused `contentTags`, `productTags`, `seoTags`, and `cacheTags`.

## File structure map

### New files

- `src/constants/product-specs/market-spec-registry.ts`
  - One product-spec registry for market slug -> `MarketSpecs`.
  - Product routes and spec parity tests use this instead of duplicating `SPECS_BY_MARKET`.

- `src/constants/product-specs/__tests__/market-spec-registry.test.ts`
  - Proves every catalog market has a registered spec set.
  - Proves the registry has no extra market slugs.
  - Proves route callers get `undefined` for unknown markets instead of owning fallback behavior.

- `tests/architecture/product-market-route-boundary.test.ts`
  - Proves product-market route files do not import individual market spec files directly.
  - Proves the route data module uses the shared registry.

- `src/lib/cache/__tests__/cache-tags.test.ts`
  - Proves only i18n tag helpers remain and their tag strings stay stable.

- `src/lib/i18n/static-split-messages.ts`
  - Shared build-safe static message aggregation for server-only pages that need sync static messages.
  - Owns the unavoidable static JSON imports currently duplicated inside the Contact page data module.

### Modified files

- `src/app/[locale]/products/[market]/market-page-data.ts`
  - Remove page-local market spec imports and `SPECS_BY_MARKET`.
  - Use `getMarketSpecsBySlug()` from the new product-spec registry.

- `src/constants/product-specs/__tests__/i18n-parity.test.ts`
  - Remove test-local `SPECS_BY_MARKET`.
  - Iterate over `getMarketSpecEntries()`.

- `src/lib/cache/cache-tags.ts`
  - Keep only i18n domain/entity/tag helpers.
  - Delete unused content/product/SEO tag families.

- `src/lib/cache/index.ts`
  - Re-export only actual cache tag surface.

- `src/config/paths/locales-config.ts`
  - Keep this as the canonical locale registry.
  - Add locale-derived helpers for time zone and currency.

- `src/i18n/routing-config.ts`
  - Derive `locales` and `defaultLocale` from `LOCALES_CONFIG`.

- `src/lib/content-utils.ts`
  - Derive default content locale and supported locales from `LOCALES_CONFIG`.

- `src/i18n/request.ts`
  - Derive time zone and currency from `LOCALES_CONFIG` helpers.

- `src/app/[locale]/contact/contact-page-data.ts`
  - Replace page-local static message imports/map with `getStaticSplitMessages()`.

- `src/config/paths/utils.ts`
  - Derive `PATHNAMES` from `PATHS_CONFIG` and `DYNAMIC_PATHS_CONFIG`.
  - Add canonical route helper for route-id-to-path usage.
  - Remove non-existent `/products/[market]/[family]` from the derived next-intl pathnames unless a real route is added in the same branch.

- `src/config/paths.ts`
  - Re-export new path helpers.

- `src/config/single-site-page-expression.ts`
  - Derive homepage/about/products/OEM CTA hrefs from route IDs instead of hardcoded `"/contact"` and `"/products"`.

- `src/config/single-site-seo.ts`
  - Keep sitemap config explicit by route ID, then derive path-keyed public sitemap config.
  - Generate product market lastmod keys from the product catalog.

- Existing tests under:
  - `src/config/__tests__/paths.test.ts`
  - `src/config/__tests__/single-site-page-expression.test.ts`
  - `src/config/__tests__/single-site-seo.test.ts`
  - `src/i18n/__tests__/routing.test.ts`
  - `src/i18n/__tests__/request.test.ts`
  - `src/app/__tests__/sitemap.test.ts`
  - `tests/architecture/cache-directive-policy.test.ts`

## Task 0: Preflight and source-of-truth snapshot

**Files:**
- Read: `docs/superpowers/plans/2026-04-27-health-audit-repair-plan.md`
- Read: `docs/audits/full-project-health-v1/00-final-report.md`
- Read: `docs/audits/full-project-health-v1/01-quality-map.md`
- Read: `docs/audits/full-project-health-v1/02-findings.json`
- Read: `docs/audits/full-project-health-v1/05-runtime-proof-addendum.md`
- Read: `docs/audits/full-project-health-v1/lanes/01-architecture-coupling.md`
- Read: `docs/audits/full-project-health-v1/lanes/02-security-trust-boundary.md`
- Read: `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`

- [ ] **Step 1: Confirm the branch and clean worktree**

Run:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git log --oneline -1
```

Expected:

```text
<git status --short has no output>
Alx-707/route-locale-truth
6ea7d98 test: prove product family contact handoff (#98)
```

- [ ] **Step 2: Run the requested fresh baseline scans**

Run:

```bash
wc -l 'src/app/[locale]/products/[market]/page.tsx'
sed -n '1,240p' 'src/app/[locale]/products/[market]/page.tsx'
rg -n "locales|defaultLocale|en|zh|localePrefix|SUPPORTED_LOCALES|routing|pathnames" src/i18n src/config src/app messages tests
rg -n "\"/(contact|products|about|privacy|terms|oem-custom-manufacturing)|pathnames|sitemap|ctaHref|href" src/config src/app src/components tests
rg -n "cacheTag|revalidateTag|i18nTags|contentTags|productTags|seoTags|cache-tags" src scripts tests docs .claude
```

Expected:

```text
src/app/[locale]/products/[market]/page.tsx is about 150 lines.
The locale scan shows routing-config, locales-config, content-utils, load-messages, request, contact-page-data, and tests.
The route scan shows paths-config, PATHNAMES, single-site-page-expression CTA hrefs, single-site-seo sitemap config, sitemap tests, and component href tests.
The cache scan shows production use only through src/lib/load-messages.ts and unused tag family definitions in src/lib/cache/cache-tags.ts.
```

- [ ] **Step 3: Confirm FPH-016 is not being touched**

Run:

```bash
jq '.[] | select(.id=="FPH-016")' docs/audits/full-project-health-v1/02-findings.json
git diff -- docs/audits/full-project-health-v1/05-runtime-proof-addendum.md src/config/security.ts
```

Expected:

```text
FPH-016 is printed from findings JSON.
git diff prints no changes for the CSP proof addendum or security config.
```

## Task 1: Move product market spec registry out of the route directory

**Files:**
- Create: `src/constants/product-specs/market-spec-registry.ts`
- Create: `src/constants/product-specs/__tests__/market-spec-registry.test.ts`
- Modify: `src/app/[locale]/products/[market]/market-page-data.ts`
- Modify: `src/constants/product-specs/__tests__/i18n-parity.test.ts`
- Create: `tests/architecture/product-market-route-boundary.test.ts`

- [ ] **Step 1: Write the failing product spec registry behavior test**

Create `src/constants/product-specs/__tests__/market-spec-registry.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getAllMarketSlugs } from "@/constants/product-catalog";
import {
  getMarketSpecEntries,
  getMarketSpecsBySlug,
  MARKET_SPECS_BY_SLUG,
} from "@/constants/product-specs/market-spec-registry";

describe("market spec registry", () => {
  it("covers every catalog market exactly once", () => {
    const catalogSlugs = [...getAllMarketSlugs()].sort();
    const registrySlugs = Object.keys(MARKET_SPECS_BY_SLUG).sort();

    expect(registrySlugs).toEqual(catalogSlugs);
  });

  it("exposes stable entries for parity checks", () => {
    const entries = getMarketSpecEntries();
    const entrySlugs = entries.map(([marketSlug]) => marketSlug).sort();

    expect(entrySlugs).toEqual([...getAllMarketSlugs()].sort());
    for (const [, specs] of entries) {
      expect(specs.families.length).toBeGreaterThan(0);
      expect(Object.keys(specs.technical).length).toBeGreaterThan(0);
    }
  });

  it("returns undefined for unknown market slugs", () => {
    expect(getMarketSpecsBySlug("unknown-market")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the registry test and verify it fails**

Run:

```bash
pnpm exec vitest run src/constants/product-specs/__tests__/market-spec-registry.test.ts
```

Expected:

```text
FAIL src/constants/product-specs/__tests__/market-spec-registry.test.ts
Cannot find module '@/constants/product-specs/market-spec-registry'
```

- [ ] **Step 3: Add the product spec registry**

Create `src/constants/product-specs/market-spec-registry.ts`:

```ts
import { AUSTRALIA_NZ_SPECS } from "@/constants/product-specs/australia-new-zealand";
import { EUROPE_SPECS } from "@/constants/product-specs/europe";
import { MEXICO_SPECS } from "@/constants/product-specs/mexico";
import { NORTH_AMERICA_SPECS } from "@/constants/product-specs/north-america";
import { PNEUMATIC_SPECS } from "@/constants/product-specs/pneumatic-tube-systems";
import type { MarketSpecs } from "@/constants/product-specs/types";

export const MARKET_SPECS_BY_SLUG = Object.freeze({
  "north-america": NORTH_AMERICA_SPECS,
  "australia-new-zealand": AUSTRALIA_NZ_SPECS,
  mexico: MEXICO_SPECS,
  europe: EUROPE_SPECS,
  "pneumatic-tube-systems": PNEUMATIC_SPECS,
} as const satisfies Record<string, MarketSpecs>);

export type MarketSpecSlug = keyof typeof MARKET_SPECS_BY_SLUG;

export function getMarketSpecsBySlug(
  marketSlug: string,
): MarketSpecs | undefined {
  return MARKET_SPECS_BY_SLUG[marketSlug as MarketSpecSlug];
}

export function getMarketSpecEntries(): ReadonlyArray<
  readonly [MarketSpecSlug, MarketSpecs]
> {
  return Object.entries(MARKET_SPECS_BY_SLUG) as Array<
    [MarketSpecSlug, MarketSpecs]
  >;
}
```

- [ ] **Step 4: Run the registry test and verify it passes**

Run:

```bash
pnpm exec vitest run src/constants/product-specs/__tests__/market-spec-registry.test.ts
```

Expected:

```text
PASS src/constants/product-specs/__tests__/market-spec-registry.test.ts
```

- [ ] **Step 5: Write the route-boundary architecture test**

Create `tests/architecture/product-market-route-boundary.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PRODUCT_MARKET_ROUTE_FILES = [
  "src/app/[locale]/products/[market]/page.tsx",
  "src/app/[locale]/products/[market]/market-page-data.ts",
  "src/app/[locale]/products/[market]/market-jsonld.ts",
  "src/app/[locale]/products/[market]/market-page-sections.tsx",
  "src/app/[locale]/products/[market]/market-spec-presenter.ts",
] as const;

const MARKET_SPEC_DIRECT_IMPORT_PATTERN =
  /@\/constants\/product-specs\/(north-america|australia-new-zealand|mexico|europe|pneumatic-tube-systems)/;

function readSource(filePath: string): string {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- architecture test reads fixed repo-local files
  return readFileSync(filePath, "utf8");
}

describe("product market route boundary", () => {
  it("keeps individual market spec imports out of the route directory", () => {
    for (const filePath of PRODUCT_MARKET_ROUTE_FILES) {
      expect(readSource(filePath), filePath).not.toMatch(
        MARKET_SPEC_DIRECT_IMPORT_PATTERN,
      );
    }
  });

  it("keeps market-page-data dependent on the shared market spec registry", () => {
    const source = readSource(
      "src/app/[locale]/products/[market]/market-page-data.ts",
    );

    expect(source).toContain(
      'import { getMarketSpecsBySlug } from "@/constants/product-specs/market-spec-registry"',
    );
    expect(source).not.toContain("SPECS_BY_MARKET");
  });
});
```

- [ ] **Step 6: Run the route-boundary test and verify it fails on current route-local imports**

Run:

```bash
pnpm exec vitest run tests/architecture/product-market-route-boundary.test.ts
```

Expected:

```text
FAIL tests/architecture/product-market-route-boundary.test.ts
market-page-data.ts still imports individual product spec modules and still contains SPECS_BY_MARKET.
```

- [ ] **Step 7: Update product market page data to use the registry**

Replace the top of `src/app/[locale]/products/[market]/market-page-data.ts` with:

```ts
import {
  getFamiliesForMarket,
  getMarketBySlug,
  type ProductFamilyDefinition,
} from "@/constants/product-catalog";
import { getMarketSpecsBySlug } from "@/constants/product-specs/market-spec-registry";
import type { MarketSpecs } from "@/constants/product-specs/types";
```

Delete the five individual market spec imports and delete this whole object:

```ts
const SPECS_BY_MARKET: Record<string, MarketSpecs> = {
  "north-america": NORTH_AMERICA_SPECS,
  "australia-new-zealand": AUSTRALIA_NZ_SPECS,
  mexico: MEXICO_SPECS,
  europe: EUROPE_SPECS,
  "pneumatic-tube-systems": PNEUMATIC_SPECS,
};
```

Replace:

```ts
const marketSpecs = SPECS_BY_MARKET[marketSlug];
```

with:

```ts
const marketSpecs = getMarketSpecsBySlug(marketSlug);
```

- [ ] **Step 8: Update i18n parity tests to use the shared registry**

In `src/constants/product-specs/__tests__/i18n-parity.test.ts`, remove these imports:

```ts
import { NORTH_AMERICA_SPECS } from "@/constants/product-specs/north-america";
import { AUSTRALIA_NZ_SPECS } from "@/constants/product-specs/australia-new-zealand";
import { MEXICO_SPECS } from "@/constants/product-specs/mexico";
import { EUROPE_SPECS } from "@/constants/product-specs/europe";
import { PNEUMATIC_SPECS } from "@/constants/product-specs/pneumatic-tube-systems";
import type { MarketSpecs } from "@/constants/product-specs/types";
```

Add:

```ts
import { getMarketSpecEntries } from "@/constants/product-specs/market-spec-registry";
```

Delete the test-local `SPECS_BY_MARKET` object.

Replace each `Object.values(SPECS_BY_MARKET)` loop with:

```ts
getMarketSpecEntries().map(([, specs]) => specs)
```

Replace each `Object.entries(SPECS_BY_MARKET)` loop with:

```ts
getMarketSpecEntries()
```

The three changed loops should read:

```ts
for (const specs of getMarketSpecEntries().map(([, specs]) => specs)) {
  for (const key of Object.keys(specs.technical)) {
    allTechnicalKeys.add(key);
  }
}
```

```ts
for (const [marketSlug, specs] of getMarketSpecEntries()) {
  for (const family of specs.families) {
    for (let i = 0; i < family.highlights.length; i++) {
      const enKey = `catalog.specs.${marketSlug}.families.${family.slug}.highlights.${i}`;
      const zhKey = `catalog.specs.${marketSlug}.families.${family.slug}.highlights.${i}`;

      expect(
        getNestedValue(enCritical, enKey),
        `missing en: ${enKey}`,
      ).toBeDefined();
      expect(
        getNestedValue(zhCritical, zhKey),
        `missing zh: ${zhKey}`,
      ).toBeDefined();
    }
  }
}
```

```ts
for (const [marketSlug, specs] of getMarketSpecEntries()) {
  for (const family of specs.families) {
    for (
      let groupIdx = 0;
      groupIdx < family.specGroups.length;
      groupIdx++
    ) {
      const enKey = `catalog.specs.${marketSlug}.families.${family.slug}.groups.${groupIdx}.label`;
      const zhKey = `catalog.specs.${marketSlug}.families.${family.slug}.groups.${groupIdx}.label`;

      expect(
        getNestedValue(enCritical, enKey),
        `missing en: ${enKey}`,
      ).toBeDefined();
      expect(
        getNestedValue(zhCritical, zhKey),
        `missing zh: ${zhKey}`,
      ).toBeDefined();
    }
  }
}
```

- [ ] **Step 9: Run product-market focused tests**

Run:

```bash
pnpm exec vitest run \
  src/constants/product-specs/__tests__/market-spec-registry.test.ts \
  src/constants/product-specs/__tests__/i18n-parity.test.ts \
  tests/architecture/product-market-route-boundary.test.ts \
  src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx
```

Expected:

```text
PASS src/constants/product-specs/__tests__/market-spec-registry.test.ts
PASS src/constants/product-specs/__tests__/i18n-parity.test.ts
PASS tests/architecture/product-market-route-boundary.test.ts
PASS src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx
```

- [ ] **Step 10: Check diff for FPH-006**

Run:

```bash
git diff -- \
  'src/app/[locale]/products/[market]/market-page-data.ts' \
  src/constants/product-specs \
  tests/architecture/product-market-route-boundary.test.ts
```

Expected:

```text
The route data module imports getMarketSpecsBySlug.
The only individual spec imports live in src/constants/product-specs/market-spec-registry.ts and existing spec tests.
No buyer-facing text changes.
```

## Task 2: Delete unused cache tag families and keep only i18n tags

**Files:**
- Create: `src/lib/cache/__tests__/cache-tags.test.ts`
- Modify: `src/lib/cache/cache-tags.ts`
- Modify: `src/lib/cache/index.ts`
- Check: `src/lib/load-messages.ts`

- [ ] **Step 1: Write the cache tag behavior test**

Create `src/lib/cache/__tests__/cache-tags.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  CACHE_DOMAINS,
  CACHE_ENTITIES,
  i18nTags,
} from "@/lib/cache/cache-tags";

describe("cache tags", () => {
  it("keeps only the i18n cache tag domain in production cache tag utilities", () => {
    expect(CACHE_DOMAINS).toEqual({ I18N: "i18n" });
    expect(CACHE_ENTITIES).toEqual({
      I18N: {
        CRITICAL: "critical",
        DEFERRED: "deferred",
        ALL: "all",
      },
    });
  });

  it("builds stable i18n cache tags", () => {
    expect(i18nTags.critical("en")).toBe("i18n:critical:en");
    expect(i18nTags.deferred("zh")).toBe("i18n:deferred:zh");
    expect(i18nTags.all()).toBe("i18n:all");
    expect(i18nTags.forLocale("en")).toEqual([
      "i18n:critical:en",
      "i18n:deferred:en",
      "i18n:all",
    ]);
  });
});
```

- [ ] **Step 2: Run the cache tag test and verify it fails on unused domains**

Run:

```bash
pnpm exec vitest run src/lib/cache/__tests__/cache-tags.test.ts
```

Expected:

```text
FAIL src/lib/cache/__tests__/cache-tags.test.ts
CACHE_DOMAINS still contains CONTENT, PRODUCT, and SEO.
```

- [ ] **Step 3: Replace cache-tags.ts with i18n-only helpers**

Replace `src/lib/cache/cache-tags.ts` with:

```ts
/**
 * Cache tag utilities for Next.js 16 Cache Components.
 *
 * Runtime invalidation is not part of the current launch architecture.
 * Keep only i18n tags used by `src/lib/load-messages.ts`.
 */

import type { Locale } from "@/types/content.types";

export const CACHE_DOMAINS = {
  I18N: "i18n",
} as const;

export type CacheDomain = (typeof CACHE_DOMAINS)[keyof typeof CACHE_DOMAINS];

export const CACHE_ENTITIES = {
  I18N: {
    CRITICAL: "critical",
    DEFERRED: "deferred",
    ALL: "all",
  },
} as const;

interface BuildTagOptions {
  domain: CacheDomain;
  entity: string;
  identifier?: string;
}

function buildTag(options: BuildTagOptions): string {
  const { domain, entity, identifier } = options;
  const parts = [domain, entity];

  if (identifier) {
    parts.push(identifier);
  }

  return parts.join(":");
}

export const i18nTags = {
  critical(locale: Locale): string {
    return buildTag({
      domain: CACHE_DOMAINS.I18N,
      entity: CACHE_ENTITIES.I18N.CRITICAL,
      identifier: locale,
    });
  },

  deferred(locale: Locale): string {
    return buildTag({
      domain: CACHE_DOMAINS.I18N,
      entity: CACHE_ENTITIES.I18N.DEFERRED,
      identifier: locale,
    });
  },

  all(): string {
    return buildTag({
      domain: CACHE_DOMAINS.I18N,
      entity: CACHE_ENTITIES.I18N.ALL,
    });
  },

  forLocale(locale: Locale): string[] {
    return [this.critical(locale), this.deferred(locale), this.all()];
  },
};
```

- [ ] **Step 4: Narrow cache index exports**

Replace `src/lib/cache/index.ts` with:

```ts
/**
 * Cache Utilities Index
 *
 * Runtime invalidation was removed on 2026-04-26; content updates flow through
 * redeploys, not request-time cache mutation APIs.
 */

export {
  CACHE_DOMAINS,
  CACHE_ENTITIES,
  i18nTags,
  type CacheDomain,
} from "./cache-tags";
```

- [ ] **Step 5: Run cache checks**

Run:

```bash
pnpm exec vitest run src/lib/cache/__tests__/cache-tags.test.ts src/lib/__tests__/load-messages-runtime.test.ts src/lib/__tests__/load-messages.fallback.test.ts
rg -n "contentTags|productTags|seoTags|cacheTags" src tests/architecture
rg -n "cacheTag\\(|revalidateTag\\(|revalidatePath\\(" src
```

Expected:

```text
PASS src/lib/cache/__tests__/cache-tags.test.ts
PASS src/lib/__tests__/load-messages-runtime.test.ts
PASS src/lib/__tests__/load-messages.fallback.test.ts
The content/product/seo/cacheTags grep has no production source hits.
The cacheTag/revalidate grep has no production source hits.
```

- [ ] **Step 6: Run dependency check after export removal**

Run:

```bash
pnpm dep:check
```

Expected:

```text
No new dependency-cruiser errors.
No import of removed cache tag exports remains.
```

## Task 3: Make locale registry the source for routing, content defaults, and request formatting

**Files:**
- Modify: `src/config/paths/locales-config.ts`
- Modify: `src/i18n/routing-config.ts`
- Modify: `src/lib/content-utils.ts`
- Modify: `src/i18n/request.ts`
- Modify: `src/config/__tests__/paths.test.ts`
- Modify: `src/i18n/__tests__/routing.test.ts`
- Modify: `src/i18n/__tests__/request.test.ts`

- [ ] **Step 1: Add locale-registry expectations to paths tests**

In `src/config/__tests__/paths.test.ts`, extend the `LOCALES_CONFIG` describe block with:

```ts
it("should expose locale time zones and currencies from the registry", () => {
  expect(LOCALES_CONFIG.timeZones).toEqual({
    en: "UTC",
    zh: "Asia/Shanghai",
  });
  expect(LOCALES_CONFIG.currencies).toEqual({
    en: "USD",
    zh: "CNY",
  });
});
```

Also add `getLocaleCurrency` and `getLocaleTimeZone` to the imports from `../paths`:

```ts
  getLocaleCurrency,
  getLocaleTimeZone,
```

Then add this test under the `LOCALES_CONFIG` describe block:

```ts
it("should resolve locale metadata through helpers", () => {
  expect(getLocaleTimeZone("en")).toBe("UTC");
  expect(getLocaleTimeZone("zh")).toBe("Asia/Shanghai");
  expect(getLocaleCurrency("en")).toBe("USD");
  expect(getLocaleCurrency("zh")).toBe("CNY");
});
```

- [ ] **Step 2: Run the paths test and verify helper exports fail**

Run:

```bash
pnpm exec vitest run src/config/__tests__/paths.test.ts
```

Expected:

```text
FAIL src/config/__tests__/paths.test.ts
getLocaleCurrency or getLocaleTimeZone is not exported.
```

- [ ] **Step 3: Add locale metadata helpers**

Replace `src/config/paths/locales-config.ts` with:

```ts
/**
 * Canonical locale configuration.
 */

export const LOCALES_CONFIG = Object.freeze({
  locales: Object.freeze(["en", "zh"] as const),
  defaultLocale: "en" as const,
  localePrefix: "always" as const,

  prefixes: Object.freeze({
    en: "",
    zh: "/zh",
  }),

  displayNames: Object.freeze({
    en: "English",
    zh: "中文",
  }),

  timeZones: Object.freeze({
    en: "UTC",
    zh: "Asia/Shanghai",
  }),

  currencies: Object.freeze({
    en: "USD",
    zh: "CNY",
  }),
} as const);

export type LocalesConfig = typeof LOCALES_CONFIG;
export type ConfiguredLocale = (typeof LOCALES_CONFIG.locales)[number];
export type ConfiguredCurrency =
  (typeof LOCALES_CONFIG.currencies)[ConfiguredLocale];

export function getLocaleTimeZone(locale: ConfiguredLocale): string {
  return LOCALES_CONFIG.timeZones[locale];
}

export function getLocaleCurrency(
  locale: ConfiguredLocale,
): ConfiguredCurrency {
  return LOCALES_CONFIG.currencies[locale];
}
```

- [ ] **Step 4: Re-export locale helpers from the paths barrel**

In `src/config/paths.ts`, replace:

```ts
export { LOCALES_CONFIG } from "@/config/paths/locales-config";
```

with:

```ts
export {
  getLocaleCurrency,
  getLocaleTimeZone,
  LOCALES_CONFIG,
} from "@/config/paths/locales-config";
```

Replace:

```ts
export type { LocalesConfig } from "@/config/paths/locales-config";
```

with:

```ts
export type {
  ConfiguredCurrency,
  ConfiguredLocale,
  LocalesConfig,
} from "@/config/paths/locales-config";
```

- [ ] **Step 5: Derive next-intl routing from LOCALES_CONFIG**

In `src/i18n/routing-config.ts`, add:

```ts
import { LOCALES_CONFIG } from "@/config/paths/locales-config";
```

Replace:

```ts
  // 支持的语言
  locales: ["en", "zh"],

  // 默认语言
  defaultLocale: "en",

  // 使用 'always' 模式 - next-intl 3.0 官方推荐，避免边缘情况
  localePrefix: "always",
```

with:

```ts
  locales: LOCALES_CONFIG.locales,
  defaultLocale: LOCALES_CONFIG.defaultLocale,
  localePrefix: LOCALES_CONFIG.localePrefix,
```

- [ ] **Step 6: Derive content defaults from LOCALES_CONFIG**

In `src/lib/content-utils.ts`, add:

```ts
import { LOCALES_CONFIG } from "@/config/paths/locales-config";
```

Replace:

```ts
const DEFAULT_CONFIG: ContentConfig = {
  defaultLocale: "en",
  supportedLocales: ["en", "zh"],
```

with:

```ts
const DEFAULT_CONFIG: ContentConfig = {
  defaultLocale: LOCALES_CONFIG.defaultLocale,
  supportedLocales: [...LOCALES_CONFIG.locales],
```

- [ ] **Step 7: Derive request formatting from locale helpers**

In `src/i18n/request.ts`, add:

```ts
import {
  getLocaleCurrency,
  getLocaleTimeZone,
} from "@/config/paths/locales-config";
import type { Locale } from "@/i18n/routing-config";
```

Change:

```ts
function getFormats(locale: string) {
```

to:

```ts
function getFormats(locale: Locale) {
```

Replace:

```ts
currency: locale === "zh" ? "CNY" : "USD",
```

with:

```ts
currency: getLocaleCurrency(locale),
```

Change the `SuccessResponseArgs` interface:

```ts
interface SuccessResponseArgs {
  locale: Locale;
  messages: Record<string, unknown>;
  loadTime: number;
}
```

Replace both occurrences of:

```ts
timeZone: locale === "zh" ? "Asia/Shanghai" : "UTC",
```

with:

```ts
timeZone: getLocaleTimeZone(locale),
```

Change:

```ts
async function createFallbackResponse(locale: string, startTime: number) {
```

to:

```ts
async function createFallbackResponse(locale: Locale, startTime: number) {
```

- [ ] **Step 8: Run locale-related tests**

Run:

```bash
pnpm exec vitest run \
  src/config/__tests__/paths.test.ts \
  src/i18n/__tests__/routing.test.ts \
  src/i18n/__tests__/request.test.ts \
  src/lib/__tests__/content-utils.test.ts
```

Expected:

```text
PASS src/config/__tests__/paths.test.ts
PASS src/i18n/__tests__/routing.test.ts
PASS src/i18n/__tests__/request.test.ts
PASS src/lib/__tests__/content-utils.test.ts
```

If `src/i18n/__tests__/routing.test.ts` currently expects literal inline arrays in mocked `defineRouting` calls, update those assertions to import `LOCALES_CONFIG` and compare against `LOCALES_CONFIG.locales` / `LOCALES_CONFIG.defaultLocale` instead of duplicating `["en", "zh"]` / `"en"`.

## Task 4: Move Contact static message imports into a shared static split-message module

**Files:**
- Create: `src/lib/i18n/static-split-messages.ts`
- Modify: `src/app/[locale]/contact/contact-page-data.ts`
- Modify: `src/app/[locale]/contact/__tests__/page.test.tsx`
- Check: `src/lib/load-messages.ts`

- [ ] **Step 1: Write the static split-message module test through Contact page behavior**

In `src/app/[locale]/contact/__tests__/page.test.tsx`, add this assertion to the existing test named `renders localized contact panel copy from the top-level contact namespace`:

```ts
expect(screen.getByText("工作日 24 小时内")).toBeInTheDocument();
expect(screen.getByText("建议提供")).toBeInTheDocument();
```

This test already covers the externally visible behavior. Do not add a source-shape assertion in this file.

- [ ] **Step 2: Run the Contact page test before moving imports**

Run:

```bash
pnpm exec vitest run src/app/[locale]/contact/__tests__/page.test.tsx
```

Expected:

```text
PASS src/app/[locale]/contact/__tests__/page.test.tsx
```

- [ ] **Step 3: Add shared static split-message loader**

Create `src/lib/i18n/static-split-messages.ts`:

```ts
import "server-only";

import type { Locale } from "@/types/content.types";
import { mergeObjects } from "@/lib/merge-objects";
import enCriticalMessages from "@messages/en/critical.json";
import enDeferredMessages from "@messages/en/deferred.json";
import zhCriticalMessages from "@messages/zh/critical.json";
import zhDeferredMessages from "@messages/zh/deferred.json";

type StaticMessages = Record<string, unknown>;

const STATIC_SPLIT_MESSAGES_BY_LOCALE: Record<Locale, StaticMessages> = {
  en: mergeObjects(
    enCriticalMessages as StaticMessages,
    enDeferredMessages as StaticMessages,
  ) as StaticMessages,
  zh: mergeObjects(
    zhCriticalMessages as StaticMessages,
    zhDeferredMessages as StaticMessages,
  ) as StaticMessages,
};

export function getStaticSplitMessages(locale: Locale): StaticMessages {
  return STATIC_SPLIT_MESSAGES_BY_LOCALE[locale];
}
```

- [ ] **Step 4: Replace Contact page-local message imports**

In `src/app/[locale]/contact/contact-page-data.ts`, remove:

```ts
import { mergeObjects } from "@/lib/merge-objects";
import enCriticalMessages from "@messages/en/critical.json";
import enDeferredMessages from "@messages/en/deferred.json";
import zhCriticalMessages from "@messages/zh/critical.json";
import zhDeferredMessages from "@messages/zh/deferred.json";
```

Add:

```ts
import { getStaticSplitMessages } from "@/lib/i18n/static-split-messages";
```

Delete the whole `STATIC_MESSAGES_BY_LOCALE` object.

Replace:

```ts
export function getStaticMessages(locale: Locale): Record<string, unknown> {
  return STATIC_MESSAGES_BY_LOCALE[locale];
}
```

with:

```ts
export function getStaticMessages(locale: Locale): Record<string, unknown> {
  return getStaticSplitMessages(locale);
}
```

- [ ] **Step 5: Run Contact and i18n message tests**

Run:

```bash
pnpm exec vitest run \
  src/app/[locale]/contact/__tests__/page.test.tsx \
  src/lib/__tests__/load-messages-runtime.test.ts \
  src/lib/__tests__/load-messages.fallback.test.ts
```

Expected:

```text
PASS src/app/[locale]/contact/__tests__/page.test.tsx
PASS src/lib/__tests__/load-messages-runtime.test.ts
PASS src/lib/__tests__/load-messages.fallback.test.ts
```

- [ ] **Step 6: Verify Contact no longer owns en/zh message imports**

Run:

```bash
rg -n "@messages/(en|zh)/(critical|deferred)\\.json|STATIC_MESSAGES_BY_LOCALE" 'src/app/[locale]/contact' src/lib/i18n src/lib/load-messages.ts
```

Expected:

```text
Only src/lib/i18n/static-split-messages.ts and src/lib/load-messages.ts contain split-message imports/loaders.
src/app/[locale]/contact/contact-page-data.ts does not contain STATIC_MESSAGES_BY_LOCALE.
```

## Task 5: Derive route pathnames and static route hrefs from path config

**Files:**
- Modify: `src/config/paths/utils.ts`
- Modify: `src/config/paths.ts`
- Modify: `src/config/__tests__/paths.test.ts`
- Modify: `src/i18n/__tests__/routing.test.ts`
- Modify: `src/lib/i18n/__tests__/route-parsing.test.ts`

- [ ] **Step 1: Update paths tests to describe derived pathnames**

In `src/config/__tests__/paths.test.ts`, add `DYNAMIC_PATHS_CONFIG` to the imports from `../paths`:

```ts
  DYNAMIC_PATHS_CONFIG,
```

Replace the `getPathnames` describe block with:

```ts
describe("getPathnames", () => {
  it("should derive static pathnames from PATHS_CONFIG", () => {
    const pathnames = getPathnames();
    const expectedStaticPaths = Object.values(PATHS_CONFIG).map((paths) =>
      paths.en === "/" ? "/" : paths.en,
    );

    for (const path of expectedStaticPaths) {
      expect(pathnames[path]).toBe(path);
    }
  });

  it("should derive dynamic route patterns from DYNAMIC_PATHS_CONFIG", () => {
    const pathnames = getPathnames();

    for (const config of Object.values(DYNAMIC_PATHS_CONFIG)) {
      expect(pathnames[config.pattern]).toBe(config.pattern);
    }
  });

  it("should not advertise product family pages without a real route", () => {
    const pathnames = getPathnames();

    expect(pathnames).not.toHaveProperty("/products/[market]/[family]");
  });

  it("should have consistent paths", () => {
    const pathnames = getPathnames();

    Object.entries(pathnames).forEach(([key, value]) => {
      expect(key).toBe(value);
    });
  });
});
```

Add this new describe block near the path utility tests:

```ts
describe("getCanonicalPath", () => {
  it("should resolve route IDs to canonical non-localized paths", () => {
    expect(getCanonicalPath("home")).toBe("/");
    expect(getCanonicalPath("contact")).toBe("/contact");
    expect(getCanonicalPath("products")).toBe("/products");
    expect(getCanonicalPath("oem")).toBe("/oem-custom-manufacturing");
  });
});
```

Add `getCanonicalPath` to imports from `../paths`.

- [ ] **Step 2: Run paths tests and verify failures**

Run:

```bash
pnpm exec vitest run src/config/__tests__/paths.test.ts
```

Expected:

```text
FAIL src/config/__tests__/paths.test.ts
getCanonicalPath is not exported and /products/[market]/[family] is still present.
```

- [ ] **Step 3: Derive PATHNAMES in paths utils**

In `src/config/paths/utils.ts`, add:

```ts
type PathnameMap = Record<string, string>;

function getCanonicalPathValue(path: string): string {
  return path === "" ? "/" : path;
}

function createPathnames(): PathnameMap {
  const staticPathnames = Object.values(PATHS_CONFIG).map((paths) => {
    const path = getCanonicalPathValue(paths[LOCALES_CONFIG.defaultLocale]);
    return [path, path] as const;
  });

  const dynamicPathnames = Object.values(DYNAMIC_PATHS_CONFIG).map((config) => [
    config.pattern,
    config.pattern,
  ] as const);

  return Object.freeze(Object.fromEntries([
    ...staticPathnames,
    ...dynamicPathnames,
  ]));
}
```

Replace the current hardcoded `PATHNAMES` object:

```ts
export const PATHNAMES = {
  "/": "/",
  "/about": "/about",
  "/contact": "/contact",
  "/products": "/products",
  "/products/[market]": "/products/[market]",
  "/products/[market]/[family]": "/products/[market]/[family]",
  "/privacy": "/privacy",
  "/terms": "/terms",
  "/oem-custom-manufacturing": "/oem-custom-manufacturing",
} as const;
```

with:

```ts
export const PATHNAMES = createPathnames();
```

Add this helper after `getLocalizedPath`:

```ts
export function getCanonicalPath(pageType: PageType): string {
  return getLocalizedPath(pageType, LOCALES_CONFIG.defaultLocale);
}
```

In `getRoutingConfig()`, replace:

```ts
localePrefix: "always" as const,
```

with:

```ts
localePrefix: LOCALES_CONFIG.localePrefix,
```

- [ ] **Step 4: Export getCanonicalPath**

In `src/config/paths.ts`, add `getCanonicalPath` to the utility exports:

```ts
  getCanonicalPath,
```

- [ ] **Step 5: Update routing tests away from hardcoded nonexistent family pathname**

In `src/i18n/__tests__/routing.test.ts`, remove any assertion requiring:

```ts
"/products/[market]/[family]"
```

If the test currently checks a static list of `pathnames`, replace it with a derived check:

```ts
const pathnames = config.pathnames;

expect(pathnames).toHaveProperty("/products/[market]");
expect(pathnames).not.toHaveProperty("/products/[market]/[family]");
Object.entries(pathnames).forEach(([key, value]) => {
  expect(value).toBe(key);
});
```

- [ ] **Step 6: Run route/path tests**

Run:

```bash
pnpm exec vitest run \
  src/config/__tests__/paths.test.ts \
  src/i18n/__tests__/routing.test.ts \
  src/lib/i18n/__tests__/route-parsing.test.ts
```

Expected:

```text
PASS src/config/__tests__/paths.test.ts
PASS src/i18n/__tests__/routing.test.ts
PASS src/lib/i18n/__tests__/route-parsing.test.ts
```

## Task 6: Derive CTA hrefs and sitemap static truth from route IDs

**Files:**
- Modify: `src/config/single-site-page-expression.ts`
- Modify: `src/config/single-site-seo.ts`
- Modify: `src/config/__tests__/single-site-page-expression.test.ts`
- Modify: `src/config/__tests__/single-site-seo.test.ts`
- Modify: `src/app/__tests__/sitemap.test.ts`
- Check: `src/app/sitemap.ts`

- [ ] **Step 1: Update page-expression tests to assert route-derived values**

In `src/config/__tests__/single-site-page-expression.test.ts`, add:

```ts
import { getCanonicalPath } from "@/config/paths";
```

Replace direct route literal expectations:

```ts
expect(SINGLE_SITE_HOME_LINK_TARGETS).toEqual({
  contact: "/contact",
  products: "/products",
});
```

with:

```ts
expect(SINGLE_SITE_HOME_LINK_TARGETS).toEqual({
  contact: getCanonicalPath("contact"),
  products: getCanonicalPath("products"),
});
```

Replace:

```ts
expect(SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION.marketLanding.ctaHref).toBe(
  "/contact",
);
expect(SINGLE_SITE_ABOUT_PAGE_EXPRESSION.ctaHref).toBe("/contact");
expect(SINGLE_SITE_OEM_PAGE_EXPRESSION.ctaHref).toBe("/contact");
```

with:

```ts
expect(SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION.marketLanding.ctaHref).toBe(
  getCanonicalPath("contact"),
);
expect(SINGLE_SITE_ABOUT_PAGE_EXPRESSION.ctaHref).toBe(
  getCanonicalPath("contact"),
);
expect(SINGLE_SITE_OEM_PAGE_EXPRESSION.ctaHref).toBe(
  getCanonicalPath("contact"),
);
```

- [ ] **Step 2: Update sitemap config tests to assert derived route coverage**

In `src/config/__tests__/single-site-seo.test.ts`, add:

```ts
import { getAllMarketSlugs } from "@/constants/product-catalog";
import { getCanonicalPath, PATHS_CONFIG } from "@/config/paths";
```

Replace the test named `keeps the public static sitemap pages explicit` with:

```ts
it("derives public static sitemap pages from static path config", () => {
  const expectedPages = Object.values(PATHS_CONFIG).map((paths) =>
    paths.en === "/" ? "" : paths.en,
  );

  expect(SINGLE_SITE_PUBLIC_STATIC_PAGES).toEqual(expectedPages);
  expect(SINGLE_SITE_PUBLIC_STATIC_PAGES).not.toContain(
    RETIRED_BENDING_MACHINES_PATH,
  );
});
```

Replace the lastmod assertion:

```ts
expect(SINGLE_SITE_STATIC_PAGE_LASTMOD["/products"]).toBe(
  "2026-04-26T00:00:00Z",
);
```

with:

```ts
expect(SINGLE_SITE_STATIC_PAGE_LASTMOD[getCanonicalPath("products")]).toBe(
  "2026-04-26T00:00:00Z",
);

for (const marketSlug of getAllMarketSlugs()) {
  expect(
    SINGLE_SITE_STATIC_PAGE_LASTMOD[
      `${getCanonicalPath("products")}/${marketSlug}`
    ],
  ).toBe("2026-04-26T00:00:00Z");
}
```

- [ ] **Step 3: Run tests and verify route literal failures remain**

Run:

```bash
pnpm exec vitest run \
  src/config/__tests__/single-site-page-expression.test.ts \
  src/config/__tests__/single-site-seo.test.ts
```

Expected:

```text
FAIL until single-site-page-expression.ts and single-site-seo.ts derive values from route helpers.
```

- [ ] **Step 4: Derive CTA hrefs in page-expression config**

In `src/config/single-site-page-expression.ts`, add:

```ts
import { getCanonicalPath } from "@/config/paths";
```

Replace:

```ts
export const SINGLE_SITE_HOME_LINK_TARGETS = {
  contact: "/contact",
  products: "/products",
} as const;
```

with:

```ts
export const SINGLE_SITE_HOME_LINK_TARGETS = {
  contact: getCanonicalPath("contact"),
  products: getCanonicalPath("products"),
} as const;
```

Replace:

```ts
export const SINGLE_SITE_ABOUT_PAGE_EXPRESSION = {
  ctaHref: "/contact",
} as const;
```

with:

```ts
export const SINGLE_SITE_ABOUT_PAGE_EXPRESSION = {
  ctaHref: getCanonicalPath("contact"),
} as const;
```

Replace:

```ts
  marketLanding: {
    ctaHref: "/contact",
  },
```

with:

```ts
  marketLanding: {
    ctaHref: getCanonicalPath("contact"),
  },
```

Replace:

```ts
  ctaHref: "/contact",
```

inside `SINGLE_SITE_OEM_PAGE_EXPRESSION` with:

```ts
  ctaHref: getCanonicalPath("contact"),
```

- [ ] **Step 5: Derive sitemap static route maps**

In `src/config/single-site-seo.ts`, add:

```ts
import { getAllMarketSlugs } from "@/constants/product-catalog";
import {
  getCanonicalPath,
  PATHS_CONFIG,
  type PageType,
} from "@/config/paths";
```

Remove the existing `import { PATHS_CONFIG } from "@/config/paths/paths-config";`.

Add these helpers above `SINGLE_SITE_PUBLIC_STATIC_PAGES`:

```ts
const SINGLE_SITE_STATIC_LASTMOD_ISO = "2026-04-26T00:00:00Z";

function toSitemapStaticPath(path: string): string {
  return path === "/" ? "" : path;
}

function fromRouteConfig<T>(
  configByPageType: Partial<Record<PageType, T>>,
): Record<string, T> {
  return Object.fromEntries(
    Object.entries(configByPageType).map(([pageType, config]) => [
      toSitemapStaticPath(getCanonicalPath(pageType as PageType)),
      config,
    ]),
  );
}
```

Keep:

```ts
export const SINGLE_SITE_PUBLIC_STATIC_PAGES = Object.values(PATHS_CONFIG).map(
  (paths) => (paths.en === "/" ? "" : paths.en),
);
```

Replace the hardcoded `SINGLE_SITE_SITEMAP_PAGE_CONFIG` with:

```ts
const SINGLE_SITE_STATIC_SITEMAP_PAGE_CONFIG_BY_ROUTE = {
  home: { changeFrequency: "daily", priority: 1.0 },
  about: { changeFrequency: "monthly", priority: 0.8 },
  contact: { changeFrequency: "monthly", priority: 0.8 },
  products: { changeFrequency: "weekly", priority: 0.9 },
  privacy: { changeFrequency: "monthly", priority: 0.7 },
  terms: { changeFrequency: "monthly", priority: 0.7 },
  oem: { changeFrequency: "monthly", priority: 0.8 },
} as const satisfies Record<PageType, SingleSiteSitemapPageConfig>;

export const SINGLE_SITE_SITEMAP_PAGE_CONFIG = {
  ...fromRouteConfig(SINGLE_SITE_STATIC_SITEMAP_PAGE_CONFIG_BY_ROUTE),
  productMarket: { changeFrequency: "weekly", priority: 0.8 },
} as const satisfies Record<string, SingleSiteSitemapPageConfig>;
```

Replace the hardcoded `SINGLE_SITE_STATIC_PAGE_LASTMOD` with:

```ts
const SINGLE_SITE_STATIC_PAGE_LASTMOD_BY_ROUTE = {
  home: SINGLE_SITE_STATIC_LASTMOD_ISO,
  products: SINGLE_SITE_STATIC_LASTMOD_ISO,
} as const satisfies Partial<Record<PageType, string>>;

const SINGLE_SITE_PRODUCT_MARKET_LASTMOD = Object.fromEntries(
  getAllMarketSlugs().map((marketSlug) => [
    `${getCanonicalPath("products")}/${marketSlug}`,
    SINGLE_SITE_STATIC_LASTMOD_ISO,
  ]),
);

export const SINGLE_SITE_STATIC_PAGE_LASTMOD = {
  ...fromRouteConfig(SINGLE_SITE_STATIC_PAGE_LASTMOD_BY_ROUTE),
  ...SINGLE_SITE_PRODUCT_MARKET_LASTMOD,
} as const satisfies Record<string, string>;
```

- [ ] **Step 6: Run sitemap and page-expression tests**

Run:

```bash
pnpm exec vitest run \
  src/config/__tests__/single-site-page-expression.test.ts \
  src/config/__tests__/single-site-seo.test.ts \
  src/app/__tests__/sitemap.test.ts
```

Expected:

```text
PASS src/config/__tests__/single-site-page-expression.test.ts
PASS src/config/__tests__/single-site-seo.test.ts
PASS src/app/__tests__/sitemap.test.ts
```

- [ ] **Step 7: Confirm route truth grep is reduced**

Run:

```bash
rg -n '"/(contact|products|about|privacy|terms|oem-custom-manufacturing)"|pathnames|sitemap|ctaHref' src/config src/app src/components tests
```

Expected:

```text
Remaining route literals are either:
- PATHS_CONFIG canonical declarations,
- tests asserting buyer-visible rendered hrefs,
- external component href props,
- dynamic runtime output checks,
- sitemap output expectations.
single-site-page-expression.ts should no longer define ctaHref with raw "/contact" literals.
single-site-seo.ts should no longer handwrite concrete product market lastmod URLs.
```

## Task 7: Consolidated verification and finding closure notes

**Files:**
- Check: changed source files from Tasks 1-6
- Optional docs update: `docs/audits/full-project-health-v1/07-repair-closure.md` only if this branch is expected to update audit closure docs

- [ ] **Step 1: Run focused Vitest suite**

Run:

```bash
pnpm exec vitest run \
  src/constants/product-specs/__tests__/market-spec-registry.test.ts \
  src/constants/product-specs/__tests__/i18n-parity.test.ts \
  tests/architecture/product-market-route-boundary.test.ts \
  src/lib/cache/__tests__/cache-tags.test.ts \
  src/lib/__tests__/load-messages-runtime.test.ts \
  src/lib/__tests__/load-messages.fallback.test.ts \
  src/config/__tests__/paths.test.ts \
  src/config/__tests__/single-site-page-expression.test.ts \
  src/config/__tests__/single-site-seo.test.ts \
  src/i18n/__tests__/routing.test.ts \
  src/i18n/__tests__/request.test.ts \
  src/lib/i18n/__tests__/route-parsing.test.ts \
  src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx \
  src/app/[locale]/contact/__tests__/page.test.tsx \
  src/app/__tests__/sitemap.test.ts
```

Expected:

```text
All listed test files pass.
```

- [ ] **Step 2: Run repo-level cheap correctness checks**

Run:

```bash
pnpm type-check
pnpm lint:check
pnpm dep:check
pnpm truth:check
```

Expected:

```text
All four commands pass.
No new dependency-cruiser boundary errors.
No stale truth-source doc failures.
```

- [ ] **Step 3: Run architecture cache policy guard**

Run:

```bash
pnpm exec vitest run tests/architecture/cache-directive-policy.test.ts tests/architecture/product-market-route-boundary.test.ts
```

Expected:

```text
PASS tests/architecture/cache-directive-policy.test.ts
PASS tests/architecture/product-market-route-boundary.test.ts
Product market route sources remain free of cacheTag/revalidateTag/revalidatePath and shared FAQ/cache workarounds.
```

- [ ] **Step 4: Run final truth-source grep**

Run:

```bash
rg -n "SPECS_BY_MARKET|contentTags|productTags|seoTags|cacheTags|STATIC_MESSAGES_BY_LOCALE|/products/\\[market\\]/\\[family\\]" src tests
rg -n "cacheTag\\(|revalidateTag\\(|revalidatePath\\(" src
git diff --stat
git diff --check
```

Expected:

```text
First grep has no src route-local product spec map, unused cache tag exports, page-local contact message map, or nonexistent product-family pathname.
Second grep has no production runtime cache invalidation calls.
git diff --check reports no whitespace errors.
```

- [ ] **Step 5: Document closure evidence in the final response**

Include this evidence block in the final response or PR body:

```text
Closed:
- FPH-006: route-local product spec registry moved to src/constants/product-specs/market-spec-registry.ts; route data module now imports getMarketSpecsBySlug.
- FPH-007: routing/content/request locale metadata derives from LOCALES_CONFIG; Contact static message map moved to shared static split-message loader.
- FPH-009: PATHNAMES derives from PATHS_CONFIG/DYNAMIC_PATHS_CONFIG; CTA hrefs and sitemap product market lastmod derive from route/product registries.
- FPH-018: unused content/product/SEO cache tag families removed; only i18nTags remains.

Explicitly not touched:
- FPH-016 CSP inline script proof. It remains separate for Alx-707/csp-inline-proof.

Verification:
- pnpm exec vitest run <focused suite>
- pnpm type-check
- pnpm lint:check
- pnpm dep:check
- pnpm truth:check
- git diff --check
```

## Self-review checklist for plan consumers

- [ ] Every task has an externally checkable behavior or architecture contract before implementation.
- [ ] No task introduces runtime cache invalidation.
- [ ] No task changes buyer-facing copy or product catalog content.
- [ ] No task touches CSP/security policy proof.
- [ ] Route path helpers remain typed and small; do not create a new broad route abstraction layer.
- [ ] If a test fails because current repo behavior differs from this plan, stop and inspect the live code before widening scope.

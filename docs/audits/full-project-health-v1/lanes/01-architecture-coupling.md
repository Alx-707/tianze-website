# Lane 01 - Architecture / Coupling

## 1. Scope

Lane owner: Architecture / coupling.

Baseline used:

- Audit target: `origin/main @ 3ea482b53ca8db35f534f495211450d94bee963a`
- Local HEAD observed in this lane: `3ea482b53ca8db35f534f495211450d94bee963a`
- Preflight artifact: `docs/audits/full-project-health-v1/evidence/preflight.md`
- Business-code posture: read-only
- Lane write scope used:
  - `docs/audits/full-project-health-v1/lanes/01-architecture-coupling.md`
  - `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/**`
  - `docs/audits/full-project-health-v1/evidence/screenshots/01-architecture-coupling/**`

What this lane checked:

- route structure and path truth sources
- Server / Client boundary shape
- i18n truth source drift
- product / content / config / runtime coupling
- cache strategy and stale abstractions
- Cloudflare/runtime intrusion into business code
- barrel exports, wrapper layers, and dependency conformance
- change cost for adding a product market, adding a locale, changing contact flow, or deleting a route

Lane verdict only:

- No P0/P1 architecture finding was proven in this lane.
- Main risk is not "site cannot run"; it is change-cost buildup around product markets, locale/message loading, route path tables, and legacy compatibility fallbacks.
- The current enforced dependency boundary is mostly healthy: `pnpm dep:check` found 0 errors and 1 warning.

## 2. Fresh Evidence Collected

| Evidence ID | Type | Exact reference | Result | Notes |
| --- | --- | --- | --- | --- |
| E-L01-001 | report | `docs/audits/full-project-health-v1/evidence/preflight.md` | Baseline commit and clean business diff confirmed before lane dispatch. | Produced by orchestrator preflight. |
| E-L01-002 | command | `pnpm arch:metrics` -> `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-arch-metrics.txt` | Passed. 742 total files, 0 TS errors, 0 ESLint issues, 1 `export *`. | Script also generated ignored `reports/architecture/*`; relevant copies are in lane evidence. |
| E-L01-003 | report | `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/architecture-metrics.md` | File count exceeds target: 742 vs 700. | Supports change-cost assessment, not a standalone blocker. |
| E-L01-004 | command | `pnpm arch:hotspots` -> `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-arch-hotspots.txt` | Passed. 167 commits analyzed, 1096 files touched. | Historical churn is fresh execution but not proof of current defects by itself. |
| E-L01-005 | report | `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/structural-hotspots.md` | Top hotspots include `messages/*`, contact page, product market page, layout, inquiry/subscribe API, idempotency, client-ip. | Used for coupling hotspot map. |
| E-L01-006 | command | `pnpm arch:conformance` -> `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-arch-conformance.txt` | Passed but reported "Total violations: 1". | Markdown summary undercounts warnings; see E-L01-007/E-L01-008. |
| E-L01-007 | report | `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/dependency-conformance.json` | Confirms 1 warning: `src/lib/utm.ts` -> `src/lib/cookie-consent/index.ts`, rule `no-barrel-export-dependencies`. | Static architecture warning only. |
| E-L01-008 | command | `pnpm dep:check` -> `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-dep-check.txt` | Passed with 0 errors, 1 warning. | Dependency-cruiser directly confirms the warning. |
| E-L01-009 | command | `pnpm review:architecture-truth` -> `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-review-architecture-truth.txt` | Passed all guardrails; legacy marker audit found 1 marker. | It also generated ignored `reports/architecture/*`; copies are in lane evidence. |
| E-L01-010 | report | `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/legacy-marker-audit.md` | Fresh legacy marker: `src/lib/contact/getContactCopy.ts:154` fallback to `underConstruction.pages.contact.*`. | Supports FPH-L01-003. |
| E-L01-011 | command | `pnpm unused:production` -> `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-unused-production.txt` | Passed with no output. | Did not report production-unused files. |
| E-L01-012 | command | `rg ... cache/client boundaries` -> `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/cache-client-boundaries.txt` | Shows `use client`, `use cache`, `unstable_cache`, and request-cache locations. | Used to inspect Server/Client and cache boundary shape. |
| E-L01-013 | command | `rg ... product market coupling` -> `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/product-market-coupling.txt` | Shows market slugs repeated across catalog config, product page, messages, SEO, sitemap tests, parity tests. | Supports FPH-L01-001. |
| E-L01-014 | command | `rg ... locale hardcoding` -> `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/locale-hardcoding.txt` | Shows locale definitions repeated in routing, path config, content defaults, generated importers, tests, contact page. | Supports FPH-L01-002. |
| E-L01-015 | command | `rg ... route config coupling` -> `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/route-config-coupling.txt` | Shows static routes duplicated across path config, pathnames, sitemap config, page-expression links, tests. | Supports FPH-L01-004. |
| E-L01-016 | command | `find ... wc -l` -> `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/largest-production-src-files.txt` | Largest production files: generated manifest 837, `src/lib/env.ts` 612, product market page 510, idempotency 480. | Supports file-size/change-cost map. |
| E-L01-017 | file | `src/app/[locale]/products/[market]/page.tsx:1-510` | Product market route imports specs, builds local `SPECS_BY_MARKET`, cache boundary, metadata, JSON-LD, translation, and UI render in one page file. | Supports FPH-L01-001. |
| E-L01-018 | file | `src/app/[locale]/contact/page.tsx:29-33`, `src/app/[locale]/contact/page.tsx:327-340` | Contact page has page-local static message imports and locale map separate from `src/lib/load-messages.ts`. | Supports FPH-L01-002. |
| E-L01-019 | file | `src/lib/load-messages.ts:32-44`, `src/i18n/request.ts:92-109` | Shared message loader exists and runtime request config uses it. | Used as contrast for page-local loaders. |
| E-L01-020 | file | `src/config/paths/utils.ts:41-52`, `src/config/paths/paths-config.ts:13-64`, `src/config/single-site-seo.ts:30-63` | Route/path/sitemap truth is split across multiple literal tables. | Supports FPH-L01-004. |
| E-L01-021 | file | `src/lib/cache/cache-tags.ts:14-259`, `src/lib/load-messages.ts:10`, `src/lib/load-messages.ts:62-63` | Cache tag module defines i18n/content/product/SEO tags, but production import search found only i18nTags used. | Supports FPH-L01-005. |
| E-L01-022 | command | `rg ... src/sites ...` | Failed because `src/sites` does not exist. | Command mistake while following lane scope list; reran without `src/sites`. |
| E-L01-023 | command | `nl -ba src/app/[locale]/...` without quoting brackets | Failed under zsh glob expansion. | Command mistake; reran with quoted paths. |

## 3. Commands Run

| Command | Result | Classification |
| --- | --- | --- |
| `sed -n '1,260p' docs/audits/full-project-health-v1/execution-package/README.md` | passed | required |
| `sed -n '1,260p' docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md` | passed | required |
| `sed -n '1,260p' docs/audits/full-project-health-v1/execution-package/01-report-contract.md` | passed | required |
| `sed -n '1,260p' docs/audits/full-project-health-v1/execution-package/04-stop-lines.md` | passed | required |
| `sed -n '1,260p' docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md` | passed | required |
| `sed -n '1,320p' docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-01-architecture-coupling.md` | passed | required |
| `sed -n '1,260p' docs/audits/full-project-health-v1/evidence/preflight.md` | passed | required |
| `sed -n '1,260p' AGENTS.md` | passed | required |
| `sed -n '1,320p' CLAUDE.md` | passed | required |
| `sed -n '1,620p' .dependency-cruiser.js` | passed | required |
| `sed -n '1,260p' .claude/rules/code-quality.md` | passed | required |
| `sed -n '1,260p' .claude/rules/conventions.md` | passed | required |
| `sed -n '1,260p' .claude/rules/cloudflare.md` | passed | required |
| `sed -n '1,280p' .claude/rules/i18n.md` | passed | required |
| `sed -n '1,300p' .claude/rules/ui.md` | passed | required |
| `sed -n '1,260p' .claude/rules/content.md` | passed | diagnostic |
| `git status --short --branch --untracked-files=all` | passed | diagnostic |
| `git rev-parse HEAD` | passed | diagnostic |
| `node -e "const p=require('./package.json'); ..."` | passed | diagnostic |
| `mkdir -p docs/audits/full-project-health-v1/evidence/01-architecture-coupling docs/audits/full-project-health-v1/evidence/screenshots/01-architecture-coupling` | passed | diagnostic |
| `pnpm arch:metrics > docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-arch-metrics.txt 2>&1` | passed | optional |
| `pnpm arch:hotspots > docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-arch-hotspots.txt 2>&1` | passed | optional |
| `pnpm arch:conformance > docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-arch-conformance.txt 2>&1` | passed | optional |
| `pnpm dep:check > docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-dep-check.txt 2>&1` | passed | optional |
| `pnpm review:architecture-truth > docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-review-architecture-truth.txt 2>&1` | passed | optional |
| `pnpm unused:production > docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-unused-production.txt 2>&1` | passed | optional |
| `rg -n "^['\"]use client..." src ... > .../cache-client-boundaries.txt` | passed | diagnostic |
| `rg -n "north-america|..." src/app src/config src/constants src/lib messages ... > .../product-market-coupling.txt` | passed | diagnostic |
| `rg -n "enCriticalMessages|..." src/app src/lib src/i18n src/config src/constants messages ... > .../locale-hardcoding.txt` | passed | diagnostic |
| `rg -n "DYNAMIC_PATHS_CONFIG|..." src/config src/lib src/app ... > .../route-config-coupling.txt` | passed | diagnostic |
| `rg -n "underConstruction" src messages/en/critical.json messages/zh/critical.json > .../legacy-underconstruction-markers.txt` | passed | diagnostic |
| `find src -type f \( -name '*.ts' -o -name '*.tsx' \) ... -exec wc -l {} + ... > .../largest-production-src-files.txt` | passed | diagnostic |
| `rg -n "...barrel..." src/lib src/components src/config src/sites ...` | failed | diagnostic |
| `rg -n "...barrel..." src/lib src/components src/config ... > .../barrel-and-reexports.txt` | passed | diagnostic |
| `nl -ba src/app/[locale]/products/[market]/page.tsx ...` | failed | diagnostic |
| `nl -ba 'src/app/[locale]/products/[market]/page.tsx' ...` | passed | diagnostic |
| `nl -ba src/app/[locale]/contact/page.tsx ...` | failed | diagnostic |
| `nl -ba 'src/app/[locale]/contact/page.tsx' ...` | passed | diagnostic |

## 4. Findings

### FPH-L01-001: Product market page is doing catalog orchestration, spec wiring, SEO, JSON-LD, cache, translation, and rendering in one route file

- Severity: P2
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: architecture
- Source lane: 01-architecture-coupling
- Evidence:
  - type: file
    reference: `src/app/[locale]/products/[market]/page.tsx:1-18`
    summary: Route imports every market-specific spec module directly.
  - type: file
    reference: `src/app/[locale]/products/[market]/page.tsx:51-60`
    summary: Route owns `SPECS_BY_MARKET`, a second market-to-spec map separate from the product catalog.
  - type: file
    reference: `src/app/[locale]/products/[market]/page.tsx:63-68`
    summary: Route owns a page-level `"use cache"` FAQ boundary.
  - type: file
    reference: `src/app/[locale]/products/[market]/page.tsx:86-108`
    summary: Route owns market metadata generation.
  - type: file
    reference: `src/app/[locale]/products/[market]/page.tsx:285-362`
    summary: Route owns product-group, breadcrumb, and FAQ JSON-LD composition.
  - type: file
    reference: `src/app/[locale]/products/[market]/page.tsx:415-510`
    summary: Route owns the main render path and still reaches 510 lines.
  - type: command
    reference: `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/largest-production-src-files.txt`
    summary: Product market page is the third-largest production source file and exceeds the 500-line project file limit.
  - type: command
    reference: `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/product-market-coupling.txt`
    summary: Market slugs are repeated across catalog config, product route, translations, SEO sidecar dates, sitemap tests, and product-spec parity tests.
- Business impact:
  - Adding or changing a product market is not a one-place edit. It touches buyer-facing page code, catalog definitions, per-market spec files, translation keys, SEO dates, and tests. That raises the chance that a new market page looks okay locally but misses SEO, schema, or translated spec rows.
- Root cause:
  - The route file is acting as both a controller and a domain registry. The canonical product catalog exists, but the market spec lookup is re-declared inside the route instead of living beside the catalog/spec domain.
- Recommended fix:
  - Move market-spec registration and translation/spec shaping out of the route into a product-market domain module. The route should call one small function that returns a prepared page model: market, families, translated specs, FAQ, JSON-LD data, and CTA target.
  - Do not add another wrapper layer. Delete the page-local `SPECS_BY_MARKET` and make the spec registry part of the product catalog/spec source.
- Verification needed:
  - Add or simulate one new market slug and prove only the catalog/spec registry, message keys, content, and tests need changes; the route should not need imports edited.
  - Run `pnpm dep:check`, targeted product market page tests, and a sitemap/static params check after the refactor.
- Suggested Linus Gate: Simplify

### FPH-L01-002: Locale and message truth is split across several hardcoded two-locale maps

- Severity: P2
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: architecture
- Source lane: 01-architecture-coupling
- Evidence:
  - type: file
    reference: `src/i18n/routing-config.ts:12-18`
    summary: next-intl routing declares `locales: ["en", "zh"]` and `defaultLocale: "en"`.
  - type: file
    reference: `src/config/paths/locales-config.ts:6-26`
    summary: path config separately declares locales, default locale, prefixes, display names, and time zones.
  - type: file
    reference: `src/lib/content-utils.ts:49-61`
    summary: content default config separately declares `defaultLocale: "en"` and `supportedLocales: ["en", "zh"]`.
  - type: file
    reference: `src/lib/load-messages.ts:32-44`
    summary: shared loader hardcodes message importers for `en` and `zh`.
  - type: file
    reference: `src/app/[locale]/contact/page.tsx:29-33`
    summary: contact route directly imports `en` and `zh` critical/deferred message files.
  - type: file
    reference: `src/app/[locale]/contact/page.tsx:327-340`
    summary: contact route has a page-local `STATIC_MESSAGES_BY_LOCALE` map.
  - type: command
    reference: `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/locale-hardcoding.txt`
    summary: Fresh grep shows locale facts repeated in routing, path config, content utilities, generated importers, contact page, and tests.
- Business impact:
  - Adding a third language is currently a scavenger hunt. Missing one of these maps can produce partial routing, partial content loading, or contact-page fallback behavior that is hard to see until a buyer lands on that locale.
- Root cause:
  - Locale metadata is not fully centralized. There is a routing truth, a path-config truth, a content-config truth, and a page-local contact message truth. They currently agree because there are only two locales, not because the architecture forces agreement.
- Recommended fix:
  - Pick one locale registry as the source for locale list/default/time zone/prefix metadata and have routing/content/path utilities derive from it.
  - Replace contact page's page-local static message map with a shared build-safe message loader, or explicitly name it as a generated artifact derived from the same source.
- Verification needed:
  - Add a temporary fake locale in a test-only branch or fixture and confirm TypeScript/tests point to one source of required updates rather than letting runtime miss pieces.
  - Run i18n parity checks and contact page rendering tests after consolidation.
- Suggested Linus Gate: Simplify

### FPH-L01-003: Contact copy still has a live compatibility fallback to the old `underConstruction.pages.contact` namespace

- Severity: P2
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: ai-smell
- Source lane: 01-architecture-coupling
- Evidence:
  - type: command
    reference: `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-review-architecture-truth.txt`
    summary: `review:architecture-truth` passed, but `review:legacy-markers` found 1 marker.
  - type: report
    reference: `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/legacy-marker-audit.md`
    summary: Fresh legacy marker report points to `src/lib/contact/getContactCopy.ts:154`.
  - type: file
    reference: `src/lib/contact/getContactCopy.ts:67-70`
    summary: `CONTACT_MESSAGE_ROOTS` reads `contact` first, then `underConstruction.pages.contact`.
  - type: file
    reference: `src/lib/contact/getContactCopy.ts:150-159`
    summary: The server helper documents and executes the legacy fallback path.
  - type: command
    reference: `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/legacy-underconstruction-markers.txt`
    summary: `underConstruction` namespace still exists in production message files and is referenced by contact copy tests.
  - type: file
    reference: `messages/en/critical.json:692-741`
    summary: English production messages still carry `underConstruction.pages.contact.*`.
  - type: file
    reference: `messages/zh/critical.json:692-741`
    summary: Chinese production messages still carry `underConstruction.pages.contact.*`.
- Business impact:
  - Contact is the lead-generation page. A missing or renamed current contact key can silently fall back to old "under construction" copy instead of failing loudly. That makes content regressions harder to catch before launch.
- Root cause:
  - A migration compatibility layer was left in the production copy path after the contact page became a real page. This is classic AI-smell: a fallback that looks safe, but hides truth-source drift.
- Recommended fix:
  - Delete the `underConstruction.pages.contact` fallback from production contact copy loading.
  - If old tests need it, move it to test fixtures only. Production should read `contact.*` or fail a targeted validation.
- Verification needed:
  - Remove/rename one required `contact.*` key in a local test fixture and verify the contact copy test fails instead of falling back.
  - Run `pnpm review:legacy-markers`, contact page tests, and i18n validation after cleanup.
- Suggested Linus Gate: Delete

### FPH-L01-004: Static route truth is duplicated across path config, next-intl pathnames, sitemap config, and page-expression links

- Severity: P2
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: architecture
- Source lane: 01-architecture-coupling
- Evidence:
  - type: file
    reference: `src/config/paths/paths-config.ts:13-64`
    summary: `PATHS_CONFIG` and `DYNAMIC_PATHS_CONFIG` define route paths and dynamic patterns.
  - type: file
    reference: `src/config/paths/utils.ts:41-52`
    summary: `PATHNAMES` repeats the same static routes and also includes `/products/[market]/[family]`.
  - type: file
    reference: `src/config/single-site-seo.ts:26-46`
    summary: sitemap page config repeats public static paths and page-level SEO priority/change-frequency.
  - type: file
    reference: `src/config/single-site-seo.ts:53-63`
    summary: static lastmod sidecar repeats concrete product market URLs.
  - type: file
    reference: `src/config/single-site-page-expression.ts:37-40`, `src/config/single-site-page-expression.ts:112-130`, `src/config/single-site-page-expression.ts:156-173`
    summary: page-expression config repeats CTA route literals such as `/contact` and `/capabilities/bending-machines`.
  - type: command
    reference: `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/route-config-coupling.txt`
    summary: Fresh grep shows route literals repeated across config, route parsing, sitemap tests, and page-expression config.
- Business impact:
  - Removing or renaming a page is a multi-table edit. If one table is missed, navigation, sitemap, language switching, or tests can drift from the actual App Router files. Buyers may hit stale URLs or search engines may receive stale sitemap entries.
- Root cause:
  - The project has a good intention: explicit route config. But it still keeps multiple literal lists instead of deriving next-intl pathnames, sitemap defaults, and CTA hrefs from the same typed route registry.
- Recommended fix:
  - Make `PATHS_CONFIG` the only static-route registry and derive `PATHNAMES` and public sitemap path lists from it.
  - For CTA targets, store route IDs where possible (`contact`, `products`, `bendingMachines`) and resolve to paths at the edge of rendering.
  - Keep product market lastmod sidecar if needed, but generate its keys from `getAllMarketSlugs()` to prevent forgotten markets.
- Verification needed:
  - Rename or remove one route in a test branch and verify one compile/test surface catches every required follow-up.
  - Run route parsing tests, sitemap tests, `pnpm truth:check`, and `pnpm dep:check`.
- Suggested Linus Gate: Simplify

### FPH-L01-005: Cache tag abstraction still carries product/content/SEO tag families that production does not use

- Severity: P3
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: architecture
- Source lane: 01-architecture-coupling
- Evidence:
  - type: file
    reference: `.claude/rules/cloudflare.md:64-79`
    summary: Runtime tag invalidation and `cacheTag()` are explicitly out of the current launch architecture; content updates flow through redeploy.
  - type: file
    reference: `src/lib/cache/index.ts:1-18`
    summary: Cache module re-exports i18n/content/product/SEO tag generators for convenience.
  - type: file
    reference: `src/lib/cache/cache-tags.ts:14-259`
    summary: Cache tag module defines domains and tag builders for i18n, content, product, and SEO.
  - type: command
    reference: `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/cache-client-boundaries.txt`
    summary: Production search shows only `src/lib/load-messages.ts` imports `i18nTags`; no production import uses content/product/SEO cache tags.
  - type: file
    reference: `src/lib/load-messages.ts:10`, `src/lib/load-messages.ts:62-63`
    summary: The actual production consumer uses only `i18nTags`.
- Business impact:
  - This is not breaking the site, but it keeps a "future architecture" alive in production code. Future changes can mistake product/content/SEO cache tags for supported runtime invalidation and reintroduce Cloudflare cache complexity that the launch architecture intentionally removed.
- Root cause:
  - The cache tag system survived a runtime-cache rollback. Comments were updated, but unused tag families were not deleted.
- Recommended fix:
  - Delete unused content/product/SEO tag families or move them to an archived design note. Keep only what production actually uses for i18n `unstable_cache`, or remove tags entirely if they are not needed without runtime invalidation.
- Verification needed:
  - Run `rg "contentTags|productTags|seoTags|cacheTags"` and `pnpm dep:check` after deletion.
  - Run the load-message runtime tests to ensure i18n loader behavior is unchanged.
- Suggested Linus Gate: Delete

### FPH-L01-006: One production module still imports through a barrel despite the architecture rule warning against it

- Severity: P3
- Evidence level: Confirmed by execution
- Confidence: high
- Domain: architecture
- Source lane: 01-architecture-coupling
- Evidence:
  - type: command
    reference: `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/pnpm-dep-check.txt`
    summary: Dependency-cruiser reports `warn no-barrel-export-dependencies: src/lib/utm.ts -> src/lib/cookie-consent/index.ts`.
  - type: report
    reference: `docs/audits/full-project-health-v1/evidence/01-architecture-coupling/dependency-conformance.json`
    summary: JSON conformance output confirms one warning with rule `no-barrel-export-dependencies`.
  - type: file
    reference: `src/lib/utm.ts:1-4`
    summary: `utm.ts` imports `loadConsent` from `@/lib/cookie-consent`.
  - type: file
    reference: `src/lib/cookie-consent/index.ts:1-30`
    summary: Barrel re-exports provider hooks, storage helpers, and types from multiple cookie-consent files.
- Business impact:
  - Low immediate risk, but it weakens the "no ambiguous dependencies" rule. A barrel import makes it easier for client-only attribution code to accidentally pull in more cookie-consent surface than it needs.
- Root cause:
  - Convenience import beat the dependency rule. The architecture rule is already in place; one caller has not been tightened.
- Recommended fix:
  - Import `loadConsent` directly from `@/lib/cookie-consent/storage` in `src/lib/utm.ts`, or narrow the barrel to client-safe exports only.
- Verification needed:
  - Run `pnpm dep:check` and confirm 0 dependency-cruiser warnings.
- Suggested Linus Gate: Simplify

## 5. Blocked / Not Proven

| Claim | Blocker | Needed proof | Suggested classification |
| --- | --- | --- | --- |
| No runtime page can fail from the architecture issues above | This lane did not run `pnpm build`, `pnpm build:cf`, browser smoke, or deployed smoke by contract. | Lane 00 build evidence plus UI/SEO lane runtime visits. | Needs proof |
| Product market route over-coupling causes a current buyer-visible defect | Static code proves high change cost, not an active rendering defect. | Add/modify a market in a controlled branch and measure required edit surfaces plus route output. | Needs proof |
| Locale split currently breaks a locale | Static code proves multiple truth surfaces, not an active broken locale. | Add a temporary locale or run a dedicated locale-expansion fixture. | Needs proof |
| Cache tag abstraction affects Cloudflare runtime today | Static code shows dead/unused families; no runtime invalidation call was found in this lane. | Cloudflare build/smoke plus grep for `cacheTag`/`revalidateTag` across production. | Needs proof |
| `reports/architecture/*` side effects are acceptable in worker write policy | Existing scripts generate reports there; files appear ignored/untracked and were copied into allowed lane evidence. | Orchestrator should decide whether future lane workers should redirect script report output or clean ignored side effects via an allowed process. | Needs proof |

## 6. Handoff to Orchestrator

| Finding ID | Handoff action | Reason |
| --- | --- | --- |
| FPH-L01-001 | merge | High-confidence change-cost risk on the product market path; likely belongs in architecture/change-cost map. |
| FPH-L01-002 | merge | High-confidence locale/i18n truth-source drift; coordinate with SEO/content lanes before assigning repair order. |
| FPH-L01-003 | challenge | Confirm whether the legacy fallback is intentional launch compatibility. If not intentional, this should be a clear delete-first cleanup. |
| FPH-L01-004 | merge | Route-path duplication is a structural maintenance risk; dedupe with SEO lane if they report sitemap drift. |
| FPH-L01-005 | keep | Low severity but strong delete-first candidate; useful for AI-smell cleanup backlog. |
| FPH-L01-006 | keep | Small dependency warning with exact one-line fix; not launch-blocking. |

## 7. Process Notes

Top 5 architecture risks:

1. Product market route is too broad: domain registry + route + SEO + JSON-LD + cache + render in one file.
2. Locale truth is spread across routing, path config, content defaults, message importers, and contact page static maps.
3. Contact copy has a live legacy fallback to `underConstruction.pages.contact.*`.
4. Static route truth is duplicated across route registry, next-intl pathnames, sitemap config, and CTA literals.
5. Cache tag abstractions outlive the current Cloudflare launch architecture.

Top 5 coupling hotspots from fresh structural hotspot execution:

1. Translation family: `messages/en/critical.json`, `messages/zh/critical.json`, `messages/en.json`, `messages/zh.json`.
2. Product market route: `src/app/[locale]/products/[market]/page.tsx` with product tests.
3. Contact/inquiry flow: `src/app/[locale]/contact/page.tsx`, `src/app/api/inquiry/route.ts`, contact action/tests, and message copy.
4. Runtime/security lead pipeline: `src/lib/idempotency.ts`, `src/lib/security/client-ip.ts`, `src/lib/security/distributed-rate-limit.ts`.
5. Deployment/runtime config: `package.json`, `next.config.ts`, `scripts/cloudflare/*`, `.github/workflows/*`.

Highest change-cost modules:

- `src/app/[locale]/products/[market]/page.tsx` because market changes cross product catalog, spec files, messages, SEO, sitemap, and route tests.
- `src/lib/env.ts` because it is a 612-line single env surface for many unrelated domains.
- `messages/{locale}/{critical,deferred}.json` plus flat compatibility files because translation edits have quartet/parity obligations.
- `src/config/paths/**` plus `src/config/single-site-seo.ts` because route changes must remain synchronized across pathnames and sitemap.
- Contact flow (`src/app/[locale]/contact/page.tsx`, `src/lib/contact/getContactCopy.ts`, `src/components/forms/**`, `src/lib/actions/contact.ts`) because it combines static content, message fallbacks, client form, server action, and lead pipeline.

Can delete or simplify:

- Delete `underConstruction.pages.contact.*` production fallback after a targeted failing-key test exists.
- Delete unused product/content/SEO cache tag families if no lane proves runtime need.
- Replace `src/lib/utm.ts` barrel import with direct `storage` import.
- Move product-market spec registry out of route file.
- Derive route `PATHNAMES` and sitemap public paths from the route registry.

AI-smell locations:

- `src/lib/contact/getContactCopy.ts`: compatibility fallback masks missing current copy.
- `src/app/[locale]/products/[market]/page.tsx`: clean-looking helpers split the file but do not reduce actual responsibility.
- `src/lib/cache/cache-tags.ts`: future-facing abstraction remains after launch architecture removed runtime invalidation.
- `src/lib/env.ts`: single "truth" surface grew into a broad mixed-domain registry.
- Tests around product specs duplicate route/product truth; useful coverage, but high edit friction when adding markets.

Command/process caveats:

- I did not run `pnpm build` or `pnpm build:cf`.
- I did not deploy or run production-mutating commands.
- Two diagnostic commands failed due local shell/path mistakes and were rerun correctly:
  - `rg ... src/sites ...` failed because `src/sites` does not exist in this checkout.
  - unquoted `src/app/[locale]/...` paths failed under zsh globbing; quoted reruns passed.
- `pnpm arch:*` and `pnpm review:architecture-truth` generated ignored `reports/architecture/*` files as script side effects. I copied the relevant fresh outputs into the assigned lane evidence directory.

# Product Truth Source Cleanup Implementation Plan

> **Execution status (2026-04-28): completed.** This file is now a historical execution record for branch `Alx-707/truth-cleanup-finish`, not the current backlog. The unchecked boxes below preserve the original plan shape; do not rerun them as open tasks without first checking the branch commits and current truth sweeps. Implemented commits: `5360f90`, `db71a4b`, `b6e1aed`, `220b2e9`, `f0516b9`, `87187ca`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove no-longer-true equipment product surfaces, remove shared product-market FAQ from live product pages, and align live SEO/page copy with the current product truth: Tianze sells conduit fittings, pipes, PETG tube products, and OEM manufacturing support, not bending machines as a public product line.

**Architecture:** Treat this as truth-source cleanup, not a redesign. Retire the bending-machines route and every live surface that claims equipment is a current standalone page/product line. Rewrite live identity, homepage, About, Contact, and SEO copy so equipment becomes at most an internal process/tooling capability, not a buyer-facing product promise. Remove the product-market shared FAQ because a non-market-specific FAQ is not a valid product-page requirement. Keep About, Contact, and OEM FAQ intact.

**Tech Stack:** Next.js 16.2 App Router, React 19.2, TypeScript 5.9, next-intl 4.8, MDX content manifest, Vitest, Playwright, Cloudflare/OpenNext build chain.

---

## Confirmed requirements

### In scope

1. Retire `/[locale]/capabilities/bending-machines` directly. Do not add a redirect.
2. Remove bending machines from route config, sitemap, SEO metadata, content manifest, tests, and live docs.
3. Remove the equipment card from `/products`.
4. Remove equipment specification constants if no production consumer remains.
5. Remove product-market shared FAQ from `/products/[market]`.
6. Remove `content/pages/{locale}/product-market.mdx` from live content.
7. Rewrite live site identity, homepage, About, Contact, and generated artifacts so Tianze is not publicly positioned as a bending machine/equipment supplier.
8. Remove dead equipment structured-data builders from live schema utilities.
9. Strengthen truth sweeps to cover broad business terms, not just the retired route slug.
10. Keep FAQ only on:
   - About
   - Contact
   - OEM custom manufacturing
11. Keep AS/NZS 2053 and AS/NZS 61386 as product/SEO keywords where naturally relevant, but do not create market-specific FAQ or a standards explainer in this plan.

### Out of scope

1. No `/faq` page.
2. No market-specific FAQ.
3. No AS/NZS standards article.
4. No product detail page.
5. No quote drawer or product-specific inquiry flow.
6. No full SEO strategy rewrite.
7. No redirect for the old equipment URL.
8. No public bending-machine/equipment product replacement page.

### Business copy stance

This plan uses the following copy contract. Do not continue until every live source follows it.

Allowed live wording:

- Tianze has in-house forming, tooling, mold, and process-control capability.
- Tianze can support custom bends, fittings, sample review, and OEM manufacturing.
- Tianze understands pipe forming from its factory process and uses that knowledge to control product quality.

Not allowed in live SEO, homepage, About, Contact, product pages, sitemap metadata, or generated artifacts:

- Tianze is a bending machine, pipe bending equipment, or pipe processing equipment supplier.
- Buyer-facing CTAs asking customers to source bending machines or pipe processing equipment.
- Product cards, route metadata, JSON-LD, FAQ, or docs that present bending machines as a current public product surface.

AS/NZS 2053 and AS/NZS 61386 are still valid SEO/product terms, but they belong in product-market copy where relevant. Do not solve those keywords by adding FAQ in this plan.

### Searchability rule for retired strings

Do not hide retired strings by splitting them across arrays or `.join()` calls. Negative tests may use the exact literal retired path:

```ts
const RETIRED_BENDING_MACHINES_PATH = "/capabilities/bending-machines";
```

Truth checks must classify the literal as an allowed negative-test reference instead of forcing tests to evade `rg`.

### File removal rule

Never permanently delete files. When removing tracked files, move them to a timestamped Trash folder first, then stage the resulting repository deletion:

```bash
STAMP=$(date +%Y%m%d-%H%M%S)
TRASH="$HOME/.Trash/tianze-product-truth-cleanup-$STAMP"
mkdir -p "$TRASH"
git add -A
```

Each removal task below includes the concrete `mv` commands for its files.

---

## File map

### Route and product pages

- Modify: `src/app/[locale]/products/page.tsx` — remove equipment card and `next/image` dependency if only used by that card.
- Modify: `src/app/[locale]/products/[market]/page.tsx` — remove shared FAQ loading, rendering, and FAQ JSON-LD.
- Move to Trash: `src/app/[locale]/capabilities/bending-machines/` — retire route and colocated tests.

### Config and metadata

- Modify: `src/config/single-site.ts` — rewrite site identity, default title/description, and keywords so they no longer sell or position Tianze as a bending machine/equipment supplier.
- Modify: `src/config/paths/paths-config.ts` — remove `bendingMachines`.
- Modify: `src/config/paths/types.ts` — remove `bendingMachines` from `PageType`.
- Modify: `src/config/paths/utils.ts` — remove `/capabilities/bending-machines` from `PATHNAMES`.
- Modify: `src/config/single-site-page-expression.ts` — remove `equipmentCard`.
- Modify: `src/config/single-site-seo.ts` — remove bending machines sitemap config.
- Modify: `src/lib/seo-metadata.ts` — remove `bendingMachines` metadata base config and switch case.
- Modify: `src/lib/content/page-dates.ts` — remove bending-machines MDX page-date mapping.

### Content and generated files

- Move to Trash: `content/pages/en/bending-machines.mdx`.
- Move to Trash: `content/pages/zh/bending-machines.mdx`.
- Move to Trash: `content/pages/en/product-market.mdx`.
- Move to Trash: `content/pages/zh/product-market.mdx`.
- Regenerate: `src/lib/content-manifest.generated.ts`.
- Regenerate: `src/lib/mdx-importers.generated.ts`.
- Modify: `content/pages/en/about.mdx` — rewrite About copy to product/manufacturing truth; no public equipment product promise.
- Modify: `content/pages/zh/about.mdx` — same Chinese rewrite.
- Modify: `content/pages/en/contact.mdx` — remove bending-machine inquiry language.
- Modify: `content/pages/zh/contact.mdx` — same Chinese rewrite.

### Structured data

- Modify: `src/lib/structured-data-generators.ts` — remove dead `EquipmentListSchemaInput` and `buildEquipmentListSchema`.
- Modify tests if present:
  - `src/lib/__tests__/structured-data.test.ts`
  - any test found by `rg -n "buildEquipmentListSchema|EquipmentListSchemaInput|ItemList" src tests`
- Modify: `.claude/rules/structured-data.md` only if it still presents equipment `ItemList` as a current live schema.

### Equipment constants and assets

- Move to Trash if no production consumer remains: `src/constants/equipment-specs.ts`.
- Move to Trash if no production consumer remains: `src/constants/__tests__/equipment-specs.test.ts`.
- Modify: `src/constants/product-specs/__tests__/i18n-parity.test.ts` — remove equipment parity block/import.
- Move to Trash if production-unreferenced after code cleanup:
  - `public/images/products/full-auto-bending-machine.svg`
  - any other equipment-only image found by `rg`.

### Messages

- Modify split message files:
  - `messages/en/critical.json`
  - `messages/zh/critical.json`
  - `messages/en/deferred.json`
  - `messages/zh/deferred.json`
- Regenerate flat compatibility artifacts:
  - `messages/en.json`
  - `messages/zh.json`

Remove only live equipment-page/product-card translation keys. Rewrite homepage/company/Contact copy that still implies "we sell bending machines" or "we are a bending equipment supplier." Keep generic manufacturing capability text only if it follows the business copy stance above.

### Tests and docs

- Modify: `src/app/[locale]/products/__tests__/products-page.test.tsx`.
- Modify: `src/app/[locale]/products/__tests__/page.test.tsx`.
- Modify: `src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx`.
- Modify: `src/app/__tests__/sitemap.test.ts`.
- Modify: `src/config/__tests__/paths.test.ts`.
- Modify: `src/config/__tests__/single-site-seo.test.ts`.
- Modify: `src/config/__tests__/single-site-page-expression.test.ts`.
- Modify: `src/lib/__tests__/seo-metadata.test.ts`.
- Modify: `src/lib/content/__tests__/mdx-faq.test.ts`.
- Modify: `tests/e2e/seo-validation.spec.ts`.
- Modify: `tests/e2e/user-journeys.spec.ts`.
- Modify: `docs/specs/behavioral-contracts.md`.
- Modify: `.claude/rules/content.md`.
- Modify: `docs/guides/CANONICAL-TRUTH-REGISTRY.md`.
- Modify: `scripts/review-derivative-readiness.js` if it still requires `product-market.mdx`.

---

## Task 1: Lock the new behavior with tests first

**Files:**
- Modify: `src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx`
- Modify: `src/app/[locale]/products/__tests__/products-page.test.tsx`
- Modify: `src/app/[locale]/products/__tests__/page.test.tsx`
- Modify: `src/app/__tests__/sitemap.test.ts`
- Modify: `src/lib/content/__tests__/mdx-faq.test.ts`
- Modify: `tests/e2e/seo-validation.spec.ts`
- Modify: `tests/e2e/user-journeys.spec.ts`

- [ ] **Step 1: Update product-market page test to reject shared FAQ**

In `src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx`, keep the `FaqSection` mock for this task so the test fails until production no longer renders it. Add this case:

```tsx
  describe("Scenario: Product market FAQ is not mounted", () => {
    it("does not render a shared FAQ section on market pages", async () => {
      await renderPage("north-america");

      expect(screen.queryByTestId("faq-section")).not.toBeInTheDocument();
    });
  });
```

Also keep the current `getPageBySlug` mock temporarily. It proves the page no longer depends on the product-market MDX read once implementation changes.

- [ ] **Step 2: Update products page test to reject equipment card**

In `src/app/[locale]/products/__tests__/products-page.test.tsx`, rename the Scenario 2.2 describe title from:

```ts
describe("Scenario 2.2: Buyer sees specialty and equipment products", () => {
```

to:

```ts
describe("Scenario 2.2: Buyer sees specialty products only", () => {
```

Replace the equipment link test with:

```tsx
    it("does not render a bending machines equipment card", async () => {
      await renderAsyncComponent(
        ProductsPage({ params: Promise.resolve(mockParams) }),
      );

      expect(screen.queryByText("overview.equipmentTitle")).not.toBeInTheDocument();
      expect(
        document.querySelector('a[href="/capabilities/bending-machines"]'),
      ).not.toBeInTheDocument();
    });
```

- [ ] **Step 3: Update products overview test mock copy**

In `src/app/[locale]/products/__tests__/page.test.tsx`, remove these mock translations because the production page should no longer ask for them:

```ts
  "overview.equipmentTitle": "Bending Machines",
  "overview.equipmentDescription": "Our manufacturing equipment",
```

Keep the assertion that the page renders five market cards.

- [ ] **Step 4: Update sitemap test to reject equipment URL**

In `src/app/__tests__/sitemap.test.ts`:

1. Remove `"/capabilities/bending-machines"` from the mocked `isMdxDrivenPage` list.
2. In `should include static pages`, replace the current positive assertion with:

```ts
      expect(urls).not.toContain(
        "https://example.com/en/capabilities/bending-machines",
      );
```

3. In `should include standalone pages with correct config`, remove the bending-machines block and keep only the OEM assertions.

- [ ] **Step 5: Update FAQ parity test to only cover live FAQ pages**

In `src/lib/content/__tests__/mdx-faq.test.ts`, set:

```ts
  const FAQ_PAGE_SLUGS = [
    "about",
    "contact",
    "oem-custom-manufacturing",
  ] as const;
```

- [ ] **Step 6: Update Playwright SEO key pages**

In `tests/e2e/seo-validation.spec.ts`:

1. Change North America product page expected graph types from:

```ts
      "ProductGroup",
      "BreadcrumbList",
      "FAQPage",
```

to:

```ts
      "ProductGroup",
      "BreadcrumbList",
```

2. Remove the entire object:

```ts
  {
    path: "/en/capabilities/bending-machines",
    name: "Bending Machines",
    expectedGraphTypes: ["Organization", "WebSite", "ItemList", "FAQPage"],
  },
```

- [ ] **Step 7: Remove bending-machines E2E journey**

In `tests/e2e/user-journeys.spec.ts`, remove the entire `test.describe("Journey: Bending Machines Page (BC-018)", ...)` block.

- [ ] **Step 8: Keep retired URL assertions searchable**

If any test needs a negative assertion for the retired URL, use this exact literal form:

```ts
const RETIRED_BENDING_MACHINES_PATH = "/capabilities/bending-machines";
```

Do not write variants like this:

```ts
const retiredEquipmentPath = [
  "/capabilities",
  ["bending", "machines"].join("-"),
].join("/");
```

Expected grep check:

```bash
rg -n "\[\"bending\", \"machines\"\]|retiredEquipmentPath|join\\(\"-\"\\)" src tests
```

Expected: no output for retired bending-machines test helpers. If the literal retired path appears in negative tests, classify it as allowed later in the truth sweep.

- [ ] **Step 9: Run the new focused tests and confirm they fail**

Run:

```bash
pnpm exec vitest run \
  'src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx' \
  'src/app/[locale]/products/__tests__/products-page.test.tsx' \
  src/app/__tests__/sitemap.test.ts \
  src/lib/content/__tests__/mdx-faq.test.ts
```

Expected before implementation:

- product-market test fails because FAQ is still rendered.
- products-page test fails because equipment card is still rendered.
- sitemap or FAQ parity may fail until route/content cleanup lands.

- [ ] **Step 10: Commit test contract**

```bash
git add \
  'src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx' \
  'src/app/[locale]/products/__tests__/products-page.test.tsx' \
  'src/app/[locale]/products/__tests__/page.test.tsx' \
  src/app/__tests__/sitemap.test.ts \
  src/lib/content/__tests__/mdx-faq.test.ts \
  tests/e2e/seo-validation.spec.ts \
  tests/e2e/user-journeys.spec.ts
git commit -m "test: lock product truth cleanup behavior"
```

---

## Task 2: Remove product-market shared FAQ from live market pages

**Files:**
- Modify: `src/app/[locale]/products/[market]/page.tsx`
- Modify: `tests/architecture/cache-directive-policy.test.ts`
- Move to Trash: `content/pages/en/product-market.mdx`
- Move to Trash: `content/pages/zh/product-market.mdx`
- Regenerate: `src/lib/content-manifest.generated.ts`
- Regenerate: `src/lib/mdx-importers.generated.ts`

- [ ] **Step 1: Remove FAQ imports from product-market page**

In `src/app/[locale]/products/[market]/page.tsx`, remove these imports:

```ts
import { cacheLife } from "next/cache";
import type { FaqItem, Locale } from "@/types/content.types";
import { getPageBySlug } from "@/lib/content";
import {
  extractFaqFromMetadata,
  generateFaqSchemaFromItems,
} from "@/lib/content/mdx-faq";
import { FaqSection } from "@/components/sections/faq-section";
```

Then add this replacement type-only import if `Locale` is still needed:

```ts
import type { Locale } from "@/types/content.types";
```

- [ ] **Step 2: Delete the page-local FAQ cache helper**

Remove this function entirely:

```ts
async function getProductMarketFaqItems(locale: Locale): Promise<FaqItem[]> {
  "use cache";
  cacheLife("days");

  const faqPage = await getPageBySlug("product-market", locale);
  return extractFaqFromMetadata(faqPage.metadata);
}
```

- [ ] **Step 3: Remove FAQ from JSON-LD model**

In `buildMarketPageJsonLdData`, remove these properties from the input type and call sites:

```ts
  faqItems,
  locale,
```

Remove this logic:

```ts
  const faqSchema =
    faqItems.length > 0 ? generateFaqSchemaFromItems(faqItems, locale) : null;

  return faqSchema
    ? [productGroupSchema, breadcrumbSchema, faqSchema]
    : [productGroupSchema, breadcrumbSchema];
```

Replace it with:

```ts
  return [productGroupSchema, breadcrumbSchema];
```

- [ ] **Step 4: Remove FAQ read and render from page component**

In `MarketPage`, remove:

```ts
  const faqItems = await getProductMarketFaqItems(locale as Locale);
```

Remove `faqItems` from the `buildMarketPageJsonLdData` call.

Remove the JSX block:

```tsx
      <FaqSection
        faqItems={faqItems}
        locale={locale as Locale}
        renderJsonLd={false}
      />
```

- [ ] **Step 5: Update cache policy test**

In `tests/architecture/cache-directive-policy.test.ts`, replace the product-market FAQ cache assertion with a "no shared FAQ read" assertion:

```ts
  it("keeps product market pages free of shared FAQ cache boundaries", () => {
    const source = readProductMarketPageSource();

    expect(source).not.toContain('"use cache"');
    expect(source).not.toContain("'use cache'");
    expect(source).not.toContain('from "next/cache"');
    expect(source).not.toContain("getProductMarketFaqItems");
    expect(source).not.toContain('getPageBySlug("product-market"');
    expect(source).not.toContain("<FaqSection");
    expect(source).not.toContain("generateFaqSchemaFromItems");
    expect(source).not.toContain("FAQPage");
  });
```

- [ ] **Step 6: Move product-market MDX files to Trash**

```bash
STAMP=$(date +%Y%m%d-%H%M%S)
TRASH="$HOME/.Trash/tianze-product-truth-cleanup-$STAMP/product-market-faq"
mkdir -p "$TRASH"
mv content/pages/en/product-market.mdx "$TRASH/"
mv content/pages/zh/product-market.mdx "$TRASH/"
```

- [ ] **Step 7: Regenerate content manifest**

Run:

```bash
tsx scripts/generate-content-manifest.ts
```

Expected:

- `src/lib/content-manifest.generated.ts` no longer contains `product-market`.
- `src/lib/mdx-importers.generated.ts` no longer imports product-market pages.

Verify:

```bash
rg -n "product-market|Product Market FAQ|产品市场 FAQ" \
  src/lib/content-manifest.generated.ts src/lib/mdx-importers.generated.ts
```

Expected: no output.

- [ ] **Step 8: Run focused tests**

```bash
pnpm exec vitest run \
  tests/architecture/cache-directive-policy.test.ts \
  'src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx' \
  src/lib/content/__tests__/mdx-faq.test.ts
```

Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add -A \
  'src/app/[locale]/products/[market]/page.tsx' \
  tests/architecture/cache-directive-policy.test.ts \
  src/lib/content-manifest.generated.ts \
  src/lib/mdx-importers.generated.ts \
  content/pages/en/product-market.mdx \
  content/pages/zh/product-market.mdx
git commit -m "fix(products): remove shared market faq"
```

---

## Task 3: Retire the bending-machines route and route truth

**Files:**
- Move to Trash: `src/app/[locale]/capabilities/bending-machines/`
- Modify: `src/config/paths/paths-config.ts`
- Modify: `src/config/paths/types.ts`
- Modify: `src/config/paths/utils.ts`
- Modify: `src/config/single-site-seo.ts`
- Modify: `src/lib/seo-metadata.ts`
- Modify: `src/lib/content/page-dates.ts`
- Modify tests listed below.

- [ ] **Step 1: Move route directory to Trash**

```bash
STAMP=$(date +%Y%m%d-%H%M%S)
TRASH="$HOME/.Trash/tianze-product-truth-cleanup-$STAMP/bending-route"
mkdir -p "$TRASH"
mv 'src/app/[locale]/capabilities/bending-machines' "$TRASH/"
```

If the parent directory `src/app/[locale]/capabilities` becomes empty, move it too:

```bash
if [ -d 'src/app/[locale]/capabilities' ] && [ -z "$(find 'src/app/[locale]/capabilities' -mindepth 1 -maxdepth 1 -print -quit)" ]; then
  mv 'src/app/[locale]/capabilities' "$TRASH/"
fi
```

- [ ] **Step 2: Remove route type/config**

In `src/config/paths/types.ts`, remove:

```ts
  | "bendingMachines"
```

In `src/config/paths/paths-config.ts`, remove:

```ts
  bendingMachines: Object.freeze({
    en: "/capabilities/bending-machines",
    zh: "/capabilities/bending-machines",
  }),
```

In `src/config/paths/utils.ts`, remove:

```ts
  "/capabilities/bending-machines": "/capabilities/bending-machines",
```

- [ ] **Step 3: Remove sitemap and date mapping**

In `src/config/single-site-seo.ts`, remove:

```ts
  "/capabilities/bending-machines": {
    changeFrequency: "monthly",
    priority: 0.8,
  },
```

In `src/lib/content/page-dates.ts`, remove:

```ts
  "/capabilities/bending-machines": "bending-machines",
```

- [ ] **Step 4: Remove SEO metadata base config**

In `src/lib/seo-metadata.ts`, remove the `bendingMachines` entry from `baseConfigs` and remove the matching `case "bendingMachines":` branch.

- [ ] **Step 5: Update route-related tests**

Update these tests so they no longer expect `bendingMachines`:

- `src/config/__tests__/paths.test.ts`
- `src/config/__tests__/single-site-seo.test.ts`
- `src/lib/__tests__/seo-metadata.test.ts`
- `src/app/__tests__/sitemap.test.ts`

Concrete expectations:

```ts
expect(PATHS_CONFIG).not.toHaveProperty("bendingMachines");
expect(SINGLE_SITE_PUBLIC_STATIC_PAGES).not.toContain("/capabilities/bending-machines");
```

For sitemap URL lists:

```ts
expect(urls).not.toContain("https://example.com/en/capabilities/bending-machines");
```

- [ ] **Step 6: Run focused route tests**

```bash
pnpm exec vitest run \
  src/config/__tests__/paths.test.ts \
  src/config/__tests__/single-site-seo.test.ts \
  src/lib/__tests__/seo-metadata.test.ts \
  src/app/__tests__/sitemap.test.ts
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add -A \
  'src/app/[locale]/capabilities' \
  src/config/paths/paths-config.ts \
  src/config/paths/types.ts \
  src/config/paths/utils.ts \
  src/config/single-site-seo.ts \
  src/lib/seo-metadata.ts \
  src/lib/content/page-dates.ts \
  src/config/__tests__/paths.test.ts \
  src/config/__tests__/single-site-seo.test.ts \
  src/lib/__tests__/seo-metadata.test.ts \
  src/app/__tests__/sitemap.test.ts
git commit -m "fix(routes): retire bending machines page"
```

---

## Task 4: Remove equipment card and equipment constants

**Files:**
- Modify: `src/app/[locale]/products/page.tsx`
- Modify: `src/config/single-site-page-expression.ts`
- Modify: `src/config/__tests__/single-site-page-expression.test.ts`
- Move to Trash if unreferenced: `src/constants/equipment-specs.ts`
- Move to Trash if unreferenced: `src/constants/__tests__/equipment-specs.test.ts`
- Modify: `src/constants/product-specs/__tests__/i18n-parity.test.ts`
- Move to Trash if unreferenced: `public/images/products/full-auto-bending-machine.svg`

- [ ] **Step 1: Remove equipment card expression config**

In `src/config/single-site-page-expression.ts`, remove:

```ts
  equipmentCard: {
    href: "/capabilities/bending-machines",
    imageSrc: "/images/products/full-auto-bending-machine.svg",
  },
```

Update `src/config/__tests__/single-site-page-expression.test.ts` by removing assertions for `equipmentCard.href` and `equipmentCard.imageSrc`.

- [ ] **Step 2: Remove equipment card from products page**

In `src/app/[locale]/products/page.tsx`:

1. Remove `Image` import if it becomes unused.
2. Remove `Link` import if it becomes unused.
3. Remove the entire JSX block beginning with:

```tsx
          {/* Bending Machines card — links to /capabilities/bending-machines */}
```

4. Keep PETG pneumatic tubes as the only specialty card for now.

Optional layout choice: leave the specialty section grid as `md:grid-cols-2`; do not redesign the page in this task.

- [ ] **Step 3: Check equipment constants are dead**

Run:

```bash
rg -n "EQUIPMENT_SPECS|getEquipmentBySlug|equipment-specs" src tests
```

Expected after route deletion: only tests or the constants file itself should remain.

- [ ] **Step 4: Move dead equipment constants/tests to Trash**

If Step 3 confirms no production consumer:

```bash
STAMP=$(date +%Y%m%d-%H%M%S)
TRASH="$HOME/.Trash/tianze-product-truth-cleanup-$STAMP/equipment-constants"
mkdir -p "$TRASH"
mv src/constants/equipment-specs.ts "$TRASH/"
mv src/constants/__tests__/equipment-specs.test.ts "$TRASH/"
```

In `src/constants/product-specs/__tests__/i18n-parity.test.ts`, remove:

```ts
import { EQUIPMENT_SPECS } from "@/constants/equipment-specs";
```

and remove the test block that starts with:

```ts
    it("every equipment spec has name, param labels, and highlights in both locales", () => {
```

- [ ] **Step 5: Move dead equipment image to Trash if unreferenced**

Run:

```bash
rg -n "full-auto-bending-machine.svg|full-auto-bending-machine" src messages content tests public
```

If no production code references `public/images/products/full-auto-bending-machine.svg`, move it:

```bash
STAMP=$(date +%Y%m%d-%H%M%S)
TRASH="$HOME/.Trash/tianze-product-truth-cleanup-$STAMP/equipment-assets"
mkdir -p "$TRASH"
mv public/images/products/full-auto-bending-machine.svg "$TRASH/"
```

- [ ] **Step 6: Run focused tests**

```bash
pnpm exec vitest run \
  'src/app/[locale]/products/__tests__/products-page.test.tsx' \
  'src/app/[locale]/products/__tests__/page.test.tsx' \
  src/config/__tests__/single-site-page-expression.test.ts \
  src/constants/product-specs/__tests__/i18n-parity.test.ts
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add -A \
  'src/app/[locale]/products/page.tsx' \
  src/config/single-site-page-expression.ts \
  src/config/__tests__/single-site-page-expression.test.ts \
  src/constants/equipment-specs.ts \
  src/constants/__tests__/equipment-specs.test.ts \
  src/constants/product-specs/__tests__/i18n-parity.test.ts \
  public/images/products/full-auto-bending-machine.svg
git commit -m "fix(products): remove equipment card surface"
```

---

## Task 5: Rewrite live SEO and page copy to the new equipment stance

**Files:**
- Modify: `src/config/single-site.ts`
- Modify: `messages/en/critical.json`
- Modify: `messages/zh/critical.json`
- Modify: `content/pages/en/about.mdx`
- Modify: `content/pages/zh/about.mdx`
- Modify: `content/pages/en/contact.mdx`
- Modify: `content/pages/zh/contact.mdx`
- Regenerate: `messages/en.json`
- Regenerate: `messages/zh.json`
- Regenerate: `src/lib/content-manifest.generated.ts`

- [ ] **Step 1: Rewrite site-level SEO identity**

In `src/config/single-site.ts`, replace the current equipment-first identity with fittings/manufacturing-first copy. Use this target shape:

```ts
description:
  "PVC Conduit Fittings & Pipe Manufacturing for Global B2B Buyers",
seo: {
  titleTemplate: "%s | Tianze Pipe",
  defaultTitle: "Tianze Pipe - PVC Conduit Fittings Manufacturer",
  defaultDescription:
    "PVC conduit fittings, conduit bends, PETG pneumatic tube products, and OEM manufacturing support from Tianze Pipe in Lianyungang, China.",
  keywords: [
    "PVC conduit fittings",
    "PVC conduit bends",
    "AS/NZS 2053",
    "AS/NZS 61386",
    "PVC pipe fittings",
    "PETG pneumatic tube",
    "OEM conduit fittings",
    "PVC conduit manufacturer China",
    "Schedule 80 conduit",
    "hospital pneumatic tube system",
  ],
},
```

Expected after the edit:

```bash
rg -n "pipe bending machine|pipe bending equipment|bending machinery|bending equipment manufacturer" src/config/single-site.ts
```

Expected: no output.

- [ ] **Step 2: Rewrite homepage hero and chain copy**

In `messages/en/critical.json`, rewrite these keys:

```json
"home.hero.title": "PVC Conduit Fittings Made for Export Projects.",
"home.hero.subtitle": "PVC conduit bends, fittings, PETG pneumatic tube products, and OEM manufacturing support from a factory with in-house forming, tooling, and quality control.",
"home.chain.title": "Process Control. Tooling. Finished Products.",
"home.chain.subtitle": "We keep forming, mold work, production, and inspection inside one factory so custom fittings and repeat orders stay consistent.",
"home.chain.step1.title": "Product Requirement Review",
"home.chain.step1.desc": "Application, standard, diameter, bend form, and packaging confirmed before quoting",
"home.chain.step2.title": "Tooling and Process Setup",
"home.chain.step2.desc": "In-house mold work and forming setup for standard and custom fittings"
```

In `messages/zh/critical.json`, rewrite the matching keys:

```json
"home.hero.title": "面向出口项目的 PVC 电工套管配件。",
"home.hero.subtitle": "提供 PVC 电工弯管、管件、PETG 气动物流管和 OEM 制造支持，工厂内部完成成型、模具和质检。",
"home.chain.title": "工艺、模具、成品同厂控制。",
"home.chain.subtitle": "成型工艺、模具开发、生产和检验都在同一工厂内完成，方便稳定交付定制管件和重复订单。",
"home.chain.step1.title": "产品需求确认",
"home.chain.step1.desc": "报价前确认应用、标准、口径、弯头形式和包装要求",
"home.chain.step2.title": "模具和工艺准备",
"home.chain.step2.desc": "针对标准和定制管件进行内部模具与成型工艺准备"
```

Keep the five-step chain component. Do not add a new homepage section.

- [ ] **Step 3: Rewrite footer and product-matrix copy that still sells equipment**

In `messages/en/critical.json`, replace footer and overview/product-line equipment copy with fittings/manufacturing language:

```json
"home.footer.about.desc": "PVC conduit bends, fittings, PETG pneumatic tube products, and OEM manufacturing support from Lianyungang, Jiangsu, China.",
"home.overview.subtitle": "Integrated conduit fittings manufacturing with in-house forming, precision molds, and quality-controlled production.",
"home.overview.features.performance.title": "In-House Forming Process",
"home.overview.features.performance.description": "Controlled forming setup for conduit bends and custom fittings used in export projects.",
"home.overview.architecture.frontend.title": "PVC Conduit Fittings",
"home.overview.architecture.frontend.description": "Conduit bends, elbows, couplings, bell ends, and custom fittings for electrical applications."
```

In `messages/zh/critical.json`, use the matching Chinese copy:

```json
"home.footer.about.desc": "位于江苏连云港的 PVC 电工弯管、管件、PETG 气动物流管和 OEM 制造供应商。",
"home.overview.subtitle": "围绕电工套管配件的制造能力，覆盖内部成型工艺、精密模具和质量管控。",
"home.overview.features.performance.title": "内部成型工艺",
"home.overview.features.performance.description": "用于出口项目中电工弯管和定制管件的稳定成型工艺。",
"home.overview.architecture.frontend.title": "PVC 电工套管配件",
"home.overview.architecture.frontend.description": "提供电工弯管、弯头、接头、扩口和定制管件。"
```

Expected after the edit:

```bash
rg -n "bending machines|bending equipment|pipe processing equipment|pipe bending machine|pipe bending equipment|弯管设备|弯管机|管材加工设备" messages/en/critical.json messages/zh/critical.json
```

Expected: no output unless the hit is a clearly retained negative-test fixture. Message files should normally have no such hit.

- [ ] **Step 4: Rewrite About page frontmatter and body**

In `content/pages/en/about.mdx`, remove buyer-facing equipment language from frontmatter and body. Use these replacements as the target content shape:

```yaml
description:
  'Learn how Tianze combines conduit fittings manufacturing, in-house tooling,
  and OEM flexibility for global B2B buyers.'
heroSubtitle: 'PVC Conduit Fittings Manufacturer'
heroDescription: 'We combine conduit fittings manufacturing, in-house forming, tooling, and OEM flexibility — serving global B2B buyers from our Lianyungang factory.'
seo:
  description:
    'Tianze Pipe manufactures PVC conduit systems, PETG pneumatic tubes,
    and OEM conduit fittings with in-house forming and tooling capability.'
  keywords:
    ['Tianze Pipe', 'PVC conduit manufacturer', 'PVC conduit fittings', 'PETG pneumatic tube']
aboutSections:
  values:
    innovation:
      description: 'From forming setup to custom molds, we develop key production capability inside the factory.'
  cta:
    title: 'Partner With a PVC Conduit Fittings Factory'
    description: 'Whether you need custom molds, sample review, or finished fittings, our team is ready to discuss your project.'
```

Body rewrite rules:

- Replace the "Pipe Processing Equipment" section with "In-House Forming and Tooling".
- Do not say Tianze sells or manufactures bending machines for buyers.
- The Contact paragraph must say "conduit fittings, custom molds, or pneumatic tube products", not "pipe processing equipment".

In `content/pages/zh/about.mdx`, make the same rewrite:

- Replace "弯管设备能力" with "成型工艺和模具能力" where it describes internal manufacturing.
- Replace "管材加工设备" product language with "PVC 电工套管配件" or "内部成型和模具能力".
- Remove "弯管机" from SEO keywords.
- Do not present "弯管设备" as a purchase category.

- [ ] **Step 5: Rewrite Contact page inquiry language**

In `content/pages/en/contact.mdx`, replace:

```md
Have questions about our PVC conduit fittings or bending machines? Our
international sales team responds within 24 business hours.
```

with:

```md
Have questions about our PVC conduit fittings, PETG pneumatic tube products, or
OEM manufacturing support? Our international sales team responds within 24
business hours.
```

In `content/pages/zh/contact.mdx`, replace the matching sentence so it asks about:

```md
PVC 电工套管配件、PETG 气动物流管产品或 OEM 制造支持
```

not `弯管设备`.

- [ ] **Step 6: Regenerate flat messages and content manifest**

Run:

```bash
pnpm i18n:regenerate-flat
tsx scripts/generate-content-manifest.ts
```

Expected:

- `messages/en.json` and `messages/zh.json` match split message files.
- `src/lib/content-manifest.generated.ts` reflects the About/Contact copy rewrite.

- [ ] **Step 7: Run focused copy truth search**

Run:

```bash
rg -n "bending machines|bending equipment|pipe processing equipment|pipe bending machine|pipe bending equipment|弯管设备|弯管机|管材加工设备" \
  src/config/single-site.ts \
  messages/en/critical.json messages/zh/critical.json messages/en.json messages/zh.json \
  content/pages/en/about.mdx content/pages/zh/about.mdx \
  content/pages/en/contact.mdx content/pages/zh/contact.mdx \
  src/lib/content-manifest.generated.ts
```

Expected: no output.

- [ ] **Step 8: Run translation/content checks**

```bash
pnpm validate:translations
pnpm i18n:shape:check
pnpm content:slug-check
```

Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add \
  src/config/single-site.ts \
  messages/en/critical.json \
  messages/zh/critical.json \
  messages/en.json \
  messages/zh.json \
  content/pages/en/about.mdx \
  content/pages/zh/about.mdx \
  content/pages/en/contact.mdx \
  content/pages/zh/contact.mdx \
  src/lib/content-manifest.generated.ts
git commit -m "fix(copy): align equipment stance with product truth"
```

---

## Task 6: Clean content, messages, and generated translation artifacts

**Files:**
- Move to Trash: `content/pages/en/bending-machines.mdx`
- Move to Trash: `content/pages/zh/bending-machines.mdx`
- Modify: `messages/en/critical.json`
- Modify: `messages/zh/critical.json`
- Modify: `messages/en/deferred.json`
- Modify: `messages/zh/deferred.json`
- Regenerate: `messages/en.json`
- Regenerate: `messages/zh.json`
- Regenerate: `src/lib/content-manifest.generated.ts`
- Regenerate: `src/lib/mdx-importers.generated.ts`

- [ ] **Step 1: Move bending-machines MDX files to Trash**

```bash
STAMP=$(date +%Y%m%d-%H%M%S)
TRASH="$HOME/.Trash/tianze-product-truth-cleanup-$STAMP/bending-mdx"
mkdir -p "$TRASH"
mv content/pages/en/bending-machines.mdx "$TRASH/"
mv content/pages/zh/bending-machines.mdx "$TRASH/"
```

- [ ] **Step 2: Remove live equipment translation keys**

Remove keys whose only purpose was the retired equipment page/card:

From `messages/en/critical.json` and `messages/zh/critical.json`:

- `catalog.overview.equipmentTitle`
- `catalog.overview.equipmentDescription`
- `catalog.overview.equipmentCta`
- homepage/product-card links that point to `/capabilities/bending-machines`, if they are still live.

From `messages/en/deferred.json` and `messages/zh/deferred.json`:

- `capabilities.bending-machines`
- `capabilities.machines`
- `capabilities.equipment`

Do not remove generic manufacturing capability copy until the current page/component consumer is checked. If the copy implies "we sell bending machines", rewrite or remove it in the consuming section in the same task.

- [ ] **Step 3: Regenerate flat message artifacts**

Run:

```bash
pnpm i18n:regenerate-flat
```

Expected:

- `messages/en.json` and `messages/zh.json` update.
- No split/flat drift remains.

- [ ] **Step 4: Regenerate content manifest again**

```bash
tsx scripts/generate-content-manifest.ts
```

Verify:

```bash
rg -n "bending-machines|Product Market FAQ|产品市场 FAQ" \
  src/lib/content-manifest.generated.ts src/lib/mdx-importers.generated.ts
```

Expected: no output.

- [ ] **Step 5: Run translation/content checks**

```bash
pnpm validate:translations
pnpm i18n:shape:check
pnpm content:slug-check
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add -A \
  content/pages/en/bending-machines.mdx \
  content/pages/zh/bending-machines.mdx \
  messages/en/critical.json \
  messages/zh/critical.json \
  messages/en/deferred.json \
  messages/zh/deferred.json \
  messages/en.json \
  messages/zh.json \
  src/lib/content-manifest.generated.ts \
  src/lib/mdx-importers.generated.ts
git commit -m "fix(content): remove equipment and market faq content"
```

---

## Task 7: Remove dead equipment structured-data builder

**Files:**
- Modify: `src/lib/structured-data-generators.ts`
- Modify if present: `src/lib/__tests__/structured-data.test.ts`
- Modify if needed: `.claude/rules/structured-data.md`
- Modify any file found by the reference search below if it treats equipment `ItemList` as current live behavior.

- [ ] **Step 1: Confirm current references**

Run:

```bash
rg -n "buildEquipmentListSchema|EquipmentListSchemaInput|Equipment.*Schema|ItemList" \
  src tests docs .claude scripts \
  --glob '!docs/superpowers/plans/**'
```

Expected before cleanup:

- `src/lib/structured-data-generators.ts` contains `EquipmentListSchemaInput`.
- `src/lib/structured-data-generators.ts` contains `buildEquipmentListSchema`.
- No production route should call `buildEquipmentListSchema`.

If a production call exists, stop and inspect it. Do not leave equipment JSON-LD active.

- [ ] **Step 2: Delete the dead input interface**

In `src/lib/structured-data-generators.ts`, remove:

```ts
interface EquipmentListSchemaInput {
  name: string;
  items: Array<{
    name: string;
    description: string;
  }>;
}
```

- [ ] **Step 3: Delete the dead schema builder**

In `src/lib/structured-data-generators.ts`, remove:

```ts
export function buildEquipmentListSchema(
  data: EquipmentListSchemaInput,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: data.name,
    itemListElement: data.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: item.name,
        description: item.description,
      },
    })),
  };
}
```

Do not replace it with a generic "future equipment" builder. YAGNI applies here.

- [ ] **Step 4: Update structured-data tests only if they reference the deleted builder**

Run:

```bash
rg -n "buildEquipmentListSchema|EquipmentListSchemaInput" src/lib/__tests__ tests src
```

If a test imports the deleted builder, remove that test case. Keep tests for current schemas such as Organization, WebSite, ProductGroup, FAQPage, AboutPage, OEM, Article, and BreadcrumbList.

- [ ] **Step 5: Update structured-data rule docs if needed**

Inspect:

```bash
sed -n '1,80p' .claude/rules/structured-data.md
```

If the rule says equipment `ItemList` is a current page-level schema, replace that with:

```md
Equipment ItemList schema is retired with the bending-machines page. Do not add equipment ItemList JSON-LD unless a future approved product surface brings it back.
```

Generic mention that Schema.org supports `ItemList` may remain if it is not tied to current equipment pages.

- [ ] **Step 6: Verify dead builder is gone**

```bash
rg -n "buildEquipmentListSchema|EquipmentListSchemaInput" src tests
```

Expected: no output.

- [ ] **Step 7: Run focused tests**

```bash
pnpm exec vitest run src/lib
```

Expected: pass. If this is too broad for the branch, run the structured-data test file found in Step 4 and record the narrower command.

- [ ] **Step 8: Commit**

```bash
git add \
  src/lib/structured-data-generators.ts \
  src/lib/__tests__/structured-data.test.ts \
  .claude/rules/structured-data.md
git commit -m "fix(schema): remove retired equipment structured data"
```

---

## Task 8: Update docs and review scripts truth

**Files:**
- Modify: `.claude/rules/content.md`
- Modify: `docs/specs/behavioral-contracts.md`
- Modify: `docs/guides/CANONICAL-TRUTH-REGISTRY.md`
- Modify: `docs/technical/next16-cache-notes.md`
- Modify: `docs/technical/deployment-notes.md`
- Modify: `.claude/product-marketing-context.md` if it still teaches future agents that equipment is a public product line.
- Modify active strategy docs if they are not clearly historical and still describe bending machines as a current public product line.
- Modify: `scripts/review-derivative-readiness.js`

- [ ] **Step 1: Update content rule**

In `.claude/rules/content.md`:

1. Remove wording that says bending machine pages are current mixed structured pages.
2. Replace the product market FAQ rule with:

```md
Product market pages do not currently mount FAQ content. Market-specific FAQ may be reconsidered later, but shared product-market FAQ is not part of the current live product-page contract.
```

3. Keep About, Contact, and OEM as page-owned FAQ examples.

- [ ] **Step 2: Update behavioral contracts**

In `docs/specs/behavioral-contracts.md`:

1. Update BC-013 to remove "plus a link to /capabilities/bending-machines".
2. Update BC-014 to remove product-page FAQ expectation if present.
3. Remove BC-018 entirely or mark it as retired with a short note:

```md
#### BC-018: Retired — Bending machines page

The bending machines page was retired in the product truth-source cleanup. Equipment is no longer a standalone live product/capability surface.
```

4. Update the sitemap contract to remove `capabilities/bending-machines`.

- [ ] **Step 3: Update canonical truth registry**

In `docs/guides/CANONICAL-TRUTH-REGISTRY.md`:

1. Remove the Bending machines row.
2. Remove product-market FAQ as a live truth surface.
3. Keep OEM FAQ row.

- [ ] **Step 4: Update active agent/product context**

Inspect active context docs:

```bash
rg -n "弯管设备|弯管机|bending equipment|bending machines|pipe processing equipment" \
  .claude/product-marketing-context.md docs/project-context.md docs/strategy \
  --glob '!docs/strategy/ring*/**/*historical*'
```

Expected handling:

- `.claude/product-marketing-context.md` must follow the new business copy stance because future agents may use it for live copy.
- `docs/project-context.md` should not teach current contributors that bending machines are a public product category.
- Strategy docs may keep historical business context only if the text is explicitly marked as historical or "not current public website positioning."

Recommended replacement note for active context files:

```md
Current public website stance: Tianze does not present bending machines or pipe processing equipment as buyer-facing product lines. Equipment know-how may be referenced only as internal forming, tooling, and process-control capability supporting conduit fittings, PETG tube products, and OEM manufacturing.
```

- [ ] **Step 5: Update cache/deployment notes**

In `docs/technical/next16-cache-notes.md`, remove statements that say the product-market FAQ helper is the current approved `use cache` boundary.

In `docs/technical/deployment-notes.md`, update references that list `/en/capabilities/bending-machines` as a current live proof URL. Historical audit tables can stay only if clearly historical; current runbooks must not require the retired URL.

- [ ] **Step 6: Update derivative readiness script**

Inspect:

```bash
sed -n '1,140p' scripts/review-derivative-readiness.js
```

If the script requires `content/pages/en/product-market.mdx`, remove that requirement and replace it with a check for live FAQ pages:

```js
const REQUIRED_PAGE_CONTENT = [
  "content/pages/en/about.mdx",
  "content/pages/zh/about.mdx",
  "content/pages/en/contact.mdx",
  "content/pages/zh/contact.mdx",
  "content/pages/en/oem-custom-manufacturing.mdx",
  "content/pages/zh/oem-custom-manufacturing.mdx",
];
```

Use the actual script shape; do not introduce a parallel check style if the file already has a helper.

- [ ] **Step 7: Run docs/review checks**

```bash
pnpm review:docs-truth
pnpm review:derivative-readiness
pnpm truth:check
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add \
  .claude/rules/content.md \
  docs/specs/behavioral-contracts.md \
  docs/guides/CANONICAL-TRUTH-REGISTRY.md \
  docs/technical/next16-cache-notes.md \
  docs/technical/deployment-notes.md \
  .claude/product-marketing-context.md \
  docs/project-context.md \
  scripts/review-derivative-readiness.js
git commit -m "docs: align product truth cleanup"
```

---

## Task 9: Sweep for remaining equipment and product-market FAQ live references

**Files:**
- Modify any live source/test/docs file identified by the searches below.

- [ ] **Step 1: Search for retired route references**

Run:

```bash
rg -n "capabilities/bending-machines|bendingMachines|Bending Machines|PVC Conduit Bending Machines" \
  src content messages tests scripts .claude docs \
  --glob '!docs/superpowers/plans/**' \
  --glob '!docs/research/**' \
  --glob '!docs/impeccable/**' \
  --glob '!content/_archive/**'
```

Expected:

- No live route/config/page/product-card references.
- Literal `/capabilities/bending-machines` may appear only in negative tests or retired notes that clearly say the page is gone.
- Do not hide literal path references by splitting strings.

- [ ] **Step 2: Search broad equipment business terms**

Run:

```bash
rg -n "bending machines|bending equipment|pipe processing equipment|pipe bending machine|pipe bending equipment|弯管设备|弯管机|管材加工设备" \
  src content messages tests scripts .claude docs \
  --glob '!docs/superpowers/plans/**' \
  --glob '!docs/research/**' \
  --glob '!docs/impeccable/**' \
  --glob '!content/_archive/**'
```

Expected classification:

- `src`, `content/pages`, `messages`, and generated live artifacts: no public equipment-product or equipment-supplier positioning.
- Tests: allowed only when asserting retired behavior; use literal strings, not split strings.
- `.claude/product-marketing-context.md` and current project docs: must follow the new business copy stance.
- Historical CWF/strategy material: either excluded from live proof or clearly marked as historical/not current public website positioning.

- [ ] **Step 3: Search for product-market FAQ references**

Run:

```bash
rg -n "product-market|Product Market FAQ|产品市场 FAQ|getProductMarketFaqItems|FAQPage" \
  src content messages tests scripts .claude docs \
  --glob '!docs/superpowers/plans/**' \
  --glob '!docs/research/**' \
  --glob '!docs/impeccable/**' \
  --glob '!content/_archive/**'
```

Expected:

- No `product-market` MDX/content-manifest/importer references.
- No product-market page FAQ read/render references.
- Generic `FAQPage` references may remain for About/Contact/OEM and shared FAQ helper tests.

- [ ] **Step 4: Search for equipment constants/assets references**

Run:

```bash
rg -n "EQUIPMENT_SPECS|getEquipmentBySlug|equipment-specs|full-auto-bending-machine|semi-auto-bending-machine" \
  src content messages tests scripts public \
  --glob '!content/_archive/**'
```

Expected: no live references unless a retained generic asset is intentionally still used.

- [ ] **Step 5: Search for dead equipment schema references**

Run:

```bash
rg -n "buildEquipmentListSchema|EquipmentListSchemaInput" src tests docs .claude scripts \
  --glob '!docs/superpowers/plans/**'
```

Expected:

- No `src` or `tests` output.
- Historical docs may mention the old builder only if they clearly say it was retired.

- [ ] **Step 6: Search for split-string hiding**

Run:

```bash
rg -n "retiredEquipmentPath|\\[\"bending\", \"machines\"\\]|\\['bending', 'machines'\\]|join\\(\"-\"\\)|join\\('-'\\)" src tests
```

Expected: no output for retired bending-machines helpers. Replace with a literal constant if found:

```ts
const RETIRED_BENDING_MACHINES_PATH = "/capabilities/bending-machines";
```

- [ ] **Step 7: Fix remaining live references**

For every unexpected hit:

1. Decide whether it is live truth or historical artifact.
2. If live truth, remove or rewrite it.
3. If historical artifact under active docs, mark it clearly as historical or move the cleanup to the docs task.
4. If it is a negative test, keep the literal string and document why it is allowed.

- [ ] **Step 8: Run architecture truth checks**

```bash
pnpm review:architecture-truth
pnpm review:template-residue
pnpm unused:check
```

Expected: all pass. If `unused:check` is not available in this branch, run `pnpm exec knip` and record the result in the final note.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: remove retired product truth references"
```

---

## Task 10: Final verification

**Files:**
- No planned source edits unless verification exposes a specific miss.

- [ ] **Step 1: Type-check**

```bash
pnpm type-check
```

Expected: pass.

- [ ] **Step 2: Lint**

```bash
pnpm lint:check
```

Expected: pass with zero warnings.

- [ ] **Step 3: Targeted Vitest suite**

```bash
pnpm exec vitest run \
  tests/architecture/cache-directive-policy.test.ts \
  'src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx' \
  'src/app/[locale]/products/__tests__/products-page.test.tsx' \
  'src/app/[locale]/products/__tests__/page.test.tsx' \
  src/app/__tests__/sitemap.test.ts \
  src/config/__tests__/paths.test.ts \
  src/config/__tests__/single-site-seo.test.ts \
  src/config/__tests__/single-site-page-expression.test.ts \
  src/lib/__tests__/seo-metadata.test.ts \
  src/lib/content/__tests__/mdx-faq.test.ts \
  src/constants/product-specs/__tests__/i18n-parity.test.ts \
  src/lib
```

Expected: all pass.

- [ ] **Step 4: Translation and truth checks**

```bash
pnpm review:translate-compat
pnpm review:docs-truth
pnpm review:derivative-readiness
pnpm truth:check
```

Expected: all pass.

- [ ] **Step 5: Final retired-equipment truth sweep**

Run the same broad checks from Task 9:

```bash
rg -n "bending machines|bending equipment|pipe processing equipment|pipe bending machine|pipe bending equipment|弯管设备|弯管机|管材加工设备" \
  src content messages tests scripts .claude docs \
  --glob '!docs/superpowers/plans/**' \
  --glob '!docs/research/**' \
  --glob '!docs/impeccable/**' \
  --glob '!content/_archive/**'

rg -n "retiredEquipmentPath|\\[\"bending\", \"machines\"\\]|\\['bending', 'machines'\\]|join\\(\"-\"\\)|join\\('-'\\)" src tests

rg -n "buildEquipmentListSchema|EquipmentListSchemaInput" src tests
```

Expected:

- No live marketing/SEO/product-sales claim that Tianze sells bending machines or pipe processing equipment.
- No split-string hiding in tests.
- No dead equipment schema builder in live source/tests.
- Any remaining docs hit is historical or explicitly marked as not current public website positioning.

- [ ] **Step 6: Standard build**

```bash
pnpm build
```

Expected: pass.

- [ ] **Step 7: Cloudflare build**

Run only after `pnpm build` has finished:

```bash
pnpm build:cf
```

Expected: pass.

- [ ] **Step 8: Optional E2E smoke**

If local browser dependencies are available:

```bash
pnpm test:release-smoke
```

Expected: pass. If blocked by environment, record the exact blocker.

- [ ] **Step 9: Final status**

Run:

```bash
git status --short
```

Expected: clean, unless the user asked not to commit during execution.

Final summary must state:

- Equipment route removed directly with no redirect.
- Product market FAQ removed from live product pages.
- About/Contact/OEM FAQ retained.
- Product pages no longer link to `/capabilities/bending-machines`.
- Live SEO/Home/About/Contact no longer positions Tianze as a bending machine or pipe processing equipment supplier.
- Dead equipment structured-data builder removed.
- Retired URL references in tests are literal and classified, not hidden by split strings.
- Verification commands and results.

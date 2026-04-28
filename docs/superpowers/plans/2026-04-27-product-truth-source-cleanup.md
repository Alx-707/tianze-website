# Product Truth Source Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove no-longer-true equipment product surfaces, remove shared product-market FAQ from live product pages, and keep the product area focused on real product markets, specifications, trust signals, and inquiry CTA.

**Architecture:** Treat this as truth-source cleanup, not a redesign. Retire the bending-machines route and every live surface that claims equipment is a current standalone page/product line. Remove the product-market shared FAQ because a non-market-specific FAQ is not a valid product-page requirement. Keep About, Contact, and OEM FAQ intact.

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
7. Keep FAQ only on:
   - About
   - Contact
   - OEM custom manufacturing
8. Keep AS/NZS 2053 and AS/NZS 61386 as product/SEO keywords where naturally relevant, but do not create market-specific FAQ or a standards explainer in this plan.

### Out of scope

1. No `/faq` page.
2. No market-specific FAQ.
3. No AS/NZS standards article.
4. No product detail page.
5. No quote drawer or product-specific inquiry flow.
6. No full SEO strategy rewrite.
7. No redirect for the old equipment URL.

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

Remove only live equipment-page/product-card translation keys. Keep generic company/manufacturing text if still used and accurate after copy review.

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

- [ ] **Step 8: Run the new focused tests and confirm they fail**

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

- [ ] **Step 9: Commit test contract**

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

## Task 5: Clean content, messages, and generated translation artifacts

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

## Task 6: Update docs and review scripts truth

**Files:**
- Modify: `.claude/rules/content.md`
- Modify: `docs/specs/behavioral-contracts.md`
- Modify: `docs/guides/CANONICAL-TRUTH-REGISTRY.md`
- Modify: `docs/technical/next16-cache-notes.md`
- Modify: `docs/technical/deployment-notes.md`
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

- [ ] **Step 4: Update cache/deployment notes**

In `docs/technical/next16-cache-notes.md`, remove statements that say the product-market FAQ helper is the current approved `use cache` boundary.

In `docs/technical/deployment-notes.md`, update references that list `/en/capabilities/bending-machines` as a current live proof URL. Historical audit tables can stay only if clearly historical; current runbooks must not require the retired URL.

- [ ] **Step 5: Update derivative readiness script**

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

- [ ] **Step 6: Run docs/review checks**

```bash
pnpm review:docs-truth
pnpm review:derivative-readiness
pnpm truth:check
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add \
  .claude/rules/content.md \
  docs/specs/behavioral-contracts.md \
  docs/guides/CANONICAL-TRUTH-REGISTRY.md \
  docs/technical/next16-cache-notes.md \
  docs/technical/deployment-notes.md \
  scripts/review-derivative-readiness.js
git commit -m "docs: align product truth cleanup"
```

---

## Task 7: Sweep for remaining equipment and product-market FAQ live references

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

Expected: no live source/test/rule/runbook references. Historical research/archive references may remain only under excluded paths or if clearly marked historical.

- [ ] **Step 2: Search for product-market FAQ references**

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

- [ ] **Step 3: Search for equipment constants/assets references**

Run:

```bash
rg -n "EQUIPMENT_SPECS|getEquipmentBySlug|equipment-specs|full-auto-bending-machine" \
  src content messages tests scripts public \
  --glob '!content/_archive/**'
```

Expected: no live references unless a retained generic asset is intentionally still used.

- [ ] **Step 4: Fix remaining live references**

For every unexpected hit:

1. Decide whether it is live truth or historical artifact.
2. If live truth, remove or rewrite it.
3. If historical artifact under active docs, mark it clearly as historical or move the cleanup to the docs task.

- [ ] **Step 5: Run architecture truth checks**

```bash
pnpm review:architecture-truth
pnpm review:template-residue
pnpm unused:check
```

Expected: all pass. If `unused:check` is not available in this branch, run `pnpm exec knip` and record the result in the final note.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove retired product truth references"
```

---

## Task 8: Final verification

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
  src/constants/product-specs/__tests__/i18n-parity.test.ts
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

- [ ] **Step 5: Standard build**

```bash
pnpm build
```

Expected: pass.

- [ ] **Step 6: Cloudflare build**

Run only after `pnpm build` has finished:

```bash
pnpm build:cf
```

Expected: pass.

- [ ] **Step 7: Optional E2E smoke**

If local browser dependencies are available:

```bash
pnpm test:release-smoke
```

Expected: pass. If blocked by environment, record the exact blocker.

- [ ] **Step 8: Final status**

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
- Verification commands and results.

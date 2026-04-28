# Product Truth Source Cleanup - Tasks 1-2

> Extracted from `../2026-04-27-product-truth-source-cleanup.md` so the historical plan follows the repository 500-line file limit.
> This is an execution record, not a fresh backlog; verify current branch state before rerunning any unchecked item.
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

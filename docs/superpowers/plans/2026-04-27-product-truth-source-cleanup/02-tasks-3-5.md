# Product Truth Source Cleanup - Tasks 3-5

> Extracted from `../2026-04-27-product-truth-source-cleanup.md` so the historical plan follows the repository 500-line file limit.
> This is an execution record, not a fresh backlog; verify current branch state before rerunning any unchecked item.
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

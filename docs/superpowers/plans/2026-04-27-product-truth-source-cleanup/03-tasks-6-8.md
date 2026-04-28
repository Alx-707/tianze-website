# Product Truth Source Cleanup - Tasks 6-8

> Extracted from `../2026-04-27-product-truth-source-cleanup.md` so the historical plan follows the repository 500-line file limit.
> This is an execution record, not a fresh backlog; verify current branch state before rerunning any unchecked item.
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

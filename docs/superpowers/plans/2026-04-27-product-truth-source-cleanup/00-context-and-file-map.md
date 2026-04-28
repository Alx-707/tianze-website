# Product Truth Source Cleanup - Context and file map

> Extracted from `../2026-04-27-product-truth-source-cleanup.md` so the historical plan follows the repository 500-line file limit.
> This is an execution record, not a fresh backlog; verify current branch state before rerunning any unchecked item.
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

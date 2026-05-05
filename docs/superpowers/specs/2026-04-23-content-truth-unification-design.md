# Project-Wide Truth & Quality Unification — Design Spec

> Expanded from the original content-truth-only scope to cover SEO completeness, proof integrity, and ongoing hygiene — all planned together, executed in parallel series.

## Problem

The project has no documented rule for where page content, configuration, and translations belong. Each page invented its own approach during early development. Beyond content, the SEO configuration is partially complete with material gaps, and some test/proof lanes give false confidence about deployment readiness.

### Content truth problems (6 areas)

- Legal pages split truth across MDX, translation JSON, and config arrays
- About page has a dormant MDX file while all content lives in translation JSON and route code
- Contact page duplicates form copy across critical/deferred translation files plus a fallback in config
- FAQ content (long-form prose) is stored in translation JSON — the wrong container
- SEO metadata has three competing sources with no priority rule
- Equipment spec highlights are hardcoded in English, not connected to the translation system

### SEO completeness gaps

- Product market pages lack Product/ProductGroup structured data
- Blog post references a missing OG image asset
- Product market pages build alternates/canonical manually instead of using central helpers
- Terms page emits weaker schema than Privacy page
- About/OEM pages lacked page-specific structured data; the old equipment page is now retired
- Sitemap timestamps use generation time instead of content-driven dates

### Proof integrity concerns

- Test lanes can go green while proving something narrower than assumed
- Cloudflare build success does not equal deployment confidence
- Runtime and local-only proof boundaries are not always distinguished

### Clean areas (do not touch)

Home page, nav, footer, product catalog structure, product detail pages, error pages, shared components, `single-site*.ts` config structure.

## Goals

Two goals, equally weighted:

1. **Editing efficiency** — Changing any page's content requires editing one file, not hunting across three.
2. **Derivative-project replication** — When cloning this site for a new brand, the replacement path is precise and ordered, with nothing hidden.

## Decisions made during brainstorming

| Decision | Choice |
|----------|--------|
| Architecture approach | Four-layer rule system (see below) |
| FAQ ownership | Per-page independent; no shared FAQ pool |
| Derivative project timeline | Actively being pursued; replacement boundaries must be precise and operational |
| Content editors | Both human and AI; file format must be simple yet structured |
| Existing legal+about plan | Absorbed into this initiative, not rewritten |
| Equipment spec approach | Stays in structured config with i18n, not MDX (structured card data, not prose) |
| Execution model | Plan together, execute in parallel series; user decides execution assignment |

---

## The Four-Layer Rule

Every content field has exactly one **canonical authoring source**. Runtime-derived outputs (TOC generated from headings, JSON-LD generated from frontmatter, metadata composed from multiple layers) are not authoring duplication and are explicitly allowed.

### Layer 1: Company Identity — "Who you are"

**Lives in:** `single-site.ts`

**Contains:** Company name, address, contact details, established year, employee count, certification list, export countries, social media links, and other hard business facts.

**Schema principle:** Fields are a menu, not a required form. Each brand fills in what they have. Missing fields are empty; consuming components do not render what is absent. Layer 2 controls whether a section that depends on identity data is mounted at all.

**Derivative replacement:** First file to replace. One change updates the entire site.

### Layer 2: Page Expression — "How pages are assembled"

**Lives in:** `single-site-page-expression.ts`

**Contains:** Structural switches and pointers only. Examples: whether the About page shows a FAQ section, which CTA href to use, home page section ordering, OEM process step count.

**Rule:** Switches and pointers only — never content itself. "About page shows FAQ = yes" belongs here. The FAQ questions and answers do not.

**Derivative replacement:** Second file to replace. Adjust switches per the new brand's page needs.

### Layer 3: Page Content — "What pages say"

**Lives in:** `content/pages/{locale}/` as MDX files, one file per page per locale.

**Contains:** All substantive page content — prose, hero copy, narrative sections, FAQ Q&A pairs, image/text blocks. Also owns page-level metadata in frontmatter: title, SEO description, publish/update dates, review dates.

**Rule:** If the content must be rewritten when changing brands, it belongs here — regardless of length. A three-word page title and a three-paragraph company story both live here.

**Exception for structured card data:** Content that is primarily structured data (equipment spec cards with parameters + highlights, product catalog entries) stays in typed config/constants with i18n support rather than MDX. The test: if the content is better modeled as typed fields than as prose, it belongs in structured config even if it changes with brand.

**FAQ rule:** Each page owns its own FAQ content within its MDX file. If two pages need the same question, each maintains its own copy independently. FAQ entries that reference company facts (established year, export countries) should use the values from Layer 1 at render time, not hardcode them in MDX.

**Narrative reference rule:** About page narrative may mention company facts ("founded in 2008") as prose storytelling. This is not authoring duplication — Layer 1 remains the canonical structured source; the narrative is a derived expression. However, stats sections that display structured fact cards must read from Layer 1, not from MDX.

**Derivative replacement:** Third set of files to replace. Swap the `content/pages/` directory to change all page copy.

### Layer 4: UI Chrome — "What buttons say"

**Lives in:** `messages/{locale}/` translation JSON files.

**Contains:** Cross-page, reusable interface text only. Navigation menu items, button labels ("Submit", "Back", "Learn More"), form field labels ("Name", "Email"), generic indicators ("Loading", "Error occurred"), structural labels ("Table of Contents", "Effective Date").

**Rule:** If the text would likely survive a brand change unchanged, it belongs here. If it must be rewritten for a new brand, it belongs in Layer 3.

**Critical/deferred split guideline:** `critical` = text visible on first screen without scrolling or interaction. `deferred` = text that appears after scroll or interaction. This is an optimization guideline, not a hard boundary — it may shift with layout changes. If post-migration volume is small enough that the split adds more complexity than value, consolidate into a single file.

**Derivative replacement:** Usually not replaced. Only changed if the new brand wants a different UI voice/tone.

### SEO crawl strategy (sidecar — outside the four layers)

**Lives in:** `single-site-seo.ts`

**Contains:** Sitemap priorities, change frequencies, robots rules, static page lists, lastmod dates. This is search engine crawl configuration, not content. It sits outside the four-layer content model.

### Boundary rules

| Content | Layer | Rationale |
|---------|-------|-----------|
| Page title (e.g., "Privacy Policy") | 3 — MDX frontmatter | Page-specific; changes with brand |
| SEO title / description | 3 — MDX frontmatter | Page-specific; changes with brand |
| "Table of Contents" label | 4 — Translation | Cross-page UI element; survives brand change |
| FAQ questions and answers | 3 — MDX | Page content; changes with brand |
| "Show FAQ section" toggle | 2 — Page expression | Structural switch |
| Company email address | 1 — Identity | Site-wide fact |
| "Submit Inquiry" button text | 4 — Translation | Generic UI element |
| Equipment spec highlights | Structured config + i18n | Structured card data, not prose |
| Sitemap priorities / robots rules | SEO sidecar | Crawl strategy, not content |

### SEO metadata field-level ownership

| Field | Owner | Fallback |
|-------|-------|----------|
| title | Page MDX frontmatter (Layer 3) | Site default in `single-site.ts` (Layer 1) |
| description | Page MDX frontmatter (Layer 3) | Site default in `single-site.ts` (Layer 1) |
| keywords | Page shell / SEO helper | Site default in `single-site.ts` |
| openGraph image | Page-specific asset or central fallback | Site default OG image |
| openGraph type | Route-level SEO helper | `website` default |
| canonical | Route-level URL generator | — |
| alternates / hreflang | Route-level URL generator (must include `x-default`) | — |
| structured data (JSON-LD) | Page shell + structured-data generators | Layout-level Organization + WebSite |
| sitemap priority / changefreq | `single-site-seo.ts` | — |
| sitemap lastmod | Content-driven dates (not generation time) | — |

The `seo.pages.*` keys in translation files are eliminated. Page SEO reads from MDX frontmatter. Route-level SEO helpers compose the full metadata object.

### Frontmatter date truth rule

Each locale's MDX frontmatter holds its own dates (`publishedAt`, `updatedAt`, `lastReviewed`). Locales are independently maintained — if the English version is updated before the Chinese version, each reflects its own state. Sitemap `lastmod` uses the most recent `updatedAt` across locales for a given page.

---

## FAQ data model

FAQ content in MDX uses structured frontmatter, not inline prose:

```yaml
faq:
  - id: stable-anchor-id
    question: "Question text here"
    answer: "Answer text here. Can reference {companyName} or {exportCountries} for Layer 1 interpolation."
```

This format supports:
- Stable anchor IDs for deep linking and testing (not derived from question text)
- Extraction by the page shell for accordion UI rendering
- JSON-LD `FAQPage` schema generation
- Layer 1 fact interpolation at render time
- Locale parity validation (same IDs across locales)

---

## About page block contract

The About page MDX supports these content blocks only:

- **Hero section** — via frontmatter (`heroTitle`, `heroSubtitle`, `heroDescription`)
- **Rich text sections** — standard MDX body prose (company story, narrative)
- **Image-text blocks** — MDX with image references
- **FAQ block** — via frontmatter `faq` array (see FAQ data model above)

The About page MDX does **not** support:
- Arbitrary component mounting
- Stats/fact cards (these read from Layer 1 via the shell)
- CTA blocks (controlled by Layer 2 page expression)
- Value cards with icons (controlled by Layer 2 page expression + Layer 4 labels)

---

## Contact page content classification

| Content surface | Layer | Rationale |
|----------------|-------|-----------|
| Page header / hero copy | 3 — MDX | Page-specific narrative |
| Contact methods card (email, phone, WhatsApp) | 1 — Identity facts + 4 — labels | Facts from Layer 1, "Email Us" label from Layer 4 |
| Response expectations card | 3 — MDX | Page-specific guidance copy |
| Business hours card | 1 — Identity facts + 4 — labels | Hours from Layer 1, "Business Hours" label from Layer 4 |
| FAQ Q&A | 3 — MDX frontmatter | Page content (per FAQ data model) |
| Form field labels | 4 — Translation | Generic UI elements |
| Form validation / error messages | 4 — Translation | Generic UI elements |
| Loading/Suspense state | 4 — Translation (skeleton or generic message) | UI state, not content |
| Page metadata / SEO | 3 — MDX frontmatter | Per SEO field ownership table |

Config fallback copy (`SINGLE_SITE_CONTACT_PAGE_FALLBACK`) is deleted. Loading states use skeleton UI or generic Layer 4 messages, not content-specific fallback.

---

## Legal page heading stability

TOC is generated from MDX headings, but anchors must be stable:

- Headings support explicit IDs (via remark/rehype plugin or MDX syntax)
- If no explicit ID, generated via deterministic slugify
- Anchor stability is part of the legal page contract — changing a heading does not silently break deep links
- Tests validate anchor IDs, not heading text

---

## Series 1: Content Truth Unification

### Treatment per problem area

#### 1. Legal pages (privacy + terms)

**From:** Body in MDX, but title/SEO in translation JSON, TOC structure in config arrays. Two pages use different rendering logic.

**To:** Everything in MDX (Layer 3). Title, SEO description, dates in frontmatter. TOC auto-generated from document headings with stable anchors. Translation files keep only shell labels (Layer 4). Config section-key arrays removed. Both pages share one rendering template. Inline `renderPrivacyContent()` deleted; unified pipeline via shared legal shell.

#### 2. About page

**From:** MDX file exists but is dormant. All content in translation JSON and route code.

**To:** MDX becomes the live content source (Layer 3) — hero copy, company story, image/text blocks, page-specific FAQ (per block contract above). Shell controls (show FAQ, show stats, show CTA) stay in page expression config (Layer 2). Hard business facts stay in identity config (Layer 1). Dead translation keys (`hero.*`, `mission.*`, `values.*`, `stats.*`, `cta.*`) cleaned up.

#### 3. Contact page

**From:** Form labels split across critical/deferred with duplication. FAQ in translation JSON. Fallback copy in config.

**To:** Per contact page content classification table above. Contact page guidance copy, response expectations, and FAQ move to MDX (Layer 3). Form field labels stay in translation files (Layer 4). Config fallback copy deleted; loading states use skeleton UI. Critical/deferred duplication cleaned up.

#### 4. FAQ system

**From:** All Q&A stored in translation JSON as a shared pool. Multiple pages select items by key.

**To:** No more shared FAQ pool. Each page owns its FAQ content in its own MDX frontmatter using the FAQ data model defined above. Config only controls whether the FAQ section is mounted (Layer 2). All pages that currently consume shared FAQ get their own FAQ content:
- About page
- Contact page
- OEM page
- Bending machines page

#### 5. Equipment spec multilingual

**From:** Bending machine highlights hardcoded in English in constants file. Not translatable.

**To:** Equipment spec stays in structured TypeScript config (not MDX — this is card data, not prose). Highlights become locale-aware via i18n integration within the typed equipment spec structure.

#### 6. SEO metadata ownership

**From:** Three sources (identity config, SEO config, translation JSON) with no priority rule.

**To:** Per the SEO metadata field-level ownership table above. `seo.pages.*` translation keys eliminated. Each field has one clear owner. Route-level SEO helpers compose the full metadata object from defined sources.

### Absorption of existing plan

The earlier legal/about implementation plan was absorbed into this design. That historical plan has been removed from the live docs tree; use git history or the Trash archive if exact old task wording is needed.

| Original task | Treatment |
|---------------|-----------|
| Task 1 (docs rules) | Expanded to cover all six areas |
| Task 2 (legal page unification) | Retained; heading stability contract added |
| Task 3 (about page migration) | Retained; FAQ uses new data model; block contract defined |
| Task 4 (derivative project seams) | Expanded to cover all areas |
| Task 5 (verification) | Expanded to full-project verification |

### Execution batches (sequential)

**Batch A: Rules + Legal Pages** (first — freezes contracts)
- Write the unified four-layer rule document
- Define page content contracts (frontmatter schemas, FAQ format, block definitions)
- Execute legal page unification as first proof of the new rules
- Validate: tests, translation quartet, build

**Batch B: FAQ Decomposition + About + Contact + OEM FAQ + historical equipment FAQ (archived)**
- Decompose FAQ from shared pool to per-page MDX frontmatter for About, Contact, OEM, and archived historical equipment content
- Execute About page MDX migration
- Execute Contact page treatment
- Clean up dead translation keys
- Validate: tests, translation quartet, build

**Batch C: Equipment + SEO Ownership + Translation Cleanup + Derivative Docs**
- Equipment spec i18n integration
- SEO field ownership enforcement (delete `seo.pages.*`, wire frontmatter)
- Translation file critical/deferred cleanup and rule documentation
- Derivative project replacement runbook
- Full-project verification

**Batch order:** A → B → C (sequential, not parallel). A freezes the contracts that B and C depend on.

---

## Series 2: SEO Completeness Closure

Based on the SEO audit findings. Should execute after Series 1 Batch A completes (because content truth changes affect metadata sources).

### Treatments

#### Product page metadata consistency
- Product market pages adopt central metadata helper instead of hand-rolling alternates/canonical
- Include `x-default` in alternates
- Align with the same helper path as other public pages

#### Product structured data
- Add Product / ProductGroup JSON-LD to product market pages
- High-value SEO gap — product pages are the most commercially important

#### Social image strategy
- Fix missing blog OG image (`public/images/blog/welcome-og.jpg`)
- Define per-page vs central fallback OG image strategy
- Ensure all public pages have a working social image path

#### Legal/About/Capability schema coverage
- Terms page: upgrade from generic WebPage to legal-specific schema (match Privacy page)
- About page: add appropriate page-specific schema
- OEM: add capability-appropriate schema; old equipment page work is historical only

#### Sitemap quality
- Replace `new Date()` generation-time timestamps with content-driven `updatedAt` dates
- Verify family-page coverage against intended information architecture
- Align blog detail alternates with sitemap alternate semantics

---

## Series 3: Proof Integrity (lower priority, can parallel)

Based on audit findings about test/deployment confidence gaps.

### Scope

- Audit what each existing test lane actually proves vs what people assume it proves
- Document the boundary between local proof, CI proof, and Cloudflare deployment proof
- Identify tests that go green while proving something narrower than the claimed behavior
- Not a rewrite — a meaning-sharpening exercise

### Relationship to other series

Independent of Series 1 and 2. Can execute in parallel or after. Does not modify the same files.

---

## Series 4: Continuous Hygiene (not a project — ongoing practices)

- **Wrapper drift:** Monitor that `site-facts.ts`, `product-catalog.ts` wrappers forward truth instead of inventing it
- **Docs-to-code fidelity:** Run `review:docs-truth` regularly; keep docs current after structural changes
- **Product catalog route bindings:** Keep route-local `SPECS_BY_MARKET` as implementation detail, not authoring seam

These are not task batches. They are practices to maintain during and after the other series.

---

## Derivative project replacement runbook

After all series complete, the replacement path for a new brand:

1. **`single-site.ts`** — Brand identity, contact, facts, defaults
2. **`single-site-product-catalog.ts`** — Product structure
3. **`single-site-page-expression.ts`** — Page assembly switches, CTA targets
4. **`content/pages/**`** — All page narrative, FAQ, hero copy, legal text
5. **`single-site-seo.ts`** — Crawl strategy, sitemap priorities
6. **`public/images/**`** — Brand assets, OG images, certificates, product photos
7. **Review `messages/{locale}/`** — Usually no change needed; adjust only for UI tone
8. **Run verification chain** — `pnpm ci:local`, `pnpm build:cf`, `pnpm review:docs-truth`, `pnpm review:derivative-readiness`, `pnpm review:translation-quartet`

Steps 1-6 are replacement. Step 7 is review. Step 8 is proof. Do not skip steps or reorder.

---

## Out of scope

- Multi-language expansion beyond en/zh (current architecture supports it; no changes needed now)
- CMS or external SEO tooling integration
- Home page, nav, footer, product catalog structure, product detail pages, error pages, shared components (all clean)
- Redesign of `single-site*.ts` config structure (already clean)
- Security contract audit (separate concern)

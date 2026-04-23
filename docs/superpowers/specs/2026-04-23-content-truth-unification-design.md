# Content Truth Unification — Design Spec

> Project-wide initiative to establish and enforce a unified "what content lives where" rule system across the Tianze website.

## Problem

The project has no documented rule for where page content, configuration, and translations belong. Each page invented its own approach during early development. The result:

- Legal pages split truth across MDX, translation JSON, and config arrays
- About page has a dormant MDX file while all content lives in translation JSON and route code
- Contact page duplicates form copy across critical/deferred translation files plus a fallback in config
- FAQ content (long-form prose) is stored in translation JSON — the wrong container
- SEO metadata has three competing sources with no priority rule
- Equipment spec highlights are hardcoded in English, not connected to the translation system

Six areas are messy. The rest of the project (home page, nav, footer, product catalog, product detail pages, error pages, shared components, `single-site*.ts` config structure) is clean and should not be touched.

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

---

## The Four-Layer Rule

Every piece of content in the project belongs to exactly one layer. Content must not appear in two layers simultaneously.

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

**FAQ rule:** Each page owns its own FAQ content within its MDX file. If two pages need the same question, each maintains its own copy independently.

**Derivative replacement:** Third set of files to replace. Swap the `content/pages/` directory to change all page copy.

### Layer 4: UI Chrome — "What buttons say"

**Lives in:** `messages/{locale}/` translation JSON files.

**Contains:** Cross-page, reusable interface text only. Navigation menu items, button labels ("Submit", "Back", "Learn More"), form field labels ("Name", "Email"), generic indicators ("Loading", "Error occurred"), structural labels ("Table of Contents", "Effective Date").

**Rule:** If the text would likely survive a brand change unchanged, it belongs here. If it must be rewritten for a new brand, it belongs in Layer 3.

**Critical/deferred split rule:** `critical` = text visible on first screen without scrolling or interaction. `deferred` = text that appears after scroll or interaction (validation messages, collapsed panels, modals). If post-migration volume is small enough that the split adds more complexity than value, consolidate into a single file.

**Derivative replacement:** Usually not replaced. Only changed if the new brand wants a different UI voice/tone.

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
| Equipment spec highlights | 3 — MDX | Product content; changes with brand |
| Sitemap priorities / robots rules | SEO config (unchanged) | Crawl strategy, not content |

### SEO metadata priority chain

Page MDX frontmatter (Layer 3) > Site-wide defaults in identity config (Layer 1). If a page defines its own SEO metadata, use it. If not, fall back to site defaults. The `seo.pages.*` keys in translation files are eliminated — page SEO reads from MDX frontmatter only. The SEO config file (`single-site-seo.ts`) continues to own crawl strategy (sitemap priorities, change frequencies, robots rules) and is not affected.

---

## Treatment per problem area

### 1. Legal pages (privacy + terms)

**From:** Body in MDX, but title/SEO in translation JSON, TOC structure in config arrays. Two pages use different rendering logic.

**To:** Everything in MDX (Layer 3). Title, SEO description, dates in frontmatter. TOC auto-generated from document headings. Translation files keep only shell labels (Layer 4). Config section-key arrays removed. Both pages share one rendering template. Inline `renderPrivacyContent()` deleted; unified pipeline via shared legal shell.

### 2. About page

**From:** MDX file exists but is dormant. All content in translation JSON and route code.

**To:** MDX becomes the live content source (Layer 3) — hero copy, company story, image/text blocks, page-specific FAQ. Shell controls (show FAQ, show stats, show CTA) stay in page expression config (Layer 2). Hard business facts stay in identity config (Layer 1). Dead translation keys (`hero.*`, `mission.*`, `values.*`, `stats.*`, `cta.*`) cleaned up.

### 3. Contact page

**From:** Form labels split across critical/deferred with duplication. FAQ in translation JSON. Fallback copy in config.

**To:** Contact page guidance copy and FAQ move to MDX (Layer 3). Form field labels ("Name", "Email", "Submit") stay in translation files (Layer 4) — they are generic UI elements. Config fallback copy deleted. Critical/deferred duplication cleaned up.

### 4. FAQ system

**From:** All Q&A stored in translation JSON as a shared pool. Multiple pages select items by key.

**To:** No more shared FAQ pool. Each page owns its FAQ content in its own MDX file (Layer 3). Config only controls whether the FAQ section is mounted (Layer 2). Pages that currently consume shared FAQ (about, contact, OEM, bending machines) each get their own FAQ content in their respective MDX files.

### 5. Equipment spec multilingual

**From:** Bending machine highlights hardcoded in English in constants file. Not translatable.

**To:** Product highlights move to MDX content (Layer 3) as page content that changes with brand.

### 6. SEO metadata ownership

**From:** Three sources (identity config, SEO config, translation JSON) with no priority rule.

**To:** Priority chain established (see above). `seo.pages.*` translation keys eliminated. Page SEO reads from MDX frontmatter. Site defaults from identity config. SEO config continues to own crawl strategy only.

---

## Absorption of existing plan

The existing implementation plan (`docs/superpowers/plans/2026-04-23-content-truth-legal-about.md`) is absorbed into this initiative:

| Original task | Treatment |
|---------------|-----------|
| Task 1 (docs rules) | Expanded to cover all six areas, not just legal + about |
| Task 2 (legal page unification) | Retained as-is |
| Task 3 (about page migration) | Retained; FAQ section updated to per-page independent model |
| Task 4 (derivative project seams) | Expanded to cover all areas |
| Task 5 (verification) | Expanded to full-project verification |

New work added: contact page treatment, FAQ system decomposition, equipment spec fix, SEO priority chain, translation file cleanup and split-rule documentation.

---

## Execution batches

### Batch A: Rules + Legal Pages (independent, no dependencies)

- Write the unified four-layer rule document (expands original Task 1)
- Execute legal page unification (original Task 2)
- Lowest risk; proves the workflow

### Batch B: FAQ Decomposition + About + Contact (coupled, must execute together)

- Decompose FAQ from shared pool to per-page content
- Execute About page MDX migration (original Task 3, adjusted)
- Execute Contact page treatment (new)
- These three are coupled because FAQ decomposition affects both About and Contact

### Batch C: Cleanup (depends on A + B completion)

- Equipment spec English → translation system
- SEO metadata priority chain enforcement
- Translation file critical/deferred cleanup and rule documentation
- Derivative project replacement documentation update
- Full-project verification

**Batch relationships:** A and B can run in parallel. C waits for both A and B to complete.

---

## Out of scope

- Multi-language expansion beyond en/zh (current architecture supports it; no changes needed now)
- CMS or external SEO tooling integration
- Home page, nav, footer, product catalog, product detail pages, error pages, shared components (all clean)
- Redesign of `single-site*.ts` config structure (already clean)

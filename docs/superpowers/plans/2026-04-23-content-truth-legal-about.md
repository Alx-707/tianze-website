> **⚠️ SUPERSEDED** — This plan has been absorbed into the project-wide truth & quality unification plan at `docs/superpowers/plans/2026-04-23-project-truth-quality-unification.md`. Do not execute this plan independently.

---

# Content Truth Consolidation for Legal and About Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make legal pages (`privacy` / `terms`) and the About page easier to edit, easier to localize, and easier to replace in future single-site derivative projects, without weakening the current single-site identity / SEO / Cloudflare / proof baseline.

**Architecture:** Keep the current single-site baseline split into four layers: `single-site*.ts` for site identity and reusable page-expression inputs, `content/pages/**` for page body truth, route-level shells for rendering/metadata/TOC, and shared runtime/proof infrastructure left untouched. Legal pages become strictly MDX-first with one shared legal shell; About becomes MDX-first for primary page content, while FAQ / CTA / stats stay mounted by a thin TypeScript shell using structured inputs.

**Tech Stack:** Next.js 16 App Router, next-intl, MDX content pipeline, TypeScript strict mode, Vitest, existing docs-truth and translation validation scripts.

---

## Why this plan exists

Current state is directionally good but not clean enough:

- `privacy` / `terms` already use MDX for body content, but metadata truth, TOC logic, and page rendering are still split across MDX, messages, and `single-site-page-expression.ts`.
- `about` currently renders from route code + messages + `siteFacts` + page-expression inputs, while `content/pages/*/about.mdx` is still dormant.
- The repository is intentionally being shaped into a **single-site reusable baseline**, so changes must preserve the first-wave derivative replacement surfaces:
  - `src/config/single-site.ts`
  - `src/config/single-site-product-catalog.ts`
  - `src/config/single-site-page-expression.ts`
  - `src/config/single-site-seo.ts`
  - `messages/{locale}/{critical,deferred}.json`
  - `content/pages/**`
  - `content/posts/**`

This plan keeps those seams clean instead of collapsing everything into either MDX or TS.

---

## Target model

### A. Legal pages

**Desired truth model**

- MDX frontmatter owns:
  - `title`
  - `description`
  - `publishedAt`
  - `updatedAt`
  - `lastReviewed`
  - optional page-local SEO overrides
- MDX headings (`##`, `###`) own document structure and TOC source.
- Route shell owns:
  - metadata generation from MDX frontmatter
  - TOC extraction
  - JSON-LD wrapper
  - generic page frame
- `messages` keep only shell-level UI labels:
  - table of contents label
  - effective date label
  - last updated label

**Stop lines**

- Do not keep a second legal-page truth in `messages` for page title/description.
- Do not keep `SINGLE_SITE_PRIVACY_SECTION_KEYS` / `SINGLE_SITE_TERMS_SECTION_KEYS` as the long-term TOC truth.
- Do not move legal copy into `single-site-page-expression.ts`.

### B. About page

**Desired truth model**

- MDX frontmatter + body own:
  - hero title/subtitle/description
  - long/short narrative sections
  - image/text sequence
  - page-local content blocks
- TypeScript shell still owns:
  - whether to mount FAQ / CTA / stats
  - which FAQ set to use
  - CTA target / variant
  - stats sourcing from `siteFacts`
- `siteFacts` / `single-site.ts` keep hard business facts:
  - established year
  - employee count
  - export countries
  - certifications
  - contact details

**Stop lines**

- Do not move hard business facts into MDX.
- Do not move FAQ question truth or shell-mounting switches into MDX frontmatter.
- Do not turn MDX into an unrestricted page-builder that can mount arbitrary runtime components.
- Do not break the derivative-project replacement spine by scattering brand/contact/SEO truth into the About body.

---

## File structure decisions

### Modify

- `content/pages/en/privacy.mdx`
- `content/pages/zh/privacy.mdx`
- `content/pages/en/terms.mdx`
- `content/pages/zh/terms.mdx`
- `content/pages/en/about.mdx`
- `content/pages/zh/about.mdx`
- `src/app/[locale]/privacy/page.tsx`
- `src/app/[locale]/terms/page.tsx`
- `src/app/[locale]/about/page.tsx`
- `src/lib/content/render-legal-content.tsx`
- `src/types/content.types.ts`
- `src/config/single-site-page-expression.ts`
- `.claude/rules/content.md`
- `.claude/rules/content.md`
- `docs/guides/CANONICAL-TRUTH-REGISTRY.md`

### Create

- `src/lib/content/legal-page.ts`
- `src/components/content/legal-page-shell.tsx`
- `src/components/content/about-page-shell.tsx`
- optional MDX-safe block components if needed for About:
  - `src/components/content/mdx/about-callout.tsx`
  - `src/components/content/mdx/about-image-block.tsx`

### Tests to update or add

- `src/app/[locale]/privacy/__tests__/page-async.test.tsx`
- `src/app/[locale]/privacy/__tests__/page.test.tsx`
- `src/app/[locale]/terms/__tests__/page-async.test.tsx`
- `src/app/[locale]/terms/__tests__/page.test.tsx`
- `src/app/[locale]/about/__tests__/page.test.tsx`
- add focused tests for new legal helper / shell if needed:
  - `src/lib/content/__tests__/legal-page.test.ts`
  - `src/components/content/__tests__/legal-page-shell.test.tsx`

---

## Task 1: Formalize the content-truth contract in docs first

**Files:**
- Modify: `.claude/rules/content.md`
- Modify: `.claude/rules/content.md`
- Modify: `docs/guides/CANONICAL-TRUTH-REGISTRY.md`

- [ ] **Step 1: Rewrite the rule distinction for legal vs About**

Document these rules explicitly:

- `privacy` / `terms` are MDX-first pages.
- `about` is no longer a dormant-MDX exception; it becomes MDX-first for page content, but still uses a TS shell for FAQ / CTA / stats and shared facts.
- `single-site.ts` / `siteFacts.ts` remain the source for hard business facts.

Run:

```bash
rg -n "about|privacy|terms|MDX-first|siteFacts|single-site-page-expression" .claude/rules/content.md docs/guides/CANONICAL-TRUTH-REGISTRY.md
```

Expected:
- docs describe the same target model
- no doc still claims About MDX is dormant after the migration

- [ ] **Step 2: Lock the derivative-project replacement boundary**

Update docs so future derivative projects know:

- replace page body copy in `content/pages/**`
- replace page-expression inputs in `single-site-page-expression.ts`
- replace hard site/business facts in `single-site.ts`
- do **not** push hard facts into About/legal MDX

Run:

```bash
rg -n "derivative|replacement|About|privacy|terms|single-site-page-expression|single-site.ts" docs/guides
```

Expected:
- replacement order is explicit
- no ambiguity about where future clones should edit first

---

## Task 2: Consolidate legal pages into one MDX-first pipeline

**Files:**
- Create: `src/lib/content/legal-page.ts`
- Create: `src/components/content/legal-page-shell.tsx`
- Modify: `src/lib/content/render-legal-content.tsx`
- Modify: `src/app/[locale]/privacy/page.tsx`
- Modify: `src/app/[locale]/terms/page.tsx`
- Modify: `content/pages/en/privacy.mdx`
- Modify: `content/pages/zh/privacy.mdx`
- Modify: `content/pages/en/terms.mdx`
- Modify: `content/pages/zh/terms.mdx`
- Modify: `src/types/content.types.ts`
- Test: `src/app/[locale]/privacy/__tests__/page-async.test.tsx`
- Test: `src/app/[locale]/privacy/__tests__/page.test.tsx`
- Test: `src/app/[locale]/terms/__tests__/page-async.test.tsx`
- Test: `src/app/[locale]/terms/__tests__/page.test.tsx`

- [ ] **Step 1: Add a typed legal-page loader**

Create a helper that wraps the existing content loader instead of replacing it:

- calls `getPageBySlug(slug, locale)` from `src/lib/content`
- narrows the returned `Page` metadata into a legal-page-specific shape
- returns typed frontmatter + content
- extracts H2/H3 headings for TOC

Do not create a second MDX loading pipeline. The new helper exists only to:

- reuse the current page-loading behavior
- centralize legal-page metadata narrowing
- centralize heading extraction for TOC

- [ ] **Step 2: Move legal metadata truth to MDX frontmatter**

For each legal page:

- ensure frontmatter has the canonical `title`, `description`, `publishedAt`, `updatedAt`, `lastReviewed`
- route metadata generation reads from MDX frontmatter first
- `messages` stay only for shell labels, not page business copy

- [ ] **Step 3: Replace TS section-key arrays with heading-derived TOC**

Remove legal-page dependency on:

- `SINGLE_SITE_PRIVACY_SECTION_KEYS`
- `SINGLE_SITE_TERMS_SECTION_KEYS`

TOC order should come directly from the MDX document structure.

- [ ] **Step 4: Unify rendering through one legal shell**

The shell should own:

- page header
- date labels
- TOC container
- JSON-LD wrapper
- article layout

`privacy/page.tsx` and `terms/page.tsx` become thin wrappers that only:

- resolve locale
- load page content
- pass data into the shell

Explicit cleanup:

- remove the inline `renderPrivacyContent()` implementation from `src/app/[locale]/privacy/page.tsx`
- make both legal pages use the same rendering pipeline built on `renderLegalContent()` plus the shared legal shell

- [ ] **Step 5: Verify legal-page parity**

Run:

```bash
pnpm exec vitest run \
  'src/app/[locale]/privacy/__tests__/page-async.test.tsx' \
  'src/app/[locale]/privacy/__tests__/page.test.tsx' \
  'src/app/[locale]/terms/__tests__/page-async.test.tsx' \
  'src/app/[locale]/terms/__tests__/page.test.tsx'
pnpm review:translation-quartet
```

Expected:
- legal pages still render localized shell labels
- page title/description/date now come from MDX truth
- TOC derives from headings, not from parallel config arrays

---

## Task 3: Migrate About to MDX-first with a controlled TS shell

**Files:**
- Create: `src/components/content/about-page-shell.tsx`
- Modify: `src/app/[locale]/about/page.tsx`
- Modify: `content/pages/en/about.mdx`
- Modify: `content/pages/zh/about.mdx`
- Modify: `src/types/content.types.ts`
- Modify: `src/config/single-site-page-expression.ts`
- Test: `src/app/[locale]/about/__tests__/page.test.tsx`

- [ ] **Step 1: Define typed About frontmatter**

Add an About-specific metadata shape for content metadata only. Good candidates:

- `heroTitle`
- `heroSubtitle`
- `heroDescription`

This can live as:

- a new `AboutPageMetadata` type in `src/types/content.types.ts`, or
- a route-local type if you want to avoid polluting global content metadata

Rule:
- use frontmatter only for page-local content expression and content metadata
- keep hard site facts out
- keep shell-mounting controls out

- [ ] **Step 2: Move About primary copy into MDX**

`content/pages/{locale}/about.mdx` should become the source for:

- hero copy
- company/story paragraphs
- image/text content blocks
- page narrative sections

The route should stop hardcoding major page copy in messages where the page is acting as a long-form content page.

Migration note:

- after the MDX migration lands, remove now-dead About page translation keys (`hero.*`, `mission.*`, `values.*`, `stats.*`, `cta.*`, and any other route-only About prose that is no longer read at runtime)
- keep only the remaining shell-level labels in messages if any still exist

- [ ] **Step 3: Keep FAQ / CTA / stats in the shell**

The About shell should:

- read MDX frontmatter
- render MDX body
- mount FAQ using `single-site-page-expression.ts`
- mount stats using `siteFacts` + `single-site-page-expression.ts`
- mount CTA using `single-site-page-expression.ts`

This keeps the future derivative-project replacement surface clean:

- page body lives in MDX
- reusable controls stay in `single-site-page-expression.ts`
- hard facts stay in `single-site.ts`

- [ ] **Step 4: Reduce About-specific truth drift in `single-site-page-expression.ts`**

After migration:

- keep only the About inputs that are truly reusable page-expression controls
- remove About page-local prose that no longer belongs there
- keep FAQ selection, CTA target/variant, and stats ordering if still useful as replace-first inputs

- [ ] **Step 5: Verify About page behavior**

Run:

```bash
pnpm exec vitest run 'src/app/[locale]/about/__tests__/page.test.tsx'
pnpm review:translation-quartet
pnpm review:translate-compat
```

Expected:
- About renders from MDX body + shell
- FAQ / CTA / stats still work
- hard business facts still come from `siteFacts`
- dead About translation keys are gone and quartet validation stays green
- About is now a future derivative-project content replacement surface

---

## Task 4: Keep the derivative-project seams clean

**Files:**
- Modify: `docs/guides/DERIVATIVE-PROJECT-REPLACEMENT-CHECKLIST.md` (if wording needs update)
- Modify: `docs/guides/DERIVATIVE-PROJECT-REPLACEMENT-CHECKLIST.md` (if wording needs update)
- Modify: `src/config/single-site-page-expression.ts`
- Modify: `src/config/single-site.ts`

- [ ] **Step 1: Re-state what future clones replace first**

For these pages, future derivative projects should replace:

- legal/about page body → `content/pages/**`
- page-specific shell switches → `single-site-page-expression.ts`
- hard site facts / brand / company identity → `single-site.ts`

- [ ] **Step 2: Re-state what future clones do not replace first**

Future derivative projects should not first-wave replace:

- legal shell runtime mechanics
- About shell runtime mechanics
- i18n loader semantics
- Cloudflare proof model
- security / abuse-protection chain

- [ ] **Step 3: Verify seam clarity**

Run:

```bash
pnpm review:docs-truth
pnpm review:derivative-readiness
```

Expected:
- docs and code point to the same replacement surfaces
- no new hidden truth layer is introduced

---

## Task 5: Final proof for this consolidation

**Files:**
- No new authoring files; verification only

- [ ] **Step 1: Run focused content/runtime proof**

Run:

```bash
pnpm exec vitest run \
  'src/app/[locale]/about/__tests__/page.test.tsx' \
  'src/app/[locale]/privacy/__tests__/page-async.test.tsx' \
  'src/app/[locale]/privacy/__tests__/page.test.tsx' \
  'src/app/[locale]/terms/__tests__/page-async.test.tsx' \
  'src/app/[locale]/terms/__tests__/page.test.tsx'
```

Expected:
- About, Privacy, Terms all render with their new truth boundaries intact

- [ ] **Step 2: Run narrow governance proof**

Run:

```bash
pnpm review:docs-truth
pnpm review:translation-quartet
pnpm review:translate-compat
```

Expected:
- docs truth remains aligned
- translation split/flat parity remains valid
- changed content surfaces still match the current runtime assumptions

- [ ] **Step 3: Run build proof**

Run:

```bash
pnpm clean:next-artifacts
pnpm build
pnpm build:cf
```

Expected:
- standard build passes
- Cloudflare build still passes
- no content-truth refactor leaks into runtime/platform regressions

---

## Decision summary

### Legal pages

- **Keep MDX-first**
- unify around one legal shell
- remove parallel TOC truth
- move title/description truth into MDX frontmatter

### About page

- **Migrate to MDX-first**
- keep shell-controlled FAQ / CTA / stats
- keep site identity facts in `single-site.ts`
- keep reusable page-expression switches in `single-site-page-expression.ts`

### Why this is the right compromise

This plan gives you:

- better day-to-day editing for bilingual content pages
- cleaner future derivative-project replacement seams
- less page-copy hardcoded in TS
- no regression into “everything is free-form MDX” chaos
- no damage to the current single-site baseline, proof model, or Cloudflare/runtime contracts

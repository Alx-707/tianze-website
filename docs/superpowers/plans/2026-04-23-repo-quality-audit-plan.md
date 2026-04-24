# Repo-Wide Quality Audit Implementation Plan

> Historical note: this plan originally wrote its audit package to `docs/plans/2026-04-23-repo-quality-audit/`. That downstream package has since been retired from the live docs tree. Keep this file only as historical workflow context.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a fresh, repo-wide audit package for `tianze-website` that defines codebase quality evaluation dimensions, maps truth-drift hotspots, and deeply audits SEO configuration completeness (including hreflang, OG images, metadata, sitemap/robots, and structured data), using current code and fresh evidence rather than archive assumptions.

**Architecture:** Execute the audit in four outputs that build on each other: a repo-specific quality dimension table, a truth-drift map, an SEO completeness audit, and a synthesis summary. Treat this as a read-mostly audit lane: prefer current code, current scripts, and current runtime entrypoints over historical docs. Keep the audit package in one folder so later review cycles can diff it cleanly.

**Tech Stack:** Next.js 16 App Router, next-intl, Cloudflare/OpenNext, MDX content pipeline, Vitest, Playwright, existing repo governance scripts (`review:docs-truth`, `truth:check`, `review:derivative-readiness`, `review:translation-quartet`, `review:translate-compat`).

---

## Audit framing

This plan is **not** asking for implementation fixes yet. It is asking for a current-state audit package with fresh evidence.

The audit must answer four questions:

1. Beyond “code runs”, how should this repository’s quality be judged?
2. Where do truth-drift risks still exist across code/config/messages/docs/tests?
3. Is the current SEO configuration complete enough for a serious bilingual B2B site?
4. Which issues are only documentation/design debt vs. which are merge/release-relevant engineering debt?

The audit must stay repo-specific. Do **not** turn it into generic frontend advice.

---

## Deliverable package

Create one audit folder:

`docs/plans/2026-04-23-repo-quality-audit/`

Inside it:

- `_index.md` — one-page synthesis and verdict
- `01-quality-dimensions.md` — codebase quality evaluation dimensions table
- `02-truth-drift-map.md` — similar truth-drift problem map
- `03-seo-config-completeness.md` — deep SEO completeness audit
- `04-evidence-notes.md` — raw evidence summary, commands, and scope notes

If a file already exists for part of this material, link it explicitly instead of duplicating it. But default to creating the package above so this audit is self-contained.

---

## File structure and responsibility

### Create

- `docs/plans/2026-04-23-repo-quality-audit/_index.md`
- `docs/plans/2026-04-23-repo-quality-audit/01-quality-dimensions.md`
- `docs/plans/2026-04-23-repo-quality-audit/02-truth-drift-map.md`
- `docs/plans/2026-04-23-repo-quality-audit/03-seo-config-completeness.md`
- `docs/plans/2026-04-23-repo-quality-audit/04-evidence-notes.md`

### Read heavily

- `docs/guides/CANONICAL-TRUTH-REGISTRY.md`
- `docs/guides/QUALITY-PROOF-LEVELS.md`
- `docs/guides/RELEASE-PROOF-RUNBOOK.md`
- `docs/guides/DERIVATIVE-PROJECT-REPLACEMENT-CHECKLIST.md`
- `.claude/rules/content.md`
- `.claude/rules/*.md` (especially `content.md`, `i18n.md`, `security.md`, `cloudflare.md`, `testing.md`)
- `src/config/single-site.ts`
- `src/config/single-site-product-catalog.ts`
- `src/config/single-site-page-expression.ts`
- `src/config/single-site-seo.ts`
- `src/config/site-facts.ts`
- `src/lib/seo-metadata.ts`
- `src/lib/structured-data*.ts`
- `src/lib/sitemap-utils.ts`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- page-level `generateMetadata` implementations under `src/app/[locale]/**/page.tsx`
- current tests around URL generation, SEO, sitemap, i18n routing, and page metadata

---

## Task 1: Build the evidence base and current-surface inventory

**Files:**
- Create: `docs/plans/2026-04-23-repo-quality-audit/04-evidence-notes.md`

- [ ] **Step 1: Create the audit package directory**

Run:

```bash
mkdir -p docs/plans/2026-04-23-repo-quality-audit
```

Expected:
- the audit package folder exists and is empty before writing

- [ ] **Step 2: Capture the current truth and proof sources**

Run:

```bash
sed -n '1,260p' docs/guides/CANONICAL-TRUTH-REGISTRY.md
sed -n '1,240p' docs/guides/QUALITY-PROOF-LEVELS.md
sed -n '1,220p' docs/guides/DERIVATIVE-PROJECT-REPLACEMENT-CHECKLIST.md
```

Record in `04-evidence-notes.md`:
- which files define current runtime truth
- which files define proof semantics
- which files define derivative replacement seams

- [ ] **Step 3: Capture the code surfaces that own site/content/SEO truth**

Run:

```bash
sed -n '1,260p' src/config/single-site.ts
sed -n '1,260p' src/config/single-site-product-catalog.ts
sed -n '1,260p' src/config/single-site-page-expression.ts
sed -n '1,260p' src/config/single-site-seo.ts
sed -n '1,220p' src/config/site-facts.ts
```

Record in `04-evidence-notes.md`:
- first-wave replaceable seams
- wrapper layers vs. true authoring layers
- any obvious second-truth risk

- [ ] **Step 4: Capture the SEO/runtime entry surfaces**

Run:

```bash
find src/app -maxdepth 3 \( -name 'page.tsx' -o -name 'layout.tsx' -o -name 'sitemap.ts' -o -name 'robots.ts' -o -name 'opengraph-image.tsx' -o -name 'twitter-image.tsx' \) | sort
find src/lib -maxdepth 3 \( -name '*seo*' -o -name '*structured*' -o -name '*metadata*' -o -name '*sitemap*' \) | sort
```

Record:
- page-level metadata entrypoints
- centralized SEO helpers
- structured-data helpers
- sitemap / robots ownership

- [ ] **Step 5: Save a compact evidence log**

Write `04-evidence-notes.md` with this header:

```md
# Evidence Notes — Repo Quality Audit

## Scope
- Current codebase only
- Current docs/rules only
- No archive assumptions unless a live file explicitly depends on them

## Primary truth sources
- ...

## Primary proof sources
- ...

## Primary SEO/runtime sources
- ...
```

---

## Task 2: Produce the codebase quality evaluation dimensions table

**Files:**
- Create: `docs/plans/2026-04-23-repo-quality-audit/01-quality-dimensions.md`
- Read: `docs/plans/current-repo-structural-audit-score.md`
- Read: `docs/plans/2026-03-23-current-structural-audit-report.md`

- [ ] **Step 1: Derive repo-specific dimensions from current discussions and code reality**

The table must include at least these dimensions:

- truth clarity
- proof integrity
- boundary health
- derivative readiness
- runtime/deployment confidence
- security contract consistency
- localization maintainability
- docs-to-code fidelity
- residue control
- change cost

For each dimension, define:
- what it means in this repo
- why it matters to Tianze Website specifically
- what strong / weak looks like
- which files or proof lanes supply evidence

- [ ] **Step 2: Write the dimensions table**

Use this structure in `01-quality-dimensions.md`:

```md
# Codebase Quality Evaluation Dimensions

| Dimension | What it measures in this repo | Strong signal | Weak signal | Main evidence surface |
|---|---|---|---|---|
| Truth clarity | ... | ... | ... | ... |
```

Then add a short section per dimension:

```md
## Truth clarity
- Why it matters:
- What to check:
- Current repo-specific risk pattern:
```

- [ ] **Step 3: Anchor the table to current evidence, not abstract theory**

Each dimension must name at least 2 real repo surfaces, for example:

- `src/config/single-site.ts`
- `src/config/single-site-page-expression.ts`
- `messages/{locale}/{critical,deferred}.json`
- `src/middleware.ts`
- `scripts/release-proof.sh`
- `docs/guides/CANONICAL-TRUTH-REGISTRY.md`

Do not write generic advice with no file anchors.

- [ ] **Step 4: Add a final scoring recommendation section**

At the end of `01-quality-dimensions.md`, add:

```md
## Suggested scoring use
- Use these dimensions for repo-wide audit, not feature-by-feature polish review.
- Running code is necessary but not sufficient.
- A repo can be green on build/test and still score weakly on truth clarity or derivative readiness.
```

---

## Task 3: Produce the similar truth-drift problem map

**Files:**
- Create: `docs/plans/2026-04-23-repo-quality-audit/02-truth-drift-map.md`

- [ ] **Step 1: Scan for “one concern, multiple truth layers”**

Run:

```bash
rg -n "single-site|site-facts|messages/|generateMetadata|sitemap|robots|structured data|getPageBySlug|MDX|faq|cta|fallback|MERGED_MESSAGES|SPECS_BY_MARKET" src docs .claude/rules -S
```

Classify findings into clusters such as:
- site identity vs wrappers
- page content vs page-expression vs route-local copy
- i18n runtime truth vs flat compatibility artifacts
- SEO defaults vs page-level metadata overrides
- product catalog truth vs route-local market bindings
- docs/rules vs current code reality
- tests vs actual runtime proof surfaces

- [ ] **Step 2: Write the drift map**

Use this structure:

```md
# Similar Truth-Drift Problem Map

## Cluster 1: Site identity vs wrappers
- First truth source:
- Wrapper/secondary surfaces:
- Why drift can happen:
- Current evidence:
- Severity:

## Cluster 2: ...
```

Each cluster must include:
- first truth source
- common secondary/drift surfaces
- why drift happens here
- current example files
- audit severity (`P1`, `P2`, `P3`)

- [ ] **Step 3: Distinguish “already controlled” vs “still risky”**

Add one verdict line per cluster:

- `Controlled`
- `Partially controlled`
- `Still drift-prone`

And justify it with current evidence, not memory alone.

- [ ] **Step 4: Add a recommended audit order**

End with:

```md
## Recommended audit order
1. ...
2. ...
3. ...
```

This should prioritize the clusters most likely to produce false confidence while code still “runs”.

---

## Task 4: Deep SEO configuration completeness audit

**Files:**
- Create: `docs/plans/2026-04-23-repo-quality-audit/03-seo-config-completeness.md`
- Read: `src/lib/seo-metadata.ts`
- Read: `src/app/sitemap.ts`
- Read: `src/app/robots.ts`
- Read: `src/lib/structured-data.ts`
- Read: `src/lib/structured-data-generators.ts`
- Read: `src/lib/structured-data-helpers.ts`
- Read: page-level `generateMetadata` implementations
- Read: `src/services/url-generator.ts`
- Read: SEO/i18n tests

- [ ] **Step 1: Inventory the SEO surfaces**

Run:

```bash
rg -n "generateMetadata|alternates:|openGraph|twitter|JsonLdScript|BreadcrumbList|sitemap|robots|hreflang|alternateLinks|canonical" src -S
```

Document these sections in `03-seo-config-completeness.md`:
- metadata generation model
- canonical URL model
- hreflang / alternates model
- OG / Twitter image model
- structured-data model
- sitemap model
- robots model

- [ ] **Step 2: Check hreflang / alternates completeness**

Review:
- `src/i18n/routing-config.ts`
- `src/services/url-generator.ts`
- page-level `generateMetadata`

Answer:
- are alternates generated consistently for current routes?
- is `x-default` handled?
- are there route classes with no alternates or inconsistent alternates?
- does About / Privacy / Terms / Products / Blog all follow the same model?

- [ ] **Step 3: Check OG / Twitter image completeness**

Review:
- page-level metadata
- any `opengraph-image.tsx` / `twitter-image.tsx`
- fallback image logic in `src/lib/seo-metadata.ts`

Answer:
- do all key public pages have explicit or inherited OG image behavior?
- is there one central fallback, or are some pages silent?
- are About / legal / blog / product pages consistent?

- [ ] **Step 4: Check structured-data completeness**

Review:
- `src/lib/structured-data*.ts`
- page usage of `JsonLdScript`

Answer:
- which page classes emit structured data today?
- do homepage / about / product / blog / legal pages all emit the expected schema class?
- are breadcrumbs, organization/site, article, and legal-page schemas present where expected?
- which pages have no structured data but likely should?

- [ ] **Step 5: Check sitemap / robots completeness**

Review:
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/config/single-site-seo.ts`

Answer:
- are all current public pages included?
- are locale variants handled correctly?
- are blog posts included?
- are product market pages included?
- are priority / changefreq / lastmod rules centralized and believable?
- does robots point at the right sitemap and disallow list?

- [ ] **Step 6: Write a completion verdict with severity**

Use this section structure:

```md
## SEO completeness verdict
- hreflang / alternates:
- canonical:
- OG / Twitter:
- structured data:
- sitemap:
- robots:

## Gaps
| Area | Gap | Severity | Evidence |
|---|---|---|---|
```

Severity must distinguish:
- `P1` = search/metadata correctness risk
- `P2` = completeness/coverage gap
- `P3` = refinement / polish gap

---

## Task 5: Produce the synthesis summary

**Files:**
- Create: `docs/plans/2026-04-23-repo-quality-audit/_index.md`

- [ ] **Step 1: Summarize the package**

Create `_index.md` with:

```md
# Repo Quality Audit Summary

## Scope

## Executive verdict

## Package contents
- [01-quality-dimensions.md](./01-quality-dimensions.md)
- [02-truth-drift-map.md](./02-truth-drift-map.md)
- [03-seo-config-completeness.md](./03-seo-config-completeness.md)
- [04-evidence-notes.md](./04-evidence-notes.md)
```

- [ ] **Step 2: Add decision-ready conclusions**

The summary must explicitly answer:
- what matters beyond “code runs”
- which truth-drift clusters are the most dangerous
- whether current SEO config is “basic complete”, “partially complete”, or “materially incomplete”
- what the next audit/repair order should be

- [ ] **Step 3: Add a merge/readiness boundary**

End `_index.md` with:

```md
## Use boundary
- This package is a current-state audit, not a release approval.
- Use it to decide repair order, not to claim production signoff.
```

---

## Task 6: Final verification of the audit package

**Files:**
- Verify only

- [ ] **Step 1: Run docs truth**

Run:

```bash
pnpm review:docs-truth
```

Expected:
- current docs truth still passes

- [ ] **Step 2: Run derivative-readiness**

Run:

```bash
pnpm review:derivative-readiness
```

Expected:
- the audit package does not contradict current derivative-project seams

- [ ] **Step 3: Run translation + truth checks**

Run:

```bash
pnpm truth:check
pnpm review:translation-quartet
pnpm review:translate-compat
```

Expected:
- no docs/truth/i18n regressions introduced while adding the audit package

- [ ] **Step 4: Optional targeted build proof if SEO findings imply runtime uncertainty**

If the SEO audit finds route-level metadata or sitemap ambiguity severe enough to question runtime behavior, also run:

```bash
pnpm clean:next-artifacts
pnpm build
pnpm build:cf
```

Expected:
- build surfaces remain green while the audit package is added

---

## Self-review checklist for the final package

- The dimensions table is repo-specific, not generic engineering advice.
- The truth-drift map points to real first-truth and secondary surfaces.
- The SEO audit explicitly covers hreflang, canonical, OG/Twitter images, structured data, sitemap, and robots.
- The summary states what matters beyond “code runs”.
- No archive content is treated as active truth unless a live file explicitly depends on it.

# Round 3 Deep Module Audit — Codex Execution Prompt

This is the **third pass** of a multi-round codebase quality audit. Two pieces of context are critical before you start:

## Background

**Round 1** (script-heavy): `docs/reports/2026-04-24-codebase-quality-audit.md` — produced 11 findings via 30+ verification scripts.

**Round 2A** (Claude deep, structural focus): `docs/reports/2026-04-25-deep-module-audit-claude.md` — 41 findings, focused on拆分/耦合/抽象/补丁注释 patterns. Read about 30 files, mostly `src/lib/` business core, `src/middleware.ts`, contact path, env, logger.

**Round 2B** (Codex deep, business-fact focus): `docs/reports/2026-04-25-deep-module-audit-codex.md` — your previous pass. 42 findings. **You were strikingly good at business fact integrity** — you found the placeholder phone, `/next.svg` logo, target price black hole, attribution data drop, fake `/search` SearchAction, developer-stack SEO keywords, About stats label mismatch. Round 2A missed nearly all of these.

**That business-fact-integrity lens is your unique strength. Lean into it harder this round.**

## Your Mission This Round

Cover the **remaining territory** that neither Round 2A nor 2B substantially read, applying the same business-fact-integrity lens that made Round 2B valuable. Plus continue the structural/code-shape lens secondarily.

## Output Location

- **Your report**: `docs/reports/2026-04-26-deep-module-audit-codex-round3.md`
- **Evidence (if any)**: `docs/reports/2026-04-26-deep-module-audit-codex-round3-artifacts/`

Do **not** modify the existing Round 1, 2A, 2B reports.

Use ID prefix `R3-CDX-LIB-NN`, `R3-CDX-COMP-NN`, `R3-CDX-APP-NN`, `R3-CDX-INFRA-NN`, `R3-CDX-CROSS-NN` so findings don't collide with prior rounds.

## Audit Posture (unchanged)

- Read-only. No build, deploy, lint, type-check, Semgrep, mutation, E2E commands.
- Audit target commit: `0daacf6897bdbef3bdc92610e345a8562d7f5d44` on detached worktree.
- Files read in this pass: aim for **80-120 files** read in full or near-full.

## Findings That Don't Count This Round

- Anything already recorded in Round 1, 2A, or 2B reports.
- Things only visible in script output (lint, type-check, knip, etc).
- File-count proliferation / over-decomposition (Round 2A covered this exhaustively).
- Lead conversion path duplication (Round 2A and 2B both covered).
- env.ts schema bloat (covered).

If a finding overlaps a prior ID, reference the prior ID and only record this new finding if it adds substantively new information (a different file, a different mechanism, a different business impact).

## Findings That Do Count

Your unique strength — keep applying it:

1. **Business fact integrity**:
   - Does this URL/path actually exist as a route?
   - Does this label match the data source it shows?
   - Is this asset a real brand asset or a starter/template residue?
   - Does the data source for this number actually represent what the UI claims?
   - Are SEO keywords real buyer terms or generic/technical noise?

2. **Data flow end-to-end**:
   - Does data collected in UI actually arrive at the destination (CRM/email/Airtable/analytics)?
   - Is this state actually written somewhere durable, or is it discarded?
   - Are validation results displayed to the user, or swallowed?

3. **Capability claims vs reality**:
   - Does this feature work without JavaScript / under SSR / without hydration?
   - Does this fallback actually trigger, or is it dead?
   - Does this i18n cover all visible text, or only some?

4. **Structural patterns** (secondary, only in newly-read files):
   - Patches and FIXED: comments
   - Special-case proliferation
   - Hidden coupling (shared mutable globals, magic strings as protocol)

## Module Reading Order — This Round's Specific Territory

Prioritize the **business-critical and trust-building** surfaces neither Round 2A nor 2B substantially read:

### Priority A: Lead conversion edges (high business impact)

- `src/app/api/subscribe/route.ts`
- `src/app/api/verify-turnstile/route.ts`
- `src/app/api/csp-report/route.ts`
- `src/app/api/health/route.ts`
- `src/lib/airtable/instance.ts`
- `src/lib/airtable/record-schema.ts`
- `src/lib/airtable/service.ts`
- `src/lib/airtable/service-internal/client.ts`
- `src/lib/airtable/service-internal/contact-records.ts`
- `src/lib/airtable/service-internal/lead-records.ts`
- `src/lib/airtable/service-internal/stats.ts`
- `src/lib/airtable/types.ts`
- `src/lib/resend.ts`, `src/lib/resend-core.tsx`, `src/lib/resend-utils.ts`
- `src/lib/email/email-data-schema.ts`
- `src/lib/turnstile.ts`
- `src/emails/*.tsx` (5 files)

**Specifically check**: Does `targetPrice` (Round 2B DM-COMP-01) really not arrive at Airtable? Does UTM/attribution (Round 2B DM-CROSS-01) really not arrive at email/CRM? Trace and confirm or reverse those findings now that you can read the receivers.

### Priority B: Trust-building & content surfaces

- `src/app/[locale]/about/page.tsx`
- `src/app/[locale]/blog/page.tsx`
- `src/app/[locale]/blog/[slug]/page.tsx`
- `src/app/[locale]/oem-custom-manufacturing/page.tsx`
- `src/app/[locale]/capabilities/bending-machines/page.tsx`
- `src/app/[locale]/privacy/page.tsx`, `src/app/[locale]/terms/page.tsx`
- `src/app/[locale]/[...rest]/page.tsx`, `src/app/[locale]/not-found.tsx`
- `src/components/blog/post-card.tsx`, `post-grid.tsx`, `post-card-skeleton.tsx`
- `src/components/content/about-page-shell.tsx` (only Round 2B sampled)
- `src/components/content/legal-page-shell.tsx`
- `src/components/trust/*` (all 7 files — trust signals to buyers)
- `src/components/sections/*` (homepage section composition)
- `src/components/blocks/*` except `tech/` (Round 2B already flagged tech-tabs)
- `src/lib/content/blog.ts`
- `src/lib/content/mdx-faq.ts`
- `src/lib/content/page-dates.ts`
- `src/lib/content/legal-page.ts`
- `src/lib/content/render-legal-content.tsx`
- `src/lib/content-manifest.ts`
- `src/lib/content-parser.ts` (Round 2B sampled — read full)
- `src/lib/content-validation.ts`
- `src/lib/mdx-loader.ts`
- `src/lib/content-query/*` (4 files)

**Specifically check**: Are blog posts real or placeholder? Do trust badges (certifications, partner logos, testimonials) reference real assets/companies/quotes or are they templates? Does About page use real data sources or fabricated counts?

### Priority C: Navigation, header, footer (brand surfaces)

- `src/components/layout/header.tsx`, `header-client.tsx`, `header-scroll-chrome.tsx`
- `src/components/layout/vercel-navigation.tsx`, `vercel-dropdown-content.tsx`, `vercel-navigation-i18n.client.tsx`
- `src/components/layout/mobile-navigation.tsx`
- `src/components/layout/nav-switcher.tsx`
- `src/components/layout/viewport-client-gate.tsx`
- `src/components/footer/*`
- `src/components/language-toggle.tsx`
- `src/config/footer-links.ts`, `src/config/footer-style-tokens.ts`

**Specifically check**: Does navigation match what's claimed in `single-site.ts` config? Are there nav items pointing to nonexistent routes? Is there hardcoded text that should be translated?

### Priority D: Cache, observability, services (operational integrity)

- `src/lib/cache/*` (5 files)
- `src/lib/observability/api-signals.ts`
- `src/lib/observability/system-observability.ts`
- `src/lib/cookie-consent/*` (4 files)
- `src/lib/forms/form-submission-status.ts`
- `src/lib/forms/validation-helpers.ts`
- `src/lib/image/*` (2 files)
- `src/lib/i18n/server/getTranslationsCached.ts`
- `src/lib/i18n/product-keys.ts`
- `src/lib/utm.ts`
- `src/lib/navigation.ts`
- `src/lib/spec-table-translator.ts`
- `src/lib/sitemap-utils.ts` (Round 2B touched but skim — verify)
- `src/lib/api/cors-utils.ts`
- `src/lib/api/safe-parse-json.ts`
- `src/lib/api/read-and-hash-body.ts`
- `src/lib/api/request-observability.ts`
- `src/lib/api/translate-error-code.ts`
- `src/lib/api/cache-health-response.ts`
- `src/lib/api/validation-error-response.ts`

**Specifically check**: Cache invalidation actually invalidates the right scopes? Cookie consent state actually gates analytics? Image blur placeholders are real? UTM module is the canonical source of truth?

### Lower priority (skim if time permits)

- `src/components/security/turnstile.tsx`
- `src/components/cookie/lazy-*.tsx`
- `src/components/forms/lazy-turnstile.tsx`
- `src/components/forms/contact-form-fields.tsx` (Round 2B touched)
- `src/components/dev-tools/*` (dev only, low business impact)

### Skip entirely

- `src/components/ui/*` (shadcn primitives, no business logic)
- `__tests__/` (audit policy)
- Generated files (`*.generated.ts`)

## Finding Contract (unchanged)

```
- **{ID} [Severity] [Evidence level] [tags] — {one-line summary}**
  - Business impact: {Chinese, one sentence}
  - Location: {file:line, multiple if needed}
  - Judgment: {one-sentence assessment}
  - Repair direction: {one sentence}
  - Why scripts couldn't catch this: {one sentence}
```

Severity: Critical / High / Medium / Low / Info
Evidence: Confirmed by execution / Confirmed by static evidence / Likely but not fully verified / Hypothesis
Tags: `[AI-Smell]` where applicable

## Report Structure

```markdown
# Round 3 Deep Module Audit — Codex Pass

## Audit Posture
- Audit target commit
- Files read this round (count and list)
- Lines reviewed (estimate)
- Confirmation that prior rounds' findings are not duplicated

## Module-by-Module Findings

### Lead conversion edges (Priority A)
{findings}

### Trust-building & content (Priority B)
{findings}

### Navigation & header/footer (Priority C)
{findings}

### Cache, observability, services (Priority D)
{findings}

### Cross-module patterns
{findings}

## Findings Summary

### By severity
{table}

### Confirmation/contradiction of Round 2B findings
For DM-COMP-01 (target price), DM-CROSS-01 (attribution), DM-LIB-08 (fake /search), DM-INFRA-07 (about stats label mismatch) — now that you've read the receivers, confirm or revise.

### New territory uncovered

## Coverage Statement
List files read in full / sampled / skipped. Be honest.

## Cumulative Coverage After 3 Rounds
Roughly which files in `src/` have been read substantively across all rounds combined.
```

## Quality Bar

- At least **35 substantive findings** (most in newly-read territory).
- Each finding states why scripts couldn't catch it.
- Coverage statement honestly documents what was read this round and cumulative coverage.
- For Round 2B's targetPrice / attribution / fake-search / label-mismatch findings — explicit confirm-or-revise based on now-readable receivers.

## Why This Round Exists

Round 2A + 2B together produced 83 findings but only covered ~50% of non-trivial source. The owner needs an authoritative final report. Round 3 closes the coverage gap on remaining business-critical territory (lead receivers, trust pages, navigation, services). After Round 3, a synthesis pass will merge all four reports into a single authoritative baseline.

**Don't try to match Claude's structural findings — produce findings based on what you actually read with the business-fact-integrity lens that worked so well in Round 2B.**

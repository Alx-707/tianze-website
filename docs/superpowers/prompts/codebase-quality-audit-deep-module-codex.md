# Deep Module Audit — Codex Execution Prompt

This is a **second-pass deep audit** that complements the existing report at `docs/reports/2026-04-24-codebase-quality-audit.md`.

The first-pass audit was script-heavy: it ran 30+ verification commands and produced 11 findings. **It did not perform module-by-module code reading.** Of 767 source files, only ~10 were cited with line numbers. This second pass fixes that gap.

## Your Mission

Read the codebase module by module. Produce findings that **only emerge from reading code**, not from running scripts. Output a separate report so results can be compared with a parallel Claude audit.

## Output Location

- **Your report**: `docs/reports/2026-04-25-deep-module-audit-codex.md`
- **Your evidence (if any)**: `docs/reports/2026-04-25-deep-module-audit-codex-artifacts/`

**Do not modify** the existing first-pass report or its artifacts. Do not duplicate findings already in `docs/reports/2026-04-24-codebase-quality-audit.md` — reference them by ID (`SEC-01`, `PROOF-01`, etc.) when relevant, but new findings must be substantively different.

## What "Deep Module Audit" Means

For each module area, you must:
1. **Read every non-trivial file** (>50 lines, excluding tests in this pass).
2. **Trace data flow** through layers — where does it come from, how does it transform, where does it go.
3. **Apply the Linus lens** at function and file level:
   - Is this a long-term solution or a patch on a patch?
   - Is the data structure right, or is the code compensating for bad data?
   - Are there special cases that should disappear through better design?
   - Could a competent newcomer understand this in 30 seconds?
   - Does this exist because it's needed, or because someone thought it might be needed?
4. **Compare implementations** for similar problems across files (AI-smell: locally clean but globally inconsistent).
5. **Find dead-but-looks-alive code** — exported but unused in production paths, conditionally enabled but condition never true, fallbacks for impossible cases.

Findings that **don't count** as deep audit (already covered by first-pass):
- Things only visible in script output (lint, type-check, dependency violations, knip dead code, mutation gaps).
- Findings already in `2026-04-24-codebase-quality-audit.md`.

Findings that **do count**:
- Function/file-level smell observations.
- Cross-file inconsistencies in how similar problems are solved.
- Hidden coupling that dependency-cruiser doesn't catch (e.g., shared mutable globals, indirect coupling through context, magic string conventions).
- Premature abstractions that add layers without value.
- Naming that misleads about intent or scope.
- Comments or docs that contradict the code.
- Data structures that force downstream special-casing.
- Server Component / Client Component boundary mistakes that hydrate more than necessary.
- Error paths that swallow information silently.
- Logic duplicated across files where one canonical version should exist.

## Module Reading Order (Suggested)

Start with the highest-density business logic, then expand outward:

1. **`src/lib/`** (66 files) — core business logic, including:
   - `src/lib/actions/contact.ts`, `src/lib/contact/*`
   - `src/lib/security/*`
   - `src/lib/idempotency.ts`
   - `src/lib/env.ts` (already known oversized — go deeper than that)
   - `src/lib/seo-metadata.ts` and SEO helpers
   - `src/lib/content/*`
   - `src/lib/i18n/*`
   - `src/lib/load-messages.ts`
   - `src/lib/logger.ts` and logging helpers
   - `src/lib/structured-data-generators.ts`

2. **`src/components/`** (28 directories) — focus on:
   - `src/components/forms/*` (lead capture surface)
   - `src/components/contact/*`
   - `src/components/products/*`
   - `src/components/sections/*` (homepage / page-level composition)
   - `src/components/blocks/*`
   - `src/components/mdx/*`
   - `src/components/error-boundary.tsx` and error handling components
   - `src/components/seo/*`

3. **`src/app/`**:
   - `src/middleware.ts` (security headers, locale routing)
   - `src/app/actions.ts` and `src/app/[locale]/layout.tsx`
   - `src/app/[locale]/*/page.tsx` (per-route data loading patterns)
   - `src/app/api/*/route.ts` (API surface design)
   - `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/global-error.tsx`

4. **`src/hooks/`, `src/services/`, `src/templates/`** — small but worth reviewing.

5. **`src/config/`** — beyond `single-site.ts` and `security.ts`, audit:
   - `src/config/single-site-product-catalog.ts`
   - `src/config/paths/*`
   - `src/config/single-site-page-expression.ts`
   - `src/config/contact-form-config.ts`

## Finding Contract

Use the same contract as the first-pass report:

```
- **{ID} [Severity] [Evidence level] [tags] — {one-line summary}**
  - Business impact: {Chinese, one sentence}
  - Location: {file:line, multiple if needed}
  - Judgment: {Linus-lens assessment}
  - Repair direction: {one sentence}
  - Why scripts couldn't catch this: {one sentence — important for proving this is genuine deep-audit value}
```

Severity scale: Critical / High / Medium / Low / Info
Evidence level: Confirmed by execution / Confirmed by static evidence / Likely but not fully verified / Hypothesis
Tags: `[AI-Smell]` where applicable

ID prefixes for this audit (so they don't collide with first-pass IDs):
- `DM-LIB-NN` for `src/lib/` findings
- `DM-COMP-NN` for `src/components/` findings
- `DM-APP-NN` for `src/app/` findings
- `DM-INFRA-NN` for hooks/services/config findings
- `DM-CROSS-NN` for cross-module patterns

## Report Structure

```
# Deep Module Audit — Codex Pass

## Audit Posture
Audit target: origin/main @ 0daacf6...
Files read: {count} of 767
Lines reviewed: ~{estimate}
Comparison reference: docs/reports/2026-04-24-codebase-quality-audit.md (first-pass)

## Module-by-Module Findings

### src/lib/
{findings}

### src/components/
{findings}

### src/app/
{findings}

### src/hooks, src/services, src/config (deeper than first-pass)
{findings}

### Cross-module patterns
{findings — patterns spanning multiple modules}

## Findings Summary

### By severity
| ID | Severity | Module | Summary |
| ... |

### Root-cause clusters
{2-5 clusters that explain underlying problems driving multiple findings}

### Comparison with first-pass
- First-pass findings this audit confirms / extends: {list}
- First-pass findings this audit revises: {list}
- New territory: {list}

## Coverage Statement

List which directories/files were read in full vs sampled vs skipped. Be honest. If you could not read everything, say so.
```

## Hard Constraints

- **Read-only.** No code modifications. No file creation outside the report and its artifacts.
- **No deployment commands.**
- **No re-running first-pass scripts** — they're already captured. If you want fresh data, note it but don't re-run.
- **Be honest about coverage.** If you read 200 of 700 files, say "200 of 700, prioritized by business criticality."

## Quality Bar

The report is done when:
- At least 30 substantive findings are recorded (most likely 30-60 given codebase size).
- Each finding has a "why scripts couldn't catch this" justification.
- Coverage statement honestly documents what was read.
- Root-cause clusters explain underlying patterns, not just group findings.
- Comparison section explicitly identifies overlap and divergence with first-pass.

If you can produce only 15 findings, the audit isn't deep enough — read more files.

## Why This Pass Exists

The owner specifically asked: did the first audit perform deep module review? The honest answer was no — it ran scripts and read docs. This pass is the second half. A parallel Claude audit is happening independently in the same session, so two reports will be compared. Don't try to match Claude's findings — produce your own based on what you actually read.

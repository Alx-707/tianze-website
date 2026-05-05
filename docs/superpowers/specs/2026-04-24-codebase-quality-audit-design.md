# Codebase Quality Audit Design

## Purpose

Produce an authoritative repo-wide quality report for `tianze-website`.

This is not a CI summary. Passing `type-check`, lint, tests, and builds is only the evidence base. The report must answer the harder question: whether the codebase has healthy architecture, clear boundaries, trustworthy proof, low hidden coupling, and a maintainable shape for future changes.

## Baseline

- Audit baseline: clean `origin/main`.
- Local untracked files are excluded from the formal quality verdict.
- Historical prompt drafts are not part of the formal quality verdict.
- Audit posture: read-only for product code. The audit may create report artifacts only.
- Mutation testing is not auto-run by the agent. If needed, provide standalone terminal commands for the owner to run manually.

## Report Output

Primary deliverable:

`docs/reports/2026-04-24-codebase-quality-audit.md`

The report has two layers:

1. Owner-facing decision layer: clear Chinese summary, score, business impact, and repair priority.
2. Engineering evidence layer: file:line evidence, proof status, architecture findings, risk register, and verification appendix.

## Audit Philosophy

The report must not equate "green checks" with quality.

Quality is judged across four proof columns:

| Column | Meaning |
|---|---|
| Code quality | Does the code express the right model simply and consistently? |
| Proof quality | Do tests and scripts prove real behavior, or only implementation shape? |
| Truth-source quality | Are product, SEO, content, route, locale, and deployment facts owned by clear canonical sources? |
| Repairability | Can the repo be improved by deleting, merging, and simplifying, or does each fix require more patches? |

Each conclusion must state its evidence level:

- Confirmed by execution
- Confirmed by code/static evidence
- Likely but not fully verified
- Hypothesis / needs follow-up

## Core Audit Lanes

### Lane 1: Fresh Evidence Foundation

Run lightweight-to-medium verification to establish a trustworthy baseline:

- `pnpm type-check`
- `pnpm lint:check`
- `pnpm test -- --coverage`
- `pnpm truth:check`
- `pnpm dep:check`
- `pnpm unused:check`
- `pnpm security:semgrep`
- `pnpm quality:gate`
- `pnpm build`
- `pnpm build:cf`

Rules:

- `pnpm build` and `pnpm build:cf` must not run in parallel.
- Build failures weaken downstream claims but do not stop the architecture review.
- Passing commands never justify a "quality is good" verdict by themselves.

### Lane 2: Runtime Mental Model

Build a real model of how the repo runs now:

- page generation and App Router route ownership
- content and catalog loading
- i18n routing, message loading, fallback behavior
- SEO metadata, canonical URLs, hreflang, sitemap, robots, JSON-LD
- public form/API handling
- Cloudflare/OpenNext build and smoke proof boundary
- environment/config ownership

The report should explain this in owner-readable language first, then provide technical details.

### Lane 3: Critical Flow 3-Truth Review

Each critical flow is reviewed through three truths:

| Truth | Question |
|---|---|
| Runtime truth | What does the code actually do? |
| Proof truth | What behavior is actually tested or checked? |
| Design truth | Is the current design the simplest durable design for the business need? |

Mandatory flows:

1. Inquiry/contact submission
   - Turnstile verification
   - rate limiting
   - input validation
   - Airtable/email handling
   - idempotency and double-submit behavior
   - PII-safe logs
   - failure-mode UX

2. i18n and locale resolution
   - URL path
   - middleware/proxy behavior
   - next-intl request config
   - message loading
   - missing key/fallback behavior
   - SSR/client consistency

3. Product and content rendering
   - config truth
   - content manifest
   - product/category routing
   - empty states
   - locale-specific copy

4. SEO and metadata completeness
   - metadata generation per route
   - canonical/hreflang correctness
   - sitemap and robots coverage
   - page-level structured data
   - OG/Twitter image behavior

5. Cloudflare proof boundary
   - what local `build` proves
   - what `build:cf` proves
   - what preview smoke proves
   - what deployed smoke would still need to prove

### Lane 4: Architecture, Boundary, and Coupling Review

Review the repo as a system, not as isolated files.

Focus areas:

- top-level module responsibilities
- shared/lib layers hiding product-specific business truth
- route/config/message/documentation drift
- wrapper, compat, and duplicate paths
- data-flow coupling between forms, APIs, env, and external services
- caching strategy consistency
- server/client boundary health
- dependency direction and circular risk
- hard-to-change modules and files near complexity limits
- patch accumulation where a simpler model should replace repeated fixes

### Lane 5: AI-Smell and Proof-Theater Review

Look for AI-assisted code failure modes:

- locally clean but globally inconsistent patterns
- tests that assert implementation shape rather than user-visible behavior
- dead code that looks maintained
- over-specific helpers with weak callers
- duplicated truth under different names
- owner-level business decisions hidden in code
- confident documentation that no longer matches runtime behavior
- compatibility layers without live consumers

## Mutation Testing Policy

Mutation testing is useful for proving whether tests catch behavioral changes, but it is not the backbone of this report.

Policy:

- Do not run full mutation automatically.
- Check recent mutation artifacts first if available.
- Use mutation only as supporting evidence for test-value claims.
- If a fresh mutation run is necessary, provide manual commands for a separate terminal.
- The report must state whether mutation evidence is fresh, stale, partial, or not used.

Example manual command shape, only if later justified:

```bash
pnpm exec stryker run --timeoutMS 30000
```

Targeted variants may be proposed for high-risk domains instead of full-repo mutation.

## Report Structure

The final report should include:

1. Executive summary
   - overall grade
   - whether the codebase is fit for continued release work
   - top strengths
   - top risks
   - next repair order

2. Four-column verdict
   - Code quality
   - Proof quality
   - Truth-source quality
   - Repairability

3. Runtime mental model
   - owner-readable overview
   - technical map with key files

4. Critical flow 3-truth review
   - runtime truth
   - proof truth
   - design truth
   - divergences

5. Architecture, boundary, and coupling findings

6. AI-smell and long-term maintainability findings

7. Dimension scorecards
   - consistency
   - reliability
   - maintainability
   - testability
   - performance
   - security
   - architecture boundary health
   - truth-source clarity
   - release-proof credibility
   - change cost

8. Risk register
   - Critical / High / Medium / Low / Info
   - impact
   - evidence
   - recommended action
   - repair order

9. Delete-first repair plan
   - delete candidates
   - merge candidates
   - truth-source consolidation
   - removable wrapper / compat / duplicate paths

10. Verification appendix
    - commands run
    - command results
    - coverage data
    - mutation status
    - not-covered areas
    - evidence freshness notes

## Finding Contract

Each material finding must include:

- finding ID
- severity
- confidence / evidence level
- business impact in Chinese
- affected file and line
- exact evidence excerpt or reproducible read-only command
- why it matters
- minimal correct design or repair direction
- whether it belongs in the delete-first plan

Findings must be grouped both ways:

- flat list by severity
- root-cause clusters

Root-cause clusters should explain the underlying problem, not just the surface area.

## Acceptance Criteria

The audit is complete only when:

- The report is based on fresh evidence from the current clean `origin/main` baseline.
- The report distinguishes execution evidence, static/code evidence, likely findings, and hypotheses.
- The report explains architecture and runtime mental model before giving scores.
- Critical flows are reviewed through runtime truth, proof truth, and design truth.
- The report includes boundary, coupling, truth-source, and AI-smell findings, not only script output.
- Mutation is not auto-run; if needed, manual terminal commands are provided.
- Every High or Critical finding has file:line evidence and a concrete business impact.
- The owner summary is understandable without knowing Next.js, Cloudflare, RSC, or CI jargon.
- The engineering appendix is detailed enough for a follow-up repair plan.

## Out of Scope

- Fixing issues found by the audit.
- Refactoring code during the audit.
- Treating stale historical reports as current evidence.
- Running deployment or production-impacting commands.
- Permanently deleting any file.

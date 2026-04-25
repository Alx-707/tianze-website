# Codebase Quality Audit — Unified Design

## Purpose

Produce an authoritative repo-wide quality report for `tianze-website`.

This is not a CI summary. Passing `type-check`, lint, tests, and builds is only evidence. The report answers the harder question: whether the codebase has healthy architecture, clear boundaries, sound data structures, low hidden coupling, and a maintainable shape for long-term evolution.

Two goals:
1. **Health check** — identify what needs attention and in what priority order.
2. **Baseline** — establish measurable and judgmental baselines so future iterations can track trends.

## Audit Posture

- Baseline: clean `origin/main`.
- Read-only for product code. The audit creates report artifacts only.
- No code fixes, refactoring, or deployment-impacting commands during the audit.
- No permanent file deletion.

## Audit Philosophy

### Linus Lens

The deep audit is conducted through the Linus Torvalds code review framework:

- **Patches are sin** — Is this a long-term solution or a patch on top of a patch?
- **Data structures first** — Is the problem in the code, or in the data model underneath?
- **Eliminate special cases** — Are edge cases handled, or do they disappear through better design?
- **Simplicity is the only beauty** — Could a competent newcomer understand this in 30 seconds?
- **Working is not the standard** — "It runs" proves the compiler didn't complain. Nothing more.

### Four Proof Columns

Quality is judged across four orthogonal columns:

| Column | Question |
|---|---|
| Code quality | Does the code express the right model simply and consistently? |
| Proof quality | Do tests prove real behavior, or only implementation shape? |
| Truth-source quality | Are product, SEO, content, route, locale, and deployment facts owned by clear canonical sources? |
| Repairability | Can the repo be improved by deleting and simplifying, or does each fix require more patches? |

### Evidence Confidence

Every finding states its evidence level:

| Level | Meaning |
|---|---|
| **Confirmed by execution** | Verified by running a command or test |
| **Confirmed by static evidence** | Verified by reading code/config |
| **Likely but not fully verified** | Strong indicators, not conclusively proven |
| **Hypothesis** | Plausible concern, needs follow-up investigation |

## Report Structure

### Chapter 1: Executive Summary

Owner-facing, in Chinese, no technical jargon.

Contents:
- Overall ABCD health grade
- Four-column verdict (one grade per column)
- Top 3-5 critical findings, each in one sentence: what + why it matters
- Repair priority roadmap (delete-first orientation)
  - Ordered by: high impact + low cost first → high impact + high cost → low impact
  - Each item: problem name, why this priority, repair direction (not implementation steps)

### Chapter 2: Runtime Mental Model

Before judging architecture, establish how the system actually works.

Two layers:
1. **Owner-readable overview** — what the site does, how pages are generated, how content flows, how inquiries are handled, in business language.
2. **Technical map** — key file ownership for: App Router routes, content loading, i18n routing and message resolution, SEO metadata pipeline, form/API handling, Cloudflare/OpenNext build chain, environment/config ownership.

### Chapter 3: Deep Dimension Audit

Seven dimensions, each evaluated independently. Each dimension follows a uniform structure:

```
### Dimension N: [Name]
**Grade: [A/B/C/D]**

[Current state assessment — 2-3 sentences]

#### Findings
- [Finding ID] [Severity] [Evidence level] — [Description]
  - Business impact: [Chinese, one sentence]
  - Location: [file:line]
  - Judgment: [Linus-lens assessment — is this a long-term solution, a patch, over-engineering, etc.]
  - Repair direction: [One sentence]

#### AI-Smell Observations
[Any AI-assisted code failure patterns observed in this dimension, if applicable]
```

The seven dimensions:

**1. Architectural Integrity & Rule Execution**
Does the code faithfully implement the architecture defined in CLAUDE.md and rules? Four-layer content rule, Server Components first, i18n partitioning, structured data ownership, route conventions.

**2. Module Design Quality** (boundaries + cohesion + dependency direction)
Are modules focused on one responsibility? Do dependencies flow strictly downward? Are there circular references, backdoor couplings, or business logic hiding in utility layers?

Data sources: dependency-cruiser violations + code reading.

**3. Data Structures & Data Flow**
Are core data models (product catalog, content types, i18n messages, SEO metadata) well-typed and cleanly shaped? Does data transform predictably through layers, or does it mutate/fork in ways that force downstream special-case handling?

**4. Error Handling & Resilience Architecture**
For a production inquiry-conversion site: what does the user see when things fail? Error boundary placement strategy, API failure recovery, form submission failure UX, graceful degradation patterns. Are critical paths (inquiry submission, product browsing) resilient?

**5. Patches vs Long-term Solutions**
Flag-controlled branches, backward-compat shims, TODO/HACK/FIXME markers, workarounds that route around problems instead of solving them. For each: is this a justified temporary measure or accumulated debt?

**6. Over-engineering & Abstraction Appropriateness**
Unnecessary indirection layers, premature abstractions, config layers that add complexity without value, type gymnastics that obscure rather than clarify. YAGNI violations.

**7. Dead Code & Abandoned Assets**
Unused exports, orphan files, production code only referenced by tests, stale compatibility layers, imports that resolve but serve no purpose.

Data sources: knip results + code reading for "looks alive but is dead" cases.

### Chapter 4: Critical Business Flow Review

Five critical flows, each examined through three truths:

| Truth | Question |
|---|---|
| Runtime truth | What does the code actually do? |
| Proof truth | What behavior is actually tested? |
| Design truth | Is this the simplest durable design for the business need? |

**Flow 1: Inquiry/Contact Submission**
Turnstile verification → rate limiting → input validation → Airtable/email handling → idempotency → failure-mode UX → PII-safe logging.

**Flow 2: i18n & Locale Resolution**
URL path → middleware/proxy → next-intl request config → message loading → missing key fallback → SSR/client consistency.

**Flow 3: Product & Content Rendering**
Config truth → content manifest → product/category routing → empty states → locale-specific copy.

**Flow 4: SEO & Metadata Completeness**
Metadata generation per route → canonical/hreflang → sitemap/robots coverage → page-level structured data → OG image behavior.

**Flow 5: Build & Deployment Chain**
What local `build` proves → what `build:cf` proves → what preview smoke proves → what deployed smoke would still need to prove.

### Chapter 5: Findings Summary & Root-Cause Clusters

All findings consolidated and presented two ways:

1. **Flat list by severity** — Critical / High / Medium / Low / Info
2. **Root-cause clusters** — grouped by underlying architectural cause, not surface symptom

Each finding follows a uniform contract:
- Finding ID (e.g., `ARCH-01`, `MOD-03`, `FLOW-02a`)
- Severity: Critical / High / Medium / Low / Info
- Evidence level
- Business impact (Chinese, one sentence)
- Affected file(s) and line(s)
- Why it matters (one sentence)
- Repair direction (one sentence)
- Delete-first candidate: yes/no

Findings discovered in both Chapter 3 (dimension audit) and Chapter 4 (flow review) are deduplicated here. Each finding appears once with cross-references to where it was observed.

Root-cause clusters explain the underlying problem driving multiple surface findings.

### Chapter 6: Verification Appendix

Script outputs only, no analysis (analysis lives in chapters 3-4):

- `pnpm type-check` result
- `pnpm lint:check` result
- `pnpm test --coverage` result
- `dependency-cruiser` violation summary
- `knip` unused export summary
- Build status (`pnpm build`, `pnpm build:cf`)
- File count, line count, complexity distribution
- Commands run and timestamps

## Grading System

### Per-Dimension Grades

| Grade | Meaning |
|---|---|
| **A — Solid** | Long-term solution, no action needed now |
| **B — Good** | Minor issues that don't block evolution, low-priority improvement |
| **C — Needs Attention** | Clear problems that will compound if untreated |
| **D — Must Fix** | Actively blocking development or harboring serious risk |

### Per-Finding Severity

| Severity | Meaning |
|---|---|
| **Critical** | Active or imminent breakage, data loss risk, security exposure |
| **High** | Significant architectural debt or reliability risk |
| **Medium** | Accumulating technical debt, maintenance friction |
| **Low** | Improvement opportunity, minor inconsistency |
| **Info** | Observation, no action required |

### Overall Health Grade

Composite of four-column verdicts and seven dimension grades. Single ABCD letter representing "is this codebase in shape for continued confident development?"

## Execution Approach

### Phase 1: Evidence Collection (automated)

Run all verification scripts in parallel where safe. Collect raw outputs for appendix and as leads for deep audit.

### Phase 2: Runtime Mental Model (AI reads code)

Read route structure, layout chain, middleware, content loading, config layers, build config. Build the "how it actually works" map.

### Phase 3: Deep Audit (AI reads code, parallel sub-agents)

Dispatch parallel sub-agents by module area:
- Agent A: `src/config` + `src/types` + `src/constants`
- Agent B: `src/lib` + `src/services`
- Agent C: `src/components` (all subdirectories)
- Agent D: `src/app` (routes, layouts, API routes)
- Agent E: `content/` + `messages/` + `src/i18n`

Each agent evaluates its area against all 7 dimensions and the Linus lens. Findings are consolidated afterward.

### Phase 4: Critical Flow Review (AI reads code)

Trace each of the 5 business flows end-to-end through runtime/proof/design truth.

### Phase 5: Synthesis & Report Writing

Merge all findings, identify root-cause clusters, assign grades, write the complete report to:

`docs/reports/2026-04-24-codebase-quality-audit.md`

## Acceptance Criteria

The audit is complete only when:

- The report is based on fresh evidence from the current clean `origin/main`.
- Every finding states its evidence confidence level.
- The runtime mental model is written before architecture judgments.
- Critical flows are reviewed through runtime truth, proof truth, and design truth.
- Deep dimensions cover architecture, boundaries, data structures, error handling, patches, over-engineering, and dead code — not only script output.
- AI-smell observations are included within relevant dimensions.
- Every High or Critical finding has file:line evidence and a concrete business impact in Chinese.
- The executive summary is understandable without knowing Next.js, Cloudflare, RSC, or CI jargon.
- The verification appendix contains raw script outputs for reproducibility.
- The repair roadmap prioritizes deletion and simplification over addition.

## Out of Scope

- Fixing issues found by the audit.
- Refactoring code during the audit.
- Running deployment or production-impacting commands.
- Permanently deleting any file.
- Mutation testing (not auto-run; manual commands provided only if specifically justified).
- Treating the Codex spec (`2026-04-24-codebase-quality-audit-design.md`) as binding — it served as input to this unified design and is superseded by this document.

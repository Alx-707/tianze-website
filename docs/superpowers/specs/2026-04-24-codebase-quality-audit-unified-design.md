# Codebase Quality Audit — Unified Design

## Purpose

Produce an authoritative repo-wide quality report for `tianze-website`.

This is not a CI summary. Passing `type-check`, lint, tests, and builds is only evidence. The report answers the harder question: whether the codebase has healthy architecture, clear boundaries, sound data structures, low hidden coupling, and a maintainable shape for long-term evolution.

Two goals:
1. **Health check** — identify what needs attention and in what priority order.
2. **Baseline** — establish measurable and judgmental baselines so future iterations can track trends.

## Audit Posture

- Read-only for product code. The audit creates report artifacts only.
- No code fixes, refactoring, or deployment-impacting commands during the audit.
- No permanent file deletion.

### Baseline Definition

The audit target is the exact commit at `origin/main` after a fresh fetch. Before any evidence collection, record:

```bash
git fetch origin
git rev-parse origin/main          # → audit target SHA
git rev-parse HEAD                 # → local HEAD
git status --short --branch        # → local state
```

The report header must declare:
- **Audit target commit**: `<SHA>`
- **Local state**: clean / ahead N / dirty (list untracked/modified files)
- **Excluded from audit**: any untracked files not on `origin/main`

If local `main` is ahead of `origin/main`, the audit covers only what exists at the `origin/main` SHA. Findings must reference code as it exists at that commit.

**Evidence collection must run against the audit target commit.** Before running any Tier 1-4 commands:
```bash
git stash --include-untracked   # if working tree is dirty
git checkout --detach origin/main
```
After evidence collection, restore with `git checkout main && git stash pop` (if stashed). This ensures all script outputs reflect `origin/main`, not local-only changes.

The report header must also record tool versions: `node -v`, `pnpm -v`.

### Allowed vs Forbidden Commands

| Allowed | Forbidden |
|---|---|
| `pnpm build` (local) | `wrangler deploy` / any production deploy |
| `pnpm build:cf` (local CF build) | `wrangler pages publish` |
| `pnpm smoke:cf:preview` (local preview) | Any command that mutates production state |
| All `pnpm test` / `pnpm review:*` / `pnpm quality:*` variants | `pnpm unused:fix` or any auto-fix command |

`pnpm build` and `pnpm build:cf` must not run in parallel (repo constraint).

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

Nine dimensions, each evaluated independently. Each dimension follows a uniform structure:

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

```

AI-smell patterns (locally clean but globally inconsistent, tests asserting shape not behavior, dead code that looks maintained, confident docs that don't match runtime, compatibility layers without consumers) are tagged at the finding level with `[AI-Smell]` rather than collected in per-dimension subsections. A consolidated AI-smell summary appears in Chapter 5 alongside root-cause clusters.

The nine dimensions:

**1. Architectural Integrity & Rule Execution**
Does the code faithfully implement the architecture defined in CLAUDE.md and rules? Four-layer content rule, Server Components first, i18n partitioning, structured data ownership, route conventions.

Data sources: `pnpm truth:check`, `pnpm review:docs-truth`, `pnpm review:architecture-truth`, `pnpm arch:conformance` + code reading.

**2. Module Design Quality** (boundaries + cohesion + dependency direction)
Are modules focused on one responsibility? Do dependencies flow strictly downward? Are there circular references, backdoor couplings, or business logic hiding in utility layers?

Data sources: `pnpm dep:check`, `pnpm arch:metrics`, `pnpm arch:hotspots`, dependency-cruiser violations + code reading.

**3. Data Structures & Data Flow**
Are core data models (product catalog, content types, i18n messages, SEO metadata) well-typed and cleanly shaped? Does data transform predictably through layers, or does it mutate/fork in ways that force downstream special-case handling?

**4. Error Handling & Resilience Architecture**
For a production inquiry-conversion site: what does the user see when things fail? Error boundary placement strategy, API failure recovery, form submission failure UX, graceful degradation patterns. Are critical paths (inquiry submission, product browsing) resilient?

**5. Patches vs Long-term Solutions**
Flag-controlled branches, backward-compat shims, TODO/HACK/FIXME markers, workarounds that route around problems instead of solving them. For each: is this a justified temporary measure or accumulated debt?

Data sources: `pnpm review:legacy-markers`, `pnpm review:template-residue`, `pnpm review:contract-smells` + code reading.

**6. Over-engineering & Abstraction Appropriateness**
Unnecessary indirection layers, premature abstractions, config layers that add complexity without value, type gymnastics that obscure rather than clarify. YAGNI violations.

**7. Dead Code & Abandoned Assets**
Unused exports, orphan files, production code only referenced by tests, stale compatibility layers, imports that resolve but serve no purpose.

Data sources: `pnpm unused:check`, `pnpm unused:production`, knip results + code reading for "looks alive but is dead" cases.

**8. Proof Integrity** (test quality as independent dimension)
Do tests prove real user-visible behavior, or only implementation shape? Mock pollution risk (global Zod mocks, overmocked external services). Coverage gaps on critical paths. Test-to-behavior ratio: are tests asserting what matters?

Data sources: `pnpm test:coverage`, `pnpm review:boundary-leaks`, `pnpm review:contract-smells`, mutation test artifacts if available (`pnpm review:mutation:critical`), behavioral contracts (`docs/specs/behavioral-contracts.md`).

**9. Security & Privacy**
Public write endpoint protection (schema validation, rate limiting, safe JSON responses). API error contract compliance. Environment/secrets boundary enforcement. PII-safe logging. CSP policy correctness.

Data sources: `pnpm security:semgrep`, `pnpm lint:pii`, `pnpm security:csp:check`, `pnpm review:env-boundaries`, `pnpm review:server-env-boundaries` + code reading.

### Chapter 4: Critical Business Flow Review

Five critical flows, each examined through three truths:

| Truth | Question |
|---|---|
| Runtime truth | What does the code actually do? |
| Proof truth | What behavior is actually tested? |
| Design truth | Is this the simplest durable design for the business need? |

**Flow 1: Lead Submission (all three surfaces)**
Three sub-paths, each traced end-to-end:
- **1a: Contact Server Action** (`src/lib/actions/contact.ts`) — Turnstile → validation → Airtable/email → idempotency → failure UX → PII-safe logging.
- **1b: `/api/inquiry`** — same concerns as 1a through API route.
- **1c: `/api/subscribe`** — schema validation → rate limiting → storage → abuse resistance.

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
- Evidence level (from Evidence Confidence table)
- Evidence command or excerpt (reproducible read-only command, or code excerpt with commit SHA)
- Business impact (Chinese, one sentence)
- Affected file(s) and line(s)
- Why it matters (one sentence)
- Repair direction (one sentence)
- Delete-first candidate: yes/no
- Discovered by: dimension lane ID / flow review / both

Findings discovered in both Chapter 3 (dimension audit) and Chapter 4 (flow review) are deduplicated here per the fingerprint rules. Each finding appears once with cross-references to where it was observed.

Root-cause clusters follow this structure:
- Cluster ID (e.g., `RC-01`)
- Root cause statement (one sentence)
- Surface findings included (list of finding IDs)
- Evidence confidence
- Why this is one root cause, not just a theme
- Delete-first repair principle (how to fix by removing/simplifying)

A consolidated AI-smell summary is included here, grouping all `[AI-Smell]` tagged findings.

### Chapter 6: Verification Appendix

Summary table in the main report; raw outputs stored in `docs/reports/2026-04-24-audit-artifacts/`.

The summary table lists each command with: status (pass/fail/warn), key metric, and artifact file path.

#### Evidence Collection — Four Tiers

**Tier 1: Core Gate**
- `pnpm type-check`
- `pnpm lint:check`
- `pnpm test:coverage`
- `pnpm quality:gate`

**Tier 2: Repo Truth & Architecture**
- `pnpm truth:check`
- `pnpm review:docs-truth`
- `pnpm review:architecture-truth`
- `pnpm arch:metrics`
- `pnpm arch:hotspots`
- `pnpm arch:conformance`
- `pnpm dep:check`
- `pnpm unused:check`
- `pnpm unused:production`
- `pnpm review:legacy-markers`
- `pnpm review:boundary-leaks`
- `pnpm review:contract-smells`
- `pnpm review:template-residue`
- `pnpm review:env-boundaries`
- `pnpm review:server-env-boundaries`

**Tier 3: Security & Platform**
- `pnpm security:semgrep`
- `pnpm lint:pii`
- `pnpm security:csp:check`
- `pnpm clean:next-artifacts && pnpm build` (sequential)
- `pnpm build:cf` (after build completes, not parallel)

**Tier 4: Contract-Targeted Evidence (run if relevant)**
- `pnpm review:mutation:critical` (if mutation artifacts stale or absent)
- `pnpm review:locale-runtime`
- `pnpm review:translate-compat`
- `pnpm review:lead-family`
- `pnpm review:homepage-sections`

Any command not run must have an explicit skip reason recorded in the appendix.

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

Composite of four-column verdicts and nine dimension grades. Single ABCD letter representing "is this codebase in shape for continued confident development?"

### Grade Cap Rules

Hard constraints that override composite scoring:

| Condition | Cap |
|---|---|
| Any confirmed Critical finding on lead submission, security, or data loss | Overall max **D** |
| Any unverified lead submission surface (Contact SA, `/api/inquiry`, `/api/subscribe`) | Overall max **C** |
| `pnpm build` or `pnpm build:cf` failing | Overall max **C** |
| Truth-source drift with active runtime impact | Truth-source column max **C** |
| High findings with no delete-first repair path | Repairability column max **C** |

### Finding Deduplication Rules

When the same issue is discovered by both a dimension audit agent and a flow review:

1. **Fingerprint**: `affected behavior + root cause + primary evidence surface`. Same fingerprint = same finding.
2. **Severity conflict**: when two agents rate the same finding differently, the higher severity wins. The lower rating is noted as context.
3. **Canonical location**: each finding appears exactly once in Chapter 5. Chapters 3 and 4 reference by finding ID.

## Execution Approach

### Phase 1: Baseline & Evidence Collection (automated)

1. Record baseline (fetch, SHA, local state).
2. Run Tier 1-3 evidence commands. Store raw outputs in `docs/reports/2026-04-24-audit-artifacts/`.
3. Run Tier 4 commands if relevant based on Tier 1-3 results.
4. Build summary table for appendix.

Parallelism rules:
- **Must be sequential**: `pnpm clean:next-artifacts` → `pnpm build` → `pnpm build:cf` (in this order)
- **Safe to parallelize**: all `pnpm review:*`, `pnpm arch:*`, `pnpm security:*`, `pnpm lint:*`, `pnpm unused:*`, `pnpm truth:check`, `pnpm dep:check`
- **Safe to parallelize with each other**: `pnpm type-check`, `pnpm test:coverage`, `pnpm quality:gate`
- **When in doubt**: run sequentially. False sequentiality wastes time; false parallelism produces unreliable evidence.

### Phase 2: Runtime Mental Model (AI reads code)

Read route structure, layout chain, middleware, content loading, config layers, build config. Build the "how it actually works" map.

Reference documents to read before judging:
- `CLAUDE.md` and all `.claude/rules/*.md` (architecture intent and constraints)
- `docs/guides/CANONICAL-TRUTH-REGISTRY.md`
- `docs/guides/QUALITY-PROOF-LEVELS.md`
- `docs/guides/RELEASE-PROOF-RUNBOOK.md`
- `docs/specs/behavioral-contracts.md`

### Phase 3: Deep Audit (AI reads code, parallel sub-agents by lane)

Dispatch parallel sub-agents by audit lane (not by directory):

- **Lane A: Architecture & Truth** — Architectural rule execution, truth-source integrity, config/content ownership, docs-to-code drift. Reads across `src/config`, `src/types`, `content/`, `messages/`, docs.
- **Lane B: Lead Conversion & Security** — Contact/inquiry/subscribe flows, Turnstile, rate limiting, input validation, Airtable/email, PII logging, API error contracts, env/secrets boundaries. Reads across `src/app/api`, `src/components/forms`, `src/components/contact`, `src/lib/actions`, `src/lib/security`, `src/services`.
- **Lane C: Module Design & Code Shape** — Module boundaries, cohesion, dependency direction, data structures, over-engineering, dead code, patches. Reads across `src/lib`, `src/components`, `src/constants`, `src/hooks`.
- **Lane D: Proof Integrity & Error Handling** — Test quality, mock pollution, behavioral contract coverage, error boundary placement, resilience patterns, failure UX. Reads across `src/__tests__`, `src/test`, `src/testing`, `src/app/**/error.tsx`, `src/components/error-boundary.tsx`.
- **Lane E: Platform, i18n & SEO** — Build chain, Cloudflare compatibility, i18n routing/fallback, SEO metadata pipeline, sitemap/robots, structured data, locale consistency. Reads across `src/app/[locale]`, `src/i18n`, `src/middleware.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, build configs.

Each agent evaluates its lane against relevant dimensions and the Linus lens. Cross-cutting observations are flagged for the main reviewer.

### Phase 4: Critical Flow Review (AI reads code)

Trace each of the 5 business flows end-to-end through runtime/proof/design truth. This phase runs after Phase 3 so it can cross-reference dimension findings.

### Phase 5: Synthesis & Report Writing

Main reviewer (not sub-agents) performs:
1. Re-verify all High/Critical findings from sub-agents.
2. Trace cross-module paths that no single lane fully owns.
3. Deduplicate findings using fingerprint rules.
4. Build root-cause clusters.
5. Apply grade cap rules and assign final grades.
6. Write the complete report to `docs/reports/2026-04-24-codebase-quality-audit.md`.
7. Store artifacts in `docs/reports/2026-04-24-audit-artifacts/`.

## Acceptance Criteria

### Baseline
- Audit target commit SHA is recorded in the report header.
- `git status` output is recorded; dirty/ahead state is declared.
- Untracked files excluded from audit are listed.

### Evidence
- Each Tier 1-3 command has: status, key metric, artifact file path.
- Any skipped command has an explicit skip reason.
- Evidence timestamps are recorded.

### Coverage
- Every `src/app/[locale]/*` route is mapped to at least one dimension or flow review.
- Every public write/lead submission surface is covered in security dimension: Contact Server Action (`src/lib/actions/contact.ts`), `/api/inquiry`, `/api/subscribe`.
- Every Critical/High behavioral contract from `docs/specs/behavioral-contracts.md` is checked.

### Sub-agent Integrity
- Every sub-agent output is treated as raw input by the main reviewer.
- Main reviewer independently re-verifies all High/Critical findings.
- Cross-module flow tracing is performed after lane-based review.

### Synthesis
- Deduplication table exists in Chapter 5.
- Root-cause cluster table exists with: cluster ID, root cause statement, surface findings included, evidence confidence.
- Grade cap rules are applied and documented.
- Delete-first roadmap items are each tied to specific finding IDs.

### Readability
- Executive summary is understandable without knowing Next.js, Cloudflare, RSC, or CI jargon.
- Every High or Critical finding has file:line evidence and a concrete business impact in Chinese.

## Out of Scope

- Fixing issues found by the audit.
- Refactoring code during the audit.
- Running deployment or production-impacting commands.
- Permanently deleting any file.
- Mutation testing (not auto-run; manual commands provided only if specifically justified).
- Treating the Codex spec (`2026-04-24-codebase-quality-audit-design.md`) as binding — it served as input to this unified design and is superseded by this document.

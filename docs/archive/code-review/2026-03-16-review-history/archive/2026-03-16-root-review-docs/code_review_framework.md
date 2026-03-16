# Latest Code Review Task Plan

## Positioning
This plan does not replace the existing code review workflow in `docs/code-review/`.
It extends that workflow with two missing strengths:
- explicit business-to-code mapping
- chain-based review as the default deep-review mode

This plan assumes:
- Round 1 to Round 4 have already happened
- `docs/code-review/issues.md` remains the primary findings ledger
- existing labels, acceptance commands, and status tracking stay in place

## Review Goal
Execute the next review cycle for an in-progress project without repeating already-closed work, while improving detection of:
- business/implementation drift
- code quality and elegance problems
- security and integration regressions
- coupling and boundary erosion

## What This Review Is
- A delta review on top of the current stabilized baseline
- A project-aware review tied to current business goals
- A chain-based review of runtime and business-critical paths

## What This Review Is Not
- Not a fresh from-scratch repository audit
- Not a release-readiness certification pass
- Not a style-only critique detached from business impact

## Existing Baseline to Respect

### Already-Completed Work
- Round 1 to Round 3 established earlier review coverage
- Round 4 completed Wave A to Wave D
- `docs/code-review/issues.md` is the active executable issue ledger
- `docs/code-review/round4-execution-summary.md` is the latest major closure summary

### Operational Baseline
- `pnpm type-check` is expected to pass
- `pnpm lint:check` is expected to pass
- `pnpm build` is expected to pass
- `pnpm build:cf` is expected to pass
- `pnpm ci:local:quick` is expected to pass

### Review Rule Baseline
- project-specific checklist: `.claude/rules/review-checklist.md`
- security rules: `.claude/rules/security.md`
- threat-model guidance: `.claude/rules/threat-modeling.md`

## Review Dimensions

### 1. Requirement Fit
- Does the implementation still match the current business stage?
- Does it support inquiry conversion, product presentation, international access, and trust-building?
- Has any code drifted away from the current product/content priorities?

### 2. Correctness and Robustness
- Does the feature work on the intended path?
- Are invalid input, repeat actions, external failures, and timeout behavior explicit and sane?
- Are state transitions and error semantics stable?

### 3. Security
- Are auth, anti-abuse, rate limit, validation, signature checks, secret handling, CSP, and runtime headers still correct?
- Did recent changes weaken existing protection or bypass project rules?
- Is the endpoint or path aligned with `.claude/rules/security.md`?

### 4. Code Quality and Elegance
- Is the code direct, understandable, and maintainable?
- Is it patch-heavy, branch-heavy, or hiding bad state flow?
- Is the abstraction level justified by current needs?

### 5. Coupling and Boundaries
- Are config, i18n, content, UI, API, and third-party integrations still cleanly separated?
- Has logic leaked across boundaries or been duplicated across layers?
- Would a change in one area force unrelated changes elsewhere?

### 6. Integration and Contracts
- Are contracts between modules explicit?
- Are API error contracts, translation contracts, and config/runtime contracts still coherent?
- Are external integrations isolated enough to fail safely?

### 7. Evolvability
- Can the next expected change be added incrementally?
- Are temporary implementations still safely replaceable?
- Is technical debt staying local, or starting to poison surrounding modules?

### 8. Verification and Guardrails
- Do tests still reflect production truth?
- Do quality gates still cover the highest-risk paths?
- Did any exclusion or bypass silently reduce confidence?

## Linus Review Rule
Linus is not a separate execution phase and not a parallel framework.
Linus is the review standard applied inside `Code Quality and Elegance`.

Use it to detect:
- patch layers instead of structural fixes
- unnecessary flags or compatibility glue
- repeated conditions caused by poor data flow
- abstractions that exist without current value

Reject conclusions that are only aesthetic.
Keep conclusions that improve simplicity, clarity, and future change cost.

## Execution Model

### Owner
- Primary executor: agent-assisted review
- Human reviewer: final decision-maker on scope, severity, and scheduling

### Execution Style
- Use tooling first for baseline truth
- Use chain-based review for deep inspection
- Record findings only as deltas from the current known-good baseline

## Review Sequence

### Phase 0: Rebase on Existing Knowledge
Before starting any new review, read:
- `docs/code-review/issues.md`
- `docs/code-review/round4-execution-summary.md`
- `.claude/rules/review-checklist.md`
- `.claude/rules/security.md`

Goal:
- avoid reopening already-closed items
- inherit the current severity and labeling language
- identify the still-relevant risk surface

#### Required Output: Delta Scope
Before any deep review begins, explicitly define the delta scope for this cycle.

Preferred baseline order:
1. explicit git baseline (`commit`, tag, or merge-base)
2. documented review baseline (for example Round 4 closure on `2026-03-09`)
3. explicitly bounded module/path scope when a git baseline is not practical

Record:
- baseline reference
- review scope
- excluded areas
- reason for exclusions

### Phase 1: Business-to-Code Mapping
Make the current review explicit about what business paths matter now.

Required mapping:
- inquiry conversion -> form UI, validation, anti-spam, rate limit, submission pipeline, persistence/notification
- product presentation -> content source, page composition, metadata, schema, routing
- international access -> middleware, locale routing, messages, root layout, redirects
- trust and brand credibility -> fact source, homepage sections, social proof, consistency
- dual deployment compatibility -> `build`, `build:cf`, middleware/runtime-sensitive code

Goal:
- define which runtime chains deserve review now
- avoid broad directory scans with no product context

#### Required Output: Business-to-Code Mapping Table
Phase 1 must produce a simple mapping artifact before Phase 3 starts.

Required fields:
- business goal
- review chain
- mapped modules/files
- current risk level
- include in deep review (`yes` / `no`)
- notes

Minimum expectation:
- one row for each active business path in scope for the current cycle
- enough file/module detail to justify why a chain is ranked high or low

### Phase 2: Baseline Gate Check
Run commands in this order:
1. `pnpm type-check`
2. `pnpm lint:check`
3. `pnpm build`
4. `pnpm build:cf`
5. `pnpm ci:local:quick`

Then run targeted gates only if needed:
- `pnpm validate:translations`
- `pnpm i18n:validate:code`
- `pnpm security:check`
- `pnpm arch:check`
- `pnpm circular:check`
- `pnpm unused:production`
- `pnpm quality:gate:full`

Rules:
- if `type-check` or `build` fails, fix or explain before deeper review
- treat `build:cf` as a first-class gate, not an optional add-on
- use `quality:gate:full` as a high-cost aggregate signal, not as a substitute for understanding failures

### Phase 3: Chain-Based Deep Review
Default deep-review mode is chain-based, not folder-based.

Chain order is not fixed.
The default chain list below is only the starting set.
Final chain priority, review depth, and inclusion must be driven by:
- the Phase 0 delta scope
- the Phase 1 business-to-code mapping output
- any current known instability in the baseline gates

Priority review chains:
1. locale/runtime entry chain
   - `src/middleware.ts` -> routing -> root locale layout -> messages -> metadata
2. inquiry conversion chain
   - contact or inquiry UI -> validation -> anti-abuse -> rate limit -> persistence -> user-facing error handling
3. API contract chain
   - route handler -> shared API response/error utilities -> client consumer -> translation/error presentation
4. content and SEO chain
   - content source -> rendering -> metadata/schema -> locale variant consistency
5. config/integration chain
   - config -> runtime decision -> external adapter -> fallback/error behavior

Goal:
- find real chain-level regressions
- detect contract drift and split-brain truth sources early

### Phase 4: Focused Cross-Cutting Review
After chain review, run targeted cross-cutting passes for:
- security regressions
- code-quality and patch-growth hotspots
- coupling/boundary erosion
- test realism and guardrail blind spots

Goal:
- catch problems that do not show up cleanly in a single chain

### Phase 5: Findings Consolidation
All findings go into `docs/code-review/issues.md` style, not a new ad hoc format.

Required fields per finding:
- ID
- priority
- labels
- review chain
- evidence
- impact
- recommended fix
- acceptance command
- status

For cross-chain findings:
- record one `primary review chain`
- optionally add related chains in the evidence or notes section

## Priority Review Areas for the Next Cycle

### Highest Priority
- `src/middleware.ts`
- `src/app/api/**`
- `src/lib/security/**`
- `src/lib/i18n/**`
- form submission pipeline
- API error contract consumers
- translation message bundles and critical-path loading

### Medium Priority
- content and product rendering modules
- `src/config/contact-form-config.ts`
- `src/config/site-facts.ts`
- architecture/gate scripts such as `scripts/quality-gate.js`

### Lower Priority
- purely presentational components with no business, runtime, or contract impact
- already-closed Round 4 items unless touched again

## Finding Rules

### Priority System
Keep the existing project priority model:
- `P1`
- `P2`
- `P3`

### Labels
Keep the existing project labels:
- `PROD`
- `DEV`
- `CI`
- `TECHDEBT`
- add domain tags only when helpful, such as `SECURITY`, `I18N`, `NEXT`, `SEO`

### Escalation Rule
Do not escalate based on theoretical possibility alone.
Use current code evidence, actual runtime chain impact, and project rules.

## Stop Conditions
Stop and reassess if:
- a finding appears already closed in `issues.md` or Round 4 summary
- a path thought to be production-critical is now only test-retained
- the current build baseline no longer matches the documented baseline

## Expected Output
- an incremental findings set, not a duplicate audit
- chain-linked findings tied to current business goals
- explicit callouts where code quality or elegance is starting to threaten future work
- explicit callouts where security or contracts have regressed
- a short recommendation on what should be fixed now versus deferred

# Six-Dimension Review Plan

## Goal
Plan the next code review cycle around six explicit defect-finding dimensions so review work is organized by failure class rather than by generic quality themes.

## Baseline
- Review baseline: post-Round-4 state documented in `docs/code-review/round4-execution-summary.md`
- Findings ledger: `docs/code-review/issues.md`
- Existing framework input: `code_review_framework.md`
- Review should stay delta-oriented and avoid reopening already-closed items without new evidence

## The Six Review Dimensions

### 1. Data Invariants / State Transitions
- Review goal:
  Confirm business objects keep the same meaning and legal state transitions across UI, server actions, route handlers, shared helpers, and downstream integrations.
- Primary chains:
  - inquiry conversion chain
  - contact submission chain
  - subscribe and verification side-effect paths
- Primary targets:
  - `src/app/api/contact/route.ts`
  - `src/app/api/inquiry/route.ts`
  - `src/app/api/subscribe/route.ts`
  - `src/lib/actions/contact.ts`
  - `src/lib/lead-pipeline/**`
  - `src/lib/forms/**`
- Review tasks:
  - identify business fields that must keep a single meaning (`type`, consent, locale, status, idempotency semantics)
  - trace legal state transitions and look for skipped, duplicated, or contradictory transitions
  - verify route-layer defaults cannot be overridden by request payloads or downstream helper drift
- Expected findings:
  - silent field overrides
  - inconsistent status semantics
  - duplicated or contradictory validation logic

### 2. Concurrency / Retry / Timing
- Review goal:
  Find race conditions, duplicate side effects, retry drift, and time-sensitive logic that only fails under repeated submission, async retries, or multi-instance execution.
- Primary chains:
  - idempotent public write paths
  - rate-limit and anti-abuse paths
  - third-party notification and persistence paths
- Primary targets:
  - `src/lib/idempotency.ts`
  - `src/lib/security/distributed-rate-limit.ts`
  - `src/lib/actions/contact.ts`
  - `src/app/api/subscribe/route.ts`
  - `src/app/api/inquiry/route.ts`
  - `src/app/api/whatsapp/send/route.ts`
  - `src/app/api/whatsapp/webhook/route.ts`
- Review tasks:
  - check duplicate submission behavior from browser to final side effect
  - inspect retry and timeout handling for duplicate writes or double notifications
  - verify rate limit and idempotency assumptions still hold under Cloudflare/OpenNext deployment
- Expected findings:
  - TOCTOU gaps
  - duplicate side effects
  - timing-sensitive tests hiding real races

### 3. Migration / Compatibility
- Review goal:
  Detect incomplete migrations, split-brain semantics, or hidden consumers that still depend on deprecated shapes, old entrypoints, or compatibility artifacts.
- Primary chains:
  - locale/runtime entry chain
  - API error contract chain
  - translation loading chain
- Primary targets:
  - `src/middleware.ts`
  - `src/app/[locale]/layout.tsx`
  - `src/lib/load-messages.ts`
  - `src/i18n/request.ts`
  - `messages/**`
  - `src/lib/api/**`
- Review tasks:
  - search for legacy helpers, deprecated comments, and compatibility fallbacks
  - verify production code no longer depends on compatibility artifacts that should now be tooling-only
  - distinguish production consumers from test-only consumers before classifying a migration as complete
- Expected findings:
  - hidden old consumers
  - incomplete migration seams
  - test-kept false entrypoints

### 4. Test Validity / Assertion Truthfulness
- Review goal:
  Confirm tests fail for real product risk rather than for mocks, English literals, implementation details, wall-clock thresholds, or incorrect assumptions about runtime behavior.
- Primary chains:
  - API contract tests
  - i18n and runtime loading tests
  - critical UI behavior tests
- Primary targets:
  - `src/app/api/**/__tests__/**`
  - `tests/integration/**`
  - `src/components/**/__tests__/**`
  - `src/lib/__tests__/**`
  - `vitest.config.mts`
  - `scripts/quality-gate.js`
- Review tasks:
  - identify assertions that hard-code transient strings, timings, or mock artifacts as product truth
  - compare critical tests against real production consumers and runtime contracts
  - verify gates still measure the intended risk surface
- Expected findings:
  - tests that preserve old protocol shapes
  - false-positive or false-negative gate logic
  - mocks that distort component semantics

### 5. Ownership / Single Source of Truth
- Review goal:
  Ensure every business rule, runtime decision, and shared value has a clear owner and is not re-declared across UI, config, helpers, comments, and tests.
- Primary chains:
  - i18n truth-source chain
  - security/config chain
  - shared validation and API helper chain
- Primary targets:
  - `src/config/**`
  - `src/lib/i18n/**`
  - `src/lib/api/**`
  - `src/lib/security/**`
  - `messages/**`
  - any file marked `legacy`, `deprecated`, or `Currently used by`
- Review tasks:
  - locate duplicated facts, duplicated defaults, and dual-source runtime decisions
  - verify comments about usage against real production references
  - review whether tests are keeping obsolete truth sources alive
- Expected findings:
  - split-brain config
  - duplicated business facts
  - comments that no longer match production reality

### 6. Abnormal-Path Semantics
- Review goal:
  Verify that non-happy paths remain semantically correct: wrong input, rate limit, missing config, dependency failure, invalid locale, signature failure, malformed body, or partial fallback.
- Primary chains:
  - public write APIs
  - locale/runtime fallback chain
  - client error presentation chain
- Primary targets:
  - `src/app/api/contact/route.ts`
  - `src/app/api/inquiry/route.ts`
  - `src/app/api/subscribe/route.ts`
  - `src/app/api/verify-turnstile/route.ts`
  - `src/app/api/whatsapp/**`
  - `src/components/forms/contact-form-container.tsx`
  - `src/components/products/product-inquiry-form.tsx`
  - `src/components/blog/blog-newsletter.tsx`
  - `src/lib/api/translate-error-code.ts`
- Review tasks:
  - inspect whether error semantics remain consistent from server response to UI presentation
  - verify fallback behavior still respects project rules for i18n, security, and business meaning
  - check that degraded states do not silently change contract or user-visible meaning
- Expected findings:
  - mixed error semantics
  - wrong fallback language or wrong locale behavior
  - fail-open or fail-closed behavior that no longer matches intent

## Execution Waves

### Wave 0: Rebase and Scope Freeze
- Read:
  - `docs/code-review/issues.md`
  - `docs/code-review/round4-execution-summary.md`
  - `.claude/rules/review-checklist.md`
  - `.claude/rules/security.md`
- Record:
  - baseline commit or bounded scope
  - excluded areas
  - reasons for exclusion

### Wave 1: Business Write Paths
- Dimensions:
  - Data invariants / state transitions
  - Concurrency / retry / timing
  - Abnormal-path semantics
- Primary scope:
  - `src/app/api/contact/route.ts`
  - `src/app/api/inquiry/route.ts`
  - `src/app/api/subscribe/route.ts`
  - `src/lib/actions/contact.ts`
  - `src/lib/idempotency.ts`
  - `src/lib/security/distributed-rate-limit.ts`
- Goal:
  - catch write-path correctness defects before reviewing broader support layers

### Wave 2: Runtime, i18n, and truth sources
- Dimensions:
  - Migration / compatibility
  - Ownership / single source of truth
  - Abnormal-path semantics
- Primary scope:
  - `src/middleware.ts`
  - `src/app/[locale]/layout.tsx`
  - `src/lib/load-messages.ts`
  - `src/i18n/request.ts`
  - `messages/**`
  - shared helpers with deprecated or legacy markers
- Goal:
  - find incomplete migrations, hidden fallbacks, and duplicate truth sources

### Wave 3: Test and gate audit
- Dimensions:
  - Test validity / assertion truthfulness
  - cross-check with all other dimensions
- Primary scope:
  - targeted API tests
  - runtime/i18n tests
  - quality gate and lint/test configuration
- Goal:
  - ensure the gate layer reinforces the six dimensions instead of masking them

### Wave 4: Consolidation
- Write findings into `docs/code-review/issues.md` style
- For each finding, record:
  - ID
  - priority
  - labels
  - primary dimension
  - review chain
  - evidence
  - impact
  - recommended fix
  - acceptance command
  - status

## Recommended Review Order
1. Wave 1 first, because business write paths remain the highest-risk place for correctness defects.
2. Wave 2 second, because runtime/i18n truth-source drift can silently reintroduce old problems.
3. Wave 3 third, because test and gate work should validate or challenge the conclusions from Waves 1 and 2.
4. Consolidate only delta findings; do not reopen closed Round 4 items without new evidence.

## Deliverables
- updated `task_plan.md`
- updated `notes.md`
- this review package: `six_dimension_review_plan.md`
- future findings, if executed: `docs/code-review/issues.md`

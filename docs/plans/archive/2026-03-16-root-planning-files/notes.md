# Notes: Delta Code Review Cycle

## Sources

### Source 1: Existing review baseline
- Path: `docs/archive/code-review/2026-03-16-review-history/round4-execution-summary.md`
- Key points:
  - Round 4 Wave A to D is already complete.
  - Current accepted runtime boundary is `src/middleware.ts`.
  - `html[lang]`, locale redirect, API error contract, and truth-source cleanup have already been addressed.

### Source 2: Existing issue ledger
- Path: `docs/archive/code-review/2026-03-16-review-history/issues.md`
- Key points:
  - Existing findings use `priority + labels + evidence + impact + recommended fix + acceptance command + status`.
  - Many previously critical API/security and framework issues are already closed.

### Source 3: Project brief
- Path: `docs/content/PROJECT-BRIEF.md`
- Key points:
  - Primary goal is inquiry conversion.
  - Secondary goals are product presentation and brand building.
  - Product priorities are tiered, with PETG pneumatic tube systems and PVC conduit lines carrying different strategic weight.
  - The company differentiator is upstream bending-machine capability plus in-house pipe production.

### Source 4: Project runtime and tooling
- Path: `package.json`
- Key points:
  - Dual build targets exist: `build` and `build:cf`.
  - The repository already has strong review hooks: lint, type-check, security, architecture, i18n, translation validation, quality gate.
  - The codebase uses Next.js 16, React 19, next-intl, Airtable, Resend, Turnstile, and Cloudflare OpenNext.

### Source 5: Middleware and locale runtime
- Path: `src/middleware.ts`
- Key points:
  - Middleware handles locale logic, cookie synchronization, redirect correction, nonce propagation, and security headers.
  - This is a high-risk integration point because it mixes routing, i18n, and security behavior.

### Source 6: Contact form configuration
- Path: `src/config/contact-form-config.ts`
- Key points:
  - The contact form is intentionally configurable.
  - Some fields are disabled or optional for lead pipeline reasons.
  - Anti-spam and consent behavior are configured here and must match business intent.

### Source 7: Site facts and content boundaries
- Path: `src/config/site-facts.ts`
- Key points:
  - Business facts are separated from translatable marketing copy.
  - This creates a useful review seam for checking whether facts, messages, and presentation responsibilities are staying clean.

### Source 8: Quality gate implementation
- Path: `scripts/quality-gate.js`
- Key points:
  - The repo already encodes quality expectations.
  - Review should inspect not just what is checked, but also what is excluded and why.

## Synthesized Findings

### Business-fit review implications
- Review must validate that inquiry conversion is not being undermined by form friction, broken handoff paths, or misplaced content priorities.
- Review must check that product hierarchy in the brief is reflected in code structure, routing, and content emphasis.
- Review must treat i18n as a business feature, not just a translation layer.

### Delta-scope implications
- This cycle cannot behave like a fresh audit because Round 4 already closed major framework, API contract, and truth-source issues.
- New review work should focus on active chains that remain high leverage: middleware/runtime entry, form submission, content/SEO, config/integration seams, and any blind spots in current gates.

### Code-quality review implications
- The review must explicitly include simplicity and elegance, not just correctness.
- Temporary implementation is acceptable only when it does not distort boundaries or lock in bad structure.
- Middleware, form handling, and external integrations are the most likely places for patch-like code growth.

### Baseline gate results
- `pnpm type-check`: passed.
- `pnpm lint:check`: failed for repository-root `.agents/skills/**` files and related local skill assets rather than `src/**` production code.
- `pnpm build`: passed.
- `pnpm build:cf`: passed when run sequentially after `build`; parallel invocation caused `.next/lock` contention and is not a product issue.
- `pnpm build:cf` emitted OpenNext bundling warnings about duplicate `console.time` labels (`Applying code patches`) inside the build chain.

### Baseline gate implications
- Current lint signal is polluted by repo-local non-product files, so it cannot be treated as a pure application-health gate in this working tree.
- The runtime entry chain remains build-valid for both standard Next and Cloudflare targets.
- The next review pass should prioritize:
  - tooling/gate integrity
  - locale/runtime chain for subtle regressions not covered by builds
  - form/API/security chain for remaining contract or abuse blind spots

### Coupling and integration review implications
- Strong attention is needed on the seams between config, content, messages, middleware, API routes, security utilities, and external services.
- Tests must be evaluated for production realism, not just breadth.
- Build parity between standard Next.js output and Cloudflare output is part of code health for this project.

## Review Log

### Phase 2: Baseline gate results
- `pnpm type-check`: passed
- `pnpm lint:check`: failed
  - Failure source is repo-local `.agents/skills/**` content that is not ignored by ESLint.
  - This is a gate-signal issue, not a production runtime failure.
- `pnpm build`: passed
- `pnpm build:cf`: passed when run sequentially
  - Parallel run previously failed on `.next/lock`; this was execution noise, not a product issue.
- `pnpm validate:translations`: passed
- `pnpm i18n:validate:code`: passed

### Candidate findings with supporting evidence
- Gate signal drift:
  - `eslint.config.mjs` globally ignores `.claude/skills/**` but not `.agents/skills/**`.
  - Local repo state can therefore break `pnpm lint:check` and `pnpm ci:local:quick` without touching production code.
- Public JSON body-size gap:
  - `src/lib/api/safe-parse-json.ts` reads `req.json()` with no `content-length` gate or byte cap.
  - Public write endpoints using it include contact, inquiry, verify-turnstile, subscribe, and WhatsApp send.
  - Existing body-size fixes only cover `csp-report` and `whatsapp/webhook`, so the shared JSON path remains open.
- Contact form i18n regression:
  - `src/lib/actions/contact.ts` still returns hardcoded English detail strings for expired submission and failed Turnstile verification.
  - `src/components/forms/contact-form-container.tsx` renders non-key details verbatim.
  - Result: localized UI can still display English detail bullets on non-validation failures.

## Current Cycle Notes

### Baseline gate results
- `pnpm type-check`: passed.
- `pnpm lint:check`: failed, but the failure is currently dominated by repository-root local skill content under `.agents/skills/**`, not by `src/**` production code.
- `pnpm build`: passed.
- `pnpm build:cf`: passed when run sequentially after `build`; the earlier failure was only a `.next/lock` contention caused by parallel execution.

### Candidate findings confirmed
- Candidate A: ESLint global ignore scope does not exclude `.agents/skills/**`, so repo-local skill content can break `pnpm lint:check` and downstream local CI signals.
- Candidate B: shared JSON parsing path has no body size gate; several public JSON endpoints still read unbounded request bodies through `request.json()`.
- Candidate C: contact server action still emits literal English `details` strings for some non-validation errors, and the client renders non-key details verbatim, causing mixed-language error UI.

## CR-085 Candidate Notes (2026-03-15)

### Scope scanned
- `src/types/whatsapp-service-types.ts`
- `src/types/whatsapp.ts`
- `src/lib/content.ts`
- `src/lib/whatsapp/index.ts`
- remaining `src/**/index.ts` barrels

### Consumer check summary
- `src/lib/content.ts` still has active production consumers (`@/lib/content` in locale pages), so it remains a real entrypoint.
- `src/lib/whatsapp/index.ts` still has active consumers (`@/lib/whatsapp`), so it remains a real entrypoint.
- remaining `src/**/index.ts` barrels still have importers after the CR-084 cleanup; none of the survivors are zero-consumer barrels.
- `src/types/whatsapp-service-types.ts` has no confirmed direct consumers in `src/**` or `tests/**`.

### Why `src/types/whatsapp-service-types.ts` is different
- It is a standalone facade that only re-exports submodules.
- Its direct import surface is dead even though the underlying service type modules remain live through `@/types/whatsapp` and direct submodule imports.
- This matches the same class of issue as prior dead barrel and dead compatibility-surface cleanups: documented-looking entrypoint, but no real consumer keeps it on the production path.

### Verification
- `rg -n 'whatsapp-service-types' src tests` returned no consumer hits before and after the cleanup.
- `pnpm type-check` passed after deleting `src/types/whatsapp-service-types.ts`.

## CR-086 Candidate Notes (2026-03-15)

### Scope scanned
- `src/lib/api/api-response-schema.ts`
- `src/lib/i18n-message-cache.ts`
- related test files under `src/lib/__tests__/**`

### Consumer check summary
- `src/lib/api/api-response-schema.ts` is only imported by `src/lib/__tests__/validations.test.ts`.
- No production code imports `@/lib/api/api-response-schema`.
- `src/lib/i18n-message-cache.ts` also currently appears test-only, but it touches a larger cluster of i18n performance tests and is better treated as a separate cleanup item after the smaller dead helper is removed.

### Current decision
- Promote `api-response-schema.ts` first because it is a narrow, zero-production-consumer helper with a simple test dependency edge.
- Keep `i18n-message-cache.ts` as the next likely candidate rather than batching both into one change without a more deliberate test rewrite.

### Verification
- `rg -n 'api-response-schema|apiResponseSchema' src tests` returned no remaining references after the cleanup.
- `pnpm exec vitest run src/lib/__tests__/validations.test.ts` passed after removing the dead helper assertions.
- `pnpm type-check` passed after deleting `src/lib/api/api-response-schema.ts`.

## CR-087 Candidate Notes (2026-03-15)

### Scope scanned
- `src/lib/i18n-message-cache.ts`
- `src/lib/__tests__/i18n-performance.test.ts`
- `src/lib/__tests__/i18n-performance-cache.test.ts`
- `src/lib/__tests__/i18n-performance.network-failure.test.ts`

### Consumer check summary
- `src/lib/i18n-message-cache.ts` had no production consumers.
- All imports of `TranslationCache`, `getCachedMessages`, `getCachedTranslations`, and `preloadTranslations` came from the i18n performance test files themselves.
- The file comment already described it as a legacy/test-side helper rather than an active runtime truth source.

### Cleanup decision
- Delete the dead helper and the tests that only preserved its fetch-based cache semantics.
- Keep a smaller focused test file for the still-live `I18nPerformanceMonitor` and `evaluatePerformance()` logic.

### Verification
- `rg -n 'i18n-message-cache|TranslationCache|getCachedMessages|getCachedTranslations|preloadTranslations' src tests` returned no remaining references after the cleanup.
- `pnpm exec vitest run src/lib/__tests__/i18n-performance.test.ts` passed with the reduced monitor-focused suite.
- `pnpm type-check` passed after deleting `src/lib/i18n-message-cache.ts`.

## CR-088 Candidate Notes (2026-03-15)

### Scope scanned
- `src/lib/security-file-upload.ts`
- `src/lib/security-tokens.ts`
- their dedicated tests under `src/lib/__tests__/**` and `tests/unit/security/**`
- `src/lib/__tests__/security.test.ts`

### Consumer check summary
- `src/lib/security-file-upload.ts` had no production consumers; imports only came from test files.
- `src/lib/security-tokens.ts` had no production consumers; imports only came from test files.
- `src/lib/__tests__/security.test.ts` mixed live `security-validation` assertions with dead helper-preservation assertions.

### Cleanup decision
- Delete both dead helper modules and their dedicated tests.
- Trim `src/lib/__tests__/security.test.ts` down to the still-live `security-validation` coverage.

### Verification
- `rg -n '@/lib/security-file-upload|@/lib/security-tokens|security-file-upload|security-tokens' src tests` returned no remaining references after the cleanup.
- `pnpm exec vitest run src/lib/__tests__/security.test.ts` passed after removing the dead-helper sections.
- `pnpm type-check` passed after deleting both modules.

## CR-089 Candidate Notes (2026-03-15)

### Scope scanned
- `src/types/test-types.ts`
- all imports from `@/types/test-types`

### Consumer check summary
- `src/types/test-types.ts` was only imported by test files and test helpers.
- No production code depended on this file; the issue was namespace placement, not runtime coupling.

### Cleanup decision
- Move the file from `src/types/test-types.ts` to `src/test/test-types.ts`.
- Update all test and test-helper imports to the new test-only namespace.

### Verification
- `rg -n '@/types/test-types|@/test/test-types' src tests` showed the old path was fully removed and all consumers now point at the test namespace.
- `pnpm exec vitest run src/lib/__tests__/airtable.test.ts src/lib/__tests__/resend.test.ts` passed after the import rewrite.
- `pnpm type-check` passed after the move.

## Review Hygiene Guardrail (2026-03-15)

### Goal
- Prevent the reintroduction of top-level production-namespace entrypoints that are either zero-consumer or test-only.

### Implementation
- Added `scripts/check-review-hygiene.js`.
- Added `pnpm review:hygiene`.
- Wired the new check into `scripts/quality-gate.js` as part of the code-quality gate.

### Detection scope
- Top-level files under:
  - `src/lib/*.ts`
  - `src/types/*.ts`
  - `src/config/*.ts`
- Excludes:
  - declaration files
  - generated files
- The script resolves both alias imports (`@/...`) and relative imports, then classifies consumers as production or test paths.

### Verification
- `pnpm review:hygiene` passed on the current tree.
- `node scripts/quality-gate.js --mode=fast --output=json` showed `reviewHygiene.errors = 0` and `reviewHygiene.status = "passed"`, confirming the gate integration is active.

### Current limitation
- `quality:gate:fast` still exits non-zero in this working tree because the existing ESLint step reports unrelated errors.
- The new hygiene guard itself is not the failing gate.

## ESLint Gate Recovery (2026-03-15)

### Blocking errors captured
- `src/lib/__tests__/colors-contrast-compliance.test.ts`
  - unused `TEST_CONSTANTS` import
- `src/lib/i18n/route-parsing.ts`
  - dynamic `RegExp` constructor triggered `security/detect-non-literal-regexp`
- `src/lib/idempotency.ts`
  - `withIdempotentResult` exceeded `max-statements` and `complexity`
- `src/test/test-types.ts`
  - stale `eslint-disable` directives became warnings

### Fixes applied
- Removed the unused import from the color contrast test.
- Moved the `route-parsing` lint suppression to the actual `RegExp` construction site.
- Split `withIdempotentResult` support logic into smaller helpers and normalized helper signatures so ESLint no longer flags complexity, statement count, or helper parameter shape.
- Removed stale `eslint-disable` directives from `src/test/test-types.ts`.

### Verification
- `pnpm lint:check`
- `pnpm quality:gate:fast -- --silent`

### Result
- The fast quality gate is green again.
- The new review hygiene guard remains integrated and passing inside the code-quality gate.

## Six-Dimension Review Planning (2026-03-13)

### Planning inputs
- Existing framework file:
  - `docs/archive/code-review/2026-03-16-review-history/archive/2026-03-16-root-review-docs/code_review_framework.md`
- Existing review baseline:
  - `docs/archive/code-review/2026-03-16-review-history/round4-execution-summary.md`
- Existing findings ledger:
  - `docs/archive/code-review/2026-03-16-review-history/issues.md`
- Existing project review rules:
  - `.claude/rules/review-checklist.md`
  - `.claude/rules/security.md`

### Why the next planning pass should use six explicit dimensions
- The current framework is already strong on correctness, security, contracts, boundaries, and gate integrity.
- The missing step is not another broad quality slogan, but explicit review work organized by failure class:
  - data invariants and state transitions
  - concurrency, retry, and timing
  - migration and compatibility
  - test validity and assertion truthfulness
  - ownership and single source of truth
  - abnormal-path semantics

### Repository-specific mapping
- Data invariants / state transitions:
  - most relevant to `contact`, `inquiry`, `subscribe`, server actions, lead pipeline, and form helpers
- Concurrency / retry / timing:
  - most relevant to idempotency, rate limit, retries, webhook/send flows, and side-effectful writes
- Migration / compatibility:
  - most relevant to middleware/runtime entry, i18n message loading, API error contract consumers, and compatibility artifacts under `messages/`
- Test validity / assertion truthfulness:
  - most relevant to route tests, integration tests, `vitest.config.mts`, and quality gate behavior
- Ownership / single source of truth:
  - most relevant to config, i18n, security helpers, API helpers, and legacy/deprecated entrypoints
- Abnormal-path semantics:
  - most relevant to public write APIs, translation/error presentation, and runtime fallback behavior

### Planning decision
- The next review cycle should be organized into waves, not six isolated scans.
- Wave 1 should cover business write paths using dimensions 1, 2, and 6.
- Wave 2 should cover runtime/i18n/shared truth-source paths using dimensions 3, 5, and 6.
- Wave 3 should audit tests and gates through dimension 4 and cross-check the earlier conclusions.
- Findings should still land in `docs/archive/code-review/2026-03-16-review-history/issues.md`; the six dimensions are planning lenses, not a new findings format.

## Wave 1 Execution Notes (2026-03-13)

### Scope executed
- `src/app/api/contact/route.ts`
- `src/app/api/inquiry/route.ts`
- `src/app/api/subscribe/route.ts`
- `src/lib/actions/contact.ts`
- `src/lib/contact-form-processing.ts`
- `src/lib/idempotency.ts`
- `src/lib/security/distributed-rate-limit.ts`
- targeted tests around contact/inquiry/subscribe and the contact form container

### Findings summary
- Contact flow data semantics are currently inconsistent:
  - `processFormSubmission()` rewrites the synthetic lead `referenceId` into both `emailMessageId` and `airtableRecordId`.
  - `/api/contact` then returns those fields as if they were real downstream service identifiers.
  - Existing tests mostly mock `processFormSubmission()` and therefore miss the bug.
- Contact path concurrency protection is weaker than inquiry/subscribe:
  - both the Server Action and `/api/contact` route perform rate limiting
  - neither path uses idempotency protection
  - real downstream side effects still occur through the lead pipeline
- Contact form abnormal-path UX is currently wrong:
  - the client records cooldown before the Server Action outcome is known
  - failed submissions can still trigger local cooldown and disable the submit button
  - existing tests cover the success cooldown path but not failed-submit cooldown

### Deliverable written
- `docs/archive/code-review/2026-03-16-review-history/archive/2026-03-16-root-review-artifacts/wave1_review_findings.md`

## Ledger Update and Wave 2 Kickoff (2026-03-13)

### Wave 1 findings promoted to official ledger
- `CR-053` contact path exposes synthetic `referenceId` as provider-specific IDs
- `CR-054` contact path lacks idempotency protection despite side effects
- `CR-055` contact client cooldown starts before server acceptance

### Wave 2 kickoff observation
- `src/i18n/request.ts` still computes `metadata.cacheUsed` via `TranslationCache` using the key `messages-${locale}-critical`
- the actual runtime message path now goes through `loadCompleteMessages(locale)` from `src/lib/load-messages.ts`
- the only production writer for the old cache key lives in `src/lib/i18n-performance.ts`, which represents a separate fetch-based helper path
- this looks like a new single-source-of-truth / metric-semantics drift candidate and is recorded in `docs/archive/code-review/2026-03-16-review-history/archive/2026-03-16-root-review-artifacts/wave2_review_findings.md`

## CR-055 Repair (2026-03-13)

### Scope
- `src/components/forms/contact-form-container.tsx`
- `src/components/forms/__tests__/contact-form-submission.test.tsx`

### Fix summary
- Removed the eager `recordSubmission()` call from the enhanced contact form action.
- Cooldown now remains tied to the existing success-state effect that calls `setLastSubmissionTime(new Date())`.

### Verification
- `pnpm exec vitest run src/components/forms/__tests__/contact-form-submission.test.tsx`
- `pnpm exec vitest run src/components/forms/__tests__/contact-form-container.test.tsx`

### Result
- Success path still starts cooldown.
- Error path no longer eagerly records a cooldown timestamp.
- `CR-055` can be treated as repaired.

## CR-053 Repair (2026-03-13)

### Scope
- `src/lib/contact-form-processing.ts`
- `src/lib/actions/contact.ts`
- `src/app/api/contact/route.ts`
- contact route / processing / action / integration tests

### Fix summary
- Removed the fake provider-ID contract from the contact path.
- The contact chain now returns and propagates `referenceId` explicitly.
- Tests were updated so they stop preserving `messageId` / `recordId` semantics for contact.

### Verification
- `pnpm exec vitest run src/app/api/contact/__tests__/contact-api-validation.test.ts`
- `pnpm exec vitest run src/app/api/contact/__tests__/route-post.test.ts`
- `pnpm exec vitest run src/app/api/contact/__tests__/route.test.ts`
- `pnpm exec vitest run src/app/__tests__/actions.test.ts src/app/__tests__/contact-integration.test.ts tests/integration/api/contact.test.ts`

### Result
- Contact success payload semantics now match the actual data the chain owns.
- `CR-053` can be treated as repaired.

## CR-054 Repair (2026-03-13)

### Scope
- `src/app/api/contact/route.ts`
- `src/lib/idempotency.ts`
- `src/lib/actions/contact.ts`
- `src/components/forms/contact-form-container.tsx`
- contact route / action / integration tests

### Fix summary
- Added a reusable non-HTTP idempotency helper, `withIdempotentResult()`, on top of the existing store/state machine.
- `/api/contact` now requires `Idempotency-Key` and caches successful responses.
- `contactFormAction` now requires an `idempotencyKey` form field and dedupes successful submissions under a contact-specific fingerprint.
- `ContactFormContainer` now generates and reuses the form idempotency key until a successful submission clears it.

### Verification
- `pnpm exec vitest run src/app/api/contact/__tests__/route-post.test.ts`
- `pnpm exec vitest run src/app/api/contact/__tests__/route.test.ts`
- `pnpm exec vitest run src/app/__tests__/actions.test.ts src/app/__tests__/contact-integration.test.ts`
- `pnpm exec vitest run tests/integration/api/contact.test.ts`

### Result
- Contact API and Server Action paths now both have real duplicate-submission protection.
- `CR-054` can be treated as repaired.

## Wave 2 Review Promotion (2026-03-13)

### Confirmed issue
- `CR-056`:
  - `src/i18n/request.ts` still infers `metadata.cacheUsed` from `TranslationCache`
  - the real runtime message path is now `loadCompleteMessages(locale)`
  - the old cache key is only written by `src/lib/i18n-performance.ts`, which looks largely test-kept on the fetch-based helper side

### Why this was promoted
- This is no longer just a “maybe stale comment” level concern.
- It is a concrete single-source-of-truth drift in runtime metadata semantics.
- The repository now has a documented Wave 2 issue to either fix directly or use as the anchor for the next runtime/i18n cleanup pass.

## CR-056 Repair (2026-03-13)

### Scope
- `src/i18n/request.ts`
- `src/i18n/__tests__/request.test.ts`
- `src/lib/__tests__/load-messages.fallback.test.ts`

### Fix summary
- Removed `TranslationCache` from the request-time runtime config path.
- Request metadata no longer infers `cacheUsed` from the obsolete fetch-based translation cache seam.
- The request layer now records load time only and uses a conservative `cacheUsed: false` value.

### Verification
- `pnpm exec vitest run src/i18n/__tests__/request.test.ts`
- `pnpm exec vitest run src/lib/__tests__/load-messages.fallback.test.ts`

### Result
- `CR-056` can be treated as repaired.

## Wave 2 Follow-up Promotion (2026-03-13)

### Confirmed issue
- `CR-057`:
  - `src/lib/i18n-performance.ts` still exposes a fetch-based translation helper stack that now has almost no real production consumers
  - comments still describe a missing production consumer (`translation-preloader.tsx`)
  - the helper path remains in a formal runtime namespace even though the canonical runtime source has moved to `src/lib/load-messages.ts`

### Why this was promoted
- This is another concrete migration / single-source-of-truth drift issue, not just code cleanup taste.
- It explains how Wave 2 runtime i18n drift can grow back even after `CR-056` is fixed.

## CR-057 Repair (2026-03-13)

### Scope
- `src/lib/i18n-performance.ts`
- `src/lib/i18n-message-cache.ts`
- i18n performance/cache-related tests

### Fix summary
- Removed the fetch-based translation helper stack from `i18n-performance.ts`.
- Introduced `src/lib/i18n-message-cache.ts` as the explicit non-canonical helper boundary.
- Updated the test suite to depend on the new module instead of preserving the old formal runtime namespace.

### Verification
- `pnpm exec vitest run src/lib/__tests__/i18n-performance.test.ts`
- `pnpm exec vitest run src/lib/__tests__/i18n-performance.network-failure.test.ts src/lib/__tests__/i18n-performance-cache.test.ts`
- `pnpm exec vitest run src/i18n/__tests__/request.test.ts`

### Result
- `CR-057` can be treated as repaired.

## CR-058 Repair (2026-03-13)

### Scope
- `src/middleware.ts`
- `tests/unit/middleware.test.ts`
- `src/__tests__/middleware-locale-cookie.test.ts`

### Fix summary
- Removed the explicit locale early-return branch that bypassed `next-intl` just to resync `NEXT_LOCALE`.
- Explicit locale requests now stay on the canonical `intlMiddleware(request)` path.
- Cookie/security behavior remains in the shared post-processing logic.

### Verification
- `pnpm exec vitest run tests/unit/middleware.test.ts`
- `pnpm exec vitest run src/__tests__/middleware-locale-cookie.test.ts`

### Result
- `CR-058` can be treated as repaired.

## CR-059 Cleanup (2026-03-13)

### Scope
- `src/app/[locale]/layout-test.tsx`
- `src/lib/i18n/server/getMessagesComplete.ts`

### Cleanup summary
- Repository-wide reference search showed `layout-test.tsx` had no active consumers.
- `getMessagesComplete()` was only consumed by `layout-test.tsx` and added no runtime value beyond wrapping `loadCompleteMessages()`.
- Both files were removed to keep test-only/dead i18n entrypoints out of formal runtime namespaces.

## CR-060 Repair (2026-03-13)

### Scope
- `src/lib/i18n/route-parsing.ts`
- `src/lib/i18n/__tests__/route-parsing.test.ts`
- `src/components/__tests__/language-toggle.test.tsx`

### Fix summary
- Removed the hardcoded `en|zh` locale regex from `route-parsing.ts`.
- `LOCALE_PREFIX_RE` now derives from `routing.locales`, eliminating the duplicated locale list.

### Verification
- `pnpm exec vitest run src/lib/i18n/__tests__/route-parsing.test.ts`
- `pnpm exec vitest run src/components/__tests__/language-toggle.test.tsx`

### Result
- `CR-060` can be treated as repaired.

## CR-061 Repair (2026-03-13)

### Scope
- `src/i18n/request.ts`
- `src/i18n/__tests__/request.test.ts`

### Fix summary
- Removed the `cacheUsed` field from request metadata after it had already lost any trustworthy runtime meaning.
- Simplified the request test suite to match the reduced metadata contract.

### Verification
- `pnpm exec vitest run src/i18n/__tests__/request.test.ts`

### Result
- `CR-061` can be treated as repaired.

## CR-062 Repair (2026-03-13)

### Scope
- `src/lib/structured-data-types.ts`
- structured-data-related tests

### Fix summary
- Removed the duplicated locale union from the structured-data type layer.
- Structured-data locale typing now reuses the canonical `routing-config` locale source.

### Verification
- `pnpm exec vitest run src/app/[locale]/__tests__/layout-structured-data.test.ts`
- `pnpm exec vitest run src/lib/__tests__/structured-data.test.ts`

### Result
- `CR-062` can be treated as repaired.

## CR-063 Repair (2026-03-13)

### Scope
- `src/lib/load-messages.ts`
- `src/lib/__tests__/load-messages.fallback.test.ts`
- `src/i18n/__tests__/request.test.ts`

### Fix summary
- Removed the duplicated locale union from the canonical runtime message loader.
- `load-messages.ts` now reuses the routing layer’s `Locale` type.

### Verification
- `pnpm exec vitest run src/lib/__tests__/load-messages.fallback.test.ts src/i18n/__tests__/request.test.ts`

### Result
- `CR-063` can be treated as repaired.

## CR-064 Repair (2026-03-13)

### Scope
- `src/config/paths/types.ts`
- `src/types/content.types.ts`
- `src/types/i18n.ts`

### Fix summary
- Removed the remaining duplicated shared locale unions from the paths/content/i18n type layers.
- Those layers now reuse the canonical routing locale type instead of maintaining parallel `"en" | "zh"` declarations.

### Verification
- `pnpm exec vitest run src/config/__tests__/paths.test.ts`
- `pnpm exec vitest run src/lib/content/__tests__/products-source.test.ts src/lib/content/__tests__/products-wrapper.test.ts`
- `pnpm exec vitest run tests/integration/i18n-components.test.tsx`

### Result
- `CR-064` can be treated as repaired.

## CR-065 Repair (2026-03-13)

### Scope
- `src/i18n/__tests__/request.test.ts`

### Fix summary
- Rewrote the request test suite around the real `getRequestConfig` callback path.
- Removed stale assertions for fields that the implementation no longer returns.
- Eliminated module-cache false positives by resetting modules per test.

### Verification
- `pnpm exec vitest run src/i18n/__tests__/request.test.ts`

### Result
- `CR-065` can be treated as repaired.

## CR-066 Repair (2026-03-13)

### Scope
- `src/components/responsive-layout.tsx`
- `src/components/__tests__/responsive-layout.test.tsx`

### Fix summary
- Removed the deprecated prop compatibility layer from `ResponsiveLayout`.
- The component now only supports the current CSS-first slot API.
- Tests were updated to stop preserving the legacy contract.

### Verification
- `pnpm exec vitest run src/components/__tests__/responsive-layout.test.tsx`

### Result
- `CR-066` can be treated as repaired.

## CR-067 Repair (2026-03-13)

### Scope
- `src/components/security/turnstile.tsx`
- `src/components/security/__tests__/turnstile.test.tsx`

### Fix summary
- Removed the deprecated `onVerify` compatibility path from `TurnstileWidget`.
- Removed the legacy `handlers.onVerify` alias from `useTurnstile`.
- Updated the test suite to rely only on the current `onSuccess` API.

### Verification
- `pnpm exec vitest run src/components/security/__tests__/turnstile.test.tsx`

### Result
- `CR-067` can be treated as repaired.

## CR-068 Repair (2026-03-13)

### Scope
- `src/config/footer-links.ts`

### Fix summary
- Removed the dead deprecated `WhatsAppStyleTokensLegacy` type from the footer config layer.

### Verification
- `pnpm exec vitest run src/components/footer/__tests__/Footer.test.tsx`
- `pnpm exec vitest run src/components/whatsapp/__tests__/whatsapp-floating-button.test.tsx`

### Result
- `CR-068` can be treated as repaired.

## CR-069 Repair (2026-03-13)

### Scope
- `src/lib/lead-pipeline/utils.ts`
- `src/lib/lead-pipeline/__tests__/utils.test.ts`

### Fix summary
- Removed the deprecated `sanitizeInput()` wrapper from the lead-pipeline utility layer.
- Updated the utils test suite to stop preserving that wrapper as public API.

### Verification
- `pnpm exec vitest run src/lib/lead-pipeline/__tests__/utils.test.ts`

### Result
- `CR-069` can be treated as repaired.

## CR-070 Cleanup (2026-03-13)

### Scope
- `src/lib/locale-constants.ts`

### Cleanup summary
- Removed the dead locale constants module after confirming it had no active production or test consumers.

### Result
- `CR-070` can be treated as repaired.

## CR-071 Repair (2026-03-13)

### Scope
- `src/app/[locale]/layout-fonts.ts`
- `src/app/[locale]/__tests__/layout-fonts.test.ts`

### Fix summary
- Removed the dead `ibmPlexSans` compatibility alias from the locale layout font module.
- Updated the test suite to validate only the active font exports.

### Verification
- `pnpm exec vitest run src/app/[locale]/__tests__/layout-fonts.test.ts`

### Result
- `CR-071` can be treated as repaired.

## CR-073 Cleanup (2026-03-13)

### Scope
- `src/constants/magic-numbers.ts`

### Cleanup summary
- Removed the dead constants facade after confirming it had no active imports.

### Result
- `CR-073` can be treated as repaired.

## CR-074 Repair (2026-03-13)

### Scope
- `src/types/whatsapp.ts`
- `src/constants/core.ts`
- `src/constants/index.ts`
- `src/config/security.ts`

### Fix summary
- Removed dead backward-compatibility alias exports from the top-level WhatsApp type entrypoint.
- Introduced `src/constants/core.ts` to keep shared core constants explicit after the earlier facade deletion.
- Repaired the resulting compile-level fallout so the tree stays type-safe.

### Verification
- `pnpm type-check`

### Result
- `CR-074` can be treated as repaired.

## CR-075 Repair (2026-03-13)

### Scope
- `src/types/whatsapp-webhook-types.ts`

### Fix summary
- Removed the dead backward-compatibility alias exports from the webhook type entrypoint.
- Cleaned up the unused imports that only existed to support that alias layer.

### Verification
- `pnpm exec vitest run src/app/api/whatsapp/webhook/__tests__/route.test.ts`
- `pnpm type-check`

### Result
- `CR-075` can be treated as repaired.

## CR-076 Repair (2026-03-13)

### Scope
- `src/types/whatsapp-api-types.ts`

### Fix summary
- Removed the dead backward-compatibility alias exports from the WhatsApp API type entrypoint.
- Cleaned up the now-unused import groups left behind by that alias layer.

### Verification
- `pnpm exec vitest run src/app/api/whatsapp/send/__tests__/route.test.ts`
- `pnpm type-check`

### Result
- `CR-076` can be treated as repaired.

## CR-077 Repair (2026-03-13)

### Scope
- `src/types/whatsapp-service-types.ts`

### Fix summary
- Removed the dead convenience factory helper block from the WhatsApp service type entrypoint.
- Cleaned up the import fallout left behind by that block.

### Verification
- `pnpm exec vitest run src/lib/__tests__/whatsapp-service.test.ts`
- `pnpm type-check`

### Result
- `CR-077` can be treated as repaired.

## CR-078 Repair (2026-03-13)

### Scope
- `src/types/whatsapp-service-types.ts`

### Fix summary
- Removed the dead default type export alias from the WhatsApp service type entrypoint.

### Verification
- `pnpm type-check`

### Result
- `CR-078` can be treated as repaired.

## CR-079 Repair (2026-03-13)

### Scope
- `src/types/whatsapp-service-types.ts`

### Fix summary
- Removed the dead import groups left behind after the earlier compatibility cleanup.
- The module now more honestly reflects its remaining role as a re-export surface.

### Verification
- `pnpm type-check`

### Result
- `CR-079` can be treated as repaired.

## CR-080 Repair (2026-03-13)

### Scope
- `src/types/whatsapp.ts`

### Fix summary
- Removed the next narrow set of dead top-level alias re-exports from the WhatsApp type entrypoint.

### Verification
- `pnpm exec vitest run src/lib/__tests__/whatsapp-service.test.ts src/app/api/whatsapp/send/__tests__/route.test.ts src/app/api/whatsapp/webhook/__tests__/route.test.ts`
- `pnpm type-check`

### Result
- `CR-080` can be treated as repaired.

## CR-081 Repair (2026-03-13)

### Scope
- `src/constants/test-constants.ts`
- `src/types/i18n.ts`
- `src/lib/__tests__/colors-contrast-compliance.test.ts`

### Fix summary
- Removed the dead underscore legacy aliases `_TEST_CONSTANTS` and `_Locale`.
- Updated the only remaining `_TEST_CONSTANTS` consumer to use `TEST_CONSTANTS`.

### Verification
- `pnpm exec vitest run src/lib/__tests__/colors-contrast-compliance.test.ts`
- `pnpm type-check`
- `rg -n "_TEST_CONSTANTS\\b|_Locale\\b" src tests -S`

### Result
- `CR-081` can be treated as repaired.

## CR-082 Cleanup (2026-03-13)

### Scope
- `src/components/blog/index.ts`

### Cleanup summary
- Removed the dead blog barrel after confirming it had no active imports.

### Result
- `CR-082` can be treated as repaired.

## CR-083 Cleanup (2026-03-13)

### Scope
- `src/components/seo/index.ts`

### Cleanup summary
- Removed the dead SEO barrel after confirming it had no active imports.

### Result
- `CR-083` can be treated as repaired.

## CR-084 Cleanup (2026-03-15)

### Scope
- dead barrel batch:
  - `src/components/blocks/index.ts`
  - `src/components/trust/index.ts`
  - `src/emails/index.ts`
  - `src/lib/security/stores/index.ts`

### Cleanup summary
- Removed the next batch of confirmed zero-consumer barrel files from the source tree.
- Restored `components/mdx` / `components/seo` / `lib/cache` / `lib/cookie-consent` / `lib/image` barrels after `type-check` proved they still had active consumers.

### Result
- `CR-084` can be treated as repaired.

## CR-072 Repair (2026-03-13)

### Scope
- `src/constants/count.ts`
- `src/constants/index.ts`
- active production consumers of deprecated count aliases

### Fix summary
- Replaced deprecated count aliases in production code with the canonical count constants.
- Removed the deprecated alias exports from the constants layer.
- Repaired the small compile leftovers exposed by that cleanup.

### Verification
- `pnpm type-check`
- `pnpm exec vitest run src/config/__tests__/paths.test.ts src/lib/__tests__/structured-data.test.ts src/components/security/__tests__/turnstile.test.tsx src/lib/lead-pipeline/__tests__/utils.test.ts`

### Result
- `CR-072` can be treated as repaired.

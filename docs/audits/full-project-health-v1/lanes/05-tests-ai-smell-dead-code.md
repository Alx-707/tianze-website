# Lane 05 - Tests / AI Smell / Dead Code

## 1. Scope

Lane scope: `05-tests-ai-smell-dead-code`.

This was a read-only lane audit focused on:

- test value vs. surface coverage
- mock realism around lead/API flows
- AI-smell patterns in tests and proof scripts
- dead-code / unused-export detection
- mutation-test proof boundaries

Business code, tests, scripts, config, dependencies, workflows, content, and public assets were not modified.

Skills/lenses used:

- `ai-smell-audit`: used as the main lens, especially "high test coverage, low test value", "dead code looks alive", and "fake green proof".
- `Linus`: used only as a judgment lens for `Simplify`, `Delete`, and `Needs proof`; it does not replace the evidence contract.

Baseline from preflight:

- Audit target: `origin/main @ 3ea482b53ca8db35f534f495211450d94bee963a`
- Local HEAD: `3ea482b53ca8db35f534f495211450d94bee963a`
- Business-code diff: zero
- Launch-readiness dirty work: excluded

## 2. Fresh Evidence Collected

| Evidence ID | Type | Exact reference | Result | Notes |
| --- | --- | --- | --- | --- |
| E-L05-001 | report | `docs/audits/full-project-health-v1/evidence/preflight.md` | Preflight says audit can start; target commit and zero business diff are clear. | Used only for lane baseline. |
| E-L05-002 | command | `pnpm test`, output in `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/pnpm-test.txt` | Passed: 376 test files, 5208 tests. | Vitest wrote ignored runtime output to `reports/test-results.json`. |
| E-L05-003 | command | `pnpm unused:check`, output in `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/pnpm-unused-check.txt` | Passed. | Passing result is weakened by broad Knip entries; see FPH-L05-002. |
| E-L05-004 | command | `pnpm quality:gate:fast`, output in `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/pnpm-quality-gate-fast.txt` | Passed code-quality and security gates; skipped coverage and performance. | Fast mode is not full launch proof. |
| E-L05-005 | command | `node scripts/check-mutation-required.js`, output in `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/check-mutation-required.txt` | Passed by skipping: no lead/security/form-schema business-code diff detected. | Full mutation was intentionally not run. |
| E-L05-006 | file | `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/test-files.txt` | Found 392 test/spec files under `src` and `tests`. | Inventory only. |
| E-L05-007 | file | `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/mock-scan.txt` | Found 1113 mock-related lines and 173 files with `vi.mock`. | Mocking is not automatically bad; used to locate risky proof gaps. |
| E-L05-008 | file | `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/surface-assertion-scan.txt` | Found 321 surface/assertion-smell lines. | Used as clue, not standalone proof for high severity. |
| E-L05-009 | file | `src/app/api/inquiry/__tests__/inquiry-integration.test.ts:1-12`, `src/app/api/inquiry/__tests__/inquiry-integration.test.ts:70-83`, `src/app/api/inquiry/route.ts:102-118` | Inquiry integration test comments claim validation is real, but the test mocks `productLeadSchema.safeParse` to always succeed while production route depends on that schema branch. | Main evidence for FPH-L05-001. |
| E-L05-010 | file | `knip.jsonc:8-16`, `knip.jsonc:18-22`, `src/components/blocks/_templates/BLOCK_TEMPLATE.tsx:1-16`, `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/pnpm-unused-check.txt` | Knip passes, but source trees are configured as entries, including component/lib files that should be discoverable as unused. | Main evidence for FPH-L05-002. |
| E-L05-011 | file | `scripts/check-mutation-required.js:107-128`, `tests/unit/scripts/check-mutation-required.test.ts:155-184`, `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/package-mutation-scripts.txt` | Mutation guard can suggest `pnpm test:mutation:lead-security`, but package scripts do not provide it. | Main evidence for FPH-L05-003. |
| E-L05-012 | file | `tests/e2e/contact-form-smoke.spec.ts:362-376` | ARIA assertion contains `hasAriaDescribedBy !== null || true`, which is always true. | Main evidence for FPH-L05-004. |
| E-L05-013 | file | `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/ui-primitive-tests.txt`, `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/ui-primitive-source-files.txt` | 97 UI primitive test files for 23 UI primitive source files. | Main evidence for FPH-L05-005. |
| E-L05-014 | file | `src/lib/lead-pipeline/__tests__/lead-schema.test.ts:96-220`, `src/lib/__tests__/idempotency.contracts.test.ts:117-140`, `src/lib/security/__tests__/rate-limit-key-strategies.test.ts:88-168`, `src/lib/i18n/__tests__/route-parsing.property.test.ts:34-77` | Good regression tests exist for schema rules, idempotency contracts, rate-limit key behavior, and route parsing properties. | Positive evidence; not a finding. |

## 3. Commands Run

| Command | Result | Classification |
| --- | --- | --- |
| `git diff --name-only origin/main...HEAD -- ':!docs/audits/full-project-health-v1/**' ':!docs/superpowers/plans/2026-04-27-full-project-health-audit-v1-conductor.md' ':!.context/audits/full-project-health-v1/**'` | passed | diagnostic |
| `git status --short --untracked-files=all -- ':!docs/audits/full-project-health-v1/**' ':!docs/superpowers/plans/2026-04-27-full-project-health-audit-v1-conductor.md' ':!.context/audits/full-project-health-v1/**'` | passed | diagnostic |
| `jq '.scripts | with_entries(select(.key|test("^(test|unused|quality|knip|review|arch|lint|type-check|security)")))' package.json` | passed | diagnostic |
| `rg --files tests __tests__ scripts src/lib src/app/api src/components \| sort` | failed | diagnostic |
| `pnpm test` | passed | required |
| `pnpm unused:check` | passed | required |
| `pnpm quality:gate:fast` | passed | required |
| `node scripts/check-mutation-required.js` | passed | diagnostic |
| `pnpm test:mutation` | not-run | optional |

Notes:

- `rg --files tests __tests__ ...` failed only because there is no repo-root `__tests__` directory. Scoped `src/**/__tests__` files were still found in later scans.
- `pnpm test:mutation` was not run by policy. Full mutation should stay manual/orchestrator-authorized.
- `pnpm build` and `pnpm build:cf` were not run by this lane.

## 4. Findings

### FPH-L05-001: Product inquiry integration tests say validation is real, but mock the schema that performs it

- Severity: P1
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: tests
- Source lane: 05-tests-ai-smell-dead-code
- Evidence:
  - type: file
    reference: `src/app/api/inquiry/__tests__/inquiry-integration.test.ts:1-12`
    summary: Test header claims the internal protection chain runs real `JSON parsing + validation`.
  - type: file
    reference: `src/app/api/inquiry/__tests__/inquiry-integration.test.ts:70-83`
    summary: Same integration test mocks `productLeadSchema.safeParse` to always return `success: true`.
  - type: file
    reference: `src/app/api/inquiry/route.ts:102-118`
    summary: Production route validation depends on `productLeadSchema.safeParse`; `parsed.success === false` is the route-level validation failure branch.
  - type: file
    reference: `src/app/api/inquiry/__tests__/route.test.ts:49-63`
    summary: The route unit test also mocks `productLeadSchema.safeParse` to always succeed.
  - type: file
    reference: `src/lib/lead-pipeline/__tests__/lead-schema.test.ts:152-194`
    summary: Schema rules are tested separately, but this does not prove the API route wires real schema validation into `/api/inquiry`.
- Business impact: Product inquiry is one of the main buyer contact paths. The current tests can go green even if route-level product inquiry validation is accidentally bypassed, reordered, or mapped to the wrong error response. That is a real pre-launch regression risk for lead quality and abuse control.
- Root cause: Internal code was mocked to make the route tests easy and stable. The test name then drifted into claiming more than it proves.
- Recommended fix: Delete the `productLeadSchema` mock from the inquiry route/integration tests, keep only external services mocked, and add at least one invalid product inquiry request that proves the route returns `INQUIRY_VALIDATION_FAILED` before `processLead` is called.
- Verification needed: Run targeted `pnpm exec vitest run src/app/api/inquiry/__tests__/inquiry-integration.test.ts src/app/api/inquiry/__tests__/route.test.ts`, then run `pnpm test:lead-family` and `pnpm test`.
- Suggested Linus Gate: Simplify

### FPH-L05-002: `unused:check` is green, but Knip is configured so broad that dead component/lib files can look alive

- Severity: P2
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: dead-code
- Source lane: 05-tests-ai-smell-dead-code
- Evidence:
  - type: command
    reference: `pnpm unused:check`, output in `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/pnpm-unused-check.txt`
    summary: Knip passes with no reported unused files/exports.
  - type: file
    reference: `knip.jsonc:8-16`
    summary: Knip `entry` includes broad `src/components/**/*.{ts,tsx}` and `src/lib/**/*.{ts,tsx}`, making every component/lib file an entry rather than something whose reachability is proven from app roots.
  - type: file
    reference: `knip.jsonc:18-22`
    summary: Knip project scope also scans `src`, scripts, and tests, but broad entries weaken dead-code detection inside the main source tree.
  - type: file
    reference: `src/components/blocks/_templates/BLOCK_TEMPLATE.tsx:1-16`
    summary: A copy-only development template lives under `src/components` with placeholder guidance; it is not production behavior and should be handled by an explicit ignore or moved out of production source.
  - type: file
    reference: `scripts/quality-gate.js:234`, `scripts/quality-gate.js:1416`
    summary: Separate quality gate code already treats `src/components/blocks/_templates/**` as a template/no-runtime area, confirming it should not be counted as a normal live component entry.
- Business impact: The owner can see "unused check passed" and think dead code is under control, while stale source files or exports under `src/components` and `src/lib` can be kept alive by configuration rather than real imports. This makes cleanup and future review more expensive.
- Root cause: File-system routing and false-positive avoidance were solved by making too much of `src` an entrypoint. That trades false positives for blind spots.
- Recommended fix: Narrow Knip entries to true app/router/config/script roots, explicitly ignore documented template folders, and let `src/components` / `src/lib` be checked through actual imports. If broad entrypoints are still needed, split `unused:check` into "strict production reachability" and "loose all-source sanity".
- Verification needed: Adjust Knip config in a repair branch, run `pnpm unused:check` and `pnpm unused:production`, then manually inspect any newly surfaced unused files before deleting or moving to Trash.
- Suggested Linus Gate: Simplify

### FPH-L05-003: Mutation freshness guard can recommend a package script that does not exist

- Severity: P2
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: tests
- Source lane: 05-tests-ai-smell-dead-code
- Evidence:
  - type: file
    reference: `scripts/check-mutation-required.js:107-128`
    summary: When both `src/lib/lead-pipeline/` and `src/lib/security/` are touched, the helper recommends `pnpm test:mutation:lead-security`.
  - type: file
    reference: `tests/unit/scripts/check-mutation-required.test.ts:155-184`
    summary: The unit test locks in the same missing command recommendation.
  - type: file
    reference: `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/package-mutation-scripts.txt`
    summary: Existing package mutation scripts are `test:mutation`, `test:mutation:form-schema`, `test:mutation:idempotency`, `test:mutation:lead`, and `test:mutation:security`; no `test:mutation:lead-security` exists.
  - type: command
    reference: `node scripts/check-mutation-required.js`, output in `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/check-mutation-required.txt`
    summary: Current clean baseline skips freshness enforcement because protected source dirs were not changed, so the missing-command path did not execute in this run.
- Business impact: The next branch that changes both lead-pipeline and security code can fail the mutation freshness guard with an instruction the team cannot run. That turns a useful safety gate into friction at exactly the high-risk moment.
- Root cause: The helper's suggested command drifted from `package.json`. The test verifies the drift instead of preventing it.
- Recommended fix: Either add a real `test:mutation:lead-security` script, or change the helper to recommend existing commands, for example `pnpm test:mutation:lead && pnpm test:mutation:security` or `pnpm test:mutation`.
- Verification needed: Add a test that compares suggested commands against `package.json` scripts, then run `pnpm exec vitest run tests/unit/scripts/check-mutation-required.test.ts` and `node scripts/check-mutation-required.js`.
- Suggested Linus Gate: Simplify

### FPH-L05-004: Contact form Playwright smoke has an accessibility assertion that always passes

- Severity: P2
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: tests
- Source lane: 05-tests-ai-smell-dead-code
- Evidence:
  - type: file
    reference: `tests/e2e/contact-form-smoke.spec.ts:362-376`
    summary: The ARIA test computes `hasAriaDescribedBy`, then asserts `expect(hasAriaDescribedBy !== null || true).toBeTruthy()`, which is always true.
  - type: file
    reference: `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/surface-assertion-scan.txt`
    summary: The tautology was found in the surface assertion scan alongside other weak assertion patterns.
- Business impact: The contact form can lose the specific ARIA relationship this test claims to protect and the test will still pass. This weakens accessibility confidence on a lead-capture page.
- Root cause: A vague acceptance rule ("ARIA or something equivalent") was encoded as `|| true` instead of a real behavior check.
- Recommended fix: Replace the assertion with a concrete check, such as "email input has `aria-describedby` that points to an existing helper/error element", or delete the test if that behavior is not required.
- Verification needed: Run `pnpm test:e2e` or the narrower manual command `pnpm exec playwright test tests/e2e/contact-form-smoke.spec.ts --project=chromium` after the assertion is fixed.
- Suggested Linus Gate: Delete

### FPH-L05-005: UI primitive tests are over-expanded relative to buyer-flow proof

- Severity: P3
- Evidence level: Confirmed by static evidence
- Confidence: medium
- Domain: ai-smell
- Source lane: 05-tests-ai-smell-dead-code
- Evidence:
  - type: file
    reference: `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/ui-primitive-tests.txt`
    summary: There are 97 test files under `src/components/ui/__tests__`.
  - type: file
    reference: `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/ui-primitive-source-files.txt`
    summary: There are 23 source files directly under `src/components/ui`.
  - type: file
    reference: `docs/audits/full-project-health-v1/evidence/05-tests-ai-smell-dead-code/surface-assertion-scan.txt`
    summary: The wider test suite contains 321 lines matching weak assertion or surface-rendering patterns.
- Business impact: This does not directly break the website, but it creates a "lots of tests" illusion. Review time goes into primitive permutations while the highest-value proof should stay focused on inquiry, navigation, i18n, SEO, and buyer-visible conversion flows.
- Root cause: AI-style exhaustive matrix generation: many `basic`, `core`, `advanced`, `integration`, and accessibility permutations for low-level primitives, instead of fewer behavior contracts tied to real product pages.
- Recommended fix: Do not add more primitive permutation tests by default. Consolidate duplicate primitive tests when touching those components, and shift new proof budget toward buyer flows and route-level contracts.
- Verification needed: After cleanup, run `pnpm test`, compare test count/runtime, and ensure the buyer-flow targeted suites still pass.
- Suggested Linus Gate: Delete

## 5. Blocked / Not Proven

| Claim | Blocker | Needed proof | Suggested classification |
| --- | --- | --- | --- |
| Current mutation score for protected lead/security/form-schema code | Full mutation testing is explicitly not authorized for automatic lane execution. No `reports/mutation/mutation-report.json` exists in this workspace. | Manual/orchestrator command: `pnpm test:mutation` or scoped commands `pnpm test:mutation:lead`, `pnpm test:mutation:security`, `pnpm test:mutation:form-schema`. | Blocked |
| Playwright e2e status for contact, navigation, visual, and post-deploy smoke | Lane did not run e2e/browser suites; they are outside the required fresh command set and may need local browser/server setup. | `pnpm test:e2e`, `pnpm test:release-smoke`, or narrower Playwright commands selected by orchestrator. | Needs proof |
| Production Turnstile / Resend / Airtable end-to-end delivery | Requires safe credentials and non-production mutation boundary; this lane is read-only and does not perform external writes. | Credentialed staging smoke with controlled canary lead, plus service dashboard evidence. | Blocked |
| Coverage gate status | `pnpm quality:gate:fast` explicitly skipped coverage. | `pnpm test:coverage` or full `pnpm quality:gate` if orchestrator wants coverage evidence. | Needs proof |

## 6. Handoff to Orchestrator

| Finding ID | Handoff action | Reason |
| --- | --- | --- |
| FPH-L05-001 | keep | Highest-value Lane 05 issue: critical product inquiry route proof says validation is real while mocking the schema. Challenge only if another lane has fresh route-level validation proof with the real schema. |
| FPH-L05-002 | keep | Dead-code gate is green but configured with broad source entries; this should be merged with any architecture/process finding about fake-green guardrails. |
| FPH-L05-003 | keep | Small but concrete proof-chain defect; exact missing script is confirmed. |
| FPH-L05-004 | keep | Exact tautology in contact-form e2e; low repair cost and high clarity. |
| FPH-L05-005 | challenge | It is a real AI-smell signal, but severity should stay P3 unless the orchestrator ties it to runtime cost, flake rate, or missed buyer-flow regressions. |

## 7. Process Notes

- I did not run `pnpm build`, `pnpm build:cf`, deploy commands, production write commands, or full mutation.
- I did not modify business code, tests, scripts, config, dependency files, workflows, content, or public assets.
- `pnpm test`, `pnpm unused:check`, and `pnpm quality:gate:fast` all passed. That is useful baseline evidence, but it does not erase the proof-quality findings above.
- The strongest regression-prevention tests found in this lane are the schema tests, idempotency contracts, rate-limit key strategy tests, route parsing property tests, and lead-family protection/contract tests. The weakest tests are the tautological contact-form ARIA check and broad surface-rendering/UI primitive permutations.

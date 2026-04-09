# Cloudflare Official Alignment Series

## TL;DR

> **Quick Summary**: Keep Tianze on Next.js + OpenNext + Cloudflare, but systematically shrink repo-local Cloudflare deviations so the project behaves as close as practical to stock OpenNext without changing topology or gambling on major upgrades.
>
> **Deliverables**:
> - One documented baseline for current Cloudflare adaptation and proof boundaries
> - A ranked retirement plan for repo-local Cloudflare patches and wrappers
> - A retained-exception register for items that cannot yet be removed safely
> - A proof-preserving official-alignment series with atomic checkpoints
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 0 -> Task 1 -> Task 4 -> Task 6 -> Task 8 -> Final Verification

---

## Context

### Original Request
The user wants to turn Cloudflare optimization into a series task set, make Tianze as close as practical to official OpenNext usage, and optimize Cloudflare adaptation without using a big-bang rewrite.

### Interview Summary
**Key Discussions**:
- Keep the platform direction: Next.js + OpenNext + Cloudflare.
- This is a series effort, not a one-off patch cleanup.
- Scope includes both build/deploy adaptation and proof workflow alignment.
- Progress must be measured by both patch reduction and proof stability.
- Retained exceptions must be documented explicitly rather than force-removed.

**Research Findings**:
- Most comparable Next.js + Cloudflare projects stay close to stock OpenNext CLI usage.
- Tianze currently carries unusually heavy repo-local Cloudflare patching compared with peer projects.
- At least one manifest-related patch appears already absorbed upstream and is a low-risk early retirement candidate.
- Current build/proof boundaries in this repo are nuanced; local preview is a useful signal but not final deployed truth.

### Metis Review
**Identified Gaps** (addressed):
- “Closer to official” was too vague -> now defined as reduced repo-local deviation plus preserved proof boundaries.
- Scope-creep risk was high -> phase6 topology, worker regrouping, middleware->proxy, minify reopening, platform switch, and version gambles are now explicit exclusions.
- Acceptance criteria needed to be executable -> every task below uses command/tool-based criteria only.
- Hidden risk of overclaiming preview/build success -> plan now treats build, preview proof, and deployed proof as separate signals.

---

## Work Objectives

### Core Objective
Reduce Tianze’s Cloudflare-specific divergence from official OpenNext behavior as far as safely possible while preserving the current production-proof boundaries and avoiding forbidden architecture changes.

### Concrete Deliverables
- `docs/guides/CLOUDFLARE-DEPLOYMENT-ASSESSMENT.md`
- `docs/guides/CLOUDFLARE-OFFICIAL-ALIGNMENT-RUNBOOK.md`
- Updated `.sisyphus` execution trail for Cloudflare official-alignment work
- Reduced or narrowed repo-local Cloudflare patch surface where safely proven
- Documented retained exception list for remaining non-removable Cloudflare adaptations

### Definition of Done
- [ ] Official-alignment criteria are documented and referenced by the execution runbook
- [ ] Every repo-local Cloudflare patch/wrapper is classified as retire / retain / defer with evidence
- [ ] At least the current obvious upstream-absorbed patch candidate is attempted using proof-preserving gates
- [ ] Proof boundaries remain explicit: build, preview-page, and deployed smoke are not conflated
- [ ] No forbidden scope items are touched

### Must Have
- Official-alignment work must stay on the current platform and topology
- Proof workflow alignment must be part of the series, not an afterthought
- Each change must be atomic and independently revertable
- Remaining deviations must be documented, not hand-waved

### Must NOT Have (Guardrails)
- No phase6 topology rewrite or worker regrouping
- No middleware -> proxy migration
- No reopening minify
- No platform switch or large version gamble during patch-retirement waves
- No claiming deployed truth from local preview alone

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: Tests-after
- **Framework**: repo-native command mix (`pnpm build`, `pnpm build:cf`, smoke scripts, checker scripts)
- **TDD rule for this series**: for patch-removal tasks, use dry-run / checker outputs as the “RED/GREEN” signal before broader build and smoke verification

### QA Policy
Every task must prove two things:
1. The repo is closer to official OpenNext usage or clearer about why it cannot be.
2. Existing proof boundaries did not silently degrade.

- **Evidence workspace**: create `.sisyphus/evidence/` before redirecting any QA output there.
- **Build proof**: use plain `pnpm build:cf` only if no retained generated-artifact patch still requires the compat layer; otherwise use `CF_APPLY_GENERATED_PATCH=true pnpm build:cf`.
- **Preview proof**: start preview with the same mode as build proof (plain or `CF_APPLY_GENERATED_PATCH=true`) before running `pnpm smoke:cf:preview`.
- **Deploy proof**: where applicable, use the repo’s deployed smoke path rather than inferring from preview
- **Contract proof**: execute any relevant `scripts/cloudflare/*contract*.mjs` checks
- **Patch proof**: use `node scripts/cloudflare/patch-prefetch-hints-manifest.mjs --dry-run` as a removable/not-removable signal where relevant

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Start Immediately - baseline and classification):
├── Task 0: Create evidence workspace and capture current proof mode baseline [quick]
├── Task 1: Define official-alignment rubric and proof vocabulary [writing]
├── Task 2: Inventory all repo-local Cloudflare deviations [deep]
├── Task 3: Build proof matrix for build/preview/deploy boundaries [deep]
└── Task 4: Create retained-exception register structure [writing]

Wave 2 (After Wave 1 - low-risk alignment):
├── Task 5: Publish deployment assessment doc [writing]
├── Task 6: Attempt retirement of upstream-absorbed manifest-guard patch [unspecified-high]
└── Task 7: Align wrapper/script behavior documentation with official entrypoints [writing]

Wave 3 (After Wave 2 - medium-risk narrowing):
├── Task 8: Audit remaining generated-artifact patches one-by-one [deep]
├── Task 9: Audit cache/alias/preview exception contracts against current reality [deep]
└── Task 10: Evaluate stock-command convergence opportunities without changing topology [unspecified-high]

Wave 4 (After Wave 3 - consolidation):
├── Task 11: Convert findings into ordered execution runbook [writing]
├── Task 12: Freeze retained exceptions and deferrals with evidence [writing]
└── Task 13: Prepare follow-on backlog for future official-alignment waves [writing]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Documentation and command-quality review (unspecified-high)
├── Task F3: Real QA execution of documented proof commands (unspecified-high)
└── Task F4: Scope fidelity and anti-creep review (deep)

Critical Path: Task 0 -> Task 1 -> Task 4 -> Task 6 -> Task 8 -> Task 11 -> Final Verification

### Dependency Matrix

- **0**: none -> 1, 3, 6, 11, F3
- **1**: 0 -> 5, 7, 11
- **2**: none -> 6, 8, 9, 10, 12
- **3**: 0 -> 6, 8, 10, 11
- **4**: none -> 12, 13
- **5**: 1 -> 11, 13
- **6**: 0, 2, 3, 4 -> 8, 12
- **7**: 1 -> 10, 11
- **8**: 2, 3, 6 -> 11, 12, 13
- **9**: 2 -> 11, 12
- **10**: 2, 3, 7 -> 11, 13
- **11**: 0, 1, 3, 5, 7, 8, 9, 10 -> F1-F4
- **12**: 2, 4, 6, 8, 9 -> F1-F4
- **13**: 4, 5, 8, 10 -> F1-F4

### Agent Dispatch Summary

- **Wave 1**: T0 `quick`, T1 `writing`, T2 `deep`, T3 `deep`, T4 `writing`
- **Wave 2**: T5 `writing`, T6 `unspecified-high`, T7 `writing`
- **Wave 3**: T8 `deep`, T9 `deep`, T10 `unspecified-high`
- **Wave 4**: T11 `writing`, T12 `writing`, T13 `writing`
- **FINAL**: F1 `oracle`, F2 `unspecified-high`, F3 `unspecified-high`, F4 `deep`

---

## TODOs

- [ ] 0. Create evidence workspace and capture current proof-mode baseline

  **What to do**:
  - Create `.sisyphus/evidence/` and any needed subfolders before any QA redirection happens.
  - Capture the current repo truth for `build:cf`, `preview:cf`, and compat-patch application mode.
  - Record whether plain or `CF_APPLY_GENERATED_PATCH=true` command mode is required at baseline.

  **Must NOT do**:
  - Do not assume `.sisyphus/evidence/` already exists.
  - Do not hard-code plain `build:cf` as universal truth if retained patches still require compat mode.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small but mandatory setup and baseline capture.
  - **Skills**: [`technical-writer`]
    - `technical-writer`: Needed to record the baseline mode clearly.
  - **Skills Evaluated but Omitted**:
    - `verify`: Useful later, but this task is workspace/setup first.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4)
  - **Blocks**: 1, 3, 6, 11, F3
  - **Blocked By**: None

  **References**:
  - `.sisyphus/` - Existing planning workspace layout.
  - `package.json` - Current script entrypoints for build/preview commands.
  - `scripts/cloudflare/build-webpack.mjs` - Current fail-closed build behavior.

  **Acceptance Criteria**:
  - [ ] `.sisyphus/evidence/` exists before any later QA command redirects into it.
  - [ ] Baseline notes explicitly state whether plain or compat-mode Cloudflare commands are required at current repo state.

  **QA Scenarios**:
  ```
  Scenario: Evidence workspace is created before QA begins
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run `mkdir -p .sisyphus/evidence .sisyphus/evidence/final-qa`.
      2. Run `test -d .sisyphus/evidence && test -d .sisyphus/evidence/final-qa`.
    Expected Result: Evidence directories exist for all later command redirections.
    Evidence: .sisyphus/evidence/task-0-workspace.txt

  Scenario: Baseline command mode is recorded
    Tool: Bash (python/readback)
    Preconditions: Workspace exists
    Steps:
      1. Read baseline notes in the assessment/runbook draft.
      2. Assert they state whether current Cloudflare proof uses plain commands or `CF_APPLY_GENERATED_PATCH=true`.
    Expected Result: Later tasks know which proof mode to use.
    Evidence: .sisyphus/evidence/task-0-baseline.txt
  ```

  **Commit**: YES
  - Message: `docs(cloudflare): add evidence workspace and proof baseline`

- [ ] 1. Define official-alignment rubric and proof vocabulary

  **What to do**:
  - Define the repo-wide meaning of “closer to official OpenNext”.
  - Separate build proof, preview proof, and deployed proof vocabulary.
  - Write explicit anti-overclaim rules for future Cloudflare work.

  **Must NOT do**:
  - Do not redefine deployed truth using local preview only.
  - Do not introduce platform or topology changes.

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: This is a definitions and policy task.
  - **Skills**: [`technical-writer`]
    - `technical-writer`: Needed for precise operational language.
  - **Skills Evaluated but Omitted**:
    - `seo-audit`: Not relevant to deployment planning.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: 5, 7, 11
  - **Blocked By**: None

  **References**:
  - `AGENTS.md` - Existing project truth rules for Cloudflare proof boundaries.
  - `README.md` - Current public description of build/proof commands.
  - `docs/guides/CANONICAL-TRUTH-REGISTRY.md` - Current truth-source framing to stay consistent with.

  **Acceptance Criteria**:
  - [ ] Rubric is written into the assessment/runbook docs.
  - [ ] Build vs preview vs deploy proof language is explicitly separated.

  **QA Scenarios**:
  ```
  Scenario: Official-alignment definitions render in docs
    Tool: Bash (python/readback)
    Preconditions: Draft docs created
    Steps:
      1. Read the target doc sections containing rubric text.
      2. Assert the text includes "build", "preview", and "deploy" as separate proof surfaces.
      3. Assert the text includes an anti-overclaim rule about local preview.
    Expected Result: Clear, separate proof vocabulary exists.
    Failure Indicators: Missing proof-surface split or missing anti-overclaim wording.
    Evidence: .sisyphus/evidence/task-1-rubric-proof.txt

  Scenario: Scope guardrails remain explicit
    Tool: Bash (python/readback)
    Preconditions: Same docs updated
    Steps:
      1. Read the exclusions section.
      2. Assert it names phase6 topology, middleware->proxy, minify, and platform switch.
    Expected Result: Forbidden scope is explicit.
    Evidence: .sisyphus/evidence/task-1-guardrails.txt
  ```

  **Commit**: YES
  - Message: `docs(cloudflare): define official alignment rubric`

- [ ] 2. Inventory all repo-local Cloudflare deviations

  **What to do**:
  - Produce a complete inventory of repo-local Cloudflare patches, wrappers, and exception contracts.
  - Classify each item as patch, wrapper, checker, proof script, or retained exception.
  - Map each item to the official OpenNext behavior it deviates from.

  **Must NOT do**:
  - Do not retire anything in this task.
  - Do not infer official parity without code/doc evidence.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Cross-file technical census with classification.
  - **Skills**: [`next-best-practices`]
    - `next-best-practices`: Helpful for mapping against official framework usage patterns.
  - **Skills Evaluated but Omitted**:
    - `verify`: This task is inventory-first, not proof-first.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: 6, 8, 9, 10, 12
  - **Blocked By**: None

  **References**:
  - `scripts/cloudflare/patch-prefetch-hints-manifest.mjs` - Main patch surface.
  - `scripts/cloudflare/*.mjs` - Wrapper/checker surfaces.
  - `open-next.config.ts` - Current OpenNext config truth.
  - `package.json` - Current command entrypoints.

  **Acceptance Criteria**:
  - [ ] Every repo-local Cloudflare deviation is listed once.
  - [ ] Each item includes category, current purpose, and tentative retire/retain/defer status.

  **QA Scenarios**:
  ```
  Scenario: Inventory covers all known Cloudflare adaptation files
    Tool: Bash (python/readback)
    Preconditions: Assessment draft exists
    Steps:
      1. Read the inventory section.
      2. Assert it includes patch file, build wrapper, deploy wrapper, and exception-contract files.
      3. Assert each entry has a status field.
    Expected Result: No major Cloudflare adaptation surface is omitted.
    Evidence: .sisyphus/evidence/task-2-inventory.txt

  Scenario: Inventory does not overclaim retirement
    Tool: Bash (python/readback)
    Preconditions: Same section exists
    Steps:
      1. Read all statuses marked retire.
      2. Assert each retire candidate cites evidence or upstream absorption rationale.
    Expected Result: Retirement candidates are evidence-backed.
    Evidence: .sisyphus/evidence/task-2-retire-check.txt
  ```

  **Commit**: YES
  - Message: `docs(cloudflare): inventory repo-local deviations`

- [ ] 3. Build proof matrix for build, preview, and deploy boundaries

  **What to do**:
  - Document which commands prove what today.
  - Separate page-level preview proof from deployed API proof.
  - Record known false-positive/false-negative boundaries.

  **Must NOT do**:
  - Do not collapse all proof into one “green build” concept.
  - Do not treat local preview as production proof.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires operational reasoning across multiple proof paths.
  - **Skills**: [`technical-writer`]
    - `technical-writer`: Needed to make proof boundaries unambiguous.
  - **Skills Evaluated but Omitted**:
    - `testing-qa`: Helpful later, but this is proof taxonomy first.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: 6, 8, 10, 11
  - **Blocked By**: None

  **References**:
  - `README.md` - Current exposed commands.
  - `AGENTS.md` - Existing warnings about preview vs deployed truth.
  - `docs/guides/QUALITY-PROOF-LEVELS.md` - Existing quality/proof framing.
  - `docs/guides/RELEASE-PROOF-RUNBOOK.md` - Current release gate flow.

  **Acceptance Criteria**:
  - [ ] A matrix exists showing command -> proof surface -> limitation.
  - [ ] Preview and deploy proof are explicitly distinguished.

  **QA Scenarios**:
  ```
  Scenario: Proof matrix covers all major commands
    Tool: Bash (python/readback)
    Preconditions: Proof matrix written
    Steps:
      1. Read the matrix.
      2. Assert it includes `pnpm build`, `pnpm build:cf`, `pnpm smoke:cf:preview`, and deployed smoke.
      3. Assert each row has a limitation column.
    Expected Result: Proof matrix is complete and bounded.
    Evidence: .sisyphus/evidence/task-3-proof-matrix.txt

  Scenario: Preview/deploy distinction is explicit
    Tool: Bash (python/readback)
    Preconditions: Same matrix exists
    Steps:
      1. Search for wording that preview is a local signal.
      2. Search for wording that deployed smoke is final truth for deployed behavior.
    Expected Result: No ambiguity between local and deployed proof.
    Evidence: .sisyphus/evidence/task-3-proof-boundary.txt
  ```

  **Commit**: YES
  - Message: `docs(cloudflare): document proof matrix`

- [ ] 4. Create retained-exception register structure

  **What to do**:
  - Define a durable format for retained Cloudflare exceptions.
  - Include reason, blocker type, proof impact, and reevaluation trigger.
  - Ensure this register can absorb failed retirement attempts without confusion.

  **Must NOT do**:
  - Do not present retained exceptions as accidental leftovers.
  - Do not leave entries without reevaluation triggers.

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: This is a documentation and governance structure task.
  - **Skills**: [`technical-writer`]
    - `technical-writer`: Needed for stable operational templates.
  - **Skills Evaluated but Omitted**:
    - `config-manager`: No runtime config changes needed.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: 12, 13
  - **Blocked By**: None

  **References**:
  - `scripts/cloudflare/*exception-contract*.mjs` - Existing exception concepts.
  - `AGENTS.md` - Existing Cloudflare issue taxonomy and caution rules.

  **Acceptance Criteria**:
  - [ ] Register template includes status, reason, proof impact, and revisit trigger.
  - [ ] Template is referenced from the runbook/assessment docs.

  **QA Scenarios**:
  ```
  Scenario: Exception register fields are complete
    Tool: Bash (python/readback)
    Preconditions: Register template written
    Steps:
      1. Read the retained-exception template.
      2. Assert it contains fields for reason, blocker type, proof impact, and revisit trigger.
    Expected Result: Retained exceptions are actionable, not vague.
    Evidence: .sisyphus/evidence/task-4-register-template.txt

  Scenario: Failed retirements can be recorded cleanly
    Tool: Bash (python/readback)
    Preconditions: Same template exists
    Steps:
      1. Verify the template has a place for attempted evidence and failure outcome.
    Expected Result: Failed retirements become documented debt, not hidden regressions.
    Evidence: .sisyphus/evidence/task-4-failed-retirement.txt
  ```

  **Commit**: YES
  - Message: `docs(cloudflare): add retained exception register`

- [ ] 5. Publish deployment assessment document

  **What to do**:
  - Write the comprehensive assessment comparing current Tianze behavior with stock OpenNext patterns.
  - Summarize ecosystem findings, current deviation surface, and recommended sequence.
  - Explain why gradual official alignment is preferred over big-bang change.

  **Must NOT do**:
  - Do not oversell stock OpenNext as a magic fix.
  - Do not recommend forbidden-scope changes in the main path.

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Main analytical deliverable.
  - **Skills**: [`technical-writer`]
    - `technical-writer`: Needed for a decision-quality report.
  - **Skills Evaluated but Omitted**:
    - `deep-research`: Research already exists; synthesis is the focus.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7)
  - **Blocks**: 11, 13
  - **Blocked By**: 1

  **References**:
  - Wave 1 outputs
  - Existing research summary in `.sisyphus/drafts/cloudflare-official-alignment.md`

  **Acceptance Criteria**:
  - [ ] Assessment names current deviations, priorities, and exclusions.
  - [ ] Assessment explains practical value in plain language.

  **QA Scenarios**:
  ```
  Scenario: Assessment includes required sections
    Tool: Bash (python/readback)
    Preconditions: Assessment doc written
    Steps:
      1. Read headings.
      2. Assert sections exist for ecosystem findings, Tianze deviation map, recommended sequence, and out-of-scope items.
    Expected Result: Assessment is complete enough for decisions.
    Evidence: .sisyphus/evidence/task-5-assessment-sections.txt

  Scenario: Assessment avoids overclaiming
    Tool: Bash (python/readback)
    Preconditions: Same doc exists
    Steps:
      1. Search for language implying preview equals deploy truth.
      2. Assert such language is absent.
    Expected Result: Assessment stays within validated boundaries.
    Evidence: .sisyphus/evidence/task-5-overclaim-check.txt
  ```

  **Commit**: YES
  - Message: `docs(cloudflare): publish deployment assessment`

- [ ] 6. Attempt retirement of the upstream-absorbed manifest-guard patch

  **What to do**:
  - Remove the known low-risk candidate only.
  - Use dry-run/build/proof gates to validate whether it is truly redundant now.
  - If removal fails, document it in the retained-exception register instead of forcing it.

  **Must NOT do**:
  - Do not remove unrelated patches in the same task.
  - Do not bump platform versions here.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Code-path retirement with proof gates.
  - **Skills**: [`debugging`]
    - `debugging`: Needed to isolate failure if the retirement is not clean.
  - **Skills Evaluated but Omitted**:
    - `verify`: Useful, but the repo-specific gate sequence matters more.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 7)
  - **Blocks**: 8, 12
  - **Blocked By**: 2, 3

  **References**:
  - `scripts/cloudflare/patch-prefetch-hints-manifest.mjs` - Patch target.
  - Proof matrix from Task 3.
  - Exception register from Task 4.

  **Acceptance Criteria**:
  - [ ] The retirement attempt explicitly tests **target patch removed, remaining patches still available**.
  - [ ] `node scripts/cloudflare/patch-prefetch-hints-manifest.mjs --dry-run` is captured before and after the target-only removal attempt.
  - [ ] `pnpm clean:next-artifacts && pnpm build` passes.
  - [ ] `CF_APPLY_GENERATED_PATCH=true pnpm build:cf` passes while other required patches remain applied.
  - [ ] `pnpm smoke:cf:preview` preserves current page-level proof.
  - [ ] If retirement fails, the failure is documented instead of hidden.

  **QA Scenarios**:
  ```
  Scenario: Target patch can be retired while remaining compat patches still apply
    Tool: Bash
    Preconditions: Only the manifest-guard candidate is removed from the patch script; remaining patch logic is untouched
    Steps:
      1. Run `node scripts/cloudflare/patch-prefetch-hints-manifest.mjs --dry-run > .sisyphus/evidence/task-6-dry-run-before.txt || true` before the change and capture the reported planned/applied state.
      2. Apply the target-only retirement change.
      3. Run `node scripts/cloudflare/patch-prefetch-hints-manifest.mjs --dry-run > .sisyphus/evidence/task-6-dry-run-after.txt || true` and confirm the target patch is no longer required while any still-needed patches remain visible.
      4. Run `pnpm clean:next-artifacts && pnpm build > .sisyphus/evidence/task-6-build.txt 2>&1`.
      5. Run `CF_APPLY_GENERATED_PATCH=true pnpm build:cf > .sisyphus/evidence/task-6-build-cf.txt 2>&1` so the generated-artifact compatibility layer still applies any remaining non-retired patches.
      6. Start the local preview server using `CF_APPLY_GENERATED_PATCH=true pnpm preview:cf > .sisyphus/evidence/task-6-preview-server.txt 2>&1` in a persistent tmux/background session and wait until the preview endpoint is reachable.
      7. Run `pnpm smoke:cf:preview > .sisyphus/evidence/task-6-preview.txt 2>&1` against that running preview target.
    Expected Result: The target patch is no longer required, the remaining compat patches still bridge any other gaps, and build/preview proof stays green.
    Failure Indicators: Dry-run still requires the target patch, `build:cf` fails even with `CF_APPLY_GENERATED_PATCH=true`, or preview proof regresses.
    Evidence: .sisyphus/evidence/task-6-retire-patch.txt

  Scenario: Failed retirement is documented, not forced
    Tool: Bash (python/readback)
    Preconditions: Retirement did not pass all gates
    Steps:
      1. Read retained-exception register entry for this patch.
      2. Assert it contains before/after dry-run evidence, failed command output paths, and a reevaluation trigger.
    Expected Result: Failure becomes explicit technical debt.
    Evidence: .sisyphus/evidence/task-6-retain-doc.txt
  ```

  **Commit**: YES
  - Message: `refactor(cloudflare): retire manifest guard patch if redundant`

- [ ] 7. Align wrapper and script behavior documentation with official entrypoints

  **What to do**:
  - Document where the repo follows official OpenNext entrypoints and where it diverges.
  - Clarify why current wrappers exist and which are candidates for future convergence.
  - Make stock-command convergence a documented objective, not an implied one.

  **Must NOT do**:
  - Do not remove wrappers in this documentation task.
  - Do not claim wrapper removal is safe without proof.

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Clarification and convergence documentation.
  - **Skills**: [`technical-writer`]
    - `technical-writer`: Needed for operational explanation.
  - **Skills Evaluated but Omitted**:
    - `next-upgrade`: No upgrade work is in scope.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: 10, 11
  - **Blocked By**: 1

  **References**:
  - `package.json`
  - `scripts/cloudflare/build-webpack.mjs`
  - `open-next.config.ts`

  **Acceptance Criteria**:
  - [ ] Documentation names official entrypoints and current repo-specific wrappers.
  - [ ] Future convergence opportunities are listed without changing behavior yet.

  **QA Scenarios**:
  ```
  Scenario: Wrapper doc covers official vs repo-specific paths
    Tool: Bash (python/readback)
    Preconditions: Wrapper documentation written
    Steps:
      1. Read the section comparing stock vs repo-specific commands.
      2. Assert both official entrypoints and current wrappers are named.
    Expected Result: Readers can see where the repo diverges today.
    Evidence: .sisyphus/evidence/task-7-wrapper-doc.txt

  Scenario: Documentation does not overpromise convergence
    Tool: Bash (python/readback)
    Preconditions: Same doc exists
    Steps:
      1. Search for unconditional claims that wrappers can be removed now.
      2. Assert such claims are absent unless backed by proof language.
    Expected Result: Convergence remains evidence-led.
    Evidence: .sisyphus/evidence/task-7-no-overpromise.txt
  ```

  **Commit**: YES
  - Message: `docs(cloudflare): document wrapper convergence path`


- [ ] 8. Audit remaining generated-artifact patches one-by-one

  **What to do**:
  - Inspect each remaining generated-artifact patch independently.
  - Decide whether each should be retire / retain / defer based on proof and coupling.
  - Identify which items are blocked by current topology or upstream gaps.

  **Must NOT do**:
  - Do not batch-retire multiple risky patches without independent evidence.
  - Do not blur generated-artifact issues with platform-runtime issues.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Careful technical isolation across patch surfaces.
  - **Skills**: [`debugging`]
    - `debugging`: Needed to isolate root cause and avoid random cleanup.
  - **Skills Evaluated but Omitted**:
    - `next-upgrade`: Version movement is out of scope for this wave.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10)
  - **Blocks**: 11, 12, 13
  - **Blocked By**: 2, 3, 6

  **References**:
  - `scripts/cloudflare/patch-prefetch-hints-manifest.mjs`
  - Wave 2 outputs
  - Relevant exception-contract files

  **Acceptance Criteria**:
  - [ ] Each remaining patch has an explicit status and rationale.
  - [ ] Any attempted retirement uses dry-run/build/preview gates.
  - [ ] Blocked items identify the real blocker type.

  **QA Scenarios**:
  ```
  Scenario: Remaining patch audit is complete
    Tool: Bash (python/readback)
    Preconditions: Audit section written
    Steps:
      1. Read all remaining patch entries.
      2. Assert each has a status, rationale, and blocker or evidence field.
    Expected Result: No remaining patch is left as an unexplained mystery.
    Evidence: .sisyphus/evidence/task-8-patch-audit.txt

  Scenario: Risky patches are not silently force-retired
    Tool: Bash (python/readback)
    Preconditions: Same audit exists
    Steps:
      1. Check every retire decision.
      2. Assert it cites proof commands or documented successful results.
    Expected Result: Retirements are evidence-led.
    Evidence: .sisyphus/evidence/task-8-proof-check.txt
  ```

  **Commit**: YES
  - Message: `docs(cloudflare): audit remaining generated-artifact patches`

- [ ] 9. Audit cache, alias, and preview exception contracts against current reality

  **What to do**:
  - Compare current exception contracts with observed repo reality and proof boundaries.
  - Remove stale assumptions and tighten wording where drift exists.
  - Ensure exceptions are grouped by problem type, not folklore.

  **Must NOT do**:
  - Do not collapse different failure classes into one generic “Cloudflare issue”.
  - Do not delete exception contracts just because they are inconvenient.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires cross-checking technical policy against repo behavior.
  - **Skills**: [`technical-writer`]
    - `technical-writer`: Needed to make exception boundaries operationally clear.
  - **Skills Evaluated but Omitted**:
    - `health`: This is about repo Cloudflare truth, not Claude config drift.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 10)
  - **Blocks**: 11, 12
  - **Blocked By**: 2

  **References**:
  - `scripts/cloudflare/*exception-contract*.mjs`
  - `docs/guides/CLOUDFLARE-ISSUE-TAXONOMY.md`
  - `AGENTS.md`

  **Acceptance Criteria**:
  - [ ] Each exception contract still matches a real current boundary.
  - [ ] Stale or duplicated exception framing is removed.

  **QA Scenarios**:
  ```
  Scenario: Exception contracts map cleanly to current issue classes
    Tool: Bash (python/readback)
    Preconditions: Contract audit written
    Steps:
      1. Read the exception audit table.
      2. Assert each contract is mapped to a distinct issue type and current rationale.
    Expected Result: Exception contracts reflect current reality, not stale lore.
    Evidence: .sisyphus/evidence/task-9-contract-audit.txt

  Scenario: No exception contract is left without a proof impact statement
    Tool: Bash (python/readback)
    Preconditions: Same audit exists
    Steps:
      1. Check each contract entry for proof impact wording.
    Expected Result: Every exception explains what proof it affects.
    Evidence: .sisyphus/evidence/task-9-proof-impact.txt
  ```

  **Commit**: YES
  - Message: `docs(cloudflare): audit exception contracts`

- [ ] 10. Evaluate stock-command convergence opportunities without changing topology

  **What to do**:
  - Identify where current custom wrappers diverge from stock OpenNext command flow.
  - Evaluate which convergence opportunities are documentable now versus executable later.
  - Keep this analysis within the current topology and version envelope.

  **Must NOT do**:
  - Do not remove `--skipNextBuild` or wrapper logic in the same task unless separately proven in scope.
  - Do not convert this into a hidden architecture rewrite.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires technical evaluation of command convergence without execution drift.
  - **Skills**: [`next-best-practices`]
    - `next-best-practices`: Useful for comparing current command flow with framework norms.
  - **Skills Evaluated but Omitted**:
    - `next-upgrade`: No version leap is allowed here.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9)
  - **Blocks**: 11, 13
  - **Blocked By**: 2, 3, 7

  **References**:
  - `package.json`
  - `scripts/cloudflare/build-webpack.mjs`
  - `pnpm build:cf:turbo` pathway documentation/results

  **Acceptance Criteria**:
  - [ ] Convergence opportunities are listed with blocker type and risk level.
  - [ ] No forbidden-scope action is smuggled in as “command cleanup”.

  **QA Scenarios**:
  ```
  Scenario: Stock-command convergence list is bounded
    Tool: Bash (python/readback)
    Preconditions: Convergence analysis written
    Steps:
      1. Read all convergence candidates.
      2. Assert each candidate has risk level, blocker type, and explicit note that topology is unchanged.
    Expected Result: Convergence analysis is practical and bounded.
    Evidence: .sisyphus/evidence/task-10-convergence.txt

  Scenario: Forbidden scope is not reintroduced through command convergence
    Tool: Bash (python/readback)
    Preconditions: Same analysis exists
    Steps:
      1. Search for proposals involving worker regrouping, minify reopening, middleware->proxy, or platform switch.
      2. Assert those do not appear as active recommendations.
    Expected Result: Convergence stays within allowed scope.
    Evidence: .sisyphus/evidence/task-10-scope-check.txt
  ```

  **Commit**: YES
  - Message: `docs(cloudflare): evaluate stock command convergence`

- [ ] 11. Convert findings into an ordered official-alignment runbook

  **What to do**:
  - Turn the analysis into an execution-ready runbook with sequence, gates, rollback logic, and proof expectations.
  - Make the runbook usable by future executors without relying on chat history.
  - Include command order and evidence expectations.

  **Must NOT do**:
  - Do not leave execution order implicit.
  - Do not require humans to interpret ambiguous proof language mid-flight.

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Runbook synthesis and operational clarity.
  - **Skills**: [`technical-writer`]
    - `technical-writer`: Needed for stepwise operational guidance.
  - **Skills Evaluated but Omitted**:
    - `verify`: Runbook content comes before execution.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 12, 13)
  - **Blocks**: Final verification
  - **Blocked By**: 1, 3, 5, 7, 8, 9, 10

  **References**:
  - All prior wave outputs
  - `docs/guides/RELEASE-PROOF-RUNBOOK.md`

  **Acceptance Criteria**:
  - [ ] Runbook includes ordered tasks, commands, rollback rules, and proof expectations.
  - [ ] Runbook can stand alone without chat context.

  **QA Scenarios**:
  ```
  Scenario: Runbook is execution-ready
    Tool: Bash (python/readback)
    Preconditions: Runbook written
    Steps:
      1. Read the runbook in order.
      2. Assert each wave/task has command gates and evidence expectations.
    Expected Result: Executor can act without missing context.
    Evidence: .sisyphus/evidence/task-11-runbook.txt

  Scenario: Runbook includes rollback logic
    Tool: Bash (python/readback)
    Preconditions: Same runbook exists
    Steps:
      1. Search for rollback or failed-retirement handling in the runbook.
    Expected Result: Failure handling is explicit.
    Evidence: .sisyphus/evidence/task-11-rollback.txt
  ```

  **Commit**: YES
  - Message: `docs(cloudflare): publish official alignment runbook`

- [ ] 12. Freeze retained exceptions and deferrals with evidence

  **What to do**:
  - Finalize which deviations remain retained or deferred after this series.
  - Attach evidence, blocker type, and reevaluation trigger to each.
  - Ensure this list is stable enough for future upgrades and follow-up waves.

  **Must NOT do**:
  - Do not leave retained items without reason or trigger.
  - Do not treat a failed retirement as “not worth documenting”.

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Final governance/documentation task.
  - **Skills**: [`technical-writer`]
    - `technical-writer`: Needed for durable operational records.
  - **Skills Evaluated but Omitted**:
    - `debugging`: Root-cause work should already be done by prior tasks.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 11, 13)
  - **Blocks**: Final verification
  - **Blocked By**: 2, 6, 8, 9

  **References**:
  - Retained-exception register
  - Patch audit outputs
  - Contract audit outputs

  **Acceptance Criteria**:
  - [ ] Every retained/deferred item has evidence and a revisit trigger.
  - [ ] No unresolved Cloudflare deviation is left unclassified.

  **QA Scenarios**:
  ```
  Scenario: Retained exceptions are finalized cleanly
    Tool: Bash (python/readback)
    Preconditions: Final retained list written
    Steps:
      1. Read every retained or deferred item.
      2. Assert each has reason, evidence, proof impact, and revisit trigger.
    Expected Result: Remaining debt is explicit and governable.
    Evidence: .sisyphus/evidence/task-12-retained-final.txt

  Scenario: No drift remains between audits and retained list
    Tool: Bash (python/readback)
    Preconditions: Same list exists
    Steps:
      1. Compare retained/deferred items against earlier patch and contract audits.
      2. Assert there are no unexplained omissions.
    Expected Result: Final retained list matches prior findings.
    Evidence: .sisyphus/evidence/task-12-consistency.txt
  ```

  **Commit**: YES
  - Message: `docs(cloudflare): freeze retained exceptions`

- [ ] 13. Prepare follow-on backlog for future official-alignment waves

  **What to do**:
  - Package future work into clearly separated later-wave candidates.
  - Mark which items are blocked by forbidden scope versus simply deferred.
  - Keep the backlog actionable without polluting the current wave.

  **Must NOT do**:
  - Do not sneak forbidden scope into the active wave.
  - Do not create vague “future cleanup” placeholders.

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Backlog structuring and future-wave packaging.
  - **Skills**: [`technical-writer`]
    - `technical-writer`: Needed for clear future-wave framing.
  - **Skills Evaluated but Omitted**:
    - `next-upgrade`: Future upgrades may appear in backlog, but not as current tasks.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 11, 12)
  - **Blocks**: Final verification
  - **Blocked By**: 4, 5, 8, 10

  **References**:
  - Assessment doc
  - Runbook
  - Retained-exception register

  **Acceptance Criteria**:
  - [ ] Backlog entries are grouped by blocker type and future trigger.
  - [ ] Active wave and future wave are clearly separated.

  **QA Scenarios**:
  ```
  Scenario: Follow-on backlog is specific
    Tool: Bash (python/readback)
    Preconditions: Backlog section written
    Steps:
      1. Read each future-wave item.
      2. Assert each has blocker type, trigger, and explicit reason for not being in the current wave.
    Expected Result: Future backlog is actionable, not hand-wavy.
    Evidence: .sisyphus/evidence/task-13-backlog.txt

  Scenario: Active and future scopes remain separated
    Tool: Bash (python/readback)
    Preconditions: Same backlog exists
    Steps:
      1. Verify forbidden-scope items are listed only as future/deferred, not active.
    Expected Result: Current wave stays bounded.
    Evidence: .sisyphus/evidence/task-13-scope-separation.txt
  ```

  **Commit**: YES
  - Message: `docs(cloudflare): prepare next official alignment backlog`


---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Verify all promised deliverables exist, all exclusions were respected, and each official-alignment claim has evidence.

  **QA Scenarios**:
  ```
  Scenario: Deliverables and exclusions match the plan
    Tool: Bash (python/readback)
    Preconditions: Assessment, runbook, retained-exception outputs are present
    Steps:
      1. Read the plan deliverables section and final generated docs.
      2. Assert both target docs exist and contain the promised sections.
      3. Assert no active task output includes forbidden-scope changes.
    Expected Result: Plan promises and outputs match.
    Evidence: .sisyphus/evidence/final-f1-compliance.txt

  Scenario: Official-alignment claims are evidence-backed
    Tool: Bash (python/readback)
    Preconditions: Prior task evidence files exist
    Steps:
      1. Read every retire/retain/defer conclusion.
      2. Assert each conclusion references command output or proof evidence.
    Expected Result: No unsupported official-alignment claim remains.
    Evidence: .sisyphus/evidence/final-f1-evidence-check.txt
  ```

- [ ] F2. **Documentation and Command Quality Review** — `unspecified-high`
  Review generated docs/runbooks for accuracy, command correctness, and consistency with repo reality.

  **QA Scenarios**:
  ```
  Scenario: Commands in docs are executable and current
    Tool: Bash (python/readback)
    Preconditions: Final docs written
    Steps:
      1. Extract all fenced bash commands from the assessment/runbook.
      2. Assert they reference current repo scripts and file names.
      3. Spot-check the key commands against `package.json` and referenced files.
    Expected Result: Docs do not instruct nonexistent or stale commands.
    Evidence: .sisyphus/evidence/final-f2-command-check.txt

  Scenario: Documentation language stays within repo truth
    Tool: Bash (python/readback)
    Preconditions: Same docs exist
    Steps:
      1. Search docs for claims equating preview with deployed truth or implying forbidden-scope changes.
      2. Assert such claims are absent.
    Expected Result: Docs remain accurate and bounded.
    Evidence: .sisyphus/evidence/final-f2-language-check.txt
  ```

- [ ] F3. **Real QA Execution** — `unspecified-high`
  Execute the documented build/proof commands and confirm expected pass/fail boundaries match the plan.

  **QA Scenarios**:
  ```
  Scenario: Core proof chain matches documented expectations
    Tool: Bash
    Preconditions: Plan outputs are finalized
    Steps:
      1. Run `pnpm clean:next-artifacts && pnpm build > .sisyphus/evidence/final-f3-build.txt 2>&1`.
      2. Follow the runbook-selected Cloudflare mode: if retained generated-artifact patches still require compat mode, run `CF_APPLY_GENERATED_PATCH=true pnpm build:cf > .sisyphus/evidence/final-f3-build-cf.txt 2>&1`; otherwise run plain `pnpm build:cf > .sisyphus/evidence/final-f3-build-cf.txt 2>&1`.
      3. Start preview with the same selected mode in a persistent tmux/background session and wait until the endpoint is reachable: if no compat patches remain, run `pnpm preview:cf > .sisyphus/evidence/final-f3-preview-server.txt 2>&1`; otherwise run `CF_APPLY_GENERATED_PATCH=true pnpm preview:cf > .sisyphus/evidence/final-f3-preview-server.txt 2>&1`.
      4. Run `pnpm smoke:cf:preview > .sisyphus/evidence/final-f3-preview.txt 2>&1` against that running preview target.
    Expected Result: Observed command behavior matches the runbook’s proof expectations for the current retained/retired patch state.
    Failure Indicators: Any command result contradicts the documented proof matrix.
    Evidence: .sisyphus/evidence/final-f3-proof-run.txt

  Scenario: Patch-proof signal remains interpretable
    Tool: Bash
    Preconditions: Patch script still exists
    Steps:
      1. Run `node scripts/cloudflare/patch-prefetch-hints-manifest.mjs --dry-run > .sisyphus/evidence/final-f3-dry-run.txt 2>&1 || true`.
      2. Compare the output against the retained/retired patch conclusions in the docs.
    Expected Result: Dry-run output is consistent with documented patch status.
    Evidence: .sisyphus/evidence/final-f3-dry-run-check.txt
  ```

- [ ] F4. **Scope Fidelity Check** — `deep`
  Confirm no forbidden scope items were touched and no “closer to official” claim was achieved by weakening proof.

  **QA Scenarios**:
  ```
  Scenario: Forbidden-scope changes did not leak into active work
    Tool: Bash (python/readback)
    Preconditions: Final docs and task outputs exist
    Steps:
      1. Read active task outputs and final backlog.
      2. Assert phase6 topology rewrite, worker regrouping, middleware->proxy, minify reopening, platform switch, and big version gamble remain outside active execution.
    Expected Result: Forbidden scope stays deferred or excluded.
    Evidence: .sisyphus/evidence/final-f4-scope.txt

  Scenario: Official-alignment progress did not come from proof weakening
    Tool: Bash (python/readback)
    Preconditions: Proof matrix and final docs exist
    Steps:
      1. Compare initial proof definitions with final claims.
      2. Assert no task achieved “progress” by removing or downgrading a proof requirement.
    Expected Result: Official alignment is achieved through real convergence, not weaker verification.
    Evidence: .sisyphus/evidence/final-f4-proof-integrity.txt
  ```

---

## Commit Strategy

- One atomic commit per task or retirement attempt
- Suggested format: `docs(cloudflare): ...` for documentation tasks, `refactor(cloudflare): ...` for verified patch retirement/narrowing
- Failed retirement attempts should produce documentation commits, not force-removal commits

## Success Criteria

### Verification Commands
```bash
mkdir -p .sisyphus/evidence .sisyphus/evidence/final-qa
pnpm clean:next-artifacts && pnpm build
# If retained generated-artifact patches remain: use `CF_APPLY_GENERATED_PATCH=true pnpm build:cf` and `CF_APPLY_GENERATED_PATCH=true pnpm preview:cf`
# If no retained generated-artifact patches remain: use plain `pnpm build:cf` and `pnpm preview:cf`
node scripts/cloudflare/patch-prefetch-hints-manifest.mjs --dry-run
pnpm smoke:cf:preview
```

### Final Checklist
- [ ] Official-alignment rubric is documented
- [ ] Cloudflare deviations are fully classified
- [ ] Low-risk official-alignment change(s) attempted with evidence
- [ ] Remaining exceptions are explicitly documented
- [ ] Proof boundaries remain intact and clearly explained

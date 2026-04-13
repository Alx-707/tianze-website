# Fully Stock OpenNext on Cloudflare

## TL;DR

> **Quick Summary**: This plan targets a strict fully stock OpenNext outcome, while explicitly admitting that the current repo is not there today. The work is organized around decision gates: first prove whether a proof-preserving route is even possible; if not, decide whether to relax proof requirements or keep the repo intentionally non-stock.
>
> **Deliverables**:
> - A feasibility verdict for strict fully stock under current requirements
> - A proof-preserving route assessment
> - A proof-relaxing route assessment
> - A migration execution record for whichever route is chosen
> - Updated canonical docs, rules, and runbooks reflecting the final state
>
> **Estimated Effort**: XL
> **Parallel Execution**: YES — discovery and audit heavy early; migration later depends on gate decisions
> **Critical Path**: Baseline proof → stock feasibility spikes → Route decision → topology decision → migration execution → final proof

---

## Context

### Original Request
Create a detailed plan for becoming **strict fully stock OpenNext** on Cloudflare.

### Interview Summary
**Key Discussions**:
- The target is **strict fully stock**, not just "more stock-ish".
- `phase6` is allowed to be restructured or removed.
- The plan must analyze **two routes**:
  - **Route A**: preserve proof strength as much as possible
  - **Route B**: allow proof weakening as an explicit trade-off
- Historical reasoning suggests `phase6` likely began as a size/packaging strategy, but it now also acts as deployment/runtime topology.
- The user explicitly wants a real plan, not abstract commentary.

**Research Findings**:
- Official upstream baseline is direct `opennextjs-cloudflare build/preview/deploy` with minimal repo-local glue.
- Mainstream real-world usage is mostly **single-worker stock-ish**, not multi-worker advanced topology.
- Upstream documents multi-worker as **advanced**, not default, and not compatible with the standard deploy path.
- Current repo evidence shows only **manifest-guard** retired successfully; remaining compat patches are still load-bearing.
- Current wrapper thinning is **not safe yet** under present proof/evidence.

### Metis Review
**Identified Gaps** (addressed in this plan):
- Need explicit decision gates instead of assuming fully stock is feasible.
- Need route split between proof-preserving and proof-relaxing outcomes.
- Need stronger guardrails against scope creep (Next/TS/platform gambling, content drift, unrelated infra churn).
- Need success criteria that distinguish:
  - "strict fully stock achieved"
  - "strict fully stock not feasible under current requirements"
  - "repo should remain intentionally non-stock"

---

## Work Objectives

### Core Objective
Determine whether this repo can become **strict fully stock OpenNext on Cloudflare**, and if yes, provide/execute the narrowest credible path. If not, produce a defensible no-go conclusion that identifies the exact blocking requirements.

### Concrete Deliverables
- A strict stock feasibility audit
- A route decision between proof-preserving vs proof-relaxing stock migration
- A topology decision for `phase6` (remove, simplify, or explicitly retain)
- A completed migration plan or a formal “not feasible yet” conclusion
- Canonical docs/rules updated to the final truth

### Definition of Done
- [ ] One of these is proven with evidence:
  - strict fully stock is achievable and migrated, **or**
  - strict fully stock is not feasible under current requirements and the reasons are documented
- [ ] Final canonical build/preview/deploy path is unambiguous
- [ ] Final proof surface is explicitly defined
- [ ] No stale docs/rules contradict the chosen end-state

### Must Have
- No wishful assumptions about stock feasibility
- Real gate checks before any architecture-level migration
- Explicit trade-off analysis for proof strength, topology, and compat removal
- One unified plan file with decision branches

### Must NOT Have (Guardrails)
- No hidden Next.js / TypeScript / Node version gambles
- No silent proof degradation
- No silent platform switch
- No content / SEO / i18n scope creep
- No “fully stock” claim while repo-local compat envs or wrappers remain required in the final state

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — all verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: Tests-after / command proof
- **Framework**: repo-native build/lint/test/proof commands
- **Primary verification style**: build proof + preview proof + deploy/dry-run proof + generated artifact / topology / contract checkers

### QA Policy
Every migration stage must preserve or intentionally reclassify proof. Each decision gate must collect command evidence before moving to the next wave.

- **Build / bundling**: Bash
- **Preview / smoke**: Bash + persistent preview session
- **Config / contract validation**: checker scripts under `scripts/cloudflare/`
- **Docs/rules validation**: read + consistency checks

Evidence saved under `.sisyphus/evidence/fully-stock-*` or stage-specific task files.

---

## Execution Strategy

### Route Model
This is one unified plan with two routes.

- **Route A — Proof-Preserving Stock**
  - Only valid if strict stock can be achieved without materially weakening current proof guarantees.
- **Route B — Proof-Relaxing Stock**
  - Valid only if the team explicitly accepts weaker proof / simpler deploy behavior in exchange for stock alignment.

### Decision Gates
- **Gate G1**: Can stock build/preview work at all without repo-local compat patches?
- **Gate G2**: Can `phase6` be removed/simplified without unacceptable deployment/runtime loss?
- **Gate G3**: Is proof-preserving stock achievable?
- **Gate G4**: If not, is proof-relaxing stock acceptable?
- **Gate G5**: If not, conclude “strict fully stock not feasible under current requirements.”

### Parallel Execution Waves

```
Wave 1 (Baseline lock)
└── Task 1: Lock baseline truth and evidence

Wave 2 (Independent discovery after baseline)
├── Task 2: Stock build spike (no wrapper)
├── Task 4: Generated-artifact compatibility gap audit
├── Task 5: Wrapper responsibility minimization audit
└── Task 6: Phase6 value audit (size vs topology vs isolation)

Wave 3 (Preview feasibility)
└── Task 3: Stock preview spike (depends on 2)

Wave 4 (Route decision support)
├── Task 7: Route A proof-preserving feasibility synthesis
├── Task 8: Route B proof-relaxing feasibility synthesis
├── Task 9: Phase6 removal/simplification decision package
├── Task 10: Cost-of-stock trade-off memo
└── Task 11: Strict-stock go/no-go decision

Wave 5A (Execute Route A if feasible)
├── Task 12: Thin wrapper-owned non-stock build steps only where proof still holds
├── Task 13: Retire remaining compat only where stock proof survives
├── Task 14: Collapse preview/deploy toward stock CLI without reducing proof level
├── Task 15: Remove/replace phase6 topology while preserving proof target
└── Task 16: Rebuild and certify proof chain at preserved strength

Wave 5B (Execute Route B if chosen)
├── Task 17: Define downgraded acceptable proof model
├── Task 18: Collapse build/preview/deploy to stock path under downgraded proof
├── Task 19: Remove phase6 repo-specific topology
├── Task 20: Remove repo-local compat/checker layers no longer in scope
└── Task 21: Publish explicit downgraded-proof policy

Wave 6 (Truth sync)
├── Task 22: Update canonical docs
├── Task 23: Update .claude/rules / AGENTS / proof docs
├── Task 24: Remove stale scripts or clearly mark retained residue
└── Task 25: Prepare final operating model summary

Wave FINAL
├── F1: Plan compliance audit
├── F2: Command/document truth audit
├── F3: Real QA proof run
└── F4: Scope fidelity / stock-claim integrity audit
```

Critical Path: Task 1 → Task 2 → Task 3 → Tasks 7/8/9/10 → Task 11 → (Route A or B) → Tasks 22-25 → Final Wave

---

## TODOs

- [ ] 1. Baseline stock-feasibility evidence pack

  **What to do**:
  - Capture clean baseline for current build/preview/deploy truth
  - Freeze current retained compat surface and proof expectations
  - Save exact command outputs for future route comparison

  **Must NOT do**:
  - Do not mutate code in this task
  - Do not start retiring or thinning anything yet

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: focused repository truth capture
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 7, 8, 10, 11
  - **Blocked By**: None

  **References**:
  - `package.json` - current canonical command surfaces
  - `scripts/release-proof.sh` - actual release-proof sequence
  - `docs/guides/CLOUDFLARE-RETAINED-EXCEPTION-REGISTER.md` - retained Cloudflare truth

  **Acceptance Criteria**:
  - [ ] Baseline evidence pack exists with current build/preview/deploy commands and checker outputs
  - [ ] Current retained patch list is explicitly frozen in evidence

  **QA Scenarios**:
  ```
  Scenario: Baseline evidence is complete
    Tool: Bash
    Steps:
      1. Run current canonical build/preview/deploy dry-run commands
      2. Save outputs into evidence files
    Expected Result: A reproducible baseline bundle exists for later comparison
    Evidence: .sisyphus/evidence/fully-stock-task-1-baseline.txt
  ```

- [ ] 2. Stock build spike (strict no-wrapper test)

  **What to do**:
  - Run a throwaway, evidence-only spike using direct stock OpenNext build path
  - Determine whether stock build can produce a viable `.open-next` without repo wrapper orchestration

  **Must NOT do**:
  - Do not silently replace current canonical build path
  - Do not weaken proof requirements during the spike

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: high-value feasibility spike
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 7, 8, 11
  - **Blocked By**: 1

  **References**:
  - `scripts/cloudflare/build-webpack.mjs` - wrapper duties to bypass/compare
  - `docs/guides/CLOUDFLARE-DEPLOYMENT-ASSESSMENT.md` - stock vs wrapper framing
  - Upstream `opennextjs-cloudflare build` docs - stock baseline

  **Acceptance Criteria**:
  - [ ] Evidence clearly says one of: stock build viable / stock build blocked
  - [ ] If blocked, blocker type is classified (generated-artifact / config / topology / env)

  **QA Scenarios**:
  ```
  Scenario: Stock build feasibility is measured
    Tool: Bash
    Steps:
      1. Run direct stock build path in a throwaway proof branch/state
      2. Capture success or failure and classify the blocker
    Expected Result: The result is binary and blocker-classified
    Evidence: .sisyphus/evidence/fully-stock-task-2-stock-build.txt
  ```

- [ ] 3. Stock preview spike (strict no-wrapper preview test)

  **What to do**:
  - Attempt direct stock OpenNext preview path against the stock build spike result
  - Measure what proof survives and what fails

  **Must NOT do**:
  - Do not equate local preview with deployed truth
  - Do not hide preview regressions behind downgraded acceptance criteria

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 7, 8, 11
  - **Blocked By**: 1, 2

  **References**:
  - `scripts/cloudflare/preview-smoke.mjs` - current page-level preview proof
  - `docs/guides/CLOUDFLARE-OFFICIAL-ALIGNMENT-RUNBOOK.md` - current preview proof mode

  **Acceptance Criteria**:
  - [ ] Evidence clearly says one of: stock preview viable / stock preview blocked
  - [ ] Blocking failure mode is documented with exact error and scope

  **QA Scenarios**:
  ```
  Scenario: Stock preview feasibility is measured
    Tool: Bash
    Steps:
      1. Run direct stock preview path
      2. Hit page-level smoke routes
    Expected Result: Preview either passes or fails with exact runtime error captured
    Evidence: .sisyphus/evidence/fully-stock-task-3-stock-preview.txt
  ```

- [ ] 4. Generated-artifact compat frontier audit

  **What to do**:
  - Re-summarize all retirement attempts and final retained patch set
  - Mark which patch points are truly load-bearing vs. historically suspected

  **Must NOT do**:
  - Do not retry the same failed retirement attempts inside this task

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 7, 8, 11, 13, 20
  - **Blocked By**: 1

  **References**:
  - `.sisyphus/evidence/next-round-*-retain.txt`
  - `scripts/cloudflare/patch-prefetch-hints-manifest.mjs`
  - `scripts/cloudflare/check-generated-artifact-log.mjs`

  **Acceptance Criteria**:
  - [ ] Final retained patch set is documented without contradictions
  - [ ] Retired vs retained boundary is explicit and evidence-backed

  **QA Scenarios**:
  ```
  Scenario: Retained patch frontier is accurate
    Tool: Read-only review
    Steps:
      1. Compare latest retain/retire evidence files
      2. Verify current patch script matches those outcomes
    Expected Result: No stale retirement claim remains in the frontier audit
    Evidence: .sisyphus/evidence/fully-stock-task-4-frontier-audit.txt
  ```

- [ ] 5. Wrapper responsibility minimization audit

  **What to do**:
  - Classify every `build-webpack.mjs` responsibility as must-stay, maybe-thinnable, or removable
  - Separate proof-boundary duties from historical convenience

  **Must NOT do**:
  - Do not edit wrapper behavior yet

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 7, 8, 10, 11, 12, 18
  - **Blocked By**: 1

  **Acceptance Criteria**:
  - [ ] Each wrapper responsibility is classified
  - [ ] Any thinning proposal is marked safe / unsafe / blocked

  **QA Scenarios**:
  ```
  Scenario: Wrapper role map is complete
    Tool: Read-only review
    Steps:
      1. Enumerate wrapper duties from code and docs
      2. Classify each duty against proof dependence
    Expected Result: No wrapper responsibility is left unclassified
    Evidence: .sisyphus/evidence/fully-stock-task-5-wrapper-audit.txt
  ```

- [ ] 6. Phase6 value audit

  **What to do**:
  - Re-evaluate `phase6` not as “legacy default,” but as a current topology choice
  - Separate historical size rationale from current isolation/deploy/runtime value

  **Must NOT do**:
  - Do not assume phase6 stays or goes before the evidence is written

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 9, 11, 15, 19
  - **Blocked By**: 1

  **Acceptance Criteria**:
  - [ ] Phase6 benefits are listed separately from historical reasons
  - [ ] Phase6 removal cost is explicit enough to support a decision

  **QA Scenarios**:
  ```
  Scenario: Phase6 value audit is decision-ready
    Tool: Read-only review
    Steps:
      1. List size/isolation/deploy benefits separately
      2. List removal costs separately
    Expected Result: Phase6 can be kept/removed based on evidence rather than inertia
    Evidence: .sisyphus/evidence/fully-stock-task-6-phase6-audit.txt
  ```

- [ ] 7. Route A synthesis — strict stock with proof preservation

  **What to do**:
  - Decide whether a proof-preserving route to strict stock exists
  - If yes, define exact migration path and proof invariants
  - If no, record why not

  **Must NOT do**:
  - Do not quietly downgrade proof in this route

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: 11, 12, 15, 16
  - **Blocked By**: 1, 2, 3, 4, 5, 6

  **Acceptance Criteria**:
  - [ ] Route A is explicitly marked feasible or not feasible
  - [ ] Reasons are evidence-backed, not intuitive

  **QA Scenarios**:
  ```
  Scenario: Route A feasibility is explicit
    Tool: Read-only review
    Steps:
      1. Compare Route A requirements to stock build/preview/topology evidence
      2. State feasible or blocked with proof references
    Expected Result: Route A status is binary and justified
    Evidence: .sisyphus/evidence/fully-stock-task-7-route-a.txt
  ```

- [ ] 8. Route B synthesis — strict stock with explicit proof trade-off

  **What to do**:
  - Define the fastest path to strict stock if proof weakening is allowed
  - Make every lost proof surface explicit

  **Must NOT do**:
  - Do not describe proof loss as accidental or temporary if it is structural

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: 11, 17, 18, 19, 21
  - **Blocked By**: 1, 2, 3, 4, 5, 6

  **Acceptance Criteria**:
  - [ ] Route B names every proof downgrade explicitly
  - [ ] Trade-off matrix exists

  **QA Scenarios**:
  ```
  Scenario: Route B trade-offs are explicit
    Tool: Read-only review
    Steps:
      1. Enumerate every proof/control surface lost under Route B
      2. Check the trade-off matrix for completeness
    Expected Result: No hidden downgrade remains
    Evidence: .sisyphus/evidence/fully-stock-task-8-route-b.txt
  ```

- [ ] 9. Phase6 decision package

  **What to do**:
  - Produce a specific decision: keep, simplify, or remove phase6
  - If remove/simplify, define exact replacement deployment model

  **Must NOT do**:
  - Do not leave phase6 as a vague “maybe” if strict stock is the target

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: 11, 15, 19
  - **Blocked By**: 6

  **Acceptance Criteria**:
  - [ ] Phase6 decision is explicit
  - [ ] Replacement topology (if any) is named and testable

  **QA Scenarios**:
  ```
  Scenario: Phase6 decision is executable
    Tool: Read-only review
    Steps:
      1. Check whether keep/simplify/remove is explicitly chosen
      2. Verify replacement topology is concrete if removal is proposed
    Expected Result: No ambiguous phase6 end-state remains
    Evidence: .sisyphus/evidence/fully-stock-task-9-phase6-decision.txt
  ```

- [ ] 10. Cost-of-stock trade-off memo

  **What to do**:
  - Summarize what must be given up to reach strict stock
  - Cover architecture control, proof control, compat control, and deploy control

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: 11, 17, 18, 19, 20, 21
  - **Blocked By**: 1, 2, 3, 4, 5, 6

  **Acceptance Criteria**:
  - [ ] Team-facing trade-off memo exists in the plan/evidence

  **QA Scenarios**:
  ```
  Scenario: Stock cost memo is decision-grade
    Tool: Read-only review
    Steps:
      1. Check that architecture/proof/compat/deploy costs are all covered
      2. Verify trade-offs map to Route A and Route B
    Expected Result: Decision-makers can choose without hidden cost assumptions
    Evidence: .sisyphus/evidence/fully-stock-task-10-tradeoff.txt
  ```

- [ ] 11. Strict-stock go/no-go decision

  **What to do**:
  - Decide which branch proceeds:
    - Route A execution
    - Route B execution
    - No-go under current requirements

  **Must NOT do**:
  - Do not proceed to execution waves without explicit gate result

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential gate
  - **Blocks**: 12-25
  - **Blocked By**: 7, 8, 9, 10

  **Acceptance Criteria**:
  - [ ] One explicit decision recorded: A / B / No-go

  **QA Scenarios**:
  ```
  Scenario: Final route decision is binding
    Tool: Read-only review
    Steps:
      1. Verify the decision cites Route A/Route B/No-go evidence
      2. Verify later execution tasks align with that decision
    Expected Result: No execution branch starts without a documented gate result
    Evidence: .sisyphus/evidence/fully-stock-task-11-decision.txt
  ```

- [ ] 12. Route A execution — thin wrapper-owned non-stock build steps only where proof still holds

  **What to do**:
  - Remove or bypass the smallest non-essential responsibility in `build-webpack.mjs` first
  - Re-run baseline proof after each atomic thinning step
  - Stop immediately if compat-mode or proof boundary changes unexpectedly

  **References**:
  - `scripts/cloudflare/build-webpack.mjs`
  - `scripts/release-proof.sh`
  - `.sisyphus/evidence/next-round-wrapper-thinning-not-safe.txt`

  **Acceptance Criteria**:
  - [ ] Each wrapper duty removed is named explicitly
  - [ ] Post-change evidence shows no proof regression

  **QA Scenarios**:
  ```
  Scenario: Wrapper thinning keeps current proof stable
    Tool: Bash
    Steps:
      1. Run `pnpm build`
      2. Run `CF_APPLY_GENERATED_PATCH=true pnpm build:cf`
      3. Compare outputs against baseline evidence pack
    Expected Result: All commands pass and no new compat blocker appears
    Evidence: .sisyphus/evidence/fully-stock-task-12-build.txt

  Scenario: Wrapper thinning accidentally weakens proof
    Tool: Bash
    Steps:
      1. Run `pnpm smoke:cf:preview`
      2. Inspect checker outputs for new regressions
    Expected Result: Any regression aborts the thinning attempt and is recorded
    Evidence: .sisyphus/evidence/fully-stock-task-12-proof-check.txt
  ```

- [ ] 13. Route A execution — retire remaining compat only where stock proof survives

  **What to do**:
  - Re-attempt remaining compat retirement only if Route A evidence says stock proof survives
  - Use target-only retirement, one patch point at a time

  **Acceptance Criteria**:
  - [ ] Any retired patch point has before/after dry-run evidence
  - [ ] Any failed retirement is recorded as retain, not silently abandoned

  **QA Scenarios**:
  ```
  Scenario: Target-only retirement succeeds
    Tool: Bash
    Steps:
      1. Run patch dry-run before
      2. Apply one target-only retirement
      3. Run patch dry-run after
      4. Run build + compat build + preview smoke
    Expected Result: Target patch no longer required and proof still passes
    Evidence: .sisyphus/evidence/fully-stock-task-13-retire-success.txt

  Scenario: Target-only retirement fails
    Tool: Bash
    Steps:
      1. Run build/checkers after removing one patch point
      2. Capture exact failure and revert or mark retain
    Expected Result: Failure is documented and patch is restored/retained
    Evidence: .sisyphus/evidence/fully-stock-task-13-retire-fail.txt
  ```

- [ ] 14. Route A execution — collapse preview/deploy toward stock CLI without reducing proof level

  **What to do**:
  - Replace repo-local preview/deploy invocation steps with stock CLI only where equivalent proof still exists
  - Preserve explicit boundary between local preview proof and deployed proof

  **Acceptance Criteria**:
  - [ ] Preview/deploy path is thinner and proof vocabulary is unchanged
  - [ ] No stock claim is made if compat env/wrapper is still required

  **QA Scenarios**:
  ```
  Scenario: Stock-like preview path is valid
    Tool: Bash
    Steps:
      1. Run chosen preview path
      2. Run `pnpm smoke:cf:preview`
    Expected Result: Pages, redirects, headers, cookies remain valid
    Evidence: .sisyphus/evidence/fully-stock-task-14-preview.txt

  Scenario: Deploy path loses proof coverage
    Tool: Bash
    Steps:
      1. Run chosen deploy or dry-run path
      2. Compare against current proof matrix
    Expected Result: Any lost proof surface is recorded and blocks Route A
    Evidence: .sisyphus/evidence/fully-stock-task-14-deploy-proof.txt
  ```

- [ ] 15. Route A execution — remove/replace phase6 topology while preserving proof target

  **What to do**:
  - Migrate away from repo-specific phase6 only if replacement topology preserves Route A proof target
  - Remove generator/deploy glue only after replacement path is evidenced

  **Acceptance Criteria**:
  - [ ] Replacement topology is explicit and deployable
  - [ ] Phase6 removal does not create undefined deploy behavior

  **QA Scenarios**:
  ```
  Scenario: Replacement topology works
    Tool: Bash
    Steps:
      1. Run build and deploy dry-run on replacement topology
      2. Run checker suite and smoke commands
    Expected Result: Replacement topology passes build/deploy proof without repo-specific phase6 contract
    Evidence: .sisyphus/evidence/fully-stock-task-15-topology-success.txt

  Scenario: Phase6 removal breaks deploy parity
    Tool: Bash
    Steps:
      1. Run deploy dry-run and inspect failures
      2. Record missing routing/binding/proof surfaces
    Expected Result: Failure is documented and Route A blocks here
    Evidence: .sisyphus/evidence/fully-stock-task-15-topology-fail.txt
  ```

- [ ] 16. Route A execution — rebuild and certify proof chain at preserved strength

  **What to do**:
  - Re-run the final proof chain under the new Route A state
  - Certify that proof strength did not materially drop

  **Acceptance Criteria**:
  - [ ] Final Route A proof chain is fully green
  - [ ] Proof-level equivalence statement exists

  **QA Scenarios**:
  ```
  Scenario: Final Route A proof chain passes
    Tool: Bash
    Steps:
      1. Run build, preview, deploy proof chain
      2. Run relevant checker suite
    Expected Result: All preserved proof surfaces remain valid
    Evidence: .sisyphus/evidence/fully-stock-task-16-proof.txt
  ```

- [ ] 17. Route B execution — define downgraded acceptable proof model

  **What to do**:
  - Explicitly define what proof surfaces are being given up
  - Map old proof level to new proof level

  **Acceptance Criteria**:
  - [ ] Downgraded proof policy is explicit and reviewable

  **QA Scenarios**:
  ```
  Scenario: Downgraded proof model is explicit
    Tool: Read-only review
    Steps:
      1. Compare current proof matrix to Route B proof matrix
      2. Verify each removed proof is named
    Expected Result: No implicit proof loss remains undocumented
    Evidence: .sisyphus/evidence/fully-stock-task-17-proof-policy.txt
  ```

- [ ] 18. Route B execution — collapse build/preview/deploy to stock path

  **What to do**:
  - Replace custom wrapper path with stock build/preview/deploy path
  - Remove compat-mode from the canonical workflow

  **Acceptance Criteria**:
  - [ ] Final command path is stock OpenNext CLI-based
  - [ ] Remaining proof matches Route B policy

  **QA Scenarios**:
  ```
  Scenario: Stock CLI path works under Route B
    Tool: Bash
    Steps:
      1. Run stock build
      2. Run stock preview
      3. Run stock deploy or deploy dry-run
    Expected Result: Commands pass under the downgraded proof model
    Evidence: .sisyphus/evidence/fully-stock-task-18-stock-path.txt
  ```

- [ ] 19. Route B execution — remove phase6 repo-specific topology

  **What to do**:
  - Delete or archive phase6-specific generation/deploy flow
  - Replace with simpler stock-compatible deployment shape

  **Acceptance Criteria**:
  - [ ] Phase6 topology is no longer part of the active deployment model
  - [ ] Current deploy path no longer depends on phase6 scripts

  **QA Scenarios**:
  ```
  Scenario: Phase6 is fully out of active path
    Tool: Grep + Bash
    Steps:
      1. Search package scripts and runbooks for active phase6 path references
      2. Run replacement build/deploy path
    Expected Result: No active command path still depends on phase6 scripts
    Evidence: .sisyphus/evidence/fully-stock-task-19-phase6-removed.txt
  ```

- [ ] 20. Route B execution — remove repo-local compat/checker layers no longer in scope

  **What to do**:
  - Remove repo-local compat/checker layers that Route B no longer intends to preserve
  - Keep only what remains necessary for truthful stock labeling

  **Acceptance Criteria**:
  - [ ] Removed layers are listed explicitly
  - [ ] Final stock claim is honest about what guardrails were dropped

  **QA Scenarios**:
  ```
  Scenario: Removed checker/compat layers are intentional
    Tool: Read-only review
    Steps:
      1. Compare removed scripts/checkers to Route B policy
      2. Verify no retained doc still depends on them
    Expected Result: Removal scope matches policy and is documented
    Evidence: .sisyphus/evidence/fully-stock-task-20-layer-removal.txt
  ```

- [ ] 21. Route B execution — publish downgraded-proof policy

  **What to do**:
  - Publish the final policy for what “stock” means under Route B
  - Make proof loss explicit in canonical docs/rules

  **Acceptance Criteria**:
  - [ ] Final docs do not pretend Route B preserved old proof strength

  **QA Scenarios**:
  ```
  Scenario: Docs match downgraded-proof reality
    Tool: Read-only review
    Steps:
      1. Read final canonical docs
      2. Compare wording to Route B policy
    Expected Result: No hidden proof-preserving claims remain
    Evidence: .sisyphus/evidence/fully-stock-task-21-doc-policy.txt
  ```

- [ ] 22. Canonical doc sync

  **What to do**:
  - Update current truth docs to the chosen final state
  - Remove contradictory pre-migration wording

  **Acceptance Criteria**:
  - [ ] Canonical truth docs align with final route outcome

  **QA Scenarios**:
  ```
  Scenario: Canonical docs are internally consistent
    Tool: Read-only review
    Steps:
      1. Compare assessment, runbook, retained register, backlog
    Expected Result: No contradiction across canonical docs
    Evidence: .sisyphus/evidence/fully-stock-task-22-doc-sync.txt
  ```

- [ ] 23. Rules / AGENTS / proof doc sync

  **What to do**:
  - Sync `.claude/rules`, `AGENTS.md`, and proof docs to the final operating model

  **Acceptance Criteria**:
  - [ ] Rules no longer reflect pre-migration truth

  **QA Scenarios**:
  ```
  Scenario: Rules match final stack truth
    Tool: Read-only review
    Steps:
      1. Audit .claude/rules, AGENTS, proof docs
    Expected Result: No stale build/preview/deploy guidance remains
    Evidence: .sisyphus/evidence/fully-stock-task-23-rules-sync.txt
  ```

- [ ] 24. Script cleanup / retained residue declaration

  **What to do**:
  - Remove obsolete scripts or explicitly declare retained residue if strict stock was not achieved

  **Acceptance Criteria**:
  - [ ] Script inventory matches final architecture truth

  **QA Scenarios**:
  ```
  Scenario: Script layer matches final state
    Tool: Grep + Read-only review
    Steps:
      1. Inventory scripts/cloudflare and package.json script references
      2. Compare against final route conclusion
    Expected Result: No obsolete active-path script remains unexplained
    Evidence: .sisyphus/evidence/fully-stock-task-24-script-sync.txt
  ```

- [ ] 25. Final operating model summary

  **What to do**:
  - Publish the final snapshot: what is canonical, what was traded away, what remains deferred

  **Acceptance Criteria**:
  - [ ] Final operating model summary exists and matches actual end-state

  **QA Scenarios**:
  ```
  Scenario: Final summary is honest and complete
    Tool: Read-only review
    Steps:
      1. Compare final summary against route decision and retained exceptions
    Expected Result: Summary neither overstates stock status nor hides trade-offs
    Evidence: .sisyphus/evidence/fully-stock-task-25-summary.txt
  ```

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit**
  **Tool**: `oracle`
  **Steps**:
    1. Read the plan and chosen route outcome end-to-end.
    2. Verify every required deliverable exists.
    3. Verify no task past Task 11 was skipped without a route decision.
  **Expected Result**: `APPROVE` only if execution matches route decision and deliverables.
  **Evidence**: `.sisyphus/evidence/final-stock-f1-compliance.txt`

- [ ] F2. **Command / Documentation Audit**
  **Tool**: read-only audit + grep
  **Steps**:
    1. Extract current canonical build/preview/deploy commands from docs and scripts.
    2. Verify docs/rules match the final operating model.
  **Expected Result**: no stale command truth remains.
  **Evidence**: `.sisyphus/evidence/final-stock-f2-command-doc-audit.txt`

- [ ] F3. **Real QA Proof Run**
  **Tool**: Bash
  **Steps**:
    1. Run the final chosen build path.
    2. Run the final chosen preview path.
    3. Run the final chosen deploy or deploy-dry-run path.
    4. Run all relevant checkers still in scope.
  **Expected Result**: final claimed operating model is actually runnable.
  **Evidence**: `.sisyphus/evidence/final-stock-f3-proof-run.txt`

- [ ] F4. **Stock-Claim Integrity Audit**
  **Tool**: `deep`
  **Steps**:
    1. Inspect final state for any remaining repo-local compat env, wrapper, patch, or contract.
    2. Reject any “fully stock” label if those still exist in the active path.
    3. If not fully stock, ensure docs explicitly say so.
  **Expected Result**: either true strict-stock, or an explicit non-stock conclusion.
  **Evidence**: `.sisyphus/evidence/final-stock-f4-integrity.txt`

---

## Commit Strategy

- Discovery / spike commits: `docs(cloudflare): capture stock feasibility evidence`
- Route decision commit: `docs(cloudflare): record strict stock go-no-go decision`
- Execution commits (if any): `refactor(cloudflare): ...`
- Failed retirement or failed stock-route attempts must be documented, not hidden

---

## Success Criteria

### Verification Commands
```bash
pnpm build
pnpm exec opennextjs-cloudflare build
pnpm exec opennextjs-cloudflare preview
pnpm exec wrangler deploy
pnpm smoke:cf:preview
pnpm smoke:cf:deploy -- --base-url <url>
```

### Final Checklist
- [ ] Final state is either truly strict-stock, or explicitly documented as not feasible under current requirements
- [ ] No stale docs/rules claim more stock than the repo actually achieved
- [ ] No hidden compat env or wrapper remains in a final state labeled fully stock

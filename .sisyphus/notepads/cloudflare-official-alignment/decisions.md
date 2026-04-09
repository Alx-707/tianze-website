# Decisions — cloudflare-official-alignment

## Fri Apr 10 2026 — Task 3: Proof Matrix + Proof Boundary

### Decision: Two separate evidence files, not one combined document

Rationale: The proof matrix (what is the current status of each risk) and the
proof boundary definition (what each level proves / does not prove) serve
different audiences and purposes. Keeping them separate makes each easier to
reference independently during plan execution.

### Decision: Mark RISK-08 (contact page) as CLOSED in the matrix

Rationale: pnpm proof:cf:preview-deployed passed as of 2026-04-09 with /en/contact
and /zh/contact returning 200. The root cause was identified and fixed. Marking
it as open would misrepresent the actual state and add noise to the gap list.
If alignment changes touch the contact page or caching layer, it must be re-confirmed.

### Decision: RISK-09 (local/deployed divergence) marked as PERMANENT STRUCTURAL CONSTRAINT

Rationale: This is not a code bug. It cannot be closed by fixing code. It is a
fundamental limitation of local Cloudflare preview tooling. Treating it as a
closeable gap would be misleading. It belongs in the proof boundary document as
a permanent constraint to be enforced as discipline.

### Decision: Include anti-patterns list in both documents

Rationale: The most common failure mode is making a proof claim that exceeds
what the evidence actually supports. Having an explicit "FORBIDDEN CLAIMS" list
in both files makes it easy to audit whether a claim is valid. It also makes
the constraints reviewable without requiring the reader to understand all the
underlying tool behavior.

### Decision: Document the phase6 deploy constraints verbatim

Rationale: The OPEN_NEXT_DEPLOY=true requirement, the -preview suffix requirement
for service bindings, and the WORKER_SELF_REFERENCE prohibition were all
historically discovered through failures. Capturing them verbatim in the proof
boundary prevents re-discovery.

### Decision: List minimum proof requirements by change type

Rationale: Different change types have different risk profiles. A TypeScript
formatting change has a different minimum proof requirement than a middleware.ts
change. Making this explicit prevents under-proving (treating a platform change
as if it only needs a fast-gate).

## Fri Apr 10 2026 — Task 2: Inventory All Repo-Local Cloudflare Deviations

### Decision: Classify patch-prefetch-hints-manifest.mjs as Retirement Candidate A (RC-1)

Rationale: This script exists solely to compensate for a generated-artifact issue
where getMiddlewareManifest() falls back to dynamic require() after certain Next.js
upgrades. The generated-artifact-exception-contract.mjs file documents explicit
exit criteria for this patch. This is the strongest basis for retirement — there is
a written contract defining when it should go away. However, retirement is blocked
until: (a) the absolute path bug in the patch is fixed first, and (b) the
build + smoke proof gates in Task 6 are run to confirm official behavior holds
without the patch.

### Decision: Classify build-phase5-worker.mjs as Weak Retirement Candidate B (RC-3)

Rationale: This script is documented as superseded by phase6, and the current
deployment plan points to phase6 as the forward path. However, it may be an
intentional emergency fallback. RC-3 (superseded by documented successor) is the
correct classification — weaker than RC-1 because no explicit retirement contract
exists. Retirement requires explicit owner sign-off before proceeding.

### Decision: Treat all other 15 items as Non-Candidates (Must Retain) at this stage

Rationale: Each remaining item has a clear active role in the current deployment
chain — build wrappers, topology contracts, alias/shim infrastructure, proof
scaffolding, smoke gates, deploy orchestration. No item was found to have both
(a) a documented successor and (b) an explicit retirement contract. Conservative
approach: absence of evidence for retirement is treated as evidence to retain.

### Decision: Mark four items as Deferred Assessment (require deeper proof work)

Rationale:
- D1 (absolute path bug in patch script): Must be fixed before retirement can be
  attempted. Current behavior is technically incorrect but the patch still works
  because the bug is in a fallback branch.
- D2 (minify conflict): Whether minify can be safely re-enabled requires a full
  build + smoke cycle. Not assessable from static inspection alone.
- D3 (OPEN_NEXT_DEPLOY_ENV naming discrepancy): The env var name used in the deploy
  script differs from OpenNext upstream documentation. Needs upstream doc verification
  to determine if this is intentional divergence or a stale name.
- D4 (PHASE6_ALIAS gap — no contract checker): The alias/shim block in
  open-next.config.ts is manually maintained with no automated checker. This is a
  maintenance risk but not a retirement candidate. Deferred until a dedicated
  checker can be proposed.

### Decision: Conservative retirement classification approach

Rationale: Retirement candidate status requires explicit positive evidence — either
(RC-1) a written exit contract, (RC-2) official upstream now handles it, or (RC-3)
a documented successor exists. Absence of an obvious active role is insufficient.
This prevents false retirements that break the Cloudflare deployment chain.

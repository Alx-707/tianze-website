# Codebase Quality Audit — Execution Prompt

Execute a full codebase quality audit for `tianze-website` following the unified design spec.

## Spec Location

Read and follow exactly: `docs/superpowers/specs/2026-04-24-codebase-quality-audit-unified-design.md`

That document is the single source of truth for this audit. Do not deviate from it.

## Your Mission

Produce the final audit report at `docs/reports/2026-04-24-codebase-quality-audit.md` with supporting artifacts at `docs/reports/2026-04-24-audit-artifacts/`.

## Execution Order

### Phase 1: Baseline & Evidence Collection

1. Record baseline:
   ```bash
   git fetch origin
   git rev-parse origin/main
   git rev-parse HEAD
   git status --short --branch
   node -v
   pnpm -v
   ```
2. Ensure you are working against the `origin/main` commit. If local is dirty or ahead, check out `origin/main` in detached HEAD before running evidence commands.
3. Run all Tier 1-3 evidence commands from the spec. Respect parallelism rules: `clean:next-artifacts → build → build:cf` must be sequential; other commands may parallelize.
4. Run Tier 4 commands if Tier 1-3 results indicate they are relevant.
5. Store all raw outputs in `docs/reports/2026-04-24-audit-artifacts/`.

### Phase 2: Runtime Mental Model

Read the must-read documents listed in the spec (CLAUDE.md, .claude/rules/*, CANONICAL-TRUTH-REGISTRY, QUALITY-PROOF-LEVELS, RELEASE-PROOF-RUNBOOK, behavioral-contracts). Then read the route structure, middleware, layout chain, content loading, config layers, and build config. Write the runtime mental model as Chapter 2 of the report.

### Phase 3: Deep Dimension Audit (9 dimensions, 5 lanes)

For each of the 5 audit lanes defined in the spec, systematically read the relevant code areas and evaluate against all applicable dimensions using the Linus lens. Record findings using the finding contract format from the spec. Flag cross-cutting observations.

### Phase 4: Critical Business Flow Review

Trace each of the 5 business flows (with Flow 1 split into 3 sub-paths) end-to-end through runtime truth / proof truth / design truth. Cross-reference with Phase 3 findings.

### Phase 5: Synthesis & Report Writing

1. Re-verify all High/Critical findings.
2. Deduplicate findings using the fingerprint rules.
3. Build root-cause clusters.
4. Apply grade cap rules and assign final ABCD grades.
5. Write the complete report following the 6-chapter structure in the spec.

## Key Constraints

- **Read-only audit.** Do not modify any production code. Only create report artifacts.
- **No permanent file deletion.**
- **No deployment commands.** No `wrangler deploy`, no production-impacting actions.
- **`pnpm build` and `pnpm build:cf` must not run in parallel.**
- **Every High/Critical finding must have file:line evidence and Chinese business impact.**
- **Executive summary must be readable by a non-technical business owner** — no Next.js, Cloudflare, RSC, or CI jargon.
- **Evidence confidence**: every finding must state whether it is confirmed by execution, confirmed by static evidence, likely but unverified, or hypothesis.
- **Grade caps are hard rules** — see the spec for conditions that cap grades.

## Report Quality Bar

The report is not done until all acceptance criteria in the spec are met. Check them before declaring completion. If any criterion is not met, fix it before finishing.

## If You Get Stuck

- If a command fails, record the failure in artifacts and note it in the appendix. Do not skip the dimension — use static evidence instead.
- If a finding is ambiguous, classify it as "Likely but not fully verified" and note what would confirm it.
- If you cannot complete a phase, document what was completed and what remains.

## Output

When finished, the following must exist:
- `docs/reports/2026-04-24-codebase-quality-audit.md` — the complete audit report
- `docs/reports/2026-04-24-audit-artifacts/` — all raw evidence outputs

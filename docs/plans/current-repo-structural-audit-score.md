# First Formal Structural Audit Score

> Superseded by [2026-03-23-current-structural-audit-report.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/plans/2026-03-23-current-structural-audit-report.md). Keep this file only as the baseline scoring snapshot.

## Scope
Baseline structural quality audit for the current repository using the repo-mapped 9-box scoring model.

## Audit Type
- Baseline structural audit
- Not a release approval
- Focused on system properties rather than local code quality

## Overall Result
- Total score: `56.3 / 100`
- Grade: `D`
- Maturity: `L2 - localized control`
- Blocking release verdict: `Not applicable for this audit type`
- Structural confidence verdict: `Moderate-to-low`

## Interpretation
This repository has a stronger-than-average engineering control surface for a frontend-heavy codebase: explicit dependency rules, layered hooks/CI, translation validation, dual-platform deployment workflows, and broad test coverage. However, under a strict structural model, the score is materially reduced by three factors:

1. Governance controls are weaker than the code-level controls.
2. Propagation evidence is incomplete because hotspot and logical-coupling analysis is only partial.
3. Dual-platform runtime complexity means several good-looking static signals still require stronger runtime proof.

This score should be read as: the repository is meaningfully engineered, but it does not yet provide high structural confidence that change cost, ownership, and runtime divergence are fully under control.

## Evidence Base

### Stronger Evidence Sources
- [`package.json`](/Users/Data/Warehouse/Pipe/tianze-website/package.json)
- [`lefthook.yml`](/Users/Data/Warehouse/Pipe/tianze-website/lefthook.yml)
- [`ci.yml`](/Users/Data/Warehouse/Pipe/tianze-website/.github/workflows/ci.yml)
- [`scripts/quality-gate.js`](/Users/Data/Warehouse/Pipe/tianze-website/scripts/quality-gate.js)
- [`vitest.config.mts`](/Users/Data/Warehouse/Pipe/tianze-website/vitest.config.mts)
- [`playwright.config.ts`](/Users/Data/Warehouse/Pipe/tianze-website/playwright.config.ts)
- [`reports/coverage/coverage-summary.json`](/Users/Data/Warehouse/Pipe/tianze-website/reports/coverage/coverage-summary.json)
- [`reports/quality-gate-latest.json`](/Users/Data/Warehouse/Pipe/tianze-website/reports/quality-gate-latest.json)
- [`src/middleware.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/middleware.ts)
- [`open-next.config.ts`](/Users/Data/Warehouse/Pipe/tianze-website/open-next.config.ts)

### Weaker or Incomplete Evidence Areas
- No formal logical-coupling / hotspot report
- No `CODEOWNERS` or equivalent owner map
- No fresh rerun in this audit of `pnpm build` + `pnpm build:cf` + full E2E
- No whole-repo architecture conformance output captured from a fresh dependency-cruiser run

## 9-Box Score Table

| Dimension | Base | Evidence | Penalty | Final / 5 | Weight | Weighted |
|---|---:|---:|---:|---:|---:|---:|
| `S1` Boundary clarity | 4.0 | 0.85 | 0.25 | 3.15 | 12 | 7.56 |
| `S2` Dependency health | 4.5 | 1.00 | 0.50 | 4.00 | 12 | 9.60 |
| `S3` Propagation controllability | 3.0 | 0.85 | 0.50 | 2.05 | 11 | 4.51 |
| `R1` Key-path stability | 4.0 | 0.85 | 0.25 | 3.15 | 15 | 9.45 |
| `R2` State/config controllability | 4.0 | 0.85 | 0.25 | 3.15 | 12 | 7.56 |
| `R3` Failure isolation/observability | 3.5 | 0.85 | 0.25 | 2.73 | 13 | 7.09 |
| `G1` Rule execution | 3.0 | 1.00 | 0.75 | 2.25 | 10 | 4.50 |
| `G2` Responsibility/collaboration fit | 2.0 | 0.85 | 0.50 | 1.20 | 7 | 1.68 |
| `G3` Feedback/closure loop | 3.5 | 0.85 | 0.25 | 2.73 | 8 | 4.36 |

## Dimension Conclusions

### `S1` Boundary Clarity
- Verdict: `Moderately healthy`
- Why:
  - Top-level namespaces are explicit: `app`, `components`, `lib`, `config`, `i18n`.
  - The repo has explicit guardrails against misleading legacy entrypoints.
  - Boundary confidence is reduced by legacy/comment drift and shared-layer leakage risk.
- Representative paths:
  - [`src/app/api/contact/route.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/app/api/contact/route.ts)
  - [`src/lib/lead-pipeline/process-lead.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/lead-pipeline/process-lead.ts)
  - [`src/config/security.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/config/security.ts)

### `S2` Dependency Health
- Verdict: `Strongest dimension`
- Why:
  - Dependency-cruiser rules are explicit and meaningful.
  - Hooks add architectural guardrails before push.
  - This repo is structurally opinionated about boundary enforcement.
- Risk still present:
  - Some confidence still relies on rules rather than freshly captured conformance output.
  - Barrel/test-only-entrypoint risks remain part of repo history.
- Representative paths:
  - [` .dependency-cruiser.js`](/Users/Data/Warehouse/Pipe/tianze-website/.dependency-cruiser.js)
  - [`scripts/check-review-hygiene.js`](/Users/Data/Warehouse/Pipe/tianze-website/scripts/check-review-hygiene.js)
  - [`lefthook.yml`](/Users/Data/Warehouse/Pipe/tianze-website/lefthook.yml)

### `S3` Propagation Controllability
- Verdict: `Under-instrumented and likely weaker than desired`
- Why:
  - There are visible change hotspots in translation bundles, quality gates, package config, and contact/inquiry surfaces.
  - The repo shows signs that one category of change often spans code, config, tests, and messages.
  - No formal co-change / hotspot artifact exists yet.
- Representative hotspots:
  - [`package.json`](/Users/Data/Warehouse/Pipe/tianze-website/package.json)
  - [`scripts/quality-gate.js`](/Users/Data/Warehouse/Pipe/tianze-website/scripts/quality-gate.js)
  - [`messages/en.json`](/Users/Data/Warehouse/Pipe/tianze-website/messages/en.json)
  - [`messages/zh.json`](/Users/Data/Warehouse/Pipe/tianze-website/messages/zh.json)

### `R1` Key-Path Stability
- Verdict: `Reasonably strong but not high-confidence`
- Why:
  - Critical runtime entrypoints are known and intentionally managed.
  - Unit/integration/E2E coverage exists on main API and locale paths.
  - Confidence is constrained because this audit did not rerun full dual-build and E2E proof, and critical coverage is uneven around layout/head.
- Representative paths:
  - [`src/middleware.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/middleware.ts)
  - [`src/app/[locale]/layout.tsx`](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/layout.tsx)
  - [`src/app/[locale]/head.tsx`](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/head.tsx)
  - [`src/app/api/verify-turnstile/route.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/app/api/verify-turnstile/route.ts)

### `R2` State and Config Controllability
- Verdict: `Better than average, still platform-sensitive`
- Why:
  - The repo has explicit validation for production config.
  - Cloudflare-specific runtime constraints are documented in code and repo instructions.
  - Translation bundles, locale cookie behavior, cache invalidation, and platform build flags still create a non-trivial state/config surface.
- Representative paths:
  - [`src/config/paths/site-config.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
  - [`src/lib/cache/invalidate.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/cache/invalidate.ts)
  - [`open-next.config.ts`](/Users/Data/Warehouse/Pipe/tianze-website/open-next.config.ts)

### `R3` Failure Isolation and Observability
- Verdict: `Partially controlled`
- Why:
  - There is health-check infrastructure, CSP report handling, PII log review, and pipeline observability code.
  - This is stronger than many similar codebases.
  - Whole-system observability evidence is still incomplete from the perspective of this audit.
- Representative paths:
  - [`src/app/api/health/route.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/app/api/health/route.ts)
  - [`src/lib/lead-pipeline/pipeline-observability.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/lead-pipeline/pipeline-observability.ts)
  - [`scripts/check-pii-in-logs.js`](/Users/Data/Warehouse/Pipe/tianze-website/scripts/check-pii-in-logs.js)

### `G1` Rule Execution
- Verdict: `Real but drift-prone`
- Why:
  - The repository clearly invests in rules, hooks, gates, and CI layering.
  - The latest local quality-gate evidence shows an actual failed blocking code-quality state, which proves gates are not merely decorative.
  - The same evidence also shows the local latest report is fast-mode only, while drift remains in architecture/performance policy artifacts.
- Representative paths:
  - [`reports/quality-gate-latest.json`](/Users/Data/Warehouse/Pipe/tianze-website/reports/quality-gate-latest.json)
  - [`scripts/architecture-metrics.js`](/Users/Data/Warehouse/Pipe/tianze-website/scripts/architecture-metrics.js)
  - [`lighthouserc.js`](/Users/Data/Warehouse/Pipe/tianze-website/lighthouserc.js)

### `G2` Responsibility and Collaboration Fit
- Verdict: `Weakest dimension`
- Why:
  - No `CODEOWNERS` or equivalent ownership map was found.
  - This leaves hotspots and critical cross-cutting paths without visible formal stewardship.
  - The repository has a lot of process and documentation, but that is not the same as enforceable ownership.

### `G3` Feedback and Closure Loop
- Verdict: `Good discovery, weaker closure`
- Why:
  - The repo has strong planning and archival habits.
  - Historical review artifacts, remediation plans, and reports are extensive.
  - Recurring drift around legacy markers, stale thresholds, and mismatched docs suggests closure is weaker than detection.
- Representative paths:
  - [`docs/plans`](/Users/Data/Warehouse/Pipe/tianze-website/docs/plans)
  - [`docs/archive/code-review`](/Users/Data/Warehouse/Pipe/tianze-website/docs/archive/code-review)
  - [`reviews/review-20260221-220203-8b751f.md`](/Users/Data/Warehouse/Pipe/tianze-website/reviews/review-20260221-220203-8b751f.md)

## Highest-Priority Risks

### `P0` Governance Confidence Gap
- No ownership map (`CODEOWNERS` absent).
- Rule surface is large, but execution semantics across local fast-mode, full local CI, CI jobs, and release proof are not unified in one current artifact.

### `P1` Propagation Blindness
- Change hotspots are visible, but the repo lacks a formal logical-coupling / hotspot artifact.
- This makes structural blast-radius judgments less reliable than they should be.

### `P1` Dual-Platform Runtime Complexity
- The codebase explicitly supports both standard Next.js and Cloudflare OpenNext paths.
- This is a real strength, but it also means static cleanliness can overstate runtime confidence.

### `P1` Drift Between Discovery and Closure
- The repo is good at finding and documenting issues.
- It is less good at fully collapsing those findings into enduring ownership and low-drift policy artifacts.

## Recommended Next Actions

### Immediate
1. Add a repo-level ownership map for Tier A paths.
2. Produce one formal hotspot/logical-coupling artifact for the last 90-180 days.
3. Clarify and document the difference between fast gate, local full proof, CI proof, and release proof.

### Next Structural Upgrade
1. Capture a fresh architecture conformance run and store the artifact.
2. Convert recurring legacy/comment drift findings into a standing cleanup rule or checklist.
3. Re-run this model after the three immediate actions above; the score should move materially if they are real improvements.

## Final Judgment
This repository is not structurally chaotic. It is meaningfully engineered and has stronger controls than many codebases in its class. But the current state does not support high structural confidence yet. The main missing ingredient is not another code-quality mechanism; it is stronger control over propagation, ownership, and policy drift.

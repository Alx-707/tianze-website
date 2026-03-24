# Policy Source of Truth

## Purpose
This file defines which repository artifacts are canonical for current engineering policy.

Use this file when multiple documents appear to describe the same rule.

## Canonical Current Sources

### Proof Semantics
- [`QUALITY-PROOF-LEVELS.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [`RELEASE-PROOF-RUNBOOK.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/RELEASE-PROOF-RUNBOOK.md)
- [`RELEASE-SIGNOFF.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/RELEASE-SIGNOFF.md)

### Structural Governance
- [`TIER-A-OWNER-MAP.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/TIER-A-OWNER-MAP.md)
- [`OWNERSHIP-RESILIENCE.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/OWNERSHIP-RESILIENCE.md)
- [`STRUCTURAL-CHANGE-CLUSTERS.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md)
- [`STRUCTURAL-GOVERNANCE-LEDGER.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/STRUCTURAL-GOVERNANCE-LEDGER.md)
- [`.github/CODEOWNERS`](/Users/Data/Warehouse/Pipe/tianze-website/.github/CODEOWNERS)

### Archive and Supersession Hygiene
- [`ARCHIVE-HYGIENE.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/ARCHIVE-HYGIENE.md)

### Performance Thresholds
- [`lighthouserc.js`](/Users/Data/Warehouse/Pipe/tianze-website/lighthouserc.js)

### Coverage and Quality Gate Thresholds
- [`scripts/quality-gate.js`](/Users/Data/Warehouse/Pipe/tianze-website/scripts/quality-gate.js)

### Architecture / Dependency Governance
- [` .dependency-cruiser.js`](/Users/Data/Warehouse/Pipe/tianze-website/.dependency-cruiser.js)
- [`scripts/architecture-metrics.js`](/Users/Data/Warehouse/Pipe/tianze-website/scripts/architecture-metrics.js)
- [`scripts/dependency-conformance.js`](/Users/Data/Warehouse/Pipe/tianze-website/scripts/dependency-conformance.js)
- [`scripts/structural-hotspots.js`](/Users/Data/Warehouse/Pipe/tianze-website/scripts/structural-hotspots.js)

## Supplemental, Not Canonical
- `.claude/rules/quality-gates.md`
- `.claude/rules/review-checklist.md`
- `docs/plans/current-repo-structural-audit-score.md`
- `docs/plans/2026-03-23-structural-governance-followup.md`

These may summarize or point to current rules, but they are not the final source of truth when conflicts appear.

## Superseded Structural Audit Artifacts
- [`current-repo-structural-audit-score.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/plans/current-repo-structural-audit-score.md) — superseded by the final current structural audit report
- [`2026-03-23-structural-governance-followup.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/plans/2026-03-23-structural-governance-followup.md) — governance follow-up record, not the final current-state report

## Rule for Future Updates
- If a policy changes, update the canonical source first.
- Supplemental documents must reference the canonical source instead of redefining it.

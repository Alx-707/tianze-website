# Structural Governance Follow-up

> Supplemental implementation record. For the current overall conclusion, use [2026-03-23-current-structural-audit-report.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/plans/2026-03-23-current-structural-audit-report.md).

## Objective
Close the top three follow-up actions from the first formal structural audit.

## Outcomes

### 1. Tier A Owner Map
- Added [TIER-A-OWNER-MAP.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/TIER-A-OWNER-MAP.md)
- Established:
  - Tier A definition
  - role-based owner assignments
  - required cross-review expectations
  - minimum proof levels before merge

### 2. Formal Hotspot / Logical-Coupling Artifact
- Added [`scripts/structural-hotspots.js`](/Users/Data/Warehouse/Pipe/tianze-website/scripts/structural-hotspots.js)
- Added package script:
  - `pnpm arch:hotspots`
- Wired into metrics:
  - `pnpm ci:metrics` now runs both architecture metrics and hotspot generation
- Generated first report:
  - [structural-hotspots-latest.md](/Users/Data/Warehouse/Pipe/tianze-website/reports/architecture/structural-hotspots-latest.md)
  - [structural-hotspots-latest.json](/Users/Data/Warehouse/Pipe/tianze-website/reports/architecture/structural-hotspots-latest.json)

### 3. Single Current Proof-Level Rule
- Added [QUALITY-PROOF-LEVELS.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- Updated [`quality-gates.md`](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/quality-gates.md) to point to the canonical proof-level rule.
- Added executable Tier A review helper:
  - [`scripts/tier-a-impact.js`](/Users/Data/Warehouse/Pipe/tianze-website/scripts/tier-a-impact.js)
  - `pnpm review:tier-a`
  - `pnpm review:tier-a:staged`
- Updated [`review-checklist.md`](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/review-checklist.md) to call the Tier A impact scan explicitly.

## Most Important New Signals
- Translation bundles are the strongest co-change cluster in the repo.
- `contact`, `inquiry`, and `subscribe` routes form a clear API family cluster.
- Current governance is stronger after these additions, but it is not complete until role owners are mapped to enforceable GitHub identities.

## Remaining Gap
- `.github/CODEOWNERS` still needs to be added once stable GitHub usernames or team handles are available.
- Structural scoring should be re-run after these new governance artifacts are used in at least one real review cycle.

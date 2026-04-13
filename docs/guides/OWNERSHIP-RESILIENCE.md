# Ownership Resilience

## Purpose
This file defines how repository ownership remains resilient even when current enforceable ownership is concentrated in one repository owner identity.

It complements:
- [TIER-A-OWNER-MAP.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/TIER-A-OWNER-MAP.md)
- [`.github/CODEOWNERS`](/Users/Data/Warehouse/Pipe/tianze-website/.github/CODEOWNERS)
- [MAINTAINER-ACTIVATION-CHECKLIST.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/MAINTAINER-ACTIVATION-CHECKLIST.md)

## Current State
- Active maintenance capacity is not single-person in practice.
- The current working maintainer pool includes:
  - the human maintainer
  - agentic maintainers (`Claude Code`, `Codex`)
- Enforceable repository ownership still exists separately from that active maintenance pool.
- The repository default is primary-only:
  - primary: `@rock-909`
- Tier A paths have a backup review path:
  - `developer@flood-control.com`

This is materially stronger than single-owner enforcement, but it is still not a fully diversified long-term operating model at the repository-owner identity level.

## Exact Remaining Constraint
- There is more than one active maintainer in practice.
- The remaining gap is narrower:
  - there is still no second enforceable repository owner identity that independently shares Tier A throughput
- The backup path is a review fallback, not a fully independent repository-owner pool.
- As a result, ownership resilience is improved but not yet structurally redundant at the enforceable ownership layer.

## Operational Checklist
Use this checklist whenever a Tier A path changes:
1. Classify the path through [TIER-A-OWNER-MAP.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/TIER-A-OWNER-MAP.md).
2. Confirm the primary owner review path is available.
3. Confirm the backup review path is available if the change crosses runtime, security, or platform boundaries.
4. Run the staged review entrypoint before merge.
5. Require proof-level discipline that matches the Tier A row, not the minimum convenient local gate.
6. If the backup review path is unavailable, mark the change blocked or re-scope it; do not call the repo diversified.

## Hard Ceiling
- This document can describe the control model and escalation path.
- It cannot manufacture a second enforceable repository owner identity.
- Until another owner identity is mapped into the repo-level enforcement surface, the repo is resilient by policy but still limited in enforceable redundancy.

## Resilience Rules

### 1. Semantic Roles Must Remain Split
Even if one person currently fills multiple roles, the role split in `TIER-A-OWNER-MAP.md` remains mandatory:
- Runtime / i18n maintainer
- Platform maintainer
- Security maintainer
- Lead pipeline maintainer

Reason:
- this prevents one-person reality from collapsing the design model
- it preserves upgrade paths for future maintainers

### 2. Tier A Changes Must Keep a Backup Path
For each Tier A area, define at least:
- one primary owner
- one backup owner role
- one cross-review expectation

If no second maintainer is available yet:
- document the backup role anyway
- treat the gap as an organizational constraint, not as a reason to erase the role

### 3. Bus-Factor Upgrade Trigger
When a second maintainer can be mapped into enforceable repository ownership, the following must happen in the same governance cycle:
1. update `TIER-A-OWNER-MAP.md`
2. update `.github/CODEOWNERS`
3. note the change in the structural governance ledger
4. follow [MAINTAINER-ACTIVATION-CHECKLIST.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/MAINTAINER-ACTIVATION-CHECKLIST.md)

### 4. Single-Maintainer Exception Rule
If one person is the only enforceable owner:
- Tier A changes still require proof-level discipline
- role separation still remains documented
- release-proof remains mandatory for Tier A production-sensitive changes

## Completion Standard
Ownership resilience is considered structurally acceptable when:
- enforceable ownership exists
- semantic backup roles are documented
- the repo has a clear upgrade path for additional maintainers

It is considered fully mature only when:
- at least one additional maintainer is mapped into Tier A backup ownership in both docs and `CODEOWNERS`
- Tier A backup ownership is no longer concentrated in a single fallback identity
- the backup path is not relied on as the only practical review fallback for Tier A work

## Current Classification
- Current state: `multi-maintainer in practice, single enforceable owner identity with Tier A backup review fallback`
- This means the repo has a concrete backup path and more than one active maintainer, but enforceable repository ownership is still concentrated.

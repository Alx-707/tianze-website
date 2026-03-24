# Ownership Resilience

## Purpose
This file defines how repository ownership remains resilient even when current enforceable ownership is concentrated in one maintainer identity.

It complements:
- [TIER-A-OWNER-MAP.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/TIER-A-OWNER-MAP.md)
- [`.github/CODEOWNERS`](/Users/Data/Warehouse/Pipe/tianze-website/.github/CODEOWNERS)

## Current State
- Enforceable repository ownership exists.
- The current enforceable owner pair is:
  - primary: `@Alx-707`
  - backup: `developer@flood-control.com`

This is materially stronger than single-owner enforcement, but still not the desired fully diversified long-term operating model.

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
When a second active maintainer becomes available, the following must happen in the same governance cycle:
1. update `TIER-A-OWNER-MAP.md`
2. update `.github/CODEOWNERS`
3. note the change in the structural governance ledger

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

## Current Classification
- Current state: `dual-owner but still concentrated`
- This means the repo now has backup ownership, but resilience is still sensitive to a small maintainer pool.

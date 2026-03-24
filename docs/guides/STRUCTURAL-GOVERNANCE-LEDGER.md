# Structural Governance Ledger

## Purpose
Track structural governance issues through a real closure lifecycle instead of leaving them as isolated findings.

Status values:
- `open`
- `in_progress`
- `mitigated`
- `closed`

## Ledger

| ID | Issue | Status | Resolution Path |
|---|---|---|---|
| `GOV-001` | Missing `.github/CODEOWNERS` | `closed` | Added `.github/CODEOWNERS` with current repo owner mapping |
| `PROP-001` | Translation quartet lacked explicit cluster governance | `closed` | Added structural change cluster rules, executable cluster review, and runtime-proof guidance |
| `PROP-002` | Lead API family lacked explicit family-wide review treatment | `closed` | Added structural change cluster rules and executable family review helper |
| `PROP-003` | Homepage section cluster lacked explicit review treatment | `closed` | Added structural change cluster rules and executable cluster review helper |
| `RUN-001` | Release-grade runtime proof lacked a serial runbook | `closed` | Added release-proof runbook, executable script, verified `validate:translations`, `build`, `build:cf`, and completed clean E2E execution on the isolated `3100` test server (`106 passed / 3 skipped`) |
| `RULE-001` | Rule drift across policy artifacts | `closed` | Added policy source-of-truth index, marked interim artifacts as superseded, corrected active threshold sources, and reduced active ambiguity to archival-only context |
| `GOV-002` | Governance closure loop too weak | `closed` | Added governance ledger and wired governance artifacts into review flow |
| `BOUND-001` | Legacy/deprecated markers needed an audit mechanism | `closed` | Added legacy marker audit script and verified current production-path findings are zero |
| `DEP-001` | Dependency confidence lacked fresh conformance capture artifact | `closed` | Added dependency conformance capture script and generated zero-violation conformance artifact |
| `OWNER-001` | Tier A owner map was role-based only | `closed` | Added enforceable `.github/CODEOWNERS` using current repo owner mapping |

## Remaining Open Item
- none

## Long-Horizon Optimization Status
- ownership resilience: documented, with multi-maintainer activity in practice but still constrained by a single enforceable repository owner identity and bounded by a hard ceiling until another owner identity is mapped
- release-proof vs release-signoff separation: optimized and documented
- archive hygiene: optimized and audit-backed

## Ownership Activation Reference
- When another maintainer can actually be mapped into enforceable repository ownership, follow:
  - [`MAINTAINER-ACTIVATION-CHECKLIST.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/MAINTAINER-ACTIVATION-CHECKLIST.md)

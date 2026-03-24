# Maintainer Activation Checklist

## Purpose
This checklist defines the minimum repo-local steps required when a second maintainer is ready to be mapped into enforceable Tier A ownership.

It does not create a second maintainer. It only defines how to activate one cleanly when the organization actually provides one and the repository can map that maintainer into its enforcement surface.

## When To Use
Use this checklist only when:
- a real maintainer identity exists and is active
- that maintainer can actually review Tier A changes
- that maintainer can be mapped into the repository owner enforcement surface
- the change is being recorded as an ownership expansion, not just a documentation refresh

## Activation Steps
1. Confirm the maintainer identity is real and active.
2. Confirm the maintainer can cover at least one Tier A backup path.
3. Update [TIER-A-OWNER-MAP.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/TIER-A-OWNER-MAP.md) so the new maintainer is mapped to a concrete Tier A area.
4. Update [`.github/CODEOWNERS`](/Users/Data/Warehouse/Pipe/tianze-website/.github/CODEOWNERS) so the new maintainer is enforceable at the repository level.
5. Update [OWNERSHIP-RESILIENCE.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/OWNERSHIP-RESILIENCE.md) so the current state and remaining ceiling remain accurate.
6. Update [STRUCTURAL-GOVERNANCE-LEDGER.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/STRUCTURAL-GOVERNANCE-LEDGER.md) with a short note that the ownership model changed in the current governance cycle.
7. If the activation changes which documents are canonical or supplemental, update [POLICY-SOURCE-OF-TRUTH.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/POLICY-SOURCE-OF-TRUTH.md) in the same cycle.
8. Run the staged Tier A review flow for the touched paths before treating the activation as complete.

## Completion Standard
Ownership activation is complete only when:
- the new maintainer is present in both the semantic owner map and CODEOWNERS
- the Tier A backup path is no longer concentrated in a single fallback identity
- the governance ledger records the change
- the repo still keeps its proof-level discipline intact

## Hard Ceiling
- If no maintainer can actually be mapped into enforceable repository ownership, stop here.
- Do not simulate diversification by duplicating names or broadening ownership labels without a real mapped owner identity.
- Document the constraint instead of hiding it.

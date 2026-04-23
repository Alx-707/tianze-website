# Archive Hygiene

## Purpose
This file defines how planning, review, and policy artifacts should age without polluting the active rule surface.

Use this with:
- [POLICY-SOURCE-OF-TRUTH.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/POLICY-SOURCE-OF-TRUTH.md)

## Hygiene Rules

### 1. Active vs Supplemental vs Superseded
Every important governance or audit document should be in one of three states:
- active canonical
- supplemental
- superseded

If a document is not canonical, it must not silently appear canonical.

### 2. Superseded Marker
When a newer report replaces an older one:
- add a short banner at the top of the older file
- link to the current replacement

### 3. Canonical Updates First
When a rule changes:
1. update the canonical source first
2. then update supplemental summaries
3. do not reverse this order

### 4. Historical Material Does Not Mean Current
Anything intentionally retired from the live docs tree, or explicitly marked as supplemental/superseded, should not be treated as a live rule source.
If a file outside the current docs surface still claims to be current, verify that claim against [POLICY-SOURCE-OF-TRUTH.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/POLICY-SOURCE-OF-TRUTH.md) before treating it as canonical.

## Ongoing Maintenance
- When a new policy file is introduced, decide whether it is canonical or supplemental.
- When a new report supersedes an old one, mark the old one immediately.

## Completion Standard
Archive hygiene is considered healthy when:
- active canonical sources are indexed
- supplemental files point to canonical files
- superseded files are visibly marked

This repository currently meets that standard for the structural governance surface listed in the policy index.

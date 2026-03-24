# Release Signoff

## Purpose
This file defines the boundary between:
- `release-proof`
- `release signoff`

These are not the same thing.

Use this with:
- [QUALITY-PROOF-LEVELS.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [RELEASE-PROOF-RUNBOOK.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/RELEASE-PROOF-RUNBOOK.md)

## Definitions

### Release-Proof
Means:
- the technical proof bundle was run
- required builds/tests/critical checks passed
- the change has strong technical confidence

Release-proof is an evidence state.

### Release Signoff
Means:
- a human or release authority accepts the release decision
- technical proof has been reviewed
- known risks are accepted
- the change is approved for release in context

Release signoff is a decision state.

## Rule
- Technical proof does not equal signoff.
- A successful `proof:release:tier-a` run does not by itself authorize release.
- A release decision must still be explicitly made by the responsible owner/release process.

## Minimal Signoff Inputs
Before signoff, reviewers should have:
- release-proof evidence
- current structural audit report
- known-risk review for the affected Tier A areas

## Why This Exists
The repository now has a strong release-proof path.
This document prevents future process drift where engineers start treating proof scripts as the release decision itself.

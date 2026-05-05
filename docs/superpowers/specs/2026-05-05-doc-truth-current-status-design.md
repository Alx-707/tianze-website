# Doc Truth Current Status Design

Date: 2026-05-05

## Goal

Stop future agents from treating old audit reports and old execution plans as current project truth.

## Problem

The repository contains useful historical material, but some old files still read like current conclusions. The highest-risk examples are the 2026-04-29 full-repo audit reports and the Wave 1 business asset checklist under `docs/superpowers/current/`.

Those files can still be useful as evidence, but their numbers, issue lists, and "current" wording have drifted. Agents that grep first and read context later can copy stale claims back into new reports.

## Approved approach

Use a conservative documentation patch first, then slim the live docs tree when
old execution material is clearly no longer current:

1. Add `docs/CURRENT-STATUS.md` as the first place an agent should read.
2. Mark the most misleading old files as historical snapshots.
3. Update `docs/README.md` and `docs/guides/POLICY-SOURCE-OF-TRUTH.md` so the repository points to the new entry.
4. Keep old audit artifacts in place because they are still useful evidence.
5. Move completed Superpowers execution plans and old handoff prompts out of
   the live docs tree with Trash-first cleanup, so they remain recoverable but
   are not read as current work.

## Non-goals

- Do not change application code.
- Do not replace launch assets.
- Do not repair mutation-test scripts in this pass.
- Do not claim a full release verification.
- Do not permanently delete historical documents.
- Do not keep completed PR execution plans in `docs/superpowers/plans/` just
  because they were recently restored from a stash.

## Acceptance criteria

- A future agent can find the current status from `docs/README.md`.
- Old reports that say "final" or "authoritative" tell readers they are historical snapshots.
- The current true issue list separates owner asset gaps, deployed proof gaps, parked Cloudflare work, and stale-doc cleanup.
- `docs/superpowers/plans/` contains only the current docs-governance plan.
- `docs/superpowers/prompts/` contains only the prompt still referenced by
  current technical debt.
- Verification uses small, fresh checks that are enough for a docs-only change.

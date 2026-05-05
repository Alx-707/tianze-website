# Superpowers archive note

Date: 2026-05-05

This directory has been slimmed down so current agents do not read old execution plans as current truth.

## What stayed

- `current/`: near-current notes that are still useful, with historical warnings where needed.
- `specs/`: compact design records that explain decisions.
- `plans/2026-05-05-doc-truth-current-status.md`: the current docs-governance plan.
- `prompts/legacy-do-cleanup-review-swarm.md`: still referenced by TD-003 for a future read-only review.

## What moved out

Most completed historical execution plans under `docs/superpowers/plans/` and old handoff prompts under `docs/superpowers/prompts/` were moved to:

```text
/Users/Data/.Trash/tianze-superpowers-doc-slim-20260505-002500/
```

Additional restored-but-not-current materials were moved to:

```text
/Users/Data/.Trash/tianze-doc-truth-slim-20260505-050320/
```

That second batch includes the already-merged deep-review execution plan, its
design draft, and UI inspiration notes that should not sit in the live project
truth tree.

This was a reversible Trash-first cleanup, not permanent deletion.

## How to recover

Use git history for normal lookup. If local recovery is needed before Trash is emptied, restore files from the Trash batch above.

Do not treat restored plans as current truth unless `docs/CURRENT-STATUS.md` or `docs/guides/POLICY-SOURCE-OF-TRUTH.md` explicitly points to them.

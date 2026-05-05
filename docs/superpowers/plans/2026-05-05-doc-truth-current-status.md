# Doc Truth Current Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a current status entry and reduce stale historical-doc noise without permanent deletion.

**Architecture:** Keep current truth in one short top-level document, then make older reports self-disqualify as current truth. The docs index and policy index route readers to that entry before they read old audits. Completed execution plans and old prompt bundles should leave the live docs tree through Trash-first cleanup.

**Tech Stack:** Markdown documentation only.

---

### Task 1: Add the current status entry

**Files:**
- Create: `docs/CURRENT-STATUS.md`

- [ ] Write the current status page with a fresh 2026-05-05 snapshot.
- [ ] Include the current true issue table.
- [ ] Include a short stale-claim correction table.
- [ ] Include the smallest command set future agents should run before updating the status.

### Task 2: Mark high-risk historical files

**Files:**
- Modify: `docs/audits/full-project-health-v2/runs/2026-04-29-full-repo-audit/00-final-report.md`
- Modify: `docs/audits/full-project-health-v2/runs/2026-04-29-full-repo-audit/05-authoritative-quality-report.md`
- Modify: `docs/superpowers/current/2026-04-26-wave1-business-assets-checklist.md`

- [ ] Add a top warning to the two audit reports.
- [ ] Add a top warning to the Wave 1 checklist.
- [ ] Preserve the historical content below the warning.

### Task 3: Update entry indexes

**Files:**
- Modify: `docs/README.md`
- Modify: `docs/guides/POLICY-SOURCE-OF-TRUTH.md`

- [ ] Add `docs/CURRENT-STATUS.md` as the first status entry.
- [ ] Clarify that old audits, plans, and prompts are evidence, not current truth.
- [ ] Preserve the existing canonical source list.

### Task 4: Verify the docs-only patch

**Files:**
- Read: changed files

- [ ] Search for the new routing language.
- [ ] Run markdown/script-safe diff checks.
- [ ] Report that no application tests were required beyond the fresh evidence checks used to populate `docs/CURRENT-STATUS.md`.

### Task 5: Slim completed Superpowers artifacts

**Files:**
- Move out of live docs tree: completed historical files under `docs/superpowers/plans/`
- Move out of live docs tree: old prompt bundles under `docs/superpowers/prompts/`
- Keep: `docs/superpowers/plans/2026-05-05-doc-truth-current-status.md`
- Keep: `docs/superpowers/prompts/legacy-do-cleanup-review-swarm.md`

- [ ] Move completed historical Superpowers plans and old prompts to a recoverable Trash batch.
- [ ] Keep only the current docs-governance plan in `plans/`.
- [ ] Keep only the prompt still referenced by current technical debt in `prompts/`.
- [ ] Update `docs/superpowers/ARCHIVE-NOTE.md` with the Trash batch path.

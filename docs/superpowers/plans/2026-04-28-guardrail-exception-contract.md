# Guardrail Exception Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep production structural guardrails as hard fails while allowing narrow, registered, reviewable exceptions that preserve real boundaries.

**Architecture:** Reuse the existing `scripts/check-eslint-disable-usage.js` guard instead of adding a new scanner. Extend it to recognize production structural guardrail disables, require a `guardrail-exception` ID, verify the ID against `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`, and run it from both `lint:check` and `quality:gate`.

**Tech Stack:** Node.js CommonJS scripts · ESLint flat config · Vitest · Superpowers docs

---

## File Structure

- Modify: `.claude/rules/code-quality.md`
  - Document production structural exception syntax and review requirements.
- Modify: `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`
  - Add active production exception registry rows for current valid structural disables.
- Modify: `scripts/check-eslint-disable-usage.js`
  - Export source-level analysis helpers.
  - Require registered `guardrail-exception` IDs for production structural disables.
- Create: `tests/unit/scripts/check-eslint-disable-usage.test.ts`
  - Cover registered, missing-ID, unregistered-ID, non-structural, and test-file cases.
- Modify: `scripts/quality-gate.js`
  - Run the disable registry check as part of code quality.
- Modify: `package.json`
  - Run the disable registry check in `lint:check`.
- Modify: existing production files with structural disables
  - Add registered exception IDs to existing narrow disables.

## Tasks

### Task 1: Add tests for exception contract

- [x] Create `tests/unit/scripts/check-eslint-disable-usage.test.ts`.
- [x] Assert registered production structural exceptions pass.
- [x] Assert missing or unregistered production exception IDs fail.
- [x] Assert ordinary non-structural production disables still only need a reason.
- [x] Assert test-file structural disables do not need guardrail registry IDs.

### Task 2: Extend eslint-disable checker

- [x] Add structural guardrail rule list.
- [x] Add `guardrail-exception` ID parser.
- [x] Add register ID parser for `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`.
- [x] Add source-level analyzer export for unit tests.
- [x] Keep existing rule-name and reason checks unchanged.

### Task 3: Register current production exceptions

- [x] Add an active exception registry section to `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`.
- [x] Update existing production structural disable comments with matching IDs.
- [x] Document why each exception preserves a real boundary.

### Task 4: Wire checks into local and CI gates

- [x] Add `pnpm eslint:disable:check` to `lint:check`.
- [x] Add an eslint-disable registry check to `scripts/quality-gate.js`.
- [x] Include failures in code-quality gate issues.

### Task 5: Verify

- [x] Run `pnpm exec vitest run tests/unit/scripts/check-eslint-disable-usage.test.ts`.
- [x] Run `pnpm eslint:disable:check`.
- [x] Run `pnpm lint:check`.

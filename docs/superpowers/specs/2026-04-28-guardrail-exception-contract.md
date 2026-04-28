# Guardrail Exception Contract Spec

## Decision

Production structural guardrails stay hard-fail by default. A production exception is allowed only when splitting code would make the real boundary harder to read, harder to test, or less faithful to the business/security flow.

## Scope

This spec covers numeric and structural ESLint guardrails:

- `max-lines`
- `max-lines-per-function`
- `complexity`
- `max-depth`
- `max-params`
- `max-statements`
- `max-nested-callbacks`

It does not relax runtime correctness, security, privacy, deployment, import-boundary, or type-safety rules.

## Contract

Production code may suppress one of the structural guardrails only with all of the following:

1. the smallest possible ESLint disable scope;
2. the exact disabled rule name;
3. a reason using `guardrail-exception <ID>: <real boundary and why splitting harms it>`;
4. a matching row in `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`;
5. verification evidence describing what still protects the behavior or source boundary.

The exception ID format is `GSE-YYYYMMDD-short-slug`.

## Non-goals

- Do not lower production thresholds.
- Do not convert production structural rules to warning-only.
- Do not create generic escape hatches such as broad file-level disables.
- Do not force existing valid exceptions into cosmetic refactors just to remove a disable.

## Acceptance Criteria

- `pnpm eslint:disable:check` fails when production structural guardrail disables lack a registered exception ID.
- `pnpm eslint:disable:check` fails when the exception ID is missing from the guardrail register.
- `pnpm eslint:disable:check` passes for registered production structural exceptions.
- `pnpm lint:check` includes the exception registry check.
- `pnpm quality:gate` includes the exception registry check.
- `.claude/rules/code-quality.md` explains the exception workflow in human terms.

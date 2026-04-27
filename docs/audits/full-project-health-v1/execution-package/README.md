# Full Project Health Audit v1 - Conductor Execution Package

This directory is being assembled as the single self-contained execution source for Full Project Health Audit v1.

Do not assume access to other chats. Do not assume old repo reports are current. Old reports are only clues; fresh evidence from this run wins.

This package is not ready for worker dispatch until every file in the required reading order exists, `06-self-review-checklist.md` passes, and the package is committed to an audit package branch. `.context/` is scratch-only and is not the cross-workspace source of truth.

## Audit Run

- Run name: Audit Run 1 - origin/main clean baseline
- Target base: `origin/main`
- Product-code posture: read-only
- Business-code fixes: forbidden in this run
- Launch-readiness dirty work: excluded unless a later checkpoint commit is explicitly named
- Execution package root: `docs/audits/full-project-health-v1/execution-package/`
- Audit artifact root: `docs/audits/full-project-health-v1/`
- Workspace scratch root: `.context/audits/full-project-health-v1/`

## Worker model

- 1 orchestrator owns scope, dedupe, severity, final judgment, and process retro.
- 6 lane workers own scoped evidence collection and lane reports only.
- Lane workers do not fix code and do not decide the final repo verdict.

## Required reading order

1. `00-preflight-contract.md`
2. `01-report-contract.md`
3. `04-stop-lines.md`
4. `02-orchestrator-prompt.md` or the matching `03-worker-prompts/lane-*.md`
5. `06-self-review-checklist.md` before handing off results

## Audit lanes

| Lane | Name | Output |
| --- | --- | --- |
| 00 | Baseline / runtime truth | `docs/audits/full-project-health-v1/lanes/00-baseline-runtime.md` |
| 01 | Architecture / coupling | `docs/audits/full-project-health-v1/lanes/01-architecture-coupling.md` |
| 02 | Security / trust boundary | `docs/audits/full-project-health-v1/lanes/02-security-trust-boundary.md` |
| 03 | UI / performance / accessibility | `docs/audits/full-project-health-v1/lanes/03-ui-performance-accessibility.md` |
| 04 | SEO / content / conversion | `docs/audits/full-project-health-v1/lanes/04-seo-content-conversion.md` |
| 05 | Tests / AI smell / dead code | `docs/audits/full-project-health-v1/lanes/05-tests-ai-smell-dead-code.md` |

## Non-negotiables

- Every P0/P1 finding needs fresh evidence.
- Every blocked claim must state exactly why it is blocked.
- `pnpm build` and `pnpm build:cf` must never run in parallel.
- Google, Cloudflare, Resend, Airtable, or dashboard-dependent claims must be marked `Blocked` if credentials are unavailable.
- Findings are downgraded if evidence is weak.
- The final report must distinguish project problems, environment problems, credential problems, and audit-process problems.
- Never permanently delete files. Do not use `rm`, `rmdir`, `unlink`, `find -delete`, `git clean`, or similar irreversible deletion commands.

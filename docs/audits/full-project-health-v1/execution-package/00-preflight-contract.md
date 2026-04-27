# Preflight Contract

Preflight answers whether the audit can start. It is not the audit.

## Required answers before any lane starts

1. Confirm the target base branch is `origin/main` for Audit Run 1.
2. What exact commit SHA is being audited?
3. Is the current worktree clean?
4. Is launch-readiness dirty work included?
5. Which report files may be written?
6. Which business-code files must not be modified?
7. Which commands will be run?
8. Which commands may be blocked by credentials or local environment?

## Package readiness proof

Do this before writing any preflight evidence. The execution package is not ready if required files are missing, untracked, or uncommitted.

Run:

```bash
for file in \
  docs/audits/full-project-health-v1/execution-package/README.md \
  docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md \
  docs/audits/full-project-health-v1/execution-package/01-report-contract.md \
  docs/audits/full-project-health-v1/execution-package/02-orchestrator-prompt.md \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-00-baseline-runtime.md \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-01-architecture-coupling.md \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-02-security-trust-boundary.md \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-03-ui-performance-accessibility.md \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-04-seo-content-conversion.md \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-05-tests-ai-smell-dead-code.md \
  docs/audits/full-project-health-v1/execution-package/04-stop-lines.md \
  docs/audits/full-project-health-v1/execution-package/05-process-retro-template.md \
  docs/audits/full-project-health-v1/execution-package/06-self-review-checklist.md \
  docs/audits/full-project-health-v1/lanes/.gitkeep \
  docs/audits/full-project-health-v1/evidence/screenshots/.gitkeep
do
  test -f "$file" || exit 1
done

git status --short --untracked-files=all -- \
  docs/audits/full-project-health-v1/execution-package \
  docs/audits/full-project-health-v1/lanes/.gitkeep \
  docs/audits/full-project-health-v1/evidence/screenshots/.gitkeep \
  docs/superpowers/plans/2026-04-27-full-project-health-audit-v1-conductor.md
```

Expected: file loop exits 0, and `git status` prints no output.

If a required file is missing, stop with:

```text
Blocked: audit execution package unavailable or incomplete.
```

If `git status` prints output, stop with:

```text
Blocked: audit execution package is not committed; do not dispatch workers.
```

Audit Run 1 is fixed to `origin/main`. If a different base is needed, stop and update this package before auditing.

## Baseline commands

Run these in the orchestrator workspace:

```bash
git fetch origin
git rev-parse origin/main
git rev-parse HEAD
git status --short --branch
node -v
pnpm -v
pnpm run
```

Record outputs in `docs/audits/full-project-health-v1/evidence/preflight.md`.

## Clean baseline proof

If the execution package was committed to an audit branch, HEAD may differ from `origin/main` only by audit package/report artifacts.

Run both checks:

```bash
git diff --name-only origin/main...HEAD -- \
  ':!docs/audits/full-project-health-v1/**' \
  ':!docs/superpowers/plans/2026-04-27-full-project-health-audit-v1-conductor.md' \
  ':!.context/audits/full-project-health-v1/**'

git status --short --untracked-files=all -- \
  ':!docs/audits/full-project-health-v1/**' \
  ':!docs/superpowers/plans/2026-04-27-full-project-health-audit-v1-conductor.md' \
  ':!.context/audits/full-project-health-v1/**'
```

Expected: both commands print no output.

If there is output, stop with:

```text
Blocked: business-code diff exists relative to origin/main clean baseline.
```

## Run metadata

Only the orchestrator may create or update `docs/audits/full-project-health-v1/run-metadata.md` with:

```text
Audit run id:
Started at:
Orchestrator workspace:
Base branch:
Base commit:
Audit package commit:
Node:
pnpm:
Included dirty work:
Credential availability:
```

## Baseline decision

Use this exact decision block:

```text
Audit target: origin/main @ <SHA>
Local HEAD: <SHA>
Worktree state: clean | audit-package diff only | dirty business-code diff
Launch-readiness dirty work: excluded | included by checkpoint <SHA>
Audit can start: yes | no
Reason if no: <one sentence>
```

## Allowed and forbidden writes

Default rule: if a path is not explicitly allowed here, do not write it.

Allowed for orchestrator preflight:

```text
docs/audits/full-project-health-v1/run-metadata.md
docs/audits/full-project-health-v1/evidence/preflight.md
.context/audits/full-project-health-v1/**
```

Allowed for lane workers:

```text
docs/audits/full-project-health-v1/lanes/<assigned-lane-file>.md
docs/audits/full-project-health-v1/evidence/<assigned-lane>/**
docs/audits/full-project-health-v1/evidence/screenshots/<assigned-lane>/**
.context/audits/full-project-health-v1/**
```

Allowed for orchestrator final consolidation:

```text
docs/audits/full-project-health-v1/00-final-report.md
docs/audits/full-project-health-v1/01-quality-map.md
docs/audits/full-project-health-v1/02-findings.json
docs/audits/full-project-health-v1/03-evidence-log.md
docs/audits/full-project-health-v1/04-process-retro.md
.context/audits/full-project-health-v1/**
```

Read-only after package commit:

```text
docs/audits/full-project-health-v1/execution-package/**
docs/superpowers/plans/2026-04-27-full-project-health-audit-v1-conductor.md
```

Forbidden unless a later repair plan explicitly authorizes it:

```text
*
src/**
content/**
messages/**
package.json
pnpm-lock.yaml
next.config.*
open-next.config.*
wrangler.*
.github/workflows/**
public/**
```

## Command policy

- `pnpm build` and `pnpm build:cf` are serial commands. Do not run them in parallel.
- Do not run deploy commands.
- Do not run production-mutating commands.
- Do not run full mutation testing automatically.
- If a command is missing from `package.json`, record `Blocked: script unavailable`.
- If a command needs credentials, record `Blocked: credentials unavailable`.

## Old report usage rule

- Old reports can generate checklists.
- Old report conclusions are not fresh evidence.
- Old command outputs cannot be reused as this run's execution evidence.
- If an old path no longer exists, it cannot remain a finding without fresh proof.
- If old reports conflict with fresh evidence, fresh evidence wins.
- Old reports cannot support P0/P1 by themselves.

## Preflight stop conditions

Stop before lane work if:

- base branch or commit is unclear
- worktree contains unexpected business-code changes
- a planned command references a package script that is missing or renamed
- Node or pnpm is clearly incompatible with project requirements
- build failure cannot be classified as project, environment, or credential issue

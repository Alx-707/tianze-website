# Full Project Health Audit v1 Conductor Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 Full Project Health Audit v1 压缩成一套 Conductor 可直接分发的执行包，包含主控说明、worker prompt、lane 边界、产物目录、证据合同和 stop line。

**Architecture:** 本计划不审业务代码、不修业务代码，只创建审查执行材料。可分发执行包落在 tracked path `docs/audits/full-project-health-v1/execution-package/`，并建议形成 audit package commit，保证所有 Conductor worker 从同一份真相源派生；`.context/audits/full-project-health-v1/` 只作为单个 workspace 的临时 scratch / evidence 区，不作为跨 workspace 分发源。Audit Run 1 默认只覆盖 `origin/main` clean baseline，不包含任何未 checkpoint 的 launch-readiness dirty work。

**Tech Stack:** Conductor workspaces · Superpowers workflow · Next.js 16.2 / React 19.2 repo · pnpm verification scripts · Markdown audit artifacts · JSON findings contract

---

## Scope Contract

本计划产出的不是审查结论，而是审查执行包。

本轮执行范围：

- 创建 `docs/audits/full-project-health-v1/execution-package/` 下的 Conductor 执行材料。
- 明确 Audit Run 1 的基线、产物、证据等级、严重度、lane 边界和 stop line。
- 给 orchestrator 和 6 个 lane worker 提供可复制 prompt。
- 给最终报告提供统一结构和 findings JSON 合同。
- 允许创建一个仅包含审查执行材料的 audit package commit，作为后续 Conductor worker 的共同起点。

本轮不做：

- 不修改 `src/**`、`content/**`、`messages/**`、`package.json`、`pnpm-lock.yaml`、Cloudflare 配置或任何业务代码。
- Package creation run 不运行完整审查 lane。
- Package creation run 不跑 `pnpm build`、`pnpm build:cf`、`pnpm test:mutation` 这类重型验证。
- Audit execution run 里，Lane 00 可以串行运行 `pnpm build` 和 `pnpm build:cf`；`pnpm test:mutation` 默认不自动全跑，只读取现有报告或提供手动命令。
- 不发布部署、不创建 PR、不合并到 `main`，除非用户后续明确要求。

## Distribution Contract

`.context/` 在当前 Conductor worktree 中是 gitignored / excluded 的，本身不能作为多工作区共享真相源。执行包分发必须二选一：

1. 推荐：把 `docs/audits/full-project-health-v1/execution-package/**` 提交到 audit package branch，例如 `chore(audit): add full project health audit v1 conductor package`，所有 worker 从该 commit 派生。
2. 备选：不提交 package，但每个 worker prompt 必须完整粘贴共同合同和 lane prompt。这个方式容易版本漂移，不推荐。

本计划默认采用推荐方式。

## Write Path Contract

Allowed write paths during package creation:

- `docs/superpowers/plans/2026-04-27-full-project-health-audit-v1-conductor.md`
- `docs/audits/full-project-health-v1/execution-package/**`
- `.context/audits/full-project-health-v1/**` only for scratch notes generated in this workspace

Allowed write paths during audit execution:

- `docs/audits/full-project-health-v1/lanes/**`
- `docs/audits/full-project-health-v1/evidence/**`
- `docs/audits/full-project-health-v1/00-final-report.md`
- `docs/audits/full-project-health-v1/01-quality-map.md`
- `docs/audits/full-project-health-v1/02-findings.json`
- `docs/audits/full-project-health-v1/03-evidence-log.md`
- `docs/audits/full-project-health-v1/04-process-retro.md`

Forbidden write paths unless a later repair plan explicitly authorizes them:

- `src/**`
- `content/**`
- `messages/**`
- `package.json`
- `pnpm-lock.yaml`
- `next.config.*`
- `open-next.config.*`
- `wrangler.*`
- `.github/workflows/**`
- `public/**`

Never permanently delete files. Do not use `rm`, `rmdir`, `unlink`, `find -delete`, `git clean`, or similar irreversible deletion commands.

## File Structure

执行本计划时只创建审查执行材料：

```text
docs/audits/full-project-health-v1/
  execution-package/
    README.md
    00-preflight-contract.md
    01-report-contract.md
    02-orchestrator-prompt.md
    03-worker-prompts/
      _lane-report-template.md
      lane-00-baseline-runtime.md
      lane-01-architecture-coupling.md
      lane-02-security-trust-boundary.md
      lane-03-ui-performance-accessibility.md
      lane-04-seo-content-conversion.md
      lane-05-tests-ai-smell-dead-code.md
    04-stop-lines.md
    05-process-retro-template.md
    06-self-review-checklist.md
  lanes/
  evidence/
    screenshots/
  run-metadata.md
  00-final-report.md
  01-quality-map.md
  02-findings.json
  03-evidence-log.md
  04-process-retro.md

.context/audits/full-project-health-v1/
  scratch.md
```

Legacy v1 draft paths under `.context/audits/full-project-health-v1/` are not used as the cross-workspace source of truth. They are scratch only.

执行本计划时只创建审查执行材料：

```text
docs/audits/full-project-health-v1/execution-package/
  README.md
  00-preflight-contract.md
  01-report-contract.md
  02-orchestrator-prompt.md
  03-worker-prompts/
    lane-00-baseline-runtime.md
    lane-01-architecture-coupling.md
    lane-02-security-trust-boundary.md
    lane-03-ui-performance-accessibility.md
    lane-04-seo-content-conversion.md
    lane-05-tests-ai-smell-dead-code.md
  04-stop-lines.md
  05-process-retro-template.md
  06-self-review-checklist.md
```

职责边界：

- `README.md`：给所有 Conductor worker 的入口说明，声明这是唯一自包含执行真相源。
- `00-preflight-contract.md`：只定义开审前必须确认的事实，不产出审查判断。
- `01-report-contract.md`：统一证据等级、严重度、findings JSON、最终报告结构。
- `02-orchestrator-prompt.md`：主控 workspace 的完整 prompt。
- `03-worker-prompts/_lane-report-template.md`：所有 lane report 的统一模板，降低 orchestrator 合并成本。
- `03-worker-prompts/*.md`：每个 lane 的独立 prompt，worker 只读审查、只写自己的 lane report。
- `04-stop-lines.md`：遇到哪些情况必须停，不要硬审。
- `05-process-retro-template.md`：审查流程复盘模板。
- `06-self-review-checklist.md`：执行包写完后自检，防止 prompt 漏边界或证据合同。

---

## Task 1: Create the audit execution package directory

**Files:**

- Create: `docs/audits/full-project-health-v1/execution-package/README.md`
- Create: `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/.gitkeep`
- Create: `docs/audits/full-project-health-v1/lanes/.gitkeep`
- Create: `docs/audits/full-project-health-v1/evidence/screenshots/.gitkeep`
- Create directories:
  - `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/`
  - `docs/audits/full-project-health-v1/lanes/`
  - `docs/audits/full-project-health-v1/evidence/screenshots/`
  - `.context/audits/full-project-health-v1/`

- [ ] **Step 1: Create the directories**

Run:

```bash
mkdir -p \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts \
  docs/audits/full-project-health-v1/lanes \
  docs/audits/full-project-health-v1/evidence/screenshots \
  .context/audits/full-project-health-v1
```

Expected: command exits with status 0.

- [ ] **Step 2: Add tracked placeholders for empty directories**

Run:

```bash
touch \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts/.gitkeep \
  docs/audits/full-project-health-v1/lanes/.gitkeep \
  docs/audits/full-project-health-v1/evidence/screenshots/.gitkeep
```

Expected: command exits with status 0.

- [ ] **Step 3: Write the package README**

Create `docs/audits/full-project-health-v1/execution-package/README.md` with this content:

````markdown
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
````

- [ ] **Step 4: Verify the README and placeholders exist**

Run:

```bash
test -f docs/audits/full-project-health-v1/execution-package/README.md
test -f docs/audits/full-project-health-v1/execution-package/03-worker-prompts/.gitkeep
test -f docs/audits/full-project-health-v1/lanes/.gitkeep
test -f docs/audits/full-project-health-v1/evidence/screenshots/.gitkeep
```

Expected: command exits with status 0.

---

## Task 2: Write the preflight contract

**Files:**

- Create: `docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md`
- Create during audit execution: `docs/audits/full-project-health-v1/run-metadata.md`
- Create during audit execution: `docs/audits/full-project-health-v1/evidence/preflight.md`

- [ ] **Step 1: Create the preflight contract**

Create `docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md` with this content:

````markdown
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
````

- [ ] **Step 2: Verify preflight contract is concrete**

Run:

```bash
rg -n "[T]BD|[T]ODO|[f]ill in details|[i]mplement later|[S]imilar to Task" docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md
```

Expected: no output.

---

## Task 3: Write the report and findings contract

**Files:**

- Create: `docs/audits/full-project-health-v1/execution-package/01-report-contract.md`
- Create: `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md`

- [ ] **Step 1: Create the report contract**

Create `docs/audits/full-project-health-v1/execution-package/01-report-contract.md` with this content:

````markdown
# Report Contract

All lane reports and the final orchestrator report must use this contract.

## Evidence levels

| Level | Meaning |
| --- | --- |
| Confirmed by execution | Verified by a real command, test, build, page visit, API call, screenshot, or generated report from this run |
| Confirmed by static evidence | Verified by current code or config reading, without runtime execution |
| Strong hypothesis | Evidence is strong, but one decisive runtime proof is still missing |
| Weak signal | Suspicious pattern only; needs follow-up before it can drive priority |
| Blocked | Environment, credential, permission, missing script, or missing external data prevents confirmation |

## Severity

| Severity | Meaning |
| --- | --- |
| P0 | Website cannot build/deploy, inquiry flow is broken, clear security risk, or real buyer cannot complete a critical action |
| P1 | Should be fixed before public launch; high regression, trust, SEO, conversion, security, or maintenance risk |
| P2 | Schedule for cleanup; medium maintainability, coupling, UX, or proof-quality cost |
| P3 | Optimization, style consistency, small UX improvement, or documentation cleanup |

## Finding JSON shape

```json
[
  {
    "id": "FPH-001",
    "title": "Short finding title",
    "severity": "P1",
    "domain": "architecture | security | performance | seo | ui | tests | ai-smell | conversion",
    "confidence": "high | medium | low",
    "evidence_level": "Confirmed by execution | Confirmed by static evidence | Strong hypothesis | Weak signal | Blocked",
    "evidence": [
      {
        "type": "file | command | runtime | screenshot | report",
        "reference": "exact file path, command, or artifact",
        "summary": "what this proves"
      }
    ],
    "impact": "owner-readable business impact",
    "root_cause": "why this exists",
    "recommended_fix": "delete-first or simplify-first repair direction",
    "verification_needed": "how to prove the fix later"
  }
]
```

`02-findings.json` must be a JSON array. No Markdown fences, no comments, no trailing commas. Validate with:

```bash
jq . docs/audits/full-project-health-v1/02-findings.json
```

## Final report files

The orchestrator writes these interim files first:

```text
docs/audits/full-project-health-v1/00-final-report.md
docs/audits/full-project-health-v1/01-quality-map.md
docs/audits/full-project-health-v1/02-findings.json
docs/audits/full-project-health-v1/03-evidence-log.md
docs/audits/full-project-health-v1/04-process-retro.md
```

`.context/audits/full-project-health-v1/` may store temporary scratch notes, but it is not the final report root.

## Final report sections

```markdown
# Tianze Full Project Health Audit v1

## 0. Executive Summary
## 1. Audit Scope and Baseline
## 2. Current Quality Verdict
## 3. P0 / P1 Findings
## 4. Architecture and Coupling Map
## 5. Security and Trust Boundary Findings
## 6. UI / Performance / Accessibility Findings
## 7. SEO / Content / Conversion Findings
## 8. Test Value and AI-Smell Findings
## 9. Change-Cost Map
## 10. Delete-First Repair Plan
## 11. Recommended Repair Sequence
## 12. What We Could Not Prove
## 13. Process Retro
## Appendix A: Evidence Log
## Appendix B: Full Findings JSON
```

## Linus Gate labels

Every high-priority finding gets one of these labels:

- `Keep`
- `Simplify`
- `Delete`
- `Needs proof`

The final report must explain why the label was chosen.
````

- [ ] **Step 2: Create the lane report template**

Create `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md` with this content:

````markdown
# Lane XX - <Name>

## 1. Scope

## 2. Fresh Evidence Collected

| Evidence | Type | Result | Notes |
| --- | --- | --- | --- |

## 3. Commands Run

| Command | Result | Classification |
| --- | --- | --- |

## 4. Findings

### FPH-LXX-001: <title>

- Severity:
- Evidence level:
- Confidence:
- Domain:
- Evidence:
- Business impact:
- Root cause:
- Recommended fix:
- Verification needed:

## 5. Blocked / Not Proven

## 6. Handoff to Orchestrator

## 7. Process Notes
````

- [ ] **Step 3: Verify JSON block, lane template, and severity terms exist**

Run:

```bash
rg -n "\"id\": \"FPH-001\"|P0|P1|Confirmed by execution|Linus Gate|jq" docs/audits/full-project-health-v1/execution-package/01-report-contract.md
test -f docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md
```

Expected: each searched concept appears at least once.

---

## Task 4: Write the orchestrator prompt

**Files:**

- Create: `docs/audits/full-project-health-v1/execution-package/02-orchestrator-prompt.md`

- [ ] **Step 1: Create the orchestrator prompt**

Create `docs/audits/full-project-health-v1/execution-package/02-orchestrator-prompt.md` with this content:

````markdown
# Orchestrator Prompt

任务：Tianze Full Project Health Audit v1

你是本轮审查的 orchestrator。你的工作不是亲自审完整个仓库，而是建立审查基线、分发 lane、挑战 worker 结论、去重、合并根因、排序、执行 Linus Gate，并输出最终报告和 process retro。

这是本次任务唯一的自包含执行真相源。不要假设你能看到其他聊天上下文。不要假设仓库里的旧报告一定是最新的。旧报告只能作为线索，不能作为最终证据。

## 执行原则

1. 本轮是 read-only audit，不修业务代码。
2. Audit Run 1 默认从 `origin/main` clean baseline 开始。
3. 当前 launch-readiness dirty work 不包含在本轮，除非用户提供明确 checkpoint commit。
4. 所有 P0/P1 必须有 fresh evidence。
5. worker 只写自己的 lane report，不改业务代码。
6. worker 不给最终 repo verdict。
7. 你负责把 worker 结论降噪、降级、去重和合并根因。
8. 严重度用 P0/P1/P2/P3。
9. 证据等级用 `Confirmed by execution` / `Confirmed by static evidence` / `Strong hypothesis` / `Weak signal` / `Blocked`。
10. 最终报告必须包含 process retro，用来评估这套审查方案本身是否有效。

## First step: preflight only

不要直接开始审查。先读取：

```text
docs/audits/full-project-health-v1/execution-package/README.md
docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md
docs/audits/full-project-health-v1/execution-package/01-report-contract.md
docs/audits/full-project-health-v1/execution-package/04-stop-lines.md
```

Preflight 必须回答：

1. 当前 base branch / commit 是什么？
2. 当前只做哪个 audit run？
3. 本轮是否包含 launch-readiness dirty work？
4. 会写哪些报告文件？
5. 不会改哪些业务代码？
6. 会跑哪些验证命令？
7. 哪些命令可能因为凭证或环境阻塞？
8. audit package commit 是什么？
9. 业务代码相对 `origin/main` 是否零差异？

## Lane plan

分发 6 个独立 lane：

- Lane 00: Baseline / runtime truth
- Lane 01: Architecture / coupling
- Lane 02: Security / trust boundary
- Lane 03: UI / performance / accessibility
- Lane 04: SEO / content / conversion
- Lane 05: Tests / AI smell / dead code

每个 lane worker 只能写：

```text
docs/audits/full-project-health-v1/lanes/<lane-file>.md
docs/audits/full-project-health-v1/evidence/**
```

## Final consolidation rules

最终整合时必须：

1. 去重，不重复堆问题。
2. 合并同根因问题。
3. 把低证据问题降级。
4. 区分项目问题、环境问题、凭证问题、流程问题。
5. 对 P0/P1/P2 做 Linus Gate：`Keep` / `Simplify` / `Delete` / `Needs proof`。
6. 输出质量地图、变更成本地图、delete-first repair plan 和下一轮修复顺序。
7. 单独写 process retro，评价哪些 skill、lane、命令、worker 输出真正有用。
````

- [ ] **Step 2: Verify the orchestrator prompt has the required gates**

Run:

```bash
rg -n "preflight only|read-only audit|origin/main|Linus Gate|process retro|launch-readiness|audit package commit" docs/audits/full-project-health-v1/execution-package/02-orchestrator-prompt.md
```

Expected: each gate appears at least once.

---

## Task 5: Write worker prompts for lanes 00-02

**Files:**

- Create: `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-00-baseline-runtime.md`
- Create: `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-01-architecture-coupling.md`
- Create: `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-02-security-trust-boundary.md`

- [ ] **Step 1: Create lane 00 prompt**

Create `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-00-baseline-runtime.md` with this content:

````markdown
# Lane 00 Prompt - Baseline / Runtime Truth

你负责 Lane 00: Baseline / runtime truth。

这是本次任务唯一的自包含执行真相源。不要假设你能看到其他聊天上下文。旧报告只能作为线索，不能作为最终证据。

## Required package reading

Before auditing, read:

```text
docs/audits/full-project-health-v1/execution-package/README.md
docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md
docs/audits/full-project-health-v1/execution-package/01-report-contract.md
docs/audits/full-project-health-v1/execution-package/04-stop-lines.md
docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md
```

If these files are missing, stop and report:

```text
Blocked: audit execution package unavailable or incomplete.
```

本轮是 read-only audit。不要修改业务代码。允许写入：

```text
docs/audits/full-project-health-v1/lanes/00-baseline-runtime.md
docs/audits/full-project-health-v1/evidence/**
```

## 必读文件

```text
AGENTS.md
CLAUDE.md
.claude/rules/*
package.json
next.config.*
open-next.config.*
wrangler.*
.github/workflows/*
```

## 建议命令

先确认脚本存在，再运行：

```bash
node -v
pnpm -v
git status --short --branch
git rev-parse --short HEAD
pnpm type-check
pnpm lint:check
pnpm test
pnpm build
pnpm build:cf
```

如果 package scripts 存在，也检查：

```bash
pnpm truth:check
pnpm dep:check
pnpm unused:check
pnpm security:semgrep
pnpm quality:gate:fast
```

`pnpm build` 和 `pnpm build:cf` 不要并行。

## 必须回答

- 当前 branch / commit 是什么？
- Node / pnpm 是否符合项目要求？
- 哪些验证通过？
- 哪些验证失败？
- 失败是项目问题、环境问题，还是凭证问题？
- 是否有 stale build artifact 造成 false red？
- 当前状态能不能作为可信审查基线？
- 哪些 lane 后续应该重点关注？
- 区分 `Local Next build truth`、`Local Cloudflare build truth`、`Cloudflare deploy/auth truth`、`Post-deploy smoke truth`；不要把 `build:cf` 通过写成真实部署已通过。
````

- [ ] **Step 2: Create lane 01 prompt**

Create `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-01-architecture-coupling.md` with this content:

````markdown
# Lane 01 Prompt - Architecture / Coupling

你负责 Lane 01: Architecture / coupling。

目标是审项目骨架是否健康：模块边界、耦合、变更成本、抽象是否过度、AI 味是否明显。

## Required package reading

Before auditing, read:

```text
docs/audits/full-project-health-v1/execution-package/README.md
docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md
docs/audits/full-project-health-v1/execution-package/01-report-contract.md
docs/audits/full-project-health-v1/execution-package/04-stop-lines.md
docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md
```

If these files are missing, stop and report:

```text
Blocked: audit execution package unavailable or incomplete.
```

本轮是 read-only audit。不要修改业务代码。允许写入：

```text
docs/audits/full-project-health-v1/lanes/01-architecture-coupling.md
```

## 必读文件

```text
AGENTS.md
CLAUDE.md
.dependency-cruiser.js
.claude/rules/code-quality.md
.claude/rules/conventions.md
.claude/rules/cloudflare.md
.claude/rules/i18n.md
.claude/rules/ui.md
```

## 重点范围

```text
src/app/**
src/components/**
src/lib/**
src/sites/**
src/config/**
messages/**
middleware / proxy
cache / i18n / contact / product / SEO 相关模块
```

## 必须检查

- 路由结构是否清楚。
- Server / Client 边界是否健康。
- i18n 是否有真相源漂移。
- content / config / runtime 是否混在一起。
- cache strategy 是否能解释清楚。
- Cloudflare 适配是否侵入业务层。
- 是否有万能 utils、barrel export、wrapper 套 wrapper。
- 如果新增一个产品分类、新增一个语言、改询盘逻辑，要改多少地方。

## 必须输出

- Top 5 架构风险。
- Top 5 耦合热点。
- 改动成本最高的模块。
- 可以删除或简化的抽象。
- AI 味明显的位置。
- 每个问题的证据等级和严重度。
````

- [ ] **Step 3: Create lane 02 prompt**

Create `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-02-security-trust-boundary.md` with this content:

````markdown
# Lane 02 Prompt - Security / Trust Boundary

你负责 Lane 02: Security / trust boundary。

目标是审安全边界、输入验证、rate limit、CSP、Cloudflare header 信任边界、隐私暴露。

## Required package reading

Before auditing, read:

```text
docs/audits/full-project-health-v1/execution-package/README.md
docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md
docs/audits/full-project-health-v1/execution-package/01-report-contract.md
docs/audits/full-project-health-v1/execution-package/04-stop-lines.md
docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md
```

If these files are missing, stop and report:

```text
Blocked: audit execution package unavailable or incomplete.
```

本轮是 read-only audit。不要修改业务代码。允许写入：

```text
docs/audits/full-project-health-v1/lanes/02-security-trust-boundary.md
```

## 必读文件

```text
.claude/rules/security.md
.claude/rules/cloudflare.md
semgrep.yml
src/app/api/**
src/lib/security/**
src/lib/contact/**
src/lib/rate-limit/**
src/lib/validation/**
```

## 重点检查

- contact / inquiry / subscribe API。
- Turnstile / captcha。
- client IP。
- Cloudflare headers。
- idempotency。
- input validation。
- rate limiting。
- error messages。
- logs。
- CSP。

## 命令规则

如果 `pnpm security:semgrep` 不可用或缺少工具，标记 `Blocked`，不要假装已验证。

## 必须输出

- trust boundary map。
- P0/P1 安全风险。
- 哪些安全检查有真实测试证明。
- 哪些只是代码上看起来有。
- 缺少运行验证的点。
- 每个问题的证据等级和严重度。
````

- [ ] **Step 4: Verify lane 00-02 prompt files exist**

Run:

```bash
for file in \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-00-baseline-runtime.md \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-01-architecture-coupling.md \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-02-security-trust-boundary.md
do
  test -f "$file" || exit 1
done
```

Expected: command exits with status 0.

---

## Task 6: Write worker prompts for lanes 03-05

**Files:**

- Create: `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-03-ui-performance-accessibility.md`
- Create: `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-04-seo-content-conversion.md`
- Create: `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-05-tests-ai-smell-dead-code.md`

- [ ] **Step 1: Create lane 03 prompt**

Create `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-03-ui-performance-accessibility.md` with this content:

````markdown
# Lane 03 Prompt - UI / Performance / Accessibility

你负责 Lane 03: UI / performance / accessibility。

目标是审页面技术质量，不只看好不好看，而是看真实买家访问时是否顺、快、清楚、可用。

## Required package reading

Before auditing, read:

```text
docs/audits/full-project-health-v1/execution-package/README.md
docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md
docs/audits/full-project-health-v1/execution-package/01-report-contract.md
docs/audits/full-project-health-v1/execution-package/04-stop-lines.md
docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md
```

If these files are missing, stop and report:

```text
Blocked: audit execution package unavailable or incomplete.
```

本轮是 read-only audit。不要修改业务代码。允许写入：

```text
docs/audits/full-project-health-v1/lanes/03-ui-performance-accessibility.md
docs/audits/full-project-health-v1/evidence/screenshots/**
```

## 优先使用

- `audit` skill，如果当前环境可用。
- `optimize` skill，如果当前环境可用。

如果 skill 不可用，标记为 `Blocked: skill unavailable`，然后用代码阅读和可运行命令继续审。

使用 `optimize` 时只做诊断和建议，不做代码修复。

## 重点页面

```text
首页
产品列表页
产品详情页
联系页
关于页
关键转化入口
移动端导航
表单
图片
动画
```

## 必须回答

- 买家第一次进站能否快速理解“你是谁、卖什么、怎么联系”？
- 移动端是否存在明显阻塞？
- 是否有 a11y 问题影响真实用户？
- 图片 / bundle / rendering 是否有明显浪费？
- 哪些性能问题是 P1，哪些只是 P3？
- 是否需要 Lighthouse / PageSpeed / CrUX 真实数据补证？
- 每个问题的证据等级和严重度。
````

- [ ] **Step 2: Create lane 04 prompt**

Create `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-04-seo-content-conversion.md` with this content:

````markdown
# Lane 04 Prompt - SEO / Content / Conversion

你负责 Lane 04: SEO / content / conversion。

目标是审 Google 是否能理解网站，以及海外 B2B 买家是否能信任并发起询盘。

## Required package reading

Before auditing, read:

```text
docs/audits/full-project-health-v1/execution-package/README.md
docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md
docs/audits/full-project-health-v1/execution-package/01-report-contract.md
docs/audits/full-project-health-v1/execution-package/04-stop-lines.md
docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md
```

If these files are missing, stop and report:

```text
Blocked: audit execution package unavailable or incomplete.
```

本轮是 read-only audit。不要修改业务代码。允许写入：

```text
docs/audits/full-project-health-v1/lanes/04-seo-content-conversion.md
```

## 优先使用

- `seo-technical` skill，如果当前环境可用。
- `seo-page` skill，如果当前环境可用。
- `seo-google` skill，如果当前环境有权限。

没有 Google 权限时，写：

```text
Google-data lane: Blocked / Credentials unavailable
```

不要把本地猜测写成 Google 真实数据。

把四类 Google/SEO 数据分开记录，不要混写：

```text
PageSpeed Lighthouse lab data: Available | Blocked
CrUX field data: Available | Blocked
Search Console data: Available | Blocked
URL Inspection data: Available | Blocked
```

## 重点检查

```text
metadata
sitemap
robots
canonical
hreflang
structured data
产品内容
多语言内容
页面标题
询盘 CTA
买家信任资产
公司介绍
证书 / 工厂 / 质量证明
```

## 必须回答

- Google 是否能正确理解页面。
- sitemap / canonical / metadata 是否一致。
- 多语言 SEO 是否有风险。
- 产品页是否足够支撑海外 B2B 买家决策。
- 询盘路径是否短、清楚、可信。
- 是否缺少关键买家信任资产。
- 哪些问题会直接影响询盘转化。
- 每个问题的证据等级和严重度。
````

- [ ] **Step 3: Create lane 05 prompt**

Create `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-05-tests-ai-smell-dead-code.md` with this content:

````markdown
# Lane 05 Prompt - Tests / AI Smell / Dead Code

你负责 Lane 05: Tests / AI smell / dead code。

目标是审测试是否真的有价值，以及代码是否有明显 AI 味、dead code、重复逻辑、无效抽象和 mock 失真。

## Required package reading

Before auditing, read:

```text
docs/audits/full-project-health-v1/execution-package/README.md
docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md
docs/audits/full-project-health-v1/execution-package/01-report-contract.md
docs/audits/full-project-health-v1/execution-package/04-stop-lines.md
docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md
```

If these files are missing, stop and report:

```text
Blocked: audit execution package unavailable or incomplete.
```

本轮是 read-only audit。不要修改业务代码。允许写入：

```text
docs/audits/full-project-health-v1/lanes/05-tests-ai-smell-dead-code.md
```

## 优先使用

- `ai-smell-audit` skill，如果当前环境可用。
- `Linus` 只作为判断镜头，不作为单独最终 verdict。

## 重点范围

```text
tests
__tests__
scripts/quality*
src/lib/**
src/app/api/**
src/components/**
unused exports
duplicated logic
mock system
```

## 建议命令

先确认 package 里存在：

```bash
pnpm test
pnpm unused:check
pnpm quality:gate:fast
pnpm test:mutation
```

如果 mutation 太重，不自动全跑。先读取现有 mutation report；如果需要新证据，给出手动命令，不擅自代跑。

## 必须回答

- 哪些测试真能防回归。
- 哪些测试只是表面覆盖。
- 哪些关键路径缺测试。
- 哪些 mock 让测试失真。
- 哪些代码明显 AI 味。
- 哪些代码应该删而不是修。
- 哪些问题建议交给 Linus Gate。
- 每个问题的证据等级和严重度。
````

- [ ] **Step 4: Verify lane 03-05 prompt files exist**

Run:

```bash
for file in \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-03-ui-performance-accessibility.md \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-04-seo-content-conversion.md \
  docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-05-tests-ai-smell-dead-code.md
do
  test -f "$file" || exit 1
done
```

Expected: command exits with status 0.

---

## Task 7: Write stop lines and process retro template

**Files:**

- Create: `docs/audits/full-project-health-v1/execution-package/04-stop-lines.md`
- Create: `docs/audits/full-project-health-v1/execution-package/05-process-retro-template.md`

- [ ] **Step 1: Create stop lines**

Create `docs/audits/full-project-health-v1/execution-package/04-stop-lines.md` with this content:

````markdown
# Stop Lines

Stop instead of expanding the audit when any of these happen:

1. base branch / commit is unclear
2. whether dirty work is included is unclear
3. package scripts differ from the plan
4. Node / pnpm environment is incompatible
5. build fails and cannot be classified as project, environment, or credential issue
6. Cloudflare, Google, Resend, Airtable, or dashboard credentials are missing for a claim that needs them
7. a worker wants to fix code
8. a worker crosses lane scope
9. P0/P1 lacks fresh evidence
10. old reports and fresh evidence conflict
11. required package files are missing or differ across workspaces
12. a worker tries to permanently delete files

## Required handling

When a stop line is hit:

1. record the conflict
2. mark the claim `Blocked` or `Needs stronger proof`
3. do not force a final conclusion
4. ask the orchestrator to decide whether to continue, narrow scope, or wait for credentials/checkpoint

If README, report contract, preflight contract, stop lines, lane template, or lane prompt is missing, stop with:

```text
Blocked: audit execution package unavailable or incomplete.
```

Never permanently delete files. Do not use `rm`, `rmdir`, `unlink`, `find -delete`, `git clean`, or similar irreversible deletion commands.
````

- [ ] **Step 2: Create process retro template**

Create `docs/audits/full-project-health-v1/execution-package/05-process-retro-template.md` with this content:

````markdown
# Process Retro Template

This file evaluates the audit system itself, not only the codebase.

## Required questions

1. Which skills clearly improved audit stability?
2. Which skills produced generic or noisy output?
3. Which workers produced duplicate conclusions?
4. Which workers lacked evidence?
5. Which commands produced the most useful proof?
6. Which commands produced the most noise?
7. Which checks should become a fixed project workflow?
8. Which checks should not be repeated next time?
9. Which audit angles still lack a good skill or workflow?
10. How should Full Project Health Audit v2 change?

## Output rule

Do not praise the process by default. Judge it by signal quality, repeatability, and whether findings were actionable.
````

- [ ] **Step 3: Verify stop and retro files exist**

Run:

```bash
test -f docs/audits/full-project-health-v1/execution-package/04-stop-lines.md
test -f docs/audits/full-project-health-v1/execution-package/05-process-retro-template.md
```

Expected: both commands exit with status 0.

---

## Task 8: Write the self-review checklist and run package verification

**Files:**

- Create: `docs/audits/full-project-health-v1/execution-package/06-self-review-checklist.md`

- [ ] **Step 1: Create the self-review checklist**

Create `docs/audits/full-project-health-v1/execution-package/06-self-review-checklist.md` with this content:

````markdown
# Self-Review Checklist

Run this before handing the package to Conductor workers.

## Completeness

- [ ] README declares the package as the single self-contained execution source.
- [ ] Preflight contract answers base, commit, dirty work, write paths, forbidden paths, commands, and blocked commands.
- [ ] Report contract defines evidence levels, severity, findings JSON, final report sections, and Linus Gate labels.
- [ ] Orchestrator prompt starts with preflight and forbids direct audit before preflight.
- [ ] Six lane prompts exist and each has one output file.
- [ ] Lane report template exists.
- [ ] Stop lines exist and explain what to do when blocked.
- [ ] Process retro exists and evaluates the audit process itself.
- [ ] Run metadata requirements exist.
- [ ] The execution package is in a tracked path and can be committed before worker dispatch.

## Safety

- [ ] No prompt tells workers to fix business code.
- [ ] No prompt tells workers to deploy.
- [ ] No prompt tells workers to run `pnpm build` and `pnpm build:cf` in parallel.
- [ ] No prompt treats old reports as final evidence.
- [ ] No prompt allows low-evidence P0/P1 findings.
- [ ] No prompt allows permanent deletion.
- [ ] Allowed and forbidden write paths are explicit.

## Evidence discipline

- [ ] Every lane prompt requires evidence level and severity.
- [ ] Credentials-dependent checks can be marked `Blocked`.
- [ ] Google data is not claimed without Google access.
- [ ] Cloudflare deployment truth is separated from local build truth.
- [ ] Mutation testing is not run automatically.
- [ ] Findings JSON is an array and validates with `jq`.

## Business readability

- [ ] Final report structure has owner-readable executive summary.
- [ ] Business impact is required for each finding.
- [ ] Repair plan is delete-first / simplify-first, not patch-first.
````

- [ ] **Step 2: Verify all expected files exist**

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
```

Expected: command exits with status 0.

- [ ] **Step 3: Check for plan placeholders**

Run:

```bash
rg -n "[T]BD|[T]ODO|[f]ill in details|[i]mplement later|[S]imilar to Task|[a]ppropriate error handling|[h]andle edge cases" docs/audits/full-project-health-v1/execution-package docs/superpowers/plans/2026-04-27-full-project-health-audit-v1-conductor.md
```

Expected: no output.

- [ ] **Step 4: Check that no business-code files changed**

Run:

```bash
git status --short
```

Expected: only this plan file, `docs/audits/full-project-health-v1/**`, and optional `.context/audits/full-project-health-v1/**` scratch files appear as new or modified files. No forbidden business-code path should appear.

- [ ] **Step 5: Review the package with the owner-facing question**

Answer in Chinese:

```text
这套执行包是否已经足够让一个完全不知道上下文的 Conductor worker 开始工作？
如果答案是否，缺的是：基线、边界、命令、证据合同、worker prompt，还是 stop line？
```

---

## Execution Order

Recommended execution order:

1. Task 1: create directory and README.
2. Task 2: write preflight contract.
3. Task 3: write report contract.
4. Task 4: write orchestrator prompt.
5. Task 5: write lane 00-02 prompts.
6. Task 6: write lane 03-05 prompts.
7. Task 7: write stop lines and process retro template.
8. Task 8: write self-review checklist and verify package.
9. Create an audit package commit before dispatching any lane worker.

Do not parallelize Tasks 1-4 because later files depend on the wording of earlier contracts. Tasks 5 and 6 can be parallelized only if the workers have a shared copy of Tasks 1-4 and write disjoint files.

Recommended package commit command, only after Task 8 verification passes:

```bash
git add \
  docs/superpowers/plans/2026-04-27-full-project-health-audit-v1-conductor.md \
  docs/audits/full-project-health-v1/execution-package \
  docs/audits/full-project-health-v1/lanes/.gitkeep \
  docs/audits/full-project-health-v1/evidence/screenshots/.gitkeep
git commit -m "chore(audit): add full project health audit v1 conductor package"
```

## Self-Review

Spec coverage:

- v1 clean-baseline strategy is covered by README, preflight contract, and orchestrator prompt.
- Conductor lane split is covered by README and lane prompts.
- Evidence levels, P0-P3 severity, and findings JSON are covered by report contract.
- Stop lines are covered by a dedicated file.
- Process retro is covered by a dedicated template.
- No business-code changes are required.

Placeholder scan target:

```bash
rg -n "[T]BD|[T]ODO|[f]ill in details|[i]mplement later|[S]imilar to Task|[a]ppropriate error handling|[h]andle edge cases" docs/superpowers/plans/2026-04-27-full-project-health-audit-v1-conductor.md
```

Expected: no output.

Type consistency:

- The execution package root is consistently `docs/audits/full-project-health-v1/execution-package/`.
- The audit artifact root is consistently `docs/audits/full-project-health-v1/`.
- `.context/audits/full-project-health-v1/` is scratch-only.
- Lane IDs are consistently `00` through `05`.
- Evidence levels and severity labels match the v1 contract.

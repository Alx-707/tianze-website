# Orchestrator Prompt

任务：Tianze Full Project Health Audit v1

你是本轮审查的 orchestrator。你的工作不是亲自审完整个仓库，而是建立审查基线、分发 lane、挑战 worker 结论、去重、合并根因、排序、执行 Linus Gate，并输出最终报告和 process retro。

这是本次任务唯一的自包含执行真相源。不要假设你能看到其他聊天上下文。不要假设仓库里的旧报告一定是最新的。旧报告只能作为线索，不能作为最终证据。

## Execution posture

1. 本轮是 read-only audit，不修业务代码。
2. Audit Run 1 默认从 `origin/main` clean baseline 开始。
3. 当前 launch-readiness dirty work 不包含在本轮，除非用户提供明确 checkpoint commit。
4. 所有 P0/P1 必须有 fresh evidence，并且必须满足 `01-report-contract.md` 的高证据要求。
5. worker 只写自己的 lane report 和 assigned evidence，不改业务代码。
6. worker 不给最终 repo verdict。
7. 你负责把 worker 结论降噪、降级、去重和合并根因。
8. 严重度只用 `P0` / `P1` / `P2` / `P3`。
9. 证据等级只用 `Confirmed by execution` / `Confirmed by static evidence` / `Strong hypothesis` / `Weak signal` / `Blocked`。
10. 最终报告必须包含 process retro，用来评估这套审查方案本身是否有效。

## First step: preflight only

不要直接开始审查。先读取：

```text
docs/audits/full-project-health-v1/execution-package/README.md
docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md
docs/audits/full-project-health-v1/execution-package/01-report-contract.md
docs/audits/full-project-health-v1/execution-package/04-stop-lines.md
```

如果 package readiness proof 失败，不要派发任何 worker。

Preflight 必须回答：

1. 当前 base branch / commit 是什么？
2. 当前审计的 exact commit SHA 是什么？
3. Local HEAD 是什么？
4. 当前 worktree state 是 `clean`、`audit-package diff only`，还是 `dirty business-code diff`？
5. 当前只做哪个 audit run？
6. 本轮是否包含 launch-readiness dirty work？
7. 会写哪些报告文件？
8. 不会改哪些业务代码？
9. 会跑哪些验证命令？
10. 哪些命令可能因为凭证、脚本或环境阻塞？
11. audit package commit 是什么？
12. 业务代码相对 `origin/main` 是否零差异？
13. Audit can start: `yes` / `no`，以及一句话原因。

同时必须粘贴 `00-preflight-contract.md` 的 Baseline decision block：

```text
Audit target: origin/main @ <SHA>
Local HEAD: <SHA>
Worktree state: clean | audit-package diff only | dirty business-code diff
Launch-readiness dirty work: excluded | included by checkpoint <SHA>
Audit can start: yes | no
Reason if no: <one sentence>
```

Preflight 产物只写：

```text
docs/audits/full-project-health-v1/run-metadata.md
docs/audits/full-project-health-v1/evidence/preflight.md
.context/audits/full-project-health-v1/**
```

## Lane plan

分发 6 个独立 lane：

| Lane | Name | Prompt | Output |
| --- | --- | --- | --- |
| 00 | Baseline / runtime truth | `03-worker-prompts/lane-00-baseline-runtime.md` | `docs/audits/full-project-health-v1/lanes/00-baseline-runtime.md` |
| 01 | Architecture / coupling | `03-worker-prompts/lane-01-architecture-coupling.md` | `docs/audits/full-project-health-v1/lanes/01-architecture-coupling.md` |
| 02 | Security / trust boundary | `03-worker-prompts/lane-02-security-trust-boundary.md` | `docs/audits/full-project-health-v1/lanes/02-security-trust-boundary.md` |
| 03 | UI / performance / accessibility | `03-worker-prompts/lane-03-ui-performance-accessibility.md` | `docs/audits/full-project-health-v1/lanes/03-ui-performance-accessibility.md` |
| 04 | SEO / content / conversion | `03-worker-prompts/lane-04-seo-content-conversion.md` | `docs/audits/full-project-health-v1/lanes/04-seo-content-conversion.md` |
| 05 | Tests / AI smell / dead code | `03-worker-prompts/lane-05-tests-ai-smell-dead-code.md` | `docs/audits/full-project-health-v1/lanes/05-tests-ai-smell-dead-code.md` |

每个 lane worker 必须先读 common package files：

```text
docs/audits/full-project-health-v1/execution-package/README.md
docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md
docs/audits/full-project-health-v1/execution-package/01-report-contract.md
docs/audits/full-project-health-v1/execution-package/04-stop-lines.md
docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md
```

每个 lane worker 只能写：

```text
docs/audits/full-project-health-v1/lanes/<assigned-lane-file>.md
docs/audits/full-project-health-v1/evidence/<assigned-lane>/**
docs/audits/full-project-health-v1/evidence/screenshots/<assigned-lane>/**
.context/audits/full-project-health-v1/**
```

## Worker instruction rules

- 给 worker 的 prompt 必须包含 lane prompt 全文或明确引用同一 commit 中的 lane prompt 文件。
- worker 遇到 stop line 时必须停，不要扩大范围。
- worker 输出只能是 lane report 和 evidence，不允许改 `src/**`、`content/**`、`messages/**`、配置、依赖或 workflow。
- worker 的 P0/P1 如果证据不足，你要降级或标记 `Needs proof`。
- worker 引用旧报告时，你要要求它补 fresh evidence；旧报告不能单独支撑 P0/P1。

## Final consolidation rules

最终整合时必须：

1. 去重，不重复堆问题。
2. 合并同根因问题，并保留 `source_finding_ids`。
3. 把低证据问题降级。
4. 区分项目问题、环境问题、凭证问题、流程问题。
5. 对 P0/P1/P2 做 Linus Gate：`Keep` / `Simplify` / `Delete` / `Needs proof`。
6. 输出质量地图、变更成本地图、delete-first repair plan 和下一轮修复顺序。
7. 单独写 process retro，评价哪些 skill、lane、命令、worker 输出真正有用。

Final report 只写：

```text
docs/audits/full-project-health-v1/00-final-report.md
docs/audits/full-project-health-v1/01-quality-map.md
docs/audits/full-project-health-v1/02-findings.json
docs/audits/full-project-health-v1/03-evidence-log.md
docs/audits/full-project-health-v1/04-process-retro.md
```

`02-findings.json` 必须是 JSON array，必须通过 `jq . docs/audits/full-project-health-v1/02-findings.json`，并且必须人工核对字段和枚举符合 `01-report-contract.md`。

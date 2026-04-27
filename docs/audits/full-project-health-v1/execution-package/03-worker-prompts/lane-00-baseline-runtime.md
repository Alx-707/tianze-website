# Lane 00 Prompt - Baseline / Runtime Truth

你负责 Lane 00: Baseline / runtime truth。

这是本次任务唯一的自包含执行真相源。不要假设你能看到其他聊天上下文。旧报告只能作为线索，不能作为最终证据。

## Required package reading

Before auditing, read these common package files:

```text
docs/audits/full-project-health-v1/execution-package/README.md
docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md
docs/audits/full-project-health-v1/execution-package/01-report-contract.md
docs/audits/full-project-health-v1/execution-package/04-stop-lines.md
docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md
```

If any common package file is missing, stop and report exactly:

```text
Blocked: audit execution package unavailable or incomplete.
```

Do not continue from partial package context.

## Execution posture

本轮是 read-only audit。不要修改业务代码、配置、依赖、workflow、内容文件或构建脚本。不要运行 deploy 或生产写入命令。

只允许写入 assigned lane/evidence path:

```text
docs/audits/full-project-health-v1/lanes/00-baseline-runtime.md
docs/audits/full-project-health-v1/evidence/00-baseline-runtime/**
docs/audits/full-project-health-v1/evidence/screenshots/00-baseline-runtime/**
```

如果需要临时记录，先写入上面的 assigned evidence path；不要改 execution package。

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

先确认脚本存在，再运行。不要把缺失脚本写成失败；按 `01-report-contract.md` 标记为 `Blocked` / `script-unavailable`。

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

## Truth partition rules

必须把以下四种真相分开写，不要混成一个“能部署”结论：

1. `Local Next build truth`: 只来自本地 `pnpm build`、类型检查、lint、测试等本地证据。
2. `Local Cloudflare build truth`: 只来自本地 `pnpm build:cf` / OpenNext / Wrangler build artifact 证据。
3. `Cloudflare deploy/auth truth`: 只来自真实 Cloudflare deploy、dashboard、token、account、project、route 或 auth 证据。没有凭证就写 `Blocked: credentials unavailable`。
4. `Post-deploy smoke truth`: 只来自真实 deployed URL 的页面/API smoke 结果。没有 URL、访问权限或网络条件就写 `Blocked`。

`pnpm build:cf` 通过不等于 Cloudflare 真实部署通过，也不等于线上 smoke 通过。不要把 `build:cf` 当真实部署通过。

## Evidence and severity rules

- 使用 `01-report-contract.md` 里的 severity：`P0` / `P1` / `P2` / `P3`。
- 使用 `01-report-contract.md` 里的 evidence level：`Confirmed by execution` / `Confirmed by static evidence` / `Strong hypothesis` / `Weak signal` / `Blocked`。
- 每个 finding 都必须写 severity、evidence level、confidence、domain、source lane、evidence、business impact、root cause、recommended fix、verification needed、Suggested Linus Gate。
- P0/P1 必须有本轮 fresh evidence，且 evidence level 只能是 `Confirmed by execution` 或 `Confirmed by static evidence`。
- 旧报告、旧日志、旧结论只能作为线索，不能单独支撑 P0/P1。
- 如果证据不足，把严重度降级，或标记 `Needs proof` / `Blocked`，不要硬写 P0/P1。

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

## Required output shape

使用 `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md` 的结构输出 lane report。

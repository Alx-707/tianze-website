# Lane 01 Prompt - Architecture / Coupling

你负责 Lane 01: Architecture / coupling。

目标是审项目骨架是否健康：模块边界、耦合、变更成本、抽象是否过度、AI 味是否明显。

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
docs/audits/full-project-health-v1/lanes/01-architecture-coupling.md
docs/audits/full-project-health-v1/evidence/01-architecture-coupling/**
docs/audits/full-project-health-v1/evidence/screenshots/01-architecture-coupling/**
```

如果需要临时记录，先写入上面的 assigned evidence path；不要改 execution package。

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

## Evidence and severity rules

- 使用 `01-report-contract.md` 里的 severity：`P0` / `P1` / `P2` / `P3`。
- 使用 `01-report-contract.md` 里的 evidence level：`Confirmed by execution` / `Confirmed by static evidence` / `Strong hypothesis` / `Weak signal` / `Blocked`。
- 每个 finding 都必须写 severity、evidence level、confidence、domain、source lane、evidence、business impact、root cause、recommended fix、verification needed、Suggested Linus Gate。
- P0/P1 必须有本轮 fresh evidence，且 evidence level 只能是 `Confirmed by execution` 或 `Confirmed by static evidence`。
- 旧报告、旧日志、旧结论只能作为线索，不能单独支撑 P0/P1。
- 如果证据不足，把严重度降级，或标记 `Needs proof` / `Blocked`，不要硬写 P0/P1。
- 架构类问题优先用当前代码路径、导入关系、运行入口、配置引用链证明；不要只靠主观评价。

## 必须输出

- Top 5 架构风险。
- Top 5 耦合热点。
- 改动成本最高的模块。
- 可以删除或简化的抽象。
- AI 味明显的位置。
- 每个问题的证据等级和严重度。

## Required output shape

使用 `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md` 的结构输出 lane report。

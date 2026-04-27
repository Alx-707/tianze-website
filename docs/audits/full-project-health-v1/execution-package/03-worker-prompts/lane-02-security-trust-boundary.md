# Lane 02 Prompt - Security / Trust Boundary

你负责 Lane 02: Security / trust boundary。

目标是审安全边界、输入验证、rate limit、CSP、Cloudflare header 信任边界、隐私暴露。

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
docs/audits/full-project-health-v1/lanes/02-security-trust-boundary.md
docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/**
docs/audits/full-project-health-v1/evidence/screenshots/02-security-trust-boundary/**
```

如果需要临时记录，先写入上面的 assigned evidence path；不要改 execution package。

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

不要运行 deploy 或生产写入命令。不要为了验证安全问题改业务代码。

## Evidence and severity rules

- 使用 `01-report-contract.md` 里的 severity：`P0` / `P1` / `P2` / `P3`。
- 使用 `01-report-contract.md` 里的 evidence level：`Confirmed by execution` / `Confirmed by static evidence` / `Strong hypothesis` / `Weak signal` / `Blocked`。
- 每个 finding 都必须写 severity、evidence level、confidence、domain、source lane、evidence、business impact、root cause、recommended fix、verification needed、Suggested Linus Gate。
- P0/P1 必须有本轮 fresh evidence，且 evidence level 只能是 `Confirmed by execution` 或 `Confirmed by static evidence`。
- 旧报告、旧日志、旧结论只能作为线索，不能单独支撑 P0/P1。
- 如果证据不足，把严重度降级，或标记 `Needs proof` / `Blocked`，不要硬写 P0/P1。
- 安全结论必须说明信任边界在哪里，攻击面是什么，实际影响是什么；不要把“看起来有检查”写成“已经安全”。

## 必须输出

- trust boundary map。
- P0/P1 安全风险。
- 哪些安全检查有真实测试证明。
- 哪些只是代码上看起来有。
- 缺少运行验证的点。
- 每个问题的证据等级和严重度。

## Required output shape

使用 `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md` 的结构输出 lane report。

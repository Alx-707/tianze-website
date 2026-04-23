# AI 编码检测运行手册

> Support doc:
> this file is an execution runbook for AI-code review and detection.
> It supports governance, but it is not the primary runtime truth source.
>
> Full historical version:
> `docs/archive/guides/support-full/AI-CODING-DETECTION-RUNBOOK.full.md`

## 目标

这份手册的当前作用是：

- 说明项目如何识别“AI 代码看起来都绿了，但真实行为仍可能有问题”
- 给 Codex / Claude 一条可执行的检查顺序

## 当前检测思路

不要把“覆盖率高”误当成“质量高”。

当前默认组合是：

1. 行为合同
2. 静态真相检查
3. E2E 关键路径
4. 单元 / 集成测试
5. 结构与安全检查

## 当前真相源

先读：

- `docs/specs/behavioral-contracts.md`
- `.claude/rules/review-checklist.md`
- `.claude/rules/testing.md`
- `docs/guides/POLICY-SOURCE-OF-TRUTH.md`

## 当前执行顺序

### 第一层：结构与静态真相

运行：

- `pnpm truth:check`
- `pnpm unused:check`
- `pnpm security:semgrep`

### 第二层：基础质量门禁

运行：

- `pnpm test --run`
- `pnpm type-check`
- `pnpm lint:check`
- `pnpm build`
- `pnpm build:cf`

### 第三层：关键行为面

优先看：

- 导航
- i18n
- contact
- inquiry
- 关键 smoke

## 当前重点风险

- AI 写出“测试和实现一起自证正确”的假绿
- 行为合同没有被真实验证
- 安全/结构边界在重构时被悄悄绕开

## 使用规则

- 这是 support runbook，不是 runtime truth 文档
- 如果运行时真相和它冲突，以 `docs/guides/` 的 canonical docs 和实际代码为准

## 什么时候看长版

如果要重新审视整套 AI 检测哲学、Stryker / BDD / E2E 分工，再看 archive 里的长版。

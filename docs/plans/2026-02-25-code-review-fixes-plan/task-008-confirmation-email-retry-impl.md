# Task 008: 确认邮件重试 — 实现

**depends-on:** Task 007

## Description

为确认邮件发送添加轻量重试机制（最多 2 次重试，指数退避），失败时升级日志级别。保持非阻塞特性（不阻塞主流程返回）。

> **注意**：原计划包含"在 CRM 记录中标记失败"，经核实当前 `ContactStatus` 仅有 4 种状态（New/In Progress/Completed/Archived），且 `processContactLead` 未持久化 record.id 用于后续更新。CRM 标记需先扩展 Airtable schema，属于独立工作项，不在此 Task 范围内。

## Execution Context

**Task Number**: 008 of 009
**Phase**: C（增强改进）
**Severity**: 低
**Prerequisites**: Task 007 的测试已就位

## BDD Scenarios

与 Task 007 相同的 Scenario 1-4，此任务目标是使**全部测试通过**（Green）。

## Files to Modify/Create

- Modify: `src/lib/lead-pipeline/processors/contact.ts`（确认邮件发送逻辑，约 55-63 行）
- Possibly create: `src/lib/lead-pipeline/retry-utils.ts`（如提取通用重试逻辑）

## Steps

### Step 1: 实现重试包装函数

创建一个轻量的 `withRetry` 函数（或在 contact processor 中内联实现），支持：
- 最大重试次数：2（共 3 次尝试）
- 退避策略：指数退避（1s, 2s）
- 非阻塞：整个重试链通过 `.catch()` 挂在 Promise 链上，不 await

### Step 2: 修改确认邮件发送逻辑

将当前的：
```
resendService.sendConfirmationEmail(emailData).catch((error) => {
  logger.warn("Confirmation email failed (non-blocking)", {...});
});
```

替换为带重试的版本：
```
retryAsync(() => resendService.sendConfirmationEmail(emailData), { maxRetries: 2 })
  .catch((error) => {
    logger.error("Confirmation email failed after retries (non-blocking)", {
      ...errorInfo,
      retries: 2,
    });
  });
```

### Step 3: 运行测试确认 Green 状态

执行 Task 007 的测试，确认全部 4 个 Scenario 通过。

## Verification Commands

```bash
# 运行 contact processor 测试
pnpm vitest run src/lib/lead-pipeline/__tests__/contact-processor.test.ts

# 确认 pipeline 调度层不受影响
pnpm vitest run src/lib/lead-pipeline/__tests__/process-lead.test.ts

# TypeScript + Lint
pnpm type-check
pnpm lint:check

# 全量测试
pnpm test
```

## Success Criteria

- Task 007 的全部 4 个测试通过（Green）
- 确认邮件在首次失败后自动重试（最多 2 次）
- 重试耗尽后记录 error 级别日志（含重试次数）
- 主流程（emailResult、crmResult）不受影响
- 无新增依赖
- `pnpm type-check` 零错误
- `pnpm test` 全部通过

## Commit

```
feat(lead-pipeline): add retry mechanism for confirmation emails

- Retry up to 2 times with exponential backoff
- Upgrade log level to error on permanent failure
- Non-blocking: does not delay main pipeline response
```

# Task 007: 确认邮件重试 — 添加测试

**depends-on:** —

## Description

为确认邮件发送逻辑编写重试行为的测试。当前实现为 fire-and-forget（仅 `.catch()` 记录日志），测试应定义重试后的期望行为，在当前实现下**失败**（Red）。

## Execution Context

**Task Number**: 007 of 009
**Phase**: C（增强改进）
**Severity**: 低
**Prerequisites**: 无

## BDD Scenarios

### Scenario 1: 确认邮件首次发送成功
- Given: `sendConfirmationEmail` 首次调用成功
- When: `processContactLead` 执行完成
- Then: `sendConfirmationEmail` 仅被调用 1 次

### Scenario 2: 确认邮件首次失败后重试成功
- Given: `sendConfirmationEmail` 首次调用抛出错误，第二次调用成功
- When: `processContactLead` 执行完成
- Then: `sendConfirmationEmail` 被调用 2 次，不记录永久失败日志

### Scenario 3: 确认邮件多次重试后仍失败
- Given: `sendConfirmationEmail` 连续失败（超过最大重试次数）
- When: 所有重试耗尽
- Then: 记录 error 级别日志（而非当前的 warn），包含重试次数信息

### Scenario 4: 确认邮件失败不影响主流程
- Given: `sendConfirmationEmail` 所有重试失败
- When: `processContactLead` 返回结果
- Then: `emailResult` 和 `crmResult` 不受影响，函数正常返回

## Files to Modify/Create

- Modify: `src/lib/lead-pipeline/processors/__tests__/contact.test.ts`（或对应测试文件）

## Steps

### Step 1: 定位现有测试

查找 `processContactLead` 的测试文件，了解 mock 模式（resendService mock 等）。

### Step 2: 添加 Scenario 1-4 对应的测试用例

mock `resendService.sendConfirmationEmail` 使其按场景返回成功/失败。注意当前实现是 fire-and-forget，测试需要等待足够时间让异步操作完成（可使用 `vi.advanceTimersByTime` 或 `flushPromises`）。

### Step 3: 运行测试确认 Red 状态

Scenario 2 和 3 应失败（当前无重试），Scenario 1 和 4 应通过。

## Verification Commands

```bash
# 运行 contact processor 测试
pnpm vitest run src/lib/lead-pipeline/processors/__tests__/contact.test.ts --reporter=verbose
```

## Success Criteria

- 新增 4 个测试用例覆盖 Scenario 1-4
- Scenario 2、3 失败（Red）— 证明当前无重试
- Scenario 1、4 通过 — 证明主流程和成功路径不受影响
- 无 TypeScript 类型错误

## Commit

```
test(lead-pipeline): add confirmation email retry behavior scenarios
```

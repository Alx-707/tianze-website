# Task 009: Rate limit 原子化 — 实现 (Green)

**depends-on:** Task 008, Task 025（存储后端 Gate）

## Description

将 rate limit 存储操作改为原子性；添加 failureMode 配置（fail-open/closed）；确保存储故障真正触发 degraded 状态和可观测头信息。

## Execution Context

**Task Number**: 009 of 027
**Phase**: C（原子化防滥用）
**Prerequisites**: Task 008 测试处于 Red 状态；Task 025 存储后端已决策

## BDD Scenarios

（与 Task 008 相同，此处为 Green 实现）

## Files to Modify

- `src/lib/security/distributed-rate-limit.ts` — 核心修改
- `src/lib/api/with-rate-limit.ts` — 可能需要适配 failureMode

## Steps

### Step 1: 使用 Task 025 决策的存储后端

直接使用 Task 025 定义的 `RateLimitStore` 接口和选定的存储适配器，不再重复评估。

### Step 2: 修复存储故障语义

将存储操作失败从"返回 null 静默降级"改为"抛异常"，让外层 catch 能真正触发 degraded 追踪。

### Step 3: 添加 failureMode 到 preset

在 preset 类型定义中添加 `failureMode: "open" | "closed"`：
- 管理面 preset（cacheInvalidate 等）：`failureMode: "closed"`
- 业务表单 preset（contact、inquiry 等）：`failureMode: "open"`
- 新增 turnstile preset（Task 004）：建议 `failureMode: "closed"`

### Step 4: 适配 with-rate-limit

确保 `with-rate-limit.ts` 的 degraded 头逻辑（已写好）在新的异常传播下正确工作。

## Verification Commands

```bash
pnpm vitest run src/lib/security/__tests__/distributed-rate-limit.test.ts --reporter=verbose
pnpm vitest run src/lib/api/__tests__/ --reporter=verbose
pnpm type-check
```

## Success Criteria

- Task 008 所有测试通过（Green）
- 并发测试不超发
- 存储故障正确触发 degraded
- failureMode 按 preset 生效
- 无 TypeScript 类型错误

## Commit

```
fix(security): atomize rate limit operations, add failureMode per preset
```

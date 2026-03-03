# Task 004: Turnstile 端点限流 — 实现 (Green)

**depends-on:** Task 003

## Description

为 `/api/verify-turnstile` 添加 `withRateLimit` 包裹，使用新的 `turnstile` preset。使 Task 003 的失败测试通过。

## Execution Context

**Task Number**: 004 of 027
**Phase**: A（安全快赢）
**Prerequisites**: Task 003 测试已写好且 Scenario 2 处于 Red 状态

## BDD Scenarios

（与 Task 003 相同，此处为 Green 实现）

## Files to Modify

- `src/app/api/verify-turnstile/route.ts` — 用 `withRateLimit` 包裹 POST handler
- `src/lib/security/distributed-rate-limit.ts` — 添加 `turnstile` preset（参考现有 preset 模式）

## Steps

### Step 1: 定义 turnstile 限流 preset

在 `distributed-rate-limit.ts` 的 preset 配置中添加 `turnstile` preset：
- 窗口/阈值参考项目现有 preset 但适当收紧（建议 fail-closed：Turnstile API 故障时返回 503 而非放行）
- 理由：该端点是公开的外部请求放大器，应严格限流

### Step 2: 用 withRateLimit 包裹 POST

在 `route.ts` 中用 `withRateLimit` 包裹现有 POST handler，preset 设为 `turnstile`。

### Step 3: 确认外部故障行为

如果 Turnstile API 本身返回错误，端点应返回 503（不是 200 + 模糊结果）。

## Verification Commands

```bash
pnpm vitest run src/app/api/verify-turnstile/ --reporter=verbose
pnpm type-check
```

## Success Criteria

- Task 003 所有测试通过（Green）
- 无 TypeScript 类型错误
- 现有 Turnstile 相关测试不回归

## Commit

```
fix(security): add rate limit to verify-turnstile endpoint
```

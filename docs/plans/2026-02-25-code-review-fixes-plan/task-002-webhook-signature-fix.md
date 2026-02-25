# Task 002: Webhook 签名验证 — 修复实现

**depends-on:** Task 001

## Description

修改 `verifyWebhookSignature` 函数，使所有环境默认拒绝无签名/无 secret 的请求。仅在 `NODE_ENV === "development"` 且显式设置 `SKIP_WEBHOOK_VERIFICATION=true` 时才允许跳过验证。

## Execution Context

**Task Number**: 002 of 009
**Phase**: A（安全修复）
**Severity**: 高
**Prerequisites**: Task 001 的测试已就位

## BDD Scenarios

与 Task 001 相同的 Scenario 1-5，此任务目标是使**全部测试通过**（Green）。

## Files to Modify/Create

- Modify: `src/lib/whatsapp-service.ts`（`verifyWebhookSignature` 函数，约 172-217 行）
- Possibly modify: `src/lib/env.ts`（如需注册 `SKIP_WEBHOOK_VERIFICATION` 环境变量）

## Steps

### Step 1: 修改无签名分支（第 177-183 行）

当前逻辑：
```
if (!signature) → return env.NODE_ENV !== "production"  // 非 prod 放行
```

修改为：
```
if (!signature) {
  if (env.NODE_ENV === "development" && process.env.SKIP_WEBHOOK_VERIFICATION === "true") {
    logger.warn("[WebhookSignature] Verification skipped (dev override)");
    return true;
  }
  logger.warn("[WebhookSignature] No signature provided, rejecting");
  return false;  // 所有环境默认拒绝
}
```

### Step 2: 修改无 secret 分支（第 185-189 行）

当前逻辑：
```
if (!secret) → return env.NODE_ENV !== "production"  // 非 prod 放行
```

修改为：
```
if (!secret) {
  logger.error("[WebhookSignature] No app secret configured, rejecting");
  return false;  // 所有环境拒绝，无 secret 不应该放行
}
```

### Step 3: 注册环境变量（可选）

如果项目的 `src/lib/env.ts` 使用 `@t3-oss/env-nextjs` 管理环境变量，考虑是否将 `SKIP_WEBHOOK_VERIFICATION` 注册到 schema 中。由于此变量仅在开发环境使用且为布尔标志，直接读取 `process.env` 也可接受。

### Step 4: 运行测试确认 Green 状态

执行 Task 001 添加的测试，确认全部 5 个 Scenario 通过。

## Verification Commands

```bash
# 运行 webhook 测试 — 全部应通过
pnpm vitest run src/lib/__tests__/whatsapp-service.test.ts

# 确认无安全绕过路径
grep -n "!== \"production\"" src/lib/whatsapp-service.ts
# 预期：零匹配（已移除所有基于 production 判断的放行逻辑）

# TypeScript + Lint
pnpm type-check
pnpm lint:check

# 全量测试（确认无回归）
pnpm test

# 生产构建
pnpm build
```

## Success Criteria

- Task 001 的全部 5 个测试用例通过（Green）
- `verifyWebhookSignature` 中不再存在 `env.NODE_ENV !== "production"` 的放行逻辑
- 仅 `development` + `SKIP_WEBHOOK_VERIFICATION=true` 组合允许跳过
- `pnpm type-check` 零错误
- `pnpm test` 全部通过
- `pnpm build` 成功

## Commit

```
fix(security): enforce webhook signature verification in all environments

- Remove non-production bypass for missing signature/secret
- Add explicit SKIP_WEBHOOK_VERIFICATION flag for local development only
- All environments now reject unsigned webhook requests by default
```

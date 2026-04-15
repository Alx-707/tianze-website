# Task 001: Webhook 签名验证 — 添加测试

**depends-on:** —

## Description

为 `verifyWebhookSignature` 函数添加缺失的安全边界测试，覆盖非生产环境下无签名/无 secret 的绕过路径。这些测试在当前实现下应**失败**（Red），为 Task 002 的修复提供验证基础。

## Execution Context

**Task Number**: 001 of 009
**Phase**: A（安全修复）
**Severity**: 高
**Prerequisites**: 无

## BDD Scenarios

### Scenario 1: 非生产环境拒绝无签名请求
- Given: `NODE_ENV` 为 `"development"` 或 `"test"`
- When: 调用 `verifyWebhookSignature(payload, null)` 签名参数为 `null`
- Then: 函数返回 `false`（当前实现返回 `true`，测试应失败）

### Scenario 2: 非生产环境拒绝无 secret 请求
- Given: `NODE_ENV` 为 `"development"`，且 `WHATSAPP_APP_SECRET` 未配置
- When: 调用 `verifyWebhookSignature(payload, "sha256=abc123")` 提供了签名但无 secret
- Then: 函数返回 `false`（当前实现返回 `true`，测试应失败）

### Scenario 3: 显式开发跳过标志
- Given: `NODE_ENV` 为 `"development"` 且 `SKIP_WEBHOOK_VERIFICATION` 环境变量为 `"true"`
- When: 调用 `verifyWebhookSignature(payload, null)`
- Then: 函数返回 `true` 并记录 warn 日志

### Scenario 4: 生产环境始终拒绝无签名请求（回归保护）
- Given: `NODE_ENV` 为 `"production"`
- When: 调用 `verifyWebhookSignature(payload, null)`
- Then: 函数返回 `false`

### Scenario 5: 有效签名在所有环境通过
- Given: 任意 `NODE_ENV`，提供正确的 HMAC-SHA256 签名和对应 secret
- When: 调用 `verifyWebhookSignature(payload, validSignature, appSecret)`
- Then: 函数返回 `true`

## Files to Modify/Create

- Modify: `src/lib/__tests__/whatsapp-service.test.ts`（或创建专门的签名验证测试文件）

## Steps

### Step 1: 定位现有测试文件

查找 `whatsapp-service` 相关测试文件，了解现有测试覆盖范围和 mock 模式。

### Step 2: 添加 Scenario 1-5 对应的测试用例

在 `verifyWebhookSignature` 的 describe 块中添加 5 个测试用例。需要 mock `env.NODE_ENV` 和 `process.env.WHATSAPP_APP_SECRET`。

- Scenario 1 和 2 的测试在当前代码下**应该失败**（Red 状态），因为当前实现在非 prod 环境放行
- Scenario 3 测试新增的显式跳过行为（也会失败，因为功能尚未实现）
- Scenario 4 和 5 应该通过（回归保护）

### Step 3: 运行测试确认 Red 状态

执行测试，确认 Scenario 1、2、3 失败，Scenario 4、5 通过。

## Verification Commands

```bash
# 运行 webhook 签名相关测试
pnpm vitest run src/lib/__tests__/whatsapp-service.test.ts --reporter=verbose 2>&1 | grep -E "PASS|FAIL|✓|✗"

# 确认新测试存在
grep -c "非生产环境拒绝无签名" src/lib/__tests__/whatsapp-service.test.ts || \
grep -c "rejects missing signature" src/lib/__tests__/whatsapp-service.test.ts
```

## Success Criteria

- 新增 5 个测试用例覆盖 Scenario 1-5
- Scenario 1、2、3 失败（Red）— 证明当前实现有安全缺陷
- Scenario 4、5 通过 — 证明现有正确行为不受影响
- 无 TypeScript 类型错误

## Commit

```
test(security): add webhook signature bypass scenarios for non-prod envs
```

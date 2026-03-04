# Task 020: API 契约统一

**depends-on:** —

## Description

统一 API 响应格式和状态码：cache/invalidate 失败不再返回 200；withRateLimit 429 使用统一 errorCode；CSP 空报告不再返回 200 + error 字段。

## Execution Context

**Task Number**: 020 of 027
**Phase**: F（契约 + 性能 + 清理）
**Prerequisites**: 无

## 审查证据

- `src/app/api/cache/invalidate/route.ts:201-208`：`buildSuccessResponse` 即使 `result.success=false` 也返回 200
- `src/lib/api/with-rate-limit.ts:119-120`：429 返回 `{ success: false, error: "Too many requests" }` 而非标准 `errorCode`
- `src/app/api/csp-report/route.ts:103-107`：空 csp-report 返回 `{ error: "Invalid CSP report format" }` 但状态码 200

## BDD Scenarios

### Scenario 1: cache/invalidate 失败返回 500
```gherkin
Scenario: 缓存失效操作失败时返回 500
  Given cache invalidation 端点
  When invalidation 结果包含 errors（result.success=false）
  Then 返回 500 Internal Server Error
  And 不返回 200 或 207
  And 调用方可安全重试全部失效操作
```

> **决策记录**：统一为 500（不用 207 Multi-Status）。理由：该端点只有内部管理调用（Bearer token），无外部消费者需要区分"哪个 domain 成功了"。500 + 全量重试最简单明确。

### Scenario 2: 429 响应使用统一 errorCode
```gherkin
Scenario: rate limit 429 响应格式统一
  Given 任何受限流保护的端点
  When 请求被 rate limit 拒绝
  Then 返回 { success: false, errorCode: "RATE_LIMIT_EXCEEDED" }
  And 不使用 { error: "Too many requests" }
```

### Scenario 3: CSP 空报告返回 204
```gherkin
Scenario: 空 CSP 报告返回 204 acknowledge
  Given CSP report 端点
  When 收到空 csp-report 对象（浏览器 quirk）
  Then 返回 204 No Content
  And 不返回 200 + error 字段
```

## Files to Modify

- `src/app/api/cache/invalidate/route.ts` — `buildSuccessResponse` 在 `result.success === false` 时返回 500
- `src/lib/api/with-rate-limit.ts` — 429 响应改用 `API_ERROR_CODES.RATE_LIMIT_EXCEEDED`
- `src/app/api/csp-report/route.ts` — 空 csp-report 返回 204

## Steps

### Step 1: 修复 cache/invalidate 状态码

在 `buildSuccessResponse` 中：如果 `result.success === false`，返回 500。不使用 207（见上方决策记录）。

### Step 2: 统一 429 响应格式

在 `with-rate-limit.ts` 中将 `{ success: false, error: "Too many requests" }` 改为 `{ success: false, errorCode: API_ERROR_CODES.RATE_LIMIT_EXCEEDED }`。

### Step 3: 修复 CSP 空报告

将 `route.ts:103-107` 的 `NextResponse.json({ error: ... }, { status: 200 })` 改为 `new NextResponse(null, { status: 204 })`。

### Step 4: 更新相关测试

更新受影响端点的测试以匹配新的状态码和响应格式。

## Verification Commands

```bash
pnpm vitest run src/app/api/cache/ --reporter=verbose
pnpm vitest run src/lib/api/__tests__/ --reporter=verbose
pnpm vitest run src/app/api/csp-report/ --reporter=verbose
pnpm type-check
```

## Success Criteria

- cache/invalidate 失败不再返回 200
- 所有 429 响应使用 `errorCode` 而非 `error`
- CSP 空报告返回 204
- 所有测试通过

## Commit

```
fix(api): unify error response format and status codes
```

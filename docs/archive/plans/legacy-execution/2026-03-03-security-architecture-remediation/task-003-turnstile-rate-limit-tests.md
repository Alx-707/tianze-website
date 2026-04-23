# Task 003: Turnstile 端点限流 — 测试 (Red)

**depends-on:** —

## Description

为 `/api/verify-turnstile` 添加 rate limit 测试。该端点当前无任何限流保护，是公开的外部请求放大器（每次调用触发对 Cloudflare Turnstile API 的请求）。测试在当前实现下应**失败**。

## Execution Context

**Task Number**: 003 of 027
**Phase**: A（安全快赢）
**Prerequisites**: 无（可与 Task 001 并行）

## 审查证据

- `src/app/api/verify-turnstile/route.ts:84`：`POST` 函数无 `withRateLimit` 包裹
- 对比同项目其他端点（如 csp-report、cache/invalidate）均已有限流

## BDD Scenarios

### Scenario 1: 正常请求通过限流
```gherkin
Scenario: 正常频率的 Turnstile 验证请求通过
  Given /api/verify-turnstile 端点已配置 rate limit
  When 客户端以正常频率（< 阈值）发送验证请求
  Then 请求正常处理并返回验证结果
  And 响应包含 rate limit 相关头信息
```

### Scenario 2: 超频请求被拒绝
```gherkin
Scenario: 超频请求被 rate limit 拒绝
  Given /api/verify-turnstile 端点已配置 rate limit
  When 同一 IP 在时间窗口内超过请求阈值
  Then 返回 429 Too Many Requests
  And 响应包含 Retry-After 头信息
```

### Scenario 3: Turnstile API 故障时的 fail 策略
```gherkin
Scenario: Turnstile API 不可用时端点行为明确
  Given /api/verify-turnstile 端点已配置 rate limit
  When Cloudflare Turnstile API 返回错误或超时
  Then 端点返回 503 而非透传不确定的结果
  And rate limit 配额正常消耗（不因外部故障免除计数）
```

## Files to Modify/Create

- Create: `src/app/api/verify-turnstile/__tests__/route.test.ts`（或在现有测试中添加）

## Steps

### Step 1: 定位现有测试

查找 `verify-turnstile` 相关测试文件和 mock 模式。

### Step 2: 添加 rate limit 测试

- Scenario 1: mock `checkDistributedRateLimit` 返回 allowed → 验证请求正常处理
- Scenario 2: mock 返回 not allowed → 验证返回 429（当前无限流，测试应 **失败**）
- Scenario 3: mock Turnstile API 故障 → 验证返回 503

### Step 3: 运行测试确认 Red 状态

Scenario 2 应失败（当前无限流），其余根据现有实现确认。

## Verification Commands

```bash
pnpm vitest run src/app/api/verify-turnstile/ --reporter=verbose
```

## Success Criteria

- Scenario 2 测试失败（Red）— 证明当前无限流
- 无 TypeScript 类型错误

## Commit

```
test(security): add rate limit scenarios for verify-turnstile endpoint
```

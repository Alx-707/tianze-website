# Task 008: Rate limit 原子化 — 测试 (Red)

**depends-on:** —

## Description

为分布式 rate limit 的原子性和故障策略编写测试。当前实现存在 GET→修改→SET 非原子竞争、存储失败静默吞为 null 导致 degraded 状态几乎不可能被触发。

## Execution Context

**Task Number**: 008 of 027
**Phase**: C（原子化防滥用）
**Prerequisites**: 无

## 审查证据

- `src/lib/security/distributed-rate-limit.ts:196-216`：`increment()` 是非原子 read-modify-write
- `src/lib/security/distributed-rate-limit.ts:146,231`：存储失败返回 `null` 而非抛异常
- `src/lib/security/distributed-rate-limit.ts:390`：`catch` 块中 degraded 追踪因上游吞 null 而形同虚设
- `src/lib/api/with-rate-limit.ts:169`：degraded 头逻辑虽写得好，但因上游不触发而无效

## BDD Scenarios

### Scenario 1: 并发请求不超发
```gherkin
Scenario: 并发请求在窗口阈值内正确计数
  Given rate limit 窗口为 60s，阈值为 10
  When 同一 key 在 50ms 内并发发送 15 个请求
  Then 恰好 10 个请求被允许
  And 5 个请求返回 429
  And 不出现"11 个被允许"的竞态情况
```

### Scenario 2: 存储故障触发 degraded 状态
```gherkin
Scenario: Redis/KV 存储故障时触发 degraded 模式
  Given rate limit 存储后端不可用
  When 请求到达需要限流的端点
  Then 根据 preset 的 failureMode 决定行为：
    - failureMode="open" → 放行但标记 degraded 头
    - failureMode="closed" → 拒绝并返回 503
  And logger.warn 记录降级事件
```

### Scenario 3: failureMode 按 preset 区分
```gherkin
Scenario: 不同 preset 使用不同 failureMode
  Given cacheInvalidate preset 配置 failureMode="closed"
  And contactForm preset 配置 failureMode="open"
  When 存储后端故障
  Then cacheInvalidate 端点返回 503
  And contactForm 端点放行但带 degraded 头
```

## Files to Modify/Create

- Modify/Create: `src/lib/security/__tests__/distributed-rate-limit.test.ts`

## Steps

### Step 1: 定位现有测试

查找 `distributed-rate-limit` 相关测试，了解现有 mock 模式（存储后端的 mock 方式）。

### Step 2: 添加并发竞态测试

使用 `Promise.all` 模拟并发请求，验证计数是否超发。当前非原子实现下，测试应**失败**（允许 >10 个请求）。

### Step 3: 添加存储故障测试

Mock 存储后端抛异常或返回 null，验证 degraded 状态是否被触发。当前实现吞 null，测试应**失败**。

### Step 4: 添加 failureMode 测试

测试不同 preset 的 failureMode 行为差异。当前无 failureMode 配置，测试应**失败**。

## Verification Commands

```bash
pnpm vitest run src/lib/security/__tests__/distributed-rate-limit.test.ts --reporter=verbose
```

## Success Criteria

- Scenario 1 失败（Red）— 并发超发
- Scenario 2 失败（Red）— degraded 不被触发
- Scenario 3 失败（Red）— 无 failureMode 配置
- 无 TypeScript 类型错误

## Commit

```
test(security): add rate limit atomicity and failure mode scenarios
```

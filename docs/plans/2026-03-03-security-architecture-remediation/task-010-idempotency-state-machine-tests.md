# Task 010: 幂等防护状态机 — 测试 (Red)

**depends-on:** —

## Description

为幂等防护编写测试，覆盖 TOCTOU 竞态、key 语义绑定缺失和进程内 Map 在 serverless 环境下的失效。

## Execution Context

**Task Number**: 010 of 027
**Phase**: C（原子化防滥用）
**Prerequisites**: 无（可与 Task 008 并行）

## 审查证据

- `src/lib/idempotency.ts:43`：进程内 Map，serverless 环境下每次冷启动清空
- `src/lib/idempotency.ts:145`：check 和 save 之间无锁，并发请求都通过 check（TOCTOU）
- `src/lib/idempotency.ts:81`：key 只用 `Idempotency-Key` header，不绑定 method/path/body
- `src/app/api/subscribe/route.ts:71`：调用点未绑定请求语义

## BDD Scenarios

### Scenario 1: 并发重复请求只执行一次
```gherkin
Scenario: 相同幂等 key 的并发请求只执行一次
  Given 两个请求携带相同的 Idempotency-Key
  When 两个请求同时到达（< 10ms 间隔）
  Then 只有一个请求执行业务逻辑
  And 另一个请求返回之前的缓存结果
  And 不出现两个请求都执行的 TOCTOU 情况
```

### Scenario 2: key 绑定请求语义
```gherkin
Scenario: 不同请求内容使用相同 key 被拒绝
  Given 请求 A：POST /api/subscribe body={email:"a@b.com"} Idempotency-Key=abc
  And 请求 B：POST /api/contact body={name:"test"} Idempotency-Key=abc
  When 请求 B 到达
  Then 请求 B 被拒绝（key 冲突：不同 method/path/body fingerprint 使用了相同 key）
```

### Scenario 3: turnstileToken 不影响 fingerprint
```gherkin
Scenario: 正常重试（不同 turnstile token）不被判为冲突
  Given 请求 A：POST /api/contact body={email:"a@b.com", turnstileToken:"token1"} Key=abc
  And 请求 B：POST /api/contact body={email:"a@b.com", turnstileToken:"token2"} Key=abc
  When 请求 B 到达（用户正常重试，获得了新的 turnstile token）
  Then 请求 B 返回缓存的请求 A 结果（body 语义字段相同）
```

### Scenario 4: serverless 冷启动后幂等仍有效
```gherkin
Scenario: 进程重启后幂等 key 不丢失
  Given 请求 A 已执行并缓存结果（key=abc）
  When 进程重启（serverless 冷启动）
  And 请求 B 携带相同 key=abc 到达
  Then 请求 B 返回缓存结果（而非重新执行）
```

## Files to Modify/Create

- Modify/Create: `src/lib/__tests__/idempotency.test.ts`

## Steps

### Step 1: 定位现有测试和 mock 模式

查找 `idempotency` 相关测试，了解现有覆盖。

### Step 2: 添加并发竞态测试（Scenario 1）

用 `Promise.all` 模拟并发。当前进程内 Map + 无锁实现下，应**失败**。

### Step 3: 添加 key 语义绑定测试（Scenario 2-3）

当前 key 不绑定 method/path/body，Scenario 2 应**失败**。

### Step 4: 添加持久化测试（Scenario 4）

模拟进程重启（清空 Map），当前实现应**失败**。

## Verification Commands

```bash
pnpm vitest run src/lib/__tests__/idempotency.test.ts --reporter=verbose
```

## Success Criteria

- Scenario 1-4 测试失败（Red）
- 无 TypeScript 类型错误

## Commit

```
test(security): add idempotency TOCTOU, key binding, persistence scenarios
```

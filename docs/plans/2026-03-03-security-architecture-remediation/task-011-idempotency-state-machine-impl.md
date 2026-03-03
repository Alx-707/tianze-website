# Task 011: 幂等防护状态机 — 实现 (Green)

**depends-on:** Task 010, Task 025（存储后端 Gate）

## Description

将幂等防护从进程内 Map 改为 Task 025 决策的存储后端 + SETNX 抢占 + PENDING/COMPLETED 状态机 + key 语义绑定。

## Execution Context

**Task Number**: 011 of 027
**Phase**: C（原子化防滥用）
**Prerequisites**: Task 010 测试处于 Red 状态；Task 025 存储后端已决策

## BDD Scenarios

（与 Task 010 相同，此处为 Green 实现）

## Files to Modify

- `src/lib/idempotency.ts` — 核心重写
- 调用点（如 `src/app/api/subscribe/route.ts`）— 适配新接口

## Steps

### Step 1: 使用 Task 025 决策的存储后端

直接使用 Task 025 定义的 `IdempotencyStore` 接口和选定的存储适配器，不再重复评估。

### Step 2: 实现 SETNX 状态机

状态流转：
1. `SET key PENDING NX PX {ttl}` — 原子抢占
2. 如果 SET 成功：执行业务逻辑 → 写入 `COMPLETED(response)` → 返回结果
3. 如果 SET 失败（key 已存在）：
   - 如果状态是 `PENDING`：**返回 409 Conflict + `Retry-After: 1` 头**（不等待/不轮询；serverless 环境下长连接等待不可靠，409 让客户端明确知道"有并发请求正在处理，稍后重试"）
   - 如果状态是 `COMPLETED`：返回缓存的 response
4. 如果业务逻辑失败：按 token 校验后删除 key（允许重试）

### Step 3: 实现 key 语义绑定

Key 结构：`idempotency:{method}:{pathname}:{idempotencyKey}:{fingerprint(body语义字段)}`
- fingerprint 基于 body 的语义字段（排除 turnstileToken 等每次变化的字段）
- 如果相同 idempotencyKey + 不同 fingerprint → 返回 422（key 冲突）

### Step 4: 适配调用点

更新 `subscribe/route.ts` 等调用点，传入 request 信息以生成语义化 key。

## Verification Commands

```bash
pnpm vitest run src/lib/__tests__/idempotency.test.ts --reporter=verbose
pnpm vitest run src/app/api/subscribe/ --reporter=verbose
pnpm type-check
```

## Success Criteria

- Task 010 所有测试通过（Green）
- 并发请求只执行一次
- Key 绑定 method/path/body fingerprint
- serverless 冷启动后幂等仍有效
- 无 TypeScript 类型错误

## Commit

```
fix(security): implement idempotency state machine with Redis/KV + key binding
```

# Task 025: 存储后端决策 — Gate

**depends-on:** —

## Description

Phase C 的两条实现线（rate limit 原子化 Task 009、幂等状态机 Task 011）依赖外部存储后端决策。Task 013（WhatsApp 入口防护）仅重排现有调用顺序，不涉及存储变更，不依赖本 Gate。在实现前必须统一决策存储选型和抽象层接口，否则并行开发会产生返工和接口分叉。

本任务是 **Gate 任务**（纯决策 + 接口定义，不写业务实现），完成后 Phase C 的 Red-Green 线才可启动。

## Execution Context

**Task Number**: 025 of 027
**Phase**: C 前置 Gate
**Prerequisites**: 无

## 决策输入

当前项目已有的 Cloudflare 存储 binding（`wrangler.jsonc`）：
- **D1 数据库**: `NEXT_TAG_CACHE_D1`（已用于 tag cache）
- **R2 存储桶**: `NEXT_INC_CACHE_R2_BUCKET`（已用于增量缓存）
- **Durable Objects**: `NEXT_CACHE_DO_QUEUE`（已用于缓存队列）
- **无 KV binding**（未配置）
- **无 Upstash Redis**（未配置）

## 需要回答的问题

1. **Rate limit 原子计数器用什么后端？**
   - D1 SQL `INSERT ... ON CONFLICT UPDATE count = count + 1`（原子，但 D1 延迟可能高）
   - Durable Objects（天然原子，per-key 隔离，但冷启动成本）
   - 新增 Cloudflare KV binding（最终一致性，INCR 不原子）
   - 新增 Upstash Redis（原子 INCR，但引入外部依赖）

2. **幂等 SETNX 用什么后端？**
   - 必须支持原子 SET-IF-NOT-EXISTS + TTL
   - D1 `INSERT ... ON CONFLICT DO NOTHING` + scheduled cleanup
   - Durable Objects transactional storage

3. **Rate limit 和幂等是否共用存储层？**
   - 共用可减少 binding 数量和运维成本
   - 分离可避免故障域耦合

## Steps

### Step 1: 评估现有 binding 能力

确认 D1 和 Durable Objects 在当前 plan 下的性能和成本约束。

### Step 2: 定义存储抽象接口

定义一个存储抽象层（如 `RateLimitStore` interface 和 `IdempotencyStore` interface），使业务逻辑不直接依赖具体后端。这样 Task 009/011 可以面向接口编程，后端切换只改适配器。

### Step 3: 做出决策并记录

在本任务文件中记录决策结论，作为 Task 009/011 的输入。

### Step 4: 重构现有存储抽象 + 补充 IdempotencyStore

**重要**：`src/lib/security/distributed-rate-limit.ts` 中已有 `RateLimitStore` 接口和 store factory（Upstash/KV/Memory 适配器）。**不要新建第二套接口**，而是：
- 将现有 `RateLimitStore` 抽取到独立文件（如 `src/lib/security/stores/rate-limit-store.ts`）
- 在同目录补充 `IdempotencyStore` 接口（`setIfNotExists()`、`get()`、`delete()` 方法签名）
- 更新 `distributed-rate-limit.ts` 从新位置导入 `RateLimitStore`
- 如果 rate limit 和幂等共用后端，创建统一的适配器工厂

## Verification Commands

```bash
pnpm type-check
```

## Success Criteria

- 存储后端选型已决策并记录
- `RateLimitStore` 和 `IdempotencyStore` 接口已定义
- Task 009/011 的实现方案已确定（不再有"先确认后端"的歧义）

## Decision Record (2026-03-03)

### Q1: Rate limit 原子计数器后端

**决策: 保持现有多后端策略（Upstash Redis > Vercel KV > Memory），未来可加 D1 适配器**

**已知限制（2026-03-04 验收确认）：** 当前实现为**单实例串行**（per-key promise queue），非跨实例原子。store 侧 `increment()` 仍为 GET→SET，多实例并发可能超发。跨实例原子性需配置分布式后端（Upstash INCR / D1 原子 SQL）。当前流量规模下单实例 Memory 足够。

理由:
- 现有代码已实现 Upstash Redis 和 Vercel KV 适配器，且生产环境未配置任何一个（当前使用 Memory fallback）
- D1 已绑定但用于 tag cache，rate limit 和 tag cache 共用同一 D1 会增加耦合
- 当前流量规模下 Memory 足够（单 Worker 实例内有效），后续如需跨实例一致性再配置 Upstash
- Task 009 的改进重点是原子性语义（increment 改为 throw-on-failure），不需要更换后端

### Q2: 幂等 SETNX 后端

**决策: Memory 作为当前后端，接口预留分布式适配器**

**已知限制（2026-03-04 验收确认）：** 当前为**进程内 Memory store**，serverless 冷启动后丢失。fingerprint 仅绑定 `method:pathname`，未绑定 body hash。跨实例持久化幂等需 D1/DO 后端，body fingerprint 为后续增强项。

理由:
- 当前 idempotency.ts 使用 `Map<string, IdempotencyCache>` 进程内缓存
- 幂等 key 的生命周期通常是 24h，serverless 冷启动后缓存丢失的影响有限（最多导致重复处理一次）
- `IdempotencyStore` 接口已定义 `setIfNotExists()` 方法，Task 011 可直接在 Memory 实现上实现状态机
- 如需 D1 后端: `INSERT INTO idempotency_keys(key, status, ...) ON CONFLICT DO NOTHING` + scheduled cleanup

### Q3: 是否共用存储层

**决策: 分离（各自独立接口和适配器）**

理由:
- Rate limit 和 idempotency 有不同的数据模型（计数器 vs 状态机）
- 故障域隔离 — rate limit 存储故障不应影响幂等判断
- 接口定义在同一 `stores/` 目录下，共享代码组织但不共享运行时实例

### 文件变更

| 文件 | 变更 |
|------|------|
| `src/lib/security/stores/rate-limit-store.ts` | 新建 — 从 distributed-rate-limit.ts 抽取 RateLimitStore 接口 + 3 个适配器 + factory |
| `src/lib/security/stores/idempotency-store.ts` | 新建 — IdempotencyStore 接口 + MemoryIdempotencyStore + factory |
| `src/lib/security/stores/index.ts` | 新建 — barrel export |
| `src/lib/security/distributed-rate-limit.ts` | 重写 — 从 stores/ 导入，移除内联定义 |

## Commit

```
chore: define storage backend for rate limit and idempotency
```

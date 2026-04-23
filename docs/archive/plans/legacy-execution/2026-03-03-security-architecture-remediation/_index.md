# 安全与架构修复 — 实施计划

> **For Claude:** Optional: Use Skill tool load `superpowers:executing-plans` skill for orchestrated execution, or execute tasks manually in order.

**Goal:** 修复三轮代码审查（原始报告 → Codex 再审查 → Claude Code 事实核查 → Codex 再反馈）交叉验证确认的安全漏洞、架构债务和质量门禁问题。

**Source:** 审查三方交叉验证最终共识。非 brainstorming 设计，Discovery 阶段由审查流程替代。

**核心原则:**
1. **按风险梯度执行** — 安全快赢 → 环境稳定性 → 原子化 → 边界重构 → 真相源 → 契约/性能
2. **每步可验证可回滚** — 每个 Phase 完成后运行完整验证，失败可 git revert
3. **最小改动原则** — 只修审查确认的问题，不顺手重构无关代码
4. **测试先行** — 安全/行为修复遵循 Red-Green；结构性变更以 build/lint/CI 为验收

---

## Execution Plan

### Phase A: 安全快赢（阻断可被利用的入口）

- [Task 001: Replay 防护修正 — 测试](./task-001-replay-protection-tests.md)
- [Task 002: Replay 防护修正 — 实现](./task-002-replay-protection-fix.md)
- [Task 003: Turnstile 端点限流 — 测试](./task-003-turnstile-rate-limit-tests.md)
- [Task 004: Turnstile 端点限流 — 实现](./task-004-turnstile-rate-limit-fix.md)
- [Task 005: API key 常量时间比较](./task-005-constant-time-compare.md)

### Phase B: Cloudflare 环境稳定性

- [Task 006: 环境变量修正 — DEPLOYMENT_PLATFORM + cookie secure](./task-006-env-vars-fix.md)
- [Task 007: phase6 路由表单源生成](./task-007-phase6-route-single-source.md)

### Phase C: 原子化防滥用

> **前置 Gate**: [Task 025: 存储后端决策](./task-025-storage-backend-gate.md) 必须先完成。Task 009（rate limit 实现）和 Task 011（幂等实现）依赖统一的存储选型和抽象层接口。原 WhatsApp webhook 防护任务已于 2026-04-14 因功能退场归档，不再进入当前执行序列。

- [Task 025: 存储后端决策 — Gate](./task-025-storage-backend-gate.md)
- [Task 008: Rate limit 原子化 — 测试](./task-008-rate-limit-atomic-tests.md)
- [Task 009: Rate limit 原子化 — 实现](./task-009-rate-limit-atomic-impl.md)
- [Task 010: 幂等防护状态机 — 测试](./task-010-idempotency-state-machine-tests.md)
- [Task 011: 幂等防护状态机 — 实现](./task-011-idempotency-state-machine-impl.md)
- Task 012 / Task 013 已于 2026-04-14 因 WhatsApp 功能退场归档。


### Phase D: 边界重构 + 规则钉死

- [Task 014: 抽取共享逻辑出 API 路由层](./task-014-extract-shared-from-api.md)
- [Task 015: 迁移 actions + emails 到正确层](./task-015-move-actions-emails.md)
- [Task 016: dependency-cruiser 规则 + CI 集成](./task-016-dependency-cruiser-rules.md)

### Phase E: 真相源收敛

- [Task 017: i18n canonical 格式统一](./task-017-i18n-canonical-format.md)
- [Task 026: i18n 运行时缓存/失效策略](./task-026-i18n-runtime-cache.md)
- [Task 018: Content manifest 稳定化](./task-018-content-manifest-stabilize.md)
- [Task 019: 门禁治理](./task-019-quality-gate-governance.md)

### Phase F: 契约 + 性能 + 清理

- [Task 020: API 契约统一](./task-020-api-contract-unify.md)
- [Task 021: 输入校验加固](./task-021-input-validation-hardening.md)
- Task 022 已于 2026-04-14 因 WhatsApp 功能退场归档。
- [Task 023: 性能修复](./task-023-performance-fixes.md)
- [Task 024: 路径安全 + MDX + P2 清理](./task-024-path-security-cleanup.md)
- [Task 027: 关键路径真实提交集成测试](./task-027-e2e-submit-integration.md)

---

## Dependencies

| Task | Depends On | 可并行 | 说明 |
|------|------------|--------|------|
| Task 001 | — | ✓ | |
| Task 002 | Task 001 | | Red→Green |
| Task 003 | — | ✓ | 可与 001 并行 |
| Task 004 | Task 003 | | Red→Green |
| Task 005 | — | ✓ | 独立一行修复 |
| Task 006 | — | ✓ | 纯配置变更 |
| Task 007 | — | ✓ | 独立脚本重构 |
| **Task 025** | **—** | **✓** | **Phase C Gate：存储后端决策** |
| Task 008 | — | ✓ | Red 测试不依赖 Gate |
| Task 009 | Task 008, **Task 025** | | Red→Green + Gate |
| Task 010 | — | ✓ | Red 测试不依赖 Gate |
| Task 011 | Task 010, **Task 025** | | Red→Green + Gate |
| Task 012 | — | — | 已于 2026-04-14 因功能退场归档 |
| Task 013 | Task 012 | — | 已于 2026-04-14 因功能退场归档 |
| Task 014 | — | | 影响面大，建议独立窗口 |
| Task 015 | Task 014 | | 依赖 014 的抽取结果 |
| Task 016 | Task 015 | | 规则需要在重构完成后验证 |
| Task 017 | — | ✓ | 独立脚本 + 配置 |
| **Task 026** | **Task 017** | | **i18n 运行时缓存，依赖文件层修复** |
| Task 018 | — | ✓ | 独立脚本 |
| Task 019 | — | ✓ | 可与 017/018 并行 |
| Task 020 | — | ✓ | |
| Task 021 | — | ✓ | |
| Task 022 | — | — | 已于 2026-04-14 因功能退场归档 |
| Task 023 | Task 015 | | 依赖 emails 迁移（Buffer 路径变化） |
| Task 024 | — | ✓ | |
| **Task 027** | **—** | | **Phase F 末尾回归验证，建议最后执行** |

```
推荐串行执行路径：

Phase A（安全快赢，可内部并行）:
  [001→002] + [003→004] + [005]   # 3 条并行线

Phase B（Cloudflare 稳定性）:
  [006] + [007]                    # 可并行

Phase C（原子化）:
  025（Gate：存储决策）
       ↓
  [008→009] + [010→011] + [012→013]  # Gate 后 3 条并行线
  （008/010/012 的 Red 测试可在 025 完成前提前编写）

Phase D（边界重构，必须串行）:
  014 → 015 → 016

Phase E（真相源）:
  [017→026] + [018] + [019]        # 017→026 串行，其余并行

Phase F（契约/性能/清理）:
  [020] + [021] + [022] + [024]    # 并行
       ↓
  [023]                             # 依赖 015
       ↓
  [027]                             # 最后：集成测试回归验证
```

---

## 部署约束（Workers 发布顺序）

> **关键约束**：代码开发可以并行，但 Cloudflare Workers 部署必须遵守以下顺序。

**Task 006（DEPLOYMENT_PLATFORM 环境变量）必须先部署。**

原因：Task 006 未部署前，Workers 环境中 `getDeploymentPlatform()` 返回 `null`，导致所有 IP 退化为 `0.0.0.0`。此时所有用户共享同一个 rate limit bucket。如果先部署 Task 004（Turnstile 加限流），正常用户流量会被攻击者的限流配额一起限死。

| 部署批次 | 包含任务 | 前置条件 |
|----------|---------|---------|
| **批次 1** | Task 006 | 无 |
| **批次 2** | Task 001-005, 007 | 批次 1 已在 Workers 生效 |
| **批次 3** | Phase C 所有任务 | 批次 1 已在 Workers 生效 |
| 后续 | Phase D-F | 无额外部署约束 |

---

## 验证策略

**轻量验证**（每个 Task 完成后）：
```bash
pnpm type-check && pnpm test
```

**完整验证**（Phase 切换时）：
```bash
pnpm type-check && pnpm lint:check && pnpm test && pnpm build
```

**最终验证**（全部 Task 完成后）：
```bash
pnpm ci:local
```

---

## 风险说明

| 风险 | 影响 | 缓解 |
|------|------|------|
| Phase C 存储后端选型 | Rate limit + 幂等依赖统一后端 | Task 025 Gate 任务前置决策 |
| Workers 部署顺序 | 先部署限流任务 + IP 退化 = 正常流量被限死 | 部署约束节强制 Task 006 先行 |
| Phase D 大范围文件移动 | import 路径变更可能遗漏 | dependency-cruiser CI 验证 + 完整 build |
| Phase E i18n 工具链改动 | 翻译流程中断 | 先确认 canonical → generated 方向，再改工具链 |
| i18n 运行时缓存层 | revalidateTag 不穿透 = 线上旧文案 | Task 026 专门处理缓存层合并 |
| 大范围重构后回归 | contact/inquiry 提交链路可能断裂 | Task 027 集成测试作为最终回归验证 |

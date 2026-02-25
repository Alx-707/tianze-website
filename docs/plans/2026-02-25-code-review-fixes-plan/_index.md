# 代码审查问题修复 — 实施计划

> **For Claude:** Optional: Use Skill tool load `superpowers:executing-plans` skill for orchestrated execution, or execute tasks manually in order.

**Goal:** 修复代码审查（原始报告 + Codex 再审查 + 并行复核）确认的 6 项问题，按优先级从高到低执行。

**Source:** 代码审查三方交叉验证确认的问题清单（非 brainstorming 设计，Discovery 阶段由审查流程替代）。

**核心原则:**
1. 每项修复独立成 PR 可合并 — 不产生跨问题的隐式依赖
2. 安全类修复优先 — Webhook 签名绕过是唯一 [高] 级问题，必须首先处理
3. 行为保持 — 常量重命名、类型优化等重构不改变运行时行为
4. 测试先行 — 安全修复和行为变更遵循 Red-Green 工作流

---

## Execution Plan

### Phase A: 安全修复（高优先级）
- [Task 001: Webhook 签名验证 — 添加测试](./task-001-webhook-signature-tests.md)
- [Task 002: Webhook 签名验证 — 修复实现](./task-002-webhook-signature-fix.md)

### Phase B: 代码清理（中优先级）
- [Task 003: 清理 sanitizeForDatabase 死代码](./task-003-remove-sanitize-dead-code.md)
- [Task 004: Content parser 异步 I/O — 添加测试](./task-004-content-parser-async-tests.md)
- [Task 005: Content parser 异步 I/O — 重构实现](./task-005-content-parser-async-refactor.md)
- [Task 006: MAGIC_* 常量语义化重命名](./task-006-constants-semantic-rename.md)

### Phase C: 增强改进（低优先级）
- [Task 007: 确认邮件重试 — 添加测试](./task-007-confirmation-email-retry-tests.md)
- [Task 008: 确认邮件重试 — 实现](./task-008-confirmation-email-retry-impl.md)
- [Task 009: Schema builder 类型优化消除双重断言](./task-009-schema-type-assertion-fix.md)

### Dependencies

| Task | Depends On | 可并行 |
|------|------------|--------|
| Task 001 | — | ✓ |
| Task 002 | Task 001 | |
| Task 003 | — | ✓ |
| Task 004 | — | ✓ |
| Task 005 | Task 004 | |
| Task 006 | — | ✓ |
| Task 007 | — | ✓ |
| Task 008 | Task 007 | |
| Task 009 | — | ✓ |

```
Phase A (安全):
  Task 001 (Red) ── Task 002 (Green)

Phase B (清理, 全部可与 Phase A 并行):
  Task 003 (dead code removal)
  Task 004 (Red) ── Task 005 (Green)
  Task 006 (rename refactor)

Phase C (增强, 全部可与 Phase A/B 并行):
  Task 007 (Red) ── Task 008 (Green)
  Task 009 (type fix)
```

最大并行度：Task 001 / 003 / 004 / 006 / 007 / 009 可同时启动（6 路并行）。

---

## 改动总览

| 操作 | 文件 | 改动量 |
|------|------|--------|
| **修改** | `src/lib/whatsapp-service.ts` | ~15 行 |
| **修改** | `src/lib/__tests__/whatsapp-service.test.ts` | +30 行 |
| **删除** | `src/lib/security-validation.ts` (sanitizeForDatabase 函数) | -15 行 |
| **修改** | `src/lib/__tests__/security-validation.test.ts` | -40 行 |
| **修改** | `src/lib/content-parser.ts` | ~40 行（sync → async） |
| **修改** | `src/lib/content-query.ts` | ~10 行（调用链适配） |
| **修改** | `src/lib/__tests__/content-parser.test.ts` | +20 行 |
| **修改** | `src/constants/count.ts` | ~30 行（重命名） |
| **修改** | `src/constants/decimal.ts` | ~20 行（重命名） |
| **修改** | 引用 MAGIC_* 的所有文件 | 批量替换 |
| **修改** | `src/lib/lead-pipeline/processors/contact.ts` | ~20 行 |
| **修改** | `src/app/api/contact/contact-api-validation.ts` | ~10 行 |
| **修改** | `src/config/contact-form-config.ts` | ~15 行 |

**总计：~13 个文件修改 + 测试新增，约 250-300 行净变更**

---

## 验证策略

每个 Task 完成后执行：
```bash
pnpm type-check    # TypeScript 零错误
pnpm lint:check    # ESLint 零警告
pnpm test          # 全部测试通过
```

Phase A 完成后额外执行：
```bash
pnpm build         # 生产构建通过
```

全部 Task 完成后执行：
```bash
pnpm ci:local      # 完整 CI 管线
```

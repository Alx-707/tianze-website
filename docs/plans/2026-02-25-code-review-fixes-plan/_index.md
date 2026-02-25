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
推荐串行执行路径：

  Task 001 (Red) → Task 002 (Green)   # 安全修复
       ↓
  Task 003                             # 死代码清理
       ↓
  Task 004 (Red) → Task 005 (Green)   # async 迁移（影响面最大）
       ↓
  Task 006                             # 常量重命名（31 个文件）
       ↓
  Task 007 (Red) → Task 008 (Green)   # 确认邮件重试
       ↓
  Task 009                             # 类型优化
```

Task 间技术依赖仅存在于 Red→Green 配对内（001→002, 004→005, 007→008），其余 Task 操作不同文件。串行执行是为了避免大范围变更（Task 005 改 18 个文件、Task 006 改 31 个文件）之间的合并冲突。

---

## 改动总览

| 操作 | 文件 | 改动量 |
|------|------|--------|
| **修改** | `src/lib/whatsapp-service.ts` | ~15 行 |
| **修改** | `src/lib/__tests__/whatsapp-service.test.ts` | +30 行 |
| **删除** | `src/lib/security-validation.ts` (sanitizeForDatabase 函数) | -15 行 |
| **修改** | `src/lib/__tests__/security-validation.test.ts` | -40 行 |
| **修改** | `src/lib/content-parser.ts` | ~40 行（sync → async） |
| **修改** | `src/lib/content-query/queries.ts` | ~30 行（所有函数改 async） |
| **修改** | `src/lib/content-query/stats.ts` | ~10 行 |
| **修改** | `src/lib/content/products-source.ts` | ~15 行 |
| **修改** | `src/lib/content/products.ts` | ~5 行（5 个 cached 函数加 await） |
| **修改** | `src/lib/content/blog.ts` | ~5 行（内部调用 await） |
| **修改** | `src/app/[locale]/privacy/page.tsx` | ~2 行 |
| **修改** | `src/app/[locale]/terms/page.tsx` | ~2 行 |
| **修改** | `src/app/[locale]/faq/page.tsx` | ~2 行 |
| **修改** | `src/app/sitemap.ts` | ~5 行 |
| **修改** | `src/lib/__tests__/content-parser.test.ts` | +20 行 |
| **修改** | `src/lib/content-query/__tests__/*.test.ts` (4 files) | ~40 行 |
| **修改** | `src/constants/count.ts` | ~30 行（重命名） |
| **修改** | `src/constants/decimal.ts` | ~20 行（重命名） |
| **修改** | 引用 MAGIC_* 的 31 个文件 | 批量替换 |
| **新建** | `src/lib/lead-pipeline/__tests__/contact-processor.test.ts` | +60 行 |
| **修改** | `src/lib/lead-pipeline/processors/contact.ts` | ~20 行 |
| **修改** | `src/app/api/contact/contact-api-validation.ts` | ~10 行 |
| **修改** | `src/config/contact-form-config.ts` | ~15 行 |

**总计：~50+ 个文件修改（含 MAGIC_* 批量替换 31 个文件），约 400-450 行净变更**

---

## 推荐执行顺序

基于 Codex 审查反馈，建议按以下顺序串行执行以避免合并冲突：

1. **Task 001 → Task 002**（Webhook 安全修复，最高优先级）
2. **Task 003**（死代码清理，独立且快速）
3. **Task 004 → Task 005**（Content parser 异步迁移，影响面最大，需独立窗口）
4. **Task 006**（常量重命名，影响 31 个文件，避免与 async 迁移冲突）
5. **Task 007 → Task 008**（确认邮件重试）
6. **Task 009**（类型优化，纯类型改动，最后处理）

## 验证策略

**轻量验证**（每个 Task 完成后）：
```bash
pnpm type-check    # TypeScript 零错误
pnpm test          # 相关测试通过
```

**完整验证**（Phase 切换时，即 Task 002/005/008/009 完成后）：
```bash
pnpm type-check && pnpm lint:check && pnpm test
```

**最终验证**（全部 Task 完成后）：
```bash
pnpm ci:local      # 完整 CI 管线
pnpm build         # 生产构建
```

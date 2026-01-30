# Task Plan: 代码质量修复

## 执行计划

### 1. [P0] 修复 WhatsApp 电话验证 bug

**状态**: ✅ 完成

**问题**:
```typescript
// src/lib/whatsapp-utils.ts:31
const phoneRegex = /^\d{COUNT_TEN,15}$/;  // COUNT_TEN 是字符串字面量，永远返回 false
```

**修复**:
```typescript
const phoneRegex = /^\d{10,15}$/;
```

**文件**:
- `src/lib/whatsapp-utils.ts` — 修复正则
- `src/lib/__tests__/whatsapp-utils.test.ts` — 删除"锁定 bug"的测试，写正确的测试

**验证**: `pnpm test src/lib/__tests__/whatsapp-utils.test.ts`

---

### 2. [P1] 重构 load-messages.ts

**状态**: ✅ 完成 (346→96 行)

**目标**: 346 行 → 100 行以内

**动作**:
- 合并 critical/deferred 重复逻辑为泛型函数
- 删除无效的 preload 函数（调用后丢弃 Promise）
- 精简过度的 JSDoc 注释

**约束**:
- 公开 API 签名不变（`loadCriticalMessages`, `loadDeferredMessages`, `loadCompleteMessages`）
- cache key 必须包含 `type` 参数，否则 critical/deferred 会互相污染缓存

**文件**:
- `src/lib/load-messages.ts`

**验证**: `pnpm test` + `pnpm build` + 手动验证 dev/production 模式翻译加载

---

### 3. [P2] 常量模块重组

**状态**: ✅ 完成

**动作（一次性完成）**:
1. 创建领域文件：
   - `src/constants/whatsapp-errors.ts` — WhatsApp API 错误码
   - `src/constants/validation-limits.ts` — 验证限制常量
2. 迁移常量到对应文件，使用语义化命名：
   - `MAGIC_131008` → `WA_ERR_MISSING_PARAM`
   - `MAGIC_256` → `MAX_BUTTON_ID_LENGTH`（或删除重复）
3. 删除 25+ 未使用常量
4. 消除重复定义（`MAGIC_256/COUNT_256`, `COUNT_4/COUNT_FOUR` 等）
5. 更新 `src/constants/index.ts` re-export
6. 全局替换 import 路径

**删除清单**:
```
MAGIC_17, MAGIC_18, MAGIC_22, MAGIC_70, MAGIC_75, MAGIC_80,
MAGIC_85, MAGIC_90, MAGIC_512, MAGIC_999, MAGIC_1800, MAGIC_4000,
MAGIC_60000, COUNT_14, COUNT_23, COUNT_35, COUNT_45, COUNT_368,
COUNT_450, COUNT_1536, COUNT_6000, COUNT_7000, COUNT_8000,
COUNT_9000, COUNT_12000, COUNT_15000, COUNT_45000, COUNT_125000,
COUNT_200000
```

**验证**: `pnpm type-check` + `pnpm lint` + `pnpm test`

---

### 4. [P3] 删除安全过度防护

**状态**: ✅ 完成 (删除 758 行)

**动作**:
1. 删除 `src/lib/security-object-access.ts` 整个文件
2. 修改 `src/lib/merge-objects.ts`：用 `hasOwn` + 直接属性访问替代 `safeGetProperty`/`safeSetProperty`
3. 简化 `src/components/blocks/hero/hero-split-block.tsx` 的 `getNestedValue`：改用 optional chaining 或直接属性访问

**保留**:
- `src/lib/security/object-guards.ts` 中的 `hasOwn` 函数

**验证**: `pnpm type-check` + `pnpm test`

---

## 执行顺序

```
1. fix(whatsapp): 修复 validatePhoneNumber 正则 bug
   └── pnpm test → 通过 → commit

2. refactor(i18n): 重构 load-messages.ts
   └── pnpm ci:local → 通过 → commit

3. refactor(constants): 常量模块领域化重组
   └── pnpm ci:local → 通过 → commit

4. refactor(security): 删除过度防护代码
   └── pnpm ci:local → 通过 → commit
```

每一步完成后验证，通过再继续。每个里程碑一个 commit，便于精确回滚。

---

## 验证策略

| 里程碑 | 验证命令 | 关键检查点 |
|--------|----------|------------|
| P0 WhatsApp | `pnpm test whatsapp` | 10-15 位电话号码返回 true |
| P1 load-messages | `pnpm build` + 手动测试 | 中英文翻译正常加载 |
| P2 常量重组 | `pnpm type-check` | 无 TS 错误，import 路径正确 |
| P3 安全简化 | `pnpm test` | merge-objects 功能不变 |

---

## 回滚策略

每个里程碑独立 commit，命名规范：
- `fix(whatsapp): correct phone validation regex`
- `refactor(i18n): simplify load-messages from 346 to ~100 lines`
- `refactor(constants): reorganize by domain, remove dead code`
- `refactor(security): remove over-protective object access utilities`

出问题时 `git revert <commit>` 精确回滚单个里程碑。

---

## Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| WhatsApp bug 升为 P0 | 功能缺陷优先于代码整理 | 2026-01-30 |
| 合并常量任务为单一里程碑 | 任务间强依赖，分开做增加中间状态风险 | 2026-01-30 |
| 删除整个 security-object-access.ts | 7/9 函数未使用，剩余 2 个用于内部数据，过度防护 | 2026-01-30 |
| 拒绝兼容层/渐进迁移 | 单人项目无外部消费者，一次性重构更干净 | 2026-01-30 |

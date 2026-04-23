# Task 003: 清理 sanitizeForDatabase 死代码

**depends-on:** —

## Description

移除未被任何生产代码调用的 `sanitizeForDatabase` 函数及其测试用例。该函数名称暗示 SQL 注入防护但实现仅为字符替换，项目使用 Airtable API（无 SQL），保留此函数会产生错误安全感的误用风险。

## Execution Context

**Task Number**: 003 of 009
**Phase**: B（代码清理）
**Severity**: 中
**Prerequisites**: 无（与其他 Task 完全独立）

## BDD Scenarios

### Scenario 1: 函数移除后无编译错误
- Given: `sanitizeForDatabase` 从 `security-validation.ts` 中移除
- When: 执行 `pnpm type-check`
- Then: 零 TypeScript 错误（证明无生产代码依赖此函数）

### Scenario 2: 函数移除后全部测试通过
- Given: `sanitizeForDatabase` 及其测试用例均已移除
- When: 执行 `pnpm test`
- Then: 全部测试通过，无新增失败

## Files to Modify/Create

- Modify: `src/lib/security-validation.ts` — 删除 `sanitizeForDatabase` 函数（约 240-252 行）
- Modify: `src/lib/__tests__/security-validation.test.ts` — 删除对应的 describe 块和 import
- Modify: `tests/unit/security/security-validation.test.ts` — 删除对应引用（如存在）
- Possibly modify: `src/lib/security-validation.ts` 的导出声明（如有 barrel export）

## Steps

### Step 1: 确认函数无生产调用

在开始前执行 `grep -rn "sanitizeForDatabase" src/ --include="*.ts" --include="*.tsx"` 确认仅在定义文件和测试文件中出现。如果发现生产调用，**停止此 Task 并重新评估**。

### Step 2: 从 `security-validation.ts` 中删除函数

删除 `sanitizeForDatabase` 函数定义（约第 237-252 行，包含 JSDoc 注释）。

### Step 3: 从测试文件中删除对应用例

- `src/lib/__tests__/security-validation.test.ts` — 删除 import 中的 `sanitizeForDatabase` 和整个 `describe("sanitizeForDatabase", ...)` 块
- `tests/unit/security/security-validation.test.ts` — 删除相关引用

### Step 4: 检查是否有 barrel export

检查 `src/lib/security-validation.ts` 是否通过其他 index 文件导出此函数，如有则一并清理。

### Step 5: 验证

运行 type-check、lint、test 确认清理干净。

## Verification Commands

```bash
# 确认函数已移除
grep -rn "sanitizeForDatabase" src/ tests/ --include="*.ts" --include="*.tsx"
# 预期：零匹配

# TypeScript + Lint
pnpm type-check
pnpm lint:check

# 全量测试
pnpm test
```

## Success Criteria

- `sanitizeForDatabase` 在整个代码库中不再出现
- `pnpm type-check` 零错误
- `pnpm test` 全部通过
- 无 lint 警告

## Commit

```
refactor(security): remove unused sanitizeForDatabase function

- Function was dead code (no production callers)
- Name implied SQL injection protection but only did character stripping
- Project uses Airtable API, not SQL databases
```

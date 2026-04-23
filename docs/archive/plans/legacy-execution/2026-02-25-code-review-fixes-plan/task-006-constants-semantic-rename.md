# Task 006: MAGIC_* 常量语义化重命名

**depends-on:** —

## Description

将语义模糊的 `MAGIC_*` 常量重命名为具有上下文含义的名称（如 `MAGIC_16` → `HEX_RADIX`），统一 `DEC_*` / `MAGIC_*` 的前缀混用，并通过全局替换确保所有引用一致更新。这是纯重构，不改变运行时行为。

## Execution Context

**Task Number**: 006 of 009
**Phase**: B（代码清理）
**Severity**: 中
**Prerequisites**: 无

## BDD Scenarios

### Scenario 1: 重命名后全部测试通过（行为保持）
- Given: 所有 `MAGIC_*` 常量已重命名为语义名
- When: 执行 `pnpm test`
- Then: 全部测试通过，零失败

### Scenario 2: 重命名后无 TypeScript 错误
- Given: 重命名在定义和所有引用处一致应用
- When: 执行 `pnpm type-check`
- Then: 零 TypeScript 错误

### Scenario 3: 代码库中不再有 MAGIC_ 前缀
- Given: 重命名完成
- When: 搜索 `grep -rn "MAGIC_" src/`
- Then: 零匹配

## Files to Modify/Create

- Modify: `src/constants/count.ts` — 重命名 `MAGIC_*` 常量
- Modify: `src/constants/decimal.ts` — 统一 `DEC_*` / `MAGIC_*` 前缀
- Modify: `src/constants/index.ts` — 更新 re-export
- Modify: 所有引用 `MAGIC_*` 的文件（通过 IDE 全局替换或 `sed`）

## Steps

### Step 1: 建立重命名映射表

搜索所有 `MAGIC_*` 常量的定义和使用上下文，确定语义化名称：

| 当前名称 | 语义名称 | 来源 |
|----------|----------|------|
| `MAGIC_16` | `HEX_RADIX` | 十六进制基数 |
| `MAGIC_36` | `BASE36_RADIX` | Base36 短 ID 基数 |
| `MAGIC_6` | 根据使用上下文确定 | 需查看引用 |
| `MAGIC_8` | 根据使用上下文确定 | 需查看引用 |
| `MAGIC_9` | 根据使用上下文确定 | 需查看引用 |
| `MAGIC_12` | 根据使用上下文确定 | 需查看引用 |
| `MAGIC_32` | 根据使用上下文确定 | 需查看引用 |
| `MAGIC_48` | 根据使用上下文确定 | 需查看引用 |
| `MAGIC_64` | 根据使用上下文确定 | 需查看引用 |
| `MAGIC_0_1` | 统一为 `DEC_0_1` 或按语义重命名 | 小数值 |
| `MAGIC_0_2` | 统一前缀 | 小数值 |
| `MAGIC_0_25` | 统一前缀 | 小数值 |

**关键**：每个常量的新名称必须根据**调用上下文**确定，不能仅根据数值命名。执行者需逐一查看 grep 结果中的使用位置。

### Step 2: 在定义文件中重命名

修改 `src/constants/count.ts` 和 `src/constants/decimal.ts`，使用新名称定义常量。保留旧名称作为 `@deprecated` 别名（可选，用于渐进迁移）。

### Step 3: 全局替换所有引用

使用 IDE 重命名功能或 `grep + sed` 批量替换所有文件中的旧名称引用。确保替换覆盖：
- `src/` 下所有 `.ts` / `.tsx` 文件
- `tests/` 下所有测试文件

### Step 4: 更新 barrel export

更新 `src/constants/index.ts` 中的 re-export 语句。

### Step 5: 清理 deprecated 别名（如适用）

如果 Step 2 添加了 deprecated 别名，在全局替换完成后删除它们。

### Step 6: 验证

运行 type-check、lint、test，确认重命名无遗漏且行为不变。

## Verification Commands

```bash
# 确认 MAGIC_ 前缀已消除
grep -rn "MAGIC_" src/ --include="*.ts" --include="*.tsx"
# 预期：零匹配（测试文件中的字面量字符串除外）

# TypeScript + Lint
pnpm type-check
pnpm lint:check

# 全量测试（行为保持验证）
pnpm test
```

## Success Criteria

- 生产代码中不再有 `MAGIC_` 前缀的常量
- 所有常量名称具有上下文语义
- `DEC_*` 前缀统一（不与 `MAGIC_*` 混用）
- `pnpm type-check` 零错误
- `pnpm test` 全部通过
- `pnpm lint:check` 零警告

## Commit

```
refactor(constants): replace MAGIC_* with semantic constant names

- MAGIC_16 → HEX_RADIX, MAGIC_36 → BASE36_RADIX, etc.
- Unify DEC_*/MAGIC_* prefix inconsistency in decimal.ts
- All references updated via global rename
```

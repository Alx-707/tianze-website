# Task 018: Content manifest 稳定化

**depends-on:** —

## Description

修复 content manifest 生成脚本的两个问题：`readdirSync` 未排序导致平台间不一致、重复 slug 静默覆盖。

## Execution Context

**Task Number**: 018 of 027
**Phase**: E（真相源收敛）
**Prerequisites**: 无（可与 Task 017 并行）

## 审查证据

- `scripts/generate-content-manifest.ts:66`：`fs.readdirSync(dirPath)` 未排序，结果依赖文件系统顺序
- `scripts/generate-content-manifest.ts:115`：`byKey[key] = entry` 重复 key 直接覆盖

## BDD Scenarios

### Scenario 1: Manifest 输出确定性排序
```gherkin
Scenario: 不同系统生成相同 manifest
  Given content 目录包含 [c.mdx, a.mdx, b.mdx]
  When 在 macOS 和 Linux 上分别运行 generate-content-manifest
  Then 两次生成的 manifest 文件内容完全一致（按 slug 字母排序）
```

### Scenario 2: 重复 slug 报错而非覆盖
```gherkin
Scenario: 重复 slug 在构建时报错
  Given content 目录包含两个文件解析出相同 slug
  When 运行 generate-content-manifest
  Then 脚本以非零退出码终止
  And 错误信息指明冲突的文件路径和 slug
```

## Files to Modify

- `scripts/generate-content-manifest.ts`

## Steps

### Step 1: 添加排序

在 `readdirSync` 结果后加 `.sort()`，确保跨平台一致性。

### Step 2: 添加重复检测

在 `byKey[key] = entry` 前检查 `key` 是否已存在。如已存在，抛出错误指明冲突的两个文件路径。

### Step 3: 添加测试

创建测试验证排序和重复检测行为。

## Verification Commands

```bash
pnpm generate:content-manifest  # 确认脚本正常运行
pnpm type-check
```

## Success Criteria

- `readdirSync` 结果已排序
- 重复 slug 抛错而非静默覆盖
- 构建脚本正常运行

## Commit

```
fix(content): sort manifest entries, reject duplicate slugs
```

# Task 016: dependency-cruiser 规则 + CI 集成

**depends-on:** Task 015

## Description

用 dependency-cruiser 钉死边界规则，防止 Task 014/015 的重构结果回退。规则需在边界重构完成后添加，否则 CI 立即失败。

## Execution Context

**Task Number**: 016 of 027
**Phase**: D（边界重构）
**Prerequisites**: Task 015 完成（依赖方向已修正）

## 审查证据

- 报告建议在 `.dependency-cruiser.js` 中至少添加三条 forbidden 规则
- 当前无自动化机制防止依赖方向回退

## BDD Scenarios

### Scenario 1: lib → components/app 被阻断
```gherkin
Scenario: dependency-cruiser 阻断 lib 层反向依赖
  Given .dependency-cruiser.js 配置了 forbidden 规则
  When 开发者在 src/lib 中添加 import from src/components
  Then dependency-cruiser 报告 error 级违规
  And CI 失败
```

### Scenario 2: components → app 被阻断
```gherkin
Scenario: dependency-cruiser 阻断 components 层反向依赖
  Given .dependency-cruiser.js 配置了 forbidden 规则
  When 开发者在 src/components 中添加 import from src/app
  Then dependency-cruiser 报告 error 级违规
```

### Scenario 3: 非测试代码不 import API 路由
```gherkin
Scenario: dependency-cruiser 阻断非测试代码导入 API 路由
  Given .dependency-cruiser.js 配置了 forbidden 规则（测试目录豁免）
  When 非测试文件从 src/app/api 导入
  Then dependency-cruiser 报告 error 级违规
```

## Files to Modify/Create

- Create/Modify: `.dependency-cruiser.js`（或 `.dependency-cruiser.cjs`）
- Modify: `package.json` — 添加 `pnpm dep:check` 脚本
- Modify: CI 配置 — 将 dep:check 纳入 CI 管线

## Steps

### Step 1: 安装 dependency-cruiser

```bash
pnpm add -D dependency-cruiser
```

### Step 2: 创建配置

添加三条 forbidden 规则：
1. `^src/lib/` → `^src/(app|components)/` = error
2. `^src/components/` → `^src/app/` = error
3. 非测试文件 → `^src/app/api/` = error（测试文件豁免）

### Step 3: 添加 npm script

```json
"dep:check": "depcruise src --config .dependency-cruiser.js"
```

### Step 4: 纳入 CI

将 `pnpm dep:check` 添加到 CI 管线（quality-gate 或独立步骤）。

### Step 5: 验证当前代码通过

在 Task 014/015 完成后运行，确认当前代码不违反规则。

## Verification Commands

```bash
pnpm dep:check
pnpm type-check
```

## Success Criteria

- 三条 forbidden 规则配置完成
- 当前代码零违规
- CI 管线包含 dep:check
- 无 TypeScript 类型错误

## Commit

```
chore: add dependency-cruiser rules to enforce layer boundaries
```

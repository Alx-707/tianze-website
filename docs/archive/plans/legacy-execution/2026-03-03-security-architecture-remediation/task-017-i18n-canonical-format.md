# Task 017: i18n canonical 格式统一

**depends-on:** —

## Description

确立 i18n 翻译的单一真相源格式（建议 split: `messages/{locale}/{critical,deferred}.json`），flat 格式只作为生成物或检查用，工具链围绕 canonical 运转。

## Execution Context

**Task Number**: 017 of 027
**Phase**: E（真相源收敛）
**Prerequisites**: 无

## 审查证据（已验证的 drift 源）

- `messages/en.json`（flat）与 `messages/en/critical.json` + `messages/en/deferred.json`（split）同时存在
- `scripts/translation-sync.js`：读写 split，flat 仅作为派生产物
- `scripts/translation-flat-utils.js`：统一 split/flat 路径与 nested-path traversal
- `scripts/copy-translations.js:34`：构建时复制 split
- `src/lib/load-messages.ts:46,58`：运行时读 split
- `scripts/i18n-shape-check.js`：检查 flat == split union（drift 检测 = drift 证据）

## BDD Scenarios

### Scenario 1: 单一真相源为 split 格式
```gherkin
Scenario: split 格式是唯一需要手动维护的翻译文件
  Given messages/{locale}/{critical,deferred}.json 为 canonical
  When 开发者修改翻译
  Then 只需编辑 split 文件
  And flat 文件（如果保留）由工具自动生成
```

### Scenario 2: 工具链围绕 canonical 运转
```gherkin
Scenario: 所有 i18n 脚本以 split 为输入源
  Given 运行 pnpm i18n:full
  When 脚本执行完成
  Then translation-sync 从 split 读取（而非 flat）
  And copy-translations 从 split 复制
  And shape-check 以 split 为基准，flat 只做派生产物对账
```

### Scenario 3: CI 检查生成物一致性
```gherkin
Scenario: CI 验证无手动修改生成物
  Given flat 文件是从 split 自动生成的
  When CI 运行生成步骤后 git diff
  Then diff 为空（生成物与仓库中一致）
```

## Files to Modify

- `scripts/translation-sync.js` — 改为从 split 读取
- `scripts/translation-flat-utils.js` — 抽出 split/flat 公共路径与派生逻辑
- `scripts/copy-translations.js` — 确认行为不变（已读 split）
- `scripts/i18n-shape-check.js` — 以 split 为基准
- `package.json` — 调整 `pnpm i18n:full` 流程
- `messages/en.json`、`messages/zh.json` — 标记为生成物（或删除，改为 CI 检查 split）

## Steps

### Step 1: 确认 canonical 格式

与用户确认选择 split 作为 canonical（推荐，因为运行时已读 split）。

### Step 2: 修改 translation-sync.js

将读写源从 `messages/${locale}.json`（flat）改为 `messages/${locale}/{critical,deferred}.json`（split）。

### Step 3: 修改 shape-check

以 split 为基准而非"flat == split union"双向检查。

### Step 4: flat 文件处理

选择方案：
- A: 删除 flat 文件，不再维护（最简）
- B: flat 文件从 split 自动生成，仅用于兼容/测试

### Step 5: CI 检查

添加 CI 步骤：运行生成脚本后 `git diff --exit-code messages/`，确保无手动修改生成物。

## Verification Commands

```bash
pnpm i18n:full
pnpm type-check
pnpm build
```

## Success Criteria

- 翻译文件只需维护一处（split）
- 工具链以 split 为输入源
- CI 检查生成物一致性
- 构建成功
- nested-path traversal / set logic 不再在多个工具脚本中重复实现

## Commit

```
refactor(i18n): consolidate to split format as single source of truth
```

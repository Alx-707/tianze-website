# Task 019: 门禁治理

**depends-on:** —

## Description

修复三个门禁问题：`validate-i18n-content` 是假门禁（大量行被跳过）、`scripts/**` 不受 lint、`codeQuality` 不阻断。

## Execution Context

**Task Number**: 019 of 027
**Phase**: E（真相源收敛）
**Prerequisites**: 无（可与 017/018 并行）

## 审查证据

- `scripts/validate-i18n-content.ts:97`：大量跳过规则使门禁近乎无效
- `eslint.config.mjs:30`：`scripts/**` 在 ESLint ignores 中
- `scripts/quality-gate.js:225-232`：`codeQuality.blocking: false`
- `scripts/quality-gate.js:111`：自造 glob matcher 未受 lint 约束

## BDD Scenarios

### Scenario 1: validate-i18n-content 有效或下线
```gherkin
Scenario: i18n 内容校验门禁有效
  Given validate-i18n-content 作为 CI 门禁
  When 代码中存在硬编码用户面文本
  Then 门禁报告违规
  Or 如果无法有效检测，则从 CI gate 中移除，避免假安全感
```

### Scenario 2: scripts/ 受 lint 约束
```gherkin
Scenario: 门禁脚本受代码质量约束
  Given scripts/ 目录中的 JS/TS 文件
  When 运行 ESLint
  Then scripts/ 中的文件被 lint 覆盖（使用独立 overrides 配置控噪）
```

### Scenario 3: codeQuality blocking 策略明确
```gherkin
Scenario: 代码质量检查阻断策略清晰
  Given quality-gate.js 中的 codeQuality 配置
  When ESLint error 出现
  Then 构建失败（eslintErrors: 0 阻断）
  And eslintWarnings 阈值有明确上限
```

## Files to Modify

- `scripts/validate-i18n-content.ts` — 要么 AST 级重写，要么从 `package.json` 门禁中移除
- `eslint.config.mjs` — 移除 `scripts/**` 忽略或添加带 overrides 的 scripts lint 配置
- `scripts/quality-gate.js` — 将 `codeQuality.blocking` 改为 `true`（至少 eslintErrors 阻断）

## Steps

### Step 1: 处理 validate-i18n-content

**决策点**（需确认）：
- A: 下线（从 package.json 门禁移除，保留脚本但不再阻断）— 诚实承认当前无法有效检测
- B: AST 级重写（用 TypeScript compiler API 或 babel parser 提取 JSX 文本节点）— 成本高
- **推荐 A**：下线并在 CLAUDE.md 中记录"硬编码文本靠 code review 人工检查"

### Step 2: scripts/ 纳入 lint

在 `eslint.config.mjs` 中移除 `scripts/**` 忽略，并添加 overrides 放宽 scripts 的规则（如允许更高的 complexity、允许 console.log 等）。

### Step 3: 明确 codeQuality blocking

将 `codeQuality.blocking` 改为 `true`，确保 eslintErrors: 0 阻断。eslintWarnings 保持当前阈值（10）但设为可逐步收紧。

### Step 4: 清理自造 glob matcher

评估 `scripts/quality-gate.js:111` 的自造 glob matcher，看是否可替换为 `minimatch` 或 `picomatch`。

## Verification Commands

```bash
pnpm lint:check
pnpm quality:gate  # 或 scripts/quality-gate.js
pnpm type-check
```

## Success Criteria

- validate-i18n-content 已下线或有效重写
- scripts/ 被 lint 覆盖
- codeQuality.blocking = true（至少 eslintErrors 阻断）
- 当前代码在新配置下零 error

## Commit

```
chore(quality): fix gate governance — lint scripts, clarify blocking policy
```

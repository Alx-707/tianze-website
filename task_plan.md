# Task Plan: 代码质量审查（证据驱动）

## Goal
对当前项目进行多维度、全面且深入的代码质量审查，并在每个结论后给出可核查的证据（文件路径/行号/命令输出摘要）。

## Phases
- [x] Phase 1: 读取项目规则与审查计划落盘
- [x] Phase 2: 收集证据（代码结构、配置、关键模块、运行检查）
- [x] Phase 3: 综合分析与问题分级（P0-P3）+ 给出改进方向
- [x] Phase 4: 交付审查报告（可执行清单）并复核证据可追溯

## Key Questions
1. 项目是否遵守 `CLAUDE.md`/`.claude/rules/` 的关键约束（例如 next-intl 文案规范）？
2. 代码结构是否清晰，边界是否明确（app/router、components、lib、features）？
3. 类型系统是否被正确使用（避免 any、非必要断言、弱类型 API）？
4. 质量护栏是否到位（lint/typecheck/test/build）？
5. 性能/可访问性/安全方面是否存在明显风险点？

## Decisions Made
- 使用 3-file pattern：`task_plan.md`（计划）、`notes.md`（证据）、`code_quality_review.md`（交付）。
- 审查以“可复现证据”为准：引用具体文件与行号；对命令输出给出摘要并记录运行命令。

## Errors Encountered
- (none)

## Status
**Completed** - 已生成审查报告 `code_quality_review.md`，证据记录在 `notes.md`。

---

# Task Plan: 修复 P0/P1（next 生产依赖 + 安全信噪比 + 门禁对齐）

## Goal
把报告中最关键的 P0/P1 修到“可落地、可验证、可持续”的状态：生产依赖正确、Semgrep/ESLint 信号可用且门禁表达清晰。

## Phases
- [x] Phase 1: 现状核对与分支准备（读规则/确认 CI 行为/制定最小改动面）
- [x] Phase 2: 修复 P0（next 从 devDependencies 移到 dependencies + lockfile 同步）
- [x] Phase 3: 修复 P1（ESLint 安全规则降噪 + Semgrep 规则/脚本降噪 + quality gate 纳入 Semgrep(ERROR) 信号）
- [x] Phase 4: 验证与交付（pnpm install / lint / type-check / test / quality:gate / security）

## Key Questions
1. `pnpm audit --prod` 的“生产依赖审计”边界是否真实（next 是否计入）？
2. Semgrep 在本地/门禁中是否只对 `ERROR` 级规则阻断（与 CI 对齐），`WARNING/INFO` 是否只记录？
3. ESLint 的安全规则是否避免“为工具而写代码”，同时不放弃真正的高价值检查？

## Decisions Made
- `quality-gate.js` 的 Security gate 增加 Semgrep(ERROR) 结果（本地门禁可见、可阻断），CI 仍以 `.github/workflows/ci.yml` 的 security job 为权威执行路径。
- `eslint-plugin-security` 的 `security/detect-object-injection` 关闭（零容忍下无法通过 warn 降级，只能 off），改由 Semgrep 的 object-injection 规则承担“可调信噪比”的代码级扫描。
- Semgrep 的 spread-operator 规则降为 `INFO`，避免在默认 `WARNING` 扫描中刷屏。

## Errors Encountered
- `mcp__auggie-mcp__codebase-retrieval` 工具在当前会话不可用（tool not found），改用 `grep/sed` 做证据定位与修改点检索。
- Semgrep 自动安装：Homebrew Python 触发 PEP-668 `externally-managed-environment`，改为优先使用 python.org 版本的 `semgrep` 可执行文件路径（`/Library/Frameworks/Python.framework/.../bin/semgrep`）。

## Status
**Completed** - P0/P1 已落地并通过本地校验（lint/type-check/test/quality gate/security）。

---

# Task Plan: 收尾（Semgrep WARNING 清零 + 证据/文档对齐）

## Goal
把整改后的“安全信号”稳定下来：Semgrep WARNING 不刷屏、门禁输出可复核、规则文档与实现一致。

## Phases
- [x] Phase 1: 复核 Semgrep WARNING 来源与修复路径
- [x] Phase 2: 代码/规则收敛（去掉 computed-property 命中；mergeObjects 增加原型污染防护；Semgrep exclude 精准化）
- [x] Phase 3: 更新规则文档（security/quality-gates 对齐实际门禁逻辑）
- [x] Phase 4: 更新证据（notes.md）+ 回归验证（lint/type-check/test/security）

## Key Questions
1. Semgrep WARNING 是否能在不牺牲真实覆盖的前提下稳定在“接近 0”？
2. 文档是否准确描述 CI 与本地门禁的职责边界？

## Decisions Made
- `LEAD_HANDLER_CONFIG` 改为字面量 key（`contact/product/newsletter`）以避免 computed property 规则误报。
- `mergeObjects` 加入 `__proto__/constructor/prototype` 屏蔽，减少真实原型污染风险，并在 semgrep.yml 中对该文件做定向 exclude（避免工具噪音重复刷屏）。

## Errors Encountered
- (none)

## Status
**Completed** - Semgrep WARNING=0，规则文档与实现已对齐，已完成回归验证。

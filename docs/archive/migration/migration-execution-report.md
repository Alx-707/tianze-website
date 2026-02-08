# 迁移执行报告（进行中）

## 范围
- 源仓库：`tianze-website`
- 目标仓库：
  - `b2b-web-template`
  - `tucsenberg-web`

## 依据
- `docs/migration-checklist.md`

## 执行记录
> 迁移阶段将按“补丁切片/按文件应用”为主，避免直接 cherry-pick 混合业务变更的 commit（例如 `79887b2`）。

### b2b-web-template
- 基线分支：`main`（本地存在 `refactor/code-quality-fixes`，但本次不以其为起点）
- 新建分支：`codex/migrate-quality-gates`
- 已应用项：
  - `fix(ci): guard vercel deploy when secrets missing` (`fe71141a`)
  - `refactor(test): remove vitest net listen patch` (`cd23a564`)
  - `test: modularize vitest setup` (`e6f3e396`)
  - `chore(tools): align quality scripts and configs` (`a5f1f3a8`)
  - `fix(ui): clamp settimeout delay` (`9962689e`)
- 验证结果（本地）：
  - `pnpm type-check` ✅
  - `pnpm lint:check` ✅
  - `pnpm test` ✅
  - `pnpm build` ✅
  - `pnpm unused:check` ✅（仍有 dotenv 注入提示，但不阻断）
  - `pnpm unused:production` ✅（仍有 dotenv 注入提示，但不阻断）
  - `pnpm circular:check` ✅（2 warnings）
  - `pnpm security:check` ✅（audit=0, semgrep ERROR/WARNING=0）

### tucsenberg-web
- 基线分支：`main`
- 新建分支：待创建（建议 `codex/migrate-quality-gates`）
- 是否保留 `vercel-deploy.yml`：默认保留（未配置 secrets，需迁入 step-guard；如后续删除 workflow，则跳过此项）
- 已应用项：
- 验证结果：

## 待办
- [ ] 确认两个目标仓库的迁移基线分支与工作区策略
- [ ] 生成并应用 P0/P1 补丁切片
- [ ] 跑通本地验证清单（type-check/lint/test/build/unused/circular/security）

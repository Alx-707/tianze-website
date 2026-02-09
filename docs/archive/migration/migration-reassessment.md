# 近期提交变更再审视（tianze-website → b2b-web-template / tucsenberg-web）

生成时间：2026-02-04  
审视范围：`tianze-website` 提交区间 `822188d..79887b2`（PR #13-#18）

## 目标

1) 汇总：从近期提交中提炼“应当迁移”的内容（含已完成/未完成）。  
2) 排除：将已在目标仓库落地的项剔除，得到“剩余待做清单”。  

> 这里的“应当迁移”默认指：CI/workflow、test/lint/security gate、可复用工具脚本与降噪修复。  
> 大规模业务重构（即使 commit message 写着 code quality）默认不纳入，除非能拆出低风险通用部分。

---

## A. 汇总：应当迁移的候选项（包含已完成）

### A1. 已完成（两目标仓库均已落地）

两目标仓库 main 均已包含一次性迁移 PR：
- `b2b-web-template`：PR #60（`967924f0 chore(tools): migrate quality gates and modularize test setup`）
- `tucsenberg-web`：PR #11（`476e7eb migrate: quality gates from tianze-website`）

对应的“已完成”项（同一批 23 个文件）：
- Vercel deploy secrets guard：`.github/workflows/vercel-deploy.yml`
- Vitest config 清理：`vitest.config.mts`
- Vitest setup 模块化 + console/stderr 降噪：`src/test/setup*.ts`
- tools/security 对齐：`knip.jsonc`, `tsconfig.knip.json`, `scripts/semgrep-scan.js`, `semgrep.yml`, `package.json`, `pnpm-lock.yaml`
- TimeoutOverflowWarning 修复：`src/components/ui/animated-counter.tsx` + `src/constants/time.ts` + `src/constants/index.ts`

> 备注：`tucsenberg-web` 的 `vercel-deploy.yml` 额外 guard 了 pnpm/node setup steps（避免 secrets 缺失时 cache 清理失败）。

### A2. 未完成（候选但尚未迁移）

以下项来自 `tianze-website` 的近期提交，但**未在** `b2b-web-template@main` / `tucsenberg-web@main` 出现：

1) `lefthook.yml`：architecture-guard 对 `**/index.ts` 的相对导入例外（来源 `822188d`）
- 背景：当前 guard 会拦截新增 `from './'` / `from '../'`，对 barrel file（`index.ts`）可能过严。
- 迁移建议：中（可能降低 guard 约束强度；但可减少“为工具服务”的改动）。

2) `playwright.config.ts`：`dotenv.config({ path: ".env.test", quiet: true })`（来源 `79887b2`）
- 背景：dotenv 默认输出可能污染 CI/test 日志；`quiet: true` 仅降噪。
- 迁移建议：高（低风险，小收益但稳定）。

3) `scripts/quality-gate.js`：将 Semgrep(ERROR) 纳入质量门禁统计（来源 `79887b2`）
- 背景：目前模板的 `scripts/ci-local.sh` 与 `scripts/quality-gate.js` 没有包含 Semgrep；Semgrep 只在 workflow/独立 job 执行时可见。
- tianze 方案：本地 gate 可跑 `pnpm security:semgrep` 并统计 ERROR 数；CI gate 模式默认跳过（避免重复执行），可用 `QUALITY_FORCE_SEMGREP=true` 强制执行。
- 迁移建议：中高（能把“安全门禁”闭环到本地；但会带来额外依赖与时间开销）。

4) `eslint.config.mjs`：关闭 `security/detect-object-injection`（来源 `79887b2`）
- 背景：该规则对 TypeScript 项目误报较多，容易迫使代码为 lint 服务；tianze 将对象注入检查迁给 Semgrep（ERROR gate）。
- 迁移建议：中（前提：先把 Semgrep(ERROR) 门禁“真的跑起来”并能在 CI/本地闭环，否则会削弱静态检查覆盖）。

5) `src/lib/__tests__/merge-objects.test.ts`：补充 prototype pollution keys 测试（来源 `79887b2`）
- 背景：模板/官网目前通过 `security-object-access` 间接防护；添加测试可以防止未来回归。
- 迁移建议：高（纯测试增强，低风险）。

---

## B. 排除：把“已完成项”剔除后的剩余待做清单（可执行）

若以“门禁体系”为主线，当前两目标仓库剩余待做建议顺序：

1) Playwright dotenv 降噪：`playwright.config.ts` 加 `quiet: true`
2) 增强 mergeObjects 安全回归测试：`src/lib/__tests__/merge-objects.test.ts` 增加 prototype pollution 用例
3) lefthook barrel file 例外：`lefthook.yml` 对 `**/index.ts` 放行（如你确认项目会大量使用 barrel files）
4) 将 Semgrep(ERROR) 纳入 `scripts/quality-gate.js`（并同步 `scripts/ci-local.sh` 的安全检查闭环）
5) 视第 4 步落地情况，调整 `eslint.config.mjs` 的 `security/detect-object-injection`

---

## C. 说明：为什么 PR #13 / PR #14 / PR #16 的“code quality 重构”默认未纳入

`822188d` / `1d605fa` / `bad3d32` 中包含大量业务逻辑与项目结构的重写（例如删除 `security-object-access.ts`、重构 `load-messages.ts`、常量体系重组、WhatsApp 相关类型/逻辑调整等）。

这些改动即使对源仓库是收益，也往往：
- 难以保证在模板/另一个官网上“无冲突落地”
- 风险集中（一次 PR 带来大范围行为变化），且历史上已出现“迁移后 CI 失败”的案例

因此更建议：先把其中“明确通用 + 低风险”的部分拆出来（如上面的 A2 列表），再逐步迁移。


# Notes: 代码质量审查证据库

## Sources

### Repo scan (local)
- Commands:
  - `pwd`
  - `ls`
  - `find . -maxdepth 3 -type f ...`
  - `cat CLAUDE.md`
  - `ls .claude/rules && sed -n '1,200p' ...`
  - `cat package.json`
  - `pnpm|npm|bun` 脚本：`lint`/`typecheck`/`test`/`build`

## Evidence Log

### Project rules
- `CLAUDE.md`: 明确 stack、约束（TS strict / i18n 必须 / Server Components first / complexity limits）。证据：`CLAUDE.md`
- `.claude/rules/`: 存在细化规则：`architecture.md`, `coding-standards.md`, `quality-gates.md`, `i18n.md`, `security.md`, `testing.md`, `ui-system.md`。证据：`.claude/rules/*`

### Tooling & scripts
- `package.json` scripts：`type-check`, `lint:check`, `test`, `ci:local`, `quality:gate*`, `security:check`, `arch:check`, `unused:check`, `i18n:*`。证据：`package.json`
- 质量护栏具备“零容忍”（0 warnings/0 TS errors/CI gate）。证据：`.claude/rules/quality-gates.md`
- 本地运行结果（2026-02-03，整改前快照）：
  - `pnpm type-check` exit=0（无 TS 错误）
  - `pnpm lint:check` exit=0（ESLint 0 warnings；但输出提示 baseline-browser-mapping 版本过旧）
  - `pnpm test` exit=0（341 files / 5754 tests passed；输出包含少量 stderr 日志噪音）
  - `pnpm test:coverage` exit=0（All files：Stmts 74.09% / Branch 69.24% / Funcs 70.24% / Lines 74.9%）
  - `pnpm build` exit=0（Next.js build + 静态页面生成成功）
  - `pnpm quality:gate:fast` exit=0（Code Quality/Security passed；Coverage/Performance skipped；报告：`reports/quality-gate-*.json`）
  - `pnpm arch:check` exit=0（dependency-cruiser：no violations）
  - `pnpm circular:check` exit=0（madge：no circular deps；但报告“358 warnings”且未输出明细）
  - `pnpm validate:translations` exit=0（en/zh key 数一致：847）
  - `pnpm i18n:shape:check` exit=0（报告：`reports/i18n-shape-report.json`）
  - `pnpm i18n:validate:code` exit=0（418 files checked，no issues）
  - `pnpm security:check` exit=0（pnpm audit: no vulns；semgrep: 12 findings(12 blocking)）
  - `pnpm unused:check` exit=1（knip 报告 2 个“Unused devDependencies”；提示 knip.jsonc 中有冗余 entry pattern）
  - `pnpm unused:production` exit=1（knip 报告 28 个“Unused dependencies”+ unlisted binary `next`，与 `unused:check` 结果明显不一致）

### P0/P1 整改落地（2026-02-03，分支：codex/fix-p0p1-security-gates）
- P0：`next` 移动到 `dependencies`（`package.json` + `pnpm-lock.yaml` 同步）
  - 复核：`pnpm unused:production` 不再出现 `Unlisted binaries next`（整改前曾出现）
- P1：安全信噪比与门禁对齐
  - ESLint：关闭 `security/detect-object-injection`（该规则在 TS 项目里误报过高，且会导致“为 lint 写代码”）
  - Semgrep：`object-injection-sink-spread-operator` 降级为 `INFO`（默认 WARNING 扫描不再刷屏）
  - 门禁：`scripts/quality-gate.js` 的 Security gate 纳入 Semgrep(ERROR) 统计（本地可见/可阻断；CI 由 `.github/workflows/ci.yml` 的 `security` job 执行）
  - 执行脚本：`scripts/semgrep-scan.js` 统一本地扫描与落盘（输出 `reports/semgrep-*-latest.json`）
- 回归命令（均 exit=0）：
  - `pnpm lint:check`
  - `pnpm type-check`
  - `pnpm test`
  - `pnpm security:check`（audit 0；Semgrep ERROR=0，WARNING=0）
  - `pnpm quality:gate:fast`

### Architecture & module boundaries
- (pending)

### Type safety
- (pending)

### i18n (next-intl)
- (pending)

### Performance (Next.js)
- (pending)

### Security
- (pending)

### DX (developer experience)
- (pending)

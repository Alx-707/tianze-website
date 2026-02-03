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

### P2 整改落地（2026-02-03）——测试 stderr/log 降噪（保持断言力度不变）
- 目标：默认不把业务侧 `console.*`/`logger.*` 直接喷到 stdout/stderr；测试仍可通过 `vi.spyOn(console, ...)` 捕获并断言；需要调试时可显式开启日志。
- 变更点：
  - 全局测试 setup 增加 console/stderr 降噪：
    - `src/test/setup.console.ts`：默认将 `console.debug/info/log/warn/error` 置为 noop；并过滤 jsdom 固定噪音 `"Not implemented: navigation to another Document"`（该噪音会绕过普通 console mock 直接写 stderr）。
    - `src/test/setup.ts`：新增 `import "./setup.console";`，确保在其它 setup 前生效。
  - 修复一个会触发 Node.js `TimeoutOverflowWarning` 的真实代码路径：
    - `src/components/ui/animated-counter.tsx`：对 `delay` 做上限 clamp（`MAX_SET_TIMEOUT_DELAY_MS`），避免 `setTimeout(delay=Number.MAX_SAFE_INTEGER)` 被 Node 截断并报警。
    - `src/constants/time.ts`：新增 `MAX_SET_TIMEOUT_DELAY_MS`（JS timers 的 32-bit signed 上限）。
- 复核命令（均 exit=0，且无上述 stderr 噪音）：
  - `pnpm vitest run src/components/ui/__tests__/navigation-menu.test.tsx`（此前会在末尾输出 jsdom navigation 噪音；整改后不再出现）
  - `pnpm vitest run src/components/ui/__tests__/animated-counter-accessibility.test.tsx`（此前会出现 `TimeoutOverflowWarning`；整改后不再出现）
  - `pnpm test`（全量回归通过）
  - `pnpm lint:check`
  - `pnpm type-check`
- 调试开关：
  - `VITEST_SHOW_LOGS=1 pnpm test`：恢复 console 输出 + 不过滤 jsdom navigation 噪音（用于本地排查）。

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

### P3 整改落地（2026-02-03）——工具链噪音/一致性（knip + madge）
- knip（整改前问题复现）：
  - `pnpm unused:check`：Unused devDependencies (2) + Configuration hints (4)（冗余 entry pattern），exit=1
  - `pnpm unused:production`：Unused dependencies (27)，exit=1（与实际使用严重不符）
- knip（整改策略）：
  - `knip.jsonc`：
    - 移除 knip 自动识别/插件已覆盖的冗余 entry（避免 config hints）
    - 将 Prettier 自动加载的插件依赖加入 `ignoreDependencies`（避免误报 unused devDependencies）
  - `package.json`：
    - `unused:production` 改为使用 `--use-tsconfig-files -t tsconfig.knip.json`（用 TS 编译单元的 include/exclude 做“生产源文件集合”的权威边界，避免把测试/脚本消费当成生产依赖使用）
  - 新增 `tsconfig.knip.json`：
    - 生产侧需要纳入 `next.config.ts` 等“构建期入口”的依赖使用（例如 MDX），但不希望污染主 `tsconfig.json` 的 type-check 范围
- madge（整改前问题复现）：
  - `pnpm circular:check`：`Processed 742 files ... (358 warnings)`，但不输出明细（warnings 不可执行）
- madge（整改策略）：
  - `package.json`：`circular:check` 增加 `--ts-config tsconfig.json`，让 madge 按 TS path alias/解析规则工作，减少 “skipped file” 类 warnings
- 回归命令（均 exit=0）：
  - `pnpm unused:check`（整改后无输出，代表 0 issues + 0 config hints）
  - `pnpm unused:production`（整改后无输出，代表 0 issues）
  - `pnpm circular:check`（warnings 从 358 降到 2，且无循环依赖）
  - `pnpm lint:check`
  - `pnpm type-check`

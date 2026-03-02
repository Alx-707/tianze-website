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

## Cloudflare Workers Bundle 基线（2026-02-14）

### Build 输出基线
- 执行命令：`pnpm build:cf`
- 结果：构建成功，`opennextjs-cloudflare build` 阶段完成，`OpenNext build complete.`
- 关键现象：
  - `handler.mjs` 作为 Cloudflare 单 Worker 入口之一；
  - `.open-next/server-functions` 下存在唯一 `default` 服务入口，未出现多入口并行拆分。

### 体积快照
- 根目录总量：
  - `.open-next`: `56M`
  - `.open-next/worker.js`: `4.0K`（入口壳，仅 4 KiB）
  - `.open-next/assets`: `8.1M`
  - `.open-next/server-functions`: `46M`
  - `.open-next/server-functions/default`: `46M`
- 关键大文件：
  - `.open-next/server-functions/default/handler.mjs`: `9.1M`
  - `.open-next/server-functions/default/node_modules`: `19M`
  - `.open-next/server-functions/default/.next`: `6.9M`
  - `.open-next/server-functions/default/reports`: `9.4M`
  - `.open-next/middleware/handler.mjs`: `400K`

### 与目标相关的观察
- 当前基线里 `reports` 目录占用了约 `9.4M`，且包含历史 `coverage`/`semgrep`/`quality-gate` 等产物；在 `build:cf` 复用时更像“非运行时依赖污染”而非应用功能资产。
- 最大 5 项候选文件中，`next` 相关的运行时 chunk 与 map 文件仍占主导，但 `reports` 的高占比说明本地历史产物与构建污染值得纳入优化优先级。

### 附录：Top 大文件（`find -size +200k`）
- `.open-next/server-functions/default/handler.mjs`: `9,528,890` B
- `.open-next/server-functions/default/node_modules/.pnpm/next@16.1.5_@babel+core@7.28.5_@opentelemetry+api@1.9.0_@playwright+test@1.57.0_react-d_a53f2870d0aa003340665cf8f6ee65d0/node_modules/next/dist/server/capsize-font-metrics.json`: `4,301,622` B
- `.open-next/server-functions/default/reports/coverage/coverage-final.json`: `1,978,820` B
- `.open-next/server-functions/default/reports/ci-artifacts/coverage-report-run21630516904/coverage-final.json`: `1,969,328` B
- `.open-next/server-functions/default/reports/test-results.json`: `1,705,936` B
- `.open-next/assets/_next/static/chunks/f0d3f9e60c9ec637.js.map`: `1,037,219` B
- `.open-next/server-functions/default/node_modules/.pnpm/next@16.1.5_@babel+core@7.28.5_@opentelemetry+api@1.9.0_@playwright+test@1.57.0_react-d_a53f2870d0aa003340665cf8f6ee65d0/node_modules/next/dist/compiled/@edge-runtime/primitives/load.js`: `800,754` B
- `.open-next/server-functions/default/handler.mjs.meta.json`: `751,322` B
- `.open-next/assets/_next/static/chunks/680883925547a38b.js.map`: `692,317` B

### 后续 Phase 2 入口
- 已确认 `phase1` 的基线输入：将围绕 `handler.mjs` / `node_modules` / `reports` / `.next` 的可剥离性，继续做“可无损瘦身”设计。  

## Cloudflare Workers Bundle 体积剖析（Phase 2）

### 实验：排除构建污染文件

- 修改文件：`next.config.ts`
- 变更：新增 `outputFileTracingExcludes`（route `/*`）
  - `./reports/**`
  - `./coverage/**`
  - `./test-results/**`
  - `./.lighthouseci/**`
  - `./.next-docs/**`
  - `./tests/e2e/.playwright/**`
  - `./playwright-report/**`
  - `./.playwright/**`

### 复现与验证命令

- `pnpm build:cf`
- `du -sh .open-next`
- `du -sh .open-next/server-functions/default`
- `ls .open-next/server-functions/default | sed -n '1,120p'`
- `find .open-next/server-functions/default -maxdepth 1 -type f -exec stat -f '%z %N' {} \; | sort -nr | head -n 20`

### 改造后（2026-02-15）体积归因结果
- `.open-next`: `46M`（从 `56M` 下降）
- `.open-next/server-functions`: `36M`（从 `46M` 下降）
- `.open-next/server-functions/default`: `36M`（从 `46M` 下降）
- `handler.mjs`: `~9305.6KB`（变化很小，基本保持）
- `node_modules`: `19M`（稳定）
- `reports`: 已完全不在 `.open-next/server-functions/default` 中出现（高优先级污染项移除）
- `middleware/handler.mjs`: `~400K`（无明显变化）

### 关键归因
- 最大可控收益点来自 `reports` 污染清单；其 9.4M 几乎全部是历史构建/质量产物，属于“构建污染”非运行时业务资产。
- `next/dist/server/capsize-font-metrics.json` 与 Next 内部 OG 相关产物仍在 `next` 运行时代码集中，属于依赖层面的体积，不会因 `reports` 排除而消失。
- 接下来 `Phase 3` 重点应转向：
  - `next` 运行时高体积文件的不可移除项清单（如 `capsize-font-metrics.json` 与 OG/compiled 大文件）；
  - 评估是否能通过运行时策略（`optimizePackageImports` 已启用）或路由裁剪继续压实，而不是硬切割。

## Cloudflare Workers Bundle 优化方案（Phase 3）与验证（Phase 4）

### Phase 3 方案分层

- 低风险（MVP，直接落地）
  - `open-next.config.ts`：开启 `default.minify = true`
  - `next.config.ts`：Cloudflare 构建关闭 `productionBrowserSourceMaps`
- 中风险（本轮未启用）
  - Cloudflare 条件下关闭 `cacheComponents`
  - 按路由裁剪 `outputFileTracingExcludes` 到更激进范围
- 高风险（架构级）
  - 基于 OpenNext `functions` 做拆分函数部署，并配合 origin/service routing
  - 业务路由拆分为多 Worker（而非单 `default` server function）

### 本轮执行改动（MVP）

- `open-next.config.ts`
  - 从直接导出改为变量配置，设置 `cloudflareConfig.default.minify = true`
- `next.config.ts`
  - `productionBrowserSourceMaps` 改为 `!isCloudflare`
  - 目的：Cloudflare 目标下优先减小部署工件

### 验证命令

- `pnpm build:cf`
- `du -sh .open-next .open-next/server-functions/default .open-next/server-functions/default/node_modules .open-next/server-functions/default/.next .open-next/assets`
- `stat -f '%z %N' .open-next/server-functions/default/handler.mjs .open-next/server-functions/default/handler.mjs.meta.json`
- `find .open-next/assets -type f -name '*.map' | wc -l`

### Phase 4 验证结果（2026-02-15）

- 总量对比（相对 Phase 2 后基线）
  - `.open-next`: `46M -> 34M`（再降 `12M`）
  - `.open-next/server-functions/default`: `36M -> 30M`
  - `.open-next/server-functions/default/node_modules`: `19M -> 13M`
  - `.open-next/assets`: `8.1M -> 2.1M`
- 关键文件
  - `handler.mjs`: `~9305.6KB -> ~9053.6KB`（小幅下降）
  - `handler.mjs.meta.json`: 约 `733.6KB`（基本持平）
  - `next/dist/server/capsize-font-metrics.json`: `~4200.8KB -> ~2520.9KB`
- sourcemap 观测
  - `.open-next/assets` 中 `.map` 文件数量降到 `1`（此前为多份）
- 污染目录
  - `reports` 仍保持剔除状态（不存在于 `.open-next/server-functions/default`）

### 当前结论

- MVP 低风险方案已验证有效，且收益显著（从原始 56M 已累计降到 34M）。
- 但若目标是 Free Plan `3 MiB` 级别，当前仍有数量级差距，瓶颈已转为 Next 运行时与 server function 结构本身，而非构建污染。

## Cloudflare Workers 架构级 Phase 5 原型（函数拆分 + 网关分发）

### 目标

- 验证 OpenNext `functions` 在当前 Cloudflare 适配链路的可用性。
- 在不改第三方包源码的前提下，实现“按路径分流到拆分函数”的可运行原型。

### 代码改动

- `open-next.config.ts`
  - 新增 `cloudflareConfig.functions`：
    - `apiLead`: `contact/inquiry/subscribe/verify-turnstile/health`
    - `apiOps`: `cache/invalidate` + `csp-report`
    - `apiWhatsapp`: `whatsapp/send` + `whatsapp/webhook`
  - 保持 `cloudflareConfig.default.minify = true`。
- `scripts/cloudflare/build-phase5-worker.mjs`
  - 新增“构建后生成器”，产出 `.open-next/worker.phase5.mjs`。
  - 网关规则：`/api/whatsapp/* -> apiWhatsapp`，`/api/cache/invalidate|/api/csp-report -> apiOps`，其余已列 API -> `apiLead`，其他路径 -> `default`。
  - 分发前仍保留 middleware/image/skew-protection 处理链。
- `package.json`
  - 新增 `build:cf:phase5 = pnpm build:cf && node scripts/cloudflare/build-phase5-worker.mjs`。

### 验证命令

- `pnpm build:cf:phase5`
- `du -sh .open-next .open-next/server-functions .open-next/server-functions/* .open-next/assets`
- `find .open-next/server-functions -maxdepth 2 -type f \\( -name 'handler.mjs' -o -name 'index.mjs' -o -name 'handler.mjs.meta.json' \\) -exec stat -f '%z %N' {} \\; | sort -nr`
- `node --check .open-next/worker.phase5.mjs`
- `pnpm type-check`

### 关键结果（2026-02-15）

- 构建阶段明确出现：
  - `Building server function: apiLead...`
  - `Building server function: apiOps...`
  - `Building server function: apiWhatsapp...`
  - `Building server function: default...`
- 体积快照：
  - `.open-next`: `82M`
  - `.open-next/server-functions`: `78M`
  - `.open-next/server-functions/default`: `27M`
  - `.open-next/server-functions/apiLead`: `18M`
  - `.open-next/server-functions/apiOps`: `17M`
  - `.open-next/server-functions/apiWhatsapp`: `17M`
  - `.open-next/assets`: `2.1M`
- 关键文件：
  - `default/handler.mjs`: `7,706,719` B
  - `apiLead/index.mjs`: `1,825,564` B
  - `apiOps/index.mjs`: `1,825,563` B
  - `apiWhatsapp/index.mjs`: `1,825,568` B
- 语法/类型：
  - `.open-next/worker.phase5.mjs` `node --check` 通过
  - `pnpm type-check` 通过

### 结论

- Phase 5 原型达成：函数拆分 + 分发层已跑通，证明当前项目可沿“路由分治”继续演进。
- 但该原型仍是“单 worker 内部分流”，部署体积不会天然满足 Free Plan；下一步要进入“多 worker + service binding/origin routing”实装，才会形成真实体积隔离。

### 异常记录

- `pnpm lint:check` 在扫描 `.open-next` 生成文件时触发 `eslint-plugin-security-node` 崩溃（`detect-unhandled-event-errors` 读取 `loc` 报错）。
- 处置：本轮改为定向校验改动源文件（`open-next.config.ts`）和新脚本语法检查，避免把生成产物纳入 lint 流程。

## Cloudflare Workers 架构级 Phase 6（多 Worker + bindings/origin routing）

### 目标

- 将 Phase 5 的单 Worker 网关分流升级为“多 Worker 可部署架构骨架”。
- 生成可直接用于 wrangler 的 phase6 配置，并提供部署顺序脚本（含 dry-run）。

### 代码改动

- 新增 `scripts/cloudflare/build-phase6-workers.mjs`
  - 读取 `wrangler.jsonc`（使用 TypeScript JSONC 解析）；
  - 生成 `.open-next/workers/`：
    - `gateway.mjs`
    - `web.mjs`
    - `apiLead.mjs`
    - `apiOps.mjs`
    - `apiWhatsapp.mjs`
  - 生成 `.open-next/wrangler/phase6/`：
    - `gateway.jsonc`
    - `web.jsonc`
    - `api-lead.jsonc`
    - `api-ops.jsonc`
    - `api-whatsapp.jsonc`
- 新增 `scripts/cloudflare/deploy-phase6.mjs`
  - 部署顺序：`web -> api-lead -> api-ops -> api-whatsapp -> gateway`
  - 支持环境：`preview|production`
  - 支持 `--dry-run`
- 更新 `package.json`
  - `build:cf:phase6`
  - `deploy:cf:phase6:preview`
  - `deploy:cf:phase6:production`
  - `deploy:cf:phase6:dry-run`

### 路由与绑定设计

- Gateway Worker（`gateway.mjs`）：
  - 先执行 `middlewareHandler`；
  - 按重写后的 pathname 做 origin routing：
    - `/api/whatsapp/* -> WORKER_API_WHATSAPP`
    - `/api/cache/invalidate|/api/csp-report -> WORKER_API_OPS`
    - `/api/contact|inquiry|subscribe|verify-turnstile|health -> WORKER_API_LEAD`
    - 其他 -> `WORKER_WEB`
  - 通过 service bindings 转发请求，并打 `x-phase6-origin-target` 观测头。
- 服务 Worker（`web/api*`）：
  - 直接加载对应 OpenNext handler；
  - 执行 handler 后打 `x-phase6-worker` 观测头；
  - 继承缓存相关绑定（R2/D1/DO/self-reference）。

### 验证命令

- `node --check scripts/cloudflare/build-phase6-workers.mjs`
- `node --check scripts/cloudflare/deploy-phase6.mjs`
- `pnpm build:cf:phase6`
- `for f in .open-next/workers/*.mjs; do node --check "$f"; done`
- `node -e "JSON.parse(...)"`（校验 `.open-next/wrangler/phase6/*.jsonc`）
- `pnpm run deploy:cf:phase6:dry-run`

### 关键结果（2026-02-15）

- `build:cf:phase6` 成功并输出：
  - `[phase6] generated workers and wrangler configs`
- 生成产物：
  - `.open-next/workers`（5 个入口）
  - `.open-next/wrangler/phase6`（5 个配置）
- `deploy:cf:phase6:dry-run` 输出了完整顺序部署命令（preview 环境），未执行真实部署。

### 当前结论

- Phase 6 原型已从“逻辑分流”升级为“可部署拓扑骨架”，实现了多 Worker、service bindings 与 origin routing 的端到端链路。
- 下一步重点应是：真实环境分阶段发布（preview -> production）与按 Worker 维度体积门禁。

## Cloudflare Phase 6 实网验证收口（2026-02-17）

### 执行命令

- `pnpm build:cf:phase6`
- `pnpm run deploy:cf:phase6:preview`
- `curl -sS -o /tmp/resp_body -D /tmp/resp_headers https://preview.tianze-pipe.com/api/health`
- `dig +short preview.tianze-pipe.com A`
- `openssl s_client -connect preview.tianze-pipe.com:443 -servername preview.tianze-pipe.com -brief < /dev/null`
- `dig +short tianze-pipe.com A`
- `dig +short workers.dev A`

### 结果摘要

- 构建阶段成功：
  - `build:cf:phase6` 完成，并输出 `[phase6] generated workers and wrangler configs`。
- 真实部署失败（阻塞 1：凭据）：
  - 在 `deploy:cf:phase6:preview` 的首个目标 `web.jsonc` 失败；
  - wrangler 明确报错：非交互环境必须设置 `CLOUDFLARE_API_TOKEN`。
- 在线探活失败（阻塞 2：域名链路）：
  - `preview.tianze-pipe.com`、`tianze-pipe.com` 与尝试的 `*.workers.dev` 在本机均解析到 `198.18.45.x`；
  - `curl` 报错：`LibreSSL SSL_connect: SSL_ERROR_SYSCALL`；
  - `openssl s_client` 报错：`unexpected eof while reading`。

### 诊断结论

- 当前环境不满足“实网验证收口”的前提条件：
  - 缺少可用于 wrangler 发布的 Cloudflare API token；
  - 域名访问链路在 TLS 握手前已失败，无法验证 `x-phase6-origin-target` / `x-phase6-worker` 头。
- 因此本轮只能确认“构建与部署脚本可执行”，不能确认“公网请求路径已闭环”。

## 2026-02-26 vinext 迁移阶段一审计笔记

### 输入约束与上下文
- 目标：对当前 Next.js 项目做 vinext 迁移可行性审计（阶段一），先报告后暂停。
- 现状：仓库已有未提交改动（非本次任务产生），本次仅新增审计文件。
- 用户给定的两个文档路径不存在：
  - `docs/migration/vendor-lock-in-audit.md`
  - `docs/known-issue/phase6-api-worker-bundle-failure.md`
- 替代参考：
  - `docs/migration/cloudflare-workers-migration-report.md`
  - `cloudflare_bundle_phase6.md`

### 项目结构与框架快照
- Next.js 版本：`16.1.6`
- 路由模式：仅 `App Router`（`src/app` 存在，`src/pages` 不存在）
- 页面文件（`page.tsx`）数量：11
- API Route Handlers（`app/api/**/route.ts`）数量：9
- Middleware：`middleware.ts` 存在

### 关键特性扫描结果（摘要）
- `use client`：82 个文件
- `use server`：2 个文件（含 `src/app/actions.ts`）
- `generateStaticParams`：10 个页面文件使用
- `generateMetadata`：10 个页面文件使用
- `next/cache`：使用 `unstable_cache`、`cacheLife`、`cacheTag`、`revalidateTag`、`revalidatePath`
- `next/headers`：`headers()` 在 `src/app/actions.ts` 中使用

### UI 组件能力使用
- `next/image`：10 处导入
- `next/link`：5 处导入
- `next/font/google`：1 处导入
- `next/script`：1 处导入
- `next/head`：0 处导入（业务代码）

### Next 配置扫描
- 配置文件：`next.config.ts`
- 主要配置键：
  - `outputFileTracingExcludes`
  - `cacheComponents`
  - `turbopack`
  - `pageExtensions`
  - `productionBrowserSourceMaps`
  - `images`
  - `compiler`
  - `experimental`
  - `webpack`
  - `headers`
- 注意：存在 `webpack` 与 `turbopack` 定制（vinext 官方标注不支持该类配置）

### Node.js API 使用（server-side 重点）
- `fs/path`：内容读取与路径处理（`src/lib/content-*`, `src/lib/load-messages.ts`, `src/app/[locale]/head.tsx`）
- `crypto`：Webhook 签名、限流 key 计算（`src/lib/whatsapp-service.ts`, `src/lib/security/rate-limit-key-strategies.ts`）
- `net`：IP 校验（`src/lib/security/client-ip.ts`）
- `Buffer`：WhatsApp 与图片占位符数据 URL 处理
- `node:` 前缀：`src/app/[locale]/head.tsx` (`node:fs`, `node:path`)

### 外部资料核验（2026-02-26）
- vinext README（`cloudflare/vinext`）：
  - 声称 Next.js 16 API 覆盖约 94%
  - `next/image`、`next/font` 为部分支持
  - `webpack`/`turbopack` 配置不支持（Vite 路线）
  - `generateStaticParams`、`generateMetadata`、`next/cache`、Middleware、Route Handlers 标注支持
- Cloudflare Workers Node.js compatibility 文档（2026-02-02 更新）：
  - `fs`、`path`、`crypto`、`net`、`process`、`Buffer` 标注为支持（在 `nodejs_compat` 下）

### 初步风险判断
- 高风险：`next.config.ts` 中 `webpack` / `turbopack` 自定义在 vinext 下需要重构到 `vite.config.ts` 或替代实现。
- 中风险：`next/font` 与 `next/image` 行为差异（运行时注入/无构建期优化）。
- 中风险：存在 `generateStaticParams` 使用，若采用 vinext 的默认 SSR 路径，需确认是否继续静态导出策略。
- 低~中风险：server-side Node API 使用较多，但 Workers 文档显示相关 API 已支持（需以 `vinext dev/build` 实测收口）。

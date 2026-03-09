# Task Plan: 全面代码审查问题清单（tianze-website）

## Goal
产出一份按「稳定性 > 性能 > 可维护性 > 安全」排序的“问题清单”，每条包含证据、影响、建议修复与验证方式，便于后续逐条跟踪与落地。

## Rounds（轮次定义）
- Round 1（已完成，2026-03-05）：建立基线 + 自动化扫描 + 分层深审（Stability→Performance→Maintainability→Security）+ 汇总成可执行问题清单与证据。
- Round 2（已完成，2026-03-05 ~ 2026-03-06）：按优先级逐条落地修复/优化，并完成“回归验证 + 门禁复测 + 复审”，问题清单已基本关闭，仅保留独立技术债跟进项。
- Round 3（进行中，2026-03-06）：按既定 Linus 口径对当前工作树做复审，重点检查“测试补丁残留 / API 错误协议分裂 / 假异步与接口撒谎 / 噪音与边界分叉”是否仍存在，并将本轮发现同步到 Round 3 文档与证据笔记。
- Round 4（计划中，2026-03-06）：不受第三轮口径限制，重新做一遍全仓库扫荡式审查，覆盖代码、测试、构建、配置、架构、性能与安全，最终将“当前仍成立的问题”重新收敛为新的权威问题清单。

> Round 2 的详细执行规划见：`docs/code-review/round2-plan.md`。

## Phases
- [x] Phase 1: 现状摸底与基线建立
- [x] Phase 2: 全量自动化扫描与报告收集（补齐 E2E/Lighthouse 等）
- [x] Phase 3: 分层深审（Stability→Performance→Maintainability→Security）
- [x] Phase 4: 汇总成最终问题清单并校对

## Round 3 Phases
- [x] Phase R3.1: 读取既有审查文档并确认第三轮口径
- [x] Phase R3.2: 复核当前工作树在 Round 3 四大主题上的实际状态
- [x] Phase R3.3: 形成本轮 findings（按严重度排序，含证据）
- [x] Phase R3.4: 将复审结论同步回 `linus_review_round3.md` / `notes.md`

## Round 3 Scope
- 测试基础设施：`vitest.config.mts`、`src/test/**`、典型测试 mock
- API 错误协议：`src/lib/api/**`、`src/app/api/**`
- 假异步与接口一致性：`src/lib/idempotency.ts`、`src/lib/security/**`
- 噪音与边界分叉：构建/测试日志噪音、i18n 漏洞、表驱动/分支收敛情况

## Round 4 Phases
- [x] Phase R4.1: 建立审查基线（工作树状态、现有审查文档、门禁脚本、关键目录）
- [x] Phase R4.2: 全量自动化扫描（type/lint/test/build/security/architecture/unused/perf 可用项）
- [x] Phase R4.3: 代码分层深审（`src/app/**`、`src/components/**`、`src/lib/**`、`tests/**`、配置脚本）
- [x] Phase R4.4: 交叉复核“测试是否掩盖设计失败”与“文档/门禁是否与现实脱节”
- [x] Phase R4.5: 将仍成立的问题重写进 `docs/code-review/issues.md`，同步证据到 `docs/code-review/notes.md`
- [x] Phase R4.6: 将开放问题重组为“问题分类处理方案”，形成执行波次

## Round 4 Execution Phases
- [x] Phase R4E.1: Wave A 协议统一与错误消费闭环
- [x] Phase R4E.2: Wave B 测试与门禁信号修复
- [x] Phase R4E.3: Wave C 遗留假真相源清理
- [x] Phase R4E.4: Wave D Next.js 框架边界收口

## Round 4 Scope
- 代码层：`src/app/**`、`src/components/**`、`src/lib/**`、`src/config/**`
- 测试层：`src/**/__tests__/**`、`tests/**`、`vitest.config.mts`、`playwright` 相关配置
- 工程层：`package.json`、`scripts/**`、ESLint/TS/Next/Vitest/depcruise/knip 配置
- 风险层：稳定性、性能、可维护性、安全、可观测性、一致性

## Round 4 Skills
- `planning-with-files`：总计划、证据、问题清单持续落盘
- `Linus`：优先识别补丁驱动复杂度、边界分叉、共享 helper 污染
- `testing-qa`：把测试本身当审查对象，核对门禁是否可信
- `debugging-strategies`：针对失败门禁做最小复现与根因隔离
- `performance-optimization`：性能问题按测量→归因→修复路径审查
- `next-best-practices`：Next.js 16 / App Router / proxy / cache / route handler 边界复核

## Phase 3 Breakdown
- [x] Phase 3.1: `src/app/api/**` 写接口深审（抗滥用/校验/错误链路）
- [x] Phase 3.2: 性能深审（Lighthouse `total-byte-weight` 与 bundle/资源定位）
- [x] Phase 3.3: 可维护性深审（orphan/barrel/knip 治理落地方案）
- [x] Phase 3.4: 安全深审（CSP/nonce、Cache Components 隔离、XSS/注入面）

## Phase 3.3 Checklist（当前回合：只落地“可执行改动方案”，不修改代码）
- [x] 将 `no-orphans`（CR-001）拆成“可直接开 PR 的步骤 + 验收口径”
- [x] 将 `no-barrel-export-dependencies`（CR-002）补齐“替换 import 清单 + 验收口径”
- [x] 将 knip unlisted（CR-003）补齐“推荐治理路径（移出 next.config 副作用）+ 备选方案”

## Phase 3.4 Checklist（安全深审）
- [x] 复核 middleware → CSP/nonce 的端到端链路（含 `curl` 实测）
- [x] 盘点“无 nonce 的 inline script”与潜在阻断点（Next/next-themes/JSON-LD）
- [x] 复核 `Cache Components`（`use cache`/`unstable_cache`）是否有 request-scoped API 混入风险点
- [x] 盘点 XSS/注入面（`dangerouslySetInnerHTML`/内容渲染）并定级
- [x] 将安全发现固化为可执行条目（`docs/code-review/issues.md`）并补验收口径

## Key Questions
1. 对外暴露的写接口（`src/app/api/**`）是否做到：输入校验、抗滥用（Rate Limit/Turnstile/Auth）、错误处理与可观测？
2. Cache Components + `use cache` 的数据路径是否存在跨用户数据泄漏风险（`headers()/cookies()` 参与的路径）？
3. 性能门禁（Lighthouse）最可能被哪些代码路径/资源拖累（字体、图片、Client Components、bundle 体积）？
4. 依赖与架构告警（orphan、barrel deps）哪些是“真实死代码/隐式耦合”，哪些是误报？

## Decisions Made
- 审查产物不创建 GitHub Issue；改为在仓库内维护问题清单文件：`docs/code-review/issues.md`。
- 研究/证据与中间发现写入：`docs/code-review/notes.md`，避免在对话里堆上下文。
- 代码审查产物以仓库内文件为准（`docs/code-review/*` 与 `task_plan.md`）；是否加入 git 跟踪待确认（当前仍未跟踪）。
- Round 2 规划已按复审反馈调整（2026-03-05）：CR-009 升为 P1；PR 顺序改为“先 API P1/门禁 → 再架构减噪 → 再性能 → 再 CSP”；补充 CR-017 的 hash 保鲜 CI 检查与 CR-011 幂等的前后端联动提示。
- Round 3（2026-03-06）正式交付文档固定为：`docs/code-review/round3-review.md`；新增问题继续写入 `docs/code-review/issues.md`，原根目录 `linus_review_round3.md` 视为历史口径参考。
- Round 4（2026-03-06）继续沿用 `docs/code-review/issues.md` 作为最终权威问题清单；`docs/code-review/notes.md` 记录证据，避免再新增平行清单文件造成分叉。
- Round 4（2026-03-06）正式采用的 skill 组合固定为：`planning-with-files` → `Linus` → `testing-qa` / `debugging-strategies` → `performance-optimization` / `next-best-practices`；`playwright` 与 `audit-website` 仅在静态/单测证据不足时补用。
- Round 4 收尾交付文档固定为：`docs/code-review/round4-remediation-plan.md`，用于承接执行阶段的分波次处理。
- Round 4（2026-03-09）：面对 `src/proxy.ts` 与当前 Cloudflare/OpenNext 链路冲突时，优先保障双平台部署支持；执行最小回退，仅把运行时入口恢复为 `src/middleware.ts`，保留 root layout / locale context 等 Wave D 收益。
- Round 4（2026-03-09）：PR 拆分执行方案固定记录在 `docs/code-review/round4-pr-split-plan.md`，后续提交按该文档的 stacked PR 顺序推进。

## Findings (Phase 1 Snapshot)
- ✅ `pnpm ci:local:quick` 全绿（type-check、lint、format、build、单测覆盖率、quality gate fast、安全审计、PII、i18n、架构检查）。
- 📈 覆盖率基线：lines 79.42% / statements 78.61% / functions 74.89% / branches 71.9%（详见 `reports/coverage/coverage-summary.json`）。
- ⚠️ 架构告警（warnings）：`no-orphans`、`no-barrel-export-dependencies`（详见 `docs/code-review/notes.md`）。
- ⚠️ 本机 Node 为 v22（CI 固定 Node 20）：存在“本地绿但 CI 红”的潜在漂移风险。

## Findings (Phase 2 Snapshot)
- ✅ `pnpm ci:local` 全绿（含 Playwright E2E + Lighthouse CI），耗时约 392s。
- ⚠️ Lighthouse CI：`total-byte-weight` 在 `/en`、`/zh` 超过 490KB 预算（warning，不阻断）。
- ⚠️ `pnpm unused:production`（knip）失败：检测到未声明依赖 `@react-grab/claude-code/server`（位于 `next.config.ts` 的 dev-only 动态 import）。

## Errors Encountered
- `ls -啦` 在当前环境下触发 `ls: invalid option`（编码问题）；改用 `ls -la` 解决。
- 初次执行 `pnpm ci:local` 时 Playwright 浏览器未安装导致 E2E 失败；运行 `pnpm exec playwright install` 后恢复正常。
- `pnpm unused:production` 因 `@react-grab/claude-code/server` 未列入依赖而失败（需在 Phase 3 转为问题条目处理）。
- Round 2 / PR-01：新增 `.devtools/react-grab-dev.mjs` 初版包含 TypeScript 断言语法导致 `pnpm format:check` 失败；改为纯 JS（`"code" in err`）并对 `src/app/api/csp-report/route.ts` 运行 `pnpm exec prettier --write` 修复格式后通过。
- Round 2 / PR-05：Next.js 16 构建时提示 `middleware` 约定将被废弃，建议后续迁移到 `proxy`（不影响当前构建通过，但需要跟进以免未来升级踩坑）。
- Round 2 / PR-05：将 `middleware.ts` 移至 `src/middleware.ts` 后，测试仍从 `../../middleware` 导入导致 `pnpm type-check:tests` 失败；已改为从 `@/middleware` 或 `src/middleware.ts` 相对路径导入。
- Round 2 / PR-05：`src/lib/structured-data-generators.ts` 的 `generateArticleData()` publisher logo 使用了 `DEFAULT_BASE_URL`（在非 production 为 `undefined`）导致单测期望的 logo URL 变为 `undefined/next.svg`；已改用 `FALLBACK_BASE_URL`。
- Round 2 / PR-05：`scripts/csp/check-inline-scripts.ts` 存在未触发的 `eslint-disable-next-line no-console` 导致 ESLint “unused directive” warning（项目配置为 warnings=0 会失败）；已移除该注释。
- Round 4 / Wave B：首次复跑 `pnpm ci:local:quick` 时，Prettier 在 `src/app/__tests__/contact-integration.test.ts`、`src/app/api/whatsapp/send/route.ts`、`src/components/forms/contact-form-container.tsx`、`src/lib/actions/contact.ts` 报格式差异；已用 `pnpm exec prettier --write` 收口并复跑通过。
- Round 4 / Wave C：已先完成“低风险删除波次”，删除了零生产引用且仅由测试保活的假入口：`src/app/api/contact/contact-api-utils.ts`、`src/lib/api-cache-utils.ts`、`src/lib/site-config.ts`、`src/lib/metadata.ts`、`src/types/index.ts`、`src/types/global.ts`、`src/lib/security-headers.ts`、`src/lib/translation-benchmarks.ts`、`src/lib/translation-quality-types.ts`、`src/lib/translation-validators.ts`，并同步删除/改写对应保活测试。
- Round 4 / Wave C：`src/lib/validations.ts` 已被拆分并删除，生产链路分别迁移到 `src/lib/email/email-data-schema.ts`、`src/lib/airtable/record-schema.ts`、`src/lib/forms/form-submission-status.ts`、`src/lib/forms/validation-helpers.ts`；`security-validation.ts` 的 deprecated `sanitizeInput` alias 也已删除，`lead-pipeline/index.ts` 不再把 `sanitizeInput` 作为正式出口。
- Round 4 / Wave D：`src/app/[locale]/layout.tsx` 已升为真正的 root layout，负责 `<html lang>` / `<body>` 与开发脚本注入；页面层 locale 补丁与 `LangUpdater` 已删除，客户端组件已改回 locale context。
- Round 4 / Wave D Follow-up（2026-03-09）：实测 `src/proxy.ts` 可通过 `pnpm build`，但会阻塞 `pnpm build:cf`；已按最小回退方案恢复 `src/middleware.ts` 作为当前运行时入口，同时保留 Wave D 的 root layout / locale context 收益。
- Round 4 / Wave D Follow-up（2026-03-09）：`src/__tests__/middleware-locale-cookie.test.ts` 与 `tests/unit/middleware.test.ts` 已改回以 `@/middleware` / `../middleware` 为准；`pnpm build` 与 `pnpm build:cf` 均通过。
- Round 4 / Wave D Follow-up（2026-03-09）：并行执行 `pnpm build` 与 `pnpm build:cf` 时，OpenNext 曾因 `.next/lock` 失败；改为串行验证后恢复正常。该错误不代表兼容性问题。

## Round 2 Execution（落地修复）
- [x] PR-01（2026-03-05）：CR-007 + CR-009 + CR-003
  - CR-007：`/api/inquiry` 白名单 pick + `type` 后置覆盖兜底 + 回归测试
  - CR-009：`/api/csp-report` 16KB body size 上限（含 `content-length` 早拒绝与 stream 字节兜底）+ 测试更新
  - CR-003：移除 `next.config.ts` dev-only 副作用，引入 `pnpm dev:react-grab` 显式脚本；`pnpm unused:production` 恢复为可靠信号
  - 验收：`pnpm ci:local:quick`、`pnpm unused:production`
- [x] PR-02（2026-03-05）：CR-001 + CR-002（架构告警治理：no-orphans + barrel deps）
  - 结果：`pnpm arch:check` / `pnpm circular:check` 为 0 violations
  - 验收：`pnpm test`、`pnpm ci:local:quick`
- [x] PR-03（2026-03-05）：CR-015（prefetch 降噪）
  - 结果：Fetch 预取显著下降（17 → 10），`total-byte-weight` ≈533KB → ≈516KB（仍需以最新 `pnpm ci:local` 结果复核预算达标情况）
  - 验收：`pnpm build`、`pnpm perf:lighthouse`
- [x] PR-04（2026-03-05）：CR-016（radix-ui 按需引入）
  - 结果：以 PR-04 当时的 `pnpm ci:local` 为准，`total-byte-weight` 仍高于 490KB budget（warning）（/en ≈628KB，/zh ≈622KB；详见 `.lighthouseci/lhr-*.json`）；该问题已在后续 PR-06f 闭环
  - 验收：`pnpm build:analyze:webpack`、`pnpm test`、`pnpm perf:lighthouse`
- [x] PR-05（2026-03-05）：CR-017 + CR-019 + CR-020（strict CSP 闭环 + 安全头部/链接对齐）
  - 结果：strict CSP 下 nonce/hash 链路闭环（新增 `pnpm security:csp:check`）；安全头部自检与实际下发对齐；`target="_blank"` 统一补齐 `rel="noopener noreferrer"`
  - 验收：`pnpm build`、`pnpm security:csp:check`、`pnpm exec vitest run src/lib/__tests__/security-headers.test.ts`
    、`pnpm exec vitest run src/components/products/__tests__/product-actions.test.tsx`
- [x] PR-06（最后一波次/Wave）：补齐其余 P2/P3（拆成更小 PR-06a~PR-06f，见 `docs/code-review/round2-plan.md`）
  - PR-06a（2026-03-05）：CR-010、CR-012（基础正确性/可观测）✅
    - 变更：`/api/whatsapp/webhook` body size 改为 UTF-8 字节级判断（补多字节绕过用例）；`/api/cache/invalidate` secret 未配置返回 503
    - 验收：`pnpm ci:local:quick`
  - PR-06b（2026-03-05）：CR-013、CR-014（限流策略对齐）✅
    - 变更：`/api/contact` GET 增加 `contactAdminStats` rate limit；`/api/whatsapp/send` 增加 post-auth per-API-key rate limit
    - 验收：`pnpm test -- src/app/api/contact/__tests__/route.test.ts`、`pnpm test -- src/app/api/whatsapp/send/__tests__/route.test.ts`
  - PR-06c（2026-03-05）：CR-008（CORS：实际响应补齐 allowlist headers）✅
    - 变更：对 `/api/inquiry`、`/api/contact`、`/api/subscribe`、`/api/verify-turnstile` 的实际响应统一应用 `applyCorsHeaders`
    - 验收：`pnpm test -- src/app/api/inquiry/__tests__/route.test.ts`、`pnpm test -- src/app/api/contact/__tests__/route.test.ts`
  - PR-06d（2026-03-05）：CR-011（幂等：跨层联动）✅
    - 变更：`/api/subscribe` 强制 `Idempotency-Key`；前端订阅表单提交补齐并复用 key；`createIdempotencyStore()` 工厂化 + key 语义绑定 + 并发重复请求 TOCTOU 保护
    - 验收：`pnpm test -- tests/integration/api/subscribe.test.ts`、`pnpm test -- src/components/blog/__tests__/blog-newsletter.test.tsx`、`pnpm test -- src/lib/__tests__/idempotency.test.ts`
  - PR-06e（2026-03-05）：CR-021（SSRF 防护前置）✅
    - 变更：WhatsApp media download 增加第三方 URL allowlist + redirect policy（手动跟随且仍在 allowlist）
    - 验收：`pnpm test -- src/lib/__tests__/whatsapp-media.test.ts`
  - PR-06（DEV 夹带项，2026-03-05）：CR-004、CR-018 ✅（本地 CI/开发工具与 CSP 行为一致性）
    - 变更：`scripts/ci-local.sh` E2E 前检测 Playwright browsers；development CSP allowlist 纳入 `https://unpkg.com`（并修正 dev-only script URL）
    - 验收：`pnpm ci:local`、`pnpm test -- src/config/__tests__/security.test.ts`
  - PR-06f（2026-03-06）：CR-005（Lighthouse `total-byte-weight` budget 闭环）✅
    - 变更：首页残余 CTA/卡片 `Link` 继续关闭 prefetch；`JetBrains_Mono` 改为 `preload: false`；首页主链路移除 `font-mono`
    - 结果：当前工作树里的最新 `.lighthouseci` 显示 `/en` 为 `484,523 ~ 486,344` bytes、`/zh` 为 `478,053 ~ 479,610` bytes；`.lighthouseci/assertion-results.json` 为空
    - 验收：`pnpm perf:lighthouse`、`pnpm ci:local`

## Status
**Currently in Round 4 / Dual-platform compatibility restored** - 四个执行波次均已完成，随后已按“平台优先”的最小回退方案恢复 `src/middleware.ts`。当前保留了 Wave D 的 root layout、服务端 `<html lang>` 和 locale context 收益，并已通过 `pnpm build`、`pnpm build:cf` 以及 middleware 定向 Vitest 回归测试；`middleware` 弃用告警暂作为接受中的技术债保留。

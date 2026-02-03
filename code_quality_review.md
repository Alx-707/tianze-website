# 代码质量审查报告（证据驱动，Linus 风格）

审查范围：`/Users/Data/Warehouse/Focus/tianze-website` 当前工作区代码（不引入外部假设）。

> 你这项目在“质量护栏”上做得很用力，但也把一部分工程资源浪费在对付工具噪音上。好消息：能跑、能测、能 build；坏消息：你在某些地方把“看起来安全/规范”当成了“真的更好”，这会拖累长期维护。

---

## 0) 结论概览（只给可核查事实）

- ✅ TypeScript/ESLint/Test/Build 都能过
  - 证据：`pnpm type-check` / `pnpm lint:check` / `pnpm test` / `pnpm build` 本地均 exit=0（见 `notes.md` 的命令记录摘要）
- ✅ 覆盖率不是摆设：全量约 74%（> 65% 的 Phase 1 目标）
  - 证据：`reports/coverage/coverage-summary.json` 的 `total`：lines 74.9 / statements 74.09 / functions 70.24 / branches 69.24
- ✅ i18n 结构一致性有自动化校验
  - 证据：`pnpm validate:translations` 显示 en/zh key 都是 847（见 `notes.md`）
  - 证据：`pnpm i18n:shape:check` 输出报告 `reports/i18n-shape-report.json`
- ⚠️ 安全“门禁”目前只覆盖依赖审计，不覆盖代码级安全扫描（Semgrep 结果不会阻断）
  - 证据：`scripts/quality-gate.js#L1215`~`#L1413` 的 `checkSecurity()` 仅调用 `runSecurityAudit()`，而 `runSecurityAudit()` 只跑 `pnpm audit --prod --json`（`scripts/quality-gate.js#L1374`~`#L1388`）
  - 证据：`reports/quality-gate-1770113464272.json#L182`~`#L195`：`security.checks.audit` 只有 audit 指标
- ⚠️ 你被“security/detect-object-injection”这种低质量 lint 绑架了：代码里到处是为它而写的 guard/disable/noise
  - 证据：全局启用：`eslint.config.mjs#L163`~`#L185`（`security/detect-object-injection: error`）
  - 证据：工具性防火墙文件：`src/lib/security/object-guards.ts` 以“解决 ESLint 错误”为核心目标（`src/lib/security/object-guards.ts#L1`~`#L9`）
  - 证据：Semgrep 12 条命中里 10 条来自“spread operator”规则（`reports/semgrep-1770114414.json`，见下文）

---

## 1) P0（必须优先修）——部署/审计层面的硬伤

### P0-1：`next` 被放在 `devDependencies`，直接削弱生产依赖审计与生产安装可靠性

这不是“风格问题”，是“你生产环境到底装不装得起来”的问题。

- 证据：`package.json#L169`：`"next": "16.1.5"` 位于 `devDependencies` 块内（`package.json#L120`~`#L183`）
- 证据：安全门禁只跑 `pnpm audit --prod`，`--prod` 不包含 devDependencies
  - `scripts/quality-gate.js#L1374`~`#L1379`
  - 结果文件：`reports/quality-gate-1770113464272.json#L182`~`#L191`（audit 只统计 prod）
- 证据：`pnpm unused:production` 报告 `Unlisted binaries (1) next`（见 `notes.md` 的命令摘要）。这和 “next 不在 production deps” 的现状一致。

你要么：
- 把 `next` 移到 `dependencies`（推荐，最符合生态与审计逻辑）；要么
- 承认你生产环境必须安装 devDependencies（那就别再用 `--prod` 做任何“安全门禁”的姿势）。

---

## 2) P1（高优先级）——“安全/规范”的信噪比问题（现在是噪音主导）

### P1-1：Semgrep 规则在当前项目里基本是“噪音制造机”，而且不接入门禁

- 证据：Semgrep 运行结果文件：`reports/semgrep-1770114414.json`（12 条）
- 证据：12 条里 10 条是 `object-injection-sink-spread-operator`，集中命中“条件展开对象”这种常见且通常安全的写法：
  - `src/app/[locale]/products/page.tsx:122`（`...(... && { ... })`）
  - `src/app/[locale]/products/product-category-filter.tsx:37`/`55`
  - `src/app/[locale]/products/product-standards-filter.tsx:49`/`72`
  - `src/app/api/csp-report/route.ts:121`/`131`/`141`
  - `src/lib/lead-pipeline/pipeline-observability.ts:71`/`78`
  - 以上位置都可在 `reports/semgrep-1770114414.json` 的 `results[].path/start.line` 对应核查
- 证据：质量门禁 security 不包含 semgrep，仅包含 `pnpm audit --prod`
  - `scripts/quality-gate.js#L1215`~`#L1246` + `#L1372`~`#L1413`
  - `reports/quality-gate-1770113464272.json#L182`~`#L195`

结论：你现在同时拥有 **“看起来很安全”** 和 **“实际上门禁没管这事”** 两个问题。更糟的是：噪音太多会让真正的安全问题被淹没。

### P1-2：ESLint 的 `security/detect-object-injection` 全局 error 导致“为了工具而写代码”

- 证据：全局开启：`eslint.config.mjs#L163`~`#L185`
- 证据：为了对付规则而存在的巨大工具文件：
  - `src/lib/security/object-guards.ts#L1`~`#L9`（注释直接写“解决 ESLint 错误”）
  - 同文件中大量 `nosemgrep`/`eslint-disable`/Proxy/DeepGet 之类“看起来很安全”的封装（例如 `createSafeProxy`：`src/lib/security/object-guards.ts#L212`~`#L223`）

这类规则本质问题：它不会理解 TypeScript 的约束（`keyof`、union、`as const`），也不会区分“用户输入”与“内部常量”。你最后只能写一堆 wrapper 和 disable，这就是典型的“补丁堆补丁”。

---

## 3) P1（高优先级）——架构边界与单一事实源（Single Source of Truth）被破坏

### P1-3：路由 pathnames 出现多处硬编码，存在漂移风险

- 证据：`src/i18n/routing-config.ts#L23`~`#L34`：`pathnames` 显式列出 `"/about"`, `"/products/[slug]"` 等
- 证据：`src/config/paths/utils.ts#L43`~`#L55`：`getPathnames()` 再硬编码一遍同一套路径

这就是维护地雷：你改一个路由，得记得改两处（甚至更多处），否则测试/SEO/生成静态 params 会出现分裂行为。

### P1-4：`src/i18n/routing.ts` 导出 `validatePathsConfig`，模块职责污染

- 证据：`src/i18n/routing.ts#L14`~`#L15`：`export { validatePathsConfig } from "@/config/paths";`

`i18n/routing.ts` 应该只管 next-intl routing + navigation wrapper。把 paths 校验塞进来，是典型的“随手图省事”的耦合污染，迟早变成“谁都敢从这里 re-export 点东西”的垃圾桶。

---

## 4) P2（中优先级）——可读性/一致性：你在用常量淹没代码

### P2-1：常量爆炸（尤其是 COUNT_* / MAGIC_*）严重伤害可读性

“禁止魔法数字”不是让你把 `2` 写成 `COUNT_PAIR`。你这不是工程化，是行为艺术。

- 证据：`src/constants/index.ts` 中同时存在 `COUNT_TWO`、`COUNT_PAIR`、`MAGIC_16`、`MAGIC_3600000` 等（例如 `src/constants/index.ts#L135`~`#L187`）
- 证据：业务代码被迫使用这些常量，读起来像解密：
  - `src/lib/security/distributed-rate-limit.ts#L10`~`#L33`（`COUNT_FIVE/COUNT_TEN/COUNT_PAIR` 等）
  - `src/i18n/request.ts#L7`~`#L37`（`maximumFractionDigits: COUNT_FIVE` / `minimumFractionDigits: ONE`）

更糟糕的是：这种“抽象”不会减少 bug，只会让 review 更慢、更难。

---

## 5) P2（中优先级）——测试输出噪音：在 CI 里会降低可观察性

- 证据：logger 在 `test` 环境被当成 `dev`，默认 log level 为 `debug`
  - `src/lib/logger.ts#L20`~`#L24`：`NODE_ENV === "test"` 也算 dev
  - `src/lib/logger.ts#L37`~`#L39`：test 下默认 `debug`
  - `src/lib/logger.ts#L72`~`#L81`：`warn/error` 永远输出
- 证据：`pnpm test` / `pnpm test:coverage` 过程中出现 stderr 噪音（见 `notes.md` 中记录的示例：Turnstile/Resend error 测试路径输出堆栈与错误日志）

测试可以验证“会不会打日志”，但不该把日志直接喷到 CI 输出里污染信号。你应该让测试“捕获并断言日志”，而不是“制造日志再假装没看见”。

---

## 6) P2（中优先级）——Next.js 配置可疑点（需要用官方文档核对）

### P2-2：`next.config.ts` 的 headers source 写法高度可疑，可能根本没命中你想要的文件扩展名

- 证据：`next.config.ts#L145`~`#L148`：
  - `source: "/:all*(svg|jpg|jpeg|png|webp|woff|woff2|ttf|otf)"`

Next.js `headers().source` 使用的是 path-to-regexp 风格的 matcher，不是你想象的正则。这个写法很可能命中行为与你预期不同，导致“你以为上了 CDN cache header”，实际没生效。

---

## 7) P3（低优先级）——工具链一致性/噪音

- `pnpm unused:check` 报告 2 个 Unused devDependencies（更像是“knip 不懂配置文件消费”，不是实际未用）
  - 证据：`notes.md` 中 `pnpm unused:check` 输出摘要；配置见 `knip.jsonc#L43`~`#L59`（已有 ignoreDependencies，但没覆盖 prettier plugins）
- `pnpm unused:production` 的输出与 `unused:check` 明显矛盾，需要你决定到底信哪个
  - 证据：`notes.md` 的两个命令摘要（一个只报 2 个 devDeps，一个报 28 个 deps + next binary）
- `pnpm circular:check` 显示 “358 warnings” 但没给明细，工具输出不可执行
  - 证据：`notes.md` 命令摘要（madge 输出只有计数，没有具体告警列表）

---

## 8) 做得对的地方（别误会，我不是只会骂）

- Cache Components + i18n 的关键点（显式 locale / setRequestLocale）你做对了
  - 证据：`src/app/[locale]/layout.tsx#L39`~`#L47`：`setRequestLocale(locale)` + `getTranslations({ locale, namespace })`
- JSON-LD 输出做了 `</script>` 注入防护
  - 证据：`src/lib/structured-data.ts#L79`~`#L84`：`JSON.stringify(...).replace(/</g, \"\\\\u003c\")`
- server-only 的边界意识存在（敏感 server 文件显式 `import "server-only";`）
  - 证据：`src/lib/airtable/service.ts#L5`、`src/lib/airtable/service-internal/*.ts#L1`、`src/components/seo/json-ld-script.tsx#L1`
- i18n 文件一致性/结构化检查脚本齐全
  - 证据：`package.json` 中 `validate:translations`/`i18n:*`；输出报告见 `reports/i18n-shape-report.json`

---

## 9) 建议的整改顺序（按收益/风险排序）

1. 修 P0：把 `next` 放回 `dependencies`，并重新定义 “生产依赖审计” 的边界（否则 audit 是自欺欺人）。
   - 证据依据：`package.json#L169` + `scripts/quality-gate.js#L1374`~`#L1379`
2. 把 “安全扫描” 做成可执行信号：二选一
   - 要么把 semgrep 接入门禁并降低误报（收敛规则/加 allowlist/只扫高价值目录）
   - 要么承认它只跑 nightly，不要再把结果叫 blocking（现在的输出是“吓唬自己”）
   - 证据依据：`reports/semgrep-1770114414.json` + `reports/quality-gate-1770113464272.json#L182`~`#L195`
3. 关掉或降级 `security/detect-object-injection` 的全局 error（至少别逼人写 `object-guards.ts` 这种“为 lint 而生”的东西）。
   - 证据依据：`eslint.config.mjs#L163`~`#L185` + `src/lib/security/object-guards.ts#L1`~`#L9`
4. 合并 pathnames 的事实源：保留一个，删掉另一个；`routing.ts` 别再 re-export 不相干东西。
   - 证据依据：`src/i18n/routing-config.ts#L23`~`#L34` + `src/config/paths/utils.ts#L43`~`#L55` + `src/i18n/routing.ts#L14`~`#L15`
5. 清理“常量狂热”：允许小数字字面量，保留语义常量；把 `COUNT_PAIR/MAGIC_*` 这种东西当成技术债处理。
   - 证据依据：`src/constants/index.ts#L135`~`#L187`


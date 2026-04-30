# 代码库审计报告 — 2026-04-29

审计范围：`/Users/Data/Warehouse/Pipe/tianze-website`  
审计模式：`full`  
代码规模：`112022` 行 TypeScript / `20` 个 MDX 文件  
审计耗时：接力执行，未使用单一计时器

### Audit provenance（执行快照）

| 项 | 值 |
|---|---|
| Commit SHA | `c9302db5b442e0183c512c7372aac36d3b6a65a9` |
| 工作区状态 | 审计前 clean；本报告写入后新增审计产物 |
| 最近提交 | `2026-04-29 22:44:25 -0700` by `Largo` — `docs: route design context through token roles` |
| Baseline 等级 | `Drifted` |
| 被弱化的结论面 | 本地 raw Semgrep 没跑通，所以安全静态扫描 claim 降级；TypeScript/lint/dep/Knip 结论未受影响 |
| Tooling drift 检测 | skill self-check 通过；Semgrep raw binary 缺失见 §3.5 / §8.6 |

> 任何 finding 的 `file:line` 若命中未提交变更清单，本报告会标记 `in-progress`。本轮主要 findings 来自审计前 clean 的主树；报告文件本身是审计输出，不算产品代码变更。

---

## 0. 整体 Verdict（四栏）

| 维度 | 等级 | 一句话说明 |
|---|---|---|
| **Code health** | `Ok` | 主体结构、类型、lint、依赖边界和 unused 检查是干净的；风险集中在几个业务真相和失败模式。 |
| **Proof health** | `Weak` | 发布/部署 smoke 还不能证明真实买家询盘写入链路；本地 raw Semgrep 也未跑通。 |
| **Truth-source health** | `Weak` | logo 资产、产品 sitemap 日期、行为合同和测试脚本存在真相源错位。 |
| **Repairability** | `Ok` | 问题多为收口和加证明，不是大面积重写；可以按 P0/P1 分批修。 |

---

## 1. 业务影响摘要（Owner 必读）

### 1.1 总体评估

这套代码的底盘不是坏的：类型检查、lint、依赖边界、Knip 都通过，说明大部分基础工程纪律还在。真正的问题是“证明”和“真相源”没有完全收口：发布流程可以绿，但不一定证明真实部署环境里的买家询盘链路已经打通；站点也还把缺失 logo 当作已交付资产引用。对一个靠询盘转化的网站来说，这类问题比普通代码风格更重要。

### 1.2 对询盘转化的直接影响

- ⚠️ **真实部署环境的表单提交没有进入主发布证明** —— 发布绿灯不等于 Airtable 真的收到线索。
- ⚠️ **部分成功没有明确补救动作** —— 如果邮件和 CRM 只有一个成功，买家可能看到“已收到”，但站长未必有明确 follow-up 流程。
- ⚠️ **logo 资产缺失** —— 头部和结构化数据可能指向 404，影响第一印象和 SEO 信号。

### 1.3 隐藏的业务规则风险

- 📋 **partial success 规则**：当前规则是“部分成功也告诉用户已收到一部分，请先别重复提交”。这不是纯技术选择，需要 owner 确认后续谁处理、怎么处理。
- 📋 **发布证明边界**：当前 `release:verify` 是强本地证明，不是最终 deployed lead proof。上线前要明确是否必须跑真实 canary。
- 📋 **产品更新时间**：当前产品页 sitemap 日期靠统一 sidecar 值，产品规格变更不会自动带动 SEO 更新日期。

### 1.4 建议行动顺序

| 优先级 | 行动 | 预计所需工作量 |
|---|---|---|
| 本周必做 | 补 logo 资产或改为只引用已存在资产 | 小 |
| 本周必做 | 把 post-deploy 表单 canary 变成上线前明确 gate | 中 |
| 本月完成 | 更新 lead-family proof script 和行为合同，让重复提交证明统一 | 小-中 |
| 本月完成 | 决定 partial success 的 owner 处理流程 | 中 |
| 下季度规划 | 产品 sitemap freshness 自动化或 guard 化 | 小-中 |

---

## 2. 统计概览

### 2.1 发现按严重度分布

| 严重度 | 数量 | 说明 |
|---|---:|---|
| 🚨 Blocking | 0 | 没有发现必须立即停发的确定性问题 |
| ⚠️ High | 2 | logo 缺失；真实 deployed lead proof 未进入发布闭环 |
| 💡 Medium | 6 | partial success、产品/spec parity、proof script/contract、Semgrep、本地 sitemap truth |
| 📝 Low | 1 | skip-link 文案绕过 i18n |

### 2.2 发现按 AI 味道类别分布

| 类别 | 数量 | 代表文件 |
|---|---:|---|
| S11 Placeholder completion | 1 | `/Users/Data/Warehouse/Pipe/tianze-website/src/config/single-site.ts` |
| S13 Boundary errors | 1 | `/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/products/[market]/market-page-sections.tsx` |
| S16 i18n silent fallback | 1 | `/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/layout.tsx` |
| S21 Undocumented business rules | 1 | `/Users/Data/Warehouse/Pipe/tianze-website/src/lib/contact-form-processing.ts` |
| S25 Hollow integration / contract proof gap | 1 | `/Users/Data/Warehouse/Pipe/tianze-website/package.json` |
| S27 Warning-only / bypass proof erosion | 1 | `/Users/Data/Warehouse/Pipe/tianze-website/scripts/release-proof.sh` |
| S30 Audit-tool drift | 1 | `/tmp/audit/semgrep.json` |
| S31 Truth-source drift | 2 | `/Users/Data/Warehouse/Pipe/tianze-website/src/config/single-site-seo.ts`, `/Users/Data/Warehouse/Pipe/tianze-website/docs/specs/behavioral-contracts.md` |

### 2.3 发现按模块分布

| 模块 | 发现数 | 主要问题 |
|---|---:|---|
| `src/config/` | 2 | logo asset truth；sitemap sidecar date |
| `src/app/[locale]/` | 2 | product/spec join silent drop；skip-link i18n |
| `src/lib/` | 1 | partial success owner workflow |
| `scripts/` / `package.json` | 2 | release proof / test script coverage |
| `docs/specs/` | 1 | behavior contract stale |
| `/tmp/audit` | 1 | raw Semgrep missing in this audit baseline |

### 2.4 热度图：哪些文件问题最多

本轮没有单个产品代码文件出现 3 条以上 confirmed finding。风险不是“某个巨型文件烂掉”，而是 proof/truth-source 跨层没收口。

---

## 3. 详细发现

### 3.1 🚨 Blocking (0)

无。

### 3.2 ⚠️ High (2)

#### F-S11-001 · S11 Placeholder completion · `/Users/Data/Warehouse/Pipe/tianze-website/src/config/single-site.ts:129`

```yaml
finding:
  id: F-S11-001
  category: S11
  file: /Users/Data/Warehouse/Pipe/tianze-website/src/config/single-site.ts
  line: 129
  severity: High
  confidence: Confirmed
  cluster_hint: C-01
```

**代码摘录**:
```ts
    // TODO(wave1-blocked): These paths are intentional placeholders.
    // Files do not exist until Task 8/9/10 business assets are delivered.
    // Do NOT convert logo.tsx to next/image static import until files exist.
    brandAssets: {
      logo: {
        horizontal: "/images/logo.svg",
```

| 字段 | 值 |
|---|---|
| Confidence | `Confirmed` |
| Verification | 主 agent 复核：`src/config/single-site.ts:129-141`、`src/components/layout/logo.tsx:64-77`、`src/lib/structured-data-generators.ts:16`、`public/images` 文件列表一致 |
| Cluster | `C-01 真相源分散 / Truth source fragmentation` |
| In-progress? | 否 |

**Reproduce**:
```bash
sed -n '129,141p' src/config/single-site.ts
sed -n '64,77p' src/components/layout/logo.tsx
find public/images -maxdepth 1 -type f | sort
```

**问题**：配置明确说 logo 路径是 placeholder，文件不存在；但 runtime header 和 structured data 都按真实资产使用它。

**业务影响**：网站头部和结构化数据引用不存在的 logo 文件，会直接削弱买家信任和 SEO 信号。

**Linus Gate**：
- 这是补丁还是根因修？加 fallback 是补丁，停止把缺失资产发布成 runtime truth 才是根因修。
- 特殊情况能否消失？能，补真实 logo 或改为 text-only/已有资产。
- 根因是否在 truth-source / ownership？是，业务资产交付状态没有进入公开 runtime contract。
- 哪层可以删？placeholder logo path 可以删除或替换。

**Minimal correct design**：只引用真实存在的 public asset；没有 logo 时，header 和 JSON-LD 不应假装有 logo。

**建议修复**：补 `public/images/logo.svg`、`logo.png`、`logo-square.svg`，或改 header/JSON-LD 使用已有资产并加文件存在性测试。

---

#### F-S27-001 · S27 Proof erosion · `/Users/Data/Warehouse/Pipe/tianze-website/scripts/release-proof.sh:37`

```yaml
finding:
  id: F-S27-001
  category: S27
  file: /Users/Data/Warehouse/Pipe/tianze-website/scripts/release-proof.sh
  line: 37
  severity: High
  confidence: Confirmed
  cluster_hint: C-03
```

**代码摘录**:
```bash
pnpm test:release-smoke

echo "Cloudflare proof split:"
echo "  - Local stock preview: pnpm smoke:cf:preview"
echo "  - Strict local stock preview (includes /api/health): pnpm smoke:cf:preview:strict"
echo "  - Stronger local split-worker proof: pnpm deploy:cf:phase6:dry-run"
echo "  - Real preview publish path: pnpm deploy:cf:phase6:preview"
echo "  - Final deployed proof: pnpm smoke:cf:deploy -- --base-url <deployment-url>"
```

| 字段 | 值 |
|---|---|
| Confidence | `Confirmed` |
| Verification | 主 agent 复核：`release-proof.sh` 只打印 final deployed proof；`post-deploy-smoke.mjs` 只 GET 页面/health；`post-deploy-form.spec.ts` 是 opt-in |
| Cluster | `C-03 Proof lane 不可信 / Proof-lane erosion` |
| In-progress? | 否 |

**Reproduce**:
```bash
sed -n '19,45p' scripts/release-proof.sh
sed -n '170,188p' scripts/deploy/post-deploy-smoke.mjs
sed -n '24,41p' tests/e2e/smoke/post-deploy-form.spec.ts
```

**问题**：`release:verify` 可以通过，但它没有实际跑最终 deployed contact canary。`smoke:cf:deploy` 也只是页面/health 探测，不写 Airtable。

**业务影响**：发布流程可能显示通过，但真实部署环境里的买家询盘写入链路并没有被执行验证。

**Linus Gate**：
- 这是补丁还是根因修？写更多说明是补丁；把 canary proof 纳入 release gate 或手动 blocking gate 是根因修。
- 特殊情况能否消失？能，如果最终 deployed form proof 成为统一发布合同的一部分。
- 根因是否在 truth-source / ownership？是，release script、smoke script、opt-in Playwright spec 各管一段。
- 哪层可以删？模糊的“Final deployed proof”提示可以被真实 gate 取代。

**Minimal correct design**：发布状态必须明确说明真实部署表单链路是否已经提交并验证。

**建议修复**：上线流程中增加 `test:e2e:post-deploy` canary gate，或把它明确标成上线前必跑的人工门禁。

### 3.3 💡 Medium (6)

#### F-S21-001 · S21 Undocumented business rule · `/Users/Data/Warehouse/Pipe/tianze-website/src/lib/contact-form-processing.ts:220`

| 字段 | 值 |
|---|---|
| Confidence | `Probable` |
| Verification | 主 agent 复核：partial success shape、UI message、processor 并发行为存在；未找到 outbox/reconciliation 路径 |
| Cluster | `C-07 失败模式 UX 模糊 / Ambiguous failure UX` |

**Reproduce**:
```bash
sed -n '220,236p' src/lib/contact-form-processing.ts
sed -n '35,56p' src/lib/lead-pipeline/processors/contact.ts
rg -n 'reconciliation|outbox|CONTACT_PARTIAL_SUCCESS|partialSuccess' src tests scripts docs | head -100
```

**问题**：系统支持“邮件成功、CRM 失败”或反过来的 partial success，并告诉用户不要重复提交，但没有证明站长如何补救。

**业务影响**：买家可能以为已经提交成功，但站长只收到半条线索。

**Linus Gate**：根因不是 UI 文案，而是 owner 处理流程未定义；应补 owner-visible recovery 或调整重试策略。

**建议修复**：定义 partial success 策略：outbox、告警、人工复核，或严格失败重试，并增加测试证明。

---

#### F-S13-001 · S13 Boundary error · `/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/products/[market]/market-page-sections.tsx:109`

| 字段 | 值 |
|---|---|
| Confidence | `Probable` |
| Verification | 主 agent 复核：当前数据 aligned；未来 drift 时 runtime 会 silent `return null` |
| Cluster | `C-01 真相源分散 / Truth source fragmentation` |

**Reproduce**:
```bash
sed -n '22,26p' 'src/app/[locale]/products/[market]/market-page-data.ts'
sed -n '109,112p' 'src/app/[locale]/products/[market]/market-page-sections.tsx'
rg -n 'MARKET_SPECS_BY_SLUG|familySpecsMap|PRODUCT_CATALOG\.families' src/constants src/app tests | head -120
```

**问题**：catalog family 和 market spec 是两套真相，页面遇到缺 spec 的 family 会直接不渲染。

**业务影响**：新增产品系列时，如果规格表没同步，页面可能少展示产品。

**Linus Gate**：silent fallback 是补丁味；应让 catalog/spec parity 在测试或构建阶段失败。

**建议修复**：加 generic parity test：每个 market 的 catalog family set 必须等于 spec family set。

---

#### F-S25-001 · S25 Proof gap · `/Users/Data/Warehouse/Pipe/tianze-website/package.json:41`

| 字段 | 值 |
|---|---|
| Confidence | `Confirmed` |
| Verification | 主 agent 复核：route-specific replay tests 存在；`test:lead-family` 没包含它们；BC-024 状态仍 partial |
| Cluster | `C-03 Proof lane 不可信 / Proof-lane erosion` |

**Reproduce**:
```bash
sed -n '39,43p' package.json
sed -n '211,234p' src/app/api/inquiry/__tests__/route.test.ts
sed -n '109,127p' tests/integration/api/subscribe.test.ts
sed -n '362,373p' docs/specs/behavioral-contracts.md
```

**问题**：重复提交 replay 测试已经存在，但 release 的 `test:lead-family` 脚本没有跑到这些 route-specific tests。

**业务影响**：看到 lead-family 通过时，容易误以为全部重复提交语义都在发布门禁里。

**Linus Gate**：根因是 proof ownership 分散；把脚本和合同对齐即可。

**建议修复**：把 inquiry/subscribe replay tests 纳入 `test:lead-family` 或新增 `test:lead-idempotency`。

---

#### F-S30-001 · S30 Audit-tool drift · `/tmp/audit/semgrep.json:1`

| 字段 | 值 |
|---|---|
| Confidence | `Tooling drift` |
| Verification | 主 agent 复核：`/tmp/audit/semgrep.status` = `exit=254`；`semgrep` raw command missing |
| Cluster | `C-03 Proof lane 不可信 / Proof-lane erosion` |

**Reproduce**:
```bash
cat /tmp/audit/semgrep.status
cat /tmp/audit/semgrep.json
sed -n '55,63p' package.json
```

**问题**：本轮 raw Semgrep baseline 没跑通。项目有 `security:semgrep` wrapper 和 CI install Semgrep，但本轮本地 raw scan 不是 fresh evidence。

**业务影响**：本轮报告不能声称“本地已完整跑过 Semgrep 安全扫描”。

**建议修复**：下轮 audit 用 `pnpm security:semgrep` 或先安装 Semgrep，再记录 fresh report。

---

#### F-S31-001 · S31 Truth-source drift · `/Users/Data/Warehouse/Pipe/tianze-website/src/config/single-site-seo.ts:28`

| 字段 | 值 |
|---|---|
| Confidence | `Confirmed` |
| Verification | 主 agent 复核：product market sitemap lastmod 来自 static sidecar |
| Cluster | `C-01 真相源分散 / Truth source fragmentation` |

**Reproduce**:
```bash
sed -n '28,104p' src/config/single-site-seo.ts
sed -n '101,134p' src/app/sitemap.ts
```

**问题**：产品市场页的 sitemap 更新时间是统一常量，不跟产品/spec truth 自动关联。

**业务影响**：产品规格更新后，搜索引擎看到的 freshness 信号可能仍是旧日期。

**Linus Gate**：手动改日期是补丁；把更新时间放进产品/spec truth 或加 guard 是根因修。

**建议修复**：为产品/spec 数据增加 `updatedAt`，或加检查强制产品改动同步更新 sitemap date。

---

#### F-S31-002 · S31 Truth-source drift · `/Users/Data/Warehouse/Pipe/tianze-website/docs/specs/behavioral-contracts.md:362`

| 字段 | 值 |
|---|---|
| Confidence | `Confirmed` |
| Verification | 主 agent 复核：BC-024 文档、route replay tests、`test:lead-family` 脚本三者不一致 |
| Cluster | `C-08 文档-主树漂移 / Docs-tree drift` |

**Reproduce**:
```bash
sed -n '362,373p' docs/specs/behavioral-contracts.md
sed -n '211,234p' src/app/api/inquiry/__tests__/route.test.ts
sed -n '109,127p' tests/integration/api/subscribe.test.ts
sed -n '39,43p' package.json
```

**问题**：行为合同还写着 inquiry/subscribe replay 语义 partial，但测试已经部分补上；发布脚本又没有覆盖这些测试。

**业务影响**：后续审查容易拿旧文档或不完整脚本当依据。

**Linus Gate**：单独改文档是补丁；合同、测试文件、发布脚本要一起对齐。

**建议修复**：对齐 BC-024、`test:lead-family`、route-specific replay tests。

### 3.4 📝 Low / Observation (1)

#### F-S16-001 · S16 i18n policy edge · `/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/layout.tsx:158`

| 字段 | 值 |
|---|---|
| Confidence | `Confirmed` |
| Verification | 主 agent 复核：skip-link visible text is inline locale ternary |
| Cluster | `C-09 i18n policy edge drift` |

**Reproduce**:
```bash
sed -n '156,170p' 'src/app/[locale]/layout.tsx'
rg -n 'Skip to main content|跳转到主要内容' src messages
```

**问题**：skip-link 是用户可见文案，但没有走 message key。

**业务影响**：短期影响小，但会削弱“用户可见文案全部走翻译源”的纪律。

**建议修复**：下次 i18n cleanup 时放入 `messages/{locale}/critical.json`，或明确记录为例外。

### 3.5 🛠 Tooling drift (1)

见 `F-S30-001`。该 finding 不表示产品代码有 bug，只表示本轮本地审计证据链降级。

---

## 4. 根因簇（Root cause clusters）

### C-01 · 真相源分散 / Truth source fragmentation

**成员 findings**：
- `F-S11-001` logo paths exist in config but files do not exist.
- `F-S13-001` catalog family and spec family truth can drift silently.
- `F-S31-001` product sitemap freshness is a manual sidecar.

**共同根因**：业务真相分散在 config、public assets、product specs、sitemap sidecar 之间，缺少 hard guard。

**推荐收口路径**：先补 logo 文件存在性，再加 product/spec parity 和 sitemap freshness guard。

**业务影响**：买家看到的品牌、产品和搜索引擎看到的 freshness 可能不同步。

**关联 Verdict 栏**：Truth-source health / Repairability。

### C-03 · Proof lane 不可信 / Proof-lane erosion

**成员 findings**：
- `F-S27-001` release/deploy proof does not prove real lead submission.
- `F-S25-001` lead-family proof script omits route-specific replay tests.
- `F-S30-001` raw Semgrep missing in local audit baseline.

**共同根因**：proof 分散在脚本、CI、opt-in tests 和本地工具之间，命名比实际覆盖范围更强。

**推荐收口路径**：把 proof script、behavior contract、CI/test target 对齐；下轮使用 repo-owned Semgrep wrapper。

**业务影响**：owner 容易看到“绿灯”，但绿灯没有覆盖最关键的真实询盘行为。

**关联 Verdict 栏**：Proof health。

### C-07 · 失败模式 UX 模糊 / Ambiguous failure UX

**成员 findings**：
- `F-S21-001` partial success has no proven reconciliation workflow.

**共同根因**：代码表达了外部服务部分失败的状态，但 owner 处理流程没有成为系统合同。

**推荐收口路径**：定义 outbox/alert/manual-review 或严格重试策略，并补测试。

**业务影响**：客户和站长可能对“是否真的收到询盘”理解不同。

**关联 Verdict 栏**：Code health / Proof health。

### C-08 · 文档-主树漂移 / Docs-tree drift

**成员 findings**：
- `F-S31-002` BC-024 behavior contract does not match current replay test and release script truth.

**共同根因**：行为合同、测试新增、发布脚本更新不是同一个变更单元。

**推荐收口路径**：任何 behavior proof 变更都同步更新 `docs/specs/behavioral-contracts.md` 和 named proof command。

**业务影响**：后续审查会被旧合同误导。

**关联 Verdict 栏**：Truth-source health / Proof health。

### C-09 · i18n policy edge drift

**成员 findings**：
- `F-S16-001` skip-link inline text bypasses message source.

**共同根因**：极小可见文案被当作布局细节，而不是翻译真相。

**推荐收口路径**：下次 i18n cleanup 顺手收进 message key。

**业务影响**：当前影响很小，但会给后续多语言纪律开小口子。

**关联 Verdict 栏**：Truth-source health。

---

## 5. Delete-first repair plan

### 5.1 可删层 (Delete candidates)

- `F-S11-001`：删除 placeholder logo paths，或用真实资产路径替换；不要保留“看起来像生产资产”的假路径。
- `F-S13-001`：删除产品页对缺 spec family 的 silent `return null`，改为 parity guard 或显式错误/owner fallback。

### 5.2 可合并层 (Merge candidates)

- 无明确可合并模块。本轮没有发现值得直接合并的大型 wrapper/adapter 层。

### 5.3 可收口真相源 (Truth-source consolidation)

- `F-S31-001`：产品页 sitemap `lastmod` 应收口到产品/spec metadata 或受 guard 约束。
- `F-S31-002` / `F-S25-001`：BC-024、route-specific replay tests、`test:lead-family` 应收口成一个 proof contract。
- `F-S11-001`：brand asset availability 应由 public asset + config + structured-data tests 共同证明。

### 5.4 可去除的 compat / wrapper / duplicate path

- 无。`src/constants/product-catalog.ts` 是当前 documented cutover wrapper 且仍有 live consumers，本轮不建议删除。

---

## 6. Phase 3 数据流深读（3-truth）

完整表格已写入 `/tmp/audit/flows-3truth.md`。本报告摘结论：

| Flow | Runtime truth | Proof truth | Design truth | Divergence |
|---|---|---|---|---|
| Lead / contact / inquiry | 核心保护链存在：rate limit、Turnstile、idempotency、lead pipeline | 本地 route/action proof 较多；deployed canary opt-in | partial success owner 流程未定义 | `F-S21-001`, `F-S27-001`, `F-S25-001` |
| i18n locale | middleware + request + split messages 工作模型清楚 | locale runtime tests 存在 | skip-link 有小例外 | `F-S16-001` |
| Product / catalog | catalog + spec join 正常；缺 spec 会 silent drop | market/spec tests 存在但 family parity guard 不够通用 | 需要 hard guard | `F-S13-001` |
| SEO / metadata | logo path 和 sitemap sidecar 明确 | tests 更多证明 shape，不证明 asset existence / product freshness | 需要真实资产和 freshness ownership | `F-S11-001`, `F-S31-001` |
| Cloudflare proof | OpenNext/Wrangler proof boundary分层清楚 | release proof 强本地弱 deployed lead | 真实询盘 proof 应成为 gate | `F-S27-001` |

---

## 7. 架构心智模型

本轮整理的完整上下文写入 `/tmp/audit/context.md`。压缩版如下：

- `src/app/[locale]/`：Localized App Router 页面、layout、metadata、产品/联系主路径。
- `src/app/api/`：inquiry、subscribe、verify-turnstile、CSP、health；public write endpoints 走共享保护链。
- `src/components/`：表单、产品展示、layout、shared UI。
- `src/config/`：site identity、paths、security、SEO/static route truth。
- `src/constants/`：产品 catalog wrapper、market specs、API codes、时间常量。
- `src/lib/`：actions、API helpers、content/i18n loaders、idempotency、security、lead pipeline、Airtable/Resend、structured data。
- `content/`：MDX 内容源。
- `messages/`：运行时 i18n 源，split critical/deferred。
- `scripts/` / `.github/workflows/`：release/proof/Cloudflare/security guardrails。

主要判断：仓库当前不是“代码风格乱”，而是“proof 和 truth-source 需要继续收口”。

---

## 8. 附录

### 8.1 本轮未覆盖 / 未执行

- 未执行 `pnpm build`、`pnpm build:cf`、部署、真实 post-deploy 表单 canary。
- 未做浏览器视觉检查。
- 未联网查官方文档，因为本轮是只读 repo audit，不修改 Next.js/API 行为。

### 8.2 Baseline evidence

| Command | Result |
|---|---|
| `pnpm type-check` | `exit=0` |
| `pnpm lint:check` | `exit=0`; `eslint:disable:check OK` |
| `pnpm dep:check` | `exit=0`; no dependency violations |
| `pnpm unused:check` / Knip | `exit=0` |
| raw `pnpm exec semgrep ...` | `exit=254`; command not found |

Baseline detail: `/tmp/audit/baseline.md`。

### 8.3 Review sampling / verification

| Severity | Findings | Verified | Failed verification / demoted |
|---|---:|---:|---:|
| Blocking | 0 | 0 | 0 |
| High | 2 | 2 | 0 |
| Medium | 6 | 6 | 0 |
| Low | 1 | 1 | 0 |
| Tooling drift | 1 | 1 | 0 |

所有 High 和 Medium findings 都复核了 cited file:line 和 read-only reproduce path。`F-S13-001` 与 `F-S21-001` 标为 `Probable`，因为它们是未来 drift/运营流程风险，不是当前必现 runtime crash。

### 8.4 Skill self-drift

`/tmp/audit/skill-selfcheck.json`:

```json
{
  "skill_dir": "/Users/Data/.codex/skills/ai-smell-audit",
  "project_root": ".",
  "drifts": [],
  "drift_count": 0,
  "ok": true
}
```

### 8.5 Workspace noise

以下本地/生成目录不计入产品代码 verdict：
- `./.next`
- `./.codex/.tmp`
- `./.omx`
- `./.open-next`
- `./.wrangler`

### 8.6 Effect-bound statement

本报告降低了“隐藏 AI 味道”的不确定性，但不证明“没有其它 bug”。它证明的是：在本次 `full` 范围、当前 commit、当前本地工具状态下，最高优先级风险集中在 proof lane、truth-source 和少量业务失败模式上。

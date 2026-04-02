# 全量吸收与落地主路线图

## 文档目的

这份文档是当前阶段的最高层执行路线图。

它回答的是：

**如果目标不是只吸收几个参考点，而是最终把“参考仓库借鉴点 + 当前项目整改 + 多站结构 + 文档体系 + AI 规则文档”全部落完，应该怎么排顺序。**

这份文档不代替前面那些专项清单，而是把它们串成一条主线。

相关入口：

- 总方案：
  - [reference-repo-comparison-recommendation-package.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/reference-repo-comparison-recommendation-package.md)
- 详细任务规划：
  - [full-adoption-detailed-task-plan.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/full-adoption-detailed-task-plan.md)
- 全量参考落地点：
  - [reference-repo-full-landing-point-map.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/reference-repo-full-landing-point-map.md)
- 非结构性优先清单：
  - [reference-repo-non-structural-adoption-checklist.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/reference-repo-non-structural-adoption-checklist.md)
- 结构性整改清单：
  - [multi-site-real-remediation-checklist.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/multi-site-real-remediation-checklist.md)

## 一句话结论

完整落地的正确顺序，不是先上多站结构。

完整落地的正确顺序是：

1. 先固定真相源和规则入口
2. 先吸收 5 个参考仓库的非结构性做法
3. 再清当前项目里的站点身份、内容、SEO、验证边界
4. 再更新 AI 规则文档，让 Claude / Codex 后续按同一套规则工作
5. 再做第二站最小真实接入
6. 最后才进入多站结构正式落地

简单说：

**先校准，再吸收，再清理，再试装，最后才正式上结构。**

## 总体原则

这条路线图默认遵守 5 条总原则。

## 1. 先吸收做法，不先吸收重量

`next-forge` 的重量最后再考虑，先学它的边界意识。

## 2. 先让当前项目更清楚，再让它更大

如果当前项目本身还不够清楚，多站结构只会放大问题。

## 3. AI 后续是主力编码者，所以规则和真相源比“工程师默契”更重要

这意味着文档、规则、入口、证明边界都必须尽量显式。

## 4. 文档不是附属品，而是 AI 协作层的一部分

如果规则和现状不一致，AI 就会持续误判。

## 5. 多站结构是结果，不是前提

它应该建立在边界已经证明成立的基础上。

## 最终目标拆成 6 条工作流

这条主路线图一共分成 6 条工作流，但执行顺序不是并行平均推进，而是有前后依赖。

### 工作流 A：真相源与文档治理

目标：

- 固定当前仓库哪些文档是真相源
- 减少规则漂移
- 让 AI 更容易找到真正该看的地方

### 工作流 B：5 个参考仓库非结构性吸收

目标：

- 先把最成熟的做法借进来
- 不先动多站壳层

### 工作流 C：当前项目清理与收口

目标：

- 站点身份层更清楚
- 内容和 SEO 更像资产
- 页面层更少偷偷承担业务真相

### 工作流 D：AI 规则文档升级

目标：

- 让 Claude / Codex 后续有更稳定的行为约束
- 让文档、规则、现状尽量一致

### 工作流 E：多站试装验证

目标：

- 用第二个真实站点验证边界
- 不再只靠纸面判断

### 工作流 F：多站结构正式落地

目标：

- 当边界已验证成立后，才进入真正的结构化实施

## 总顺序

建议总顺序固定为：

1. 工作流 A
2. 工作流 B
3. 工作流 C
4. 工作流 D
5. 工作流 E
6. 工作流 F

其中 B、C、D 可以局部交错推进，但不能跳过 A，也不建议越过 E 直接做 F。

---

## 工作流 A：真相源与文档治理

## 目标

先把“规则在哪里、真相在哪里、哪个文档说了算”固定下来。

## 现在为什么必须先做

因为后续主要靠 AI 编码。

如果真相源不清楚，AI 不会像长期人类工程师那样靠经验补洞，它更容易：

- 看错入口
- 跟错旧文档
- 把过时规则当当前真相

## 主要任务

### A1. 固定参考仓库路线图总入口

主要文档：

- [reference-repo-comparison-recommendation-package.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/reference-repo-comparison-recommendation-package.md)
- [reference-repo-full-landing-point-map.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/reference-repo-full-landing-point-map.md)
- [reference-repo-non-structural-adoption-checklist.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/reference-repo-non-structural-adoption-checklist.md)
- [multi-site-real-remediation-checklist.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/multi-site-real-remediation-checklist.md)

完成标准：

- 总方案文档能明确指出：
  - 现在先看哪份
  - 到了结构阶段再看哪份

### A2. 固定仓库级真相源入口

主要文档：

- [POLICY-SOURCE-OF-TRUTH.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/POLICY-SOURCE-OF-TRUTH.md)
- [CANONICAL-TRUTH-REGISTRY.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CANONICAL-TRUTH-REGISTRY.md)
- [QUALITY-PROOF-LEVELS.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)

完成标准：

- 后续 AI 任务提到 proof / truth / policy 时，不再需要多份文档反复交叉猜

### A3. 固定“当前项目 vs 未来项目”判断边界

主要文档：

- [future-upgrade-window-rules.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/future-upgrade-window-rules.md)
- [multi-site-architecture-strategy.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/multi-site-architecture-strategy.md)

完成标准：

- 后续不会再反复把“是否升级结构”拉回模糊讨论

## 当前先别做什么

- 先别重写大批旧文档
- 先别为了文档一致性去动业务代码

---

## 工作流 B：5 个参考仓库非结构性吸收

## 目标

先把别人的成熟做法借进来，但不先动结构。

## 主要任务

### B1. 吸收 `nextjs-starter`

重点：

- 站点身份信息集中
- i18n 入口直白
- 页面不再偷偷承担业务事实

当前落点：

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [site-facts.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/site-facts.ts)
- [routing-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/i18n/routing-config.ts)
- [load-messages.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/load-messages.ts)
- [page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/page.tsx)

### B2. 吸收 `opennextjs-cloudflare`

重点：

- 平台问题和业务问题分开表达
- 脚本职责分层
- 升级时固定做外部对照

当前落点：

- [package.json](/Users/Data/Warehouse/Pipe/tianze-website/package.json)
- [preview-smoke.mjs](/Users/Data/Warehouse/Pipe/tianze-website/scripts/cloudflare/preview-smoke.mjs)
- [RELEASE-PROOF-RUNBOOK.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/RELEASE-PROOF-RUNBOOK.md)
- [dependency-upgrade-playbook.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/dependency-upgrade-playbook.md)

### B3. 吸收 `tailwind-nextjs-starter-blog`

重点：

- 内容资产盘点
- SEO 资产单独看
- 模板残留清理

当前落点：

- [content-asset-inventory.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/content-asset-inventory.md)
- [content.json](/Users/Data/Warehouse/Pipe/tianze-website/content/config/content.json)
- [about.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/about.mdx)
- [seo-metadata.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/seo-metadata.ts)

### B4. 吸收 `Next-js-Boilerplate`

重点：

- 质量护栏重新分组
- 不能降级的底线明确
- 多站点验证视角先进入规则

当前落点：

- [quality-guardrail-gap-table.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/quality-guardrail-gap-table.md)
- [QUALITY-PROOF-LEVELS.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [multi-site-proof-requirements-draft.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/multi-site-proof-requirements-draft.md)

### B5. 吸收 `next-forge`

重点：

- 共享真相 vs 业务真相判断
- 站点差异候选
- 横切能力清单
- 升级结构条件

当前落点：

- [shared-truth-vs-tianze-business-truth-inventory.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/shared-truth-vs-tianze-business-truth-inventory.md)
- [site-difference-candidate-list.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/site-difference-candidate-list.md)
- [future-upgrade-window-rules.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/future-upgrade-window-rules.md)

## 完成标准

- 5 个仓库的借鉴点都有明确落点
- 至少第一批高价值点已经从“分析文档”变成“当前项目默认工作方式”

## 当前先别做什么

- 先别上多站壳层
- 先别引入更多重型依赖

---

## 工作流 C：当前项目清理与收口

## 目标

把当前项目本身整理成一个更适合 AI 持续改、也更适合以后接多站的底座。

## 主要任务

### C1. 站点身份层收口

主要范围：

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [site-facts.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/site-facts.ts)
- [footer-links.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/footer-links.ts)
- [product-catalog.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/constants/product-catalog.ts)

### C2. 内容和消息资产收口

主要范围：

- `messages/**`
- `content/pages/**`
- `content/posts/**`
- `docs/content/company/**`

### C3. 模板残留清理

主要范围：

- [content.json](/Users/Data/Warehouse/Pipe/tianze-website/content/config/content.json)
- [about.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/about.mdx)

### C4. 页面层松耦合

主要范围：

- [page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/page.tsx)
- [contact/page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/contact/page.tsx)
- [products/page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/products/page.tsx)

### C5. SEO 资产分层

主要范围：

- [seo-metadata.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/seo-metadata.ts)
- [layout-metadata.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/layout-metadata.ts)
- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)

## 完成标准

- 当前项目已经不再是一堆 Tianze 默认值散落在各层
- AI 后续改动时更容易找到正确入口

## 当前先别做什么

- 先别把“收口”理解成“先拆 apps/*”

---

## 工作流 D：AI 规则文档升级

## 目标

让后续 Claude / Codex 的默认行为，和你这次定下来的方向一致。

这一块非常重要，因为后面主要靠 AI 编码，不是靠人类工程师默契。

## 主要任务

### D1. 更新仓库根规则说明

主要文件：

- [AGENTS.md](/Users/Data/Warehouse/Pipe/tianze-website/AGENTS.md)

建议新增或强化的规则：

- 当前默认优先看哪些参考仓库落地文档
- 当前先不急着做结构拆分，默认先做非结构性吸收
- 后续如果 AI 被要求做“多站点”，先检查是否已到结构阶段

### D2. 更新架构规则

主要文件：

- [.claude/rules/architecture.md](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/architecture.md)

建议新增或强化的规则：

- 共享真相 vs 业务真相的判断要求
- 当前多站结构不是默认起手动作
- 先收口站点身份、内容、SEO，再谈结构升级

### D3. 更新 i18n 规则

主要文件：

- [.claude/rules/i18n.md](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/i18n.md)

建议新增或强化的规则：

- 消息文件既是翻译资产，也是业务资产
- 后续多站时，不能把消息文件只当语言层

### D4. 更新质量与测试规则

主要文件：

- [.claude/rules/quality-gates.md](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/quality-gates.md)
- [.claude/rules/testing.md](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/testing.md)
- [.claude/rules/ai-smells.md](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/ai-smells.md)

建议新增或强化的规则：

- 站点身份层风险不能被弱化为普通文案改动
- 多站点阶段的最低页面集和关键验证概念
- 不要让 AI 通过“假页面测试”绕过站点身份或关键路径证明

### D5. 更新 AI 协作工作流文档

主要文件：

- [frontend-llm-workflow.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/frontend-llm-workflow.md)
- [AI-CODING-DETECTION-RUNBOOK.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/AI-CODING-DETECTION-RUNBOOK.md)
- [POLICY-SOURCE-OF-TRUTH.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/POLICY-SOURCE-OF-TRUTH.md)

建议新增或强化的规则：

- 当前默认参考文档入口
- 当前先做非结构性吸收，再做结构整改
- 对 AI 下任务时，默认要求先判断属于哪一层

## 完成标准

- AI 后续接任务时，默认行为与这次路线图一致
- 不会再轻易滑回“先拆结构”或“哪里顺手改哪里”

## 当前先别做什么

- 先别把所有规则写成特别长的重复描述
- 重点是把关键新判断补进去，不是把每份规则重写一遍

---

## 工作流 E：多站试装验证

## 目标

用第二个真实站点做最小真实接入，验证前面判断是否成立。

## 现在为什么不能跳过

因为只靠文档和单站视角，很难证明抽象真的能承受第二个站。

## 主要任务

### E1. 选定第二站最小范围

建议只包含：

1. 首页
2. 联系页
3. 一个主产品入口
4. 一套站点身份信息
5. 一套默认 SEO 值

### E2. 验证站点身份层是否够用

检查点：

- 品牌是否能独立
- 联系方式是否能独立
- 产品入口是否能独立
- 默认 SEO 是否能独立

### E3. 验证内容资产层是否够用

检查点：

- 消息文件是否能切
- 运行时内容和研究资料边界是否足够清楚

### E4. 验证 proof 层是否够用

检查点：

- 共享层验证
- 站点身份证明
- Cloudflare 页面级本地信号
- 最终部署证明

## 完成标准

- 第二个真实站点的最小路径能跑通
- 能明确知道哪些抽象成立，哪些还需要补

## 当前先别做什么

- 不要第二站一上来就全量复制

---

## 工作流 F：多站结构正式落地

## 目标

当前面五条工作流都打好了，再正式进入多站结构施工。

## 主要任务

### F1. 固定最终结构策略

优先方向：

- 单仓库
- 共享底座
- 站点身份层
- 站点内容层
- 各站独立部署

### F2. 设计最终目录与边界

至少要回答：

- 共享底座放哪里
- 站点身份输入放哪里
- 站点内容放哪里
- 多站部署配置放哪里

### F3. 接入第二站和第三站

目标：

- 不再复制整个项目
- 让第二、第三站都通过共享底座接入

### F4. 多站 proof 正式接入

目标：

- 每个站都有最低页面集证明
- 共享层和站点层验证分层清楚

## 完成标准

- 多站结构不再只是规划
- 第二、第三站都能在同一底座上工作
- 文档和 AI 规则与实际结构一致

## 当前先别做什么

- 不要在 E 还没做完前直接做 F

---

## 最小执行里程碑

为了避免路线图太大，建议只按 4 个里程碑来盯。

### 里程碑 1：规则和入口固定

完成标志：

- 工作流 A 完成
- 工作流 D 的关键入口更新完成

### 里程碑 2：非结构性吸收完成

完成标志：

- 工作流 B 完成
- 工作流 C 第一轮完成

### 里程碑 3：第二站最小验证完成

完成标志：

- 工作流 E 完成

### 里程碑 4：多站结构正式落地

完成标志：

- 工作流 F 完成

## 最后一句判断

这份主路线图真正要固定下来的是：

**你要的不是“做个大重构”，而是一步一步把当前项目变成一个 AI 也能稳定维护、最后还能承接多个站点的底座。**

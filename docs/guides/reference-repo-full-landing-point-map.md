# 5 个参考仓库全部落地点总表

## 文档目的

这份文档回答的是最完整的那个问题：

**如果现在先不做结构拆分，那么 5 个参考仓库的借鉴点，全部能落到当前项目哪些地方。**

它不是只列“最值的几项”，而是尽量把当前阶段值得吸收的点都列全。

适用方式：

- 如果只想先做最值的一批，看：
  - [reference-repo-non-structural-adoption-checklist.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/reference-repo-non-structural-adoption-checklist.md)
- 如果想看完整地图，看这份

## 一句话结论

当前项目最值得落地的，不是某一个仓库的整套模板，而是 5 个仓库分别提供的 5 类成熟做法：

- `nextjs-starter` 提供“单站信息收口”
- `opennextjs-cloudflare` 提供“平台边界表达”
- `tailwind-nextjs-starter-blog` 提供“内容与 SEO 资产意识”
- `Next-js-Boilerplate` 提供“质量护栏分层”
- `next-forge` 提供“边界判断和未来升级条件”

简单说：

**现在不是选模板，而是把这些成熟做法一条条借进来。**

## 阅读方法

每个落地点都按同一格式写：

- 借鉴点
- 当前项目落点
- 现在为什么值得做
- 现在能直接怎么落
- 当前明确先别做什么

## A. `weijunext/nextjs-starter` 全部落地点

这个仓库现在最值得你学的，不是“多站点”，而是：

**怎么把一个单站项目先整理清楚。**

## A1. 站点身份入口更集中

当前项目落点：

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [site-facts.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/site-facts.ts)
- [footer-links.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/footer-links.ts)

现在为什么值得做：

- 站点名、联系信息、默认 SEO、社媒、公司事实现在还分散
- 后面接第二个站时，入口难找

现在能直接怎么落：

- 把这些文件正式定义为“站点身份层”的核心入口
- 新增类似信息时，不再新开散落入口

当前明确先别做什么：

- 先别重做目录结构

## A2. i18n 真相入口更直白

当前项目落点：

- [routing-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/i18n/routing-config.ts)
- [routing.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/i18n/routing.ts)
- [load-messages.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/load-messages.ts)

现在为什么值得做：

- 现在能跑，但后来的人不容易一眼知道“改路由看哪，改消息看哪”

现在能直接怎么落：

- 增补入口说明
- 把“路由真相”“消息真相”“fallback 真相”写成固定解释

当前明确先别做什么：

- 先别改 i18n 机制本身

## A3. 页面不再偷偷承担站点事实

当前项目落点：

- [page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/page.tsx)
- [contact/page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/contact/page.tsx)
- [products/page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/products/page.tsx)

现在为什么值得做：

- 这些页面里还有 Tianze 专属语境

现在能直接怎么落：

- 逐步把明显写死的业务事实移回站点身份层或内容层

当前明确先别做什么：

- 先别为了干净把页面整体重写

## A4. 站点默认配置和页面配置边界更清楚

当前项目落点：

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [layout-metadata.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/layout-metadata.ts)
- [seo-metadata.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/seo-metadata.ts)

现在为什么值得做：

- 当前默认值和页面级值有点混着讨论

现在能直接怎么落：

- 明确哪些属于站点默认值，哪些属于页面覆盖值

当前明确先别做什么：

- 先别重做 metadata 流程

## A5. 内容、配置、页面三层关系更容易讲清楚

当前项目落点：

- [content-asset-inventory.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/content-asset-inventory.md)
- [shared-truth-vs-tianze-business-truth-inventory.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/shared-truth-vs-tianze-business-truth-inventory.md)

现在为什么值得做：

- 现在已经有这些材料，但还没完全变成团队默认理解

现在能直接怎么落：

- 后续评审和任务描述时，按“配置层 / 内容层 / 页面层”来讲

当前明确先别做什么：

- 先别把三层边界直接写死进复杂框架

## B. `opennextjs/opennextjs-cloudflare` 全部落地点

这个仓库现在最值得你学的，不是业务模板，而是：

**Cloudflare 这条线怎么说清楚，才不会反复误判。**

## B1. 平台问题和业务问题分开归类

当前项目落点：

- [QUALITY-PROOF-LEVELS.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [CANONICAL-TRUTH-REGISTRY.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CANONICAL-TRUTH-REGISTRY.md)

现在为什么值得做：

- 现在仓库经验很多，但后来的人还是容易混淆“平台适配问题”和“业务页面回归”

现在能直接怎么落：

- 新增一页 Cloudflare 问题归类说明

当前明确先别做什么：

- 先别改构建链路

## B2. 本地页面信号和最终部署证明继续分开

当前项目落点：

- [preview-smoke.mjs](/Users/Data/Warehouse/Pipe/tianze-website/scripts/cloudflare/preview-smoke.mjs)
- [release-proof.sh](/Users/Data/Warehouse/Pipe/tianze-website/scripts/release-proof.sh)

现在为什么值得做：

- 这是当前仓库很重要的优势，未来不能退回去

现在能直接怎么落：

- 把这条边界写进更直白的说明里
- 后续涉及 Cloudflare 的任务单，默认说明“本地信号”和“最终证明”不是一回事

当前明确先别做什么：

- 不要把 stock preview 当最终真相

## B3. Cloudflare 脚本职责按四类重写说明

当前项目落点：

- [package.json](/Users/Data/Warehouse/Pipe/tianze-website/package.json)
- `scripts/cloudflare/**`

现在为什么值得做：

- 脚本多，但职责不够一眼明白

现在能直接怎么落：

- 按“构建 / 页面级本地信号 / 最终部署证明 / 诊断路径”四类补一页说明

当前明确先别做什么：

- 不要改脚本行为，只改说明和分组

## B4. 升级时强制加一轮外部对照

当前项目落点：

- 依赖升级 playbook
- Cloudflare 升级 runbook

现在为什么值得做：

- 避免只看本仓库历史经验

现在能直接怎么落：

- 升级检查表里补一项：对照官方参考仓库当前做法是否出现关键偏移

当前明确先别做什么：

- 不要新增复杂自动化，只先写规则

## B5. Cloudflare 问题词典

当前项目落点：

- 相关 runbook 和真相文档

现在为什么值得做：

- 现在同一类问题容易换不同说法，后面的人更难接

现在能直接怎么落：

- 统一一些常见问题的归类语言，比如：
  - 平台入口问题
  - 生成产物兼容问题
  - 本地 preview 边界问题
  - 部署后最终问题

当前明确先别做什么：

- 先别写复杂知识库系统，先从一页说明开始

## C. `timlrx/tailwind-nextjs-starter-blog` 全部落地点

这个仓库现在最值得你学的，是：

**内容、SEO、元信息不是边角料，而是资产。**

## C1. 内容资产类型正式进入日常判断

当前项目落点：

- [content-asset-inventory.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/content-asset-inventory.md)

现在为什么值得做：

- 现在盘点已经有了，但还没变成默认工作方式

现在能直接怎么落：

- 新增内容时，先标它属于哪类资产

当前明确先别做什么：

- 不要把内容盘点停留在文档里不使用

## C2. 运行时内容和研究资料边界更清楚

当前项目落点：

- [docs/content/**](/Users/Data/Warehouse/Pipe/tianze-website/docs/content)
- [content/pages/**](/Users/Data/Warehouse/Pipe/tianze-website/content/pages)
- [content/posts/**](/Users/Data/Warehouse/Pipe/tianze-website/content/posts)

现在为什么值得做：

- 研究资料很多，但和运行时内容边界不够硬

现在能直接怎么落：

- 给“运行时真相”和“研究资料”做明确区分说明

当前明确先别做什么：

- 不要因为边界整理就搬动所有内容文件

## C3. SEO 资产单独盘，不再分散着盘

当前项目落点：

- [seo-metadata.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/seo-metadata.ts)
- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [content.json](/Users/Data/Warehouse/Pipe/tianze-website/content/config/content.json)
- [layout-metadata.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/layout-metadata.ts)
- [sitemap.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/app/sitemap.ts)
- [robots.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/app/robots.ts)

现在为什么值得做：

- SEO 默认值现在分散在多层

现在能直接怎么落：

- 单独补一份 SEO 资产清单

当前明确先别做什么：

- 不要重做 SEO 引擎

## C4. 模板残留先清掉

当前项目落点：

- [content.json](/Users/Data/Warehouse/Pipe/tianze-website/content/config/content.json)
- [about.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/about.mdx)

现在为什么值得做：

- 模板残留会继续污染后面的边界判断

现在能直接怎么落：

- 列成明确清理项并逐个替换

当前明确先别做什么：

- 不要把这件事拖到以后结构调整时再顺手做

## C5. 结构化业务内容正式承认其资产身份

当前项目落点：

- [company-facts.yaml](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/company/company-facts.yaml)
- [products.yaml](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/company/products.yaml)
- [value-copy.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/company/value-copy.md)

现在为什么值得做：

- 这些内容已经不是草稿，而是站点身份的重要组成部分

现在能直接怎么落：

- 在后续任务和评审里，把它们视作“站点业务资产”

当前明确先别做什么：

- 不要把它们继续藏在“只是文档资料”的语气里

## D. `ixartz/Next-js-Boilerplate` 全部落地点

这个仓库现在最值得你学的，是：

**质量护栏如何更成体系，而不是工具更多。**

## D1. 现有检查重新分组

当前项目落点：

- [quality-guardrail-gap-table.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/quality-guardrail-gap-table.md)
- [package.json](/Users/Data/Warehouse/Pipe/tianze-website/package.json)

现在为什么值得做：

- 当前脚本很多，但不够一眼清楚

现在能直接怎么落：

- 形成固定分组视图：
  - 静态正确性
  - 翻译与内容一致性
  - 运行时合同
  - 页面级本地 Cloudflare 信号
  - 部署后最终证明
  - 安全与仓库卫生

当前明确先别做什么：

- 不要叠加更多工具

## D2. 明确“哪些不能降级”

当前项目落点：

- `release-proof`
- `validate:translations`
- locale / lead / cache / release smoke

现在为什么值得做：

- 多站点一来，最容易有人觉得“太慢了，先简化”

现在能直接怎么落：

- 单独写一份“当前不能降级的底线”说明

当前明确先别做什么：

- 不要现在就删或弱化现有关键检查

## D3. 共享证明和站点身份证明先分开定义

当前项目落点：

- [multi-site-proof-requirements-draft.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/multi-site-proof-requirements-draft.md)

现在为什么值得做：

- 当前检查还是偏单站视角

现在能直接怎么落：

- 把这两个概念先写清楚，哪怕暂时还没接进脚本

当前明确先别做什么：

- 不要一上来就重写 CI

## D4. 质量护栏和内容资产、站点身份结合起来看

当前项目落点：

- 质量护栏总表
- 内容资产盘点
- 共享真相 vs 业务真相清单

现在为什么值得做：

- 不然护栏只会盯技术，不会盯业务身份串错

现在能直接怎么落：

- 在质量说明里补上“站点身份层风险”和“内容资产层风险”

当前明确先别做什么：

- 不要为了覆盖这些风险而引入大量新测试框架

## D5. 未来多站点的最低页面集先写规则

当前项目落点：

- [multi-site-proof-requirements-draft.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/multi-site-proof-requirements-draft.md)

现在为什么值得做：

- 以后不能只说 build 过了

现在能直接怎么落：

- 先把每个站最低页面集固定下来

当前明确先别做什么：

- 先别把它写成复杂自动化矩阵

## E. `vercel/next-forge` 全部落地点

这个仓库现在最值得你学的，不是它的重型结构，而是：

**边界意识。**

## E1. 共享真相和业务真相始终分开判断

当前项目落点：

- [shared-truth-vs-tianze-business-truth-inventory.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/shared-truth-vs-tianze-business-truth-inventory.md)

现在为什么值得做：

- 这是后面所有讨论的判断前提

现在能直接怎么落：

- 后续任何整改项先标“共享层”还是“站点身份层”

当前明确先别做什么：

- 不要只说“这个要改”，不说它属于哪一层

## E2. 站点差异候选正式进入判断

当前项目落点：

- [site-difference-candidate-list.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/site-difference-candidate-list.md)

现在为什么值得做：

- 不然以后又会回到“感觉这里可能会分开”的讨论

现在能直接怎么落：

- 新增品牌、内容、导航、产品结构时，先看是不是差异候选区

当前明确先别做什么：

- 不要看到差异候选就立刻拆结构

## E3. 横切能力清单

当前项目落点：

- i18n
- SEO
- 安全
- Cloudflare 平台适配
- 内容加载
- 质量证明

现在为什么值得做：

- 当前这些能力已经有了，但还没被清楚看成“几个主题系统”

现在能直接怎么落：

- 列一份横切能力清单，写清楚每块是干什么的

当前明确先别做什么：

- 不要为了清单去重排代码目录

## E4. 升级结构的条件先固定

当前项目落点：

- [future-upgrade-window-rules.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/future-upgrade-window-rules.md)

现在为什么值得做：

- 这样以后不会一会儿想拆，一会儿又停

现在能直接怎么落：

- 把这份规则作为以后讨论结构升级的前置条件

当前明确先别做什么：

- 不要因为规则写完了，就觉得现在该升级

## E5. 共享能力按主题归类，但先停在文档层

当前项目落点：

- 总方案文档
- 架构文档
- 未来改造说明

现在为什么值得做：

- 可以先形成认知上的分层

现在能直接怎么落：

- 用文档说明“这些横切能力是一组共享底座”

当前明确先别做什么：

- 先别直接改成 `packages/*`

## 当前阶段全部落地点的建议执行顺序

如果要把这些点按执行顺序排出来，建议这样看：

### 第一组：马上能做，而且最值

1. 站点身份入口收紧
2. i18n 入口说明
3. 模板残留清理
4. 内容资产边界说明
5. SEO 资产清单
6. Cloudflare 问题归类说明
7. Cloudflare 脚本职责说明
8. 质量护栏分组与底线说明

### 第二组：跟着第一组继续补

9. 共享证明 vs 站点身份证明说明
10. 横切能力清单
11. 未来多站点最低页面集规则
12. 升级结构条件固定化

### 第三组：先记录，不先做

13. 目录重排
14. 多应用壳层
15. 大规模可插拔框架
16. 为了像成熟模板而引入更多重型工具

## 最后一条总原则

这份“全部落地点总表”真正想固定的是一句话：

**现在先把别人已经验证过的好做法，吸收到当前项目里；结构拆分，是后面的事。**

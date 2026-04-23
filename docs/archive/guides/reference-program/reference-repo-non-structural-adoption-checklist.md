# 5 个参考仓库的非结构性落地清单

## 文档目的

这份文档专门服务一个前提：

**现在先不做结构拆分，先把 5 个参考仓库真正值得学的点，落到当前项目里。**

所以它不回答“以后怎么拆”，只回答：

- 每个参考仓库现在最值得借哪几刀
- 这些点在当前项目具体落到哪里
- 哪些可以现在就做
- 哪些明确先别动

如果想看完整地图，请继续看：

- [reference-repo-full-landing-point-map.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/archive/guides/reference-program/reference-repo-full-landing-point-map.md)

## 一句话结论

现在最值的不是“把项目改得更像某个模板”，而是先吸收这 5 个仓库各自最成熟的那一小块。

更具体地说：

- 从 `nextjs-starter` 先学信息收口
- 从 `opennextjs-cloudflare` 先学边界表达
- 从 `tailwind-nextjs-starter-blog` 先学内容资产管理
- 从 `Next-js-Boilerplate` 先学质量护栏分层
- 从 `next-forge` 先学边界判断，不学它的重量

简单说：

**现在先吸收做法，不先吸收结构。**

## 使用方式

这份清单默认分成两层：

1. 每个仓库各自最值得落地的点
2. 按优先级排好的真实落地顺序

## 1. 从 `weijunext/nextjs-starter` 现在最值得落地的点

## 借鉴点 A：站点基础信息更集中

当前项目落点：

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [site-facts.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/site-facts.ts)
- [footer-links.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/footer-links.ts)

现在为什么值得做：

- 当前品牌、联系、SEO 默认值、社媒这些信息还是偏分散
- 这会让后面接第二个站时，入口很难找

现在就该做什么：

- 把“站点身份层”先整理成更少的入口
- 新增业务信息时，默认先往这层收口

现在先别做什么：

- 不要为了集中信息而重排整个目录

## 借鉴点 B：i18n 真相入口更直白

当前项目落点：

- [routing-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/i18n/routing-config.ts)
- [routing.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/i18n/routing.ts)
- [load-messages.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/load-messages.ts)

现在为什么值得做：

- 当前 i18n 其实已经不弱，但对后来的人来说还不够一眼看懂

现在就该做什么：

- 把“路由真相入口”和“消息真相入口”写得更直白
- 让后来的人不用先读很多上下文才能判断改哪里

现在先别做什么：

- 不要重做 i18n 机制本身

## 借鉴点 C：减少页面里暗藏的业务真相

当前项目落点：

- [page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/page.tsx)
- [contact/page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/contact/page.tsx)
- [products/page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/products/page.tsx)

现在为什么值得做：

- 页面层现在还在承担一部分 Tianze 专属事实

现在就该做什么：

- 优先把页面里明显写死的业务语境挪回身份层或内容层

现在先别做什么：

- 不要为了页面清洁度而重做所有页面骨架

## 2. 从 `opennextjs/opennextjs-cloudflare` 现在最值得落地的点

## 借鉴点 A：平台问题和业务问题分开说清楚

当前项目落点：

- [QUALITY-PROOF-LEVELS.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [CANONICAL-TRUTH-REGISTRY.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CANONICAL-TRUTH-REGISTRY.md)
- [preview-smoke.mjs](/Users/Data/Warehouse/Pipe/tianze-website/scripts/cloudflare/preview-smoke.mjs)

现在为什么值得做：

- 当前仓库对 Cloudflare 很重视，但理解门槛偏高
- 很容易把“平台边界问题”和“页面回归”混在一起

现在就该做什么：

- 增加一页“Cloudflare 问题归类说明”
- 把常见问题分成平台层、生成产物层、页面层、最终部署层

现在先别做什么：

- 不要为了简化说明就削弱现有 smoke 分层

## 借鉴点 B：升级时固定做外部对照

当前项目落点：

- Next / OpenNext / Wrangler 升级流程文档
- Cloudflare 相关脚本与 runbook

现在为什么值得做：

- 当前仓库历史经验很多，但如果只看本仓库，很容易把旧结论误当成永远真相

现在就该做什么：

- 给依赖升级补一份固定对照表
- 升级时默认检查官方参考仓库和当前项目的差异是否扩大

现在先别做什么：

- 不要引入新的复杂 harness

## 借鉴点 C：脚本职责再说清楚一点

当前项目落点：

- [package.json](/Users/Data/Warehouse/Pipe/tianze-website/package.json)
- `scripts/cloudflare/**`

现在为什么值得做：

- 脚本很多，但后来的人不容易一眼看懂谁负责什么

现在就该做什么：

- 把 Cloudflare 相关脚本按“构建 / 本地页面信号 / 真实部署证明 / 诊断路径”四类重新说明

现在先别做什么：

- 不要改脚本行为本身，先改说明和分层

## 3. 从 `timlrx/tailwind-nextjs-starter-blog` 现在最值得落地的点

## 借鉴点 A：把内容当资产，而不是页面文案

当前项目落点：

- [content-asset-inventory.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/content-asset-inventory.md)
- [content-manifest.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/content-manifest.ts)
- [content-manifest.generated.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/content-manifest.generated.ts)

现在为什么值得做：

- 当前内容已经很多，但资产意识还不够硬

现在就该做什么：

- 把内容分类真正带入日常改动判断
- 新增内容时先判断它属于哪一类资产

现在先别做什么：

- 不要照搬博客模板的内容形态

## 借鉴点 B：SEO 资产单独看，不再散着看

当前项目落点：

- [seo-metadata.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/seo-metadata.ts)
- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [content.json](/Users/Data/Warehouse/Pipe/tianze-website/content/config/content.json)
- [layout-metadata.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/layout-metadata.ts)

现在为什么值得做：

- 当前 SEO 相关内容分散在配置、消息、MDX 和生成器里

现在就该做什么：

- 先列出 SEO 资产清单
- 把默认值、页面级值、品牌词、关键词分清楚

现在先别做什么：

- 不要为了 SEO 资产整理而重做 metadata 系统

## 借鉴点 C：先清模板残留

当前项目落点：

- [content.json](/Users/Data/Warehouse/Pipe/tianze-website/content/config/content.json)
- [about.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/about.mdx)

现在为什么值得做：

- 模板残留会持续误导后面的边界判断

现在就该做什么：

- 把模板默认品牌、默认标题、默认描述列成清理项

现在先别做什么：

- 不要把模板残留问题拖到结构改造阶段再处理

## 4. 从 `ixartz/Next-js-Boilerplate` 现在最值得落地的点

## 借鉴点 A：把已有检查重新分组

当前项目落点：

- [quality-guardrail-gap-table.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/archive/guides/reference-program/quality-guardrail-gap-table.md)
- [package.json](/Users/Data/Warehouse/Pipe/tianze-website/package.json)

现在为什么值得做：

- 当前不是检查少，而是检查很多但不够一眼看懂

现在就该做什么：

- 把已有检查分成：
  - 类型与静态正确性
  - 内容与翻译一致性
  - 运行时合同
  - Cloudflare 页面级信号
  - Cloudflare 最终部署证明
  - 安全与仓库卫生

现在先别做什么：

- 不要为了“更完整”继续引入新工具

## 借鉴点 B：明确哪些必须一直保留

当前项目落点：

- `release-proof`
- `validate:translations`
- locale / lead / cache / release smoke

现在为什么值得做：

- 以后多站点时，最怕的是为了提速把关键护栏默默降级

现在就该做什么：

- 把“不能降级”的几条底线单独写出来

现在先别做什么：

- 不要把现有重型证明误判成“以后都太贵所以可以删”

## 借鉴点 C：把未来多站点验证视角补进去

当前项目落点：

- [multi-site-proof-requirements-draft.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/archive/guides/reference-program/multi-site-proof-requirements-draft.md)

现在为什么值得做：

- 现在的检查主要还是单站视角

现在就该做什么：

- 先在文档层补“共享底座证明”和“站点身份证明”的区分

现在先别做什么：

- 不要先改 CI 或脚本，先把规则定清楚

## 5. 从 `vercel/next-forge` 现在最值得落地的点

## 借鉴点 A：边界先写清楚

当前项目落点：

- [shared-truth-vs-tianze-business-truth-inventory.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/archive/guides/reference-program/shared-truth-vs-tianze-business-truth-inventory.md)
- [site-difference-candidate-list.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/archive/guides/reference-program/site-difference-candidate-list.md)

现在为什么值得做：

- `next-forge` 最有价值的不是壳层，而是边界意识

现在就该做什么：

- 后续讨论改动时，先判断它是在改共享层，还是在改站点身份层

现在先别做什么：

- 不要现在就拆成 `apps/* + packages/*`

## 借鉴点 B：横切能力按主题归类

当前项目落点：

- i18n
- SEO
- 安全
- Cloudflare 平台适配
- 内容加载
- 质量证明

现在为什么值得做：

- 当前横切能力已经有了，但还没被清楚看成“一组一组的系统”

现在就该做什么：

- 先列一份横切能力清单
- 让后来的人知道这些系统分别是什么、归谁看

现在先别做什么：

- 不要为了归类而重做整个代码组织

## 借鉴点 C：升级结构的条件先写死

当前项目落点：

- [future-upgrade-window-rules.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/archive/guides/supplemental/future-upgrade-window-rules.md)

现在为什么值得做：

- 这样以后不会反复凭感觉讨论“要不要上更重结构”

现在就该做什么：

- 把这份规则作为以后讨论结构升级的默认前置条件

现在先别做什么：

- 不要把“已经写了规则”误当成“现在就要升级”

## 现在最该先落地的 8 件事

如果只看现在最值的一批，建议按这个顺序：

1. 收紧站点身份入口，减少品牌、联系、默认 SEO 的分散。
2. 把 i18n 真相入口和消息真相入口写得更直白。
3. 清模板残留，避免错误默认值继续污染判断。
4. 把内容资产和 SEO 资产分开看，别再混着讨论。
5. 增加一页 Cloudflare 问题归类说明。
6. 把 Cloudflare 脚本按职责重新说明。
7. 把已有质量护栏重新分组，并写明哪些不能降级。
8. 把横切能力清单写出来，先建立边界意识。

## 这 8 件事的共同特点

它们都满足两个条件：

- 现在就能做
- 不需要先做结构拆分

这也是当前最重要的原则。

## 当前明确先别做的事

- 先别拆目录
- 先别上完整多应用壳层
- 先别引入更多重型工具
- 先别用“未来多站点”当理由，把当前页面和部署体系一起推翻

## 最后一句判断

这份清单真正想固定下来的原则是：

**现在先让当前项目更清楚、更稳、更像一个能承接多个站点的底座；结构拆分这件事，后面再说。**

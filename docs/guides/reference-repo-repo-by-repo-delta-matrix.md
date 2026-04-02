# 当前项目 vs 5 个参考仓库逐仓对比矩阵

## 文档目的

这份文档补的是最具体的那一层。

它不再只说“这 5 个仓库分别看什么方向”，而是直接回答：

- 当前项目和每个仓库相比，差异到底落在哪
- 哪些现在值得引入
- 哪些应该先延后
- 为什么不是所有“看起来高级”的东西都要搬

适用场景：

- 以后讨论“要不要学某个仓库”时，先看这份
- 以后给 Claude / Codex 派任务时，先看这份决定参考对象

## 一句话结论

对当前项目来说，最值得立刻学习的不是“完整架构”，而是：

- 从 `nextjs-starter` 学更清楚的单站整理
- 从 `opennextjs-cloudflare` 学更稳定的 Cloudflare 判断边界
- 从 `tailwind-nextjs-starter-blog` 学内容和 SEO 资产意识
- 从 `Next-js-Boilerplate` 学质量门槛分层
- 从 `next-forge` 学未来边界，但先别学它的重量

简单说：

**现在先学做法，不先学重量。**

## 1. 当前项目 vs `weijunext/nextjs-starter`

## 当前项目现状

当前项目已经有：

- 双语路由
- 站点配置
- 内容清单
- SEO 元数据

但这些东西还没有像它那样更轻、更集中。

当前项目里，站点事实仍然分散在多处，例如：

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [site-facts.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/site-facts.ts)
- [navigation.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/navigation.ts)
- [product-catalog.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/constants/product-catalog.ts)

而 `nextjs-starter` 的做法更偏向：

- 一个轻量的站点配置入口
- 一个更直观的 `[locale]` 页面层
- 更明确的 i18n 路由和消息加载入口

可参考文件：

- [`config/site.ts`]( /tmp/tianze-reference-repos/nextjs-starter/config/site.ts )
- [`i18n/routing.ts`]( /tmp/tianze-reference-repos/nextjs-starter/i18n/routing.ts )
- [`i18n/request.ts`]( /tmp/tianze-reference-repos/nextjs-starter/i18n/request.ts )
- [`app/[locale]/layout.tsx`]( /tmp/tianze-reference-repos/nextjs-starter/app/[locale]/layout.tsx )

## 具体差异

### 当前项目更强的地方

- 发布证明更重
- Cloudflare 适配意识更强
- 运行时和部署边界更谨慎

### 当前项目更弱的地方

- 站点身份相关信息还不够集中
- 单站层面的“业务真相”还没有压到最少入口
- i18n、内容、站点事实之间的关系还不够一眼看懂

## 现在值得引入什么

- 更清楚的“站点基础信息集中配置”习惯
- 更明确的 i18n 入口说明
- 更少的“页面里暗藏业务真相”

## 现在先别引入什么

- 不要照着它重排整个目录
- 不要为了学它而削弱当前更重的验证体系
- 不要把它当成质量基线

## 最适合转成的动作

1. 把当前项目的站点身份文件清单单独列出来
2. 把 i18n 真相入口和消息真相入口写得更直白
3. 盘清楚哪些页面还在偷偷承担站点事实

## 2. 当前项目 vs `opennextjs/opennextjs-cloudflare`

## 当前项目现状

当前项目其实已经比很多普通项目更重视 Cloudflare 边界。

你现在已经有：

- `build:cf`
- `preview:cf`
- `smoke:cf:preview`
- `smoke:cf:deploy`

并且已经有清楚的证明边界文档，例如：

- [QUALITY-PROOF-LEVELS.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [CANONICAL-TRUTH-REGISTRY.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CANONICAL-TRUTH-REGISTRY.md)

而 `opennextjs-cloudflare` 提供的是：

- 更标准的适配层视角
- 更清楚的“这属于平台层，不属于业务层”的判断基线

## 具体差异

### 当前项目更强的地方

- 证明分层已经更细
- 对本地预览边界和最终部署边界区分更清楚
- 已经积累了很多仓库级经验

### 当前项目更弱的地方

- Cloudflare 链路虽然强，但理解成本高
- 本地脚本很多，后来的人不容易一眼看懂各自职责
- “哪些是平台适配问题”还可以再明确写进对比材料

## 现在值得引入什么

- 更明确的“适配层问题 vs 业务问题”归类方式
- 对标准入口和示例结构的持续对照
- 用它来做 Cloudflare 升级时的外部参照，不要只看本仓库历史经验

## 现在先别引入什么

- 不要用官方示例替换你现有更严格的证明面
- 不要把它的轻示例当成当前仓库的完整真相
- 不要因为它更短，就回退当前 smoke 分层

## 最适合转成的动作

1. 增补一页“Cloudflare 问题归类说明”
2. 把现有 Cloudflare 脚本再按职责分组描述
3. 升级 OpenNext / Next 时，默认增加一轮对照检查

## 3. 当前项目 vs `vercel/next-forge`

## 当前项目现状

当前项目和 `next-forge` 最大的差别，不是“能力少”，而是“边界层级不同”。

当前项目更像：

- 一个高标准单站
- 带比较重的部署和验证链路

而 `next-forge` 更像：

- 一个完整多应用底座
- 每类横切能力都已经被拆到共享包

可参考文件：

- [`README.md`]( /tmp/tianze-reference-repos/next-forge/README.md )
- [`apps/web/env.ts`]( /tmp/tianze-reference-repos/next-forge/apps/web/env.ts )
- [`packages/internationalization/index.ts`]( /tmp/tianze-reference-repos/next-forge/packages/internationalization/index.ts )
- [`packages/seo/metadata.ts`]( /tmp/tianze-reference-repos/next-forge/packages/seo/metadata.ts )
- [`packages/security/index.ts`]( /tmp/tianze-reference-repos/next-forge/packages/security/index.ts )
- [`packages/observability/instrumentation.ts`]( /tmp/tianze-reference-repos/next-forge/packages/observability/instrumentation.ts )

## 具体差异

### 当前项目更强的地方

- 更贴近你现在真实业务
- 没有被一堆 SaaS 依赖绑住
- Cloudflare 这条线考虑更深

### 当前项目更弱的地方

- 横切能力还没有被抽成清楚层次
- 业务真相和共享真相距离还不够远
- 未来是否升级到多应用，还缺明确窗口规则

## 现在值得引入什么

- 边界意识
- 共享能力按主题归类的思路
- 未来升级条件的明确规则

## 现在先别引入什么

- 不要现在拆成 `apps/* + packages/*`
- 不要现在引入整套 observability / auth / payments / cms 重量
- 不要把“未来参考图”误当成“当前应该照做”

## 最适合转成的动作

1. 先列一份“横切能力清单”
2. 先标出哪些属于共享层候选
3. 先写清楚未来升级窗口规则

## 4. 当前项目 vs `timlrx/tailwind-nextjs-starter-blog`

## 当前项目现状

当前项目已经有内容清单和生成逻辑，例如：

- [content-manifest.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/content-manifest.ts)
- [content-manifest.generated.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/content-manifest.generated.ts)
- [mdx-loader.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/mdx-loader.ts)

但内容层现在更像“支持业务页面的内容系统”，还没有完全被当成独立资产体系来管理。

而 `tailwind-nextjs-starter-blog` 更擅长的是：

- 把站点元信息集中收口
- 把内容模型、文章元数据、SEO 资产关系讲清楚

可参考文件：

- [`data/siteMetadata.js`]( /tmp/tianze-reference-repos/tailwind-nextjs-starter-blog/data/siteMetadata.js )
- [`app/blog/[...slug]/page.tsx`]( /tmp/tianze-reference-repos/tailwind-nextjs-starter-blog/app/blog/[...slug]/page.tsx )

## 具体差异

### 当前项目更强的地方

- 更贴近产品和业务
- 双语和平台验证考虑更多

### 当前项目更弱的地方

- 内容资产类型还没有被系统盘点
- 站点元信息、SEO 资产、内容资产之间的边界还可以更清楚
- 内容不是零碎文本这件事，还没有被写成更硬的规则

## 现在值得引入什么

- 内容资产盘点
- SEO 资产和内容资产对应关系
- 更清楚的站点元信息整理方式

## 现在先别引入什么

- 不要把博客模板思路强套到官网
- 不要把整套内容工具链照搬进来
- 不要为了内容系统牺牲当前业务页面模型

## 最适合转成的动作

1. 先做内容资产盘点
2. 再做 SEO 资产盘点
3. 再写一份“内容不是页面文案”的规则说明

## 5. 当前项目 vs `ixartz/Next-js-Boilerplate`

## 当前项目现状

当前项目已经有很重的脚本和质量门槛，这不是弱项。

例如现在已经有：

- 各类质量门槛脚本
- 多类测试入口
- 翻译和内容校验
- 发布和 Cloudflare 证明分层

但和 `Next-js-Boilerplate` 相比，你现在更需要的不是“再加更多工具”，而是：

- 把现有护栏重新分组
- 让后来的人更容易理解每条护栏在防什么

可参考文件：

- [`src/libs/Env.ts`]( /tmp/tianze-reference-repos/Next-js-Boilerplate/src/libs/Env.ts )
- [`src/utils/AppConfig.ts`]( /tmp/tianze-reference-repos/Next-js-Boilerplate/src/utils/AppConfig.ts )
- [`README.md`]( /tmp/tianze-reference-repos/Next-js-Boilerplate/README.md )

## 具体差异

### 当前项目更强的地方

- Cloudflare 证明边界更深
- 仓库级经验文档更贴近真实问题
- 发布证明更谨慎

### 当前项目更弱的地方

- 现有门槛虽然多，但用途分层还可以更清楚
- 未来多站点下，这些门槛如何继续适用，还没整理成表
- 有些脚本对新维护者来说理解成本较高

## 现在值得引入什么

- 更明确的环境和配置收口习惯
- 质量门槛重新按用途分组的做法
- 把“默认动作”写得更清楚

## 现在先别引入什么

- 不要整套复制它的重型工具箱
- 不要把更多工具数量当成质量升级
- 不要为了补工具破坏当前仓库自己的证明边界

## 最适合转成的动作

1. 做一份质量护栏查漏补缺表
2. 标明每类检查在防什么
3. 标明以后多站点下是否仍适用

## 最终建议矩阵

| 参考仓库 | 当前最该学的 | 当前先别学的 | 对当前项目最值的落地方向 |
| --- | --- | --- | --- |
| `nextjs-starter` | 单站整理、配置收口、i18n 入口清楚 | 轻量模板当质量基线 | 共享真相 vs 业务真相清单 |
| `opennextjs-cloudflare` | 平台边界、验证分层、适配层归类 | 用官方示例替换现有证明面 | Cloudflare 问题归类和脚本职责说明 |
| `next-forge` | 共享边界意识、未来升级窗口 | 现在就拆多应用 | 横切能力清单 + 升级窗口规则 |
| `tailwind-nextjs-starter-blog` | 内容资产和 SEO 资产意识 | 博客模板整体照搬 | 内容资产盘点 + SEO 资产盘点 |
| `Next-js-Boilerplate` | 质量门槛分组、配置收口 | 工具整套复制 | 质量护栏查漏补缺表 |

## 如果现在只做 3 件事

如果只看当前最值的 3 件事，我建议是：

1. 共享真相 vs 业务真相清单
2. 内容资产盘点
3. 质量护栏查漏补缺表

因为这 3 件事：

- 不需要重构
- 能直接提升后续判断质量
- 对以后多站点、内容扩展、发布证明都更有帮助

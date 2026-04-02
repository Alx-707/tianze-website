# 当前仓库的共享真相 vs Tianze 业务真相清单

## 文档目的

这份文档回答一个很具体的问题：

当前仓库里，哪些东西属于共享底座，哪些东西已经是 Tianze 的业务事实，哪些地方又是两者混在一起的。

这份清单的作用不是马上开始重构，而是：

- 以后讨论多站点时，不再凭感觉判断
- 以后给 Claude / Codex 派任务时，能先知道该看哪一层
- 以后真的开始第一阶段时，知道最该先动哪里

## 一句话结论

当前仓库已经有一套不差的共享底座，但 **Tianze 的业务真相仍然分散在配置、消息、产品目录、页面文案和研究资料里**。

最值得先记住的是：

- 共享底座已经存在
- 但业务真相还没有被压到少数入口
- 其中最混杂的区域是：站点配置、站点事实、导航/页脚、SEO 默认文案、产品目录、消息文件

简单说：

**现在最大的问题不是没有共享层，而是业务真相还散。**

## 分类规则

为避免以后继续混淆，这里把内容分成 3 类：

### 1. 共享真相

面向未来所有站点都应该尽量复用的底座能力。

### 2. Tianze 业务真相

明确属于 Tianze 当前品牌、产品、公司事实、市场、内容语境的部分。

### 3. 混合区

表面上像共享层，但里面已经带了 Tianze 的业务默认值。

这类文件以后最容易成为第一批抽离候选。

## A. 当前已经比较清楚的共享真相

这些内容目前更像共享底座，未来多站点大概率也应该继续共享。

## 1. 运行时和环境底座

- [env.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/env.ts)
- [QUALITY-PROOF-LEVELS.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [CANONICAL-TRUTH-REGISTRY.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CANONICAL-TRUTH-REGISTRY.md)

为什么属于共享真相：

- 它们描述的是环境变量规则、证明分层和仓库级真相源
- 这些规则本身不依赖 Tianze 的品牌身份

需要注意的点：

- 这里虽然是共享层，但以后如果多站点真的开始推进，仍然需要补“站点级验证”和“共享级验证”的区别

## 2. 内容清单和内容加载底座

- [content-manifest.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/content-manifest.ts)
- [content-manifest.generated.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/content-manifest.generated.ts)
- [mdx-loader.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/mdx-loader.ts)

为什么属于共享真相：

- 这些文件描述的是内容系统怎么加载、怎么索引
- 它们更像内容引擎，而不是 Tianze 品牌本身

需要注意的点：

- 引擎是共享的，但它加载的内容本身未必共享

## 3. 页面和组件骨架

- [page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/page.tsx)
- [contact/page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/contact/page.tsx)
- [Footer.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/components/footer/Footer.tsx)
- [vercel-navigation.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/components/layout/vercel-navigation.tsx)

为什么属于共享真相：

- 页面骨架和组件组合方式本身可以被复用
- 它们代表的是布局和交互能力，不一定代表 Tianze 业务身份

需要注意的点：

- 这些骨架里消费的数据，很多已经是 Tianze 业务真相
- 所以它们是共享骨架，但不是完全纯净的共享层

## B. 明确属于 Tianze 的业务真相

这些内容就是 Tianze 当前业务的真实身份。以后如果要做第二个站，这些不应该继续默默藏在共享层里。

## 1. 品牌、公司与联系事实

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [site-facts.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/site-facts.ts)
- [company-facts.yaml](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/company/company-facts.yaml)

这里面包含了什么：

- Tianze 名称
- Tianze 品牌描述
- Tianze 联系方式
- Lianyungang / Guanyun / Jiangsu 等公司地点信息
- ISO 9001 信息
- 出口国家和公司规模

为什么属于业务真相：

- 这些不是通用能力，是 Tianze 当下的公司身份
- 换第二个业务站后，大概率会变化

## 2. Tianze 产品与市场结构

- [product-catalog.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/constants/product-catalog.ts)
- [products.yaml](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/company/products.yaml)

这里面包含了什么：

- North America / Australia-New Zealand / Mexico / Europe / Pneumatic Tube 等市场分组
- Schedule 40 / Schedule 80 / PETG 等产品和标准语境
- Tianze 当前产品树和产品策略

为什么属于业务真相：

- 这是 Tianze 当前卖什么、按什么市场卖、按什么标准讲的真实业务结构
- 这类内容未来极可能按站点分化

## 3. Tianze 品牌文案与 SEO 语境

- [en/critical.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/en/critical.json)
- [zh/critical.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/zh/critical.json)
- [en/deferred.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/en/deferred.json)
- [zh/deferred.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/zh/deferred.json)

这里面包含了什么：

- Tianze 品牌名
- Tianze 公司描述
- 产品卖点
- 市场和标准叙事
- SEO 标题、描述、关键词
- 页脚版权和位置

为什么属于业务真相：

- 这些内容已经不是“可复用的语言框架”，而是 Tianze 当前品牌表达
- 换第二个业务站后，很多 key 的值都会变化

## 4. Tianze 专属业务研究和产品语义资料

- [value-copy.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/company/value-copy.md)
- [products.yaml](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/company/products.yaml)
- [ring2/09-multilingual-architecture.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/strategy/ring2/09-multilingual-architecture.md)
- [ring4-implementation-handoff.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/strategy/ring4-implementation-handoff.md)

为什么属于业务真相：

- 这些资料本质上是围绕 Tianze 当前业务模型沉淀出来的内容语义和结构判断
- 它们很有价值，但不是共享底座

## C. 当前最需要警惕的混合区

这些地方最重要，因为它们表面上像“共享层”，其实已经夹带了 Tianze 业务默认值。

## 1. 站点配置层

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)

为什么是混合区：

- 它承担了通用站点配置接口
- 但实际内容已经完全是 Tianze 的品牌、社媒、联系信息和 SEO 默认值

后续意义：

- 这是未来第一批最适合抽离的区域之一

## 2. 站点事实层

- [site-facts.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/site-facts.ts)

为什么是混合区：

- 文件名看起来像通用站点事实接口
- 但里面装的是 Tianze 当前公司事实

后续意义：

- 这类内容未来不应该继续默认住在共享配置层附近

## 3. 导航和页脚

- [navigation.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/navigation.ts)
- [footer-links.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/footer-links.ts)

为什么是混合区：

- 它们看起来是共享组件依赖的通用数据
- 但导航结构和社媒链接已经是 Tianze 当前业务选择

后续意义：

- 未来如果第二个业务站内容结构不同，这里很容易先分化

## 4. SEO 元数据层

- [seo-metadata.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/seo-metadata.ts)

为什么是混合区：

- 它本身是共享 SEO 生成器
- 但它直接依赖 Tianze 的 `SITE_CONFIG`、`siteFacts` 和 Tianze 当前消息内容

后续意义：

- SEO 引擎可以共享
- SEO 默认值、插值数据和业务文案不应该一直绑死在一起

## 5. 联系页和 FAQ 语境

- [contact/page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/contact/page.tsx)

为什么是混合区：

- 页面骨架本身是共享能力
- 但当前 FAQ、联系语境、公司事实插值都已经强绑定 Tianze 的业务事实

后续意义：

- 未来如果不同业务站询盘对象和 FAQ 完全不同，这里会成为明显分化点

## D. 现在就暴露出来的 3 个具体问题

## 1. 消息文件里已经混着大量 Tianze 品牌和产品真相

这不是坏事，但要明确：

- 当前消息文件并不只是“翻译层”
- 它们已经承载了不少 Tianze 的品牌和产品事实

这意味着以后讨论多站点时，消息文件不能只当成翻译资产看，还要当作业务资产看。

## 2. 产品目录已经不是“中性演示数据”，而是 Tianze 当前产品结构本身

`product-catalog.ts` 现在已经很接近业务真相源。

这意味着以后第二个站如果产品结构不同，这里一定会进入第一批变化区域。

## 3. `content/config/content.json` 还保留着模板级默认值

- [content.json](/Users/Data/Warehouse/Pipe/tianze-website/content/config/content.json)

这里仍然写着：

- `B2B Web Template`
- 通用模板 SEO 标题和描述

这类内容很容易误导后来的人，以为这是当前业务真相的一部分。

这不是眼前就会爆炸的问题，但属于典型的“现在不整理，以后容易继续踩坑”的地方。

## E. 当前最值得先收口的 5 个区域

如果现在只看“以后多站点最容易先拉扯”的地方，我建议先记住这 5 类：

1. 站点配置
2. 站点事实
3. 导航和页脚
4. SEO 默认文案
5. 产品目录

为什么是这 5 类：

- 它们最像站点身份
- 它们变动时最容易牵一发动全身
- 它们也是以后最适合优先抽离的一批

## F. 这份清单对后续工作的直接意义

以后如果继续推进多站点准备，默认应该按这份清单来判断：

- 先别问“这个文件是不是共享层”
- 先问“这里面装的是共享能力，还是 Tianze 业务真相”

如果里面装的是 Tianze 的品牌、公司、产品、市场、SEO 叙事，那它就不应该再被当成纯共享层。

## 最终判断

如果只用一句话总结这份盘点：

**当前仓库真正该先认清的，不是有没有共享层，而是 Tianze 的业务真相已经分散到了多少看起来像共享层的地方。**

这一步做完的价值，不是马上重构，而是以后少误判。

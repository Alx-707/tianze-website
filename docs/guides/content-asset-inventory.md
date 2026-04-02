# 当前仓库内容资产盘点

## 文档目的

这份文档的目标不是列页面，而是列“内容资产类型”。

也就是说，它要回答的是：

- 当前仓库里到底有哪些内容资产
- 哪些已经比较结构化
- 哪些还散在页面或配置里
- 哪些以后最容易按站点分开

## 一句话结论

当前仓库已经不是“页面上写点文案”的状态了，而是已经有一套内容资产，只是这套资产还没有被完整地当成一个系统来管理。

现在最值得记住的是：

- 运行时文案资产已经不少
- 结构化业务内容也已经出现
- 研究资料和最终对外内容还混在同一个大内容世界里
- SEO 资产分散在消息、配置、MDX frontmatter 和元数据生成器里

简单说：

**内容已经是资产了，只是还没有被完全按资产思路整理。**

## 分类方式

这里把当前内容资产分成 6 类。

## 1. 运行时消息资产

当前位置：

- [critical.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/en/critical.json)
- [critical.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/zh/critical.json)
- [deferred.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/en/deferred.json)
- [deferred.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/zh/deferred.json)
- [en.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/en.json)
- [zh.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/zh.json)
- [load-messages.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/load-messages.ts)

它是什么：

- 页面运行时直接消费的文案
- 导航、页脚、首页区块、联系页、FAQ、错误提示等都在这里

当前状态：

- 已经结构化
- 已经有拆分加载逻辑
- 但内容里混着大量 Tianze 品牌和产品事实

以后多站点的意义：

- 这类资产既是翻译资产，也是业务资产
- 未来如果站点差异扩大，这里会成为第一批分化区域

## 2. MDX 页面内容资产

当前位置：

- [about.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/about.mdx)
- [privacy.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/privacy.mdx)
- [terms.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/terms.mdx)
- [about.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/zh/about.mdx)
- [privacy.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/zh/privacy.mdx)
- [terms.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/zh/terms.mdx)

它是什么：

- 通过 MDX 承载的静态页面内容
- 带 frontmatter，也就是自带标题、描述、SEO 字段等元信息

当前状态：

- 形式上结构化
- 但其中仍残留模板默认内容，例如 `B2B Web Template`

以后多站点的意义：

- 法务页、关于页、品牌介绍页大概率会按站点分开
- 这些内容以后不适合继续混着模板残留

## 3. 内容型文章和资源资产

当前位置：

- [welcome.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/posts/en/welcome.mdx)
- [welcome.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/posts/zh/welcome.mdx)
- [content-manifest.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/content-manifest.ts)
- [content-manifest.generated.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/content-manifest.generated.ts)
- [mdx-loader.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/mdx-loader.ts)

它是什么：

- 通过内容清单和 MDX 加载底座管理的文章型内容

当前状态：

- 引擎层已经比较清楚
- 但实际内容体量还不大
- 内容战略层资料和真正上线内容之间还没有清楚分仓

以后多站点的意义：

- 这是最适合扩成案例、行业页、知识库、博客体系的资产层
- 多站点以后，这类资产很可能会同时出现“共享内容”和“站点独占内容”

## 4. 结构化业务事实资产

当前位置：

- [company-facts.yaml](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/company/company-facts.yaml)
- [products.yaml](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/company/products.yaml)
- [value-copy.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/company/value-copy.md)
- [proof-points.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/shared/proof-points.md)

它是什么：

- 公司事实
- 产品结构
- 品牌价值表达
- 共享证明点

当前状态：

- 已经开始出现“结构化业务内容”的形态
- 但这层内容还没有被明确标记成“未来站点身份资产”

以后多站点的意义：

- 这是以后最值得拆成“站点内容包”的候选层
- 因为它们直接决定每个站点讲什么、卖什么、证明什么

## 5. 研究资料与内容过程资产

当前位置：

- [PROJECT-BRIEF.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/PROJECT-BRIEF.md)
- [README.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/README.md)
- [customers.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/company/customers.md)
- [content-gaps.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/company/content-gaps.md)
- [findings.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/homepage/findings.md)
- [v5-final.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/homepage/v5-final.md)
- [v1-final.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/content/faq/v1-final.md)

它是什么：

- 内容策划、研究、草稿、过程记录
- 并不一定直接上线，但会影响上线内容

当前状态：

- 已经很丰富
- 但和最终上线内容之间的边界不够硬

以后多站点的意义：

- 这层资料非常有价值
- 但以后要避免把“研究资料”误当成“站点运行时真相”

## 6. SEO 资产

当前位置：

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [seo-metadata.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/seo-metadata.ts)
- [content.json](/Users/Data/Warehouse/Pipe/tianze-website/content/config/content.json)
- [layout-metadata.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/layout-metadata.ts)
- [sitemap.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/app/sitemap.ts)
- [robots.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/app/robots.ts)

它是什么：

- 站点默认标题和描述
- 页面级 metadata 生成
- sitemap / robots
- 内容 frontmatter 里的 SEO 字段

当前状态：

- 已经有生成器
- 但默认值仍分散在多处
- 还混着模板遗留值和 Tianze 当前业务值

以后多站点的意义：

- SEO 引擎可以共享
- 但 SEO 默认值、品牌词、关键词和资源图不能默认共享

## 当前最值得警惕的 4 个问题

## 1. 运行时消息和业务事实已经深度混合

这意味着以后不能只把 `messages/*` 当翻译层看。

## 2. 模板残留还留在正式内容资产里

最明显的是：

- [content.json](/Users/Data/Warehouse/Pipe/tianze-website/content/config/content.json)
- [about.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/about.mdx)

这些内容如果不记下来，后面很容易误导判断。

## 3. 研究资料和运行时内容还没有完全隔离

这会让后来的人不容易一眼看懂：

- 哪些是上线真相
- 哪些是过程草稿
- 哪些是内容策略参考

## 4. SEO 资产没有一个单独的资产视角

现在 SEO 更像分散在各层，而不是被明确看成一类独立资产。

## 哪些已经比较结构化

当前已经比较像“资产系统”的内容包括：

- `messages/{locale}/critical|deferred`
- `content/pages/**`
- `content/posts/**`
- 内容清单和 MDX 加载底座
- `docs/content/company/*.yaml`

## 哪些还比较散

当前还比较散的内容包括：

- 默认 SEO 值
- 页面里的品牌表达
- 联系页 FAQ 和业务承诺
- 模板残留值
- 研究资料与运行时真相之间的边界

## 以后最容易按站点分开的内容

从内容资产角度看，未来最可能先分开的顺序是：

1. 品牌与公司事实内容
2. 产品与市场内容
3. SEO 默认值
4. 消息文件里的品牌表达
5. 关于页、FAQ、资源页

## 对应 5 个参考仓库的意义

- `tailwind-nextjs-starter-blog` 提醒我们：内容和元信息本身就是资产
- `nextjs-starter` 提醒我们：单站层的内容和配置应该更清楚
- `next-forge` 提醒我们：以后要升级结构，也该先知道哪些内容是共享的，哪些不是

## 当前最适合转成的动作

这份盘点现在最适合转成下面 3 个后续动作：

1. 把模板残留列成明确清理清单
2. 把“运行时内容”和“研究资料”边界写清楚
3. 把 SEO 资产单独列成一层，不再散着讨论

# 未来站点差异候选清单

## 文档目的

这份文档接在“共享真相 vs Tianze 业务真相清单”之后，专门回答一个更进一步的问题：

**如果以后真的要接第二个、第三个业务站，哪些内容最可能先分开。**

它的作用不是现在就拆文件，而是：

- 先把未来最容易分化的区域点出来
- 先判断哪些属于“高优先级差异”，哪些只是“以后可能会变”
- 以后真要做多站点时，不再从零猜

## 一句话结论

未来最可能最先分开的，不是页面骨架，也不是通用组件，而是下面这几类东西：

- 品牌与公司身份
- 联系方式与社媒
- 产品目录和市场结构
- 导航、页脚和资源入口
- 默认 SEO 文案
- 消息文件里的品牌表达
- 内容资产

简单说：

**真正先分开的，通常不是“代码能力”，而是“站点身份”。**

## 当前执行锁定

当前这份清单服务于：

- 单站高标准基线治理
- 未来类似项目的二次开发替换

它现在不是多站点 runtime 施工清单。

## 判断规则

这里把候选差异分成 3 档：

### A 档：高概率最先分开

只要第二个业务站真实存在，这类内容大概率就会变化。

### B 档：中概率随后分开

短期可能还能共用，但随着内容和定位差异扩大，很容易开始拉扯。

### C 档：低概率或后期才分开

现在先不用急着动，除非未来站点形态已经明显不同。

## A 档：高概率最先分开的内容

## 1. 品牌名称、品牌描述、公司事实

当前位置：

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [site-facts.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/site-facts.ts)
- [company-facts.yaml](/Users/Data/Warehouse/Pipe/tianze-website/docs/cwf/context/company/company-facts.yaml)

为什么最先分开：

- 第二个业务站很可能不是同一个品牌名
- 公司介绍、成立年份、人数、所在地、证书表述都可能不同
- 这些内容现在已经不是中性配置，而是 Tianze 当前身份

现在建议怎么记：

- 默认把这类内容看成“未来站点身份包”的核心部分
- 后续不要再把更多业务事实继续塞进通用配置附近

主参考仓库：

- `weijunext/nextjs-starter`
- `vercel/next-forge`

## 对未来二次开发最直接的含义

这份清单里的 A 档内容，应默认视为未来 derivative project 第一波替换面。

配套执行顺序见：

- [DERIVATIVE-PROJECT-REPLACEMENT-CHECKLIST.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/DERIVATIVE-PROJECT-REPLACEMENT-CHECKLIST.md)

## 2. 联系方式与社媒链接

当前位置：

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [footer-links.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/footer-links.ts)
- [critical.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/en/critical.json)
- [critical.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/zh/critical.json)

为什么最先分开：

- 电话、邮箱、聊天渠道、社媒账号通常直接跟业务主体绑定
- 不同业务站可能对应不同销售入口和联系人

现在建议怎么记：

- 不再把它当成“顺手写在配置里的小信息”
- 以后它应该跟品牌身份一起移动，而不是散在页脚和消息文件里

主参考仓库：

- `weijunext/nextjs-starter`

## 3. 产品目录与市场结构

当前位置：

- [product-catalog.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/constants/product-catalog.ts)
- [products.yaml](/Users/Data/Warehouse/Pipe/tianze-website/docs/cwf/context/company/products.yaml)
- [products/page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/products/page.tsx)
- [page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/products/[market]/page.tsx)

为什么最先分开：

- 第二个业务站如果产品树不同，这里一定会先变
- 市场分组、标准语境、产品分类、主打页入口都不是共享底座

现在建议怎么记：

- 把它视为“未来站点差异里最硬的一块”
- 后续任何新增产品页或市场页，都要先判断是在补共享能力，还是在继续加深 Tianze 专属结构

主参考仓库：

- `weijunext/nextjs-starter`
- `timlrx/tailwind-nextjs-starter-blog`

## 4. 默认 SEO 文案与站点元信息

当前位置：

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [single-site-seo.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/single-site-seo.ts)
- [seo-metadata.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/seo-metadata.ts)
- [content.json](/Users/Data/Warehouse/Pipe/tianze-website/content/config/content.json)

为什么最先分开：

- 站点标题、描述、关键词、OG 图、品牌词都直接决定站点对外怎么被理解
- 不同业务站即使共用页面骨架，也很少共用完全相同的 SEO 默认值

现在建议怎么记：

- SEO 引擎可以共享
- SEO 默认值、品牌词、关键词不能继续默认绑死
- sitemap / robots / public static page SEO 输入当前以 `src/config/single-site-seo.ts` 为 canonical authoring seam
- 还要顺手清掉历史模板痕迹，避免以后把旧模板文案误当成业务真相

主参考仓库：

- `timlrx/tailwind-nextjs-starter-blog`
- `vercel/next-forge`

## 5. 消息文件里的品牌表达

当前位置：

- [critical.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/en/critical.json)
- [critical.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/zh/critical.json)
- [deferred.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/en/deferred.json)
- [deferred.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/zh/deferred.json)
- [en.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/en.json)
- [zh.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/zh.json)

为什么最先分开：

- 这些文件里已经不只是语言 key，而是带着大量 Tianze 当前产品、卖点、市场和 FAQ 语境
- 未来多站点时，消息文件会同时承担“翻译资产”和“业务资产”

现在建议怎么记：

- 以后不要再把消息文件只看成翻译层
- 新增品牌语义时，要有意识地区分“语言框架”与“业务表达”

主参考仓库：

- `weijunext/nextjs-starter`
- `timlrx/tailwind-nextjs-starter-blog`

## B 档：中概率随后分开的内容

## 6. 导航、页脚、资源入口

当前位置：

- [navigation.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/navigation.ts)
- [footer-links.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/footer-links.ts)
- [Footer.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/components/footer/Footer.tsx)

为什么会随后分开：

- 如果未来各站都还是相近的营销站，短期可能还能共用
- 但只要某个站的页面结构、资源入口、CTA 路径不同，导航和页脚就会先开始分化

现在建议怎么记：

- 把它当成“站点身份的表现层”，不是纯通用层
- 后续新增导航项时，顺手判断它是不是所有未来站点都合理

主参考仓库：

- `weijunext/nextjs-starter`

## 7. 联系页 FAQ、询盘语境、转化承诺

当前位置：

- [contact/page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/contact/page.tsx)
- [contact-page-shell.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/contact/contact-page-shell.tsx)
- [single-site-page-expression.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/single-site-page-expression.ts)
- [deferred.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/en/deferred.json)
- [deferred.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/zh/deferred.json)

为什么会随后分开：

- 表单骨架和提交流程可能继续共享
- 但 FAQ、承诺、样品策略、MOQ、交期、工厂位置这些内容通常会跟业务线绑定

现在建议怎么记：

- 联系页要分开看“流程能力”和“业务语境”
- 后续讨论多站点时，联系页不能只看成一个共享表单
- 当前 contact fallback copy、FAQ 选择、部分 CTA 目标，以及 bending-machines 的展示映射，当前以 `src/config/single-site-page-expression.ts` 为 canonical authoring seam
- 但 `MERGED_MESSAGES`、`SPECS_BY_MARKET`、heading parser / slugify / JSON-LD 这类实现细节，故意留在页面或 helper 层，不作为第一波替换面

主参考仓库：

- `weijunext/nextjs-starter`
- `Next-js-Boilerplate`

## 8. 内容页与资源库

当前位置：

- [about.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/about.mdx)
- [privacy.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/privacy.mdx)
- [terms.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/terms.mdx)
- [welcome.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/posts/en/welcome.mdx)
- [README.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/cwf/context/company/README.md)

为什么会随后分开：

- 只要第二个站的内容策略不一样，内容页和资源库会很快分化
- 现在还没全面分开，是因为当前仓库主要还是单站语境

现在建议怎么记：

- 把内容当资产管理，而不是当页面附属文案
- 以后扩站时，先决定哪些内容共享，哪些内容站点独有

主参考仓库：

- `timlrx/tailwind-nextjs-starter-blog`

## C 档：低概率或后期才分开的内容

## 9. 主题与视觉 token

当前位置：

- [footer-links.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/footer-links.ts)
- [globals.css](/Users/Data/Warehouse/Pipe/tianze-website/src/app/globals.css)

为什么暂时放后面：

- 视觉风格当然会变，但在当前阶段还没有证据证明第二个业务站会立刻需要完全不同的设计系统
- 现在更重要的是把品牌、内容和产品差异先看清楚

现在建议怎么记：

- 先承认它未来可能会分化
- 但当前不要为了“也许以后会变”就提前重做主题架构

主参考仓库：

- `vercel/next-forge`

## 10. 页面骨架和通用组件组合方式

当前位置：

- [layout.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/layout.tsx)
- [page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/page.tsx)
- [vercel-navigation.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/components/layout/vercel-navigation.tsx)

为什么暂时放后面：

- 当前还没有明确证据表明未来站点会完全换骨架
- 相比之下，站点身份层的分化会早得多

现在建议怎么记：

- 骨架默认先看成共享层
- 只有当站点结构持续明显分化时，再讨论是否升级到完整多应用壳层

主参考仓库：

- `vercel/next-forge`

## 当前最值得记住的顺序

以后如果真的开始第一阶段，优先盯住下面这 5 类：

1. 品牌与公司事实
2. 联系方式与社媒
3. 产品目录与市场结构
4. 默认 SEO 文案与元信息
5. 消息文件里的品牌表达

这些才是未来多站点最容易先拉扯的地方。

## 和 5 个参考仓库的关系

这份清单不是单独成立的，它和 5 个参考仓库的分工是对齐的：

- `nextjs-starter` 提醒我们：站点身份应该更集中，别散在页面里
- `tailwind-nextjs-starter-blog` 提醒我们：内容和 SEO 本身就是资产
- `next-forge` 提醒我们：未来要升级结构，也该先从边界判断开始，而不是先上重量

## 当前不建议做的事

- 不要因为已经知道这些差异候选，就现在立刻拆代码
- 不要把所有可能变化的东西都提前抽象出来
- 不要把“将来可能分开”误当成“现在就必须做成多应用”

这份清单现在最重要的价值，是：

**以后讨论时不再凭感觉，先知道哪里最容易先分开。**

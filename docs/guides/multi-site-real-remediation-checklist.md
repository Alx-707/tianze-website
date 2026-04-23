# 多站点真实整改清单

## 文档目的

这份文档不再停留在“要不要准备多站点”。

如果当前重点仍然是“先落地参考仓库借鉴点，不先做结构拆分”，应优先阅读：

- [reference-repo-non-structural-adoption-checklist.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/reference-repo-non-structural-adoption-checklist.md)

它默认接受一个前提：

**第二个、第三个业务网站已经确认会做。**

所以这份文档只回答一件事：

**接下来当前仓库到底先改什么、后改什么、哪些文件最先动、做到什么算过关。**

## 一句话结论

现在最好的做法不是直接把仓库改成 `next-forge` 那种完整多应用结构。

现在最好的做法是：

- 先把当前仓库里的 Tianze 业务真相抽出来
- 先把未来多站点最容易拉扯的内容收口
- 先补“多站点也能继续证明没坏”的验证面
- 再用第二个真实站点验证抽象是否成立

简单说：

**现在正式进入整改阶段，但整改重点是“先收口、先分层、先验证”，不是“先上重量”。**

## 这份清单怎么用

执行顺序按 6 个阶段走。

每个阶段都写清楚：

- 现在为什么要做
- 主要改哪些地方
- 做到什么算完成
- 当前明确先别做什么

## 阶段 0：冻结旧习惯，先别继续加深耦合

## 现在为什么先做它

如果一边讨论多站点，一边继续把更多 Tianze 默认值塞进通用层，后面整改只会越来越贵。

这一步不是重构，而是先止血。

## 现在就该执行的动作

1. 新增品牌、联系信息、产品结构、SEO 默认值时，不要再随手散落到多个“看起来像通用层”的文件里。
2. 新增内容前，先判断它属于：
   - 共享底座
   - Tianze 业务真相
   - 未来站点差异候选
3. 模板残留默认值不再继续沿用。

## 重点盯住的文件

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [site-facts.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/site-facts.ts)
- [footer-links.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/footer-links.ts)
- [content.json](/Users/Data/Warehouse/Pipe/tianze-website/content/config/content.json)

## 完成标准

- 后续新增业务信息不再继续扩散到更多新入口
- 团队默认知道“共享真相”和“业务真相”是两回事

## 现在先别做什么

- 先别改目录结构
- 先别改部署形态

## 阶段 1：先把站点身份层收口

## 现在为什么先做它

这是当前最值的一步。

因为你现在最危险的地方，不是组件复用不够，而是 Tianze 这门业务自己的身份信息已经散在多个地方。

以后第二个站一接，这些地方一定最先拉扯。

## 这一阶段主要要收口的内容

### 1. 品牌和公司事实

主要涉及：

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [site-facts.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/site-facts.ts)
- [company-facts.yaml](/Users/Data/Warehouse/Pipe/tianze-website/docs/cwf/context/company/company-facts.yaml)

### 2. 联系方式和社媒

主要涉及：

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [footer-links.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/footer-links.ts)
- [critical.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/en/critical.json)
- [critical.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/zh/critical.json)

### 3. 产品目录和市场结构

主要涉及：

- [product-catalog.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/constants/product-catalog.ts)
- [products.yaml](/Users/Data/Warehouse/Pipe/tianze-website/docs/cwf/context/company/products.yaml)

### 4. 默认 SEO 值

主要涉及：

- [site-config.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/config/paths/site-config.ts)
- [seo-metadata.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/seo-metadata.ts)
- [content.json](/Users/Data/Warehouse/Pipe/tianze-website/content/config/content.json)

## 这一步真正的目标

不是立刻做出第二个站。

而是先让这些内容能被看成：

- 一组明确的“站点身份输入”
- 而不是继续散在多个通用层附近

## 完成标准

- 品牌、公司事实、联系信息、产品结构、默认 SEO 值，都能被明确列成“站点身份层”
- 后面做第二个站时，不需要重新满仓库找这些入口

## 现在先别做什么

- 先别因为收口，就马上拆成 `apps/* + packages/*`
- 先别在这一阶段就引入复杂可插拔框架

## 阶段 2：把消息和内容资产从“页面附属物”升级成“站点资产”

## 现在为什么先做它

因为未来多站点时，最容易被低估的一件事就是：

**消息文件和内容文件根本不只是文案，它们已经是业务资产。**

## 这一阶段主要要改的地方

### 1. 运行时消息资产

主要涉及：

- [critical.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/en/critical.json)
- [critical.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/zh/critical.json)
- [deferred.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/en/deferred.json)
- [deferred.json](/Users/Data/Warehouse/Pipe/tianze-website/messages/zh/deferred.json)
- [load-messages.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/load-messages.ts)

### 2. MDX 页面内容

主要涉及：

- [about.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/about.mdx)
- [privacy.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/privacy.mdx)
- [terms.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/terms.mdx)
- [about.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/zh/about.mdx)
- [privacy.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/zh/privacy.mdx)
- [terms.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/zh/terms.mdx)

### 3. 结构化业务内容

主要涉及：

- [company-facts.yaml](/Users/Data/Warehouse/Pipe/tianze-website/docs/cwf/context/company/company-facts.yaml)
- [products.yaml](/Users/Data/Warehouse/Pipe/tianze-website/docs/cwf/context/company/products.yaml)
- [value-copy.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/cwf/context/company/value-copy.md)

### 4. 模板残留清理

主要涉及：

- [content.json](/Users/Data/Warehouse/Pipe/tianze-website/content/config/content.json)
- [about.mdx](/Users/Data/Warehouse/Pipe/tianze-website/content/pages/en/about.mdx)

## 这一步真正的目标

- 以后谈内容，不再只谈页面
- 以后谈消息，不再只谈翻译
- 以后做第二个站时，内容和消息可以按站点分，而不是从页面里往外扒

## 完成标准

- 能清楚说出哪些内容属于运行时真相，哪些属于研究资料
- 模板残留不再混在正式站点资产里
- 消息资产被正式视为业务资产的一部分

## 现在先别做什么

- 先别把博客模型整套搬进官网
- 先别为了“内容系统化”而重做整套页面结构

## 阶段 3：把页面层从 Tianze 默认语境里松开

## 现在为什么先做它

前两步主要是在收口输入。

这一步要做的是：

**让页面骨架和业务语境慢慢分开。**

不然就算身份层整理了，页面里还是会继续偷偷写死 Tianze 语境。

## 这一阶段重点盯住的页面

### 1. 首页

主要涉及：

- [page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/page.tsx)

### 2. 联系页

主要涉及：

- [contact/page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/contact/page.tsx)
- [contact-page-shell.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/contact/contact-page-shell.tsx)

### 3. 产品入口页

主要涉及：

- [products/page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/products/page.tsx)
- [page.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/app/[locale]/products/[market]/page.tsx)

### 4. 导航与页脚呈现层

主要涉及：

- [navigation.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/navigation.ts)
- [Footer.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/components/footer/Footer.tsx)
- [vercel-navigation.tsx](/Users/Data/Warehouse/Pipe/tianze-website/src/components/layout/vercel-navigation.tsx)

## 这一步真正的目标

- 页面骨架仍然可以复用
- 但页面里的业务事实不要继续写死
- 页面开始消费“站点身份层”和“站点内容层”，而不是自己变成真相源

## 完成标准

- 首页、联系页、产品页不再承担过多 Tianze 专属事实
- 导航和页脚被明确看成站点表现层，而不是纯通用层

## 现在先别做什么

- 先别为了页面解耦，就重做所有 UI
- 先别在这一阶段引入重型设计系统改造

## 阶段 4：把验证体系升级成“多站点也能继续少挨打”

## 现在为什么先做它

你这个项目现在已经有不少检查了，这是优点。

但未来多站点时，如果还只证明“共享底座没坏”，是不够的。

还要证明：

- 这个站自己的身份没串
- 这个站自己的关键页面没坏
- Cloudflare 这条线没有被多站点改造带坏

## 这一阶段重点要补的内容

### 1. 站点身份层验证

重点方向：

- 品牌名
- 联系方式
- 产品目录
- 默认 SEO 值
- 页脚和导航身份

### 2. 每个站最低页面集

最低建议包括：

1. 首页
2. 联系页
3. 一个主产品入口页
4. 一个内容页或资源页
5. invalid locale redirect
6. 页脚联系与品牌信息

### 3. Cloudflare 分层证明继续保留

继续沿用当前原则：

- 本地 preview 主要证明页面、跳转、cookie、header
- 最终 API 和最终上线真相继续放到真实部署 smoke

参考基础：

- [release-proof.sh](/Users/Data/Warehouse/Pipe/tianze-website/scripts/release-proof.sh)
- [preview-smoke.mjs](/Users/Data/Warehouse/Pipe/tianze-website/scripts/cloudflare/preview-smoke.mjs)

## 完成标准

- 多站点后，验证不再只看 build
- 能明确区分共享底座证明和站点身份证明
- Cloudflare 页面级本地信号和最终部署证明边界不被打乱

## 现在先别做什么

- 不要为了多站点把关键验证降级成弱 smoke
- 不要把 stock preview 当成最终真相

## 阶段 5：用第二个真实站点验证抽象，不再纸上谈兵

## 现在为什么必须做它

你已经确认第二、第三个站会来，那就不能只靠文档判断。

必须尽快用第二个真实业务站去试。

因为很多抽象看上去成立，只有真接一个站时才会暴露：

- 哪些共享层其实还带着 Tianze 假设
- 哪些页面骨架根本没那么通用
- 哪些内容资产其实没法共用

## 这一阶段要做什么

1. 选一个第二站的最小真实范围。
2. 只接最关键的一套身份和内容。
3. 不追求一次全量迁移，先暴露问题。

## 最小建议范围

- 首页
- 联系页
- 一个主产品入口页
- 一套品牌/联系信息
- 一套默认 SEO 值

## 完成标准

- 第二个站能跑通最小关键路径
- 能明确知道哪些抽象成立，哪些还不成立
- 后续第三个站不需要再从零试错

## 现在先别做什么

- 不要第二站一开始就追求完整复制所有页面
- 不要在没有第二站验证前就提前升级为完整多应用结构

## 阶段 6：最后再决定要不要升级到更重的结构

## 现在为什么放最后

因为结构升级应该是结果，不应该是前提。

只有当第二站、第三站真的接入后，差异和成本都暴露出来，才值得判断要不要走向更像 `next-forge` 的完整形态。

## 触发升级评估的信号

- 页面骨架持续明显分化
- 发布节奏开始按站点分开
- 专属依赖越来越多
- 团队开始按站点分工
- 共享层里开始堆越来越多站点特例

## 如果以后真的升级，学什么

- 学 `next-forge` 的边界意识
- 学共享能力按主题归类
- 学横切能力不要散在各处

## 如果以后真的升级，先别学什么

- 不要整套照搬它的重量
- 不要为了“看起来成熟”引入一堆当前不需要的系统

## 最终优先级总结

如果只看现在开始的实际顺序，建议严格按这个来：

1. 冻结旧习惯，先别继续加深耦合
2. 先收口站点身份层
3. 再收口消息和内容资产
4. 再让页面层从 Tianze 默认语境里松开
5. 再补多站点验证面
6. 再用第二站做最小真实验证
7. 最后才决定是否升级结构

## 最后一句判断

这份整改清单的核心意思只有一句：

**现在该真正开始改，但先改“未来多站点一定会拉扯的地方”，不要先改“看起来最像成熟模板的地方”。**

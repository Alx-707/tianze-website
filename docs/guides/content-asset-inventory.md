# 当前仓库内容资产盘点

> Support doc:
> this file is an asset inventory and authoring-seam map.
> It supports current-truth work, but it is not itself the runtime truth source.
>
> Full historical version:
> `docs/archive/guides/support-full/content-asset-inventory.full.md`

## 目的

这份文档现在只回答三件事：

1. 当前仓库有哪些主要内容资产
2. 哪些是真正的 authoring seam
3. 哪些内容只是工作流产物或 tooling artifact

## 当前内容资产分层

### 1. 运行时消息资产

当前位置：

- `messages/en/critical.json`
- `messages/zh/critical.json`
- `messages/en/deferred.json`
- `messages/zh/deferred.json`
- `messages/en.json`
- `messages/zh.json`

说明：

- 运行时主真相是 split bundles
- `messages/en.json` 与 `messages/zh.json` 仍存在，但它们是 **tooling artifact**

### 2. 结构化业务资产

当前位置：

- `docs/cwf/context/company/company-facts.yaml`
- `docs/cwf/context/company/products.yaml`
- `docs/cwf/context/company/value-copy.md`
- `docs/cwf/context/proof-points.md`

说明：

- 这一层是公司、产品、卖点、证明点的结构化输入层
- 适合作为内容生成和后续 derivative project 的替换面

### 3. 内容工作盘

当前位置：

- `docs/cwf/context/project-brief.md`
- `docs/cwf/homepage/**`
- `docs/cwf/faq/**`

说明：

- 这是 CWF 工作盘
- 不是 runtime truth
- 也不是站点最终页面真相

### 4. SEO / 页面表达 authoring seams

当前关键 authoring seams：

- `src/config/single-site.ts`
- `src/config/single-site-page-expression.ts`
- `src/config/single-site-seo.ts`

说明：

- `src/config/single-site-page-expression.ts` 负责页面表达输入
- `src/config/single-site-seo.ts` 负责 sitemap / robots / public-page SEO 默认值
- 这两层比旧的零散页面文本更接近长期可维护的 authoring 面

## 当前最重要的判断

### 不要混淆三种东西

1. **runtime truth**
2. **结构化内容资产**
3. **工作流产物**

### 当前仓库最容易误判的点

- 把 CWF 工作盘当成最终页面真相
- 把 flat messages 当成运行时真相
- 把页面表现层和 authoring seam 混在一起

## 使用方式

- 看当前业务/内容输入：先看 `docs/cwf/context/**`
- 看当前页面表达 authoring seam：先看 `src/config/single-site-page-expression.ts`
- 看当前 SEO authoring seam：先看 `src/config/single-site-seo.ts`
- 看 runtime message 真相：先看 split bundles，而不是 `messages/en.json` / `messages/zh.json`

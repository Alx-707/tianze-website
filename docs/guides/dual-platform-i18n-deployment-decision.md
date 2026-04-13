# 双平台 i18n 部署决策

_最后更新：2026-04-10_

## 这份文档是干什么的

这份文档只回答一个问题：

**在 Cloudflare 和 Vercel 都可能成为部署平台的前提下，当前仓库的 i18n 路由和部署策略，先维持什么，不先改什么。**

它的作用是避免以后再次因为下面这些问题来回争论：

- 要不要现在就把 `localePrefix` 改成 `"never"`
- 要不要为了更干净的 URL 引入更多 rewrite
- 要不要马上把 `next-intl` 全面迁到 `next/root-params`
- 本地 `next start` 通过，是不是就代表双平台都安全

## 当前决定

截至 **2026-04-10**，当前仓库先保持下面这套默认做法：

- 继续保留 **`localePrefix: "always"`**
- 继续保留 **`/[locale]` 路由结构**
- 继续把 **Cloudflare** 视为当前主证明面
- 把 **Vercel** 视为候选部署平台，而不是已经完成证明的平台
- 暂时**不**为了隐藏 locale 前缀，引入 rewrite-heavy 的 i18n 路由方案
- 暂时**不**把 `next-intl` 的 locale 获取方式做全面迁移

这不是因为新方案做不到，而是因为**现在不划算**。

## 为什么当前先不改

### 1. 现状对双平台更省风险

当前仓库已经满足下面这些条件：

- `cacheComponents: true`
- `localePrefix: "always"`
- 主路由是 `/[locale]`
- 当前 Cloudflare 线已经有较多项目内验证经验

这套结构不算最先进，但它避开了一个已经出现过的风险组合：

- `cacheComponents`
- rewrite
- 无前缀 locale 路由
- Vercel 线上运行

在 `next-intl` issue #1493 的 **2026-04-09** 讨论里，已经有人报告这组组合会让 Vercel 的 RSC 响应返回错误的 `content-type`，然后把客户端导航退化成整页刷新。本地 `next start` 正常，不代表线上也正常。

这说明：**现在先不改 URL 形态，反而更容易维持双平台可选。**

### 2. `next/root-params` 值得跟，但现在还不是主线动作

`next-intl` maintainer 在 issue #1493 里给出的方向很明确：

- `next/root-params` 是未来更合适的方向
- 现在公开文档的基线路线，仍然主要基于 `getRequestConfig`、`requestLocale`、`setRequestLocale`
- 新路线已经有 demo 和实验性成功案例
- 但边角场景，尤其是 `not-found` 和非本地化请求，还在继续讨论

这意味着：

- 这条路可以跟
- 但现在不适合当成仓库级重构动作

### 3. 当前 Cloudflare 的主要风险，不在 i18n 路由形态

对这个仓库来说，Cloudflare 这边更靠前的问题一直是：

- OpenNext 生成产物兼容
- 本地 preview 和真实部署之间的差异
- Wrangler / Miniflare 边界
- phase6 / split-worker 的部署证明

所以当前阶段去大改 i18n 路由，只会让问题来源更难判断。

## 当前先不做的事

下面这些事，当前阶段都先不做：

### 不把 `localePrefix` 改成 `"never"`

原因：

- 这通常意味着要更依赖 rewrite
- 而 rewrite 正好是当前 Vercel 风险最集中的地方

### 不把 domain-based routing 当当前默认主线

原因：

- 这条路通常也会带来更多 rewrite 和平台差异
- 对当前仓库来说，收益没有立刻大过风险

### 不把本地 `next start` 当双平台证明

原因：

- 本地通过，只能说明本地通过
- 当前已知问题里，Vercel 有“本地正常、线上退化”的案例

### 不把 `next/root-params` 迁移和部署链路调整绑在一起做

原因：

- 一起改，出了问题很难分清是哪一层导致的

## 当前默认取舍

### 现在优先保住的东西

- 路由形态稳定
- Cloudflare 主线证明继续可用
- Vercel 以后还有接入空间
- 问题出现时，容易判断是平台问题还是业务问题

### 现在暂时放弃的东西

- 更干净的无前缀 locale URL
- 更激进的双平台统一路由设计
- 立刻吃满 `next/root-params` 这条新路线的全部收益

## 什么时候重新打开这个决定

只有出现下面这些情况，才重新讨论：

### 1. Vercel 要从候选平台变成正式平台

如果 Vercel 不再只是备选，而是要进入正式上线计划，那就必须重新评估 i18n 路由策略。

### 2. 业务明确要上 domain-based routing

如果未来多个站点或多个域名的需求已经坐实，就不能一直靠当前结构拖着。

### 3. 要把更多翻译相关内容放进 `"use cache"`

如果后面真要把更多页面、布局、Server Components 往缓存路径里推，那 locale 来源的写法就会越来越重要。

### 4. `next-intl` 官方把 `next/root-params` 方案写成正式文档

一旦 maintainer 发布正式迁移说明，这件事的可操作性会明显提高。

## 以后只要动这块，必须补的验证

只要动了下面任意一类：

- i18n 路由结构
- `localePrefix`
- `request.ts`
- locale 获取方式
- rewrite / proxy 行为

就必须把验证拆成两部分：

### Cloudflare

- `pnpm build`
- `pnpm build:cf`
- `pnpm smoke:cf:preview`
- 必要时对真实部署地址跑 `pnpm smoke:cf:deploy -- --base-url <url>`

### Vercel

不能只看本地 `next start`。

至少要补真实 Vercel preview 验证，重点看：

- 本地化页面之间导航是否还是 SPA 导航
- 是否出现整页刷新
- RSC 响应的 `content-type` 是否仍是 `text/x-component`
- rewrite 后的页面是否仍能正常工作

## 以后如果要试新路线，建议怎么试

先从小范围试，不做仓库级大改。

建议顺序：

1. 先单开实验分支
2. 先试 `src/i18n/request.ts`
3. 再试一两个会进入缓存路径的页面
4. 不同时改 URL 结构
5. 不同时改 Cloudflare 部署链路

## 当前状态的最终判断

当前仓库先保持现状，是一个偏保守的选择。

这个选择的意义不是“永远不升级”，而是：

- 当前风险更低
- 双平台更容易继续保留选择权
- 以后要改时，判断会更清楚

如果后面条件变了，这份文档应该被更新，而不是被默认沿用。

## 参考资料

- `next-intl` Request configuration  
  <https://next-intl.dev/docs/usage/configuration>
- `next-intl` Routing configuration  
  <https://next-intl.dev/docs/routing/configuration>
- `next-intl` Error files  
  <https://next-intl.dev/docs/environments/error-files>
- `next-intl` issue #1493  
  <https://github.com/amannn/next-intl/issues/1493>
- maintainer 置顶说明  
  <https://github.com/amannn/next-intl/issues/1493#issuecomment-3435882292>
- `next/root-params` demo PR  
  <https://github.com/aurorascharff/next-intl-cache-components/pull/6>
- Vercel rewrite 风险讨论  
  <https://github.com/amannn/next-intl/issues/1493#issuecomment-4215907033>

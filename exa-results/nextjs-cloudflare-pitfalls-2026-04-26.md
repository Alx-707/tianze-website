# Next.js + Cloudflare + OpenNext 实战踩坑全景报告

> 基于 Exa 语义搜索，6 个子代理并行扫描 22 个维度，覆盖 2024-2026 年间真实从业者博客、GitHub Issue、社区讨论。
> 搜索日期：2026-04-26 | 去重后约 80+ 条独立发现

---

## 风险总览

| 级别 | 数量 | 说明 |
|------|------|------|
| **阻断级 (Blocker)** | 8 | 不处理则功能不可用或持续烧钱 |
| **高风险 (High)** | 22 | 生产环境会遇到，需提前规避 |
| **中风险 (Medium)** | 25 | 有坑但有明确绕法 |
| **低风险 (Low)** | 10+ | 知道就好，不太会踩到 |

---

## 一、部署与成本（维度 1-4）

### 1.1 OpenNext + Cloudflare Workers 隐性费用

**[Blocker] D1 数据库缓存写放大 Bug — $5,800/月**
- 来源：[GitHub #493](https://github.com/opennextjs/opennextjs-cloudflare/issues/493)
- OpenNext 0.5.x 的 `D1TagCache` 触发 7.34 万亿行/月的写入，导致天价账单
- 修复：升级到 0.6+ 使用 `D1NextTagCache` 或 `DoShardedTagCache`
- **我们的行动**：确认使用 OpenNext ≥0.6

**[High] Durable Objects 自动启用导致额外 $12.50/月**
- 来源：[davidloor.com](https://davidloor.com/en/blog/reduce-cloudflare-costs-opennext-static-assets-cache)
- 默认开启的 ISR 缓存组件（DOShardedTagCache, BucketCachePurge, DOQueueHandler）按调用计费
- 静态站可通过 `staticAssetsIncrementalCache` 配置完全禁用
- **我们的行动**：评估是否真的需要 ISR，如不需要则禁用 Durable Objects

**[High] Vercel → Cloudflare 迁移省 98% 构建成本**
- 来源：[silvermine.ai](https://www.silvermine.ai/newsletter/cloudflare-vs-vercel-nextjs-opennext)
- Vercel 构建费 $9/天 vs Cloudflare Workers $5/月（含 6000 构建分钟）

### 1.2 Cloudflare 图片优化

**[High] /_next/images 默认端点无缓存头 — "钱包黑洞"**
- 来源：[meathill.com](https://meathill.com/en/posts/cloudflare/nextjs-images-why-so-expensive-cloudflare-image-resizing-pitfalls-best-practices)（本次分析的原始文章）
- 默认路径返回的 HTTP Header 完全没有 Cache-Control、ETag、cf-cache-status
- 每次请求都穿透到 Worker 重新计算
- **解决方案**：Custom Loader + `/cdn-cgi/image` + Cache Rule + Cache Reserve

**[Medium] S3 + Cloudflare Images Custom Loader 模式**
- 来源：[u11d.com](https://u11d.com/blog/speed-up-your-next-js-app-optimizing-s3-images-with-cloudflare-images/)
- 检测 S3 域名自动走 Cloudflare 转换，其他来源走 Next.js 内置
- B2B 站最简生产方案

**[Medium] AVIF 编码权衡**
- 来源：[sureshkhirwadkar.dev](https://sureshkhirwadkar.dev/posts/changing-next-image-to-avif-support)
- AVIF 比 WebP 压缩率更高但构建时间更长
- 建议：生产环境用 Cloudflare 运行时转换（`format=auto`），不在构建期做

### 1.3 缓存策略失效

**[Blocker] revalidateTag 的 stale-while-revalidate 在 OpenNext 上不工作**
- 来源：[GitHub #1058](https://github.com/opennextjs/opennextjs-cloudflare/issues/1058)（2025-12 报告，2026-04 仍未解决）
- 调用 `revalidateTag` 后所有请求变成 MISS，后台重验证不触发
- **我们的行动**：不依赖 `revalidateTag` 做缓存更新，改用部署时重建

**[Blocker] PPR + ISR 在 Cloudflare 上 24 小时后崩溃**
- 来源：[GitHub #662](https://github.com/opennextjs/opennextjs-cloudflare/issues/662)
- Next.js 16 的 Partial Prerendering + ISR 组合在重验证后进入无限挂起循环，渲染空白
- **我们的行动**：绝对不在 Cloudflare 上使用 PPR + ISR 组合

**[High] fetch 缓存的 stale-while-revalidate 后台刷新被 Worker 终止**
- 来源：[GitHub vinext#438](https://github.com/cloudflare/vinext/issues/438)
- 后台 refetch 没有注册 `waitUntil()`，Worker 在响应发送后直接终止
- 含 `next: { revalidate: N }` 的 fetch 在 TTL 过期后永远返回过时数据

**[High] 动态路由 ISR 每次加载都重建**
- 来源：[GitHub #754](https://github.com/opennextjs/opennextjs-cloudflare/issues/754)
- `revalidate` 对动态路由无效，需设置 `enableCacheInterception: true`
- **我们的行动**：不启用 `enableCacheInterception`，也不在 Cloudflare 生产代码中使用 `cacheTag()`、`revalidateTag()` 或 `revalidatePath()`；内容更新统一走静态生成 + 重新部署

### 1.4 Workers 生产限制

**[High] 62 MiB Bundle 硬限制（文档未标明）**
- 来源：[claudelab.net](https://claudelab.net/en/articles/claude-code/claude-code-nextjs-cloudflare-workers-production-ops-guide)
- 内容内联到 bundle 后碰到 V8 字符串限制
- 解决方案：内容存为独立文件，通过 ASSETS binding 运行时读取

**[High] 免费版 3 MiB 远远不够**
- 来源：[GitHub #11](https://github.com/LubomirGeorgiev/cloudflare-workers-nextjs-saas-template/issues/11)
- 典型 Next.js 应用 handler.mjs 轻松超过 12 MiB
- **我们的行动**：预算 $5/月付费版（10 MiB 限制）

**[Medium] 冷启动 CPU 超时**
- 来源：[GitHub #598](https://github.com/opennextjs/opennextjs-cloudflare/issues/598)
- 首次请求可能触发 CPU 限制错误，后续请求正常
- 设置 `cpu_ms: 30000` + 启用 Smart Placement

---

## 二、框架核心（维度 5-8）

### 2.1 next-intl + Edge Runtime

**[High] Middleware Cookie 处理在 Cloudflare 上失效**
- 来源：[GitHub next-on-pages#785](https://github.com/cloudflare/next-on-pages/issues/785)
- `next-intl` 设置 locale cookie 在 Vercel 正常，Cloudflare 上 cookie 不持久化
- **我们的行动**：cookie 设置走 API Route 而非 middleware

**[High] next-intl + next-on-pages + Next.js 16 构建失败**
- 来源：[GitHub next-intl#2097](https://github.com/amannn/next-intl/issues/2097)
- 必须用 OpenNext 适配器，不能用 next-on-pages
- **我们的行动**：已在使用 OpenNext，无需额外操作

**[Medium] Middleware 体积膨胀 — 翻译文件泄露到 middleware bundle**
- 来源：[GitHub next-intl#1669](https://github.com/amannn/next-intl/issues/1669)
- 解法：将 navigation 导入拆到单独文件

**[Medium] x-default hreflang 缺少 locale 前缀**
- 来源：[GitHub next-intl#1933](https://github.com/amannn/next-intl/issues/1933)
- `localePrefix: 'always'` 时 x-default 指向无前缀 URL，导致 Google Search Console "重复无用户选择的规范"错误
- **我们的行动**：测试 hreflang 输出并手动验证

### 2.2 安全 — CSP Nonce

**[Blocker] OpenNext 不支持 Nonce 注入**
- 来源：[GitHub appwarden/middleware](https://github.com/appwarden/middleware)
- OpenNext 只能设 Header，不能做 HTML Rewrite，nonce 无法注入到 inline script
- **我们的行动**：使用 hash-based CSP 代替 nonce-based CSP

**[High] CSP Nonce + Cache Components 互斥**
- 来源：[GitHub next.js#89754](https://github.com/vercel/next.js/issues/89754)
- 生成 nonce 需要 `headers()`（动态），但 Cache Components 要求静态
- **我们的行动**：已计划不使用 nonce

**[Medium] TypeScript Production 构建丢失 nonce 属性**
- 来源：[GitHub next.js#66871](https://github.com/vercel/next.js/issues/66871)
- Dev 模式正常，生产构建 nonce 消失

### 2.3 OpenNext 版本兼容

**[High] Next.js 16.2.0 + OpenNext 崩溃**
- 来源：[GitHub #1157](https://github.com/opennextjs/opennextjs-cloudflare/issues/1157)
- `prefetch-hints.json` 加载错误导致 Worker 启动崩溃
- **我们的行动**：确保 OpenNext ≥1.17.3

**[High] R2 批量上传 503 错误**
- 来源：[GitHub #1110](https://github.com/opennextjs/opennextjs-cloudflare/issues/1110)
- 2400+ 预渲染页面的 R2 上传反复失败
- 解法：用 rclone 替代 wrangler 的 r2 bulk put

**[Medium] next-intl + OpenNext 构建错误 "No matching export in PagesManifest"**
- 来源：[GitHub #683](https://github.com/opennextjs/opennextjs-cloudflare/issues/683)
- 解法：删 node_modules 重装 + 升级 OpenNext

### 2.4 App Router / RSC 生产问题

**[High] React 19.2 安全漏洞 (RCE)**
- 来源：[react.dev 安全公告](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- RSC 存在未认证远程代码执行漏洞，19.2.1 修复
- **我们的行动**：确认使用 React ≥19.2.1

**[High] Server Action + Cookie 修改导致 RSC Payload 损坏**
- 来源：[andre-muller gist](https://gist.github.com/andre-muller/80d291e422e3f7d3da9a9c7fc05f9772)
- `cookies().set()` 在 Server Action 中触发自动重验证，两个响应合并导致 payload 损坏
- **我们的行动**：cookie 修改走 API Route

**[Medium] Error Boundary 导航后不重置**
- 来源：同上
- 只有 `window.location.reload()` 能清除错误状态

**[Medium] Server Component 数据获取瀑布**
- 来源：[logrocket.com](https://blog.logrocket.com/react-server-components-broke-my-app/)
- 父组件获取完成前子组件无法开始，必须手动用 `Promise.all` 并行化

---

## 三、依赖层（维度 9-12）

### 3.1 React 19 兼容性

**[High] Suspense 边界 >12,800 字节渲染 fallback**
- 来源：[GitHub react#35460](https://github.com/facebook/react/issues/35460)
- React 19.2 回归：大内容块在无 JS 用户面前显示空白
- 解法：设置 `progressiveChunkSize: Infinity`

**[High] 第三方库使用 React 内部 API 崩溃**
- 来源：[Medium](https://medium.com/@quicksilversel/i-upgraded-three-apps-to-react-19-heres-what-broke-648087c7217b) + [GitHub#35460](https://github.com/StackOneHQ/hub/issues/140)
- `React.__SECRET_INTERNALS` 在 React 19 中重命名，依赖它的库直接崩
- **我们的行动**：审查所有第三方依赖的 React 19 兼容性

**[High] 组件库仅在生产构建中出现无限重渲染**
- 来源：[GitHub mantine#8809](https://github.com/mantinedev/mantine/issues/8809)
- Dev 模式正常，Production 构建中 Modal + SegmentedControl 触发 React error #185
- **我们的行动**：生产构建前做完整功能测试

### 3.2 Tailwind CSS v4

**[High] 默认生成所有主题颜色变量（21KB vs 3.2KB）**
- 来源：[chriswilliams.dev](https://chriswilliams.dev/blog/so-tailwind-4-is-kinda-big)
- v4.0.0-4.0.4 即使未使用也输出全部默认颜色
- 4.0.5+ 已修复

**[High] 暗色模式检测方式改变 — 静默破坏**
- 来源：[7onic.design](https://blog.7onic.design/tailwind-v4-migration-what-actually-changed/)
- 从 `.dark` class 假设变为 `@media (prefers-color-scheme)`，需手动配置 `@variant`
- `@theme inline` 在构建时解析颜色，破坏运行时暗色模式切换
- 无错误提示，生成的 CSS 语法有效但不匹配 DOM

**[Medium] 动态类名被 purge 静默删除**
- 来源：[markaicode.com](https://markaicode.com/tailwind-css-4-installation-purging-optimization/)
- 模板字符串拼接的类名（如 `mr-${gap}`）永远不会被检测到
- 必须手动配置 `@source`

**[Medium] tailwind-merge 导致自动检测膨胀**
- 来源：[GitHub#15722](https://github.com/tailwindlabs/tailwindcss/issues/15722)
- tailwind-merge 的源码包含所有 utility 名称，v4 自动检测把它们全部生成
- 解法：禁用自动检测，手动配置 sources

### 3.3 MDX + App Router

**[High] @next/mdx + Turbopack 双重处理 — 50秒额外编译**
- 来源：[GitHub next.js#91103](https://github.com/vercel/next.js/issues/91103)
- MDX 编译输出 JS 后又被 Turbopack 当 TSX 重新解析
- 含 rehype-katex 等重插件时编译时间飙升
- **我们的行动**：暂不使用 Turbopack 构建 MDX

**[Medium] MDX 构建随文件数线性增长**
- 来源：[thelinuxcode.com](https://thelinuxcode.com/mdx-in-nextjs-a-practical-production-guide/)
- 50+ 篇文章时需要选择性使用 Server Components + 懒加载
- **我们的行动**：当前文章数量不多，暂不担心

### 3.4 字体加载

**[High] next/font/google 在 Windows 高 DPI 下文字错位**
- 来源：[GitHub next.js#78118](https://github.com/vercel/next.js/issues/78118)
- macOS user-agent 获取 hinted 字体，Windows 获取 unhinted 字体
- 开发时看不出问题（macOS/Linux），生产环境 Windows 用户看到错位
- **我们的行动**：使用 `next/font/local` 搭配自托管字体文件

**[Medium] 字体下载在受限网络的 CI 环境中静默失败**
- 来源：[StackOverflow](https://stackoverflow.com/questions/76478043)
- 设置 `display: 'swap'` + `adjustFontFallback: false` 可避免构建失败

**[Low] Cloudflare Fonts 与 next/font 共存无冲突**
- 来源：[Cloudflare docs](https://developers.cloudflare.com/speed/optimization/content/fonts/troubleshooting/)
- next/font 已自托管，Cloudflare Fonts 无需干预

---

## 四、路由与表单（维度 13-15）

### 4.1 Middleware 限制

**[High] Middleware / Proxy cookie API 用错会静默失败**
- 来源：[lewiskori.com](https://lewiskori.com/blog/deploying-a-next-js-monorepo-to-cloudflare-workers/)
- `next/headers` 的 `cookies()` 可用于 Server Components、Server Functions 和 Route Handlers；但 Middleware / Proxy 运行在 Edge 边界，必须读取当前请求对象上的 cookies，例如 `request.cookies`

**[High] Asset manifest 在 Middleware 之前检查 — 静态页面 locale 重写失败**
- 来源：[kishormarasini.com](https://blog.kishormarasini.com.au/deploying-nextjs-to-cloudflare-workers)
- OpenNext 先检查 asset manifest，再运行 middleware
- 静态生成的页面的 i18n 重写永远不执行 → 非默认语言 404
- **我们的行动**：验证产品页的 locale 路由在生产环境是否正常

**[High] Next.js 16 将 middleware.ts 改名为 proxy.ts**
- 来源：[yceffort.kr](https://yceffort.kr/en/2026/03/nextjs-edge-runtime-rise-and-fall)
- Edge runtime 正在被淘汰，Vercel 转向 Fluid Compute
- OpenNext 适配器可能滞后于 Next.js 16 的假设

**[Medium] Edge Runtime 不支持 Node.js API（crypto, fs）**
- 来源：[Medium](https://medium.com/@shivashanker7337/the-next-js-middleware-dilemma-why-our-simple-solution-is-getting-complicated-c7c5358a76f8)
- jsonwebtoken 不能在 edge middleware 中用，需换用 web-API 兼容库

### 4.2 Server Actions

**[High] 静态页面上 Server Actions 返回 405**
- 来源：[GitHub next-on-pages#679](https://github.com/cloudflare/next-on-pages/issues/679)
- 静态页面不注册 POST 路由
- 解法：强制页面为 `export const runtime = 'edge'`，但会破坏静态生成
- **我们的行动**：询盘表单所在页面不能是纯静态

**[High] 冷启动导致 Server Actions 超时（Error 1102）**
- 来源：[GitHub #598](https://github.com/opennextjs/opennextjs-cloudflare/issues/598)
- 暖请求正常，冷启动时表单提交可能超时
- **我们的行动**：启用 Smart Placement，设置 cpu_ms 上限

**[Medium] Server Actions 在 Workers 中丢失认证上下文**
- 来源：[GitHub payload#14656](https://github.com/payloadcms/payload/issues/14656)
- 浏览器发送的 auth cookie 在 Server Action 上下文中不可用

### 4.3 Core Web Vitals

**[High] Hero 图片优化是 LCP 最大杠杆 — 68% 改善**
- 来源：[nextfuture.io.vn](https://nextfuture.io.vn/blog/optimizing-core-web-vitals-60-to-95-nextjs-case-study)
- 1.2MB hero → 适当尺寸 + preload → LCP 从 4.1s 降到 <1.2s

**[High] ISR + Cloudflare CDN = 1.2s TTFB 节省**
- 来源：[blixamo.com](https://blixamo.com/blog/nextjs-performance-optimization-2026)
- ISR + CDN + WebP + 字体子集 → Lighthouse 71→97，总 JS 从 340KB 降到 118KB

**[Medium] 过度使用 dynamic import 导致 LCP 倒退 400ms**
- 来源：[litreview-ai.com](https://litreview-ai.com/en/blog/frontend-performance-optimization-nextjs)
- 首屏内容不要用 dynamic import，Server Render hero 区域

**[Medium] Lab Data 和 Field Data 差异大**
- 来源：[averagedevs.com](https://www.averagedevs.com/blog/nextjs-core-web-vitals-2025)
- Lighthouse 看不出的问题在真实用户数据中暴露
- **我们的行动**：上线后接入 web-vitals SDK 做 RUM 监控

---

## 五、SEO 与运维（维度 16-19）

### 5.1 SEO 技术细节

**[High] JSON-LD 在 RSC 水合时重复注入**
- 来源：[chaitanyaraj.dev](https://blog.chaitanyaraj.dev/nextjs-app-router-structured-data)
- Server 注入一次，Client 水合又注入一次 → Rich Results 失效
- 解法：检测已注入的 schema 跳过重渲染

**[High] 多个 JSON-LD 需用 @graph 合并**
- 来源：[dev.to](https://dev.to/alamin_c5eb10132845723c2b/my-json-ld-schemas-were-silently-broken-until-i-found-graph-5aan)
- 多个独立 `<script type="application/ld+json">` 标签会被 Google 静默丢弃
- Google 不报错不报警，几天后 Rich Results 消失
- **我们的行动**：使用 `@graph` 合并所有 schema

**[High] generateSitemaps() 在 Cloudflare 上不支持**
- 来源：[GitHub vinext#397](https://github.com/cloudflare/vinext/issues/397)
- 分页 sitemap（>50K URL）不可用
- **我们的行动**：当前页面数少，单 sitemap 够用

**[Medium] 站点地图被代理源站域名污染**
- 来源：[tenten.co](https://developer.tenten.co/the-seo-black-hole-fixing-indexing-issues-on-cloudflare-worker-proxied-blogs)
- 代理架构下 sitemap XML 包含原始域名而非线上域名

### 5.2 构建与 CI

**[High] OpenNext 构建比 Vinext (Vite) 慢 4.4 倍**
- 来源：[anisafifi.com](https://anisafifi.com/en/blog/i-spent-three-days-fighting-open-next-cloudflare-rebuilt-next-js-in-one-week-with-ai/)
- OpenNext 7.38s vs Vinext 1.67s（Rolldown），bundle 小 57%
- Vinext 已可用但不是默认选择

**[High] R2/KV 缓存填充超时 — 300 资源需 6 分钟**
- 来源：[GitHub #637](https://github.com/opennextjs/opennextjs-cloudflare/issues/637) + [#866](https://github.com/opennextjs/opennextjs-cloudflare/issues/866)
- 逐文件上传，500 资产就超时
- 解法：用 rclone 替代（30分钟→1分20秒）

**[Medium] Smart Placement 提升冷启动 20 倍**
- 来源：[GitHub #653](https://github.com/opennextjs/opennextjs-cloudflare/issues/653)
- `"placement": { "mode": "smart" }` 在 wrangler.jsonc 中配置
- **我们的行动**：默认启用

### 5.3 GA4/GTM

**[Medium] Cloudflare Rocket Loader 改写 GTM 脚本类型**
- 来源：[optimizesmart.com](https://www.optimizesmart.com/how-cloudflare-impacts-google-analytics-stats/)
- Rocket Loader 将 `<script>` 改为 `type="text/rocketscript"`，GTM 不识别
- 解法：加 `data-cfasync="false"` 属性

**[Medium] Cloudflare 缓存遮蔽 GA 调试更改**
- 调试 GA/GTM 时，缓存返回旧页面，实时报告数小时不更新
- 调试期间清 Cloudflare 缓存

**[Low] Cloudflare Web Analytics 可替代 GA4**
- 来源：[heyvaldemar.com](https://heyvaldemar.com/cloudflare-web-analytics-astro-lighthouse-100/)
- 移除 GA4（70KB gtag.js）后 Lighthouse 从 88 升到 100
- Cloudflare 代理层注入仅 ~1KB beacon

### 5.4 DNS/SSL

**[High] Flexible SSL 模式导致重定向循环**
- 来源：[Cloudflare docs](https://developers.cloudflare.com/ssl/troubleshooting/too-many-redirects/) + [Medium](https://medium.com/@jammelimohamedyassin/cloudflare-is-causing-your-too-many-redirects-error-and-how-to-fix-it-15a2c33af8d8)
- 最常见的新用户错误：Flexible SSL → HTTP 到源站 → 源站重定向 HTTPS → 循环
- **我们的行动**：确保使用 Full (Strict) SSL 模式

**[High] 裸域名 (Apex) 配置问题**
- 来源：[Cloudflare Community](https://community.cloudflare.com/t/why-website-not-working-without-www/600267)
- 必须使用 Cloudflare 名称服务器（完整设置）才能让裸域名工作
- 或添加虚拟 A 记录 `192.0.2.1`

**[Medium] CNAME Flattening 破坏第三方域名验证**
- 来源：[Cloudflare docs](https://developers.cloudflare.com/dns/cname-flattening/)
- 邮件提供商等第三方验证需要 CNAME 记录，但 Flattening 返回 A 记录

---

## 六、上线后运维（维度 20-22）

### 6.1 第三方脚本

**[High] 聊天插件性能代价巨大**
- 来源：[tasrieit.com](https://tasrieit.com/blog/building-custom-chat-widget-discord-cloudflare-workers) + [ghostchat.dev](https://ghostchat.dev/features)
- Intercom 400KB → Lighthouse 从 100 降到 74
- Crisp 200KB+ → 311ms CPU 时间
- Tawk.to → 1100ms CPU 时间
- 自定义 Workers 方案 5KB → Lighthouse 100

**[Medium-High] Crisp 与 SPA 导航不兼容**
- 来源：[GitHub crisp-sdk#39](https://github.com/crisp-im/crisp-sdk-web/issues/39)
- DOM mutation observer 监控 `<html>` 替换，每次导航重置 widget

**[Medium] 第三方脚本加载策略**
- 来源：[Medium](https://meetpan1048.medium.com/how-i-optimize-third-party-scripts-in-next-js-without-killing-performance-a1b23b3f73e9)
- `next/script` 的 `afterInteractive` 仍然阻塞；`lazyOnload` 更好但非万能
- **我们的行动**：B2B 询盘站优先考虑不用聊天插件，用表单 + 邮件通知

### 6.2 错误监控

**[High] Sentry 在 Cloudflare Workers 上静默丢失事件**
- 来源：[GitHub sentry#14931](https://github.com/getsentry/sentry-javascript/issues/14931) + [PR#19084](https://github.com/getsentry/sentry-javascript/pull/19084)
- Worker 提前终止导致错误事件未刷出
- SDK v8.47.0+ 通过 `cloudflareWaitUntil` 检测修复
- **性能代价**：全链路追踪 → 吞吐量降到 20%；仅错误模式 → 保留 69%

**[High] Sentry 是最大 bundle 贡献者**
- 来源：[lewiskori.com](https://lewiskori.com/blog/deploying-a-next-js-monorepo-to-cloudflare-workers/)
- 服务端 Sentry 可能迫使你从免费版升级到付费版
- **我们的行动**：仅客户端 Sentry + error-only 模式

**[Medium] Cloudflare 日志不持久化**
- 来源：[Cloudflare docs](https://developers.cloudflare.com/pages/functions/debugging-and-logging/)
- 最大 100 req/s 流式传输，最多 10 个并发查看者
- 需外接 Sentry/Datadog 做持久化

### 6.3 邮件送达

**[High] Cloudflare 原生邮件发送仍在私测 — 送达率存疑**
- 来源：[pbxscience.com](https://pbxscience.com/cloudflare-takes-aim-at-transactional-email/) + [StackOverflow](https://stackoverflow.com/questions/79733052)
- 有报告称邮件既没到收件箱也没到垃圾箱，直接消失
- **我们的行动**：不用原生方案，用第三方

**[High] Resend 是 Workers 的最佳选择**
- 来源：[Cloudflare 官方教程](https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend) + [cirocloud.com](https://cirocloud.com/artikel/transactional-email-api-2025-resend-vs-sendgrid-vs-mailgun)
- Resend：98.9% 送达率，67ms P99 延迟，自动配置 SPF/DKIM/DMARC
- SendGrid：98.2% 送达率，145ms 延迟，手动配置，2024 Q1 配置问题工单增加 23%
- **我们的行动**：询盘通知邮件使用 Resend

**[High] Workers 不支持 SMTP — 只能用 HTTP API**
- 来源：[sequenzy.com](https://www.sequenzy.com/blog/send-emails-cloudflare-workers)
- Nodemailer 等基于 TCP 的库在 Workers 中不可用
- 必须用 HTTP API（Resend, SendGrid 等）
- 后台发送用 `ctx.waitUntil()`

---

## 跨维度模式识别

### 模式 1：「Dev 正常 Production 崩溃」
React 19 组件库 bug、CSP nonce 丢失、Sentry 事件丢失、字体错位 — 大量问题只在生产构建中出现。
→ **必须在生产构建环境中做完整功能测试**

### 模式 2：「静默失败无错误提示」
缓存不生效、JSON-LD 被 Google 丢弃、next-intl hreflang 错误、GA 脚本被改写、cookie 不持久化 — 没有报错，功能看似正常但实际无效。
→ **需要主动检查行为而非依赖错误日志**

### 模式 3：「OpenNext 是桥梁也是瓶颈」
缓存策略、构建速度、R2 上传、版本兼容 — OpenNext 作为 Next.js 和 Cloudflare 之间的适配层，承担了大量兼容性风险。
→ **固定版本、密切关注 Release Notes、考虑 Vinext 作为备选**

### 模式 4：「免费版不够用但付费版很划算」
Workers $5/月、Sentry 付费、Cache Reserve — 每个组件的免费版限制都可能成为问题。
→ **预算 $15-25/月 覆盖核心付费需求**

### 模式 5：「缓存是最大的不确定性」
revalidateTag 不工作、fetch stale-while-revalidate 被终止、PPR+ISR 崩溃、tiered cache 干扰 — Cloudflare 上的 Next.js 缓存行为与文档描述存在系统性偏差。
→ **简化缓存策略：静态生成 + 部署时重建，避免运行时重验证**

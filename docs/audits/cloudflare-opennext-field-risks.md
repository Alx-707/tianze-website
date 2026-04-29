# Cloudflare + OpenNext 真实部署风险清单

生成日期：2026-04-26  
适用项目：Tianze Website  
来源材料：`exa-results/nextjs-cloudflare-pitfalls-2026-04-26.md`  
用途：把外部真实部署经验转成当前项目可执行的上线风险清单。

## 这份文档怎么用

Exa 报告是外部风险池，不是执行命令。里面很多问题来自 GitHub Issue、个人博客和社区讨论，价值在于真实，但每条都要和当前项目版本、配置、业务阶段对照。

本文件只记录对 Tianze Website 有决策价值的部分，分成四类：

| 分组 | 含义 | 处理方式 |
| --- | --- | --- |
| A. 当前已规避 | 当前配置已经避开，或版本已越过风险点 | 保持现状，防止回退 |
| B. 当前需要复核 | 现在可能影响成本、稳定性或上线证明 | 进入近期技术复核 |
| C. 上线前必须处理 | 不处理会影响海外买家体验、询盘或生产证明 | 作为上线门槛 |
| D. 暂时只观察 | 有价值，但当前阶段不该投入 | 记录触发条件，先不做 |

## 当前项目基线

当前仓库不是刚接 Cloudflare 的初始状态。关键事实如下：

- Next.js：`16.2.4`
- React / React DOM：`19.2.5`
- `@opennextjs/cloudflare`：`1.19.4`
- Wrangler：`4.86.0`
- Node runtime policy：`>=24 <25`
- Proof baseline：Node `24.15.x` LTS
- `next-intl`：`^4.11.0`
- Tailwind CSS：`^4.2.4`
- Resend：`^6.12.2`
- Cloudflare 构建入口：`pnpm build:cf`
- Cloudflare runtime 配置：`open-next.config.ts` + `wrangler.jsonc`
- 当前 Cloudflare 图片策略：`DEPLOY_TARGET=cloudflare` 时 `next/image` 设置 `unoptimized: true`

说明：这份风险清单生成于 2026-04-26。上面的基线已按 2026-04-29 全面技术栈升级刷新；下方风险分组仍按原报告结构保留。

当前验证原则不变：

1. `pnpm build` 只能证明标准 Next.js 构建。
2. `pnpm build:cf` 只能证明 Cloudflare 构建产物生成。
3. 页面是否真的能用，要看 preview 或 deployed smoke。
4. Cloudflare API 行为的最终证明仍然是 deployed smoke，不是本地 preview。

---

## A. 当前已规避

这些风险暂时不用修，但要防止后续改配置时重新引入。

### A1. 旧版 D1 tag cache 写放大账单

外部经验：OpenNext 早期版本曾出现 D1 tag cache 写放大，社区报告过极高账单。

当前状态：

- 项目使用 `@opennextjs/cloudflare 1.19.4`。
- 2026-04-26 runtime cache removal 后，当前上线链路不再配置 R2 incremental cache、D1 tag cache 或 Durable Object queue。
- 内容更新采用静态生成 + 重新部署，不走运行时 tag cache。

当前判断：已通过架构简化规避这类账单风险。

保持要求：

- 不要降级 OpenNext。
- 不要在没有单独设计和成本上限的情况下重新引入 R2 / D1 / DO runtime cache stack。
- 如果以后重新引入 tag cache，必须重新跑 Cloudflare build + deployed smoke，并记录成本上限和失败降级方式。

### A2. next-on-pages 相关兼容坑

外部经验：next-on-pages 与 Next.js 16、next-intl、Server Actions 有多类兼容问题。

当前状态：

- 项目走 OpenNext，不走 next-on-pages。

当前判断：next-on-pages issue 只作为背景，不是当前主风险。

保持要求：

- 不要为了短期绕 bug 切回 next-on-pages。
- 所有 Cloudflare 适配仍以 OpenNext 口径为准。

### A3. React 19.2 早期 RSC 安全问题

外部经验：React 19.2.0 附近有 RSC 安全公告，修复版本要求高于早期 19.2.x。

当前状态：

- 项目当前是 `react 19.2.5` / `react-dom 19.2.5`。

当前判断：版本层面已越过已知风险点。

保持要求：

- React / Next 依赖升级走补丁线同步，不单独升级一半。
- 升级后至少跑 `pnpm build`、`pnpm build:cf`、关键页面 smoke。

### A4. Sentry Workers 静默丢事件和 bundle 膨胀

外部经验：Sentry 在 Workers 上曾有事件未刷出、server bundle 变大的问题。

当前状态：

- 当前项目没有 `@sentry/nextjs`。

当前判断：现在不受影响。

保持要求：

- 接 Sentry 前先做单独设计，不要直接套 Next.js 默认接法。
- 如果以后接，优先考虑 client error-only，server 侧必须验证 Cloudflare Workers 下事件能送达。

### A5. Next.js 默认图片优化在 Cloudflare 上的账单坑

外部经验：默认 `/_next/image` 路径在 Cloudflare + OpenNext 下可能缺少缓存头，图片请求可能穿透到 Worker 或图片转换链路。

当前状态：

- `next.config.ts` 在 `DEPLOY_TARGET=cloudflare` 时设置 `images.unoptimized = true`。

当前判断：当前不会走文章里说的默认图片优化黑洞。

保持要求：

- 不要直接删除 `unoptimized: true`。
- 要恢复图片优化时，只能走 C2 的正式图片方案，不要回到默认 `/_next/image`。

---

## B. 当前需要复核

这些不是今天必须改代码，但需要在近期给出明确结论。

### B1. R2 / D1 / Durable Objects 缓存架构防回退

当前状态：

- 2026-04-26 已决定不保留 R2 / D1 / Durable Objects 运行时缓存架构。
- `open-next.config.ts` 不再配置 R2 incremental cache、D1 tag cache、DO queue。
- `wrangler.jsonc` 不再绑定 R2、D1、Durable Object、self-reference service。
- 旧 `/api/cache/invalidate` 路由和运行时 invalidation CLI 已移除。

为什么仍要复核：

Tianze Website 是 B2B 展示和询盘站，内容更新频率不高。运行时缓存体系带来的成本、部署复杂度和排障成本高于收益。现在的重点不是“是否必要”，而是防止后续改动把旧架构悄悄带回来。

建议动作：

1. 继续阻止 `revalidateTag`、`revalidatePath`、`cacheTag` 成为内容更新机制。
2. 继续阻止 `wrangler.jsonc` 重新出现 R2 / D1 / Durable Object runtime cache bindings。
3. 如果业务明确要求运行时局部刷新，必须先写新的架构决策记录，不得直接恢复历史 POC。

最小验证：

- 跑 `pnpm build:cf:phase6`。
- 跑 Cloudflare deployed smoke。
- 跑 `pnpm review:cf:official-compare`，确认生成后的 phase6 部署产物没有旧 bindings / invalidation route 回归。

建议结论方向：

维持静态内容 + 部署重建。询盘站稳定性比缓存技巧更重要。

### B2. 不依赖 `revalidateTag` / ISR 做核心内容更新

外部经验：

- `revalidateTag`、stale-while-revalidate、ISR、PPR 在 Cloudflare + OpenNext 上都有行为偏差报告。
- Worker 响应结束后，后台刷新可能不会按 Next.js 文档语义完成。

当前状态：

- 仓库已经有 Cloudflare Cache Components 约束：转换页、联系页、询盘页不能使用复杂缓存边界。

当前判断：

这个方向是对的，但还需要持续复核代码里有没有偷偷引入运行时重验证。

建议动作：

1. 搜索 `revalidateTag`、`revalidatePath`、`next: { revalidate`、`cacheTag`、`cacheLife`。
2. 对每处使用判断：是否会影响询盘、产品详情、SEO 输出。
3. 对内容更新采用部署时重建作为默认路线。

验收口径：

- 核心页面不靠运行时 ISR 修正内容。
- 表单和 API 不依赖 Cache Components 的复杂重验证语义。

### B3. Middleware / locale / 静态资产路由在 deployed 环境的真实表现

外部经验：

- Cloudflare 适配层可能先处理 asset manifest，再进入 middleware。
- i18n rewrite、locale cookie、静态页面路径在生产环境可能和本地不一致。

当前状态：

- 项目当前运行时入口仍是 `src/middleware.ts`。
- 项目使用 next-intl，多语言路径是上线关键面。

建议动作：

1. deployed smoke 覆盖 `/en`、`/es` 或实际支持语言的核心页面。
2. 覆盖产品页、联系页、能力页、404、locale redirect。
3. 检查 cookie、redirect、canonical、hreflang 输出。

验收口径：

- 不只看首页。
- 至少验证一个非默认语言页面。
- 至少验证一个产品或能力详情路径。

### B4. 生产构建才出现的问题要进入 smoke 覆盖

外部经验：

- React 19、组件库、CSP、字体、Sentry、第三方脚本都有 "dev 正常、production 才坏" 的案例。

当前状态：

- 项目已有标准构建和 Cloudflare 构建链路，但最终行为仍要靠 smoke 证明。

建议动作：

1. smoke 脚本继续覆盖首屏、导航、表单入口。
2. 增加对 header、SEO schema、图片 URL、locale 的轻量检查。
3. 新增第三方脚本前，必须先在 production build 下测。

### B5. Cloudflare 计划口径要保持单一

外部经验：

- Workers bundle size、CPU、构建分钟、Smart Placement、Durable Objects、R2、D1 都可能影响账单。

当前状态：

- 当前部署口径按 Workers paid plan 能力做规划：已启用 Smart Placement，并保留 phase6 split-worker 部署链。
- PR #87 已移除当前上线链路里的 R2 / D1 / Durable Object runtime cache 依赖；这些不再作为本轮上线成本项。

建议动作：

1. 部署文档只保留 paid Workers plan 口径，不再同时承诺 free-tier bundle 目标。
2. 如果未来重新引入 R2 / D1 / Durable Objects，必须重新做成本和行为评审。
3. 月度账单观察放到上线后运营检查，不阻塞当前 workers.dev preview 收尾。

---

## C. 上线前必须处理

这些直接影响海外买家访问、询盘转化或上线证明。

### C1. 真实图片上线前必须有 Cloudflare 图片方案

当前状态：

- 现在很多图片仍是 SVG 占位或少量 JPG。
- Cloudflare 下已经关闭 Next 默认图片优化。

问题：

短期这样安全，但真实工厂图、产品图、设备图上线后，直接输出原图会拖慢页面。买家在海外访问时，图片体积会直接影响首屏速度和信任感。

上线前要求：

1. 真实图片入库前先定义尺寸策略。
2. Cloudflare 环境使用 custom image loader。
3. 图片 URL 走 `/cdn-cgi/image/...`，不走 `/_next/image`。
4. Cloudflare Cache Rule 匹配 `/cdn-cgi/image/*`。
5. 线上抓 header，确认 `cache-control`、`cf-cache-status`、实际图片格式。

不建议现在做的事：

- 不要一开始就上 Cache Reserve。
- 不要为占位 SVG 做复杂图片链路。

触发条件：

- 首页 hero 换真实照片。
- 产品列表或产品详情换真实照片。
- 案例图、工厂图、质检图上线。

### C2. Cloudflare deployed smoke 必须覆盖询盘链路

当前风险：

构建通过不代表表单能在 Cloudflare 上正常提交。Server Actions、API route、Turnstile、Resend、Airtable、IP header 都是 Cloudflare runtime 相关点。

上线前要求：

1. 验证联系页或询盘页可打开。
2. 验证表单校验正常。
3. 验证一次真实提交链路，至少到服务端接收和邮件发送层。
4. 验证 Cloudflare 下 client IP 使用内部可信 header，而不是裸信任 `cf-connecting-ip`。

验收命令口径：

- `pnpm build`
- `pnpm build:cf`
- `pnpm smoke:cf:deploy -- --base-url <production-or-preview-url>`

### C3. Resend 仍是当前邮件路线，不能换 Cloudflare 原生邮件

外部经验：

- Cloudflare 原生邮件能力还不适合作为询盘通知主路径。
- Workers 不支持 SMTP，必须走 HTTP API。

当前状态：

- 项目已依赖 Resend。

上线前要求：

1. 生产环境 Resend key 和发件域名验证完成。
2. SPF / DKIM / DMARC 配好。
3. deployed 环境实测能收到询盘通知。
4. 失败时要有可观测日志或 fallback 记录。

### C4. SEO 输出必须用真实线上 URL 验证

外部经验：

- JSON-LD、sitemap、hreflang、canonical 常见问题是静默失败。
- 搜索引擎不一定立刻报错，但会影响收录质量。

上线前要求：

1. sitemap 使用线上域名，不出现 preview、localhost、代理源站域名。
2. canonical 和 hreflang 与实际 locale 路径一致。
3. JSON-LD 不声明不存在的 `/search` 或不真实的公司能力。
4. 多个 schema 的输出要能被 Google Rich Results 或等价工具验证。

### C5. 第三方脚本必须克制

外部经验：

- 聊天插件、GTM、Rocket Loader、Sentry 都可能影响性能或数据准确性。

当前判断：

Tianze Website 是 B2B 询盘站，不需要为了 "在线感" 优先接重型聊天插件。

上线前要求：

1. 不接 Intercom / Crisp / Tawk.to 作为默认方案。
2. 优先表单 + 邮件通知。
3. Analytics 先轻量接入，避免阻塞首屏。
4. 如果使用 GA4/GTM，不开会改写脚本行为的 Cloudflare 优化项，或者必须实测。

---

## D. 暂时只观察

这些内容有价值，但现在不应该占用主线。

### D1. Vinext 替代 OpenNext

外部经验：

- 有开发者报告 Vinext 构建更快、bundle 更小。

当前判断：

项目已经围绕 OpenNext 建了构建、preview、deploy、smoke 和 Cloudflare 配置。现在切适配器会打乱主线。

观察触发条件：

- OpenNext 阻塞正式部署。
- bundle size 无法控制。
- Cloudflare runtime bug 无法绕过。

### D2. Cache Reserve

外部经验：

- Cache Reserve 可以降低边缘缓存被淘汰后再次触发图片转换的概率。

当前判断：

现在图片量和访问量还没到需要这一步。先用 custom loader + Cache Rule。

观察触发条件：

- 真实图片很多。
- 图片转换费用明显上升。
- 热点页面跨区域访问多，`cf-cache-status: MISS` 比例过高。

### D3. Sentry server-side Workers 接入

外部经验：

- Sentry 在 Workers 上要关注事件 flush、bundle size、吞吐损耗。

当前判断：

当前没接 Sentry，先不引入复杂监控栈。上线初期可以先用 Cloudflare 日志 + 轻量客户端错误上报。

观察触发条件：

- 表单或运行时错误无法靠 Cloudflare 日志定位。
- 出现真实用户错误需要留存和聚合。

### D4. Cloudflare Web Analytics 替代 GA4

外部经验：

- Cloudflare Web Analytics 更轻，适合性能优先站点。

当前判断：

可以作为补充，但不能替代业务转化归因。B2B 询盘站至少要知道询盘来自哪个渠道。

观察触发条件：

- GA4/GTM 明显拖慢页面。
- 当前阶段只需要基础访问趋势，不需要完整广告归因。

### D5. Reddit / Hacker News / GitHub Issue 经验库持续追踪

外部经验：

- Next.js + Cloudflare + OpenNext 的很多风险先出现在 issue 和个人博客，不会先出现在官方文档。

当前判断：

值得保留调研习惯，但不要让调研替代本项目验证。

建议节奏：

- 依赖升级前查一次。
- Cloudflare 部署异常时查一次。
- 正式上线前查一次。

---

## 后续维护规则

1. 新增外部经验时，不直接加入执行项，先归入 A/B/C/D。
2. 每条 C 类风险必须有验证口径。
3. 每条 B 类风险必须有负责人能执行的复核动作。
4. D 类只记录触发条件，不提前实现。
5. 如果项目配置已经改变，先更新 "当前项目基线"，再更新分类。

## 相关文件

- `exa-results/nextjs-cloudflare-pitfalls-2026-04-26.md`
- `docs/technical/deployment-notes.md`
- `docs/guides/CLOUDFLARE-ISSUE-TAXONOMY.md`
- `docs/guides/RELEASE-PROOF-RUNBOOK.md`
- `open-next.config.ts`
- `wrangler.jsonc`
- `next.config.ts`

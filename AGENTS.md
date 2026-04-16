这个文件的作用是描述 agent 在项目中可能遇到的常见错误和困惑。
如果你遇到任何令你惊讶的事，请提醒开发者并建议更新 Agent.md。

## 面向非开发者的汇报方式

### 默认假设
- 默认把提问者当作“聪明但不看代码的人”，不是默认当作开发者。
- 最终汇报优先用容易理解的中文，先讲结论，再讲影响，再讲风险和下一步。
- 重点回答“这对我有什么影响”，而不是“底层实现细节是什么”。

### 推荐表达方式
- 多用这种句式：
  - “现在升级了，以后少挨打。”
  - “这不是马上能看见的大变化，但能减少后面继续踩坑的概率。”
  - “短期收益不大，长期维护更省事。”
  - “这能改善开发时的稳定性，但不能解决你现在最头疼的部署问题。”
  - “它更像补丁和兜底，不是翻盘级修复。”
- 解释版本升级时，优先拆成四件事：
  - 现在能直接得到什么好处
  - 现在解决不了什么问题
  - 以后能少踩什么坑
  - 升级后还要验证什么

### 术语翻译规则
- 如果必须提术语，第一次出现时立刻翻成白话。
- 例如：
  - “热更新”，补一句“也就是你改完文件后，本地通常不用重启就能看到效果”
  - “构建链路”，补一句“也就是项目从代码变成可部署产物的那套流程”
  - “运行时入口”，补一句“也就是请求进来后最先经过的那层”
  - “回归风险”，补一句“也就是原来好的东西被这次改动带坏的风险”
  - “适配器 / adapter”，补一句“也就是把 Next.js 产物接到目标平台上的那层桥接”

### 禁止事项
- 不要一上来堆文件名、函数名、配置项名。
- 不要把回答写成提交记录、改动清单或术语列表。
- 不要默认读者知道 Turbopack、OpenNext、RSC、PPR、Server Action 这些词。
- 不要只说“支持了什么特性”，要补一句“对这个项目有什么实际意义”。

### 推荐结构
- 对版本更新、依赖升级、架构判断，优先按这个顺序写：
  1. 一句话结论
  2. 这件事现在的实际收益
  3. 这件事解决不了的部分
  4. 长期价值（例如“以后少挨打”）
  5. 如果要动手，下一步怎么验证

### 示例对比
- 不推荐：
  - “修复了 TypeScript v6 deprecations for baseUrl and moduleResolution。”
- 推荐：
  - “这不是眼前就会爆炸的问题，但现在跟上后，以后升级 TypeScript 时会少踩配置坑。简单说，就是现在花很小的成本，换以后少挨打。”

## 项目经验补充

### 0. 性能治理先收口到 `docs/guides/PERFORMANCE-GOVERNANCE.md`
- 遇到 “性能优化 / showcase 借鉴 / 该不该 lazy load / 该不该上 cache” 这类问题时，先看 `docs/guides/PERFORMANCE-GOVERNANCE.md`。
- 当前默认立场：
  - `nextjs-perf-showcase` 只能借思路，不能当 starter 或迁移模板
  - 不要把 page-level `'use cache'` 扩散到 Contact / inquiry / subscribe / health / Server Action / Cloudflare 强耦合路径
  - 性能 proof 先回 Node `20.19.x` 真相环境
  - Cloudflare proof 仍按现有 proof 边界执行，不要把 cleanup 和 runtime/platform proof 混成一个 PR
- 默认动作：
  - 先用 `docs/guides/PERFORMANCE-GOVERNANCE.md` 判断“现在该不该动”
  - 再用 `docs/guides/CANONICAL-TRUTH-REGISTRY.md` 判断“当前运行时真相在哪里”
  - 如果是分阶段性能治理，顺序固定为：治理真相 -> architecture guardrails -> Turnstile 规范统一 -> dormant truth audit -> cleanup
  - 如果用户给了“唯一执行真相源”路径，但本地文件不存在，先记录冲突，不要自行猜当前 workstream

### 1. 不要直接相信 `legacy` / `deprecated` / `Currently used by` 注释
- 这个仓库里，注释和真实生产引用面可能已经脱节。
- 遇到下面这些信号时，必须先用代码搜索确认真实引用面，再决定是否继续沿用、删除或迁移：
  - `legacy helper`
  - `@deprecated`
  - `Currently used by`
  - “迁移指南 / Migration guide”
- 默认动作：
  - 先执行 `rg -n "<symbol>" src tests`
  - 区分“生产引用”与“仅测试引用”
  - 如果某模块主要靠测试保活，不要把它误判为生产真相源

### 2. 测试覆盖到某模块，不等于该模块仍在生产链路中
- 本仓库已经出现“旧实现主要被测试引用，但生产代码已切到共享实现”的情况。
- 所以在审查共享 helper、基础设施层、API 工具层时，必须额外确认：
  - 是否仍被 `src/**` 的生产代码引用
  - 还是只剩 `__tests__` / `tests/**` 在消费
- 如果只是测试在用，这通常意味着：
  - 要么测试在保活旧实现
  - 要么仓库里还留着一个会误导维护者的假入口

### 2.1 Node 版本真相要同时看 `engines`、`.nvmrc`、CI 和依赖最低门槛，不要只看“大版本 20”
- 截至 2026-04-01，本仓库已经确认：
  - `package.json > engines.node` 当前是 `>=20.19 <21`
  - `.nvmrc` / `.node-version` 当前固定为 `20.19.0`
  - GitHub Actions 当前也固定在 `20.19.0`
  - 同时，一批直接依赖已经把 Node 20 的最低线抬到了 `20.19.x`
- 这意味着：
  - 当前主线就是 Node 20 策略，不要再把本地 `22.x` 当作默认兼容真相
  - “支持 Node 20”也要精确到最低补丁线 `20.19.x`
  - 只看 `@types/node` 或只看 `engines`，都不足以代表完整真相
- 默认动作：
  - 只要升级会影响运行时、构建链路、Lint/Test 基础设施，就同时核对：
    - `package.json > engines.node`
    - `.nvmrc`
    - `.node-version`
    - `.github/workflows/**` 里的 `setup-node`
  - 如果依赖已经抬高 Node 20 的最低补丁版本，必须把这些文件一起更新，不要只改其中一个
  - 汇报时要明确区分：
    - 默认开发版本
    - CI 合并真相版本
    - 当前主线允许版本范围

### 3. 修改 `apiErrors` 时，必须同步 `messages/*.json` 和 `messages/*/critical.json`
- 本仓库的翻译会同时从完整消息文件和 critical bundle 读取。
- 如果只改 `messages/en.json` / `messages/zh.json`，不改 `messages/en/critical.json` / `messages/zh/critical.json`，就会出现：
  - 开发态或部分测试通过
  - 但实际首屏关键路径仍缺翻译 key
- 默认动作：
  - 同步搜索并更新 4 个文件
  - 至少执行一次 `pnpm validate:translations`

### 3.1 当前消息真相以共享 split bundles 为准
- 截至当前收缩阶段，本仓库运行时消息真相以共享 split bundles 为准：
  - `messages/{locale}/{critical,deferred}.json`
- 默认动作：
  - 所有当前生效文案先改共享基础消息
  - 不要重新引入站点级运行时消息覆盖层

### 4. 当前双平台部署下，优先保留 `src/middleware.ts`
- 截至 2026-03-19，本仓库为了兼容当前 Cloudflare 链路，运行时入口仍保留为 `src/middleware.ts`。
- 原因是：`src/proxy.ts` 虽然能通过 `next build`，但会阻塞 `pnpm build:cf`。
- 默认动作：
  - 当前修改 locale redirect / CSP nonce / 安全头部时，优先改 `src/middleware.ts`
  - 每次涉及该入口文件的改动，至少执行一次 `pnpm build` 和 `pnpm build:cf`
  - 如果未来再次迁移 `middleware -> proxy`，`config.matcher` 仍必须只写静态字面量；不能引用常量、拼装数组或动态值，否则 Turbopack 会报 `matcher[...] need to be static strings or static objects`

### 5. OpenNext `minify` 仍不要默认重新打开
- 截至 2026-04-01，本仓库最新隔离实测显示：
  - 在早先基线 `next@16.2.0` + `@opennextjs/cloudflare@1.17.3` 下，重新打开 `minify` 后，旧的 `pnpm build:cf` 构建报错这次**没有复现**；
  - 但继续往下做本地 Cloudflare 预览时，页面路由仍会触发 `middleware-manifest.json` 动态 require 相关 500；
  - 当前升级分支已经来到 `next@16.2.2` + `@opennextjs/cloudflare@1.18.0`，而 repo-local 补丁和 phase6 deployed smoke 也已经打通；这依然**不等于**可以默认打开 `minify`；
  - 所以旧结论“只要打开就会构建炸掉”已经太绝对了，但“现在可以放心打开”也同样不成立。
- 当前默认稳定做法仍然是：在 `open-next.config.ts` 中把 split functions 和 default worker 的 `minify` 关闭。
- 默认动作：
  - 如果有人想重新打开 `minify`，不要把它当作“纯性能优化”随手改动；
  - 至少重新执行 `pnpm build:cf`，并补一轮 Cloudflare preview / deploy smoke；
  - 只有在构建、页面 smoke、最终部署 smoke 都重新验证通过后，才允许恢复。

### 6. 不要并行执行 `pnpm build` 和 `pnpm build:cf`
- 截至 2026-04-01，本仓库已验证：
  - `build:cf` 当前不再是“直接调用 `pnpm build`”那条旧实现，而是走 `scripts/cloudflare/build-webpack.mjs` 里的 Webpack 构建包装；
  - 但两条命令仍然都会写 `.next`，如果并行执行，仍然会互相污染，得到假的失败结果；
  - 另外，普通 `pnpm build` 在已有旧 `.next` 产物时，仍可能偶发落回 `Maximum call stack size exceeded`；
  - 当前仓库已把 `build:cf` 收敛成自清理脚本：它会先执行 `scripts/clean-next-build-artifacts.mjs` 再做 Cloudflare 构建。
- 默认动作：
  - 需要验证双链路时，先跑 `pnpm clean:next-artifacts && pnpm build`，再串行跑 `pnpm build:cf`
  - 涉及 `preview:cf` / `deploy:cf:*` / `deploy:cf:phase6:*` 时，优先走当前脚本里已经内置清理的版本；不要自己跳过 `.next` / `.open-next` / `.wrangler/tmp` 清理后再拿 `Maximum call stack size exceeded` 这类结果当新回归
  - 当前默认本地 Cloudflare 预览入口应优先用 `preview:cf`（内部走 stock `opennextjs-cloudflare preview`）；`preview:cf:wrangler` 仅保留为诊断路径，不要把它的结果直接当成页面级 release proof

### 7. 不要再用客户端补丁修正 `html[lang]`
- 本仓库已经验证过：`LangUpdater + document.documentElement.lang` 会把语言语义推迟到 hydration 后，SSR / 无 JS / 爬虫首包都是错的。
- 正确做法：
  - 让真正的 root layout 在服务端直接输出 `<html lang={locale}>`
  - 客户端组件用 `next-intl` 的 locale context（如 `useLocale()`），不要偷读 `document.documentElement.lang`

### 8. 不要把 stock `opennextjs-cloudflare preview` 当成 phase6 / split-worker 的完整真相
- 截至 2026-04-01，本仓库已验证：
  - stock `opennextjs-cloudflare preview` 仍然主要走默认 worker 路径；
  - 当前主线在 generated patch 条件下，页面级 `smoke:cf:preview` 与 `smoke:cf:preview:strict` 都已拿到通过证据；strict 失败应优先视为新的回归信号；
  - 把 Next 升到 `16.2.2` 后，OpenNext / Wrangler 组合在本地页面预览里重新暴露了 `middleware-manifest.json` 动态 require 回归；
  - 当前仓库已经补了一层 repo-local 兼容补丁：`scripts/cloudflare/patch-prefetch-hints-manifest.mjs` 会把生成产物里的 `getMiddlewareManifest()` 从动态 `require()` 改成 `loadManifest()`，这样页面级 `smoke:cf:preview` 又能恢复通过；
  - phase6 dry-run 之前卡住的重点不再是 worker 体积，而是 split worker 在 Wrangler bundling 时会继续拉入 Next 运行时代码；当前仓库通过两步把这条线重新打通：
    - 显式补上 `react-server-dom-webpack`、`react-server-dom-turbopack`、`critters`
    - 在 `scripts/cloudflare/build-phase6-workers.mjs` 生成的 phase6 wrangler 配置里，把 `@vercel/turbopack-ecmascript-runtime/browser/dev/hmr-client/hmr-client.ts` alias 到空 shim
  - 这轮之后，`pnpm deploy:cf:phase6:dry-run` 已重新通过；
  - 所以它依然能提供重要的本地信号，但它不能自动证明 phase6 / split-worker 的最终运行形态是对的。
- 同期还验证到：即使直接对 `.open-next/wrangler/phase6/*.jsonc` 跑 `wrangler dev --no-bundle`，本地也可能在 Wrangler / Miniflare 启动层就失败，并不一定是业务路由或 repo 配置错了。
- 默认动作：
  - 把 stock preview 当作“局部信号”，不要当作 split-worker release proof；
  - 如果版本升级后 stock preview 页面先变成 500，要把它当作“升级回归信号”，但不要直接把它等同于 deployed phase6 最终真相；
  - 如果 phase6 本地验证失败，先区分：
    - 默认 worker 路径问题，
    - 还是本地 Wrangler / Miniflare 启动问题；
  - 不要在没有新证据前持续堆本地 harness 胶水代码。

### 9. 本地并行跑多个 `wrangler dev` 时，必须显式分配不同 `--inspector-port`
- 截至 2026-03-26，本仓库在尝试 phase6 本地多 worker 验证时，已经确认：
  - 不同 worker 的 `wrangler dev` 会因为 inspector 端口冲突互相干扰；
  - 即使业务端口不同，如果 `--inspector-port` 重复，也会出现误导性的 “Address already in use”。
- 默认动作：
  - 每个本地 worker 明确给独立的 `--port` 和 `--inspector-port`；
  - 如果仍然报端口占用，不要立刻判断为业务代码问题，先检查本地 `workerd` 残留和 Wrangler 自身启动状态。

### 10. Contact Server Action 在 Cloudflare 下不要直接信原始代理头，优先走 middleware 派生的内部 client IP
- 截至 2026-03-26，本仓库已验证：
  - API route 可以基于 `NextRequest` 做 Cloudflare source-aware 的 client IP 推导；
  - 但 Contact Server Action 只有 `headers()`，直接信 `cf-connecting-ip` / `x-forwarded-for` 会丢失“请求是否来自可信 Cloudflare 入口”的上下文；
  - 之前 `getClientIPFromHeaders()` 因此在 Cloudflare 分支故意 fail closed，导致 Contact 主转化路径退化到 `0.0.0.0`。
- 当前稳定做法：
  - 在 `src/middleware.ts` 里先派生并覆盖内部请求头 `x-internal-client-ip`；
  - Cloudflare 下的 `getClientIPFromHeaders()` 只信这个内部头，不直接信原始 Cloudflare 头。
- 默认动作：
  - 如果再改 Contact Server Action 的 client identity 链路，先确认 middleware 内部头有没有一起被维护；
  - 至少执行：
    - `pnpm exec vitest run src/lib/security/__tests__/client-ip.test.ts src/app/__tests__/actions.test.ts src/app/__tests__/contact-integration.test.ts src/__tests__/middleware-locale-cookie.test.ts tests/unit/middleware.test.ts`
    - `pnpm build`
    - `pnpm build:cf`

### 11. Cloudflare 证明边界要写死在脚本里，不要靠人脑记住
- 截至 2026-04-01，本仓库当前更可信的做法是：
  - stock `opennextjs-cloudflare preview` 只作为本地 page/header/cookie/redirect 真相检查；
  - `/api/health` 等最终 API 证明，应放到真实部署后的 smoke 里做。
- 当前脚本分工：
  - `pnpm smoke:cf:preview`
    - 默认只验证 `/`、locale 页面、Contact 页面、invalid locale redirect、cookie flags、内部 header 泄漏、manifest crash
    - 当前升级线在 repo-local 补丁生效后，仍可作为页面级已验证信号
  - `pnpm smoke:cf:preview:strict`
    - 当前默认把 `/api/health` 纳入本地 strict smoke；在 generated patch 条件下已拿到通过证据
    - 如果 strict 失败，默认先当作需要排查的回归信号，而不是旧已知噪音
  - `pnpm smoke:cf:deploy -- --base-url <url>`
    - 对真实部署地址做最终 smoke，包括 `/api/health`
- 默认动作：
  - 不要因为 `smoke:cf:preview` 通过就宣布 Cloudflare 完全闭环；
  - 如果 `smoke:cf:preview:strict` 失败，先定位是 stock preview 边界问题还是新的当前主线回归，再决定是否继续下游 proof；
  - 如果 Next / OpenNext 版本升级后连 `smoke:cf:preview` 的页面级检查都开始报 500，这属于“升级安全性未拿到证明”，默认不要继续推进到主线；
  - 先看失败属于：
    - stock preview 边界内的问题，
    - 还是必须由 deployed smoke 证明的问题。

### 12. `build:cf` 现在走 Webpack 主链路，但“构建通过”不等于 Cloudflare 本地页面证明也通过
- 截至 2026-04-01，本仓库已验证：
  - `pnpm build:cf` 的正式实现现在是 `node scripts/cloudflare/build-webpack.mjs`；
  - `pnpm build:cf:turbo` 仅保留为对照/排查链路，不再是默认 Cloudflare 构建入口；
  - 在早先基线 `next@16.2.0` + `@opennextjs/cloudflare@1.17.3` 下，`pnpm build:cf` 和 `pnpm build:cf:turbo` 都能通过；
  - 但这不代表本地 Cloudflare 页面证明天然就没问题：Next 升到 `16.2.2` 后，即使 `pnpm build:cf` 仍然通过，生成产物里的 `getMiddlewareManifest()` 也可能退回动态 `require(this.middlewareManifestPath)`，从而让 stock preview 的页面路由重新 500；
  - 当前仓库已经把这个兼容修复收敛到 `scripts/cloudflare/patch-prefetch-hints-manifest.mjs`：`pnpm build:cf` 结束后会补丁默认 handler，把 middleware manifest 改为走 `_loadmanifestexternal.loadManifest(...)`；
- 截至当前 official-alignment 收口后，只要剩余 generated-artifact compat patch 仍在，当前更可信的 Cloudflare build / preview 证明模式仍然是 `CF_APPLY_GENERATED_PATCH=true pnpm build:cf` 与 `CF_APPLY_GENERATED_PATCH=true pnpm preview:cf`；不要把 plain `pnpm build:cf` 当成当前正式 proof 命令。
  - 这层补丁已经在本地干净构建下重新验证过：`/en`、`/zh`、`/en/contact`、`/zh/contact` 页面恢复 200，`pnpm smoke:cf:preview` 恢复通过；
  - 改成 `wrangler dev --env preview --no-bundle` 后，本地又可能卡在 `cloudflare/images.js` 模块缺失。
- 当前默认动作：
  - 把 Webpack 视为当前正式 Cloudflare 构建链路；
  - 不要把本地 Wrangler preview 当成这条主链路的完整 release proof；
  - 也不要把“`build:cf` 通过了”误当成“Cloudflare 页面路由已经得到证明”；
  - 如果遇到 `Maximum call stack size exceeded`，先区分是不是旧 `.next` / `.open-next` / `.wrangler/tmp` 产物残留；当前 `preview:cf` / `deploy:cf:*` / `deploy:cf:phase6:*` 已经内置清理，不要先把它误判成新的业务回归；
  - 如果 local preview 页面 500 重新落回 `middleware-manifest.json` 动态 require 这类生成产物回归，优先检查 `scripts/cloudflare/patch-prefetch-hints-manifest.mjs` 有没有生效，不要先回滚业务改动；
  - 如果 `preview:cf` 能通过页面 smoke、但 `preview:cf:wrangler` 仍在页面请求里报 `Cannot perform I/O on behalf of a different request` / request hang，这先归类为 Wrangler 本地运行时边界，不要把它误写成页面业务回归；
  - 本地 Cloudflare 页面验证仍优先走既有的 `smoke:cf:preview` 分层策略；
  - 如果未来要把 Wrangler 本地 preview 提升为更强的正式证明面，必须先补一轮本地可运行证据。

### 13. 不要把 “Turbopack / OpenNext 会重复翻译” 当成已经坐实的仓库真相
- 截至 2026-04-01，本仓库最新隔离实测里：
  - 在 `next@16.2.0` + `@opennextjs/cloudflare@1.17.3` 基线下，对比普通 `next start` 和 stock `opennextjs-cloudflare preview` 的 `/en`、`/en/contact` 页面可见文本，结果一致；
  - 这次没有复现“内容被重复翻译一遍”的现象。
- 默认动作：
  - 如果以后再有人报告这类问题，先做同路由、同语言、同内容的渲染结果对比；
  - 在拿到最小可复现样本前，不要把这类口口相传的怀疑写成仓库级事实。

### 14. AI 味道 No-Go Defaults
- 不要为关键路径新增测试专用分支。`TEST_MODE`、`PLAYWRIGHT_TEST`、`ALLOW_MEMORY_*` 只能作为明确的 test/preview 边界，不能拿来充当最终证明。
- 不要把关键失败改成 `skip`。Contact / inquiry / subscribe / deploy smoke 一旦坏了，默认应该报红。
- 不要给安全 / 限流 / 幂等 / 去重链路新增静默 fail-open。必要降级必须可观察、可区分，而且不能伪装成正常成功。
- 不要把测试常量、测试工具、`src/test/**`、`src/testing/**` 引进生产代码。
- 不要在 live 页面留下 placeholder 资源、明显占位块或 `Coming Soon` 设计。
- 不要让主要依赖 heavy mock 的弱测试在文档里被描述成主证明。
- 只要改动了 contact / inquiry / subscribe / health / behavioral contracts / smoke tests，就必须同步检查行为合同和最终证明面是否仍然成立。

### 15. 多站点 base URL 真相必须按站点显式收口
- 当前仓库已经确认：第二站不能默认继承全局 `NEXT_PUBLIC_BASE_URL`，否则 canonical、OG URL、sitemap、结构化数据、Turnstile host 校验都可能继续吐主站域名。
- 默认动作：
  - 站点对外 URL 先看 `src/config/single-site.ts` 的默认值；
  - 当前激活站点如需覆盖，优先用 `NEXT_PUBLIC_SITE_URL`；
  - 如果要给某个站点长期单独配置，使用该站点专属 env，而不是继续偷用全局主站 URL；
  - 任何改动后至少验证 metadata、sitemap/structured data 与联系页标题没有跨站串值。

### 16. 当前默认验证入口以单站收缩预检为准
- 默认动作：
  - 如果改动涉及单站身份、SEO 默认值、共享消息、导航、页脚或产品目录，优先跑 `pnpm truth:check`、`pnpm review:translation-quartet`、`pnpm review:translate-compat`
  - 如果改动同时触及运行时或 Cloudflare 链路，再串行补 `pnpm clean:next-artifacts && pnpm build` 与 `CF_APPLY_GENERATED_PATCH=true pnpm build:cf`
  - 不要再把第二站试装当作主线结构 proof

### 17. 当前执行顺序：先吸收，再清理，再试装，最后才上多站结构
- 当前仓库的默认推进顺序已经固定：
  - 先固定真相源和总入口
  - 先吸收参考仓库的非结构性做法
  - 先整理当前单站的站点身份、内容资产、SEO 资产和证明边界
  - 再更新 AI 规则文档
  - 再做第二个真实站点最小试装
  - 最后才进入多站结构正式落地
- 默认动作：
  - 不要跳过前面的非结构性吸收和单站清理，直接把仓库改成多站壳层
  - 如果有人要求“现在就上多站结构”，先核对当前阶段是否已经完成上面前五步

### 18. 单站身份层当前真相已经收口到 `src/config/**`
- 当前仓库的主真相层：
  - `src/config/single-site.ts`
  - `src/config/site-types.ts`
  - `src/config/single-site-product-catalog.ts`
- `src/config/paths/site-config.ts`、`src/config/site-facts.ts`、`src/constants/product-catalog.ts`、`src/config/footer-links.ts`、`src/lib/navigation.ts` 仍是消费包装层，不再是第一真相源。
- 默认动作：
  - 改品牌、联系信息、默认 SEO、导航、页脚、市场结构时，先改 `src/config/single-site.ts`
  - 不要在兼容包装层重新发明 Tianze 专属真相

### 19. `/about` 的当前运行时真相不是 MDX
- 截至 2026-04-01，`content/pages/en/about.mdx` / `content/pages/zh/about.mdx` 是内容资产，但当前真正渲染 `/[locale]/about` 的仍是 `src/app/[locale]/about/page.tsx` 加消息文件。
- 默认动作：
  - 如果要改当前 about 页面实际输出，先检查 `src/app/[locale]/about/page.tsx` 和 `messages/*/deferred.json`
  - 不要以为只改 MDX 就一定会直接影响当前 about 页面

### 20. Cloudflare 问题先归类，再下判断
- 当前仓库对 Cloudflare 相关失败，默认先按四类归因：
  - 平台入口 / 本地运行时问题
  - 生成产物兼容问题
  - 当前站运行时回归
  - 最终部署行为问题
- 参考：
  - `docs/guides/CLOUDFLARE-ISSUE-TAXONOMY.md`
- 默认动作：
  - 先说清是哪一类，再说症状
  - 不要把 local preview 的失败直接写成生产事实
  - 新增品牌、联系信息、社媒、基础 SEO、导航、页脚链接时，优先改 `src/config/single-site.ts`
  - 不要绕过 `src/config/single-site.ts` 直接在多个兼容入口里重复写站点信息

### 21. 模板残留默认必须持续清理，不允许重新回流到正式内容
- `content/config/content.json`、`content/pages/**`、`content/posts/**` 已开始从模板默认值切回 Tianze 真实内容。
- 默认动作：
  - 如果新增或改写内容，先确认不是把 `B2B Web Template` 一类模板语境重新写回正式内容
  - 如果发现模板残留，优先把它当成内容真相污染，而不是“小问题以后再说”

### 22. phase6 真实 preview 已有一条可运行主路，不要再回到会重复踩坑的旧写法
- 截至 2026-04-01，本仓库已验证：
  - `phase6` 真实 preview deploy 在 API token 认证下，`scripts/cloudflare/deploy-phase6.mjs` 在 release-proof.sh 中自动设置环境变量 `OPEN_NEXT_DEPLOY_ENV=true`；若手动运行该脚本需显式设置此环境变量，否则会掉回 OpenNext 自己的 deploy 包装路径，并卡在 remote R2 cache provisioning；
  - `phase6` 的 `gateway` 在 preview 环境里引用 `web/api-*` worker 时，必须直接指向带 `-preview` 后缀的真实 worker 名，不能再写成 `service + environment` 组合；
  - `web` / `api-*` 这些 phase6 worker 当前不要再生成 `WORKER_SELF_REFERENCE` service binding；这条绑定会把第一次 preview deploy 卡死在“自引用 worker 尚不存在”的发布时序问题上；
  - `phase6` 下的 `/api/health` 当前稳定做法是由 gateway 直接返回合同化 health 响应；继续穿过 `apiLead` 的完整 Next/OpenNext 运行时，会反复踩到 Cloudflare 侧的 CommonJS / fs 兼容边界。
- 默认动作：
  - 要验证 `phase6`，优先用 `node scripts/cloudflare/build-phase6-workers.mjs` 生成 worker/config，再用 `node scripts/cloudflare/deploy-phase6.mjs --env preview` 做真实 preview deploy；
  - 当前更可信的 phase6 proof 形态是“真实 preview deploy 输出的 gateway URL”，不要把某一次临时 preview 地址写死进规则；
  - 最终以 `pnpm smoke:cf:deploy -- --base-url <preview-url>` 为准；运行前必须先从 deploy 输出里拿到你自己的 preview URL；
  - 如果以后有人想把 `/api/health` 再改回 `apiLead` 运行链路，必须先重新拿到 deployed smoke 级别的 200 证据，不能只看 dry-run 或本地 preview。

### 23. 不要把 route 目录里的测试辅助文件随手丢进 `__tests__` 邻近位置
- 截至 2026-04-01，本仓库已验证：
  - 如果把测试辅助文件直接放在 `src/app/[locale]/contact/` 这样的 route 目录下，`truth:check` 会把它当成 route 目录里的孤儿文件；
  - 如果把没有测试用例的 helper 放进 `__tests__`，Vitest 又会把它当成空测试文件，导致整套 CI 假红。
- 默认动作：
  - route 相关测试 helper 优先放到 `src/testing/**` 这类共享测试目录；
  - 不要把“非测试文件”放进 `__tests__`
  - 如果 `truth:check` 报 route 目录孤儿文件，先检查是不是把测试工具放错了位置，不要先怀疑业务路由本身。

### 24. phase6 生成脚本改了拓扑合同后，不要默认 `build-phase6-workers.mjs` 也已经同步
- 截至 2026-04-09，本仓库已实际踩到两类“接口漂移”：
  - 同文件还可能继续引用旧常量名 `WORKER_NAME_SUFFIX`，而真实共享真相已经切到 `PHASE_WORKER_NAME_SUFFIX`。
- 这类问题的危险在于：
  - 普通 `pnpm build:cf` 可能通过；
  - 但一到 `pnpm build:cf:phase6` / `deploy-phase6` / 真实 preview proof 才会爆；
  - 很容易被误判成 Cloudflare / Wrangler / OpenNext 平台问题，其实是 repo 内部脚本没跟上共享合同。
- 默认动作：
  - 只要改了 `phase-topology-contract.mjs`、alias/shim 合同、worker 命名规则、route binding 规则，就必须同步审查 `scripts/cloudflare/build-phase6-workers.mjs`；
  - 至少执行一次 `node --check scripts/cloudflare/build-phase6-workers.mjs`；
  - 更重要的是执行一次 `pnpm build:cf:phase6`，不要只看 `pnpm build:cf`；
  - 如果 phase6 线失败，先检查是不是“生成脚本和共享合同漂移”，再去怀疑平台侧回归。

### 25. contact 页面恢复 200，不代表 API 线闭环
- 截至 2026-04-09，`pnpm proof:cf:preview-deployed` 已通过，`/en/contact` 与 `/zh/contact` 已恢复 200；这说明的是当前站 runtime 回归已修，不说明 API 线已经健康。
- 这次故障本质上是 `Uncached data was accessed outside of <Suspense>` 加上 Cloudflare runtime 里 `setTimeout()` / Cache Components 的边界问题；有效修法是静态消息 metadata、`getContactCopy()` 去掉 `use cache` / `cacheLife`，以及 `ContactForm` 走 client-only dynamic import。
- deeper API worker 仍可失败时，继续把它当 generated-artifact / runtime mismatch 技术债，不要把 contact 页恢复误报成 API 闭环。

### 17. 不要把 contact 这类关键页面的 `loading.tsx` 留成“空骨架”
- 截至 2026-04-01，本仓库已验证：
  - `src/app/[locale]/contact/loading.tsx` 这种 route-level loading 会直接影响无 JS / 慢流式首屏看到的真实内容；
  - 如果它只是几条灰骨架，`tests/e2e/no-js-html-contract.spec.ts` 会只看到空 `main` 和骨架占位，而看不到真正的标题与表单；
  - page 内部的 `Suspense fallback` 并不能替代 route-level loading 的首屏合同。
- 默认动作：
  - 对 contact / inquiry / subscribe 这类关键转化页，优先让 route-level loading 保持“有意义的首屏内容”，或者直接不要单独的 `loading.tsx`；
  - 如果 no-JS / SSR / 慢流式首屏合同失败，先检查是不是 route-level loading 抢先输出了空骨架；
  - 不要把“开发时看起来正常的 skeleton”默认当作线上首屏也合理。

### 18. 当前升级线先保留 `TypeScript 5.9.3`，不要把 `TypeScript 6` 当成已经完成的升级
- 截至 2026-04-01，本仓库已验证：
  - `typescript 6.0.2` 虽然能通过 `pnpm type-check`，但会把 `pnpm build` 重新带回不稳定状态；
  - 一类失败表现为 `next build` 在 TypeScript 阶段报 `Maximum call stack size exceeded`；
  - 当回退到 `typescript 5.9.3` 后，`tsconfig.json` 里的 `"ignoreDeprecations"` 也必须从 `"6.0"` 改回 `"5.0"`，否则标准构建会直接因为无效参数失败。
- 默认动作：
  - 当前主线和升级分支都优先保留 `typescript 5.9.3`；
  - 不要把 “TypeScript 6 类型检查能过” 误写成 “TypeScript 6 已经安全升级”；
  - 如果以后再次尝试升级 TypeScript 6，至少重新执行：
    - `pnpm type-check`
    - `pnpm build`
    - `pnpm build:cf`
    - 一次真实的 pre-push `build:check`

### 28. 遇到 review comment / 审计结论引用脚本或命令时，先验证它在当前主线是否还存在
- 截至 2026-04-14，已经确认出现过这类误导：评论继续追 `compat-import-audit.js`，但当前主线已经没有这个脚本。
- 默认动作：
  - 先验证评论里提到的脚本、命令、proof lane 或异常层，在当前主线是否真的还存在；
  - 如果相关脚本/命令已从主树退场，先把这条评论归类为“旧快照/旧审计线索”，不要直接继续修旧真相；
  - 如果文档或评论持续引用已删除的脚本/命令，请提醒开发者同步更新 AGENTS.md 或相关 runbook，避免后续 AI/审计重复浪费时间。


### 29. 本地 agent 临时目录会污染 lint / quality gate
- 截至 2026-04-15，本仓库已经确认：`.codex/.tmp`、`.omx`、`.eslintcache-audit` 这类本地 agent / tmp 目录会把 `eslint` 和 `quality:gate:fast` 污染成假红。
- 默认动作：
  - 同时在 `.gitignore` 和 `eslint.config.mjs` 的 global ignores 中挡掉这些目录；
  - 不要把这类本地垃圾导致的红灯误判成主项目代码质量回归。

### 30. `pnpm security:audit` 的旧 `410` 结论已经过时，先跑当前主线再下判断
- 截至 2026-04-15，本仓库本地复核已确认：`pnpm security:audit` 当前能正常返回结果，之前“audit endpoint 410 / 这条红灯默认是工具链过期”的说法，至少在当前主线和当前依赖组合下已经不成立。
- 默认动作：
  - 如果再遇到安全审计异常，先实际执行一次 `pnpm security:audit`，不要直接沿用旧快照结论；
  - 只有在当前主线复现后，才把它归类为工具链问题；
  - 文档、审计结论、review comment 里如果继续引用 `410` 旧说法，应视为待更新的陈旧上下文。

### 31. 当前仓库已经有 `review:architecture-truth`，涉及真相源/边界改动时优先跑它
- 截至 2026-04-15，本仓库已新增一条轻量收口入口：`pnpm review:architecture-truth`。
- 当前包含：
  - `pnpm config:check`
  - `pnpm review:legacy-markers`
  - `pnpm review:boundary-leaks`
  - `pnpm review:contract-smells`
  - `pnpm review:env-boundaries`
  - `pnpm review:server-env-boundaries`
  - `pnpm review:template-residue`
  - `pnpm truth:check`
- 默认动作：
  - 只要改动涉及 barrel、测试/生产边界、模板资产、live placeholder、站点真相或路径配置，优先先跑这条；
  - 不要只看 `build` / `lint` 绿灯就宣布结构没问题；
  - 如果 `review:architecture-truth` 报红，先按“边界/真相回归”处理，不要先归咎于 CI 噪音。

### 32. `Function.prototype as unknown as ...` 这类双重 cast 默认按弱 contract 处理
- 截至 2026-04-15，本仓库已开始把这类“为了过类型检查先塞一个假的值”的写法纳入 `review:contract-smells`。
- 当前默认阻止的低噪音模式包括：
  - `Function.prototype as unknown as ...`
  - `undefined as unknown as ...`
  - `null as unknown as ...`
- 默认动作：
  - 如果组件在 `disabled` / `optional` / `nullable` 场景下不需要真实值，优先改 contract，而不是双重 cast 糊过去；
  - 如果确实必须兼容旧接口，先给出明确的类型建模和注释，不要直接塞 fake callback / fake value。

### 33. `src/app/**` 与 `src/components/**` 里的 `NEXT_PUBLIC_*` 优先走 `@/lib/env`
- 截至 2026-04-15，本仓库已新增 `review:env-boundaries`，默认检查 app/component 层直接读取 `process.env.NEXT_PUBLIC_*` 的情况。
- 默认动作：
  - 页面层、layout、head、客户端组件、hooks 里如果要读公开环境变量，优先从 `@/lib/env` 取；
  - 不要在 app/component 层继续手写 `process.env.NEXT_PUBLIC_* === ...`；
  - `NODE_ENV` 这类运行时判断不在这条规则里，但公开配置值应尽量收口到 `env.ts`。

### 34. `src/lib/**` / `src/app/**` / `src/components/**` / `src/config/**` / `src/middleware.ts` 里的低噪音 env 也开始收口到 `@/lib/env`
- 截至 2026-04-15，本仓库已新增 `review:server-env-boundaries`，先只拦一批已经确认高价值、低噪音的 server-side 直接 `process.env` 读取。
- 当前默认守门的 key 包括：
  - `ADMIN_API_TOKEN`
  - `CACHE_INVALIDATION_SECRET`
  - `TURNSTILE_ALLOWED_ACTIONS`
  - `TURNSTILE_BYPASS`
  - `RATE_LIMIT_PEPPER`
  - `RATE_LIMIT_PEPPER_PREVIOUS`
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
  - `LOG_LEVEL`
  - `CONTENT_ENABLE_DRAFTS`
  - `DEPLOYMENT_PLATFORM`
  - `VERCEL`
  - `CF_PAGES`
  - `GOOGLE_SITE_VERIFICATION`
  - `YANDEX_VERIFICATION`
  - `APP_ENV`
  - `NODE_ENV`
- 默认动作：
  - `src/lib/**`、`src/app/**`、`src/components/**`、`src/config/**`、`src/middleware.ts` 里如果要读这批 runtime env，优先走 `@/lib/env` 的 runtime helper；
  - `src/lib/env.ts` 自身仍不纳入这条规则；当前主线也已经开始把 `NODE_ENV` / `APP_ENV` 的分支判断收口到统一 helper，不要继续散写 `process.env.NODE_ENV` / `process.env.APP_ENV`；
  - 如果以后要扩大规则范围，先拿到当前批次稳定通过的证据，再继续扩，不要一口气把所有 `process.env` 都打成回归。

### 35. `scripts/**` 的 proof lane env 不要和应用主树混着管，先走单独的 `review:proof-env-boundaries`
- 截至 2026-04-15，本仓库已新增 `pnpm review:proof-env-boundaries`，专门盯 proof / smoke / invalidation 这类高价值脚本里的 env 读取，不和应用主树的 `review:server-env-boundaries` 混在一起。
- 当前默认先守这几支脚本：
  - `scripts/invalidate-cache.js`
  - `scripts/cloudflare/preview-smoke.mjs`
  - `scripts/deploy/post-deploy-smoke.mjs`
- 当前默认守门的 key 包括：
  - `CACHE_INVALIDATION_STRICT`
  - `NEXT_PHASE`
  - `NODE_ENV`
  - `NEXT_PUBLIC_BASE_URL`
  - `CACHE_INVALIDATION_SECRET`
  - `CLOUDFLARE_PREVIEW_BASE_URL`
  - `DEPLOY_SMOKE_BASE_URL`
  - `DEPLOY_SMOKE_HEADER_NAME`
  - `DEPLOY_SMOKE_HEADER_VALUE`
- 默认动作：
  - 这批脚本优先走 `scripts/lib/runtime-env.js`，不要继续直接写 `process.env.*`；
  - `quality-gate.js`、大批量脚本配置项这类高噪音区域，先不要硬塞进这条 lane；
  - 只有当前 proof lane 连续稳定后，再扩到更多脚本，不要一上来把整个 `scripts/**` 都打红。

### 36. `scripts/quality-gate.js` 这类 CI 真红真绿入口，单独走 `review:ci-env-boundaries`
- 截至 2026-04-15，本仓库已新增 `pnpm review:ci-env-boundaries`，当前只盯 `scripts/quality-gate.js`，不要把它和 proof lane 或应用主树规则混在一起。
- 当前默认守门的 key 包括：
  - `QUALITY_ENABLE_COVERAGE`
  - `QUALITY_DISABLE_COVERAGE`
  - `QUALITY_ENABLE_PERFORMANCE`
  - `QUALITY_DISABLE_PERFORMANCE`
  - `QUALITY_DIFF_COVERAGE_THRESHOLD`
  - `QUALITY_DIFF_COVERAGE_DROP_WARNING_THRESHOLD`
  - `NODE_ENV`
  - `CI`
  - `GITHUB_REF_NAME`
  - `QUALITY_DIFF_BASE`
  - `QUALITY_COVERAGE_TIMEOUT_MS`
  - `QUALITY_PERF_TEST_TIMEOUT_MS`
  - `QUALITY_FORCE_SEMGREP`
  - `GITHUB_ACTIONS`
  - `GITHUB_OUTPUT`
- 默认动作：
  - `quality-gate.js` 这类 CI 核心脚本优先走 `scripts/lib/runtime-env.js`，不要继续直接写 `process.env.*`；
  - 先只守“会影响 CI 真红真绿”的那批 env，不要顺手把所有可选配置都拉进来；
  - 如果未来要继续扩脚本层 env 守门，优先按“proof lane / CI gate / analysis scripts”分 lane，而不是做一个巨大的 `scripts/**` 总规则。

### 37. analysis scripts 先收 `structural-hotspots` / `semgrep-common`，走 `review:analysis-env-boundaries`
- 截至 2026-04-15，本仓库已新增 `pnpm review:analysis-env-boundaries`，当前只盯 analysis lane 的两支高价值脚本：
  - `scripts/structural-hotspots.js`
  - `scripts/semgrep-common.js`
- 当前默认守门的 key 包括：
  - `STRUCTURAL_HOTSPOT_DAYS`
  - `STRUCTURAL_HOTSPOT_TOP`
  - `STRUCTURAL_COUPLING_TOP`
  - `SEMGREP_PYTHON`
  - `SEMGREP_BIN`
  - `HOME`
- 默认动作：
  - analysis scripts 也优先走 `scripts/lib/runtime-env.js`，不要继续直接写 `process.env.*`；
  - `scripts/csp/check-inline-scripts.ts` 这类验证脚本先不要和 analysis lane 混管，避免 proof/analysis 边界重新变脏；
  - 如果未来继续扩 analysis lane，优先挑高频入口和共享 helper，不要按“文件越多越好”去做假全面覆盖。

### 38. 日常入口优先用 `pnpm review:scripts-env`，内部仍按三条 lane 串行执行
- 截至 2026-04-15，本仓库已新增聚合入口 `pnpm review:scripts-env`。
- 它当前会按顺序串行执行：
  - `pnpm review:proof-env-boundaries`
  - `pnpm review:ci-env-boundaries`
  - `pnpm review:analysis-env-boundaries`
- 默认动作：
  - 人工本地检查、`ci-local`、pre-push 优先记这一个入口；
  - 但文档、排查和扩规则时，仍然按 proof / CI / analysis 三条 lane 分开思考，不要因为有了聚合入口就把边界重新混掉；
  - CI 工作流如果需要更细的失败可见性，可以继续保留分 lane step，不要求强行合并成一个黑盒步骤。

### 39. 想一次看完整体 guardrails，优先用 `pnpm review:all-guardrails`
- 截至 2026-04-15，本仓库已新增总览入口 `pnpm review:all-guardrails`。
- 它当前只聚合两大组：
  - `pnpm review:architecture-truth`
  - `pnpm review:scripts-env`
- 当前运行后会额外写轻量 summary 到 `reports/guardrails/`：
  - `latest-all-guardrails-summary.json`
  - `latest-scripts-env-summary.json`
- 默认动作：
  - 本地人工巡检、`ci-local` 优先记这一个入口；
  - 如果这条总入口报红，再回到具体组或具体 lane 里定位，不要把它当成排查终点；
  - pre-push / CI 这种更看重失败定位的场景，可以继续保留更细的 step，不要求所有地方都强行统一成一个步骤。

### 40. GitHub Actions 里的 guardrails 可见性优先用 job summary，不要只靠翻日志
- 截至 2026-04-15，本仓库的 CI 已开始把 guardrails 结果写入 GitHub Actions 的 job summary。
- 当前做法：
  - `architecture` 作业里跑 `pnpm review:all-guardrails`
  - 上传 `reports/guardrails/` 产物
  - `ci-summary` 作业再读取 `latest-all-guardrails-summary.json` / `latest-scripts-env-summary.json`，把关键信息写进 `$GITHUB_STEP_SUMMARY`
- 默认动作：
  - 如果 CI 里 guardrails 报红，先看 job summary 里的分组结果，再决定要不要下钻到具体日志；
  - 如果以后继续扩 guardrails 汇总，优先复用 `reports/guardrails/*.json` 这层轻量产物，不要在 workflow 里重新手写一套解析逻辑；
  - 如果 summary 丢失，先检查 artifact 上传/下载和 `scripts/append-guardrail-summary.js`，不要先怀疑 guardrail 本身失效。

### 41. PR 里的 Semgrep baseline 不要再用 shallow base fetch
- 截至 2026-04-16，本仓库已实际踩到：如果在 `ci.yml` 的 PR Semgrep baseline 模式里只对 base branch 做 `--depth=1` shallow fetch，`git merge-base HEAD origin/$GITHUB_BASE_REF` 可能直接失效。
- 这类报错的危险在于：
  - Semgrep 还没真正开始扫，security lane 就会先假红；
  - 特别是在 `main` 有 force update、历史改写或 PR 分支落后较多时，更容易把“基线提交拿不到”误看成“发现了新的安全问题”。
- 默认动作：
  - PR baseline 场景优先保证 `origin/$GITHUB_BASE_REF` 有可用于 `merge-base` 的真实历史，不要再把 `--depth=1` 当优化默认值；
  - 如果 Semgrep 红在 baseline 计算阶段，先检查 `git fetch` 和 `merge-base`，再看规则本身；
  - 汇报时要明确区分“扫描前基线计算失败”和“扫描后发现问题”，不要把两类红灯混写。

### 42. guardrail 脚本不要硬绑单一 CLI；`rg` 缺失或退出码 `1` 不应被误报成脚本失败
- 截至 2026-04-16，本仓库已验证：`scripts/legacy-marker-audit.js` 这类 guardrail 脚本如果把 `rg` 当唯一真相，CI 或不同开发机上就会因为工具可用性差异出现假红。
- 当前更稳的做法是：
  - `rg` 仍然优先，因为它快；
  - 但 `rg` 不可用或异常退出时，要有 `grep` 或等价实现兜底；
  - `rg` / `grep` 的退出码 `1` 表示“没找到”，不是脚本炸了。
- 默认动作：
  - 只要新增或改动 `scripts/**` 下的审查脚本，先问自己：如果本机没有这个 CLI，会是假红还是可降级；
  - 如果脚本只是“零发现”，不要把它抛成异常；
  - 如果 CI 报 `rg error`、`command not found` 或类似工具层异常，先按“guardrail 可移植性问题”归类，不要先怀疑业务代码回归。

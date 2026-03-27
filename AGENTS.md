这个文件的作用是描述 agent 在项目中可能遇到的常见错误和困惑。
如果你遇到任何令你惊讶的事，请提醒开发者并建议更新 Agent.md。

## 项目经验补充

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

### 3. 修改 `apiErrors` 时，必须同步 `messages/*.json` 和 `messages/*/critical.json`
- 本仓库的翻译会同时从完整消息文件和 critical bundle 读取。
- 如果只改 `messages/en.json` / `messages/zh.json`，不改 `messages/en/critical.json` / `messages/zh/critical.json`，就会出现：
  - 开发态或部分测试通过
  - 但实际首屏关键路径仍缺翻译 key
- 默认动作：
  - 同步搜索并更新 4 个文件
  - 至少执行一次 `pnpm validate:translations`

### 4. 当前双平台部署下，优先保留 `src/middleware.ts`
- 截至 2026-03-19，本仓库为了兼容当前 Cloudflare 链路，运行时入口仍保留为 `src/middleware.ts`。
- 原因是：`src/proxy.ts` 虽然能通过 `next build`，但会阻塞 `pnpm build:cf`。
- 默认动作：
  - 当前修改 locale redirect / CSP nonce / 安全头部时，优先改 `src/middleware.ts`
  - 每次涉及该入口文件的改动，至少执行一次 `pnpm build` 和 `pnpm build:cf`
  - 如果未来再次迁移 `middleware -> proxy`，`config.matcher` 仍必须只写静态字面量；不能引用常量、拼装数组或动态值，否则 Turbopack 会报 `matcher[...] need to be static strings or static objects`

### 5. 当前 `@opennextjs/cloudflare@1.17.3` 下，先不要重新打开 OpenNext `minify`
- 本仓库已验证：升级到 `next@16.2.0` + `@opennextjs/cloudflare@1.17.3` 后，Cloudflare 打包链路的默认稳定做法仍然是关闭 OpenNext `minify`；在当前 pnpm 结构下，重新打开仍有较高概率重新触发打包层问题。
- 当前稳定做法是：在 `open-next.config.ts` 中把 split functions 和 default worker 的 `minify` 关闭。
- 默认动作：
  - 如果有人想重新打开 `minify`，必须先重新执行 `pnpm build:cf`
  - 只有在确认上游修复且本仓库重新验证通过后，才允许恢复
  - 不要把这个开关当作“纯性能优化”随手改动

### 6. 不要并行执行 `pnpm build` 和 `pnpm build:cf`
- `build:cf` 会内部调用 `pnpm build`。
- 如果把两者并行跑，会得到假的失败结果，例如 `Another next build process is already running`。
- 默认动作：
  - 需要验证双链路时，先跑 `pnpm build`，再串行跑 `pnpm build:cf`

### 7. 不要再用客户端补丁修正 `html[lang]`
- 本仓库已经验证过：`LangUpdater + document.documentElement.lang` 会把语言语义推迟到 hydration 后，SSR / 无 JS / 爬虫首包都是错的。
- 正确做法：
  - 让真正的 root layout 在服务端直接输出 `<html lang={locale}>`
  - 客户端组件用 `next-intl` 的 locale context（如 `useLocale()`），不要偷读 `document.documentElement.lang`

### 8. 不要把 stock `opennextjs-cloudflare preview` 当成 phase6 / split-worker 的完整真相
- 截至 2026-03-26，本仓库已验证：
  - stock `opennextjs-cloudflare preview` 仍然主要走默认 worker 路径；
  - 它可以帮助发现明显的 Cloudflare 本地兼容性问题；
  - 但它不能自动证明 phase6 / split-worker 的最终运行形态是对的。
- 同期还验证到：即使直接对 `.open-next/wrangler/phase6/*.jsonc` 跑 `wrangler dev --no-bundle`，本地也可能在 Wrangler / Miniflare 启动层就失败，并不一定是业务路由或 repo 配置错了。
- 默认动作：
  - 把 stock preview 当作“局部信号”，不要当作 split-worker release proof；
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
- 截至 2026-03-26，本仓库当前更可信的做法是：
  - stock `opennextjs-cloudflare preview` 只作为本地 page/header/cookie/redirect 真相检查；
  - `/api/health` 等最终 API 证明，应放到真实部署后的 smoke 里做。
- 当前脚本分工：
  - `pnpm smoke:cf:preview`
    - 默认只验证 `/`、locale 页面、Contact 页面、invalid locale redirect、cookie flags、内部 header 泄漏、manifest crash
  - `pnpm smoke:cf:preview:strict`
    - 额外把 `/api/health` 算进去；当前如果 stock preview 还不能正确代表 split-worker API 路径，这个命令可能失败
  - `pnpm smoke:cf:deploy -- --base-url <url>`
    - 对真实部署地址做最终 smoke，包括 `/api/health`
- 默认动作：
  - 不要因为 `smoke:cf:preview` 通过就宣布 Cloudflare 完全闭环；
  - 也不要因为 `smoke:cf:preview:strict` 失败，就直接判定 deployed phase6 一定有问题；
  - 先看失败属于：
    - stock preview 边界内的问题，
    - 还是必须由 deployed smoke 证明的问题。

### 12. `build:cf` 现在走 Webpack 主链路，但 Wrangler 本地预览仍然不是完整真相证明
- 截至 2026-03-27，本仓库已验证：
  - `pnpm build:cf` 的正式实现现在是 `node scripts/cloudflare/build-webpack.mjs`；
  - `pnpm build:cf:turbo` 仅保留为对照/排查链路，不再是默认 Cloudflare 构建入口；
  - 直接基于当前 Webpack 产物跑 `wrangler dev --env preview`，仍会在本地 bundling/runtime 层触发 `middleware-manifest.json` 动态 require 错误；
  - 改成 `wrangler dev --env preview --no-bundle` 后，本地又会卡在 `cloudflare/images.js` 模块缺失。
- 当前默认动作：
  - 把 Webpack 视为当前正式 Cloudflare 构建链路；
  - 不要把本地 Wrangler preview 当成这条主链路的完整 release proof；
  - 本地 Cloudflare 页面验证仍优先走既有的 `smoke:cf:preview` 分层策略；
  - 如果未来要把 Wrangler 本地 preview 提升为更强的正式证明面，必须先补一轮本地可运行证据。

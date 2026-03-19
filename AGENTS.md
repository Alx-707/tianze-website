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

### 5. 当前 `@opennextjs/cloudflare@1.17.1` 下，先不要重新打开 OpenNext `minify`
- 本仓库已验证：升级到 `next@16.2.0` + `@opennextjs/cloudflare@1.17.1` 后，Cloudflare 打包链路在 OpenNext 的 minify 阶段会因为 pnpm 风格 `node_modules` 触发 `ENOENT`。
- 当前稳定做法是：在 `open-next.config.ts` 中把 split functions 和 default worker 的 `minify` 关闭。
- 默认动作：
  - 如果有人想重新打开 `minify`，必须先重新执行 `pnpm build:cf`
  - 只有在确认上游修复后，才允许恢复
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

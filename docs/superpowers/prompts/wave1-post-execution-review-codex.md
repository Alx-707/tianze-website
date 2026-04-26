# Wave 1 工程成果对抗审查报告

## 审查摘要
- 总发现数：9
- 阻断级（必须修才能合并）：3
- 高风险（应该修但不阻断）：3
- 观察级（记录备查）：3

## D1: 回归检测
- **[阻断][回归] `/blog` 下线不干净，runtime `src/` 和 `messages/` 里还留着一整套 blog 子系统。**
  - `src/lib/content/blog.ts:159-191` 仍在注册 `contentTags.blogList()` / `contentTags.blogPost()`
  - `src/components/blog/blog-newsletter.tsx:191,399` 仍在提交 `pageType: "blog"`，并消费 `useTranslations("blog.newsletter")`
  - `src/lib/structured-data-helpers.ts:70` 仍在给 article schema 生成 blog canonical URL
  - `messages/en.json:1705-1710`、`messages/zh.json:1705` 仍保留 blog 页面文案
  - 这说明现在只是“路由入口删了”，不是“blog 产品线删干净了”。后面任何人一旦重新接入旧组件/旧 helper，blog 行为会直接复活。
- GitHub social 删除：零发现
- SearchAction 删除：零发现
- developer-stack keywords 删除：零发现

## D2: 新增代码质量
- **[观察][边界] `mobile-navigation-interactive.tsx` 不是纯交互 wrapper，server/client 职责边界只拆了一半。**
  - `src/components/layout/mobile-navigation-interactive.tsx:101-179` 还在定义 `MobileNavigationHeader` / `MobileLanguageSwitcher`
  - `src/components/layout/mobile-navigation-interactive.tsx:202-255` 还在负责文案解析和整个 drawer 内容拼装
  - 同时 `src/components/layout/header-client.tsx:1-5` 和 `src/components/layout/mobile-navigation-interactive.tsx:17-20` 都直接 import `MobileNavigationLinks`
  - 这次拿到了“SSR 兜底 HTML”，但没有拿到真正的 RSC 边界收口；`mobile-navigation.tsx` 仍被 client island 直接引用，后续很容易又把内容逻辑塞回客户端。

## D3: CSP 策略一致性
- **[阻断][proof gap] `scripts/csp/check-inline-scripts.ts` 现在验证的是“header 形状像不像”，不是“浏览器实际执行策略和运行时脚本是否一致”。**
  - `assertScriptPolicyMatchesRuntime()` 只检查 `script-src` 没有 `'unsafe-inline'`，以及 `script-src-elem` 显式包含 `'unsafe-inline'`（`scripts/csp/check-inline-scripts.ts:55-80`）
  - 它确实把页面脚本分成了 `noncedInlineScripts` 和 `unnoncedInlineScripts`，但后续完全不校验：
    - nonce 是否真的匹配当前 CSP
    - unnonced 脚本是否正是依赖 `script-src-elem`
    - 页面是否出现了超预期的 inline script 形态
  - 代码只要求“页面上有 inline scripts，且抽取结果不是全空”（`scripts/csp/check-inline-scripts.ts:128-145`）
  - 结果是：这条 release proof 现在能证明“站点 header 大概长这样”，证明不了“当前 CSP 真把当前运行时脚本约束对了”。

- **[高风险][cache/release identity] 固定 `generateBuildId: () => "tianze-website"` 现在已经失去原始理由，但还在把所有发布版本伪装成同一个 build identity。**
  - Next 本地文档明确写的是：build id 用来标识“当前正在服务的构建版本”，只有“同一个 build 跑多个容器”时才需要一致（`.next-docs/01-app/03-api-reference/05-config/01-next-config-js/generateBuildId.mdx:8-17`）
  - 代码里的理由仍然是“hash-based CSP validation depends on deterministic inline RSC payloads”（`next.config.ts:21-26`）
  - 但当前分支已经删掉 hash allowlist，连测试都明确断言“不再使用 sha256”（`src/config/__tests__/security.test.ts:37-43`）
  - 也就是说，固定 build id 现在没有对应的安全收益，却让不同发布版本共用同一个 build identity，增加 CDN/客户端拿到旧 `_next` 资产时的排障难度。

## D4: 类型完整性
- **[阻断][types] blog 已从 `PageType` 删掉，但 runtime 代码还在手工把它加回来。**
  - `src/config/paths/types.ts:15-26` 已删除 `blog` / `blogDetail`
  - `src/lib/structured-data-helpers.ts:70` 仍在 `generateCanonicalURL("blog" as PageType, locale)`
  - `src/lib/structured-data.ts:52-67,86-118` 仍保留 `_page: "blog"` overload 和 `page: PageType | "blog"`
  - 这不是纯类型残渣。`src/services/url-generator.ts:150-155` 最终会走 `getLocalizedPath()`，而 `src/config/paths/utils.ts:25-27` 对未知 `pageType` 直接 `throw new Error("Unknown page type: ...")`
  - 所以后面只要再碰到这条 helper 路径，不会是“类型不好看”，而是直接 runtime 抛错。

- `as any` / `@ts-ignore` 用来绕过 `site-types` 变更：零发现
- `validateSiteConfig()` 仍引用 `config.social.github`：零发现

## D5: 测试覆盖是否真正证明了行为
- **[高风险][coverage] 12 个 mobile-navigation 测试文件里，大多数改动只是“换 import + 改菜单文案”，不是在证明 server/client 拆分行为。**
  - 典型例子：`mobile-navigation-responsive-basic.test.tsx`、`mobile-navigation-responsive.test.tsx`、`mobile-navigation-edge-cases-*.test.tsx`、`mobile-navigation-items-accessibility*.test.tsx` 都主要是把 import 从 `mobile-navigation` 改到 `mobile-navigation-interactive`，再把 Blog/Privacy 文案改成 OEM/Contact
  - 真正新增“拆分 proof”的，只有：
    - `src/components/layout/__tests__/mobile-navigation.test.tsx:244` 的 `renderToStaticMarkup(<MobileNavigationLinks />)`
    - `src/components/layout/__tests__/header-client.test.tsx:106` 对 injected children 的断言
  - 但到现在仍然没有任何测试去打真正关键的 fallback 分支：`src/components/layout/header-client.tsx:39-43,92-97`
  - 全库 grep 也没有对 `header-mobile-navigation-fallback` 的断言
  - 这说明当前测试更像“让拆分后的代码继续跑通旧断言”，不是“证明 SSR fallback + hydration handoff 真成立”。

- **[高风险][coverage] UTM/consent 的新增测试只证明了 util 单点，不证明真实用户路径。**
  - `src/lib/__tests__/utm.test.ts:134-147` 只覆盖了 `pvc conduit` / `brand+search` / `google/cpc` 放行
  - `src/lib/__tests__/utm.test.ts:113-123` 只覆盖了 `<script>` 拒绝，没有覆盖引号和 control chars 仍然被拒绝
  - `flushPendingAttribution()` 也是直接 import 后手调（`src/lib/__tests__/utm.test.ts:250-275`），不是证明真实 caller 会触发
  - `src/components/__tests__/attribution-bootstrap.test.tsx:27-47` 只测了“没有 attribution 参数时不加载”，完全没测“有 attribution 参数 + consent 后续变化时真的会 flush”
  - 当前测试能证明 util 层没写反，但证明不了“营销落地页 -> 用户同意 cookie -> attribution 最终落地”这条真实链路。

- `src/lib/__tests__/sitemap-utils.test.ts` fake timers：零发现
- `src/app/__tests__/sitemap.test.ts` blog sitemap 断言删除：零发现

## D6: 内容/i18n 一致性
- 零发现
  - `pnpm validate:translations` 已实跑通过
  - `messages/en.json` 与 `messages/zh.json` flatten 后都是 1257 个 keys，双向 diff 为 0
  - `content/pages/{en,zh}/{privacy,terms}.mdx` 的 `updatedAt` / `lastReviewed` 均为 `2026-04-26`

## D7: 依赖和构建链
- 零发现
  - `package.json` 确实把 `react` / `react-dom` / `react-server-dom-webpack` / `react-server-dom-turbopack` 升到了 `19.2.5`
  - `pnpm.overrides["@react-email/preview-server>next"] = "$next"` 生效
  - `pnpm why next` 已确认不再出现 `next@16.1.7`

## D8: 遗留风险和技术债
- **[观察][assets] `brandAssets` 已集中，但大部分目标文件当前并不存在，代码里也没有任何 guardrail 提醒这些仍是 blocked placeholders。**
  - `src/config/single-site.ts:128-137` 指向 `/images/logo.svg`、`/images/logo.png`、`/images/logo-square.svg`、`/favicon.ico`
  - 实际文件检查结果：
    - 缺：`public/images/logo.svg`
    - 缺：`public/images/logo.png`
    - 缺：`public/images/logo-square.svg`
    - 缺：`public/favicon.ico`
    - 缺：`public/certs/iso9001.pdf`
    - 仅 `public/images/og-image.jpg` 存在
  - `src/components/layout/logo.tsx:65-77` 的注释只解释“为什么暂时用 `<img>`”，没提示“这些资源现在还没交付”
  - `src/components/sections/hero-section.tsx:23-30` 也仍然是 3 个空 div 占位，没有任何 TODO / assert / test fence
  - 现在分支是靠 `<img>` 和字符串 URL 扛着没在 build 时炸；后续只要有人把 logo 改成 `next/image` 静态 import、或者把 cert / favicon 当成已就绪资产处理，就会踩到硬 404 / build 失败。

- **[观察][history hygiene] 分支上仍有 6 个空的 `BLOCKED` commit。**
  - 实际空 commit：`3ce6949`, `64f2cfb`, `5c99066`, `c640919`, `de913b6`, `5236131`
  - squash merge 会把它们吃掉；但只要不是 squash，这 6 个 marker commit 就会原样污染主线历史
  - 这不是代码 bug，但它确实会把“业务材料还没到位”的过程噪音永久写进 release 历史。

## 修复建议优先级排序
1. **先修 D1 + D4 这一组 blog 残留。**
   - 目标不是“/blog 不可访问”，而是把 runtime `src/` / `messages/` 里的 blog 子系统和类型逃逸一起收干净
   - 特别先删掉 `generateCanonicalURL("blog" as PageType, ...)` 和 `pageType | "blog"` 这条 runtime throw 路径

2. **再修 D3 的 CSP proof。**
   - 让 `security:csp:check` 真正校验“当前页面脚本形态”和“当前 CSP 允许面”是一致的
   - 同时把 `generateBuildId` 的理由和当前策略对齐：要么撤掉固定值，要么给出现在仍然必须固定的证据

3. **补 D5 的行为证明。**
   - mobile nav：补 `header-mobile-navigation-fallback` 的真实断言，证明 pre-hydration fallback 与 activate/hydrate 交接没问题
   - utm/consent：补真实 caller 路径测试，至少证明 `AttributionBootstrap` 在 attribution 参数存在时，consent 后会触发 flush
   - sanitizer：补引号 / control chars 的 rejection case

4. **最后处理 D2 / D8 的结构和 hygiene。**
   - 如果这轮不打算继续深拆，就至少把“当前 split 只是 partial boundary”写进注释/文档，避免后续误判
   - 给 brand assets / hero placeholders 加显式说明
   - 合并前如果不是 squash，先处理 6 个空 marker commit 的历史策略

# Wave 1 计划对抗式审查报告

## 审查摘要
- 总发现数：30
- 阻断级（会导致执行失败）：12
- 高风险（可能导致返工）：13
- 建议级（改进但不阻断）：5

## D1: 路径/行号/函数名准确性

- ❌ **Task 3 的测试入口和函数名都写错了。**  
  计划写的是 `src/lib/__tests__/structured-data-generators.test.ts` + `generateWebsiteSchema(...)`。实际仓库里不存在这个测试文件；现有测试文件是 `src/lib/__tests__/structured-data.test.ts`，现有导出链是 `generateLocalizedStructuredData` / `generateWebSiteData`，不是 `generateWebsiteSchema`。  
  证据：`src/lib/structured-data.ts:2-17`、`src/lib/__tests__/structured-data.test.ts:187-200`。

- ❌ **Task 3 给的“Before”代码块和真实代码结构不一致。**  
  计划假设 `potentialAction.target` 是 `EntryPoint.urlTemplate`。实际代码里 `target` 直接就是字符串：`data.searchUrl || ".../search?q={search_term_string}"`。这不是抄写误差，而是会直接误导改法。  
  证据：`src/lib/structured-data-generators.ts:146-150`。

- ❌ **Task 5 里核心标识符写错，按原计划会直接 TypeScript 报错。**  
  计划要求从 `SITE_FACTS` 读 `brandAssets`，还建议用 `SITE_FACTS.companyName`。实际仓库只有 `SINGLE_SITE_FACTS` / `siteFacts`，没有 `SITE_FACTS`；公司名字段也不是 `companyName`，而是 `company.name`。  
  证据：`src/config/single-site.ts:244-250`、`src/config/site-facts.ts:11-23`、`src/config/site-types.ts:86-92`。

- ❌ **Task 5 漏了类型定义改动。**  
  计划要在 `facts` 里新增 `brandAssets`，但 `SiteFacts` 当前只允许 `company/contact/certifications/stats/social`，没有 `brandAssets`。计划没有给 `src/config/site-types.ts` 的同步步骤，类型层先就过不去。  
  证据：`src/config/site-types.ts:86-92`。

- ❌ **Task 6 的函数名是假的。**  
  计划测试里调用 `resolveSitemapLastmod(undefined)`。实际 `src/lib/sitemap-utils.ts` 导出的函数是 `getContentLastModified`、`getProductLastModified`、`getStaticPageLastModified`，没有 `resolveSitemapLastmod`。  
  证据：`src/lib/sitemap-utils.ts:31-107`。

- ❌ **Task 20 的 consent API 名字是假的。**  
  计划让你 `import { hasMarketingConsent } from "@/lib/cookie-consent"`。实际 `src/lib/cookie-consent/index.ts` 只导出 `useCookieConsent` / `useCookieConsentOptional` / `loadConsent` / `saveConsent` 等，没有 `hasMarketingConsent`。  
  证据：`src/lib/cookie-consent/index.ts:6-31`。

- ❌ **Task 21 的 sanitizer 函数名是假的。**  
  计划写的是 `sanitizeUtmValue`。实际 `src/lib/utm.ts` 里只有私有的 `sanitizeParam`，并没有对外可测的 `sanitizeUtmValue`。  
  证据：`src/lib/utm.ts:30-35`。

- ❌ **Task 17 的类型改动点写错了对象。**  
  计划第 2 步说“从 `DynamicPageType` union 删 `blog`”。实际 `blog` 在 `PageType`，`DynamicPageType` 只有 `blogDetail | productMarket`。按计划原文改，会改错地方。  
  证据：`src/config/paths/types.ts:15-27`。

- ❌ **Task 15 给的目标路径有一个根本不存在。**  
  计划写“`/capabilities` 或 `/oem-custom-manufacturing`”。实际仓库没有 `/capabilities` 这个页面，只有 `/capabilities/bending-machines`。  
  证据：`src/config/paths/paths-config.ts:52-60`。

## D2: 基线覆盖完整性

- ❌ **Wave 1 有一类信任面问题被整个漏掉了：GitHub 被当成工厂的业务社交渠道。**  
  baseline 明确把“`Manufacturer footer 把 GitHub 当业务社交渠道`”和“`Site config 含模板/无关字段（GitHub link、占位电话）`”都放在 Wave 1.1；计划只修了占位电话，没有任何 Task 清理 GitHub business social。  
  证据：baseline `docs/reports/2026-04-26-codebase-quality-audit-baseline.md:434-435`；当前 live config 在 `src/config/single-site.ts:44-48`、`125-129`、`233-237`。

- ❌ **Task 13 只盯 `about.mdx + messages 292-303`，但 baseline 的“标准声明失真”远不止这两处。**  
  这不是小漏项，而是会导致你修完 about 页，别的公开页面还在继续对外说“符合 ASTM / AS/NZS / IEC / NOM”。  
  证据：`content/pages/en/oem-custom-manufacturing.mdx:25,28`、`content/pages/en/about.mdx:40,62,119`、`messages/en.json:501,515,1005-1082,1181-1372`，中文同样大量命中。

## D3: 任务依赖与顺序风险

- ❌ **Task 5 并不会像计划描述那样“逼迫 Task 8 之前 build 失败”。**  
  按计划 Step 2/3，logo 仍然是普通 `<img>`，JSON-LD 里也是字符串路径；这会造成运行时 broken image / 手工 smoke 噪音，但不会天然让 `pnpm build` 在 Task 8 前挂掉。也就是说，计划对依赖关系的建模是错的：这里不是“编译阻断”，是“肉眼验证噪音”。  
  证据：当前 `logo.tsx` 用的是 `<img>`（`src/components/layout/logo.tsx:64-77`），结构化数据也只是字符串 URL（`src/lib/structured-data-generators.ts:100-101,183-186`）。

- ❌ **Task 17 的 `git add -A` 在当前工作区就是误提交流。**  
  当前 `git status --short` 已经有 3 个无关未跟踪文件，其中就包括这份计划文件本身。按计划直接 `git add -A`，会把 `docs/superpowers/plans/2026-04-26-wave1-release-blockers.md` 和两份无关 prompt 一起塞进 blog 删除 commit。  
  证据：当前 `git status --short` 输出：
  - `?? docs/superpowers/plans/2026-04-26-wave1-release-blockers.md`
  - `?? docs/superpowers/prompts/codebase-quality-audit-deep-module-codex.md`
  - `?? docs/superpowers/prompts/codebase-quality-audit-round3-codex.md`

- ❌ **Task 3 不只要删实现，还要改现有类型与现有测试；计划没列全。**  
  现有 `WebSiteData` 还保留 `searchUrl?: string`，现有测试还断言 `schema` 必须有 `potentialAction`。如果只照计划改主实现，不同步这两处，type/test 都会炸。  
  证据：`src/lib/structured-data-types.ts:16-21`、`src/lib/__tests__/structured-data.test.ts:187-200`。

- ❌ **Task 16 的拆文件影响面被严重低估。**  
  现在不是只有 `header-client.tsx` 一处 import `mobile-navigation`。已有大量 layout 测试直接 import 当前 client 版 `MobileNavigation`，还有 header/header-client/integration test 在 mock 它。你一拆成 server shell + client wrapper，现有断言和 mock 边界会一起变。  
  证据：`src/components/layout/__tests__/mobile-navigation*.test.tsx` 多文件、`src/components/layout/__tests__/header.test.tsx`、`src/components/layout/__tests__/header-client.test.tsx`、`tests/integration/components/header.test.tsx`。

- ❌ **Task 8 / Task 10 的 commit 步骤不会把被归档的删除一起提交。**  
  计划都是先 `mv ... ~/.Trash/...`，最后只 `git add` 新文件/改单文件。Git 对“删除文件”不会因为你 `git add new-file` 自动帮你 stage。  
  我做了最小复现：在临时 git 仓库里“移动旧文件 + `git add new.txt`”后，`git status --short` 结果是 `A  new.txt` 和 ` D old.txt`，说明删除仍然是**未暂存**。  
  这意味着 Task 8/10 的 commit message 会声称“已归档旧资产”，但 commit 实际不包含删除。  

## D4: 测试覆盖可行性

- ❌ **Task 4 的测试调用方式本身不能编译。**  
  计划写 `import { generateMetadata } from "../seo-metadata";` 然后 `generateMetadata({ /* minimal valid input */ })`。实际 `src/lib/seo-metadata.ts` 没有 `generateMetadata` 导出，只有 `generateLocalizedMetadata`、`generateMetadataForPath`、`createPageSEOConfig`。  
  证据：`src/lib/seo-metadata.ts:215-247`、现有测试 `src/lib/__tests__/seo-metadata.test.ts:1-6`。

- ❌ **Task 4 还漏了现有测试的反向断言。**  
  现有 `seo-metadata.test.ts` 明确断言 home keywords 里包含 `shadcn/ui` / `Radix UI`，unknown page 也断言 `shadcn/ui` 必须存在。你不先改这些旧断言，新测再加进去，测试套件会自己互相打架。  
  证据：`src/lib/__tests__/seo-metadata.test.ts:228-245,273-279`。

- ❌ **Task 5 也漏了旧测试改动。**  
  现有 Logo 测试硬编码期望 `src="/next.svg"`；结构化数据测试也硬编码 `https://example.com/next.svg`。计划只提了“跑 structured-data 测试”，没提 `logo.test.tsx` 和额外的 `structured-data.test.ts` 断言更新。  
  证据：`src/components/layout/__tests__/logo.test.tsx:175`、`src/lib/__tests__/structured-data.test.ts:159,231,689`。

- ❌ **Task 6 的 fake timer 用法不成立。**  
  计划示例直接 `vi.setSystemTime(fakeNow)`，但没先 `vi.useFakeTimers()`；而且当前 `sitemap-utils` 测试文件本来就是围绕 `getContentLastModified` / `getStaticPageLastModified` 写的，不是 `resolveSitemapLastmod`。  
  证据：仓库里多处规范用法都是 `vi.useFakeTimers()` 后再 `vi.setSystemTime(...)`，例如 `src/app/__tests__/contact-integration.test.ts:124-134`；当前 `src/lib/__tests__/sitemap-utils.test.ts` 也没有计划里的那个函数。

- ❌ **Task 20 的 mock 方案也跑不起来。**  
  计划想 `vi.mocked(hasMarketingConsent).mockReturnValue(false)`。问题前面已经确认：`hasMarketingConsent` 根本不存在。当前 attribution 写入是普通 util，被 `AttributionBootstrap` 在 `useEffect` 里动态 import 后调用。  
  这意味着你要么补一个同步 helper，要么改成 mock `loadConsent()` / provider 状态；原计划里的测试不是“待完善”，是“直接无法写”。  
  证据：`src/components/attribution-bootstrap.tsx:24-36`、`src/lib/cookie-consent/index.ts:6-31`。

## D5: 安全修复的技术可行性

- ❌ **Task 2 的前提就错了一半：root `next@16.2.3` 不是当前 audit 命中的那个 next。**  
  实测 `pnpm audit --json` 后，`next` 这条 high advisory 命中的是 `@react-email/preview-server > next 16.1.7`，不是项目根依赖的 `next 16.2.3`。root next 已经在 patched floor（`>=16.2.3`）上。  
  证据：`pnpm why next` 显示 `@react-email/preview-server` 依赖 `next 16.1.7`；audit 解析结果里 `next` 命中的 path 是 `.>@react-email/preview-server>next`。

- ❌ **Task 2 的“升 root next/react 后 high 清零”是不可能达成的承诺。**  
  当前实测 `pnpm audit --audit-level high` 还是 `25 vulnerabilities found`，其中除了 `react-server-dom-webpack/turbopack` 外，还有 `minimatch`、`basic-ftp`、`pac-resolver` 等一堆 high/critical。  
  也就是说，Task 2 Step 4/Task 22 Step 2 的预期输出“`No vulnerabilities found at audit level high or above`”本身就是假目标。  
  证据：实测 audit 汇总 `1 critical | 15 high | 8 moderate | 1 low`。

- ❌ **Task 2 还漏了 Next 生态配套版本同步。**  
  计划只动 `next/react/react-dom/react-server-dom-*`，但仓库里还有 `@next/mdx`、`@next/bundle-analyzer`、`@next/eslint-plugin-next`、`eslint-config-next` 全都 pin 在 `16.2.3`。如果真升到 16.3.x，配套包不跟，构建/ESLint 版本漂移风险很高。  
  证据：`package.json:167,210-211,232`。

- ❌ **Task 18 改错文件了。**  
  计划说“改 `src/middleware.ts` 或 `next.config.ts`”。实际 CSP hash allowlist 和 `script-src` / `script-src-elem` 逻辑都在 `src/config/security.ts`；middleware 只是把 `getSecurityHeaders(nonce)` 注入响应。  
  证据：`src/middleware.ts:83-87`、`src/config/security.ts:17-98`。

- ❌ **Task 18 把改动量说小了，真实问题不是“补几条 hash”这么简单。**  
  实测 `pnpm security:csp:check` 失败，缺的不是 1 条，而是 8 条内联脚本：2 条 JSON-LD，外加多条 `self.__next_f.push(...)` / RSC stream 脚本。  
  更麻烦的是，layout 里还明确写了“为了保住 Cache Components 静态生成，已经移除了通过 `headers()` 取 nonce 的路径”。你现在要全面切 nonce，不只是改 middleware，一定会碰到静态生成/缓存边界。  
  证据：`src/app/[locale]/layout.tsx:43-45`、`src/config/security.ts:17-27,86-98`、实测 `pnpm security:csp:check` 输出的 8 个缺失 hash。

- ❌ **Task 19 的修复方向和现状不匹配。**  
  计划猜测 warning 可能来自 `error.message.includes()` 或危险 regex。实际当前 2 条 warning 都是 `object-injection-sink-computed-property`，落在：
  - `src/components/forms/lazy-turnstile.tsx:47-49`
  - `src/lib/security/client-ip.ts:42-53`  
  而且计划里写的 `pnpm review:semgrep` 命令根本不存在，实际脚本是 `pnpm security:semgrep`。  
  证据：`reports/semgrep-warning-1777131146810.json`、`package.json` scripts。

## D6: 业务阻塞项的隐性依赖

- ❌ **Task 12 / 13 / 14 的“改完 MDX 就开 dev 验证”不可靠，因为内容读取依赖生成文件。**  
  `src/lib/content-manifest.ts` 是静态 import `content-manifest.generated.ts`；`prebuild` 才会跑 `scripts/generate-content-manifest.ts`。  
  也就是说，法律页 / about 页正文改完，如果不先刷新 manifest，你的 `pnpm dev` 很可能看到的是旧内容，人工验收会被假阳性/假阴性污染。计划完全没写这一步。  
  证据：`src/lib/content-manifest.ts:8-25`、`package.json` 的 `prebuild`。

- ❌ **Task 13 把“业务确认标准声明”缩得太窄，只盯 about 页会留下大量公开强声明。**  
  除了 `about.mdx`，公开可见的标准/合规表述还散落在 `oem-custom-manufacturing.mdx`、market 页面文案、messages 大段文本、quality section 等多个 buyer-facing surface。  
  业务方如果只审你计划列的那 4 个位置，线上仍然会继续对外说“符合 ASTM/IEC/NOM/ASNZS”。  
  证据：`content/pages/en/oem-custom-manufacturing.mdx:25,28`、`messages/en.json:501,515,1005-1082,1181-1372`，中文同样大量命中。

## D7: 遗漏的副作用

- ❌ **Task 3 没写外部预期管理，而且它引用的业务价值已经过时。**  
  Google Search Central 已在 **2024-11-21** 全局移除 sitelinks search box；官方口径是：删不删这段 structured data 都不会影响排名，也不会产生 Search Console 错误。  
  所以这项任务的价值是“删掉假的 `/search` 声明，避免自家结构化数据说谎”，不是“保住一个还在工作的 sitelinks searchbox 功能”。计划没把这个外部语义讲清楚。  
  官方来源：  
  - https://developers.google.com/search/blog/2024/10/sitelinks-search-box  
  - https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox

- ❌ **Task 17 的 commit message 说“blog/ 目录和 posts/ 都归档到 Trash”，但步骤根本没做 `content/posts/`。**  
  当前真实博客内容还在 `content/posts/en/welcome.mdx`、`content/posts/zh/welcome.mdx`。  
  更进一步，blog 相关内容/缓存/查询面也没被计划覆盖完：`src/lib/content-manifest.generated.ts`、`src/lib/content/blog.ts`、`src/components/blog/*`、blog cache tags/messages/tests 仍然大量存在。删路由不等于删掉 blog 这条产品线。  
  证据：`content/posts/en/welcome.mdx`、`content/posts/zh/welcome.mdx`，以及 `rg -n "/blog|blog" src content messages` 的大量命中。

## D8: 计划自身的结构问题

- ❌ **它明显违反了 writing-plans 的 “No Placeholders” 规则。**  
  直接占位的地方包括：
  - `git add <changed-files>`（Task 19, 20）
  - `/path/to/delivered/...`（Task 8, 9, 10）
  - “`pnpm proof:csp` **或** baseline 报告中提到的命令”
  - “`pnpm review:semgrep` **或** baseline 报告中提到的命令”  
  这不是“细节待补”，而是执行面没有闭环。

- ❌ **Task 18 / 19 是整份计划里最模糊、也最危险的两段。**  
  它们都没有像前面任务那样给出真实文件、真实函数、真实改法，反而用“选策略”“按 baseline 原则处理”“如有 e2e”这类空话顶上。  
  对安全修复来说，这种模糊不是文风问题，是高返工概率问题。

- ❌ **计划引用了不存在的命令和不存在的资料文件。**  
  实测/核对后，不存在的包括：
  - `pnpm proof:csp`
  - `pnpm review:csp`
  - `pnpm review:semgrep`
  - `cookbook/security/csp-nonce.mdx`
  - `src/lib/__tests__/structured-data-generators.test.ts`  
  这些不是“推荐替代命令”，而是计划正文直接指路指错。

- ❌ **Task 17 用 `git add -A` 兜底，Task 8/10 又用“只 add 新文件”漏删文件，整份计划的暂存策略前后自相矛盾。**  
  一个极端会误提交流，一个极端会漏提交删除。说明计划作者没有把“在 dirty worktree 里怎么安全 staging”设计清楚。

## 修复建议优先级排序

1. **先重写 Task 2。**  
   把 root cause 改成真实 audit：  
   - root `next 16.2.3` 不是当前命中的 next  
   - `react-server-dom-* 19.2.4` 才是当前直接命中  
   - `@react-email/preview-server > next 16.1.7` 也要单独处理  
   - 删掉“Task 2 后 audit high 清零”的假承诺

2. **把所有假符号/假文件名修正后再执行。**  
   至少先修：`generateWebsiteSchema`、`resolveSitemapLastmod`、`sanitizeUtmValue`、`hasMarketingConsent`、`SITE_FACTS`、`structured-data-generators.test.ts`。

3. **重写 Task 18 / 19，按真实实现面落地。**  
   - Task 18 目标文件应以 `src/config/security.ts` 为主，不是 `middleware.ts`  
   - Task 19 用 `pnpm security:semgrep`，并围绕当前 2 条 object-injection warning 给出具体改法

4. **给 content 类任务补“刷新 generated manifest”步骤。**  
   否则 Task 12/13/14 的 dev 验证不可信。

5. **补 Wave 1 漏掉的 GitHub/social cleanup。**  
   这在 baseline 里已经是 1.1 范围，不能等 Wave 2。

6. **把 Task 17 扩成真正的 blog 下线方案。**  
   至少补上：
   - `content/posts/**` 的归档策略
   - `content-manifest.generated.ts` / content query / blog cache / blog messages 的处理边界
   - staging 策略改成显式文件列表，禁止 `git add -A`

7. **把 Task 4 / 5 / 16 的现有测试债写进计划，而不是假设“跑一下就过”。**  
   当前已有旧断言会直接跟新计划冲突：SEO keywords、logo src、structured-data logo、mobile nav test matrix 都是现成雷。

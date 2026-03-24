> 调研时间：2026-03-23
> 调研模式：deep
> 置信度：0.82
> 搜索轮次：14 | Hop 深度：4
> 时效敏感性：极高（Next.js 16 / 工具版本快速迭代）

---

# Next.js 16 + Cloudflare 项目深度代码质量审查方法论

**调研背景**：B2B PVC 管件出口独立站，Next.js 16 App Router + React 19 + TypeScript 5.9 + Tailwind CSS 4 + Cloudflare Pages 部署。现有工具：ESLint、Semgrep、Vitest、Playwright、Lighthouse CI。

**核心问题**：现有工具之外，哪些方法和工具能发现现有工具发现不了的深层问题？

---

## 维度一：静态分析 / 类型级别深度检查

### 死代码检测：Knip

**增量价值**：ESLint 检查代码语法和规则，Knip 检查整个项目结构层面的死代码——未使用的文件、未使用的导出、`package.json` 中声明但从未被运行时代码引用的依赖、以及配置文件里没有任何代码真正用到的条目。这是 ESLint 根本无法覆盖的维度。

**支持情况**：Knip 原生支持 Next.js，有专用插件，能自动识别 App Router 的 entry points（`page.tsx`、`layout.tsx`、`route.ts` 等），不需要手动配置入口点。100+ 框架插件，支持 Vitest、GitHub Actions 等。[高置信度，来源：[knip.dev](https://knip.dev/)]

**使用方式**：
```bash
npx knip   # 零配置快速扫描
pnpm add -D knip  # 加入 devDependencies 集成 CI
```

**CI 集成**：作为 PR 检查步骤，发现未使用导出则阻断构建。有 VSCode/Cursor 扩展，有 MCP 工具辅助生成配置。

**独立开发者成本**：极低。`npx knip` 零安装摩擦，配置几乎全自动，维护负担可忽略。

---

### 工具链层面：Biome 与 Oxlint

**增量价值**：对于已有严格 ESLint 配置的项目，这两个工具的增量价值不在于发现新问题，而在于 **CI 速度**。

| 工具 | 定位 | Next.js 适配 |
|------|------|------------|
| **Biome v2** | ESLint+Prettier 一体替代，423+ 规则，type-aware linting | 官方支持，`next create-app` 可选，但尚无 `eslint-plugin-next` 等同物 |
| **Oxlint** | CI 预筛选器，695+ 规则，50-100x 快于 ESLint | Vercel 自用，作为 ESLint 前置预检 |

**对现有项目的建议**：项目已有严格 ESLint，**不推荐现阶段迁移到 Biome**（会丢失 Next.js 专用规则）。可考虑将 Oxlint 作为 ESLint 的 CI 前置预筛——先过一遍 Oxlint（0.6s），快速失败，再进 ESLint（20s）。减少 CI 排队时间约 60%。[中置信度，来源：[pkgpulse.com Biome vs ESLint vs Oxlint 2026](https://www.pkgpulse.com/blog/biome-vs-eslint-vs-oxlint-2026)]

---

## 维度二：架构级审查

### 模块依赖分析：dependency-cruiser

**增量价值**：ESLint 能检查单文件内的代码问题，dependency-cruiser 能在架构层面**强制执行依赖方向规则**，把违规变成构建错误。对 Next.js App Router 的核心价值是：防止 Client 组件意外 import Server 组件或 `server-only` 模块（这类错误运行时才暴露，且报错不直观）。

**最新版本**：17.3.9（截至调研时 7 天前发布）。[来源：[npmjs.com/package/dependency-cruiser](https://www.npmjs.com/package/dependency-cruiser)]

**App Router 关键规则配置**：

```js
// .dependency-cruiser.js 关键片段
{
  name: "no-client-imports-server",
  comment: "Client 组件禁止导入 server-only 模块",
  severity: "error",
  from: { path: "^src/components/.*(client|\\.client)" },
  to:   { path: "server-only" }
},
{
  name: "no-circular",
  severity: "warn",
  // 内置规则，检测循环依赖
}
```

**`depcruise --init`** 自动生成配置，内置孤立文件、缺失 `package.json` 声明等默认规则。

**独立开发者成本**：初始配置 1-2 小时，后续近零维护。CI 集成简单（`depcruise src --config .dependency-cruiser.js`）。

**与 Madge/Skott 的对比**：Madge 可视化更直观但规则执行能力弱；Skott 比 Madge 快 7 倍但生态尚未成熟。dependency-cruiser 是三者中规则执行能力最强的，CI 集成最成熟。[来源：[dependency-cruiser GitHub issue #203](https://github.com/sverweij/dependency-cruiser/issues/203)]

---

### Bundle 分析：next experimental-analyze

**Next.js 16.1 内置的 Turbopack 原生分析器**——这是现有 `@next/bundle-analyzer`（Webpack 插件）的重要升级。

```bash
next experimental-analyze          # 输出到 .next/diagnostics/analyze
next experimental-analyze --serve  # 本地服务器展示（默认 4000 端口）
```

**增量价值**：旧版 `@next/bundle-analyzer` 与 Turbopack dev 不兼容（已知 issue #77482）。新工具：
- 感知 Next.js 路由——按路由筛选哪些依赖导致体积膨胀
- 跨 Server/Client 边界的完整 import 链追踪
- 服务端 bundle 分析（API routes、Server Components 的冷启动开销）

**适用场景**：当 Lighthouse CI 发现性能分数下降，但原因不明时，用这个工具定位具体的 module-level 原因。[来源：[Next.js 16.1 官方博客](https://nextjs.org/blog/next-16-1)]

---

## 维度三：测试质量审查

### 变异测试：Stryker + Vitest Runner

**增量价值**：覆盖率告诉你测试**执行了多少代码**，变异测试告诉你测试**是否真的能抓 bug**。Stryker 在代码里注入突变（改变逻辑运算符、翻转条件等），如果测试不能杀死突变体，说明测试存在无效覆盖。

**Vitest 支持现状（2026）**：

```json
{
  "testRunner": "vitest",
  "reporters": ["html", "clear-text"],
  "coverageAnalysis": "perTest",
  "incremental": true,
  "mutate": ["src/lib/**/*.ts", "src/components/**/*.tsx"]
}
```

官方包 `@stryker-mutator/vitest-runner` 支持标准 Vitest（Node 模式）+ TypeScript checker 插件。[高置信度，来源：[stryker-mutator.io/docs/stryker-js/vitest-runner](https://stryker-mutator.io/docs/stryker-js/vitest-runner/)]

**已知限制**：
- Vitest **Browser Mode 不支持** [⚠️ 官方文档明确]
- 默认强制 `coverageAnalysis: "perTest"`
- 只支持 `threads: true` 模式

**运行时间参考**：从 Jest 切换到 Vitest runner 后，变异测试从 60 分钟缩至 25 分钟。`incremental: true` 模式只对变更文件做变异测试，适合 CI 增量运行。

**独立开发者成本**：第一次完整跑 1-2 小时，配置正确后每次 CI 用 incremental 模式约 15-30 分钟。建议仅对核心业务逻辑和工具函数启用，不对 UI 组件全量跑。

**对应现有工具的增量**：Vitest 覆盖率 + 变异测试 = 完整的测试有效性画像。覆盖率 90% 不代表测试质量高，变异分数（Mutation Score）才是可靠指标。

---

### 属性测试：fast-check + @fast-check/vitest

**增量价值**：Vitest 的 example-based 测试验证已知输入，fast-check 的 property-based 测试通过随机生成输入发现**边界情况和竞态条件**。对于工具函数、数据转换逻辑特别有价值。

**Vitest 集成**：

```ts
import { test, fc } from '@fast-check/vitest';

test.prop([fc.string(), fc.string()])('编码后解码应等于原始字符串', (input) => {
  return decode(encode(input)) === input;
});
```

`@fast-check/vitest` 0.2.3+ 支持 Vitest 4.x。[来源：[npmjs.com/@fast-check/vitest](https://www.npmjs.com/package/@fast-check/vitest)]

**适用场景**：联系方式验证逻辑、URL 解析、产品数据格式化函数。对于 B2B 询盘表单的验证逻辑，可以用 fast-check 生成大量随机输入验证边界。

**独立开发者成本**：学习曲线约 2-4 小时，适合单点引入，不需要全量使用。

---

## 维度四：运行时质量

### RUM 方案：双平台原生工具优先

**项目部署目标是 Vercel + Cloudflare Pages，两个平台各有原生 RUM 工具，建议优先使用原生工具，避免引入第三方 SDK 的额外 bundle 开销。**

#### Vercel Speed Insights

- 监控 LCP、INP、CLS 三个核心指标（Google PageSpeed 排名维度）
- 追踪 TTFB、FCP
- 真实用户数据（不是 Lighthouse 实验室数据），Google 用 28 天真实用户数据排名
- 零配置：`<SpeedInsights />` 组件 + 自动注入

```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
// 在 layout.tsx 中加入 <SpeedInsights />
```

[来源：[vercel.com/docs/speed-insights](https://vercel.com/docs/speed-insights)]

#### Cloudflare Web Analytics

- 隐私优先 RUM：不收集个人数据，GDPR 友好
- 与 Cloudflare Pages 深度集成（2026 中期将全平台默认开启）
- Core Web Vitals + 服务端性能指标组合视图

**建议组合**：Vercel 部署用 Speed Insights，Cloudflare 部署用 Cloudflare Web Analytics，两者数据互补（不建议同时运行两个 SDK）。

---

### 错误追踪：Sentry（Cloudflare 部署有特殊注意事项）

**Sentry 对 Next.js + Cloudflare 的官方支持状态（2026-03 验证）**：

必需配置：
1. `wrangler.jsonc` 中添加 `nodejs_compat` compatibility flag
2. `compatibility_date` 设为 `2025-08-16` 或更晚

**已知限制**（截至 2026-01）：
- Server-side span 时长显示 0ms（Cloudflare Workers 的 timing 攻击防护机制，无法绕过）[高置信度，来源：[Sentry Cloudflare 文档](https://docs.sentry.io/platforms/javascript/guides/cloudflare/frameworks/nextjs/)]
- `@sentry/nextjs` 模块解析错误（workaround：`outputFileTracingIncludes` 配置）[⚠️ 建议实测验证，来源：[GitHub Issue #18843](https://github.com/getsentry/sentry-javascript/issues/18843)]
- `AsyncLocalStorage` 错误导致生产中断（workaround：仅保留客户端 Sentry，移除服务端配置）[⚠️ 活跃 Bug，来源：[GitHub Issue #18842](https://github.com/getsentry/sentry-javascript/issues/18842)]

**实用建议**：对于 Cloudflare 部署目标，建议先仅启用客户端错误追踪（`sentry.client.config.ts`），服务端集成等 SDK 稳定后再引入。`withSentryConfig` wrapper 仍可用于 source map 上传。

**替代方案**：如果 Sentry 服务端集成问题影响项目稳定性，可考虑 [OpenReplay](https://openreplay.com)（开源，可自托管，对 Cloudflare Edge 无特殊依赖）。

---

## 维度五：安全深度审查

### 供应链安全 SCA：分层策略

现有 `pnpm audit --prod` 只检查已知 CVE，存在以下盲区：
- 零日漏洞和无 CVE 的恶意包
- 依赖混淆攻击（dependency confusion）
- 被攻陷的包维护者账号

**推荐分层**：

| 层级 | 工具 | 作用 | 成本 |
|------|------|------|------|
| 基线（已有） | `pnpm audit --prod` | 已知 CVE | 免费 |
| 行为分析（新增） | **Socket.dev** | 检测恶意行为、typosquatting | 独立开发者免费 |
| 深度 CVE（可选） | Snyk（Free tier） | 比 npm audit 更多 CVE 数据库 | 10 个项目内免费 |

**Socket.dev 对独立开发者**：永久免费（开源项目），私有仓库有免费 tier，70+ 供应链风险指标。源代码不离开本地，只发送依赖列表。[高置信度，来源：[socket.dev/pricing](https://socket.dev/pricing)]

**2025 年真实事件参考**：2025 年 9 月 chalk、debug 等 18 个共 26 亿周下载量的包被供应链攻击，传统 `npm audit` 无法检测到此类攻击。

**CI 集成**：Socket 的 GitHub App 在 PR 里自动评论可疑的依赖变更。

---

### DAST 动态安全测试

**现有 Semgrep 是 SAST（静态），DAST 是运行时测试，能发现 SAST 发现不了的运行时漏洞（认证绕过、IDOR、CSRF 等）。**

| 工具 | 适合场景 | 独立开发者可行性 |
|------|---------|----------------|
| **OWASP ZAP** | 全面扫描，开源免费，Docker 镜像可直接 CI 集成 | 高（有完整文档和 CI 示例） |
| **Nuclei** | 模板化、低误报、快速 | 高（YAML 配置，命令行直接运行） |
| **StackHawk** | CI 原生 DAST | 低（最少 5 名贡献者起，不适合独立开发者） |

**推荐**：以 OWASP ZAP Docker 镜像做定期（每周/每月）扫描，而非每次 CI。对 B2B 站的关键路径（联系表单、API 端点）做针对性扫描：

```bash
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://staging.tianze-pipe.com \
  -r zap-report.html
```

[来源：[aikido.dev DAST Tools 2026](https://www.aikido.dev/blog/top-dynamic-application-security-testing-dast-tools)]

---

### Next.js 特有安全审查点

ESLint 和 Semgrep 无法自动检测的业务逻辑安全问题（需人工或专用规则）：

**Server Actions 审查清单**（基于官方安全文档）：
- 每个 `'use server'` 函数是否都有输入验证（Zod schema）？
- 是否在 action 内部重新验证用户权限（不依赖前端传参）？
- 是否检查资源所有权（authorization，不只是 authentication）？
- 返回值是否只包含客户端需要的字段（不泄露全量数据库对象）？

**Route Handlers 审查**（`route.ts`）：
- POST/PUT/DELETE 端点是否有 CSRF 防护（Server Actions 自动防护，Route Handlers 需手动）？
- 是否有 IDOR 漏洞（获取资源时是否验证请求方是所有者）？

**可用 Semgrep 自定义规则补充**：针对以上模式写 Semgrep rule，加入现有安全扫描。[来源：[nextjs.org/blog/security-nextjs-server-components-actions](https://nextjs.org/blog/security-nextjs-server-components-actions)]

---

## 维度六：视觉 / UI 质量

### 视觉回归测试

**现有 Playwright 已具备原生视觉测试能力（`toHaveScreenshot()`），无需引入额外 SaaS 平台。**

**Playwright 内置方案（推荐起点）**：
- 基线截图存入 Git
- CI 中自动对比，失败时生成三图（Expected / Actual / Diff）
- 适合单人开发工作流

**局限**：基于像素对比（pixelmatch），1px 的抗锯齿变化会触发误报；基线管理随项目增长变得繁琐。

**Argos CI（推荐升级路径）**：
- 与 Playwright 原生集成，不改变测试写法
- 将 diff 结果反馈到 GitHub PR（作为检查项）
- 开源项目免费；支持 Playwright sharding
- 处理动态内容（时间戳、异步数据）

[来源：[argos-ci.com](https://argos-ci.com)]

**Chromatic / Percy 的评估**：两者起步 $149/月，Chromatic 需要 Storybook，Percy 跨浏览器能力更强。对于独立开发者的 B2B 站，**Playwright + Argos CI** 是性价比最优组合；Storybook 不在当前项目栈中，故 Chromatic 不适用。

---

### 无障碍深度审查

**现有 Lighthouse CI 包含基础 a11y 检查（基于 axe-core 子集）。**

**增量价值**：Lighthouse 的无障碍覆盖只是 WCAG 问题的约 30-40%，其余需要专用工具或手动测试。

**推荐组合**：

```
Pa11y-ci（命令行，CI 集成）
  + axe-core runner（更高覆盖率）
  → 两者联合覆盖约 73% 的 WCAG 问题
```

Pa11y 作为 CI 无障碍检查门槛，防止回归：

```bash
pnpm add -D pa11y-ci
# 新增 CI 步骤：pa11y-ci --config .pa11yci
```

**B2B 站现实考量**：B2B 站的主要用户是采购商（非残障辅助技术用户），无障碍的优先级相对较低，但 Lighthouse CI 发现的问题（已有）是底线，Pa11y 可作为**可选增量**而非强制门槛。

---

## 维度七：AI 辅助代码审查

### CodeRabbit：最具增量价值的 AI 审查工具

**对比 GitHub Copilot Code Review**：

| 维度 | Copilot Review | CodeRabbit |
|------|---------------|-----------|
| 表面问题（null check 等） | ✅ | ✅ |
| 深层 bug 和性能问题 | 弱 | ✅ |
| 模式一致性（与现有代码库对比） | ✗ | ✗（共同弱点） |
| 平台支持 | 仅 GitHub | GitHub/GitLab/Azure/Bitbucket |
| 项目规则定制 | 有限 | 深度可配置 |

**CodeRabbit 对本项目的关键价值**：可读取 `.claude/rules/` 下的规则文件，通过 `.coderabbit.yaml` 配置 path-based 指令。项目已有 `CLAUDE.md`、架构规则、编码规范——这些都可以直接作为 CodeRabbit 的 review context。

```yaml
# .coderabbit.yaml 示例
reviews:
  path_instructions:
    - path: "src/app/api/**"
      instructions: "检查 Server Actions 安全清单：输入验证、权限验证、资源所有权"
    - path: "**/*.client.tsx"
      instructions: "确保没有 server-only import，没有直接的数据库调用"
```

[高置信度，来源：[coderabbit.ai blog - Code Guidelines](https://www.coderabbit.ai/blog/code-guidelines-bring-your-coding-rules-to-coderabbit)]

**定价**：开源项目免费；私有仓库 Pro 计划（有免费 trial）。对独立开发者是从零到有的审查层——之前每个 PR 只有开发者自审，现在有 AI 外部视角。

**已知弱点**：业务逻辑错误（"这个折扣计算规则是否正确"）两者都无法判断，仍需人工。

---

## 工具落地优先级矩阵

**评估维度**：增量价值 × 独立开发者实施成本（时间/费用/维护）

| 工具 | 增量价值 | 实施成本 | 推荐优先级 |
|------|---------|---------|-----------|
| **Knip** | 高（发现结构性死代码） | 极低（一行命令） | P0：立即引入 |
| **dependency-cruiser** | 高（强制 Server/Client 边界） | 低（初始 2h 配置） | P0：立即引入 |
| **next experimental-analyze** | 高（内置，无成本） | 零（内置命令） | P0：按需使用 |
| **Socket.dev** | 高（供应链行为分析） | 极低（GitHub App 一键） | P0：立即引入 |
| **CodeRabbit** | 高（AI PR 外部视角） | 低（`yaml` 配置） | P1：本周引入 |
| **Stryker（变异测试）** | 高（测试质量真相） | 中（配置 + 时间开销） | P1：核心模块先行 |
| **Vercel Speed Insights** | 高（真实用户性能） | 极低（一个组件） | P1：部署时引入 |
| **Sentry 客户端** | 高（错误追踪） | 低（client-only 先行） | P1：部署时引入 |
| **OWASP ZAP（定期）** | 中（运行时安全） | 中（Docker，需 staging 环境） | P2：有 staging 后引入 |
| **fast-check** | 中（边界输入测试） | 中（学习曲线） | P2：核心验证逻辑 |
| **Pa11y-ci** | 低（对 B2B 场景） | 低 | P3：可选 |
| **Playwright + Argos CI** | 中（视觉回归） | 低 | P2：UI 稳定后引入 |
| **Stryker 全量** | 高 | 高（耗时） | P3：指定模块 |

---

## 关键发现与结论

**1. 最大的审查盲区**：现有工具链（ESLint + Semgrep + Vitest + Lighthouse CI）的核心盲区是**项目结构层面**（死代码、架构边界）和**测试有效性**（覆盖率高但测试虚假）。Knip + dependency-cruiser + Stryker 能填补这三个盲区。

**2. Sentry 在 Cloudflare 有已知 Bug**：服务端 Sentry 集成在 Cloudflare Workers 存在活跃 Bug（AsyncLocalStorage 错误），建议先只用客户端追踪。[⚠️ 建议实测验证]

**3. 供应链安全是被严重低估的风险**：`pnpm audit` 只查 CVE，Socket.dev 查恶意行为——两者不重叠，且 Socket.dev 对独立开发者免费。

**4. AI 审查的局限**：CodeRabbit 和 Copilot 均无法检测模式一致性（新代码是否遵循已有代码库的惯用模式），这是当前 AI 审查工具的共同盲点，仍需人工 PR review 作为补充。

**5. 视觉测试的起点**：Playwright 已有 `toHaveScreenshot()`，不需要额外工具即可启动视觉回归测试，Argos CI 是从单人工作流到更专业流程的自然升级路径。

---

## 信息缺口与局限

**未能确认**：
- LogRocket / OpenReplay 与 Cloudflare Edge Runtime 的具体集成细节（官方文档无明确覆盖）
- Sentry Issue #18842 和 #18843 是否已在最新 SDK 版本中修复（截至调研时仍为开放状态）

**调研局限**：
- Stryker 的全量运行时间高度依赖具体项目代码量，本文引用的 25 分钟是 benchmark 数据，实测可能不同
- StackHawk 定价（最低 5 名贡献者）确认为独立开发者不适用
- Chromatic/Percy 的定价和功能细节以官方页面为准（$149/月 起价已确认）

**建议后续调研**：
- Sentry GitHub 仓库追踪 Issue #18842 修复状态
- 引入 Knip 后，扫描结果中的误报处理（`knip.config.ts` ignore 配置）

---

## 来源

### Tier 1（官方文档）

- [Knip 官方文档](https://knip.dev/)
- [Stryker Vitest Runner 官方文档](https://stryker-mutator.io/docs/stryker-js/vitest-runner/)
- [Next.js 16.1 Release Notes](https://nextjs.org/blog/next-16-1)
- [Sentry Next.js on Cloudflare 官方指南](https://docs.sentry.io/platforms/javascript/guides/cloudflare/frameworks/nextjs/)
- [Sentry GitHub Issue #18843](https://github.com/getsentry/sentry-javascript/issues/18843)
- [Sentry GitHub Issue #18842](https://github.com/getsentry/sentry-javascript/issues/18842)
- [Next.js 官方安全文档](https://nextjs.org/blog/security-nextjs-server-components-actions)
- [Vercel Speed Insights 文档](https://vercel.com/docs/speed-insights)
- [Cloudflare Web Analytics 文档](https://developers.cloudflare.com/web-analytics/)
- [@fast-check/vitest npm 包](https://www.npmjs.com/package/@fast-check/vitest)
- [dependency-cruiser npm 包](https://www.npmjs.com/package/dependency-cruiser)
- [Socket.dev 定价页](https://socket.dev/pricing)
- [CodeRabbit 配置文档](https://docs.coderabbit.ai/reference/configuration)
- [next experimental-analyze PR #85915](https://github.com/vercel/next.js/pull/85915)

### Tier 2（权威技术内容）

- [Biome vs ESLint vs Oxlint 2026 对比](https://www.pkgpulse.com/blog/biome-vs-eslint-vs-oxlint-2026)
- [Knip 用于 Next.js 实践](https://dev.to/ajmal_hasan/knip-the-ultimate-dead-code-detector-for-javascript-typescript-projects-3463)
- [dependency-cruiser 架构规则教程](https://spin.atomicobject.com/dependency-cruiser-imports/)
- [CodeRabbit vs GitHub Copilot Code Review](https://dev.to/rahulxsingh/coderabbit-vs-github-copilot-for-code-review-2026-3n8c)
- [CodeRabbit Code Guidelines](https://www.coderabbit.ai/blog/code-guidelines-bring-your-coding-rules-to-coderabbit)
- [Socket vs Snyk 对比](https://socket.dev/compare/socket-vs-snyk)
- [npm 供应链安全 2026](https://bastion.tech/blog/npm-supply-chain-attacks-2026-saas-security-guide)
- [Visual Regression Testing Tools 2026](https://bug0.com/knowledge-base/visual-regression-testing-tools)
- [Argos CI + Playwright 集成](https://blog.logrocket.com/visual-regression-testing-argos-ci/)
- [Playwright 视觉测试指南 2026](https://bug0.com/knowledge-base/playwright-visual-regression-testing)
- [Pa11y + axe-core 无障碍测试对比](https://inclly.com/resources/accessibility-testing-tools-comparison)
- [Top DAST Tools 2026](https://www.aikido.dev/blog/top-dynamic-application-security-testing-dast-tools)
- [StackHawk 定价](https://www.g2.com/products/stackhawk/pricing)
- [Stryker Mutation Testing + AI Agents（Vitest browser mode workaround）](https://alexop.dev/posts/mutation-testing-ai-agents-vitest-browser-mode/)

### Tier 3（参考）

- [Skott (Next-gen Madge) 介绍](https://dev.to/antoinecoulon/introducing-skott-the-new-madge-1bfl)
- [OpenReplay vs LogRocket](https://blog.openreplay.com/logrocket-vs-openreplay/)
- [fast-check property-based testing 指南](https://www.samuraikun.dev/articles/property-based-testing)

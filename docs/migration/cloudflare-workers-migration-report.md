# Cloudflare Workers 迁移可行性报告

> 基于 2026-02-14 多轮调研与交叉验证。已整合 Claude 调研、Codex 本地 POC 反馈、三轮校正。

## 一、结论

**技术上可行，但需要分阶段 POC 验证后再决定切生产。**

- 推荐方案：`@opennextjs/cloudflare@1.16.5` + Cloudflare Workers（非 Pages）
- `@cloudflare/next-on-pages` 已废弃，官方明确推荐 OpenNext
- 当前项目核心特性（`"use cache"`、next-intl middleware）均已获得 OpenNext 支持
- 主要风险集中在 `revalidateTag` SWR profile 降级和 cacheComponents 运行时稳定性

### 迁移决策矩阵

| 条件 | 建议 |
|------|------|
| 接受 cacheComponents POC 验证周期 | 推荐迁移 |
| 要求零缓存行为降级 | 等待 OpenNext #1058 修复后再迁移 |
| 成本驱动 | Cloudflare Workers Paid ($5/月) vs Vercel Pro ($20/人/月)，值得迁移 |
| 追求最低迁移风险 | 考虑 VPS 自托管（$4-6/月，完整 Node.js 环境，零兼容性问题） |

---

## 二、当前技术栈与 Cloudflare Workers 兼容性

### 2.1 核心框架

| 组件 | 版本 | 兼容性 | 说明 |
|------|------|--------|------|
| Next.js | 16.1.5 | **已支持** | OpenNext 1.15.0 起支持 Next.js 16 |
| React | 19.2.3 | 兼容 | |
| TypeScript | 5.x | 兼容 | 构建时，不影响运行时 |
| Tailwind CSS | 4.x | 兼容 | 构建时 |
| next-intl | 4.7+ | **已支持** | 所有已知 bug 已修复（#678/#683/#774） |

### 2.2 Next.js 配置项

| 配置 | 当前值 | Workers 兼容性 |
|------|--------|---------------|
| `cacheComponents` | `true` | 已支持（v1.14.7 PR #1053），需 POC 验证稳定性 |
| `output` | 未设置（默认） | OpenNext adapter 自行处理 |
| `productionBrowserSourceMaps` | `true` | 兼容 |
| `optimizePackageImports` | `['lucide-react', '@radix-ui/react-icons']` | 兼容 |
| `runtime: 'edge'` | **项目中不存在** | 无需处理 |
| PPR / dynamicIO | 未启用 | 不涉及 |

### 2.3 特性兼容矩阵

| 特性 | OpenNext 状态 | 本项目使用 | 风险 |
|------|--------------|-----------|------|
| App Router | 已支持 | 是 | 无 |
| Server Components | 已支持 | 是 | 无 |
| `"use cache"` (Cache Components) | 已支持 (v1.14.7) | 是（5 个产品缓存 + 2 个博客缓存 + 1 个联系页缓存） | **中** — #1115 修复已发布在 1.16.4+，需干净环境验证 |
| `revalidateTag(tag, profile)` | **未实现** (#1058) | 是 — 所有调用带 `"max"` 参数 | **中高** — 退化为非 SWR 语义 |
| `revalidatePath(path, type)` | 已支持 | 是 | 无 |
| Middleware (`middleware.ts`) | 已支持 | 是（next-intl + CSP nonce） | **低** |
| `proxy.ts` (Node Middleware) | **未支持** | 未使用 | 无需关注 |
| Route Handlers (API Routes) | 已支持 | 是（9 个 API 路由） | 低 |
| `next/image` | 需配置 | 是（10 个组件） | **中** — 需 Cloudflare Images + custom loader |
| ISR | 已支持 | 是 | 需配置 R2 + DO queue |

---

## 三、风险评估（按优先级排序）

### P0 — 阻断性 / 必须验证

#### 3.1 `revalidateTag` SWR profile 降级

- **现状**：`src/lib/cache/invalidate.ts:48` 所有调用使用 `revalidateTag(tag, "max")`
- **影响**：OpenNext #1058 未实现，`"max"` 参数被忽略
- **行为变化**：从 stale-while-revalidate（先返旧内容后台刷新）退化为 immediate expire（首次请求阻塞式重新生成）
- **受影响路径**：`/api/cache/invalidate` → `invalidateI18n`/`invalidateContent`/`invalidateProduct`/`invalidateLocale`/`invalidateDomain`
- **缓解方案**：
  - 短期：接受语义降级，对用户体验影响有限（仅缓存失效后首次请求变慢）
  - 中期：等待 #1058 修复，或将 `"max"` 回退为无第二参数调用

#### 3.2 cacheComponents 运行时稳定性

- **现状**：`next.config.ts` 启用 `cacheComponents: true`
- **已知 Bug**：#1115（PPR 缓存后静态 shell 无动态流）— 1.16.4+ 包含相关修复提交，但 issue 仍为 open 状态（waiting for feedback），不能视为已解决
- **Codex POC 反馈**：1.16.5 下仍观察到动态页面超时和运行时警告
- **待验证**：必须在干净环境（无残留缓存）下使用 1.16.5 重新 POC，以项目实测结果为准
- **缓解方案**：POC 分两阶段 — 先禁用 cacheComponents 验证核心链路，再单独回测

### P1 — 高风险 / 需要改动

#### 3.3 Vercel 专属服务替换

| 服务 | 当前文件 | 替换方案 |
|------|---------|---------|
| `@vercel/analytics` | `src/components/monitoring/enterprise-analytics-island.tsx:10` | Cloudflare Web Analytics / 已有 GA4 |
| `@vercel/speed-insights` | 同上 | 移除（用 Cloudflare 或 Lighthouse CI 替代） |
| Vercel KV (Rate Limiting) | `src/lib/security/distributed-rate-limit.ts` | 保留 Upstash Redis 分支，去掉 KV 分支 |
| Vercel Cron Jobs | `vercel.json:29`（`/api/health` 每日执行） | Workers Cron Triggers + `scheduled()` handler |

**注意**：Vercel KV 实现为直接 REST `fetch` 调用（非 `@vercel/kv` SDK），迁移成本低。

#### 3.4 CI/CD 流水线重写

- **当前**：`.github/workflows/vercel-deploy.yml` 深度绑定 Vercel CLI（`vercel@50.0.0`），依赖 `VERCEL_TOKEN`/`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID`
- **目标**：替换为 `opennextjs-cloudflare build` + `wrangler deploy`
- **保留**：`ci.yml`（type-check/lint/test）和 `code-quality.yml`（Semgrep）不受影响

#### 3.5 `next/image` 优化适配

- **当前**：10 个组件使用 `next/image`，`remotePatterns` 配置 Unsplash 和 placeholder
- **需要**：
  1. 创建 `image-loader.ts`（Cloudflare Images custom loader）
  2. `next.config.ts` 设置 `images.loader: "custom"`
  3. `wrangler.jsonc` 配置 `IMAGES` binding
  4. `remotePatterns` 在 Cloudflare Dashboard 中单独配置

### P2 — 中风险 / 按需处理

#### 3.6 文件系统 (`fs`) 依赖

| 文件 | 用途 | 风险 |
|------|------|------|
| `src/lib/content-utils.ts:7` | MDX 内容目录定义 + 文件列表读取 | **中** — OpenNext 打包 content 到 bundle，只读可工作 |
| `src/lib/content-parser.ts` | MDX 文件读取 + frontmatter 解析 | 同上 |
| `src/lib/content/products-source.ts` | 产品 MDX 文件扫描 | 同上 |
| `src/lib/load-messages.ts:8` | i18n JSON 加载（fs + fetch 双模式） | **低** — 已有 fetch fallback |
| `src/app/[locale]/head.tsx:103` | `existsSync` 检查字体子集文件 | **低** — 可改为构建期检测 |
| `src/lib/sitemap-utils.ts` | Sitemap 生成 | **中** — 需验证构建期 vs 运行时 |

**关键发现**：Codex 本地 POC 确认 OpenNext 会把 `content/`、`messages/` 等打进 server bundle，只读 `fs` 在多数场景可工作。持久写入不可行，但本项目无运行时写入需求。

**结论**：不是阻断项。POC 中验证即可，出问题再改为"构建期产物 + import"模式。

#### 3.7 Airtable SDK

- **当前**：`src/lib/airtable/service.ts` 通过 `await import("airtable")` 动态导入
- **SDK 内部**：`airtable/lib/fetch.js` 有 `typeof self !== 'undefined' ? self.fetch : node_fetch` 分支，Workers 环境下 `self` 存在，理论上可走原生 fetch
- **但**：`lodash` 整包（4.9MB 磁盘 / ~94KB 打包后）作为传递依赖仍会被打包
- **风险等级**：**中** — Workers 运行时可能可工作，需 POC 验证
- **优化方向**：如 POC 通过，可后续替换为 fetch 封装（~150 行），消除 lodash 依赖

#### 3.8 Node.js `crypto` 模块

| 调用 | 文件 | API |
|------|------|-----|
| WhatsApp 签名验证 | `src/lib/whatsapp-service.ts:10` | `createHmac`, `timingSafeEqual` |
| 引用 ID 生成 | `src/lib/lead-pipeline/utils.ts:5` | `randomBytes` |
| Rate limit key | `src/lib/security/rate-limit-key-strategies.ts` | `createHmac` |

- **风险等级**：**中低** — Cloudflare `nodejs_compat` 下 `node:crypto` 已基本支持
- **处理**：POC 中验证即可，无需提前重写

### P3 — 低风险 / 基本兼容

| 项目 | 说明 |
|------|------|
| Middleware (Web Crypto API) | `crypto.randomUUID()`/`crypto.getRandomValues()` 与 Workers 兼容 |
| 客户端组件 (Radix UI/Tailwind/sonner) | 全部 `"use client"`，不受服务端环境影响 |
| `resend` SDK | 底层是 HTTP fetch，Workers 下可工作。[官方有 Workers 指南](https://resend.com/docs/send-with-cloudflare-workers) |
| `zod` 验证 | 纯 JS，兼容 |
| `gray-matter` | 纯 JS，兼容 |
| MDX 编译 (`@mdx-js/*`) | 构建时处理，不影响运行时 |

---

## 四、需要新增的配置文件

### 4.1 `open-next.config.ts`（新建）

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
  tagCache: d1NextTagCache,
});
```

### 4.2 `wrangler.jsonc`（新建）

关键配置项：
- `compatibility_date` >= `"2025-04-01"`（否则 `process.env` 为空）
- `compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"]`
- `services: WORKER_SELF_REFERENCE`（自引用 service binding，R2+D1+DO 缓存架构需要）
- R2 binding: `NEXT_INC_CACHE_R2_BUCKET`
- D1 binding: `NEXT_TAG_CACHE_D1`
- Durable Objects: queue
- Cron triggers: 替代 `vercel.json` 的 crons
- Assets binding
- 环境分层：`env.preview`（预发布）/ `env.production`（生产）— 资源名（R2 bucket、D1 database）使用占位符 + env 分层隔离

### 4.3 `image-loader.ts`（新建）

Cloudflare Images custom loader，替代 sharp 图片优化。

### 4.4 `.github/workflows/cloudflare-deploy.yml`（新建）

新增 Cloudflare 部署 workflow（`cloudflare-deploy.yml`），Vercel workflow 保留兜底。流程：`opennextjs-cloudflare build` → `opennextjs-cloudflare deploy`。

### 4.5 `.dev.vars` / `.dev.vars.example`（新建）

- **说明**：Cloudflare Workers 本地开发环境变量文件（`wrangler dev` 自动读取）
- `.dev.vars.example` 跟踪到 git 作为模板，列出所有需要的变量名（不含实际值）
- `.dev.vars` 包含本地开发的实际密钥值，加入 `.gitignore` 不跟踪

---

## 五、需要修改的现有文件

| 文件 | 改动 | 优先级 |
|------|------|--------|
| `package.json` | 添加 `@opennextjs/cloudflare`、`wrangler`；添加 `preview`/`deploy` 脚本 | P0 |
| `next.config.ts` | `images.loader: "custom"` + `images.loaderFile`；评估 `serverExternalPackages` | P0 |
| `src/components/monitoring/enterprise-analytics-island.tsx` | 移除 `@vercel/analytics` + `@vercel/speed-insights`，保留 GA4 | P1 |
| `src/lib/security/distributed-rate-limit.ts` | 移除 Vercel KV 分支，固定 Upstash Redis | P1 |
| `src/lib/env.ts` | 移除 Vercel 专属变量（`VERCEL_URL`/`VERCEL_ENV` 等），添加 Cloudflare 变量；需同步更新 schema 和 runtimeEnv 映射 | P1 |
| `.github/workflows/vercel-deploy.yml` | 保留不动（Vercel 兜底）；新增 `cloudflare-deploy.yml` | P1 |
| `vercel.json` | 保留（Vercel 继续使用）；Cloudflare 侧 crons 通过 Workers Cron Triggers 独立配置 | P1 |
| `.gitignore` | 添加 `.open-next/` | P0 |

---

## 六、平台对比

### 6.1 成本

| 平台 | 月费 | 带宽 | 适合场景 |
|------|------|------|---------|
| Vercel Pro | $20/人/月 + 用量 | 1TB | 零配置、Next.js 原生支持最佳 |
| Cloudflare Workers Paid | $5/月 + 用量 | 无限 | 高流量、成本敏感 |
| VPS 自托管 (Hetzner/DO) | $4-6/月 | 看配置 | 完整 Node.js、零兼容性风险 |

### 6.2 全球性能

| 平台 | 平均 TTFB | 全球节点 |
|------|----------|---------|
| Cloudflare | ~50ms | 300+ |
| Vercel | ~70ms | ~100 PoP |

### 6.3 中国大陆访问

两个平台标准计划下都不可靠。本项目主要面向海外买家，影响有限。使用自定义域名可改善可达性。

### 6.4 Workers 资源限制

| 限制 | Free | Paid | 本项目状态 |
|------|------|------|-----------|
| Worker 包大小（gzip） | 3 MB | 10 MB | **3.4 MB** — Free 不可行，Paid 有余量 |
| CPU 时间/请求 | 10ms | 取决于计费模型：Bundled 50ms/Standard(Unbound) 最高 5 分钟 | 需 Paid + Standard 模型（SSR 需要更多 CPU） |
| 内存 | 128 MB | 128 MB | 需注意避免大对象缓冲 |
| 每日请求 | 100K | 无限制 | 按流量评估 |
| 环境变量 | 64 个 | 128 个 | 项目约 40+ 变量，需 Paid |

---

## 七、POC 验证计划

### 闸门 1：缓存语义（最高优先级）

- [ ] 禁用 `cacheComponents`，部署 `opennextjs-cloudflare preview`
- [ ] 验证 `"use cache"` 函数的基本行为
- [ ] 启用 `cacheComponents`，在干净环境验证 #1115 修复是否生效
- [ ] 验证 `revalidateTag` 无第二参数时的行为（#1058 降级影响）
- [ ] 验证 `revalidatePath` 行为

### 闸门 2：路由与 i18n

- [ ] 验证 `middleware.ts` 的 locale 检测/重定向
- [ ] 验证 CSP nonce 注入
- [ ] 验证 NEXT_LOCALE cookie 行为
- [ ] 验证无效 locale 前缀重定向

### 闸门 3：运行时兼容

- [ ] 验证 Airtable SDK 在 Workers 环境下的读写
- [ ] 验证 WhatsApp webhook 签名校验（`node:crypto` createHmac/timingSafeEqual）
- [ ] 验证 `resend` 邮件发送
- [ ] 验证 `fs` 只读操作（MDX 内容读取、i18n 消息加载）

### 闸门 4：体积与性能

- [ ] `wrangler deploy --dry-run` 确认 gzip 后体积 < 10 MB
- [ ] 评估是否需要替换 Airtable SDK 优化体积
- [ ] 冷启动时间测试
- [ ] Lighthouse 对比（Vercel vs Workers）

### 闸门 5：平台替换

- [ ] Vercel Analytics → Cloudflare Web Analytics / GA4
- [ ] Vercel KV 分支 → 移除（保留 Upstash）
- [ ] `vercel.json` crons → Workers Cron Triggers
- [ ] CI/CD workflow 替换
- [ ] `next/image` → Cloudflare Images + custom loader

---

## 八、Go/No-Go 决策与灰度策略

### 8.1 Go/No-Go 判断

| 判断 | 说明 |
|------|------|
| **Go** | 启动迁移 POC 分支，不切生产 |
| **唯一硬阻断** | `revalidateTag("max")` SWR profile（`src/lib/cache/invalidate.ts:48`）— 如果缓存失效语义降级不可接受，等待 #1058 修复 |
| **软阻断** | cacheComponents 运行时稳定性 — 以 POC 实测为准 |

### 8.2 灰度切流策略

**双环境并行 1-2 周**：Vercel 保底（100% 流量）+ Workers 预发布（内部/shadow 流量）

切流硬门槛（任一不达标则不切）：

| 指标 | 阈值 | 测量方式 |
|------|------|---------|
| 错误率 (5xx) | < 0.1% | Workers 端观测 |
| P95 TTFB | 与 Vercel 持平或更优 | Lighthouse CI / RUM |
| 冷启动时间 | < 3s | Workers Analytics |
| 缓存命中率 | 与 Vercel 持平 | R2/Cache metrics |

### 8.3 回滚 SOP

1. DNS 切回 Vercel（TTL 建议提前降至 60s）
2. 恢复 `vercel-deploy.yml` workflow
3. 确认 Vercel 环境变量和 cron 仍活跃
4. 关键：迁移期间 **不下线 Vercel 项目**，保持 Vercel 部署可随时接管

---

## 九、信息来源

### 官方文档

- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
- [OpenNext Get Started](https://opennext.js.org/cloudflare/get-started)
- [OpenNext Caching](https://opennext.js.org/cloudflare/caching)
- [OpenNext Image Optimization](https://opennext.js.org/cloudflare/howtos/image)
- [OpenNext Troubleshooting](https://opennext.js.org/cloudflare/troubleshooting)
- [Cloudflare Workers Next.js Guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare Workers Node.js Compat](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Resend Cloudflare Workers Guide](https://resend.com/docs/send-with-cloudflare-workers)

### GitHub Issues / PRs（关键）

| 编号 | 状态 | 主题 |
|------|------|------|
| [PR #1053](https://github.com/opennextjs/opennextjs-cloudflare/pull/1053) | Merged | Support composable cache in Next 16 |
| [#1058](https://github.com/opennextjs/opennextjs-cloudflare/issues/1058) | **Open** | SWR `revalidateTag(tag, "max")` 未实现 |
| [#1082](https://github.com/opennextjs/opennextjs-cloudflare/issues/1082) | **Open** | Next.js 16 支持跟踪（含未完成项） |
| [#1093](https://github.com/opennextjs/opennextjs-cloudflare/issues/1093) | Closed | proxy.ts / Node Middleware — issue 已关闭，但功能仍未支持（需继续使用 `middleware.ts`） |
| [#1115](https://github.com/opennextjs/opennextjs-cloudflare/issues/1115) | **Open** (waiting for feedback) | cacheComponents PPR 缓存 shell 无动态流 — 1.16.4+ 含相关修复提交，但 issue 仍 open，需以项目 POC 结果为准 |
| [#683](https://github.com/opennextjs/opennextjs-cloudflare/issues/683) | Closed | next-intl middleware 构建失败（已修复） |
| [#774](https://github.com/opennextjs/opennextjs-cloudflare/issues/774) | Closed | next-intl canonical URL 错误（已修复） |

### 社区参考

- [从 Vercel 迁移到 Cloudflare Workers](https://harrisonmilbradt.com/blog/2025-11-08-switching-nextjs-from-vercel-to-cloudflare)
- [Next.js 16 迁移突破 25MB 限制](https://medium.com/@Yasirgaji/migrating-next-js-16-from-vercel-to-cloudflare-overcoming-the-25mb-limit-aa88e8396b29)
- [Kinde + next-intl + OpenNext 踩坑](https://marekurbanowicz.medium.com/kinde-next-intl-with-opennext-on-cloudflare-not-that-easy-atm-e837d7af0efa)
- [Deploy Next.js to Cloudflare Workers](https://www.ianwootten.co.uk/2025/06/17/how-to-deploy-a-next-js-app-to-cloudflare-workers/)

---

## 十、调研过程说明

本报告经过四轮调研 + 四轮交叉校验：

1. **第一轮**：Claude 3 个 Opus 子代理并行调研（项目技术栈分析、Cloudflare 支持现状、迁移案例）
2. **Codex 第一轮反馈**：提供文件级改动清单和迁移路线
3. **第二轮验证**：Claude 3 个 Opus 子代理验证文件存在性、`"use cache"` 支持状态、next-intl 兼容性
4. **Codex 第二轮反馈**：提供本地 POC 实测数据（体积、超时、cacheComponents 警告）
5. **第三轮深挖**：Claude 验证 #1115 详情、bundle 构成分析、revalidateTag 第二参数用法
6. **Codex 第三轮反馈**：修正 pnpm hoist 证据不足、Airtable/crypto 风险降级
7. **第四轮终审**：Codex 确认报告可作为决策底稿，提出 3 处时效性/精确性修正
8. **最终修正**：Claude 应用 #1093 状态更正、#1115 措辞校准、CPU 限制精确化、补充灰度策略和回滚 SOP

最终报告采信原则：多轮验证一致确认的结论 > 单方结论 > 文档描述 > 过期信息。

---

## 十一、实施方案修正记录

> 基于 Codex 审查反馈，修正初始实施方案中的错误和遗漏。

### 11.1 脚本修正

`opennextjs-cloudflare build` 内含 `next build`，不需要 `next build && opennextjs-cloudflare build` 两步调用。所有 Cloudflare 相关脚本（`build:cf`、`preview:cf`、`deploy:cf`）统一使用 OpenNext CLI 作为入口，避免重复构建。

### 11.2 Cron Triggers 延后

Cloudflare Cron Triggers 触发的是 `scheduled()` handler 而非 HTTP 路由，需要 custom worker entry 来接收 scheduled 事件。POC 阶段不配置 Cron Triggers，避免引入额外复杂度。健康检查等定时任务可暂用外部 cron 服务（如 UptimeRobot）替代。

### 11.3 wrangler.jsonc 配置补全

在 `wrangler.jsonc` 中补充以下配置：

- **`global_fetch_strictly_public` compatibility flag**：确保 Worker 内 `fetch()` 调用发出公网请求（而非被拦截为内部 subrequest），防止 API 路由调用外部服务时行为异常
- **`WORKER_SELF_REFERENCE` service binding**：R2+D1+DO 缓存架构需要 Worker 自引用来处理 ISR revalidation 回调
- **资源命名**：R2 bucket、D1 database 名称使用占位符，通过 `env.preview` / `env.production` 分层配置实现环境隔离

### 11.4 env.ts runtimeEnv 映射

`@t3-oss/env-nextjs` 要求 `server` / `client` schema 和 `runtimeEnv` 两处同步新增变量。例如新增 `NEXT_PUBLIC_DEPLOYMENT_PLATFORM` 时，必须同时在 schema 中定义验证规则，并在 `runtimeEnv` 中映射 `process.env.NEXT_PUBLIC_DEPLOYMENT_PLATFORM`，否则运行时取不到值（返回 `undefined`）。

### 11.5 本地开发环境

新增 `.dev.vars` 文件（Cloudflare Workers 本地开发的环境变量文件，`wrangler dev` 自动读取）：

- `.dev.vars` 包含本地开发所需的实际密钥值，加入 `.gitignore` 防止泄露
- `.dev.vars.example` 作为模板跟踪到 git，列出所有变量名和说明，不含实际值

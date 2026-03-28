> 调研时间：2026-03-28
> 调研模式：standard
> 置信度：0.82
> 搜索轮次：10 | Hop 深度：3

# CI 之后「代码到用户」缺口的开源验证工具调研

## 背景与问题定义

本项目的 CI 流水线已覆盖：类型检查、lint、单元测试、Playwright E2E、Lighthouse 性能、安全扫描。但以下五条链路在 CI 阶段无法验证：

| 缺口 | 根因 |
|------|------|
| 表单提交链路 | CI 内用 mock，真实 Airtable 写入和 Resend 发信未验证 |
| 部署后可用性 | DNS 解析、CDN 缓存、Cloudflare Worker 冷启动只在生产环境发生 |
| 跨浏览器视觉表现 | CI 仅跑 Chromium，Safari/Firefox 渲染差异不覆盖 |
| 第三方服务健康 | Airtable、Resend、Turnstile 宕机无感知 |
| 内容与 SEO 有效性 | meta 标签、结构化数据、sitemap 的正确性无自动校验 |

---

## A. 合成监控 / 部署后验证

### 1. Checkly CLI

**一句话**：把现有 Playwright 测试直接提升为持续运行的生产合成监控，Monitoring as Code 工作流与 CI/CD 原生集成。

- **GitHub Stars**：[checkly/checkly-cli](https://github.com/checkly/checkly-cli) — 93 stars（CLI 仓库；Checkly 平台本身已有成熟 SaaS 用户基础）
- **许可证**：Apache-2.0（CLI 开源，平台 SaaS）
- **GitHub Actions 集成**：原生支持，可在 PR 合并后自动触发检查，结果注释到 PR
- **Free Tier**：每月 10,000 次 API 检查 + 1,500 次 Browser 检查，单人项目够用

**适合本项目的理由**：
- 已有 Playwright 测试，复用成本极低——将现有 `*.spec.ts` 文件加一行 `@checkly/cli` 注解即可变成定时监控
- 支持从全球 20+ 节点运行，可验证 Cloudflare CDN 的真实延迟和可用性
- TypeScript-native，与本项目技术栈完全一致
- 可在 `deploy:cf` 之后立即触发冒烟检查，替代目前手工的 `post-deploy-smoke.mjs`

**局限性**：
- CLI 开源，但执行引擎依赖 Checkly 云平台（无法完全 self-hosted）
- 免费额度用完后收费（Team 计划 $30/月起）
- 93 stars 的 CLI 仓库活跃度一般，社区较小

来源：[Checkly 官网](https://www.checklyhq.com/) | [checkly/checkly-cli](https://github.com/checkly/checkly-cli) | [Playwright to Monitoring guide](https://www.checklyhq.com/docs/guides/playwright-testing-to-monitoring/)

---

### 2. Upptime

**一句话**：纯 GitHub Actions 驱动的 uptime 监控，零成本，结果自动提交到仓库并生成状态页。

- **GitHub Stars**：[upptime/upptime](https://github.com/upptime/upptime) — 17,000 stars
- **许可证**：MIT
- **GitHub Actions 集成**：是 GitHub Actions 本身——每 5 分钟一次 cron job，结果写入 Git

**适合本项目的理由**：
- 零成本，完全不依赖外部服务
- 自动生成状态页（GitHub Pages），可对外展示
- 可监控 `/api/health`、Airtable API、Resend API 等所有端点
- 无需额外运维

**局限性**：
- 最小间隔 5 分钟（GitHub Actions cron 限制）
- 仅做 HTTP 状态码检查，不执行 JavaScript，无法验证 Worker 逻辑
- 不适合验证「表单提交后记录是否真正写入 Airtable」这类业务语义检查

来源：[upptime/upptime](https://github.com/upptime/upptime) | [Upptime 官网](https://upptime.js.org/)

---

### 3. UptimeFlare

**一句话**：运行在 Cloudflare Workers 上的无服务器 uptime 监控，与本项目部署环境完全同构，支持 Geo-specific 检查。

- **GitHub Stars**：[lyc8503/UptimeFlare](https://github.com/lyc8503/UptimeFlare) — 3,500 stars
- **许可证**：Apache-2.0
- **GitHub Actions 集成**：通过 GitHub Secrets 管理 Cloudflare API Token，部署流程与本项目一致

**适合本项目的理由**：
- 本项目已部署在 Cloudflare Workers，UptimeFlare 也运行在 Workers 上，环境一致、免费额度共用
- 支持从 310+ 城市的 Cloudflare 边缘节点发起检查，可真实验证 CDN 覆盖
- 2026-01 版本已迁移至 D1 Database，性能问题已修复 [高]
- 50 个监控点 + 1 分钟间隔，比 Upptime 密度高

**局限性**：
- 2026-03-04 之前版本存在 CVE-2026-29779 安全漏洞，需使用最新版本 `[⚠️ 建议查阅官方 Changelog 确认版本]`
- 同样只做 HTTP 层检查，不验证业务语义
- 社区规模比 Upptime 小

来源：[lyc8503/UptimeFlare](https://github.com/lyc8503/UptimeFlare) | [UptimeFlare README](https://github.com/lyc8503/UptimeFlare/blob/main/README.md)

---

## B. 视觉回归测试（跨浏览器）

### 1. Playwright 内置 `toHaveScreenshot()`

**一句话**：零额外依赖，在现有 Playwright 测试里加一行即可覆盖 Chromium + Firefox + WebKit（Safari）三浏览器视觉对比。

- **GitHub Stars**：[microsoft/playwright](https://github.com/microsoft/playwright) — 70,000+ stars
- **许可证**：Apache-2.0
- **GitHub Actions 集成**：原生，就是标准 Playwright 测试

**适合本项目的理由**：
- 本项目已用 Playwright 做 E2E，零迁移成本
- WebKit 引擎覆盖 Safari 渲染，是唯一无需 BrowserStack 的免费方案
- 每个浏览器项目（Chromium/Firefox/WebKit）独立维护 baseline，差异明确
- `toHaveScreenshot({ animations: 'disabled', mask: [...] })` 可屏蔽动画和动态内容，避免假失败

**关键配置注意**：
- Baseline 必须在 CI 环境（Linux）生成，本地 macOS 生成的 baseline 在 CI 上会因字体渲染差异而误报
- 建议用 Playwright 官方 Docker 镜像固定浏览器版本

**局限性**：
- 无交互式比对 UI（只生成 diff 图片），设计师 review 体验不如 BackstopJS
- 多浏览器 baseline PNG 文件会撑大 Git 仓库，50+ 页面后建议用 reg-suit 外置存储
- Playwright 版本升级时浏览器版本变化会使所有 baseline 失效，需重新 `--update-snapshots`

来源：[Playwright 官方文档 best-practices](https://playwright.dev/docs/best-practices) | [Visual Regression Testing Guide 2026](https://bug0.com/knowledge-base/playwright-visual-regression-testing)

---

### 2. BackstopJS

**一句话**：成熟的可视化回归测试工具，交互式 HTML 报告含拖拽 scrubber，配合 Docker 消除跨平台渲染差异。

- **GitHub Stars**：[garris/BackstopJS](https://github.com/garris/BackstopJS) — 7,100 stars
- **许可证**：MIT
- **GitHub Actions 集成**：支持，生成 JUnit XML 报告，CI 可读取退出码

**适合本项目的理由**：
- 内置 Docker 模式，消除 macOS/Linux baseline 不一致问题
- HTML 报告的 scrubber（滑动对比）对非技术用户（如设计方审阅）友好
- 支持 Playwright/Puppeteer 脚本扩展交互场景

**局限性**：
- 默认用 Chromium，Safari/WebKit 支持需通过第三方 fork（`zhumingcheng697/Backstop-Playwright`），维护风险
- 配置文件为 JSON，页面增多后维护成本高
- 比 Playwright 内置方案多一层依赖，调试链更长

来源：[garris/BackstopJS](https://github.com/garris/BackstopJS) | [Open Source Visual Regression Tools 2026](https://bug0.com/knowledge-base/open-source-visual-regression-testing-tools)

---

### 3. reg-suit + reg-actions

**一句话**：专注于 baseline 存储管理的轻量 CLI，把截图存到 S3/GCS，PR 自动评论视觉 diff，可与 Playwright 输出配合使用。

- **GitHub Stars**：[reg-viz/reg-suit](https://github.com/reg-viz/reg-suit) — 社区活跃；[reg-viz/reg-actions](https://github.com/reg-viz/reg-actions) — 94 stars（2026-02-15 最新更新）
- **许可证**：MIT
- **GitHub Actions 集成**：`reg-viz/reg-actions` 专为 GitHub Actions 设计，自动评论 PR

**适合本项目的理由**：
- 解决 Playwright 内置方案的最大痛点：baseline PNG 不进 Git，存 S3/GCS，仓库保持轻量
- 与 Playwright 解耦——先用 Playwright 截图，再用 reg-suit 比对，工具职责清晰
- 适合页面数量增长后的长期扩展路径

**局限性**：
- 需要配置 S3/GCS Bucket，增加运维复杂度（单人项目成本）
- reg-actions 仅 94 stars，社区小，长期维护不确定
- 不做浏览器引擎切换，跨浏览器仍需 Playwright 配置

来源：[reg-viz/reg-suit](https://github.com/reg-viz/reg-suit) | [reg-viz/reg-actions](https://github.com/reg-viz/reg-actions)

---

## C. 第三方服务健康 / 上行链路检查

### 1. Upptime（同 A.2，侧重外部服务监控）

见 A.2 完整描述。用于监控的端点建议：

```yaml
# .github/upptime/config.yml 示例
sites:
  - name: Airtable API
    url: https://api.airtable.com/v0/meta/whoami
    headers:
      Authorization: ${{ secrets.AIRTABLE_PAT }}
  - name: Resend API
    url: https://api.resend.com/emails
    expectedStatusCodes: [405]  # GET 返回 405 即为服务可达
  - name: Turnstile Siteverify
    url: https://challenges.cloudflare.com/turnstile/v0/siteverify
    expectedStatusCodes: [405]
  - name: 天泽官网
    url: https://your-domain.com/api/health
```

---

### 2. OpenStatus

**一句话**：开源状态页 + API 监控平台，可从全球 28 个区域发起检查，支持 self-hosted 或 managed SaaS。

- **GitHub Stars**：[openstatusHQ/openstatus](https://github.com/openstatusHQ/openstatus) — 8,500 stars
- **许可证**：AGPL-3.0
- **GitHub Actions 集成**：支持 API 触发，可在 deploy 后主动推送检查

**适合本项目的理由**：
- 比 Upptime 更丰富的状态页功能（自定义域名、维护窗口、订阅通知）
- 支持 API 监控 as code，配置文件可纳入 Git
- 可面向客户/利益相关方公开状态页，建立信任

**局限性**：
- Self-hosted 需要 Docker 环境，比 Upptime 运维成本更高
- AGPL-3.0 许可证：如果将 OpenStatus 嵌入到商业产品的服务端并对外提供，需遵守 copyleft 条款 `[⚠️ 确认使用场景是否触发 AGPL 条款]`
- Managed SaaS 免费额度有限，超出后需付费

来源：[openstatusHQ/openstatus](https://github.com/openstatusHQ/openstatus)

---

### 3. 自定义 GitHub Actions 健康检查脚本（轻量方案）

**一句话**：用现有的 `post-deploy-smoke.mjs` 扩展一个 scheduled workflow，定时调用第三方 API 的健康探针端点，成本为零。

**实现思路**：

```yaml
# .github/workflows/uplink-health.yml
on:
  schedule:
    - cron: '*/15 * * * *'  # 每 15 分钟
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Airtable
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            -H "Authorization: Bearer ${{ secrets.AIRTABLE_PAT }}" \
            https://api.airtable.com/v0/meta/whoami)
          if [ "$STATUS" != "200" ]; then exit 1; fi

      - name: Check Resend
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            -H "Authorization: Bearer ${{ secrets.RESEND_API_KEY }}" \
            https://api.resend.com/domains)
          if [ "$STATUS" != "200" ]; then exit 1; fi

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: '{"text":"上行链路异常：${{ github.workflow }} 失败"}'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

**适合本项目的理由**：
- 零工具依赖，利用已有的 GitHub Actions 基础设施
- 与 `post-deploy-smoke.mjs` 风格一致，维护成本最低
- 完全 self-hosted，无 vendor lock-in

**局限性**：
- GitHub Actions cron 最小间隔 5 分钟，且在高负载时有延迟
- 没有历史趋势图和状态页，仅有告警功能

---

## D. SEO / 结构化数据验证

### 1. structured-data-testing-tool

**一句话**：命令行工具，可在 CI 中验证页面的 JSON-LD、Open Graph、Twitter Card 等结构化数据是否符合预设规则。

- **GitHub Stars**：[iaincollins/structured-data-testing-tool](https://github.com/iaincollins/structured-data-testing-tool) — 71 stars
- **许可证**：ISC
- **GitHub Actions 集成**：支持，通过 CLI 退出码驱动

**使用示例**：

```bash
# CI 中验证关键页面
npx structured-data-testing-tool \
  --url https://your-domain.com/en \
  --preset GoogleAMP,Twitter,Facebook \
  --fail-on-warnings
```

**适合本项目的理由**：
- 精准匹配需求：验证 Next.js 生成的 JSON-LD 和 OG 标签是否正确
- 有内置 Google/Twitter/Facebook 预设，无需手写规则
- 支持 Puppeteer 模式，可验证 CSR 注入的结构化数据
- Node.js 工具，与项目技术栈一致

**局限性**：
- Stars 少（71），维护频率低，最后一次正式 release 为 v4.4.1
- 不验证 Google 是否实际能抓取/索引，只验证标签格式
- 不检测 sitemap 完整性或 robots.txt 正确性

来源：[iaincollins/structured-data-testing-tool](https://github.com/iaincollins/structured-data-testing-tool)

---

### 2. SEOnaut

**一句话**：开源 SEO 爬虫审计工具，可检测断链、缺失/重复 meta 标签、heading 层级错误等，生成分级报告。

- **GitHub Stars**：[StJudeWasHere/seonaut](https://github.com/StJudeWasHere/seonaut) — 活跃开源项目
- **许可证**：AGPL-3.0
- **GitHub Actions 集成**：部分支持（需自行搭建服务后调 API）

**适合本项目的理由**：
- 覆盖「部署后 SEO 健康」的全面检查，比 `structured-data-testing-tool` 更宽泛
- 可检测 sitemap 中的 URL 是否都能正常响应（与本项目 sitemap.ts 的正确性直接挂钩）
- Go 语言编写，二进制部署无依赖

**局限性**：
- Self-hosted 服务，有运维成本
- AGPL-3.0 同 OpenStatus，需注意许可证条款
- 不适合「每次部署后立即验证」的高频场景，更适合周期性审计

来源：[StJudeWasHere/seonaut](https://github.com/StJudeWasHere/seonaut)

---

### 3. Playwright 内联 SEO 断言（最轻量方案）

**一句话**：在现有 E2E 测试中直接加 SEO 断言，无额外工具，验证关键 meta 标签和 JSON-LD 是否存在且格式正确。

**实现示例**：

```typescript
// tests/seo.spec.ts
import { test, expect } from '@playwright/test';

test('homepage SEO - en', async ({ page }) => {
  await page.goto('/en');

  // Title
  await expect(page).toHaveTitle(/天泽管业|Tianze/);

  // Canonical
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute('href', /your-domain\.com\/en/);

  // JSON-LD structured data
  const jsonLd = await page.evaluate(() => {
    const el = document.querySelector('script[type="application/ld+json"]');
    return el ? JSON.parse(el.textContent ?? '{}') : null;
  });
  expect(jsonLd?.['@type']).toBe('Organization');
  expect(jsonLd?.name).toBeTruthy();

  // OG tags
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https/);
});
```

**适合本项目的理由**：
- 零新依赖，完全复用已有 Playwright 设施
- 可加入现有 CI 流水线，部署后立即验证
- 覆盖「已知关键 SEO 标签」的精准验证，误报率低

**局限性**：
- 需要手工维护断言规则，不是「爬全站」式审计
- 无法验证 Google 实际抓取行为

---

## E. 端到端表单链路测试（真实 API）

### 核心策略：Playwright + 专用 Canary 账号

**为什么不用 mock**：CI 的 mock 测试验证逻辑正确，但无法发现以下问题：
- Airtable PAT 过期或权限变更
- Resend API Key 被限流或域名验证失效
- Turnstile Site Key 与 Secret Key 环境不匹配
- Cloudflare Worker 环境变量未正确配置

**推荐架构**：

```
部署完成
    ↓
GitHub Actions post-deploy job
    ↓
Playwright smoke test (--project=PostDeploy)
    ↓
提交表单（真实请求，携带 Turnstile bypass token）
    ↓
等待 3s
    ↓
Airtable API 查询：新记录是否出现？
    ↓
Resend API 查询：邮件发送日志是否有对应条目？
    ↓
清理：删除测试记录（避免污染生产数据）
```

### 1. Playwright `APIRequestContext`（核心组件）

**一句话**：Playwright 内置的 API 测试能力，可在同一测试中混合浏览器操作和直接 API 调用，无需额外工具。

- **使用方式**：`playwright.config.ts` 中配置独立 `PostDeploy` project，`testMatch: '**/smoke/**'`

**实现骨架**：

```typescript
// tests/smoke/form-e2e.spec.ts
import { test, expect } from '@playwright/test';

const CANARY_EMAIL = 'smoke-test+' + Date.now() + '@your-domain.com';

test('inquiry form submits to Airtable + triggers email', async ({ page, request }) => {
  // 1. 提交表单（真实 Turnstile bypass）
  await page.goto('/en/contact');
  await page.fill('[name="name"]', 'Smoke Test');
  await page.fill('[name="email"]', CANARY_EMAIL);
  await page.fill('[name="message"]', 'Automated smoke test - please ignore');
  await page.click('[type="submit"]');
  await expect(page.locator('.success-message')).toBeVisible({ timeout: 10000 });

  // 2. 验证 Airtable 记录
  await page.waitForTimeout(3000); // 等待异步写入
  const records = await request.get(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Inquiries?filterByFormula={Email}="${CANARY_EMAIL}"`,
    { headers: { Authorization: `Bearer ${process.env.AIRTABLE_PAT}` } }
  );
  const body = await records.json();
  expect(body.records).toHaveLength(1);

  // 3. 清理（可选，避免污染看板）
  const recordId = body.records[0].id;
  await request.delete(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Inquiries/${recordId}`,
    { headers: { Authorization: `Bearer ${process.env.AIRTABLE_PAT}` } }
  );
});
```

**适合本项目的理由**：
- 直接解决「CI mock 无法覆盖真实链路」的核心问题
- Playwright `APIRequestContext` 共享 Cookie/Header 状态，一个测试可混用浏览器 + API
- 与现有 `post-deploy-smoke.mjs` 协同，将节点级检查升级为业务语义检查

**局限性**：
- Turnstile 在自动化环境中需要特殊处理（设置 test site key，或在测试环境禁用 Turnstile 验证）`[⚠️ 建议实测验证 Turnstile bypass 在 Cloudflare 生产环境的行为]`
- 需要在 CI Secrets 中存放生产级 API 密钥（Airtable PAT、Resend API Key），安全配置需审慎
- 记录清理逻辑如果失败会残留测试数据，需要设计幂等的清理机制

来源：[Playwright E2E Testing Guide 2026](https://testdino.com/blog/playwright-e2e-testing/) | [Post-deploy Smoke Patterns 2026](https://betterstack.com/community/guides/testing/playwright/playwright-e2e-automation/)

---

### 2. webhook-tester（上行链路调试辅助）

**一句话**：自托管的 webhook 接收器，可在开发阶段捕获 Airtable/Resend 回调的原始 payload，辅助调试链路。

- **GitHub Stars**：[tarampampam/webhook-tester](https://github.com/tarampampam/webhook-tester) — 活跃开源项目
- **许可证**：MIT
- **GitHub Actions 集成**：可作为测试服务启动

**适合本项目的理由**：
- 生产链路调试时，需要观察 Airtable webhook 回调的原始结构
- Docker 一键启动，用完即弃

**局限性**：
- 不是常态监控工具，只用于调试阶段
- 不在关键路径上

来源：[tarampampam/webhook-tester](https://github.com/tarampampam/webhook-tester)

---

## 综合推荐路径

### 单人项目的实施优先级

```
阶段 1（立即可做，零新工具）：
├─ E 类：在现有 Playwright 中加 PostDeploy project，用 APIRequestContext 验证表单链路
├─ D 类：在现有 Playwright E2E 中加 SEO 断言（title、canonical、JSON-LD、OG）
└─ C 类：用自定义 GitHub Actions cron 做第三方 API 健康检查

阶段 2（低运维成本，可选）：
├─ A 类：部署 UptimeFlare（同环境 Cloudflare Workers，5 分钟配置）
├─ B 类：为 Playwright 加 WebKit project，启用 toHaveScreenshot()，仅选关键页面
└─ D 类：加入 structured-data-testing-tool 做 CI 后结构化数据验证

阶段 3（规模增长后考虑）：
├─ A 类：评估 Checkly（付费，但可复用全部 Playwright 测试）
└─ B 类：评估 reg-suit 外置 baseline 存储（页面 > 20 个时）
```

### 工具选型矩阵

| 类别 | 推荐工具 | 成本 | 运维复杂度 | 与现有栈整合 |
|------|---------|------|-----------|-------------|
| 合成监控 | UptimeFlare | 免费 | 低 | 同 Cloudflare 环境 |
| 合成监控（升级） | Checkly | $0~$30/月 | 低 | 复用 Playwright |
| 视觉回归 | Playwright 内置 | 免费 | 低 | 零依赖 |
| 上行链路 | Upptime + cron | 免费 | 极低 | GitHub Actions |
| SEO 验证 | Playwright 内联断言 | 免费 | 极低 | 零依赖 |
| 表单链路 | Playwright APIRequestContext | 免费 | 低 | 零依赖 |

---

## 信息缺口与局限

**未能确认**：
- Cloudflare Turnstile 在 Playwright E2E 生产环境下的官方 bypass 机制（测试模式 site key 是否适用于 Workers 生产部署）`[⚠️ 建议实测验证]`
- structured-data-testing-tool 是否与 Next.js 16 的 RSC 渲染输出兼容（该工具最近更新较早）`[⚠️ 单一来源，需实测]`

**调研局限**：
- Checkly 平台的具体 Cloudflare Workers 兼容性未经实测验证，信息来自官方文档
- UptimeFlare CVE-2026-29779 的修复状态已确认，但建议在部署前再次核查最新版本号
- GitHub Actions cron 在仓库无活动时可能被 GitHub 自动暂停（超过 60 天无推送），Upptime 依赖此机制需注意

**建议后续调研**：
- 如果表单链路测试中 Turnstile bypass 有阻碍，可调研 Cloudflare 官方文档的 `turnstile test keys` 机制
- 如视觉回归扩展到 20+ 页面，可专项调研 reg-suit + Cloudflare R2 方案（替代 S3，成本更低）

---

## 来源

### Tier 1（高可信度）

- [Playwright 官方文档 - Best Practices](https://playwright.dev/docs/best-practices)
- [Checkly 官方文档 - Playwright to Monitoring](https://www.checklyhq.com/docs/guides/playwright-testing-to-monitoring/)
- [Cloudflare Browser Rendering - Playwright](https://developers.cloudflare.com/browser-rendering/playwright/)
- [UptimeFlare README](https://github.com/lyc8503/UptimeFlare/blob/main/README.md)
- [Upptime 官网](https://upptime.js.org/)

### Tier 2（中高可信度）

- [structured-data-testing-tool GitHub](https://github.com/iaincollins/structured-data-testing-tool)
- [garris/BackstopJS GitHub](https://github.com/garris/BackstopJS)
- [checkly/checkly-cli GitHub](https://github.com/checkly/checkly-cli)
- [openstatusHQ/openstatus GitHub](https://github.com/openstatusHQ/openstatus)
- [lyc8503/UptimeFlare GitHub](https://github.com/lyc8503/UptimeFlare)
- [upptime/upptime GitHub](https://github.com/upptime/upptime)
- [reg-viz/reg-suit GitHub](https://github.com/reg-viz/reg-suit)
- [reg-viz/reg-actions GitHub](https://github.com/reg-viz/reg-actions)

### Tier 3（参考）

- [Open Source Visual Regression Tools 2026 - Bug0](https://bug0.com/knowledge-base/open-source-visual-regression-testing-tools)
- [Playwright Visual Regression Testing Guide 2026 - Bug0](https://bug0.com/knowledge-base/playwright-visual-regression-testing)
- [Best Open Source Monitoring Tools 2026 - OneUptime](https://oneuptime.com/blog/post/2026-02-06-best-open-source-monitoring-tools-2026/view)
- [Synthetic Monitoring with Playwright - OneUptime](https://oneuptime.com/blog/post/2026-02-06-synthetic-monitoring-tracetest-playwright/view)
- [Playwright E2E Testing Guide 2026 - TestDino](https://testdino.com/blog/playwright-e2e-testing/)
- [Post-Deploy Smoke Patterns - Better Stack](https://betterstack.com/community/guides/testing/playwright/playwright-e2e-automation/)
- [Checkly Review 2026 - European Purpose](https://europeanpurpose.com/tool/checkly)
- [tarampampam/webhook-tester GitHub](https://github.com/tarampampam/webhook-tester)

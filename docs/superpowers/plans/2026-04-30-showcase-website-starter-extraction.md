# Showcase Website Starter Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从当前 Tianze 生产项目切割出一个独立的 `showcase-website-starter`，作为展示型网站后续开发基础，保留网站工程能力、AI 工作流和组件治理，移除 Tianze 业务身份、本地运行状态和历史噪音。

**Architecture:** 当前仓库继续作为 Tianze 生产站，不在这里做大规模去品牌；新项目创建在 `/Users/Data/workspace/showcase-website-starter`，作为独立 Git 仓库和新网站 starter。新项目内部统一使用 `website` 作为目录、命令和文档语义，例如 `docs/website/`、`src/config/website/`、`website:*`，不使用 `template` 作为目录或命令前缀。

**Tech Stack:** Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS 4 + next-intl + MDX + Radix/shadcn-style UI + Storybook + Vitest + Playwright + Cloudflare/OpenNext + Claude/Codex workflow docs + centralized MCPHub.

---

## 当前已确认的命名合同

- 新项目目录：`/Users/Data/workspace/showcase-website-starter`
- 新项目 package name：`showcase-website-starter`
- 文档目录：`docs/website/`
- 网站级配置目录：`src/config/website/`
- 命令前缀：`website:*`、`brand:*`、`content:*`、`component:*`、`release:*`
- 禁用命名：不要新增 `docs/template/`，不要新增 `template:*` 命令，文档正文不要把项目称为 `template website`
- 页面内容策略：保留页面结构和可运行示例内容，不做空项目；将 Tianze/PVC 专属内容替换为中性展示型网站示例内容
- Storybook MCP 策略：不在项目 `.mcp.json` 直连 Storybook；统一放到 `/Users/Data/Tool/mcphub` live config 作为集中再分发项
- 配置真相策略：`src/config/website/` 不是旁路文档样例，必须驱动现有 `single-site*` / `siteFacts` 兼容层；如果运行时仍直接读 Tianze 的 `single-site*` 真相源，本计划不能算完成

## 当前 Tianze 仓库收尾状态

- 当前工作分支：`docs/showcase-website-starter-plan`
- Base commit：`ea0cae8f`
- 除本计划文档外，当前仓库只应保留一个入库改动：`.gitignore` 新增 `.context/`
- 已从当前项目移走 project-local `oh-my-codex` 状态：`.codex/`、`.omx/`
- 已从当前项目 `.mcp.json` 移除直连 `storybook`，只保留 `dev`
- 已在 MCPHub live config 加入 `storybook`，默认 `enabled: false`
- `CLAUDE.local.md` 已恢复，作为本地私有偏好保留；它不进入新项目 Git

## 文件结构

### 当前仓库需要修改或确认的文件

- Modify: `/Users/Data/Warehouse/Pipe/tianze-website/.gitignore`
  - 只保留 `.context/` ignore 规则。
- Do not modify: `/Users/Data/Warehouse/Pipe/tianze-website/src/**`
  - 当前 Tianze 生产站不在本计划中去品牌。
- Do not modify: `/Users/Data/Warehouse/Pipe/tianze-website/docs/**`，除了本计划文件
  - Tianze docs 是当前项目历史和生产真相，不在当前仓库批量清理。

### 新项目需要创建或重写的核心文件

- Create repository root: `/Users/Data/workspace/showcase-website-starter`
- Create: `/Users/Data/workspace/showcase-website-starter/docs/website/README.md`
- Create: `/Users/Data/workspace/showcase-website-starter/docs/website/新项目替换清单.md`
- Create: `/Users/Data/workspace/showcase-website-starter/docs/website/品牌设置.md`
- Create: `/Users/Data/workspace/showcase-website-starter/docs/website/内容设置.md`
- Create: `/Users/Data/workspace/showcase-website-starter/docs/website/部署设置.md`
- Create: `/Users/Data/workspace/showcase-website-starter/docs/website/AI工作流.md`
- Create: `/Users/Data/workspace/showcase-website-starter/src/config/website/profile.ts`
- Create: `/Users/Data/workspace/showcase-website-starter/src/config/website/seo.ts`
- Create: `/Users/Data/workspace/showcase-website-starter/src/config/website/navigation.ts`
- Create: `/Users/Data/workspace/showcase-website-starter/src/config/website/homepage.ts`
- Create: `/Users/Data/workspace/showcase-website-starter/src/config/website/products.ts`
- Create: `/Users/Data/workspace/showcase-website-starter/src/config/website/contact.ts`
- Create: `/Users/Data/workspace/showcase-website-starter/.mcp.example.json`
- Create: `/Users/Data/workspace/showcase-website-starter/.codex/README.md`
- Create: `/Users/Data/workspace/showcase-website-starter/.codex/config.example.toml`

### 新项目严禁带入的文件或目录

- Do not create: `/Users/Data/workspace/showcase-website-starter/.codex/auth.json`
- Do not create: `/Users/Data/workspace/showcase-website-starter/.codex/history.jsonl`
- Do not create: `/Users/Data/workspace/showcase-website-starter/.codex/log/`
- Do not create: `/Users/Data/workspace/showcase-website-starter/.codex/*.sqlite*`
- Do not create: `/Users/Data/workspace/showcase-website-starter/.codex/shell_snapshots/`
- Do not create: `/Users/Data/workspace/showcase-website-starter/.omx/`
- Do not create: `/Users/Data/workspace/showcase-website-starter/.context/`
- Do not create: `/Users/Data/workspace/showcase-website-starter/CLAUDE.local.md`
- Do not create: `/Users/Data/workspace/showcase-website-starter/.firecrawl/`
- Do not create: `/Users/Data/workspace/showcase-website-starter/.claude/agents/`
- Do not create: `/Users/Data/workspace/showcase-website-starter/.claude/skills/`
- Do not create: `/Users/Data/workspace/showcase-website-starter/.claude/worktrees/`
- Do not create: `/Users/Data/workspace/showcase-website-starter/reports/`
- Do not create: `/Users/Data/workspace/showcase-website-starter/.next/`
- Do not create: `/Users/Data/workspace/showcase-website-starter/.open-next/`
- Do not create: `/Users/Data/workspace/showcase-website-starter/.wrangler/`
- Do not create: `/Users/Data/workspace/showcase-website-starter/storybook-static/`
- Do not create: `/Users/Data/workspace/showcase-website-starter/node_modules/`
- Do not create: any `/Users/Data/workspace/showcase-website-starter/.env*` file
- Do not create: `/Users/Data/workspace/showcase-website-starter/.dev.vars`
- Do not create: `/Users/Data/workspace/showcase-website-starter/.claude/settings.local.json`

---

## Task 0: Commit Current Repo Cleanup Baseline

**Files:**
- Modify: `/Users/Data/Warehouse/Pipe/tianze-website/.gitignore`

- [ ] **Step 1: Verify current branch and diff**

Run:

```bash
cd /Users/Data/Warehouse/Pipe/tianze-website
git status --short --branch
git diff -- .gitignore
```

Expected invariant:

- The current branch is `docs/showcase-website-starter-plan`.
- If `.gitignore` is not committed yet, `git diff -- .gitignore` contains only `+ .context/`.
- If `.gitignore` is already committed, compare against `origin/main`:

```bash
git diff origin/main...HEAD -- .gitignore
```

Expected diff contains only:

```diff
+ .context/
```

- [ ] **Step 2: Stage cleanup baseline**

Run:

```bash
cd /Users/Data/Warehouse/Pipe/tianze-website
git add .gitignore
git diff --cached -- .gitignore
```

Expected: staged diff contains only `.context/`.

- [ ] **Step 3: Commit cleanup baseline**

Run:

```bash
cd /Users/Data/Warehouse/Pipe/tianze-website
git commit -m "chore: ignore local context runtime state"
```

Expected: commit succeeds.

If this plan file is already committed, `git status` may be clean. That is acceptable. The invariant is: outside this plan document, the current Tianze repository change is only `.gitignore` adding `.context/`.

---

## Task 1: Create the New Website Starter Repository Skeleton

**Files:**
- Create directory: `/Users/Data/workspace/showcase-website-starter`
- Copy from: `/Users/Data/Warehouse/Pipe/tianze-website`

- [ ] **Step 1: Confirm target path does not already contain a project**

Run:

```bash
if [ -e /Users/Data/workspace/showcase-website-starter ]; then
  echo "target path already exists: /Users/Data/workspace/showcase-website-starter"
  exit 1
fi
echo "target path is available"
```

Expected:

```text
target path is available
```

If the path exists, stop and inspect it before overwriting. Do not permanently delete it.

- [ ] **Step 2: Copy source tree without ignored runtime artifacts**

Run:

```bash
mkdir -p /Users/Data/workspace
rsync -a \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.open-next/' \
  --exclude='.wrangler/' \
  --exclude='storybook-static/' \
  --exclude='.stryker-tmp/' \
  --exclude='.trash-next-artifacts/' \
  --exclude='.omx/' \
  --exclude='.context/' \
  --exclude='CLAUDE.local.md' \
  --exclude='.firecrawl/' \
  --exclude='.claude/agents/' \
  --exclude='.claude/skills/' \
  --exclude='.claude/worktrees/' \
  --exclude='reports/' \
  --exclude='test-results/' \
  --exclude='.eslintcache' \
  --exclude='.eslintcache-audit' \
  --exclude='*.tsbuildinfo' \
  --exclude='.DS_Store' \
  --exclude='.env*' \
  --exclude='.dev.vars' \
  --exclude='.mcp.json' \
  --exclude='.codex/auth.json' \
  --exclude='.codex/history.jsonl' \
  --exclude='.codex/log/' \
  --exclude='.codex/*.sqlite*' \
  --exclude='.codex/shell_snapshots/' \
  --exclude='.claude/settings.local.json' \
  /Users/Data/Warehouse/Pipe/tianze-website/ \
  /Users/Data/workspace/showcase-website-starter/
```

Expected: command exits 0.

- [ ] **Step 3: Verify local/private artifacts were not copied**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
for p in \
  CLAUDE.local.md \
  .firecrawl \
  .claude/agents \
  .claude/skills \
  .claude/worktrees \
  .dev.vars \
  .mcp.json \
  .omx \
  .context \
  reports \
  node_modules
do
  if [ -e "$p" ]; then
    echo "unexpected copied artifact: $p"
    exit 1
  fi
done
if find . -path ./.git -prune -o -name ".env*" -print -quit | grep -q .; then
  echo "unexpected copied env artifact"
  find . -path ./.git -prune -o -name ".env*" -print
  exit 1
fi
echo "copy artifact guard passed"
```

Expected:

```text
copy artifact guard passed
```

- [ ] **Step 4: Initialize new Git repository**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
git init
git add . ':!.env*' ':!.dev.vars' ':!.mcp.json' ':!CLAUDE.local.md' ':!.firecrawl' ':!.claude/agents' ':!.claude/skills' ':!.claude/worktrees' ':!.omx' ':!.context' ':!reports' ':!node_modules'
git status --short | sed -n '1,80p'
```

Expected: files are staged as a new repository. No `.env*`, `.dev.vars`, `.mcp.json`, `CLAUDE.local.md`, `.firecrawl`, `.claude/agents`, `.claude/skills`, `.claude/worktrees`, `.omx`, `.context`, `reports`, or `node_modules` appear.

- [ ] **Step 5: Commit initial imported skeleton**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
git commit -m "chore: import showcase website starter baseline"
```

Expected: initial commit succeeds.

---

## Task 2: Rename Project Identity and Command Surface

**Files:**
- Modify: `/Users/Data/workspace/showcase-website-starter/package.json`
- Modify: `/Users/Data/workspace/showcase-website-starter/README.md`
- Modify: `/Users/Data/workspace/showcase-website-starter/AGENTS.md`
- Modify: `/Users/Data/workspace/showcase-website-starter/CLAUDE.md`

- [ ] **Step 1: Update package name**

Edit `/Users/Data/workspace/showcase-website-starter/package.json`:

```json
{
  "name": "showcase-website-starter"
}
```

Keep the existing scripts at this step. Do not rename scripts until Step 3.

- [ ] **Step 2: Replace top-level project description**

Edit `/Users/Data/workspace/showcase-website-starter/README.md` top section to:

```markdown
# Showcase Website Starter

展示型网站起步项目，适合企业展示、产品展示、服务展示、询盘转化、多语言内容、组件治理和 Cloudflare 部署。

这个项目不是某个具体公司网站，也不是一次性模板。它是一套可复制的网站基础盘：新项目从这里开始，替换品牌、内容、产品/服务信息和部署配置后继续开发。
```

- [ ] **Step 3: Add website-oriented command aliases**

Modify `/Users/Data/workspace/showcase-website-starter/package.json` scripts. Keep existing low-level commands, add these aliases:

```json
{
  "scripts": {
    "website:check": "pnpm type-check && pnpm lint:check && pnpm test && pnpm build",
    "website:build": "pnpm build",
    "website:build:cf": "pnpm build:cf",
    "website:verify": "pnpm release:verify",
    "brand:check": "node scripts/brand-check.mjs",
    "content:check": "pnpm content:slug-check && pnpm validate:translations",
    "component:check": "pnpm storybook:build",
    "release:verify": "bash scripts/release-proof.sh"
  }
}
```

If `scripts/brand-check.mjs` does not exist yet, it will be created in Task 8. The alias may be temporarily red until Task 8 is complete.

- [ ] **Step 4: Rewrite AGENTS.md project identity**

Replace the `## Project` section in `/Users/Data/workspace/showcase-website-starter/AGENTS.md` with:

```markdown
## Project

**Showcase Website Starter** - reusable website starter for company, product, or service presentation.

**Goal**: Provide a high-quality starting point for showcase websites: clear page structure, multilingual content, inquiry conversion, component governance, security basics, and Cloudflare deployment.

This is a starter project, not a finished client website. Keep examples generic and replaceable.
```

- [ ] **Step 5: Rewrite CLAUDE.md project identity**

Make the same `## Project` replacement in `/Users/Data/workspace/showcase-website-starter/CLAUDE.md`.

- [ ] **Step 6: Commit identity rename**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
git add package.json README.md AGENTS.md CLAUDE.md
git commit -m "chore: rename project as showcase website starter"
```

Expected: commit succeeds.

---

## Task 3: Create Chinese Website Docs

**Files:**
- Create: `/Users/Data/workspace/showcase-website-starter/docs/website/README.md`
- Create: `/Users/Data/workspace/showcase-website-starter/docs/website/新项目替换清单.md`
- Create: `/Users/Data/workspace/showcase-website-starter/docs/website/品牌设置.md`
- Create: `/Users/Data/workspace/showcase-website-starter/docs/website/内容设置.md`
- Create: `/Users/Data/workspace/showcase-website-starter/docs/website/部署设置.md`
- Create: `/Users/Data/workspace/showcase-website-starter/docs/website/AI工作流.md`

- [ ] **Step 1: Create docs directory**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
mkdir -p docs/website
```

Expected: `docs/website/` exists.

- [ ] **Step 2: Write website docs README**

Create `/Users/Data/workspace/showcase-website-starter/docs/website/README.md`:

```markdown
# 网站起步项目说明

这个目录说明如何把本项目变成一个新的展示型网站。

本项目保留完整网站结构，不提供空白壳子。新项目应从这里开始替换品牌、页面内容、产品或服务信息、图片资产、表单接收方式和部署配置。

## 必读顺序

1. `新项目替换清单.md`
2. `品牌设置.md`
3. `内容设置.md`
4. `部署设置.md`
5. `AI工作流.md`

## 命名规则

- 项目名：`showcase-website-starter`
- 文档目录：`docs/website/`
- 网站配置：`src/config/website/`
- 命令前缀：`website:*`、`brand:*`、`content:*`、`component:*`、`release:*`

不要新增 `docs/template/` 或 `template:*` 命令。
```

- [ ] **Step 3: Write replacement checklist**

Create `/Users/Data/workspace/showcase-website-starter/docs/website/新项目替换清单.md`:

```markdown
# 新项目替换清单

按顺序替换，不要跳步。

## 1. 品牌身份

修改 `src/config/website/profile.ts`：

- 公司名
- 网站名
- 域名
- 联系邮箱
- 联系电话
- 地址
- 社交链接
- 默认品牌色

## 2. 产品或服务信息

修改 `src/config/website/products.ts`：

- 产品或服务分类
- 核心卖点
- 应用场景
- 规格表字段
- 示例图片

## 3. 页面组合

修改 `src/config/website/homepage.ts`：

- 首页 section 顺序
- CTA 目标
- 是否展示 FAQ
- 是否展示数据指标
- 是否展示产品/服务卡片

## 4. 页面正文

修改 `content/pages/{locale}/*.mdx`：

- About
- Contact
- Service/Product detail
- Privacy
- Terms

## 5. 翻译和 UI 文案

修改 `messages/{locale}/critical.json` 和 `messages/{locale}/deferred.json`。

## 6. 图片资产

替换 `public/images/**` 中的示例图片。

## 7. 部署配置

修改 Cloudflare、域名、邮件、Turnstile、Resend 或其他实际部署配置。

## 8. 验证

运行：

```bash
pnpm brand:check
pnpm content:check
pnpm component:check
pnpm website:check
pnpm website:build:cf
```
```

- [ ] **Step 4: Write brand setup doc**

Create `/Users/Data/workspace/showcase-website-starter/docs/website/品牌设置.md`:

```markdown
# 品牌设置

品牌信息集中在 `src/config/website/`，不要把公司名、域名、邮箱散落到组件里。

## 必填项

- `profile.ts`：公司身份、联系方式、社交链接
- `seo.ts`：默认标题、描述、OG 信息
- `navigation.ts`：导航结构
- `contact.ts`：询盘表单接收方式和联系信息

## 原则

页面组件只读取配置和翻译，不直接写死品牌事实。

如果新项目需要改品牌，优先改 `src/config/website/`，其次改 `content/pages/**`，最后才改组件。
```

- [ ] **Step 5: Write content setup doc**

Create `/Users/Data/workspace/showcase-website-starter/docs/website/内容设置.md`:

```markdown
# 内容设置

本项目保留示例页面内容，因为空白项目不利于 AI 和人工判断页面质量。

## 页面内容策略

- 保留页面结构
- 保留可运行示例
- 替换具体公司、产品、服务、证据和图片
- 不保留任何真实客户或旧项目商业身份

## 内容来源

- 页面正文：`content/pages/{locale}/*.mdx`
- UI 文案：`messages/{locale}/critical.json` 和 `messages/{locale}/deferred.json`
- 产品或服务结构：`src/config/website/products.ts`
- 首页组合：`src/config/website/homepage.ts`

## 不要做

- 不要删除到空页面
- 不要在组件里直接写业务文案
- 不要让示例内容看起来像真实客户承诺
```

- [ ] **Step 6: Write deployment setup doc**

Create `/Users/Data/workspace/showcase-website-starter/docs/website/部署设置.md`:

```markdown
# 部署设置

本项目默认保留 Cloudflare/OpenNext 部署链路，但不保留任何旧项目域名、worker 名、zone 信息或 secret。

## 必须替换

- Cloudflare account / worker / route
- 正式域名
- Turnstile site key 和 secret
- 邮件服务配置
- 表单接收配置

## 本地文件

这些文件只在本地创建，不入库：

- `.env.local`
- `.dev.vars`
- `.mcp.json`

## 验证命令

```bash
pnpm build
pnpm build:cf
pnpm release:verify
```
```

- [ ] **Step 7: Write AI workflow doc**

Create `/Users/Data/workspace/showcase-website-starter/docs/website/AI工作流.md`:

```markdown
# AI 工作流

本项目支持 Codex 和 Claude 协作，但共享真相必须写入文件，不依赖聊天记忆。

## 入口文件

- Codex：`AGENTS.md`
- Claude：`CLAUDE.md`

两个入口文件都应该指向本目录下的网站说明文档，不要写成两份互相冲突的百科。

## MCP

项目内不直连 Storybook MCP。Storybook MCP 统一通过本机 MCPHub 管理。

项目可保留 `.mcp.example.json`，真实 `.mcp.json` 不入库。

## 不入库

- `.codex/auth.json`
- `.codex/history.jsonl`
- `.codex/log/`
- `.codex/*.sqlite*`
- `.omx/`
- `.context/`
- `.claude/settings.local.json`
```

- [ ] **Step 8: Commit website docs**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
git add docs/website
git commit -m "docs: add Chinese website starter guide"
```

Expected: commit succeeds.

---

## Task 4: Create `src/config/website/` as the Replacement Surface

**Files:**
- Create: `/Users/Data/workspace/showcase-website-starter/src/config/website/profile.ts`
- Create: `/Users/Data/workspace/showcase-website-starter/src/config/website/seo.ts`
- Create: `/Users/Data/workspace/showcase-website-starter/src/config/website/navigation.ts`
- Create: `/Users/Data/workspace/showcase-website-starter/src/config/website/homepage.ts`
- Create: `/Users/Data/workspace/showcase-website-starter/src/config/website/products.ts`
- Create: `/Users/Data/workspace/showcase-website-starter/src/config/website/contact.ts`
- Create: `/Users/Data/workspace/showcase-website-starter/src/config/website/index.ts`
- Modify: `/Users/Data/workspace/showcase-website-starter/src/config/single-site.ts`
- Modify: `/Users/Data/workspace/showcase-website-starter/src/config/site-facts.ts`
- Modify as needed: `/Users/Data/workspace/showcase-website-starter/src/config/single-site-navigation.ts`
- Modify as needed: `/Users/Data/workspace/showcase-website-starter/src/config/single-site-seo.ts`
- Modify as needed: `/Users/Data/workspace/showcase-website-starter/src/config/single-site-page-expression.ts`
- Modify as needed: `/Users/Data/workspace/showcase-website-starter/src/config/single-site-product-catalog.ts`

**Non-negotiable:** this task is not complete if `src/config/website/*` is only a new unused folder. The existing runtime consumers may keep importing `single-site*` / `siteFacts` for compatibility, but those compatibility modules must derive their generic starter identity, navigation, SEO, product categories, contact facts, and homepage defaults from `src/config/website/*`.

- [ ] **Step 1: Create website config directory**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
mkdir -p src/config/website
```

- [ ] **Step 2: Create profile config**

Create `/Users/Data/workspace/showcase-website-starter/src/config/website/profile.ts`:

```ts
export interface WebsiteProfile {
  readonly name: string;
  readonly legalName: string;
  readonly tagline: string;
  readonly domain: string;
  readonly email: string;
  readonly phone: string;
  readonly address: string;
  readonly country: string;
  readonly city: string;
  readonly foundedYear: number;
  readonly socialLinks: {
    readonly linkedin: string;
    readonly x: string;
  };
}

export const websiteProfile: WebsiteProfile = {
  name: "Example Showcase Company",
  legalName: "Example Showcase Company Ltd.",
  tagline: "Product and service presentation for serious buyers.",
  domain: "example.com",
  email: "sales@example.com",
  phone: "+1 000 000 0000",
  address: "Example Business Park, Example City",
  country: "Example Country",
  city: "Example City",
  foundedYear: 2020,
  socialLinks: {
    linkedin: "https://www.linkedin.com/company/example",
    x: "https://x.com/example",
  },
};
```

- [ ] **Step 3: Create SEO config**

Create `/Users/Data/workspace/showcase-website-starter/src/config/website/seo.ts`:

```ts
import { websiteProfile } from "./profile";

export interface WebsiteSeo {
  readonly defaultTitle: string;
  readonly titleTemplate: string;
  readonly defaultDescription: string;
  readonly siteUrl: string;
  readonly ogImage: string;
}

export const websiteSeo: WebsiteSeo = {
  defaultTitle: `${websiteProfile.name} | Showcase Website Starter`,
  titleTemplate: `%s | ${websiteProfile.name}`,
  defaultDescription:
    "A showcase website starter for company presentation, product or service pages, and inquiry conversion.",
  siteUrl: `https://${websiteProfile.domain}`,
  ogImage: "/images/og-image.jpg",
};
```

- [ ] **Step 4: Create navigation config**

Create `/Users/Data/workspace/showcase-website-starter/src/config/website/navigation.ts`:

```ts
export interface WebsiteNavigationItem {
  readonly labelKey: string;
  readonly href: string;
}

export const websiteNavigation: readonly WebsiteNavigationItem[] = [
  { labelKey: "navigation.home", href: "/" },
  { labelKey: "navigation.products", href: "/products" },
  { labelKey: "navigation.about", href: "/about" },
  { labelKey: "navigation.contact", href: "/contact" },
];
```

- [ ] **Step 5: Create homepage config**

Create `/Users/Data/workspace/showcase-website-starter/src/config/website/homepage.ts`:

```ts
export type HomepageSectionId =
  | "hero"
  | "products"
  | "scenarios"
  | "quality"
  | "faq"
  | "finalCta";

export interface WebsiteHomepageConfig {
  readonly sectionOrder: readonly HomepageSectionId[];
  readonly primaryCtaHref: string;
  readonly secondaryCtaHref: string;
  readonly showFaq: boolean;
  readonly showMetrics: boolean;
}

export const websiteHomepage: WebsiteHomepageConfig = {
  sectionOrder: ["hero", "products", "scenarios", "quality", "faq", "finalCta"],
  primaryCtaHref: "/contact",
  secondaryCtaHref: "/about",
  showFaq: true,
  showMetrics: true,
};
```

- [ ] **Step 6: Create products config**

Create `/Users/Data/workspace/showcase-website-starter/src/config/website/products.ts`:

```ts
export interface WebsiteProductCategory {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly image: string;
  readonly href: string;
}

export const websiteProductCategories: readonly WebsiteProductCategory[] = [
  {
    id: "product-category-a",
    label: "Product Category A",
    description: "Example product category for a showcase website starter.",
    image: "/images/products/sample-product.svg",
    href: "/products",
  },
  {
    id: "service-category-b",
    label: "Service Category B",
    description: "Example service category for companies that sell expertise.",
    image: "/images/products/sample-product.svg",
    href: "/products",
  },
];
```

- [ ] **Step 7: Create contact config**

Create `/Users/Data/workspace/showcase-website-starter/src/config/website/contact.ts`:

```ts
import { websiteProfile } from "./profile";

export interface WebsiteContactConfig {
  readonly recipientEmail: string;
  readonly fallbackEmail: string;
  readonly responseTimeLabel: string;
}

export const websiteContact: WebsiteContactConfig = {
  recipientEmail: websiteProfile.email,
  fallbackEmail: websiteProfile.email,
  responseTimeLabel: "1 business day",
};
```

- [ ] **Step 8: Connect website config to the existing runtime compatibility layer**

Update the copied starter's existing `single-site*` / `siteFacts` modules so current app code reads the new `website` truth indirectly.

Required intent:

- `src/config/single-site.ts`
  - Import from `src/config/website/index.ts`.
  - Export the existing compatibility names expected by current consumers, but fill them from `websiteProfile`, `websiteSeo`, `websiteNavigation`, `websiteProductCategories`, `websiteContact`, and `websiteHomepage`.
  - Keep the existing TypeScript shapes stable enough that current consumers do not need a broad rewrite in this task.
- `src/config/site-facts.ts`
  - Continue exporting `siteFacts` for existing consumers.
  - Ensure `siteFacts.company.name`, `siteFacts.contact.email`, `siteFacts.contact.phone`, `siteFacts.company.location`, and visible business stats come from generic starter values, not Tianze values.
- `src/config/single-site-navigation.ts`
  - Keep exported navigation helpers stable.
  - Derive active navigation labels/hrefs from `websiteNavigation` where practical.
- `src/config/single-site-seo.ts`
  - Derive site URL, default title, title template, description, and OG image from `websiteSeo`.
- `src/config/single-site-page-expression.ts`
  - Replace Tianze-specific proof items, scenario items, and trust items with generic example values.
  - Use `websiteHomepage` for homepage section intent where practical.
- `src/config/single-site-product-catalog.ts`
  - Replace Tianze/PVC-specific catalog facts with generic product/service examples.
  - Derive category labels and hrefs from `websiteProductCategories` where practical.

Do not leave comments that say `single-site` is still Tianze-only truth. In the starter, these files are compatibility wrappers around `src/config/website/*`.

- [ ] **Step 9: Add a runtime bridge contract test**

Create `/Users/Data/workspace/showcase-website-starter/src/config/website/__tests__/website-runtime-bridge.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { siteFacts } from "@/config/site-facts";
import {
  SINGLE_SITE_CONFIG,
  SINGLE_SITE_FACTS,
  SINGLE_SITE_NAVIGATION,
} from "@/config/single-site";
import { websiteNavigation, websiteProfile, websiteSeo } from "../index";

describe("website runtime bridge", () => {
  it("feeds the existing site facts compatibility export", () => {
    expect(siteFacts.company.name).toBe(websiteProfile.name);
    expect(siteFacts.contact.email).toBe(websiteProfile.email);
    expect(siteFacts.contact.phone).toBe(websiteProfile.phone);
    expect(SINGLE_SITE_FACTS.company.name).toBe(websiteProfile.name);
  });

  it("feeds the existing site config compatibility export", () => {
    expect(SINGLE_SITE_CONFIG.name).toBe(websiteProfile.name);
    expect(SINGLE_SITE_CONFIG.domain).toBe(websiteProfile.domain);
    expect(SINGLE_SITE_CONFIG.seo.defaultTitle).toBe(websiteSeo.defaultTitle);
  });

  it("feeds the existing navigation compatibility export", () => {
    expect(SINGLE_SITE_NAVIGATION.map((item) => item.href)).toEqual(
      websiteNavigation.map((item) => item.href),
    );
  });
});
```

- [ ] **Step 10: Verify no old config truth remains authoritative**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
rg -n "Tianze|天泽|tianze-pipe|PVC conduit|PETG pneumatic|Lianyungang" src/config
```

Expected: no output, except explicitly documented forbidden-pattern fixtures in `scripts/brand-check.mjs` after Task 8.

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
rg -n "single-site.*truth|Tianze-only|current single-site baseline" src/config
```

Expected: no stale comments that describe the starter runtime truth as Tianze-specific.

- [ ] **Step 11: Create index export**

Create `/Users/Data/workspace/showcase-website-starter/src/config/website/index.ts`:

```ts
export { websiteContact } from "./contact";
export type { WebsiteContactConfig } from "./contact";
export { websiteHomepage } from "./homepage";
export type { HomepageSectionId, WebsiteHomepageConfig } from "./homepage";
export { websiteNavigation } from "./navigation";
export type { WebsiteNavigationItem } from "./navigation";
export { websiteProductCategories } from "./products";
export type { WebsiteProductCategory } from "./products";
export { websiteProfile } from "./profile";
export type { WebsiteProfile } from "./profile";
export { websiteSeo } from "./seo";
export type { WebsiteSeo } from "./seo";
```

- [ ] **Step 12: Add basic type test**

Create `/Users/Data/workspace/showcase-website-starter/src/config/website/__tests__/website-config.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  websiteContact,
  websiteHomepage,
  websiteNavigation,
  websiteProductCategories,
  websiteProfile,
  websiteSeo,
} from "../index";

describe("website config", () => {
  it("provides a complete replaceable website profile", () => {
    expect(websiteProfile.name).toBeTruthy();
    expect(websiteProfile.domain).toBe("example.com");
    expect(websiteProfile.email).toBe("sales@example.com");
  });

  it("provides page assembly inputs", () => {
    expect(websiteHomepage.sectionOrder).toContain("hero");
    expect(websiteHomepage.primaryCtaHref).toBe("/contact");
    expect(websiteNavigation.length).toBeGreaterThan(0);
  });

  it("provides product and contact defaults", () => {
    expect(websiteProductCategories.length).toBeGreaterThan(0);
    expect(websiteContact.recipientEmail).toBe("sales@example.com");
    expect(websiteSeo.siteUrl).toBe("https://example.com");
  });
});
```

- [ ] **Step 13: Run focused tests**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
pnpm exec vitest run src/config/website/__tests__/website-config.test.ts src/config/website/__tests__/website-runtime-bridge.test.ts
```

Expected: PASS. This is the minimum proof that `src/config/website/*` is not an unused fake surface.

- [ ] **Step 14: Commit website config surface**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
git add src/config/website src/config/single-site*.ts src/config/site-facts.ts
git commit -m "feat: add website replacement config surface"
```

Expected: commit succeeds.

---

## Task 5: Replace Page Content Without Emptying the Website

**Files:**
- Modify: `/Users/Data/workspace/showcase-website-starter/content/pages/en/*.mdx`
- Modify: `/Users/Data/workspace/showcase-website-starter/content/pages/zh/*.mdx`
- Modify: `/Users/Data/workspace/showcase-website-starter/messages/en/critical.json`
- Modify: `/Users/Data/workspace/showcase-website-starter/messages/en/deferred.json`
- Modify: `/Users/Data/workspace/showcase-website-starter/messages/zh/critical.json`
- Modify: `/Users/Data/workspace/showcase-website-starter/messages/zh/deferred.json`

- [ ] **Step 1: Replace company identity in MDX content**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
rg -n -i "Tianze|天泽|tianze-pipe|PVC conduit|PETG pneumatic|Lianyungang" content/pages messages
```

Expected: matches exist before replacement.

Edit content so the visible example identity becomes:

- English company: `Example Showcase Company`
- Chinese company: `示例展示型公司`
- English category: `industrial products and services`
- Chinese category: `工业产品与服务`
- Email: `sales@example.com`
- Domain: `example.com`

- [ ] **Step 2: Keep page structure**

Do not delete these pages:

```text
content/pages/en/about.mdx
content/pages/en/contact.mdx
content/pages/en/oem-custom-manufacturing.mdx
content/pages/en/privacy.mdx
content/pages/en/terms.mdx
content/pages/zh/about.mdx
content/pages/zh/contact.mdx
content/pages/zh/oem-custom-manufacturing.mdx
content/pages/zh/privacy.mdx
content/pages/zh/terms.mdx
```

Rewrite their copy to generic examples. Do not leave pages blank.

- [ ] **Step 3: Replace homepage and UI copy**

Update `messages/{locale}/critical.json` and `messages/{locale}/deferred.json` so:

- no `Tianze`
- no `天泽`
- no `tianze-pipe.com`
- no `PVC conduit`
- no `PETG pneumatic tube`
- no unverifiable factory claim

Use generic showcase content:

- `Product Category A`
- `Service Category B`
- `Quality-controlled delivery`
- `Custom project support`
- `Contact us`

- [ ] **Step 4: Verify no old brand text remains in content**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
rg -n -i "Tianze|天泽|tianze-pipe|PVC conduit|PETG pneumatic|Lianyungang" content/pages messages
```

Expected: no output.

- [ ] **Step 5: Run content and translation checks**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
pnpm content:check
```

Expected: PASS.

- [ ] **Step 6: Commit generic website content**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
git add content/pages messages
git commit -m "content: replace Tianze copy with generic website examples"
```

Expected: commit succeeds.

---

## Task 6: Clean Docs for the New Website Starter

**Files:**
- Modify or remove from new project only: `/Users/Data/workspace/showcase-website-starter/docs/**`
- Do not modify current Tianze repo docs in this task.

- [ ] **Step 1: Identify Tianze-specific docs**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
rg -n -i "Tianze|天泽|tianze-pipe|PVC conduit|PETG pneumatic|Lianyungang" docs README.md PRODUCT.md DESIGN.md HANDOFF.md AGENTS.md CLAUDE.md
```

Expected: matches exist.

- [ ] **Step 2: Remove historical execution docs from new project**

Move these new-project directories to Trash, not permanent delete:

```text
docs/superpowers/current/
docs/superpowers/plans/
docs/superpowers/prompts/
docs/audits/full-project-health-v2/runs/
docs/strategy/
docs/research/
docs/cwf/
```

Use a Trash path:

```bash
trash_target="$HOME/.Trash/showcase-website-starter-docs-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$trash_target"
for p in \
  docs/superpowers/current \
  docs/superpowers/plans \
  docs/superpowers/prompts \
  docs/audits/full-project-health-v2/runs \
  docs/strategy \
  docs/research \
  docs/cwf
do
  if [ -e "$p" ]; then
    mkdir -p "$trash_target/$(dirname "$p")"
    mv "$p" "$trash_target/$p"
  fi
done
echo "$trash_target"
```

- [ ] **Step 3: Keep and genericize current docs**

Keep these docs, but remove Tianze-specific wording:

```text
docs/website/**
docs/technical/**
docs/guides/QUALITY-PROOF-LEVELS.md
docs/guides/RELEASE-PROOF-RUNBOOK.md
docs/guides/POLICY-SOURCE-OF-TRUTH.md
docs/guides/CANONICAL-TRUTH-REGISTRY.md
docs/impeccable/system/COMPONENT-GOVERNANCE.md
docs/impeccable/system/COMPONENT-INVENTORY.md
docs/impeccable/system/COLOR-SYSTEM.md
docs/impeccable/system/GRID-SYSTEM.md
docs/impeccable/system/PAGE-PATTERNS.md
```

Rename Tianze-specific design token doc in the new project:

```bash
cd /Users/Data/workspace/showcase-website-starter
if [ -f docs/impeccable/system/TIANZE-DESIGN-TOKENS.md ]; then
  mv docs/impeccable/system/TIANZE-DESIGN-TOKENS.md docs/impeccable/system/DESIGN-TOKENS.md
fi
```

- [ ] **Step 4: Rewrite PRODUCT and DESIGN as examples**

Replace `/Users/Data/workspace/showcase-website-starter/PRODUCT.md` with a generic product context:

```markdown
# Website Product Context

This project is a starter for showcase websites.

Use it for companies that need to present products, services, credibility, process, case examples, and a clear inquiry path.

The default content is example content. Replace it before using this starter for a real business.
```

Replace `/Users/Data/workspace/showcase-website-starter/DESIGN.md` with:

```markdown
# Website Design Direction

The visual direction is clear, credible, structured, and conversion-oriented.

The starter should feel polished enough for a serious company website, while remaining easy to rebrand.

Design tokens live in `docs/impeccable/system/DESIGN-TOKENS.md` and runtime CSS tokens.
```

- [ ] **Step 5: Verify docs no longer assert Tianze identity**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
rg -n -i "Tianze|天泽|tianze-pipe|PVC conduit|PETG pneumatic|Lianyungang" docs README.md PRODUCT.md DESIGN.md HANDOFF.md AGENTS.md CLAUDE.md
```

Expected: no output. Do not keep historical Tianze references in the starter docs.

- [ ] **Step 6: Commit docs cleanup**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
git add docs README.md PRODUCT.md DESIGN.md HANDOFF.md AGENTS.md CLAUDE.md
git commit -m "docs: create generic website documentation set"
```

Expected: commit succeeds.

---

## Task 7: Migrate AI Workflow Without Local Runtime State

**Files:**
- Modify: `/Users/Data/workspace/showcase-website-starter/AGENTS.md`
- Modify: `/Users/Data/workspace/showcase-website-starter/CLAUDE.md`
- Modify: `/Users/Data/workspace/showcase-website-starter/.claude/**`
- Create: `/Users/Data/workspace/showcase-website-starter/.codex/README.md`
- Create: `/Users/Data/workspace/showcase-website-starter/.codex/config.example.toml`
- Create: `/Users/Data/workspace/showcase-website-starter/.mcp.example.json`

- [ ] **Step 1: Ensure local runtime files are absent**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
for p in \
  .codex/auth.json \
  .codex/history.jsonl \
  .codex/log \
  .codex/shell_snapshots \
  .omx \
  .context \
  CLAUDE.local.md \
  .firecrawl \
  .claude/agents \
  .claude/skills \
  .claude/worktrees \
  .claude/settings.local.json \
  .mcp.json \
  .env \
  .env.local \
  .env.development.local \
  .env.test.local \
  .env.production.local \
  .dev.vars
do
  if [ -e "$p" ]; then
    echo "unexpected runtime artifact: $p"
    exit 1
  fi
done
if find . -path ./.git -prune -o -name ".env*" -print -quit | grep -q .; then
  echo "unexpected runtime env artifact"
  find . -path ./.git -prune -o -name ".env*" -print
  exit 1
fi
echo "runtime artifacts absent"
```

Expected:

```text
runtime artifacts absent
```

- [ ] **Step 2: Add Codex README**

Create `/Users/Data/workspace/showcase-website-starter/.codex/README.md`:

```markdown
# Codex Project Notes

This directory may contain reusable Codex-facing prompts, agents, or skills.

Do not commit local runtime state:

- `auth.json`
- `history.jsonl`
- `log/`
- `*.sqlite*`
- `shell_snapshots/`
- `.omx/`

The main project entry remains `AGENTS.md`.
```

- [ ] **Step 3: Add Codex config example**

Create `/Users/Data/workspace/showcase-website-starter/.codex/config.example.toml`:

```toml
model = "gpt-5.4"
model_reasoning_effort = "medium"

[projects."/ABSOLUTE/PATH/TO/showcase-website-starter"]
trust_level = "trusted"
```

Do not include oh-my-codex or OMX MCP servers.

- [ ] **Step 4: Allow only committed Codex example files**

The inherited `.gitignore` ignores `.codex/` because runtime state must stay local. Keep that default, but allow the two example files:

Edit `/Users/Data/workspace/showcase-website-starter/.gitignore` near the `.codex/` rule:

```gitignore
.codex/*
!.codex/README.md
!.codex/config.example.toml
```

Do not unignore `.codex/auth.json`, `.codex/history.jsonl`, `.codex/log/`, `.codex/*.sqlite*`, or `.codex/shell_snapshots/`.

- [ ] **Step 5: Add MCP example**

Create `/Users/Data/workspace/showcase-website-starter/.mcp.example.json`:

```json
{
  "mcpServers": {
    "dev": {
      "type": "http",
      "url": "http://localhost:8000/mcp/dev"
    }
  }
}
```

Do not include Storybook here. Storybook MCP is managed by MCPHub.

- [ ] **Step 6: Update AGENTS and CLAUDE workflow pointers**

In both `AGENTS.md` and `CLAUDE.md`, add:

```markdown
## Website Starter Docs

Before making broad project changes, read:

1. `docs/website/README.md`
2. `docs/website/新项目替换清单.md`
3. `docs/website/AI工作流.md`

Do not rely on chat memory for project truth. If a decision must survive sessions, write it into the appropriate file under `docs/website/` or the relevant rule file.
```

- [ ] **Step 7: Update Claude DWF references**

Find references to `TIANZE-DESIGN-TOKENS.md`:

```bash
cd /Users/Data/workspace/showcase-website-starter
rg -n "TIANZE-DESIGN-TOKENS" .claude docs
```

Replace them with:

```text
docs/impeccable/system/DESIGN-TOKENS.md
```

- [ ] **Step 8: Verify AI workflow has no old runtime references**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
rg -n -i "oh-my-codex|OMX|\\.omx|auth.json|history.jsonl|settings.local.json|Tianze|天泽|tianze-pipe|PVC conduit|PETG pneumatic|Lianyungang" AGENTS.md CLAUDE.md .codex .claude docs/website
```

Expected: no output except `.codex/README.md` explaining that `.omx/` is not committed.

- [ ] **Step 9: Verify Codex examples are trackable but runtime state is ignored**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
git check-ignore -v .codex/auth.json .codex/history.jsonl .codex/log/example.log .codex/shell_snapshots/example 2>/dev/null
if git check-ignore -v .codex/README.md .codex/config.example.toml; then
  echo "unexpected: example files are ignored"
  exit 1
fi
```

Expected:

- runtime files are ignored by `.gitignore`
- `.codex/README.md` and `.codex/config.example.toml` are not ignored

- [ ] **Step 10: Commit AI workflow migration**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
git add AGENTS.md CLAUDE.md .claude .gitignore .codex/README.md .codex/config.example.toml .mcp.example.json docs/website/AI工作流.md
git commit -m "chore: migrate AI workflow without local runtime state"
```

Expected: commit succeeds.

---

## Task 8: Add Brand Residue Guard

**Files:**
- Create: `/Users/Data/workspace/showcase-website-starter/scripts/brand-check.mjs`
- Modify: `/Users/Data/workspace/showcase-website-starter/package.json`

- [ ] **Step 1: Create brand check script**

Create `/Users/Data/workspace/showcase-website-starter/scripts/brand-check.mjs`:

```js
import { execFileSync } from "node:child_process";

const forbiddenPatterns = [
  "Tianze",
  "天泽",
  "tianze-pipe",
  "Lianyungang Tianze",
  "PVC conduit",
  "PETG pneumatic",
];

const searchTargets = [
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "PRODUCT.md",
  "DESIGN.md",
  "HANDOFF.md",
  "docs",
  "src",
  "content",
  "messages",
  "public",
  "package.json",
];

const pattern = forbiddenPatterns.join("|");

try {
  const output = execFileSync("rg", ["-n", "-i", pattern, ...searchTargets], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  console.error(output);
  console.error("[brand-check] Old project brand residue found.");
  process.exit(1);
} catch (error) {
  if (error.status === 1) {
    console.log("[brand-check] No old project brand residue found.");
    process.exit(0);
  }

  console.error(error.stderr?.toString() || error.message);
  process.exit(error.status || 1);
}
```

- [ ] **Step 2: Run brand check before cleanup**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
pnpm brand:check
```

Expected: PASS if earlier tasks removed all old residue. If FAIL, use output as cleanup list and rerun.

- [ ] **Step 3: Commit brand guard**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
git add scripts/brand-check.mjs package.json
git commit -m "test: add old brand residue guard"
```

Expected: commit succeeds.

---

## Task 9: Final Verification and Starter Baseline Commit

**Files:**
- Entire new repository: `/Users/Data/workspace/showcase-website-starter`

- [ ] **Step 1: Install dependencies**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
pnpm install
```

Expected: install succeeds and lockfile is current.

- [ ] **Step 2: Run verification chain**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
pnpm brand:check
pnpm content:check
pnpm type-check
pnpm lint:check
pnpm test
pnpm build
pnpm component:check
pnpm build:cf
pnpm release:verify
pnpm truth:check
pnpm review:docs-truth
pnpm review:derivative-readiness
pnpm ci:local:quick
```

Expected: each command exits 0.

- [ ] **Step 3: Verify runtime artifacts remain ignored**

Run:

```bash
cd /Users/Data/workspace/showcase-website-starter
git status --short --ignored | sed -n '1,160p'
```

Expected:

- tracked changes are either empty or intentionally staged
- ignored artifacts may include `node_modules/`, `.next/`, `.open-next/`, `storybook-static/`, `.wrangler/`, `reports/`
- no `.env*`, `.dev.vars`, `.mcp.json`, `CLAUDE.local.md`, `.firecrawl`, `.claude/agents`, `.claude/skills`, `.claude/worktrees`, `.codex/auth.json`, `.codex/history.jsonl`, `.omx/`, or `.context/` is tracked

- [ ] **Step 4: Commit final verification adjustments**

If verification changed generated tracked files, run:

```bash
cd /Users/Data/workspace/showcase-website-starter
git status --short --untracked-files=all
```

Inspect the output first. Do not stage runtime/local artifacts. If tracked generated files need to be committed, stage only those explicit paths, for example:

```bash
git add package.json pnpm-lock.yaml public/messages messages
git commit -m "chore: finalize showcase website starter baseline"
```

If no tracked files changed, skip commit. Do not use `git add .` for this final adjustment step.

- [ ] **Step 5: Write final handoff**

Create `/Users/Data/workspace/showcase-website-starter/HANDOFF.md`:

```markdown
# Showcase Website Starter Handoff

This repository is the clean baseline for future showcase websites.

## Start here

1. `docs/website/README.md`
2. `docs/website/新项目替换清单.md`
3. `docs/website/品牌设置.md`
4. `docs/website/内容设置.md`
5. `docs/website/部署设置.md`
6. `docs/website/AI工作流.md`

## Verification

Run:

```bash
pnpm brand:check
pnpm content:check
pnpm website:check
pnpm component:check
pnpm website:build:cf
pnpm release:verify
pnpm truth:check
pnpm review:docs-truth
pnpm review:derivative-readiness
pnpm ci:local:quick
```
```

Commit:

```bash
cd /Users/Data/workspace/showcase-website-starter
git add HANDOFF.md
git commit -m "docs: add website starter handoff"
```

Expected: commit succeeds.

---

## Self-Review Checklist

- [ ] The plan keeps current Tianze production project intact.
- [ ] The new project path is `/Users/Data/workspace/showcase-website-starter`.
- [ ] Docs use `docs/website/`, not `docs/template/`.
- [ ] Commands use `website:*`, `brand:*`, `content:*`, `component:*`, `release:*`, not `template:*`.
- [ ] Config surface uses `src/config/website/`.
- [ ] Existing runtime compatibility exports (`single-site*` / `siteFacts`) derive from `src/config/website/`, so the new config surface is not an unused fake layer.
- [ ] Page content is genericized, not deleted to empty.
- [ ] Storybook MCP is centralized through MCPHub and not kept in project `.mcp.json`.
- [ ] oh-my-codex / OMX local state is not migrated.
- [ ] Local/private state such as `CLAUDE.local.md`, `.firecrawl`, `.claude/agents`, `.claude/skills`, and `.claude/worktrees` is not copied into the starter.
- [ ] Secret/runtime artifacts are excluded from the starter, including all `.env*` files.
- [ ] Final verification includes brand residue scan, content checks, tests, build, Storybook build, Cloudflare build, release proof, truth checks, docs truth, derivative readiness, and quick local CI.

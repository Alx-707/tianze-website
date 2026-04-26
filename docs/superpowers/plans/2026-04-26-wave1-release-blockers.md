# Wave 1: Release-Blocking Repairs Implementation Plan (v2 — post adversarial review)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 baseline 报告里的 Wave 1（上线阻断项）全部修完，让 tianze-website 达到"可以对外推广"的最低门槛。覆盖：安全漏洞降噪、品牌资产替换、法务文案诚信、SEO schema 收口、CSP hash 刷新、导航转化路径、GitHub 社交链接移除。

**Architecture:** 三类改动并行推进——(1) 纯技术修复（SEO/CSP/sitemap 收口、GitHub 移除）engineer 独立执行；(2) 资产替换（logo/hero/ISO PDF）需业务方先交付文件再落地；(3) 文案重写（Privacy/Terms/Standards）业务方主笔，engineer 落地 MDX。

**Tech Stack:** Next.js 16.2.3 (App Router) · React 19.2.4 · TypeScript 5.9 strict · Tailwind v4 · next-intl 4.8 · Cloudflare/OpenNext deploy · Vitest · Playwright · pnpm

**Source baseline:** `docs/reports/2026-04-26-codebase-quality-audit-baseline.md` Wave 1（含 §4.1.1 至 §4.1.6）+ 后续验证补充的 B0（RSC DoS）。

**Adversarial review:** `docs/superpowers/prompts/wave1-adversarial-review-codex.md`（30 findings，12 blockers — 全部已在 v2 修正）。

**Wave 1 范围一句话：** 让海外买家做尽调时看到的每一处"模板痕迹"和"假声明"都被替换为真实事实或被诚实下调。

---

## v2 修订说明（对抗式审查后的重大变更）

| 原计划问题 | v2 修正 |
|-----------|---------|
| Task 2 假设 root `next@16.2.3` 命中 audit，实际命中的是 `@react-email/preview-server > next@16.1.7` | 重写 Task 2：拆成 react-server-dom 升级 + @react-email override + 诚实 audit 目标 |
| 6 个假函数名/假测试文件名 | 全部替换为实际 API：`generateWebSiteData`、`SINGLE_SITE_FACTS`、`getContentLastModified`、`sanitizeParam`、`loadConsent`、`structured-data.test.ts` |
| Task 18/19 文件和命令写偏 | CSP 改为 `src/config/security.ts` + `pnpm security:csp:check`；Semgrep 改为 `pnpm security:semgrep` + 2 条 object-injection warning |
| Task 17 用 `git add -A` | 改为显式文件列表 + `content/posts/` 归档 + blog 全链路清理 |
| 漏掉 GitHub 社交链接移除 | 新增 Task 3A |
| Task 13 标准声明降级只盯 about.mdx | 扩展到 oem-custom-manufacturing.mdx + messages/*.json |
| Task 5 漏了 SiteFacts 类型定义 | 补 `src/config/site-types.ts` 改动 |
| Task 8/10 归档文件未 git stage | 补 `git rm --cached` 步骤 |
| content 类任务漏了刷新 manifest 步骤 | 补 `pnpm content:manifest` |
| Task 4/5/16 漏了旧测试断言更新 | 逐个补全 |

---

## 业务方需提前交付的资产（engineer 不能代办）

| 资产 | 用于任务 | 规格要求 |
|---|---|---|
| 品牌 logo SVG（横排+方形） | Task 8 | 透明背景，至少 200×60 横排 + 256×256 方形；附 PNG fallback |
| Hero 视觉 3 张 | Task 10 | 弯管机/扩口机/产线，1600×900，JPG/WebP，工厂实拍优先 |
| ISO 9001:2015 证书 PDF | Task 9 | 官方扫描件，证书号与 about.mdx:35 / 119 声明一致；< 5MB |
| 真实联系电话 | Task 11 | E.164 格式（如 +86-518-12345678），与 footer / contact 页对齐 |
| Privacy 政策草稿（en + zh） | Task 12 | 按本站实际收集面：contact / newsletter / 询盘 / attribution / cookie。删除"账户/密码/聊天"段落 |
| 已就绪的标准声明清单 | Task 13 | 列出 AS/NZS、ASTM、IEC、NOM 中**已有公开 proof** 的项目；其余降级措辞 |

---

## File Structure（本计划涉及的所有文件）

**Modify:**
- `package.json` — react-server-dom-* 升级 + @react-email override（Task 2）
- `pnpm-lock.yaml` — 由 `pnpm install` 重新生成（Task 2）
- `src/lib/structured-data-generators.ts` — 删 SearchAction、logo 走 brandAssets（Task 3, 5, 8）
- `src/lib/structured-data-types.ts` — 删 `searchUrl` 字段（Task 3）
- `src/lib/__tests__/structured-data.test.ts` — 更新 WebSite/logo 断言（Task 3, 5）
- `src/lib/seo-metadata.ts` — 删 developer-stack 关键词（Task 4）
- `src/lib/__tests__/seo-metadata.test.ts` — 更新 keywords 断言（Task 4）
- `src/config/single-site.ts` — 加 brandAssets、删 GitHub social、修电话、nav 重排（Task 3A, 5, 11, 15）
- `src/config/site-types.ts` — SiteFacts 加 brandAssets interface、SocialLinks 删 github（Task 3A, 5）
- `src/config/site-facts.ts` — 可能需同步（Task 3A）
- `src/lib/sitemap-utils.ts` — fallback fail-loud（Task 6）
- `src/lib/__tests__/sitemap-utils.test.ts` — 加 fallback 测试（Task 6）
- `src/config/single-site-seo.ts` — 静态页 lastmod 更新（Task 7）
- `src/components/layout/logo.tsx` — 引用 brandAssets，删除 `/next.svg`（Task 8）
- `src/components/layout/__tests__/logo.test.tsx` — 更新 src 断言（Task 8）
- `src/components/sections/hero-section.tsx` — HeroVisual 从空 div 改为 next/image（Task 10）
- `content/pages/en/terms.mdx` + `content/pages/zh/terms.mdx` — 真实电话 + updatedAt（Task 11, 14）
- `content/pages/en/privacy.mdx` + `content/pages/zh/privacy.mdx` — 重写（Task 12, 14）
- `content/pages/en/about.mdx` + `content/pages/zh/about.mdx` — 标准声明降级（Task 13）
- `content/pages/en/oem-custom-manufacturing.mdx` + `content/pages/zh/oem-custom-manufacturing.mdx` — 标准声明降级（Task 13）
- `messages/en.json` + `messages/zh.json` — 标准声明降级（Task 13）
- `src/components/layout/header-client.tsx` — MobileNavigation 改 SSR fallback（Task 16）
- `src/components/layout/mobile-navigation.tsx` — 拆出 server shell（Task 16）
- `src/lib/utm.ts` — sanitizeParam 放宽（Task 21）
- `src/components/attribution-bootstrap.tsx` — consent gate（Task 20）
- `src/config/security.ts` — CSP hash 刷新（Task 18）
- `src/components/forms/lazy-turnstile.tsx` — Semgrep object-injection fix（Task 19）
- `src/lib/security/client-ip.ts` — Semgrep object-injection fix（Task 19）
- `src/config/paths/types.ts` — 删 blog PageType（Task 17）
- `src/config/paths/paths-config.ts` — 删 blog 路径（Task 17）
- `src/app/sitemap.ts` — 删 blog URL 生成（Task 17）
- `src/config/single-site-seo.ts` — 删 blog sitemap 配置（Task 17）

**Create:**
- `public/images/logo.svg` + `public/images/logo.png`（Task 8）
- `public/images/hero/{bending-machine,expander,production-line}.{jpg|webp}`（Task 10）
- `public/certs/iso9001.pdf`（Task 9）
- `src/components/layout/mobile-navigation-interactive.tsx`（Task 16）

**Archive (Trash, not rm):**
- `public/next.svg`（Task 8 完成后）
- `src/app/[locale]/blog/`（Task 17）
- `content/posts/`（Task 17）

---

## Task 1: 准备分支与验证基线

**Files:**
- Create: 新分支 `wave1-release-blockers`
- Read-only: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: 从 main 切出新分支**

```bash
git checkout main
git pull origin main
git checkout -b wave1-release-blockers
```

- [ ] **Step 2: 跑当前基线 CI 并记录数字**

```bash
pnpm install --frozen-lockfile
pnpm ci:local 2>&1 | tee /tmp/wave1-baseline-ci.log
pnpm audit 2>&1 | tee /tmp/wave1-baseline-audit.log
```

预期：`pnpm ci:local` 通过；`pnpm audit` 显示 25 vulnerabilities（1 critical / 15 high / 8 moderate / 1 low）。

- [ ] **Step 3: 提交基线快照（无代码改动，仅记录）**

不创建 commit；保留 `/tmp/wave1-baseline-ci.log` 与 `/tmp/wave1-baseline-audit.log` 供 Task 22 对比。

---

## Task 2: B0 — 降低 audit 漏洞面（诚实范围）

**Files:**
- Modify: `package.json`
- Regenerate: `pnpm-lock.yaml`

**Why:** 当前 `pnpm audit` 报 25 vulnerabilities。其中：
- `react-server-dom-webpack@19.2.4` 和 `react-server-dom-turbopack@19.2.4` 各有 1 条 High（RSC DoS）
- `@react-email/preview-server` 依赖 `next@16.1.7`（不是 root next），也命中 High
- 其余 high/critical 来自 `@lhci/cli`、`vitest>happy-dom`、`vitest>vite`、`@opennextjs/cloudflare>@aws-sdk` 等间接依赖

**本 Task 的诚实目标**：修 react-server-dom-* 的 RSC DoS；加 @react-email/preview-server 的 next override。不承诺 audit 清零——间接依赖漏洞需等上游发版。

- [ ] **Step 1: 查询 react-server-dom-* 当前最新补丁版本**

```bash
pnpm view react-server-dom-webpack versions --json | tail -10
pnpm view react-server-dom-turbopack versions --json | tail -10
```

选择修复了 RSC DoS 公告的最新 19.2.x 补丁。

- [ ] **Step 2: 升级 package.json 中的 react-server-dom-* 版本**

读 `package.json` 当前 255-256 行附近：
```json
"react-server-dom-turbopack": "19.2.4",
"react-server-dom-webpack": "19.2.4",
```

替换为 Step 1 选定的版本。同时确认 `react` 和 `react-dom` 是否也需要同步升级到相同补丁版本。

- [ ] **Step 3: 给 @react-email/preview-server 的 next 依赖加 pnpm override**

在 `package.json` 加 pnpm overrides（如果尚无此段则新建）：

```json
"pnpm": {
  "overrides": {
    "@react-email/preview-server>next": "$next"
  }
}
```

`$next` 引用 root 的 next 版本，使间接依赖也用 `16.2.3`。

- [ ] **Step 4: 重新生成 lockfile**

```bash
pnpm install
```

- [ ] **Step 5: 跑 audit 验证 react-server-dom 漏洞已修**

```bash
pnpm audit 2>&1 | tee /tmp/wave1-task2-audit.log
```

预期：react-server-dom-webpack、react-server-dom-turbopack、@react-email/preview-server>next 三条 High 消失。总数下降但不清零——间接依赖漏洞仍在。

- [ ] **Step 6: 跑全量 CI 验证升级未破坏构建**

```bash
pnpm ci:local
```

预期：type-check / lint / test / build 全部通过。

- [ ] **Step 7: 跑 Cloudflare 构建验证**

```bash
pnpm build:cf
```

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
fix(security): upgrade react-server-dom + override @react-email/preview-server next

Patches RSC DoS advisory in react-server-dom-webpack and
react-server-dom-turbopack. Adds pnpm override so @react-email/preview-server
uses root next@16.2.3 instead of vulnerable 16.1.7.

Note: 20+ audit findings from transitive deps (@lhci/cli, vitest>happy-dom,
@opennextjs/cloudflare>@aws-sdk) remain — these require upstream releases.
EOF
)"
```

---

## Task 3: B12 — 删除 WebSite schema 中的假 /search SearchAction

**Files:**
- Modify: `src/lib/structured-data-generators.ts:128-155`
- Modify: `src/lib/structured-data-types.ts:16-21`
- Modify: `src/lib/__tests__/structured-data.test.ts:187-200`

**Why:** 本站不存在 `/search` 路由。Google 已于 2024-11-21 停用 sitelinks search box。留着只是对搜索引擎说假话。

- [ ] **Step 1: 改现有测试断言（从"有 potentialAction"改为"无 potentialAction"）**

读 `src/lib/__tests__/structured-data.test.ts:187-200`，当前断言：

```typescript
expect(schema).toHaveProperty("potentialAction");
```

改为：

```typescript
expect(schema).not.toHaveProperty("potentialAction");
expect(JSON.stringify(schema)).not.toContain("SearchAction");
expect(JSON.stringify(schema)).not.toContain("/search");
```

- [ ] **Step 2: 跑测试确认失败**

```bash
pnpm test src/lib/__tests__/structured-data.test.ts -t "WebSite"
```

预期：FAIL（当前 schema 仍含 potentialAction）。

- [ ] **Step 3: 删除 SearchAction 块**

读 `src/lib/structured-data-generators.ts:146-151`：

```typescript
potentialAction: {
  "@type": "SearchAction",
  target:
    data.searchUrl || `${FALLBACK_BASE_URL}/search?q={search_term_string}`,
  "query-input": "required name=search_term_string",
},
```

删除整个 `potentialAction` 属性（含尾随逗号）。

- [ ] **Step 4: 删除 WebSiteData 的 searchUrl 字段**

读 `src/lib/structured-data-types.ts:16-21`：

```typescript
export interface WebSiteData {
  name?: string;
  description?: string;
  url?: string;
  searchUrl?: string;
}
```

删除 `searchUrl?: string;` 行。

- [ ] **Step 5: grep 确认无残留引用**

```bash
grep -rn "searchUrl\|SearchAction\|potentialAction" src/ 2>&1
```

如有其他引用，同步删除。

- [ ] **Step 6: 跑测试确认通过**

```bash
pnpm test src/lib/__tests__/structured-data.test.ts
```

- [ ] **Step 7: 跑 type-check 与 lint**

```bash
pnpm type-check && pnpm lint:check
```

- [ ] **Step 8: Commit**

```bash
git add src/lib/structured-data-generators.ts src/lib/structured-data-types.ts src/lib/__tests__/structured-data.test.ts
git commit -m "$(cat <<'EOF'
fix(seo): remove fake SearchAction from WebSite schema (B12)

The /search route does not exist. Google retired sitelinks search box
on 2024-11-21. Removed potentialAction block and searchUrl type field.
EOF
)"
```

---

## Task 3A: 移除 GitHub 社交链接（baseline Wave 1.1 遗漏修补）

**Files:**
- Modify: `src/config/single-site.ts:44-48, 125-129, 232-238`
- Modify: `src/config/site-types.ts:16-20, 77-84`
- Modify: `src/lib/structured-data-generators.ts:117-119`
- Modify: `src/lib/__tests__/structured-data.test.ts`（sameAs 断言）
- Modify: `messages/en.json` + `messages/zh.json`（`footer.sections.social.github` key）

**Why:** Baseline 明确指出"Manufacturer footer 把 GitHub 当业务社交渠道"是 Wave 1.1 范围。PVC 管业公司不应有 GitHub 社交链接。

- [ ] **Step 1: 从 SiteSocialConfig 删 github 字段**

读 `src/config/site-types.ts:16-20`：

```typescript
export interface SiteSocialConfig {
  twitter: string;
  linkedin: string;
  github: string;
}
```

删除 `github: string;` 行。

同时读 `src/config/site-types.ts:77-84` 的 `SocialLinks`：

```typescript
export interface SocialLinks {
  linkedin?: string;
  github?: string;
  // ...
}
```

删除 `github?: string;` 行。

- [ ] **Step 2: 从 single-site.ts 删 GitHub 值和引用**

读 `src/config/single-site.ts:44-48`：

```typescript
const social = {
  twitter: "https://x.com/tianzepipe",
  linkedin: "https://www.linkedin.com/company/tianze-pipe",
  github: "https://github.com/tianze-pipe",
} as const;
```

删除 `github` 行。

读 `:125-129` 的 `facts.social`：

```typescript
social: {
  linkedin: social.linkedin,
  twitter: social.twitter,
  github: social.github,
},
```

删除 `github: social.github,`。

读 `:232-238` 的 footer social column，删除整个 GitHub link item：

```typescript
{
  key: "github",
  label: "GitHub",
  href: social.github,
  external: true,
  translationKey: "footer.sections.social.github",
},
```

- [ ] **Step 3: 从 structured-data-generators.ts 删 GitHub sameAs**

读 `src/lib/structured-data-generators.ts:110-120`：

```typescript
sameAs: [
  t("organization.social.twitter", { ... }),
  t("organization.social.linkedin", { ... }),
  t("organization.social.github", { ... }),
],
```

删除 GitHub 行。

- [ ] **Step 4: 更新测试断言**

`src/lib/__tests__/structured-data.test.ts:168-174` 中 `sameAs` 断言仅检查数组长度和格式。数组从 3 项变 2 项——检查是否有硬编码 length 断言需更新。

- [ ] **Step 5: 删 messages 中的 github 翻译 key**

```bash
grep -n "github" messages/en.json messages/zh.json
```

删除 `footer.sections.social.github` 相关 key。

- [ ] **Step 6: 跑 type-check + lint + test**

```bash
pnpm type-check && pnpm lint:check && pnpm test
```

- [ ] **Step 7: Commit**

```bash
git add src/config/single-site.ts src/config/site-types.ts src/lib/structured-data-generators.ts src/lib/__tests__/structured-data.test.ts messages/en.json messages/zh.json
git commit -m "$(cat <<'EOF'
fix(brand): remove GitHub from social links — not a business channel

PVC pipe manufacturer does not use GitHub as a customer-facing social
channel. Removed from site config, footer, JSON-LD sameAs, and types.
EOF
)"
```

---

## Task 4: 删除 SEO keywords 中的 developer-stack 词

**Files:**
- Modify: `src/lib/seo-metadata.ts:254-261`
- Modify: `src/lib/__tests__/seo-metadata.test.ts:228-245, 273-279`

- [ ] **Step 1: 先更新现有测试（它们断言 shadcn/ui 必须存在）**

读 `src/lib/__tests__/seo-metadata.test.ts:228-245`，当前 home config 测试断言：

```typescript
expect(config).toEqual({
  type: "website",
  keywords: [
    "test", "site",
    "shadcn/ui", "Radix UI", "Modern Web",
    "Enterprise Platform", "B2B Solution",
  ],
  image: "/images/og-image.jpg",
});
```

改为（删除 `shadcn/ui`、`Radix UI`、`Modern Web`、`Enterprise Platform`）：

```typescript
expect(config).toEqual({
  type: "website",
  keywords: [
    "test", "site",
    "B2B Solution",
  ],
  image: "/images/og-image.jpg",
});
```

读 `:273-279`，当前 unknown page fallback 测试断言：

```typescript
expect(config.keywords).toContain("shadcn/ui");
```

改为：

```typescript
expect(config.keywords).toContain("B2B Solution");
```

- [ ] **Step 2: 加新断言确认禁入词不存在**

在同一 describe 块加：

```typescript
it("does not include developer-stack keywords in any page type", () => {
  const banned = ["shadcn/ui", "Radix UI", "Tailwind CSS", "TypeScript", "Next.js"];
  const pageTypes: PageType[] = ["home", "about", "contact", "blog", "products", "privacy", "terms", "bendingMachines", "oem"];
  for (const pt of pageTypes) {
    const config = createPageSEOConfig(pt);
    const flat = (config.keywords ?? []).join(",");
    for (const term of banned) {
      expect(flat).not.toContain(term);
    }
  }
});
```

- [ ] **Step 3: 跑测试确认失败**

```bash
pnpm test src/lib/__tests__/seo-metadata.test.ts
```

预期：FAIL（home config 仍含 shadcn/ui）。

- [ ] **Step 4: 删除 seo-metadata.ts 中的 developer-stack 关键词**

读 `src/lib/seo-metadata.ts:254-261`：

```typescript
home: {
  type: "website" as const,
  keywords: [
    ...SITE_CONFIG.seo.keywords,
    "shadcn/ui",
    "Radix UI",
    "Modern Web",
    "Enterprise Platform",
    "B2B Solution",
  ],
  image: "/images/og-image.jpg",
},
```

删除 `"shadcn/ui"`、`"Radix UI"`、`"Modern Web"`、`"Enterprise Platform"`。保留 `"B2B Solution"` 和 spread `...SITE_CONFIG.seo.keywords`。

- [ ] **Step 5: 跑测试确认通过**

```bash
pnpm test src/lib/__tests__/seo-metadata.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/seo-metadata.ts src/lib/__tests__/seo-metadata.test.ts
git commit -m "$(cat <<'EOF'
fix(seo): remove developer-stack keywords from page metadata

shadcn/ui, Radix UI, Modern Web, Enterprise Platform are implementation
details with no SEO value for a PVC pipe manufacturer. Updated existing
test assertions that expected these keywords.
EOF
)"
```

---

## Task 5: 立 brandAssets canonical config

**Files:**
- Modify: `src/config/site-types.ts:86-92`（SiteFacts 加 brandAssets）
- Modify: `src/config/single-site.ts`（SINGLE_SITE_DEFINITION.facts 加 brandAssets 段）
- Modify: `src/components/layout/logo.tsx:66-67`（引用 brandAssets）
- Modify: `src/lib/structured-data-generators.ts:15, 101, 183-186`（DEFAULT_LOGO_PATH 改走 config）
- Modify: `src/components/layout/__tests__/logo.test.tsx:175`（更新 src 断言）
- Modify: `src/lib/__tests__/structured-data.test.ts:159, 231, 689`（更新 logo URL 断言）

**Why:** logo / og image / favicon 没有 canonical owner 是占位资产泛滥的源头。先建 config 定义点，Task 8 再实际替换文件。

- [ ] **Step 1: 在 site-types.ts 加 BrandAssets interface**

读 `src/config/site-types.ts:86-92`：

```typescript
export interface SiteFacts {
  company: CompanyInfo;
  contact: ContactInfo;
  certifications: Certification[];
  stats: BusinessStats;
  social: SocialLinks;
}
```

加 brandAssets 字段：

```typescript
export interface BrandAssets {
  logo: {
    horizontal: string;
    horizontalPng: string;
    square: string;
    width: number;
    height: number;
  };
  ogImage: string;
  favicon: string;
}

export interface SiteFacts {
  company: CompanyInfo;
  contact: ContactInfo;
  certifications: Certification[];
  stats: BusinessStats;
  social: SocialLinks;
  brandAssets: BrandAssets;
}
```

- [ ] **Step 2: 在 single-site.ts 的 facts 中填 brandAssets 值**

在 `src/config/single-site.ts` 的 `facts: { ... }` 末尾（`:129` 后）加：

```typescript
brandAssets: {
  logo: {
    horizontal: "/images/logo.svg",
    horizontalPng: "/images/logo.png",
    square: "/images/logo-square.svg",
    width: 200,
    height: 60,
  },
  ogImage: "/images/og-image.jpg",
  favicon: "/favicon.ico",
},
```

注：路径在 Task 8 之前指向不存在的文件。build 不会挂（都是字符串，非 next/image import），但 dev smoke 会看到 broken image。

- [ ] **Step 3: 改 logo.tsx 引用 brandAssets**

读 `src/components/layout/logo.tsx:10, 66-69`：

```typescript
import { SITE_CONFIG } from "@/config/paths/site-config";
// ...
src="/next.svg"
width={COUNT_120}
height={HOURS_PER_DAY}
```

加 import 并替换：

```typescript
import { SINGLE_SITE_FACTS } from "@/config/single-site";
// ...
src={SINGLE_SITE_FACTS.brandAssets.logo.horizontal}
width={SINGLE_SITE_FACTS.brandAssets.logo.width}
height={SINGLE_SITE_FACTS.brandAssets.logo.height}
```

可删除 `COUNT_120` 和 `HOURS_PER_DAY` import（如无其他引用）。

- [ ] **Step 4: 改 structured-data-generators.ts 引用 brandAssets**

读 `src/lib/structured-data-generators.ts:15`：

```typescript
const DEFAULT_LOGO_PATH = "/next.svg";
```

替换为：

```typescript
import { SINGLE_SITE_FACTS } from "@/config/single-site";
const DEFAULT_LOGO_PATH = SINGLE_SITE_FACTS.brandAssets.logo.horizontal;
```

- [ ] **Step 5: 更新 logo.test.tsx 断言**

读 `src/components/layout/__tests__/logo.test.tsx:175`：

```typescript
expect(image).toHaveAttribute("src", "/next.svg");
```

改为：

```typescript
expect(image).toHaveAttribute("src", "/images/logo.svg");
```

- [ ] **Step 6: 更新 structured-data.test.ts 中的 logo URL 断言**

读 `:159`、`:231`、`:689`，所有 `"https://example.com/next.svg"` 替换为 `"https://example.com/images/logo.svg"`。

- [ ] **Step 7: 跑 type-check + lint + test**

```bash
pnpm type-check && pnpm lint:check && pnpm test
```

- [ ] **Step 8: Commit**

```bash
git add src/config/site-types.ts src/config/single-site.ts src/components/layout/logo.tsx src/lib/structured-data-generators.ts src/components/layout/__tests__/logo.test.tsx src/lib/__tests__/structured-data.test.ts
git commit -m "$(cat <<'EOF'
refactor(brand): add brandAssets canonical config to SiteFacts

Establishes single source of truth for logo / og-image / favicon paths.
Header Logo component, JSON-LD generators all read from
SINGLE_SITE_FACTS.brandAssets. Actual asset files replaced in Task 8.
EOF
)"
```

---

## Task 6: Sitemap fallback 改 fail-loud

**Files:**
- Modify: `src/lib/sitemap-utils.ts:31-64, 96-107`
- Modify: `src/lib/__tests__/sitemap-utils.test.ts`

**Why:** `getContentLastModified` 和 `getStaticPageLastModified` 在缺 metadata 时 fallback 到 `new Date()`，给搜索引擎假新鲜度。

- [ ] **Step 1: 写失败测试**

在 `src/lib/__tests__/sitemap-utils.test.ts` 的 `getContentLastModified` describe 块中加：

```typescript
it("does not silently fall back to today's date when all sources missing", () => {
  vi.useFakeTimers();
  const fakeNow = new Date("2026-04-26T00:00:00Z");
  vi.setSystemTime(fakeNow);

  const result = getContentLastModified({});
  expect(result.toISOString()).not.toBe(fakeNow.toISOString());

  vi.useRealTimers();
});
```

在 `getStaticPageLastModified` describe 块（如不存在则新建）中加：

```typescript
it("does not silently fall back to today's date for unconfigured paths", () => {
  vi.useFakeTimers();
  const fakeNow = new Date("2026-04-26T00:00:00Z");
  vi.setSystemTime(fakeNow);

  const result = getStaticPageLastModified("/unknown");
  expect(result.toISOString()).not.toBe(fakeNow.toISOString());

  vi.useRealTimers();
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
pnpm test src/lib/__tests__/sitemap-utils.test.ts
```

预期：FAIL（当前两个函数都 fallback 到 `new Date()`）。

- [ ] **Step 3: 改 fallback 为 logger.warn + 保守固定日**

在 `src/lib/sitemap-utils.ts` 顶部加：

```typescript
import { logger } from "@/lib/logger";

const SITEMAP_FALLBACK_LASTMOD = new Date("2026-01-01T00:00:00Z");
```

将 `getContentLastModified` 的 `:63`：
```typescript
return new Date();
```
改为：
```typescript
logger.warn("sitemap lastmod: no metadata or file mtime, using conservative fallback");
return SITEMAP_FALLBACK_LASTMOD;
```

将 `getStaticPageLastModified` 的 `:106`：
```typescript
return new Date();
```
改为：
```typescript
logger.warn("sitemap lastmod: unconfigured static page, using conservative fallback", { path });
return SITEMAP_FALLBACK_LASTMOD;
```

- [ ] **Step 4: 跑测试确认通过**

```bash
pnpm test src/lib/__tests__/sitemap-utils.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/sitemap-utils.ts src/lib/__tests__/sitemap-utils.test.ts
git commit -m "$(cat <<'EOF'
fix(sitemap): replace silent new Date() fallback with conservative fixed date

Falling back to today gives search engines fake freshness signals when
content timestamps are missing. Now logs a warning and returns a fixed
conservative date (2026-01-01).
EOF
)"
```

---

## Task 7: 静态页 sitemap lastmod 更新

**Files:**
- Modify: `src/config/single-site-seo.ts:55-66`

- [ ] **Step 1: 读当前静态 lastmod 列表**

读 `src/config/single-site-seo.ts:55-66`：

```typescript
export const SINGLE_SITE_STATIC_PAGE_LASTMOD = {
  "": "2024-12-01T00:00:00Z",
  "/products": "2024-11-01T00:00:00Z",
  "/blog": "2024-11-01T00:00:00Z",
  "/products/north-america": "2024-11-01T00:00:00Z",
  // ...
} as const satisfies Record<string, string>;
```

- [ ] **Step 2: 替换为 2026 实际复审日**

将所有 `2024-*` 日期替换为 `"2026-04-26T00:00:00Z"`。

- [ ] **Step 3: 跑 type-check**

```bash
pnpm type-check
```

- [ ] **Step 4: Commit**

```bash
git add src/config/single-site-seo.ts
git commit -m "fix(sitemap): refresh static page lastmod from 2024 to 2026-04-26"
```

---

## Task 8: B1 — 替换占位 logo（依赖业务方资产）

**Files:**
- Create: `public/images/logo.svg`、`public/images/logo.png`、`public/images/logo-square.svg`
- Archive (Trash): `public/next.svg`
- Read-only: `src/components/layout/logo.tsx`、`src/lib/structured-data-generators.ts`（Task 5 已经改完引用）

**Blocked on:** 业务方交付品牌 logo 文件。

- [ ] **Step 1: 确认业务方已交付 logo**

如未交付，**任务暂停**。

- [ ] **Step 2: 复制文件到 public/images/**

```bash
cp /path/to/delivered/logo.svg public/images/logo.svg
cp /path/to/delivered/logo.png public/images/logo.png
cp /path/to/delivered/logo-square.svg public/images/logo-square.svg
```

- [ ] **Step 3: 归档 /next.svg + git stage 删除**

```bash
mkdir -p ~/.Trash/tianze-website-archive-$(date +%Y%m%d)
mv public/next.svg ~/.Trash/tianze-website-archive-$(date +%Y%m%d)/
git rm --cached public/next.svg
```

- [ ] **Step 4: 启 dev server 验证 header logo 显示**

```bash
pnpm dev
```

打开 `http://localhost:3000/en` 与 `http://localhost:3000/zh`，确认 header 显示真实 logo。

- [ ] **Step 5: 跑测试**

```bash
pnpm test
```

- [ ] **Step 6: Commit**

```bash
git add public/images/logo.svg public/images/logo.png public/images/logo-square.svg
git commit -m "$(cat <<'EOF'
feat(brand): replace /next.svg starter logo with real Tianze brand asset (B1)

Header logo, JSON-LD Organization.logo, and Article schema all resolve
to brand asset via SINGLE_SITE_FACTS.brandAssets (Task 5 wiring).
Archived old /next.svg to Trash.
EOF
)"
```

---

## Task 9: B3 — 添加 ISO 9001 证书 PDF（依赖业务方）

**Files:**
- Create: `public/certs/iso9001.pdf`

**Blocked on:** 业务方交付 ISO 9001:2015 证书 PDF 扫描件。

- [ ] **Step 1: 业务方交付的 PDF 放置到 public/certs/**

```bash
mkdir -p public/certs
cp /path/to/delivered/iso9001.pdf public/certs/iso9001.pdf
```

- [ ] **Step 2: 检查 PDF 大小与格式**

```bash
ls -la public/certs/iso9001.pdf
file public/certs/iso9001.pdf
```

预期：< 5MB，PDF 格式有效。

- [ ] **Step 3: 启 dev server 验证下载链接 200**

```bash
pnpm dev &
sleep 3
curl -I http://localhost:3000/certs/iso9001.pdf
```

预期：`HTTP/1.1 200 OK`，`content-type: application/pdf`。

- [ ] **Step 4: Commit**

```bash
git add public/certs/iso9001.pdf
git commit -m "$(cat <<'EOF'
feat(content): add ISO 9001:2015 certificate PDF (B3)

Resolves buyer-trust gap where about.mdx claims certification but the
PDF download path returned 404. Certificate number matches single-site.ts.
EOF
)"
```

---

## Task 10: B8 — 替换 Hero 占位视觉（依赖业务方）

**Files:**
- Modify: `src/components/sections/hero-section.tsx:23-31`（HeroVisual 函数）
- Create: `public/images/hero/*.webp`

**Blocked on:** 业务方交付 3 张工厂/产品/设备真实图。

- [ ] **Step 1: 读当前 HeroVisual 结构**

`src/components/sections/hero-section.tsx:23-31`：

```tsx
function HeroVisual() {
  return (
    <div className="hero-stagger-6 grid grid-cols-2 grid-rows-[180px_160px] gap-3">
      <div className="col-span-2 rounded-lg bg-card shadow-border" />
      <div className="rounded-lg bg-card shadow-border" />
      <div className="rounded-lg bg-card shadow-border" />
    </div>
  );
}
```

- [ ] **Step 2: 复制业务方交付的 3 张图**

```bash
mkdir -p public/images/hero
cp /path/to/bending-machine.webp public/images/hero/bending-machine.webp
cp /path/to/expander.webp public/images/hero/expander.webp
cp /path/to/production-line.webp public/images/hero/production-line.webp
```

- [ ] **Step 3: 改 HeroVisual 用 next/image 渲染**

```tsx
import Image from "next/image";

function HeroVisual() {
  return (
    <div className="hero-stagger-6 grid grid-cols-2 grid-rows-[180px_160px] gap-3">
      <div className="col-span-2 overflow-hidden rounded-lg shadow-border">
        <Image
          src="/images/hero/bending-machine.webp"
          alt="Tianze bending machine production line"
          width={600}
          height={340}
          priority
          className="h-full w-full object-cover"
        />
      </div>
      <div className="overflow-hidden rounded-lg shadow-border">
        <Image
          src="/images/hero/expander.webp"
          alt="PVC pipe expander equipment"
          width={300}
          height={160}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="overflow-hidden rounded-lg shadow-border">
        <Image
          src="/images/hero/production-line.webp"
          alt="Tianze pipe production line"
          width={300}
          height={160}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 启 dev 验证 hero 渲染**

```bash
pnpm dev
```

打开 `/en` 与 `/zh`，确认 hero 区显示 3 张真实图。

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/hero-section.tsx public/images/hero/bending-machine.webp public/images/hero/expander.webp public/images/hero/production-line.webp
git commit -m "$(cat <<'EOF'
feat(hero): replace placeholder div hero with real factory imagery (B8)

LCP region now carries actual manufacturing visuals. Old placeholder
empty divs removed.
EOF
)"
```

---

## Task 11: B2 — 替换占位电话（依赖业务方）

**Files:**
- Modify: `src/config/single-site.ts:51`
- Modify: `content/pages/en/terms.mdx`
- Modify: `content/pages/zh/terms.mdx`

**Blocked on:** 业务方提供真实联系电话（E.164 格式）。

- [ ] **Step 1: 替换 single-site.ts 中的占位电话**

读 `src/config/single-site.ts:50-51`：

```typescript
const contact = {
  phone: "+86-518-0000-0000",
```

替换为业务方提供的真实电话。

- [ ] **Step 2: 替换 Terms en + zh**

读 `content/pages/en/terms.mdx` 和 `content/pages/zh/terms.mdx` 中所有 `+86-518-0000-0000`，替换为真实电话。

- [ ] **Step 3: grep 确认无残留 0000-0000**

```bash
grep -rn "0000-0000" content/ src/ 2>&1
```

预期：无任何匹配。

- [ ] **Step 4: 刷新 content manifest + 启 dev 验证**

```bash
pnpm content:manifest
pnpm dev
```

逐页打开 `/en/contact`、`/zh/contact`、`/en/terms`、`/zh/terms`、footer，确认真实电话。

- [ ] **Step 5: Commit**

```bash
git add src/config/single-site.ts content/pages/en/terms.mdx content/pages/zh/terms.mdx
git commit -m "$(cat <<'EOF'
fix(content): replace placeholder phone +86-518-0000-0000 with real contact (B2)
EOF
)"
```

---

## Task 12: B4 — 重写 Privacy 政策（依赖业务方）

**Files:**
- Modify: `content/pages/en/privacy.mdx`（全文重写）
- Modify: `content/pages/zh/privacy.mdx`（全文重写）

**Blocked on:** 业务方提供 Privacy 政策草稿（en + zh）。

**本站实际收集面**（按代码事实）：
1. Contact form：firstName / lastName / email / company / message / subject / locale
2. Newsletter：email / locale / marketingConsent
3. Product inquiry：productSlug / productName / quantity / requirements / company / email
4. Attribution / UTM：utm_* / gclid / fbclid / msclkid / landingPage / referrer（consent 后写入）
5. Cookie：necessary + analytics（consent 后启用）
6. Server logs：IP（Cloudflare）、user-agent、CSP report

- [ ] **Step 1: 业务方交付草稿后，重写 en 版本**

替换 `content/pages/en/privacy.mdx` 全部正文（保留 frontmatter）。

- [ ] **Step 2: 重写 zh 版本**

同样替换 `content/pages/zh/privacy.mdx` 全部正文。

- [ ] **Step 3: 刷新 content manifest + 启 dev 验证**

```bash
pnpm content:manifest
pnpm dev
```

打开 `/en/privacy` 与 `/zh/privacy`，确认无 account/password/chat 模板段落、TOC 自动生成、无 MDX 解析错误。

- [ ] **Step 4: Commit**

```bash
git add content/pages/en/privacy.mdx content/pages/zh/privacy.mdx
git commit -m "$(cat <<'EOF'
fix(content): rewrite Privacy policy to match actual data collection (B4)

Replaces template-derived copy that claimed account/password/chat data
collection with policy aligned to real surfaces: contact form, newsletter,
product inquiry, attribution, cookies, server logs.
EOF
)"
```

---

## Task 13: B5 — 标准声明降级（全站范围）

**Files:**
- Modify: `content/pages/en/about.mdx:40, 62, 119`
- Modify: `content/pages/zh/about.mdx` 对应位置
- Modify: `content/pages/en/oem-custom-manufacturing.mdx:25`
- Modify: `content/pages/zh/oem-custom-manufacturing.mdx` 对应位置
- Modify: `messages/en.json`（`:179, 296-299, 515` 等标准声明处）
- Modify: `messages/zh.json` 对应位置

**Why:** 标准合规声明散落在 about / OEM / messages 的多个位置。只改 about 页会导致其他 buyer-facing 页面继续对外说"符合 ASTM/AS/NZS/IEC/NOM"。

- [ ] **Step 1: grep 全库标准声明位置**

```bash
grep -rn "AS/NZS\|ASTM\|IEC 61386\|NOM-001\|NOM Compliant\|NOM Series" content/pages/ messages/ src/config/ 2>&1
```

记录所有命中位置，逐一分类：
- **产品目录描述**（messages 中的 product family/market descriptions）→ 这些是**产品规格说明**，如果产品确实按该标准制造则可保留，但措辞从 "compliant" 改为 "manufactured to ... specifications"
- **about/OEM 公司声明** → 按业务方确认降级
- **标准标签/名称** → 保留（标准名本身不是合规声明）

- [ ] **Step 2: 与业务方确认有 proof 的标准**

按业务方回复分 (A) 全有 / (B) 部分 / (C) 全无 三情况处理。

- [ ] **Step 3: 降级 about.mdx en/zh**

读 `content/pages/en/about.mdx:62`：
```
"Our products comply with international standards including AS/NZS 2053,
ASTM D1785, IEC 61386, and NOM."
```

替换为（(C) 情况下）：
```
"Our products are designed and manufactured to international standard
specifications. Specific compliance documentation is available on request
during RFQ review."
```

- [ ] **Step 4: 降级 oem-custom-manufacturing.mdx en/zh**

读 `content/pages/en/oem-custom-manufacturing.mdx:25`：
```
"We manufacture to AS/NZS 2053, ASTM D1785, IEC 61386, NOM, and other regional standards."
```

替换为：
```
"We manufacture to major international standard specifications including regional
electrical conduit standards. Detailed compliance documentation available during
RFQ review."
```

- [ ] **Step 5: 调整 messages 中的产品描述措辞**

`messages/en.json:515` 等位置的 "Products meet ASTM, UL651, AS/NZS, and GB standards" → 改为 "Products manufactured to ASTM, UL651, AS/NZS, and GB specifications"。

产品 family 描述（`:1005, 1009, 1013, 1017` 等）的 "compliant with" / "manufactured to" → 统一改为 "manufactured to ... specifications"。

同步改 `messages/zh.json` 对应位置。

- [ ] **Step 6: 刷新 content manifest + 启 dev 验证**

```bash
pnpm content:manifest
pnpm dev
```

- [ ] **Step 7: Commit**

```bash
git add content/pages/en/about.mdx content/pages/zh/about.mdx content/pages/en/oem-custom-manufacturing.mdx content/pages/zh/oem-custom-manufacturing.mdx messages/en.json messages/zh.json
git commit -m "$(cat <<'EOF'
fix(content): downgrade unverified standard claims site-wide (B5)

Adjusts compliance language across about, OEM, and product catalog from
"comply with" / "compliant" to "manufactured to ... specifications" with
documentation available on request. Keeps ISO 9001:2015 (proof in
public/certs/iso9001.pdf).
EOF
)"
```

---

## Task 14: 更新 Privacy / Terms 的 updatedAt 与 lastReviewed

**Files:**
- Modify: `content/pages/{en,zh}/privacy.mdx`（frontmatter）
- Modify: `content/pages/{en,zh}/terms.mdx`（frontmatter）

- [ ] **Step 1: 改四个文件的 updatedAt + lastReviewed**

将 frontmatter 中的：
```yaml
updatedAt: 2024-04-01
lastReviewed: 2024-04-01
```

替换为：
```yaml
updatedAt: 2026-04-26
lastReviewed: 2026-04-26
```

- [ ] **Step 2: 刷新 content manifest + 验证 sitemap**

```bash
pnpm content:manifest
pnpm build
```

检查 sitemap 输出中 /en/privacy 与 /en/terms 的 lastmod 已更新。

- [ ] **Step 3: Commit**

```bash
git add content/pages/en/privacy.mdx content/pages/zh/privacy.mdx content/pages/en/terms.mdx content/pages/zh/terms.mdx
git commit -m "chore(content): refresh Privacy / Terms updatedAt + lastReviewed to 2026-04-26"
```

---

## Task 15: B11 — 主导航重排，Privacy 移到 footer

**Files:**
- Modify: `src/config/single-site.ts:133-147`（navigation.main 数组）

- [ ] **Step 1: 重排 navigation.main 数组**

读 `src/config/single-site.ts:133-147`，当前顺序：

```typescript
navigation: {
  main: [
    { key: "home", href: "/", ... },
    { key: "products", href: "/products", ... },
    { key: "blog", href: "/blog", ... },
    { key: "about", href: "/about", ... },
    { key: "privacy", href: "/privacy", ... },
  ],
},
```

新顺序（B2B 转化路径优先）：

```typescript
navigation: {
  main: [
    { key: "home", href: "/", translationKey: "navigation.home" },
    { key: "products", href: "/products", translationKey: "navigation.products" },
    { key: "oem", href: "/oem-custom-manufacturing", translationKey: "navigation.oem" },
    { key: "about", href: "/about", translationKey: "navigation.about" },
    { key: "contact", href: "/contact", translationKey: "navigation.contact" },
  ],
},
```

删除 `blog`（Task 17 会删路由）和 `privacy`（已在 footer support 区）。

- [ ] **Step 2: 确认 footer 已有 Privacy/Terms**

读 `src/config/single-site.ts:192-211`，已有 support 区含 privacy 和 terms 链接——无需额外添加。

- [ ] **Step 3: 确保 oem 和 contact 有 nav 翻译 key**

```bash
grep -n "navigation.oem\|navigation.contact" messages/en.json messages/zh.json 2>&1
```

如无，在 messages 中加 `"navigation.oem": "OEM"` / `"navigation.contact": "Contact"` 等。

- [ ] **Step 4: 启 dev 验证**

```bash
pnpm dev
```

确认 header navigation 顺序：Products / OEM / About / Contact。Privacy 不在 header。

- [ ] **Step 5: 跑测试**

```bash
pnpm test
```

- [ ] **Step 6: Commit**

```bash
git add src/config/single-site.ts messages/en.json messages/zh.json
git commit -m "$(cat <<'EOF'
fix(nav): reorder main navigation for B2B conversion path (B11)

Products > OEM > About > Contact. Privacy/Terms already in footer
support section. Blog removed (see Task 17). Adds nav translation
keys for OEM and Contact.
EOF
)"
```

---

## Task 16: Mobile nav 改 SSR fallback

**Files:**
- Modify: `src/components/layout/header-client.tsx:1-12`
- Modify: `src/components/layout/mobile-navigation.tsx`
- Create: `src/components/layout/mobile-navigation-interactive.tsx`

**Why:** 当前 `ssr:false` dynamic import → 无 JS 用户和爬虫看到空壳。

**注意:** 现有 12 个 mobile-navigation 测试文件。拆文件后需逐一确认 import 路径和 mock 边界是否匹配。

- [ ] **Step 1: 读当前 header-client.tsx 的 dynamic import**

`src/components/layout/header-client.tsx:6-12`：

```typescript
const MobileNavigation = dynamic(
  () =>
    import("@/components/layout/mobile-navigation").then(
      (m) => m.MobileNavigation,
    ),
  { ssr: false },
);
```

- [ ] **Step 2: 把 mobile-navigation.tsx 拆为 server shell**

保留 `mobile-navigation.tsx` 作为 server component，导出 `MobileNavigationLinks`——纯 `<nav>` + `<ul>` + `<a>` 列表，无 disclosure 交互。移除 `"use client"` 指令。

原有的 disclosure/drawer 交互逻辑移到 `mobile-navigation-interactive.tsx`（保留 `"use client"`）。

- [ ] **Step 3: 改 header-client.tsx**

```typescript
import { MobileNavigationLinks } from "./mobile-navigation";
const MobileNavigationInteractive = dynamic(
  () => import("./mobile-navigation-interactive").then((m) => m.MobileNavigationInteractive),
  { ssr: false },
);

// JSX:
<MobileNavigationInteractive>
  <MobileNavigationLinks />
</MobileNavigationInteractive>
```

- [ ] **Step 4: 逐一更新 12 个 mobile-navigation 测试文件**

```bash
find src/components/layout/__tests__ -name "mobile-navigation*" -exec grep -l "MobileNavigation" {} \;
```

对每个文件：确认 import 路径和 mock 目标是否需要更新（从 `mobile-navigation` 变为 `mobile-navigation-interactive`）。

- [ ] **Step 5: 用 NoScript 验证 SSR fallback**

```bash
pnpm dev
```

浏览器 disable JavaScript，移动尺寸下确认能看到 nav 链接列表。

- [ ] **Step 6: 重启 JS 验证交互正常**

汉堡按钮 → 抽屉打开 → 链接可点。

- [ ] **Step 7: 跑全量测试**

```bash
pnpm test
```

- [ ] **Step 8: Commit**

```bash
git add src/components/layout/header-client.tsx src/components/layout/mobile-navigation.tsx src/components/layout/mobile-navigation-interactive.tsx src/components/layout/__tests__/
git commit -m "$(cat <<'EOF'
fix(nav): server-render mobile navigation list, lift ssr:false to interactive layer

Mobile menu was an empty shell for non-JS users and crawlers.
Server now emits a minimal accessible link list; disclosure/drawer
interactivity stays client-only. Updated 12 test files for new
module boundary.
EOF
)"
```

---

## Task 17: B6 — Blog 路由下线（完整方案）

**Files:**
- Archive (Trash): `src/app/[locale]/blog/`、`content/posts/`
- Modify: `src/config/paths/types.ts:19`（从 PageType 删 `"blog"`，注意不是 DynamicPageType）
- Modify: `src/config/paths/paths-config.ts:31-33`（删 blog 路径）
- Modify: `src/config/paths/paths-config.ts:65-66`（删 blogDetail 动态路由）
- Modify: `src/lib/i18n/route-parsing.ts:46-48`（删 blogDetail pattern）
- Modify: `src/app/sitemap.ts:3, 103-170`（删 blog URL 生成 + getAllPostsCached import）
- Modify: `src/config/single-site-seo.ts:35, 46, 60`（删 blog sitemap config 和 lastmod）
- Modify: `src/lib/seo-metadata.ts:272-275`（删 blog page type config）

**Decision:** 按默认建议 (b) 删除 /blog 路由。

- [ ] **Step 1: 归档 blog 路由目录和 content/posts/**

```bash
TS=$(date +%Y%m%d)
mkdir -p ~/.Trash/tianze-website-archive-$TS
mv src/app/\[locale\]/blog/ ~/.Trash/tianze-website-archive-$TS/blog-route/
mv content/posts/ ~/.Trash/tianze-website-archive-$TS/blog-posts/
```

- [ ] **Step 2: 从 PageType 删 blog（不是 DynamicPageType）**

读 `src/config/paths/types.ts:15-24`：

```typescript
export type PageType =
  | "home"
  | "about"
  | "contact"
  | "blog"
  | "products"
  // ...
```

删除 `| "blog"` 行。

同时在 `:27` 检查 `DynamicPageType`——`blogDetail` 也要删。

- [ ] **Step 3: 从 paths-config.ts 删 blog 路径和 blogDetail**

删除 `:31-33` 的 `blog` 段和 `:65-66` 的 `blogDetail` 段。

- [ ] **Step 4: 从 route-parsing.ts 删 blogDetail pattern**

删除 `:46-48` 的 `blogDetail` 分支。

- [ ] **Step 5: 从 sitemap.ts 删 blog URL 生成**

删除 `import { getAllPostsCached }` 和所有 blog post sitemap 生成逻辑。

- [ ] **Step 6: 从 single-site-seo.ts 删 blog 配置**

删除 `SINGLE_SITE_SITEMAP_PAGE_CONFIG` 中的 `"/blog"` 和 `blogPost` 条目。删除 `SINGLE_SITE_STATIC_PAGE_LASTMOD` 中的 `"/blog"` 条目。

- [ ] **Step 7: 从 seo-metadata.ts 删 blog page type config**

删除 `createPageSEOConfig` 中的 `blog: { ... }` 段。

- [ ] **Step 8: grep 残留引用**

```bash
grep -rn "\"blog\"\|'/blog\|/blog\|getAllPosts\|blogDetail" src/ content/ messages/ 2>&1 | grep -v node_modules | grep -v __tests__ | grep -v .Trash
```

对每个命中，判断是否需要删除或留（如 messages 中的 navigation.blog key 随 Task 15 已无引用则删）。

- [ ] **Step 9: 跑 type-check 抓 dangling import**

```bash
pnpm type-check
```

修所有编译错误。

- [ ] **Step 10: 跑 lint + test**

```bash
pnpm lint:check && pnpm test
```

测试中引用 blog 的需更新或删除。

- [ ] **Step 11: 验证 /blog 404**

```bash
pnpm dev &
sleep 3
curl -I http://localhost:3000/en/blog
```

预期：404。

- [ ] **Step 12: Commit（显式文件列表，不用 git add -A）**

```bash
git add src/config/paths/types.ts src/config/paths/paths-config.ts src/lib/i18n/route-parsing.ts src/app/sitemap.ts src/config/single-site-seo.ts src/lib/seo-metadata.ts
git rm -r src/app/\[locale\]/blog/ content/posts/
git add messages/en.json messages/zh.json
git commit -m "$(cat <<'EOF'
chore(blog): remove /blog route until content library is ready (B10)

Single welcome.mdx placeholder eroded professional credibility.
Following route deletion SOP: removed route, paths config, i18n
routing, sitemap, navigation, SEO config, and blog content.
Archived blog/ and posts/ to Trash for future restoration.
EOF
)"
```

---

## Task 18: SEC-01 — CSP hash 刷新

**Files:**
- Modify: `src/config/security.ts:29-42`（CSP_INLINE_SCRIPT_SHA256_BASE64_ALLOWLIST）

**Why:** `pnpm security:csp:check` 失败，allowlist 中缺 8 条 inline script hash。当前架构已用 nonce + hash 混合模式（layout 注释说明了不能纯 nonce 因为 Cache Components 静态生成限制）。所以修复方向是**刷新 hash allowlist**，不是改架构到纯 nonce。

- [ ] **Step 1: 跑 CSP check 拿到缺失 hash 列表**

```bash
pnpm security:csp:check 2>&1 | tee /tmp/csp-check-before.log
```

记录缺失的 hash 值和对应的 inline script 来源。

- [ ] **Step 2: 按 check 脚本输出更新 allowlist**

读 `src/config/security.ts:29-42`，将缺失的 hash 加入 `CSP_INLINE_SCRIPT_SHA256_BASE64_ALLOWLIST` 数组。每个 hash 加注释说明来源（如 `// JSON-LD (Organization, en)` 格式）。

同时删除已失效的旧 hash。

- [ ] **Step 3: 再跑 CSP check 验证 pass**

```bash
pnpm security:csp:check
```

预期：PASS（所有 inline script hash 已覆盖）。

- [ ] **Step 4: 浏览器 DevTools 验证无 CSP 违规**

```bash
pnpm build && pnpm start
```

打开 `/en` 与 `/zh`，DevTools Console 不应有 `[CSP]` 违规。

- [ ] **Step 5: Commit**

```bash
git add src/config/security.ts
git commit -m "$(cat <<'EOF'
fix(security): refresh CSP inline script hash allowlist (SEC-01)

pnpm security:csp:check was failing with 8 missing hashes. Updated
CSP_INLINE_SCRIPT_SHA256_BASE64_ALLOWLIST to match current inline
scripts (JSON-LD, Turbopack bootstrap, next-themes init). Architecture
stays nonce+hash hybrid per Cache Components constraint.
EOF
)"
```

---

## Task 19: SEC-02 — Semgrep 2 条 object-injection warning

**Files:**
- Modify: `src/components/forms/lazy-turnstile.tsx:47-49`
- Modify: `src/lib/security/client-ip.ts:42-53`

**Why:** `pnpm security:semgrep` 报 2 条 `object-injection-sink-computed-property` warning。

- [ ] **Step 1: 跑 Semgrep 确认当前 warning 列表**

```bash
pnpm security:semgrep 2>&1 | tee /tmp/semgrep-out.log
```

确认命中的是 `lazy-turnstile.tsx:47-49` 和 `client-ip.ts:42-53`。

- [ ] **Step 2: 读并修复 lazy-turnstile.tsx**

读 `src/components/forms/lazy-turnstile.tsx:45-52`，找到 computed property access。用显式属性访问或 Map 替代动态 key 索引。

- [ ] **Step 3: 读并修复 client-ip.ts**

读 `src/lib/security/client-ip.ts:40-55`，找到 computed property access。用显式 header 名称列表 + `headers.get()` 替代动态 key 索引。

- [ ] **Step 4: 跑 Semgrep 验证 0 warning**

```bash
pnpm security:semgrep
```

预期：clean。

- [ ] **Step 5: 跑测试**

```bash
pnpm test
```

- [ ] **Step 6: Commit**

```bash
git add src/components/forms/lazy-turnstile.tsx src/lib/security/client-ip.ts
git commit -m "$(cat <<'EOF'
fix(security): resolve 2 Semgrep object-injection warnings (SEC-02)

lazy-turnstile.tsx and client-ip.ts used computed property access that
Semgrep flagged as object-injection sinks. Replaced with explicit
property access patterns.
EOF
)"
```

---

## Task 20: Attribution 加 cookie consent gate

**Files:**
- Modify: `src/components/attribution-bootstrap.tsx:26-44`
- Modify: `src/lib/utm.ts:77-103`（storeAttributionData）

**Why:** Attribution 在 cookie consent 之前写入 sessionStorage，欧盟买家有 GDPR 风险。

**实际 API:** cookie consent 的同步读取用 `loadConsent()` from `@/lib/cookie-consent`，返回 `StoredConsent | null`，其 `categories.marketing` 是 `boolean`。

- [ ] **Step 1: 读 loadConsent 返回结构**

```bash
grep -n "loadConsent\|StoredConsent\|categories" src/lib/cookie-consent/storage.ts src/lib/cookie-consent/types.ts 2>&1 | head -20
```

- [ ] **Step 2: 在 storeAttributionData 中加 consent gate**

读 `src/lib/utm.ts:77-103`，当前 `storeAttributionData()` 直接写 sessionStorage。

改为：先检查 consent，consent 未给则暂存内存，consent 后 flush：

```typescript
import { loadConsent } from "@/lib/cookie-consent";

let pendingAttribution: AttributionData | null = null;

export function storeAttributionData(): void {
  if (typeof window === "undefined") return;

  const existing = sessionStorage.getItem(UTM_STORAGE_KEY);
  if (existing) return;

  const utmParams = captureUtmParams();
  const clickIds = captureClickIds();

  const hasData =
    Object.values(utmParams).some(Boolean) ||
    Object.values(clickIds).some(Boolean);

  if (!hasData) return;

  const data: AttributionData = {
    ...utmParams,
    ...clickIds,
    landingPage: window.location.pathname,
    capturedAt: new Date().toISOString(),
  };

  const consent = loadConsent();
  if (consent?.categories.marketing) {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(data));
  } else {
    pendingAttribution = data;
  }
}

export function flushPendingAttribution(): void {
  if (!pendingAttribution) return;
  const consent = loadConsent();
  if (consent?.categories.marketing) {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(pendingAttribution));
    pendingAttribution = null;
  }
}
```

- [ ] **Step 3: 在 consent change 时调 flush**

在 `attribution-bootstrap.tsx` 或 consent banner 的 accept 回调中加 `flushPendingAttribution()` 调用。

- [ ] **Step 4: 写测试**

```typescript
import { loadConsent } from "@/lib/cookie-consent";

vi.mock("@/lib/cookie-consent", () => ({
  loadConsent: vi.fn(),
}));

it("does not write attribution to sessionStorage before marketing consent", () => {
  vi.mocked(loadConsent).mockReturnValue(null);
  storeAttributionData();
  expect(sessionStorage.getItem("marketing_attribution")).toBeNull();
});

it("flushes pending attribution after consent is given", () => {
  vi.mocked(loadConsent).mockReturnValueOnce(null);
  storeAttributionData();
  expect(sessionStorage.getItem("marketing_attribution")).toBeNull();

  vi.mocked(loadConsent).mockReturnValueOnce({
    version: 1,
    timestamp: Date.now(),
    categories: { necessary: true, analytics: true, marketing: true },
  });
  flushPendingAttribution();
  expect(sessionStorage.getItem("marketing_attribution")).not.toBeNull();
});
```

- [ ] **Step 5: 跑测试**

```bash
pnpm test utm
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/utm.ts src/components/attribution-bootstrap.tsx src/lib/__tests__/utm.test.ts
git commit -m "$(cat <<'EOF'
fix(privacy): gate attribution storage behind marketing cookie consent

Attribution data (UTM, gclid, referrer) was written to sessionStorage
before cookie consent. Now blocked until loadConsent().categories.marketing
is true; pending attributions buffered in memory and flushed post-consent.
EOF
)"
```

---

## Task 21: UTM sanitizer 放宽常规广告 campaign 名

**Files:**
- Modify: `src/lib/utm.ts:30-35`（`sanitizeParam` 函数）
- Modify: `src/lib/__tests__/utm.test.ts`

**Why:** 当前 `sanitizeParam` 白名单是 `[a-zA-Z0-9_-]` only，把 `pvc conduit`、`brand+search`、`google/cpc` 等正常广告 campaign 名误拒。

- [ ] **Step 1: 写失败测试**

在 `src/lib/__tests__/utm.test.ts`（如不存在则创建）中加：

因为 `sanitizeParam` 是私有函数，需通过公开的 `captureUtmParams` 间接测试：

```typescript
it.each([
  "pvc-conduit",        // hyphen (already works)
  "brand_search",       // underscore (already works)
  "pvc conduit",        // space
  "brand+search",       // plus
  "google/cpc",         // slash
  "spring-2026",        // hyphen + number
])("preserves normal ad campaign name '%s' via utm_campaign", (campaign) => {
  Object.defineProperty(window, "location", {
    value: { search: `?utm_campaign=${encodeURIComponent(campaign)}` },
    writable: true,
  });
  const result = captureUtmParams();
  expect(result.utmCampaign).toBe(campaign);
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
pnpm test src/lib/__tests__/utm.test.ts
```

预期：space / plus / slash 三个 case FAIL。

- [ ] **Step 3: 放宽 sanitizeParam 白名单**

读 `src/lib/utm.ts:30-35`：

```typescript
function sanitizeParam(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().slice(0, 256);
  return /^[a-zA-Z0-9_-]+$/.test(trimmed) ? trimmed : undefined;
}
```

改为：

```typescript
function sanitizeParam(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().slice(0, 256);
  if (trimmed.length === 0) return undefined;
  // Allow printable ASCII minus dangerous characters: < > " ' \ `
  return /^[^\x00-\x1f<>"'\\`]+$/.test(trimmed) ? trimmed : undefined;
}
```

- [ ] **Step 4: 跑测试确认通过**

```bash
pnpm test src/lib/__tests__/utm.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/utm.ts src/lib/__tests__/utm.test.ts
git commit -m "$(cat <<'EOF'
fix(attribution): allow space, plus, slash in UTM values

Normal Google Ads campaign names ('brand+search', 'pvc conduit',
'google/cpc') were stripped by the alphanumeric-only sanitizer.
Whitelist relaxed to printable ASCII minus quotes and angle brackets;
length cap retained.
EOF
)"
```

---

## Task 22: Wave 1 收尾验证

**Files:** 无修改，仅验证。

- [ ] **Step 1: 跑全量 CI**

```bash
pnpm ci:local 2>&1 | tee /tmp/wave1-final-ci.log
```

预期：type-check / lint / test / build 全部通过。

- [ ] **Step 2: 跑 audit 并与基线对比**

```bash
pnpm audit 2>&1 | tee /tmp/wave1-final-audit.log
diff /tmp/wave1-baseline-audit.log /tmp/wave1-final-audit.log
```

预期：react-server-dom-* 和 @react-email/preview-server>next 的 High 已消失。总数下降但不清零。

- [ ] **Step 3: 跑安全检查**

```bash
pnpm security:csp:check
pnpm security:semgrep
```

预期：均 pass。

- [ ] **Step 4: 跑 Cloudflare 构建**

```bash
pnpm build:cf
```

- [ ] **Step 5: 启 production server 做手动 smoke**

```bash
pnpm build && pnpm start
```

逐项确认：
- `/en` 与 `/zh`：header logo 是真实 brand，不是 next.svg
- Hero 区显示 3 张工厂图，不是空 div
- 主导航顺序：Products / OEM / About / Contact，**无 Privacy、无 Blog**
- footer social 无 GitHub，有 Twitter + LinkedIn
- 移动尺寸汉堡菜单可打开，禁用 JS 后仍能看到链接列表
- `/en/about` 标准声明已降级、ISO 9001 链接 200
- `/en/privacy` 无 account/password/chat 模板段落
- `/en/terms` 电话是真实号码，updatedAt 显示 2026
- `/en/blog` → 404
- view-source JSON-LD：WebSite 不含 SearchAction，Organization.logo 指向真实 brand，sameAs 无 GitHub
- DevTools Console：无 CSP 违规、无 hydration 错误

- [ ] **Step 6: 推分支 + 开 PR**

```bash
git push -u origin wave1-release-blockers
gh pr create --title "Wave 1: release-blocking repairs (audit baseline v2)" --body "$(cat <<'EOF'
## Summary

Implements Wave 1 of the codebase quality audit baseline
(`docs/reports/2026-04-26-codebase-quality-audit-baseline.md`),
revised after adversarial review (`docs/superpowers/prompts/wave1-adversarial-review-codex.md`):

- **B0**: upgrade react-server-dom-* to patch RSC DoS; override @react-email/preview-server>next
- **B1**: replace /next.svg starter logo with real brand asset via brandAssets config
- **B2**: replace placeholder phone in Terms + site config
- **B3**: add ISO 9001:2015 PDF; download path resolves
- **B4**: rewrite Privacy policy to match actual data collection
- **B5**: downgrade unverified standard claims site-wide (about + OEM + product catalog)
- **B8**: replace empty-div hero with real factory imagery
- **B10**: remove /blog route + content/posts until content library ready
- **B11**: reorder main nav for B2B conversion; add OEM + Contact, remove Privacy
- **B12**: remove fake /search SearchAction from WebSite schema
- Remove GitHub from social links (not a business channel)
- Remove developer-stack SEO keywords
- Sitemap fail-loud fallback + refresh static lastmod
- Mobile nav SSR-renders an accessible list
- SEC-01: CSP hash allowlist refreshed
- SEC-02: 2 Semgrep object-injection warnings resolved
- Attribution gated behind marketing cookie consent (GDPR)
- UTM sanitizer allows normal ad campaign syntax

## Test plan

- [ ] `pnpm ci:local` passes
- [ ] `pnpm audit`: react-server-dom + @react-email High eliminated
- [ ] `pnpm security:csp:check` passes
- [ ] `pnpm security:semgrep` clean
- [ ] `pnpm build:cf` succeeds
- [ ] Manual smoke: logo, hero, nav, ISO PDF, Privacy/Terms, no CSP errors, mobile nav w/o JS, /blog 404, no GitHub in footer

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review Checklist（v2 修订后重检）

✅ **Spec coverage**：
- B0 → Task 2（诚实范围：react-server-dom + @react-email override，不承诺清零）
- B1 → Task 5 + 8
- B2 → Task 11
- B3 → Task 9
- B4 → Task 12
- B5 → Task 13（**扩展到全站**：about + oem + messages）
- B8 → Task 10
- B10 → Task 17（**完整方案**：blog route + content/posts + sitemap + seo config）
- B11 → Task 15
- B12 → Task 3
- GitHub 社交链接 → Task 3A（**v1 遗漏，v2 补全**）
- SEC-01 → Task 18（**正确目标文件 src/config/security.ts**）
- SEC-02 → Task 19（**正确命令 pnpm security:semgrep + 正确文件**）
- Attribution consent → Task 20（**正确 API loadConsent**）
- UTM sanitizer → Task 21（**正确函数 sanitizeParam**）
- developer-stack keywords → Task 4（**含旧测试断言更新**）
- Sitemap fallback → Task 6（**正确函数名 getContentLastModified/getStaticPageLastModified**）
- Sitemap 静态 lastmod → Task 7
- Privacy / Terms updatedAt → Task 14
- brandAssets canonical → Task 5（**含 site-types.ts 类型定义 + 旧测试断言更新**）
- Content manifest 刷新 → Task 11/12/13/14 均已补 `pnpm content:manifest` 步骤

✅ **Placeholder scan**：所有"业务方提供"的位置显式标注 "Blocked on"；`git add` 使用显式文件列表，不使用 `-A`。

✅ **Type consistency**：`SINGLE_SITE_FACTS.brandAssets.logo.horizontal` 在 Task 5 定义（site-types.ts + single-site.ts），Task 8 落地资产，Task 5 的 logo.tsx / structured-data-generators.ts / test 引用一致。

✅ **对抗式审查修正**：30 条 findings 中 12 条 blocker + 13 条 high-risk 全部在 v2 中修正。

---

## 不在本计划范围

- **Wave 2**：lead 端到端契约统一（B6 + B7）、死代码大删除（B9）、API 端点收口
- **Wave 3**：业务逻辑去重、字符串作隐式协议改类型、过度拆分回收
- **Wave 4（建议新增）**：上线前实地验收——浏览器买家路径、Cloudflare e2e、Lighthouse + axe

---

**End of Wave 1 implementation plan (v2).**

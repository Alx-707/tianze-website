# Quality Proof Uplift Waves Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 Tianze 当前“能跑”的基础门禁，提升成更可信的预览部署证明、平台兼容证明、长期质量防回退机制，并在完成后把可复用能力同步到 showcase website starter。

**Architecture:** 本计划分三条 wave：Wave 1 强化 preview/staging/page contract 的真实证明；Wave 2 把 Cloudflare/Next proxy 漂移和 route/client boundary 风险变成可执行 proof lane；Wave 3 做热点瘦身、内容就绪防线和 preview observability。Tianze 真实电话、真实 logo、真实产品照片不在本轮替换，但本轮要把“上线前可替换、替换前不误伤、替换后可证明”的适配和防线做好。

**Tech Stack:** Next.js 16.2.4 App Router + React 19.2.5 + TypeScript 6.0.3 + next-intl 4.11.0 + Playwright + Vitest + Node scripts + GitHub Actions + Vercel Preview + Cloudflare/OpenNext + Storybook governance + Superpowers workflow.

---

## 当前边界

### 本计划要做

- Wave 1：提高 proof 可信度
  - PR preview 部署后跑关键页面、SEO、JSON-LD、no-JS、runtime placeholder 合同。
  - 建立 staging lead canary 的安全合同。本轮默认只做 dry-run/report；只有明确配置 staging-only Turnstile 测试策略和 idempotency key 后，才允许 submit/strict 证明 product inquiry 链路。
  - 建立关键页面合同快照，避免 canonical/hreflang、主内容、CTA、JSON-LD、占位内容再次漂移。
- Wave 2：降低平台和长期维护风险
  - 用单独 proof lane 探索 Next.js `middleware` -> `proxy` 迁移与 Cloudflare/OpenNext 适配状态，不在主线直接改名。
  - 建立 route mode、bundle、client boundary 的基线和 guard，防止页面意外 dynamic 或 client JS 扩张。
- Wave 3：深化代码和内容质量
  - 选 3 到 5 个真实热点做 characterization test + 小步瘦身，不做大重构。
  - 建立 content readiness guard，让明显样例/模板/假联系方式不再进入 live runtime content。
  - 建立 preview observability summary，预览环境出问题时能定位 request id、surface、健康端点状态。
- Starter sync：本轮能力合并后，把可复用脚本、测试、文档、命令命名同步进 showcase website starter 的后续分支/计划。

### 本计划不做

- 不替换真实公开电话、真实 logo、真实产品照片；这些由 owner 在上线前提供。
- 不把 sample 产品图强行删除；本轮只保证 live runtime 有可控占位策略和 guard。
- 不直接把 `src/middleware.ts` 改成 `src/proxy.ts`；Cloudflare/OpenNext 适配必须先走 proof lane。
- 不在当前计划阶段修改业务代码；本文件只是执行计划。
- 不创建 `/Users/Data/workspace/showcase-website-starter`；starter 当前还是独立规划线，本轮只在最后安排同步任务。

## 当前工作区和分支

- Plan worktree：`/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501`
- Plan branch：`plan/quality-proof-uplift-waves-20260501`
- Base：`origin/main`
- Starter plan branch：`docs/showcase-website-starter-plan`
- Starter target directory：`/Users/Data/workspace/showcase-website-starter`

## 文件结构

### Wave 1：Proof 可信度

- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/deploy/preview-proof.mjs`
  - 负责对 preview URL 执行 HTTP runtime proof，输出 JSON 报告。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/preview-proof.test.ts`
  - 覆盖 preview proof 的参数解析、HTML 检查、错误报告。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/e2e/preview-contract.spec.ts`
  - 只对显式非本地 preview/deployed baseURL 跑 Playwright 合同检查；本地 localhost 不作为 preview proof。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/e2e/page-contracts.spec.ts`
  - 对关键页面跑一组稳定合同：H1、canonical、hreflang、JSON-LD、CTA、no-JS main。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/deploy/staging-lead-canary.mjs`
  - 负责 staging lead canary 报告。默认 dry-run，不把错误请求当成链路证明；submit/strict 必须使用当前 `/api/inquiry` product payload、Turnstile 测试策略和 idempotency key。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/staging-lead-canary.test.ts`
  - 覆盖 canary mode、payload marker、环境缺失时行为和报告格式。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/guides/STAGING-LEAD-CANARY.md`
  - 写清 staging lead canary 的用途、环境变量、不会污染真实业务数据的约束。
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`
  - 新增 `proof:preview:deployed`、`proof:lead-canary:staging`、`test:e2e:page-contracts`、`test:e2e:preview-contract:deployed`。
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/.github/workflows/vercel-deploy.yml`
  - 在 preview deploy 后追加 preview proof step 和 artifact 上传。

### Wave 2：平台和长期维护风险

- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/proofs/cloudflare-proxy-proof.md`
  - 记录 Next docs、本仓库 runtime、Cloudflare/OpenNext 适配证明、不能主线直接 rename 的原因。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/cloudflare/run-proxy-proof.mjs`
  - 在 proof worktree 内顺序执行 build/smoke 命令，捕获每一步 exit code 和 log。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/cloudflare/proxy-proof-check.mjs`
  - 读取固定 proof artifact，检查 middleware/proxy 文件状态、构建日志 warning、Cloudflare proof 命令 exit code。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/cloudflare-proxy-proof-check.test.ts`
  - 覆盖 proof artifact 读取、日志解析和 pass/fail 分类。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/quality/route-mode-proof.md`
  - 本轮只记录 manual proof，不把未验证的 `.next` 内部 artifact 伪装成自动 guard。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/client-boundary-budget.mjs`
  - 扫描 `"use client"` 边界和 `.next/static` client chunk，生成 budget 报告。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/client-boundary-budget.test.ts`
  - 覆盖 client boundary 扫描、budget pass/fail、allowlist。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/quality/client-boundary-budget.json`
  - 当前 client boundary 和 bundle budget。
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`
  - 新增 `proof:cf:proxy`、`review:client-boundary`。
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/run-all-guardrails-review.js`
  - 把轻量 route/client guard 接入 review guardrails，避免变成孤儿脚本。

### Wave 3：代码和内容质量深化

- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/quality/hotspot-slimming-register.md`
  - 记录热点选择、瘦身前后指标、测试证据、未改范围。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/hotspot-slimming-report.mjs`
  - 从 architecture metrics/hotspots 生成可读候选清单。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/hotspot-slimming-report.test.ts`
  - 覆盖候选排序、阈值、报告格式。
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/seo-metadata.ts`
  - 只做小步拆分，保留行为。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/__tests__/seo-metadata.characterization.test.ts`
  - 固化 canonical/hreflang 生成行为和 contact path 行为。
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/structured-data-generators.ts`
  - 只做小步拆分，保留行为。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/__tests__/structured-data-generators.characterization.test.ts`
  - 固化 Organization、WebSite、ProductGroup、LocalBusiness 关键字段。
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/lead-pipeline/process-lead.ts`
  - 只做小步拆分，保留行为。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/lead-pipeline/__tests__/process-lead.characterization.test.ts`
  - 固化 success、partial success、failed service 的可观察行为。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/content-readiness-check.mjs`
  - 检查 live runtime 输入文件和 build HTML 中的明显占位/模板残留。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/content-readiness-check.test.ts`
  - 覆盖 live/include/exclude、占位 pattern、JSON 输出。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/deploy/preview-observability-summary.mjs`
  - 从 preview URL 采集 health/API header/request id/surface 状态。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/preview-observability-summary.test.ts`
  - 覆盖 header 提取、报告格式、缺失 header 的 fail/warn。
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/guides/PREVIEW-OBSERVABILITY.md`
  - 写清 preview 排障时如何用 report 定位问题。
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`
  - 新增 `content:readiness`、`proof:preview-observability`、`review:hotspot-slimming`。
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/.github/workflows/ci.yml`
  - 把 content readiness 和轻量质量 guard 接进 CI 合适 job。

### Starter sync

- Modify after Tianze implementation is merged: `/Users/Data/Warehouse/Pipe/tianze-website/docs/superpowers/plans/2026-04-30-showcase-website-starter-extraction.md`
  - 增加 quality/proof 同步段落，说明 starter 要迁移哪些能力、不能迁移哪些 Tianze 专属事实。
- Create in starter sync branch later: `/Users/Data/workspace/showcase-website-starter/docs/website/quality-proof.md`
  - 作为 starter 的可复用品质证明指南。

---

## Wave 1：Proof 可信度提升

### Task 1: 建立 preview proof 脚本

**Files:**
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/deploy/preview-proof.mjs`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/preview-proof.test.ts`
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`

- [ ] **Step 1: 写失败测试，锁定参数解析和报告格式**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/preview-proof.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
  assertPageContract,
  buildPreviewProofReport,
  parsePreviewProofArgs,
} from "../../../scripts/deploy/preview-proof.mjs";

describe("preview-proof", () => {
  it("parses base url and optional protection header", () => {
    expect(
      parsePreviewProofArgs([
        "node",
        "preview-proof.mjs",
        "--base-url",
        "https://example-preview.vercel.app",
        "--header-name",
        "x-vercel-protection-bypass",
        "--header-value",
        "secret",
      ]),
    ).toEqual({
      baseUrl: "https://example-preview.vercel.app",
      headerName: "x-vercel-protection-bypass",
      headerValue: "secret",
      output: "reports/deploy/preview-proof.json",
      strict: false,
    });
  });

  it("rejects missing base url", () => {
    expect(() => parsePreviewProofArgs(["node", "preview-proof.mjs"])).toThrow(
      "Missing required --base-url",
    );
  });

  it("detects duplicate canonical and duplicate hreflang", () => {
    const html = [
      "<html><head>",
      '<link rel="canonical" href="https://example.com/en/contact">',
      '<link rel="canonical" href="http://localhost:3000/en/contact">',
      '<link rel="alternate" hreflang="en" href="https://example.com/en/contact">',
      '<link rel="alternate" hreflang="en" href="http://localhost:3000/en/contact">',
      '<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization"}]}</script>',
      "</head><body><main><h1>Contact Us</h1><a href=\"/en/contact\">Contact</a></main></body></html>",
    ].join("");

    const result = assertPageContract({
      pathname: "/en/contact",
      html,
      status: 200,
      finalUrl: "https://example-preview.vercel.app/en/contact",
    });

    expect(result.ok).toBe(false);
    expect(result.failures).toContain(
      "Expected exactly one canonical link, found 2",
    );
    expect(result.failures).toContain(
      'Expected hreflang "en" exactly once, found 2',
    );
  });

  it("builds a stable JSON report", () => {
    const report = buildPreviewProofReport({
      baseUrl: "https://example-preview.vercel.app",
      checkedAt: "2026-05-01T00:00:00.000Z",
      pages: [
        {
          pathname: "/en",
          status: 200,
          finalUrl: "https://example-preview.vercel.app/en",
          ok: true,
          failures: [],
          warnings: [],
        },
      ],
    });

    expect(report).toEqual({
      tool: "preview-proof",
      baseUrl: "https://example-preview.vercel.app",
      checkedAt: "2026-05-01T00:00:00.000Z",
      ok: true,
      totals: { pages: 1, failures: 0, warnings: 0 },
      pages: [
        {
          pathname: "/en",
          status: 200,
          finalUrl: "https://example-preview.vercel.app/en",
          ok: true,
          failures: [],
          warnings: [],
        },
      ],
    });
  });
});
```

- [ ] **Step 2: 运行测试，确认先失败**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm exec vitest run tests/unit/scripts/preview-proof.test.ts
```

Expected: FAIL because `scripts/deploy/preview-proof.mjs` does not exist.

- [ ] **Step 3: 实现 preview proof 脚本**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/deploy/preview-proof.mjs` with:

```js
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_PAGES = [
  "/en",
  "/zh",
  "/en/contact",
  "/zh/contact",
  "/en/products",
  "/en/products/north-america",
  "/en/about",
];

const PLACEHOLDER_PATTERNS = [
  { label: "fake phone", pattern: /\+86-518-0000-0000/i },
  { label: "sample product label", pattern: /Sample Product/i },
  { label: "replace image instruction", pattern: /Replace this image/i },
  { label: "missing logo asset", pattern: /\/images\/logo\.svg/i },
];

export function parsePreviewProofArgs(argv) {
  const args = {
    baseUrl: "",
    headerName: "",
    headerValue: "",
    output: "reports/deploy/preview-proof.json",
    strict: false,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--base-url" && index + 1 < argv.length) {
      args.baseUrl = argv[++index];
      continue;
    }

    if (arg === "--header-name" && index + 1 < argv.length) {
      args.headerName = argv[++index];
      continue;
    }

    if (arg === "--header-value" && index + 1 < argv.length) {
      args.headerValue = argv[++index];
      continue;
    }

    if (arg === "--output" && index + 1 < argv.length) {
      args.output = argv[++index];
      continue;
    }

    if (arg === "--strict") {
      args.strict = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!args.baseUrl) {
    throw new Error("Missing required --base-url");
  }

  if (Boolean(args.headerName) !== Boolean(args.headerValue)) {
    throw new Error(
      "Both --header-name and --header-value must be provided together",
    );
  }

  return args;
}

function countMatches(html, regexp) {
  return (html.match(regexp) ?? []).length;
}

function findJsonLdScripts(html) {
  return html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
  ) ?? [];
}

function stripScriptTag(script) {
  return script
    .replace(/^<script[^>]*>/i, "")
    .replace(/<\/script>$/i, "")
    .trim();
}

export function assertPageContract({ pathname, html, status, finalUrl }) {
  const failures = [];
  const warnings = [];

  if (status !== 200) {
    failures.push(`Expected status 200, got ${status}`);
  }

  const canonicalCount = countMatches(html, /<link[^>]+rel=["']canonical["']/gi);
  if (canonicalCount !== 1) {
    failures.push(`Expected exactly one canonical link, found ${canonicalCount}`);
  }

  for (const hreflang of ["en", "zh", "x-default"]) {
    const count = countMatches(
      html,
      new RegExp(
        `<link[^>]+rel=["']alternate["'][^>]+hreflang=["']${hreflang}["']`,
        "gi",
      ),
    );
    if (count !== 1) {
      failures.push(`Expected hreflang "${hreflang}" exactly once, found ${count}`);
    }
  }

  const h1Count = countMatches(html, /<h1\b/gi);
  if (h1Count !== 1) {
    failures.push(`Expected exactly one h1, found ${h1Count}`);
  }

  const mainCount = countMatches(html, /<main\b/gi);
  if (mainCount !== 1) {
    failures.push(`Expected exactly one main landmark, found ${mainCount}`);
  }

  const jsonLdScripts = findJsonLdScripts(html);
  if (jsonLdScripts.length !== 1) {
    failures.push(
      `Expected exactly one application/ld+json script, found ${jsonLdScripts.length}`,
    );
  } else {
    try {
      const parsed = JSON.parse(stripScriptTag(jsonLdScripts[0]));
      if (parsed["@context"] !== "https://schema.org") {
        failures.push("JSON-LD @context must be https://schema.org");
      }
      if (!Array.isArray(parsed["@graph"])) {
        failures.push("JSON-LD must contain an @graph array");
      }
    } catch {
      failures.push("JSON-LD script must contain valid JSON");
    }
  }

  if (!/<a\b[^>]+href=["'][^"']*(contact|inquiry|mailto:)/i.test(html)) {
    failures.push("Expected at least one contact or inquiry CTA link");
  }

  for (const { label, pattern } of PLACEHOLDER_PATTERNS) {
    if (pattern.test(html)) {
      warnings.push(`Runtime HTML contains ${label}`);
    }
  }

  if (finalUrl.includes("localhost")) {
    failures.push(`Final URL must not point at localhost: ${finalUrl}`);
  }

  return {
    pathname,
    status,
    finalUrl,
    ok: failures.length === 0,
    failures,
    warnings,
  };
}

function buildHeaders({ headerName, headerValue }) {
  const headers = { "user-agent": "tianze-preview-proof" };
  if (headerName && headerValue) {
    headers[headerName] = headerValue;
  }
  return headers;
}

async function fetchPage(baseUrl, pathname, headers) {
  const url = new URL(pathname, baseUrl);
  const response = await fetch(url, {
    headers,
    redirect: "follow",
    signal: AbortSignal.timeout(30000),
  });
  return {
    pathname,
    status: response.status,
    finalUrl: response.url,
    html: await response.text(),
  };
}

export function buildPreviewProofReport({ baseUrl, checkedAt, pages }) {
  const totals = pages.reduce(
    (accumulator, page) => {
      accumulator.pages += 1;
      accumulator.failures += page.failures.length;
      accumulator.warnings += page.warnings.length;
      return accumulator;
    },
    { pages: 0, failures: 0, warnings: 0 },
  );

  return {
    tool: "preview-proof",
    baseUrl,
    checkedAt,
    ok: totals.failures === 0,
    totals,
    pages,
  };
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const args = parsePreviewProofArgs(process.argv);
  const headers = buildHeaders(args);
  const pages = [];

  for (const pathname of DEFAULT_PAGES) {
    const page = await fetchPage(args.baseUrl, pathname, headers);
    pages.push(assertPageContract(page));
  }

  const report = buildPreviewProofReport({
    baseUrl: args.baseUrl,
    checkedAt: new Date().toISOString(),
    pages,
  });

  await writeJson(args.output, report);

  if (!report.ok || (args.strict && report.totals.warnings > 0)) {
    console.error(
      `[preview-proof] failed: ${report.totals.failures} failures, ${report.totals.warnings} warnings`,
    );
    process.exit(1);
  }

  console.log(
    `[preview-proof] passed: ${report.totals.pages} pages, ${report.totals.warnings} warnings`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("[preview-proof] unexpected error:", error);
    process.exit(1);
  });
}
```

- [ ] **Step 4: 新增 package script**

Modify `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`:

```json
"proof:preview:deployed": "node scripts/deploy/preview-proof.mjs"
```

Place it near existing `smoke:cf:deploy` / `proof:cf:preview-deployed` scripts. Keep the command name deployed-scoped so a naked local run is not mistaken for preview proof.

- [ ] **Step 5: 运行单测**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm exec vitest run tests/unit/scripts/preview-proof.test.ts
```

Expected: PASS.

- [ ] **Step 6: 运行类型检查的最小相关验证**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm type-check:tests
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
git add package.json scripts/deploy/preview-proof.mjs tests/unit/scripts/preview-proof.test.ts
git commit -m "test: add preview proof contract runner"
```

Expected: commit succeeds.

### Task 2: 把 preview proof 接进 Vercel preview workflow

**Files:**
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/.github/workflows/vercel-deploy.yml`

- [ ] **Step 1: 检查当前 post-deployment-verification job 和 bypass header**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
grep -n "post-deployment-verification\\|等待部署就绪\\|VERCEL_AUTOMATION_BYPASS_SECRET\\|post-deploy-smoke" .github/workflows/vercel-deploy.yml
```

Expected:

- output contains `post-deployment-verification`
- output contains `等待部署就绪`
- output contains `VERCEL_AUTOMATION_BYPASS_SECRET`
- output contains existing `post-deploy-smoke` invocation

Do not add preview proof to `deploy-to-vercel`. It must run only after the existing readiness wait.

- [ ] **Step 2: 在 post-deployment-verification 的等待就绪之后追加 proof step**

Modify `.github/workflows/vercel-deploy.yml` inside `post-deployment-verification`, immediately after `等待部署就绪（增强版）` and before `验证部署健康状态`:

```yaml
      - name: 预览部署合同证明
        run: |
          set -euo pipefail
          node scripts/deploy/preview-proof.mjs \
            --base-url "${{ needs.deploy-to-vercel.outputs.preview_url }}" \
            --header-name "x-vercel-protection-bypass" \
            --header-value "${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}" \
            --output reports/deploy/preview-proof.json
        env:
          CI: true

      - name: 上传预览部署合同证明
        if: always()
        uses: actions/upload-artifact@v7
        with:
          name: preview-proof.json
          path: reports/deploy/preview-proof.json
          if-no-files-found: ignore
```

This repository already uses `VERCEL_AUTOMATION_BYPASS_SECRET` in this job. Reuse it. Do not create a second bypass mechanism.
The workflow intentionally calls `node scripts/deploy/preview-proof.mjs` directly; it does not rely on the package alias `proof:preview:deployed`.

- [ ] **Step 3: 校验 workflow YAML 关键字段**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
grep -n "预览部署合同证明\\|preview-proof.json\\|node scripts/deploy/preview-proof.mjs\\|needs.deploy-to-vercel.outputs.preview_url\\|x-vercel-protection-bypass" .github/workflows/vercel-deploy.yml
```

Expected:

- proof step appears under `post-deployment-verification`
- script uses `node scripts/deploy/preview-proof.mjs`
- script uses `needs.deploy-to-vercel.outputs.preview_url`
- script passes `x-vercel-protection-bypass`
- upload step stores `reports/deploy/preview-proof.json`

- [ ] **Step 4: 运行轻量检查**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm lint:check
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
git add .github/workflows/vercel-deploy.yml
git commit -m "ci: run preview proof after Vercel deploy"
```

Expected: commit succeeds.

### Task 3: 建立关键页面 Playwright 合同快照

**Files:**
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/e2e/page-contracts.spec.ts`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/e2e/preview-contract.spec.ts`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/test/e2e-target.ts`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/e2e-target.test.ts`
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/playwright.config.ts`
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/e2e/global-setup.ts`
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/app/[locale]/products/page.tsx`
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/app/[locale]/products/__tests__/page.test.tsx`
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`

- [ ] **Step 1: 写 page contracts spec**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/e2e/page-contracts.spec.ts` with:

```ts
import { expect, test } from "@playwright/test";

const keyPages = [
  { path: "/en", cta: /contact|inquiry|get quote/i },
  { path: "/zh", cta: /联系|询盘|获取报价/i },
  { path: "/en/contact", cta: /send|submit|contact/i },
  { path: "/zh/contact", cta: /发送|提交|联系/i },
  {
    path: "/en/products",
    cta: /request a quote|get quote/i,
    expectedCtaHref: /\/contact(?:[/?#]|$)/,
  },
  { path: "/en/products/north-america", cta: /contact|inquiry|get quote/i },
  { path: "/en/about", cta: /contact|inquiry|get quote/i },
] as const;

function count(html: string, pattern: RegExp) {
  return (html.match(pattern) ?? []).length;
}

function getRuntimeTextToReject() {
  return [
    "+86-518-0000-0000",
    "Sample Product",
    "Replace this image",
    "TODO",
    "MISSING_MESSAGE",
  ];
}

for (const pageCase of keyPages) {
  test.describe(`Page contract ${pageCase.path}`, () => {
    test("keeps stable SEO, content, and CTA contract", async ({ page }) => {
      await page.goto(pageCase.path, { waitUntil: "domcontentloaded" });

      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(
        page.locator('link[rel="alternate"][hreflang="en"]'),
      ).toHaveCount(1);
      await expect(
        page.locator('link[rel="alternate"][hreflang="zh"]'),
      ).toHaveCount(1);
      await expect(
        page.locator('link[rel="alternate"][hreflang="x-default"]'),
      ).toHaveCount(1);
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
        1,
      );
      await expect(page.locator("main")).toHaveCount(1);

      const main = page.locator("main");
      const mainCta = main
        .getByRole("link", { name: pageCase.cta })
        .or(main.getByRole("button", { name: pageCase.cta }))
        .or(
          main.locator('a[href*="/contact"]:visible, a[href^="mailto:"]:visible'),
        )
        .first();
      await expect(mainCta).toBeVisible();

      const html = await page.content();
      expect(count(html, /<main\b/gi)).toBe(1);
      for (const rejected of getRuntimeTextToReject()) {
        expect(html).not.toContain(rejected);
      }
    });
  });
}
```

- [ ] **Step 2: 写 preview/deployed-only contract spec**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/e2e/preview-contract.spec.ts` with the same explicit target normalization rule used by `playwright.config.ts`:

- empty value: no explicit remote target, local fallback;
- absolute URL with `://`: parse as-is;
- host-like value without protocol: normalize by prepending `http://` before parsing;
- examples: `preview.example.vercel.app` -> `http://preview.example.vercel.app`, `localhost:3000` -> `http://localhost:3000`, `[::1]:3000` -> `http://[::1]:3000`;
- local/remote is decided from the normalized hostname only: `localhost`, `127.0.0.1`, and `::1` are local; every other hostname is remote.

This prevents a half-supported state where config treats a protocol-less host as remote, but the spec skips or the Playwright `baseURL` becomes invalid.

Spec shape:

```ts
import { expect, test } from "@playwright/test";
import {
  hasRemoteE2ETarget,
  selectExplicitE2ETarget,
} from "@/test/e2e-target";

const previewOnlyPages = ["/en", "/en/contact", "/en/products"] as const;

function hasNonLocalExplicitPreviewTarget(): boolean {
  const explicitTarget = selectExplicitE2ETarget(
    process.env.STAGING_URL,
    process.env.PLAYWRIGHT_BASE_URL,
  );

  return hasRemoteE2ETarget(explicitTarget?.href);
}

for (const pathname of previewOnlyPages) {
  test(`preview contract for ${pathname}`, async ({ page }) => {
    test.skip(
      !hasNonLocalExplicitPreviewTarget(),
      "preview contract requires non-local STAGING_URL or PLAYWRIGHT_BASE_URL",
    );

    await page.goto(pathname, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
      1,
    );

    const html = await page.content();
    expect(html).not.toContain("localhost:3000");
    expect(html).not.toContain("MISSING_MESSAGE");
    expect(html).not.toContain("BAILOUT_TO_CLIENT_SIDE_RENDERING");
  });
}
```

- [ ] **Step 3: 新增 package scripts**

Modify `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`:

```json
"test:e2e:page-contracts": "pnpm exec playwright test tests/e2e/page-contracts.spec.ts --project=chromium",
"test:e2e:preview-contract:deployed": "pnpm exec playwright test tests/e2e/preview-contract.spec.ts --project=chromium"
```

Place them near existing `test:e2e:*` scripts.

Playwright config should skip the local `webServer` when `STAGING_URL` or `PLAYWRIGHT_BASE_URL` points to a non-local target; missing, `localhost`, `127.0.0.1`, and `::1` targets still use the local server.

Protocol-less host-like targets are intentionally supported and normalized to `http://` before locale handling and local/remote checks. For example, `PLAYWRIGHT_BASE_URL=preview.example.vercel.app` must omit `webServer` and produce baseURL `http://preview.example.vercel.app/en`; `PLAYWRIGHT_BASE_URL=localhost:3000` must keep `webServer` and produce baseURL `http://localhost:3000/en`.

Task 3 fourth-round blocker closure:

- `src/test/e2e-target.ts` is the single source for explicit E2E target parsing.
- Empty and whitespace-only values are ignored before baseURL/webServer/preview skip decisions.
- Protocol-less path-like values that start with `/`, `./`, `../`, `?`, or `#` are rejected instead of becoming fake remote hosts such as `http://relative/`.
- Protocol-less values that contain a path slash, such as `foo/bar`, are rejected; use a full URL like `https://preview.example.vercel.app/path` when a path is intentional.
- `STAGING_URL` has priority over `PLAYWRIGHT_BASE_URL`; baseURL selection, local `webServer` selection, and preview-contract skipping must all use that same selected target.
- `tests/e2e/global-setup.ts` must also use `src/test/e2e-target.ts`; global setup readiness is skipped only when the selected target is a non-local remote.
- Missing, whitespace-only, local, invalid, or path-like targets must use the local fallback and still run local readiness in global setup.
- `baseURL`, local `webServer`, global setup readiness, and deployed-only preview-contract skipping must all be driven by the same selected target.
- Only missing or whitespace-only higher-priority values may fall back to lower-priority values. Invalid or path-like higher-priority values must stop fallback and use the local default.
- Example: `STAGING_URL=localhost:3000 PLAYWRIGHT_BASE_URL=preview.example.vercel.app` stays local, keeps `webServer`, and skips deployed-only preview contracts.
- Example: `STAGING_URL=/relative PLAYWRIGHT_BASE_URL=preview.example.vercel.app` also stays local, keeps `webServer`, and skips deployed-only preview contracts.

- [ ] **Step 4: 运行 page contracts，确认当前问题被捕获或通过**

Default local run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm test:e2e:page-contracts
```

Only when debugging server startup manually, split build/start and test into two terminals:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm build
pnpm start
```

In another terminal:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm test:e2e:page-contracts
```

Expected before repair: if phone/logo/sample-product runtime exposure still exists, test FAILS with the exact offending page. After content adaptation tasks, expected PASS.

- [ ] **Step 5: 记录当前失败，不在本 task 偷修**

If Step 4 fails because it catches known public trust asset placeholders, record the exact path and text in the task notes. Do not weaken the assertion. The later content readiness task decides how to adapt placeholders without needing final real assets.

- [ ] **Step 6: Commit**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
git add package.json tests/e2e/page-contracts.spec.ts tests/e2e/preview-contract.spec.ts
git commit -m "test: add key page runtime contracts"
```

Expected: commit succeeds. If tests are intentionally red at this point, include the failing evidence in the commit body.

### Task 4: 建立 staging lead canary

**Files:**
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/deploy/staging-lead-canary.mjs`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/staging-lead-canary.test.ts`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/guides/STAGING-LEAD-CANARY.md`
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`

- [ ] **Step 1: 写失败测试**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/staging-lead-canary.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
  buildCanaryPayload,
  buildLeadCanaryReport,
  classifyCanaryMode,
  parseLeadCanaryArgs,
} from "../../../scripts/deploy/staging-lead-canary.mjs";

describe("staging-lead-canary", () => {
  it("defaults to dry-run mode", () => {
    expect(parseLeadCanaryArgs(["node", "staging-lead-canary.mjs"])).toEqual({
      baseUrl: "",
      mode: "dry-run",
      output: "reports/deploy/staging-lead-canary.json",
      reference: "",
      turnstileToken: "",
      idempotencyKey: "",
    });
  });

  it("classifies missing base url as skipped for PR mode", () => {
    expect(
      classifyCanaryMode({
        baseUrl: "",
        mode: "dry-run",
        turnstileToken: "",
        idempotencyKey: "",
      }),
    ).toEqual({
      shouldSubmit: false,
      ok: true,
      status: "skipped",
      reason: "Missing --base-url; dry-run mode does not submit data",
    });
  });

  it("fails missing base url in strict staging mode", () => {
    expect(
      classifyCanaryMode({
        baseUrl: "",
        mode: "strict",
        turnstileToken: "valid-staging-token",
        idempotencyKey: "staging-canary-pr-123",
      }),
    ).toEqual({
      shouldSubmit: false,
      ok: false,
      status: "failed",
      reason: "Missing --base-url for strict staging canary",
    });
  });

  it("refuses submit without explicit staging security inputs", () => {
    expect(
      classifyCanaryMode({
        baseUrl: "https://example-preview.vercel.app",
        mode: "submit",
        turnstileToken: "",
        idempotencyKey: "",
      }),
    ).toEqual({
      shouldSubmit: false,
      ok: false,
      status: "failed",
      reason:
        "submit mode requires --turnstile-token and --idempotency-key for the current /api/inquiry contract",
    });
  });

  it("builds traceable product inquiry dry-run payload", () => {
    expect(
      buildCanaryPayload({
        reference: "pr-123",
        checkedAt: "2026-05-01T00:00:00.000Z",
        turnstileToken: "valid-staging-token",
      }),
    ).toMatchObject({
      fullName: "Staging Canary",
      email: "staging-canary@example.invalid",
      productSlug: "pvc-conduit-fittings",
      productName: "PVC Conduit Fittings",
      quantity: "1 carton",
      company: "Tianze Preview Proof",
      requirements:
        "[staging-canary pr-123] This is an automated non-production lead proof.",
      turnstileToken: "valid-staging-token",
    });
  });

  it("builds stable report", () => {
    expect(
      buildLeadCanaryReport({
        checkedAt: "2026-05-01T00:00:00.000Z",
        baseUrl: "https://example-preview.vercel.app",
        mode: "dry-run",
        reference: "pr-123",
        status: "skipped",
        ok: true,
        reason: "dry run",
        responseStatus: null,
        responseBodySnippet: "",
      }),
    ).toEqual({
      tool: "staging-lead-canary",
      checkedAt: "2026-05-01T00:00:00.000Z",
      baseUrl: "https://example-preview.vercel.app",
      mode: "dry-run",
      reference: "pr-123",
      status: "skipped",
      ok: true,
      reason: "dry run",
      responseStatus: null,
      responseBodySnippet: "",
    });
  });
});
```

- [ ] **Step 2: 运行测试，确认先失败**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm exec vitest run tests/unit/scripts/staging-lead-canary.test.ts
```

Expected: FAIL because script does not exist.

- [ ] **Step 3: 实现 staging lead canary**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/deploy/staging-lead-canary.mjs` with:

```js
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_OUTPUT = "reports/deploy/staging-lead-canary.json";

export function parseLeadCanaryArgs(argv) {
  const args = {
    baseUrl: "",
    mode: "dry-run",
    output: DEFAULT_OUTPUT,
    reference: "",
    turnstileToken: "",
    idempotencyKey: "",
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--base-url" && index + 1 < argv.length) {
      args.baseUrl = argv[++index];
      continue;
    }
    if (arg === "--mode" && index + 1 < argv.length) {
      args.mode = argv[++index];
      continue;
    }
    if (arg === "--output" && index + 1 < argv.length) {
      args.output = argv[++index];
      continue;
    }
    if (arg === "--reference" && index + 1 < argv.length) {
      args.reference = argv[++index];
      continue;
    }
    if (arg === "--turnstile-token" && index + 1 < argv.length) {
      args.turnstileToken = argv[++index];
      continue;
    }
    if (arg === "--idempotency-key" && index + 1 < argv.length) {
      args.idempotencyKey = argv[++index];
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!["dry-run", "submit", "strict"].includes(args.mode)) {
    throw new Error(`Invalid --mode: ${args.mode}`);
  }

  return args;
}

export function classifyCanaryMode({
  baseUrl,
  mode,
  turnstileToken,
  idempotencyKey,
}) {
  if (!baseUrl && mode === "strict") {
    return {
      shouldSubmit: false,
      ok: false,
      status: "failed",
      reason: "Missing --base-url for strict staging canary",
    };
  }

  if (!baseUrl) {
    return {
      shouldSubmit: false,
      ok: true,
      status: "skipped",
      reason: "Missing --base-url; dry-run mode does not submit data",
    };
  }

  if (mode === "dry-run") {
    return {
      shouldSubmit: false,
      ok: true,
      status: "skipped",
      reason: "dry-run mode does not submit data",
    };
  }

  if (!turnstileToken || !idempotencyKey) {
    return {
      shouldSubmit: false,
      ok: false,
      status: "failed",
      reason:
        "submit mode requires --turnstile-token and --idempotency-key for the current /api/inquiry contract",
    };
  }

  return {
    shouldSubmit: true,
    ok: true,
    status: "pending",
    reason: "ready to submit staging canary",
  };
}

export function buildCanaryPayload({ reference, checkedAt, turnstileToken }) {
  const marker = reference || "manual";
  return {
    fullName: "Staging Canary",
    email: "staging-canary@example.invalid",
    company: "Tianze Preview Proof",
    productSlug: "pvc-conduit-fittings",
    productName: "PVC Conduit Fittings",
    quantity: "1 carton",
    requirements: `[staging-canary ${marker}] This is an automated non-production lead proof.`,
    marketingConsent: false,
    turnstileToken,
    checkedAt,
  };
}

export function buildLeadCanaryReport(input) {
  return {
    tool: "staging-lead-canary",
    checkedAt: input.checkedAt,
    baseUrl: input.baseUrl,
    mode: input.mode,
    reference: input.reference,
    status: input.status,
    ok: input.ok,
    reason: input.reason,
    responseStatus: input.responseStatus,
    responseBodySnippet: input.responseBodySnippet,
  };
}

async function submitLead({ baseUrl, payload, idempotencyKey }) {
  const response = await fetch(new URL("/api/inquiry", baseUrl), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "staging-lead-canary",
      "idempotency-key": idempotencyKey,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });

  return {
    responseStatus: response.status,
    responseBodySnippet: (await response.text()).slice(0, 500),
    ok: response.status >= 200 && response.status < 300,
  };
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const args = parseLeadCanaryArgs(process.argv);
  const checkedAt = new Date().toISOString();
  const classification = classifyCanaryMode(args);

  let report;
  if (!classification.shouldSubmit) {
    report = buildLeadCanaryReport({
      checkedAt,
      baseUrl: args.baseUrl,
      mode: args.mode,
      reference: args.reference,
      status: classification.status,
      ok: classification.ok,
      reason: classification.reason,
      responseStatus: null,
      responseBodySnippet: "",
    });
  } else {
    const result = await submitLead({
      baseUrl: args.baseUrl,
      payload: buildCanaryPayload({
        reference: args.reference,
        checkedAt,
        turnstileToken: args.turnstileToken,
      }),
      idempotencyKey: args.idempotencyKey,
    });
    report = buildLeadCanaryReport({
      checkedAt,
      baseUrl: args.baseUrl,
      mode: args.mode,
      reference: args.reference,
      status: result.ok ? "submitted" : "failed",
      ok: result.ok,
      reason: result.ok
        ? "staging canary accepted by inquiry API"
        : "inquiry API rejected staging canary",
      responseStatus: result.responseStatus,
      responseBodySnippet: result.responseBodySnippet,
    });
  }

  await writeJson(args.output, report);

  if (!report.ok) {
    console.error(`[staging-lead-canary] ${report.reason}`);
    process.exit(1);
  }

  console.log(`[staging-lead-canary] ${report.status}: ${report.reason}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("[staging-lead-canary] unexpected error:", error);
    process.exit(1);
  });
}
```

- [ ] **Step 4: 写 canary 操作文档，明确本轮默认不证明真实 submit**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/guides/STAGING-LEAD-CANARY.md` with:

```md
# Staging Lead Canary

## Purpose

This proof has two levels:

1. `dry-run`: validates and records the product inquiry payload shape without submitting data.
2. `submit` / `strict`: only allowed when staging has an explicit Turnstile test strategy and a non-production data target.

Without the staging-only security/data contract, this script must not be described as an end-to-end lead proof.

## Modes

- `dry-run`: default. Writes a report and does not submit data.
- `submit`: submits a product inquiry payload to the provided preview/staging URL. Requires a valid staging Turnstile strategy.
- `strict`: same as submit, but missing `--base-url` or missing staging security configuration is a hard failure.

## Safe payload marker

Every payload uses:

- email: `staging-canary@example.invalid`
- company: `Tianze Preview Proof`
- productSlug: `pvc-conduit-fittings`
- productName: `PVC Conduit Fittings`
- requirements prefix: `[staging-canary <reference>]`
- idempotency header: `idempotency-key: staging-canary-<timestamp-or-reference>`

## Security contract for submit/strict

Current `/api/inquiry` validates product inquiry data, requires Turnstile, and requires an idempotency key. Therefore:

- Do not send contact-form fields such as `firstName`, `lastName`, or `acceptPrivacy` to `/api/inquiry`.
- Do not use invalid Turnstile tokens and call that a lead-chain proof.
- Do not submit to production Airtable from this canary.
- If staging Turnstile bypass/test keys are unavailable, keep this lane in `dry-run`.

## Commands

```bash
pnpm proof:lead-canary:staging -- --mode dry-run
pnpm proof:lead-canary:staging -- \
  --base-url https://example-preview.vercel.app \
  --mode submit \
  --reference pr-123 \
  --turnstile-token "$STAGING_TURNSTILE_TEST_TOKEN" \
  --idempotency-key "staging-canary-pr-123"
pnpm proof:lead-canary:staging -- \
  --base-url https://example-preview.vercel.app \
  --mode strict \
  --reference release-candidate \
  --turnstile-token "$STAGING_TURNSTILE_TEST_TOKEN" \
  --idempotency-key "staging-canary-release-candidate"
```

## Report

The script writes:

```text
reports/deploy/staging-lead-canary.json
```

The report must include:

- `tool`
- `checkedAt`
- `baseUrl`
- `mode`
- `reference`
- `status`
- `ok`
- `reason`
- `responseStatus`
- `responseBodySnippet`
```

- [ ] **Step 5: 新增 package script**

Modify `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`:

```json
"proof:lead-canary:staging": "node scripts/deploy/staging-lead-canary.mjs"
```

- [ ] **Step 6: 运行单测和 dry-run**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm exec vitest run tests/unit/scripts/staging-lead-canary.test.ts
pnpm proof:lead-canary:staging -- --mode dry-run
```

Expected:

```text
[staging-lead-canary] skipped: dry-run mode does not submit data
```

and `reports/deploy/staging-lead-canary.json` exists.

- [ ] **Step 7: Commit**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
git add package.json scripts/deploy/staging-lead-canary.mjs tests/unit/scripts/staging-lead-canary.test.ts docs/guides/STAGING-LEAD-CANARY.md
git commit -m "test: add staging lead canary proof"
```

Expected: commit succeeds.

---

## Wave 2：平台和长期维护风险

### Task 5: Cloudflare middleware/proxy proof lane

**Files:**
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/proofs/cloudflare-proxy-proof.md`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/cloudflare/proxy-proof-check.mjs`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/cloudflare-proxy-proof-check.test.ts`
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`

- [ ] **Step 1: 建立独立 proof 分支，不在主线直接 rename**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
git worktree add -b proof/cloudflare-next-proxy /Users/Data/conductor/workspaces/tianze-website/cloudflare-next-proxy-proof HEAD
```

Expected:

```text
Preparing worktree ...
HEAD is now at ...
```

- [ ] **Step 2: 在 proof worktree 安装依赖后读取本地 Next docs**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/cloudflare-next-proxy-proof
pnpm install --frozen-lockfile
find node_modules/next/dist/docs -iname '*proxy*' -o -iname '*middleware*' | sed -n '1,40p'
```

Expected: command lists version-locked Next docs paths. If no file appears, run:

```bash
grep -R "proxy.ts\\|middleware" node_modules/next/dist/docs -n | sed -n '1,80p'
```

Expected: output contains installed Next 16 docs about proxy or middleware convention.

- [ ] **Step 3: proof 分支内做最小 rename 实验**

Run in proof worktree:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/cloudflare-next-proxy-proof
git mv src/middleware.ts src/proxy.ts
```

Expected: file is renamed only in proof worktree.

- [ ] **Step 4: 回到主 plan worktree 写 proof artifact 测试**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/cloudflare-proxy-proof-check.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
  classifyProxyProof,
  parseBuildWarnings,
  readProxyProofArtifact,
} from "../../../scripts/cloudflare/proxy-proof-check.mjs";

describe("cloudflare proxy proof check", () => {
  it("detects middleware deprecation warning", () => {
    expect(
      parseBuildWarnings(
        "The middleware file convention is deprecated. Please use proxy instead.",
      ),
    ).toEqual(["middleware-deprecated"]);
  });

  it("reads proxy proof artifact", () => {
    expect(
      readProxyProofArtifact(
        JSON.stringify({
          subject: "src/proxy.ts",
          steps: [
            { name: "next-build", exitCode: 0, logPath: "reports/a.log" },
            { name: "cloudflare-build", exitCode: 1, logPath: "reports/b.log" },
          ],
        }),
      ),
    ).toEqual({
      subject: "src/proxy.ts",
      steps: [
        { name: "next-build", exitCode: 0, logPath: "reports/a.log" },
        { name: "cloudflare-build", exitCode: 1, logPath: "reports/b.log" },
      ],
    });
  });

  it("classifies full proof pass", () => {
    expect(
      classifyProxyProof({
        subject: "src/proxy.ts",
        steps: [
          { name: "next-build", exitCode: 0, logPath: "reports/a.log" },
          { name: "cloudflare-build", exitCode: 0, logPath: "reports/b.log" },
          { name: "cf-preview-smoke", exitCode: 0, logPath: "reports/c.log" },
          {
            name: "cf-preview-smoke-strict",
            exitCode: 0,
            logPath: "reports/d.log",
          },
        ],
        warnings: [],
      }),
    ).toEqual({
      ok: true,
      recommendation: "proxy-compatible",
      blockers: [],
      warnings: [],
    });
  });

  it("blocks mainline migration when Cloudflare build fails", () => {
    expect(
      classifyProxyProof({
        subject: "src/proxy.ts",
        steps: [
          { name: "next-build", exitCode: 0, logPath: "reports/a.log" },
          { name: "cloudflare-build", exitCode: 1, logPath: "reports/b.log" },
        ],
        warnings: [],
      }),
    ).toEqual({
      ok: false,
      recommendation: "keep-middleware",
      blockers: ["cloudflare-build failed with exit code 1"],
      warnings: [],
    });
  });
});
```

- [ ] **Step 5: 实现 proof wrapper**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/cloudflare/run-proxy-proof.mjs` with:

```js
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const OUTPUT = "reports/cloudflare-proxy/proof-artifact.json";

const COMMANDS = [
  { name: "next-build", command: "pnpm", args: ["build"] },
  { name: "cloudflare-build", command: "pnpm", args: ["build:cf"] },
  { name: "cf-preview-smoke", command: "pnpm", args: ["smoke:cf:preview"] },
  {
    name: "cf-preview-smoke-strict",
    command: "pnpm",
    args: ["smoke:cf:preview:strict"],
  },
];

async function runCommand(step) {
  await mkdir("reports/cloudflare-proxy", { recursive: true });
  const logPath = `reports/cloudflare-proxy/${step.name}.log`;

  return new Promise((resolve) => {
    const child = spawn(step.command, step.args, {
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
      process.stderr.write(chunk);
    });
    child.on("close", async (code) => {
      await writeFile(logPath, output);
      resolve({
        name: step.name,
        exitCode: code ?? 1,
        logPath,
      });
    });
  });
}

async function main() {
  const steps = [];
  for (const command of COMMANDS) {
    const result = await runCommand(command);
    steps.push(result);
    if (result.exitCode !== 0) {
      break;
    }
  }

  const artifact = {
    subject: "src/proxy.ts",
    checkedAt: new Date().toISOString(),
    steps,
  };

  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(artifact, null, 2)}\n`);

  if (steps.some((step) => step.exitCode !== 0)) {
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("[run-proxy-proof] unexpected error:", error);
    process.exit(1);
  });
}
```

- [ ] **Step 6: proof 分支跑平台验证，不能并行跑 build 和 build:cf**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/cloudflare-next-proxy-proof
node /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/cloudflare/run-proxy-proof.mjs
```

Expected:

- command runs `pnpm build`, then `pnpm build:cf`, then both Cloudflare smoke commands sequentially.
- `reports/cloudflare-proxy/proof-artifact.json` exists in the proof worktree.
- each step in the artifact contains `name`, `exitCode`, and `logPath`.
- a failing command stops later commands and records the failure.

- [ ] **Step 7: 实现 proof check 脚本**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/cloudflare/proxy-proof-check.mjs` with:

```js
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export function readProxyProofArtifact(rawJson) {
  const parsed = JSON.parse(rawJson);
  return {
    subject: parsed.subject,
    steps: parsed.steps,
  };
}

export function parseBuildWarnings(logText) {
  const warnings = [];
  if (/middleware file convention is deprecated|please use proxy/i.test(logText)) {
    warnings.push("middleware-deprecated");
  }
  return warnings;
}

export function classifyProxyProof({ subject, steps, warnings }) {
  const blockers = steps
    .filter((step) => step.exitCode !== 0)
    .map((step) => `${step.name} failed with exit code ${step.exitCode}`);

  return {
    ok: blockers.length === 0,
    recommendation: blockers.length === 0 ? "proxy-compatible" : "keep-middleware",
    blockers,
    warnings,
  };
}

async function main() {
  const artifactPath =
    process.argv[2] ?? "reports/cloudflare-proxy/proof-artifact.json";
  const artifact = readProxyProofArtifact(await readFile(artifactPath, "utf8"));
  const warningText = await Promise.all(
    artifact.steps.map((step) => readFile(step.logPath, "utf8").catch(() => "")),
  );
  const result = classifyProxyProof({
    ...artifact,
    warnings: parseBuildWarnings(warningText.join("\n")),
  });

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) {
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("[proxy-proof-check] unexpected error:", error);
    process.exit(1);
  });
}
```

- [ ] **Step 7: 写 proof 文档**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/proofs/cloudflare-proxy-proof.md` with:

```md
# Cloudflare Next Proxy Proof

## Decision

Do not rename `src/middleware.ts` to `src/proxy.ts` on main until Cloudflare/OpenNext proof passes.

## Why this exists

Next.js 16 warns that the middleware file convention is deprecated and recommends proxy. This project also targets Cloudflare/OpenNext, so the migration must prove both Next build compatibility and Cloudflare runtime behavior.

## Proof branch

Use a separate branch:

```bash
proof/cloudflare-next-proxy
```

Use a separate worktree:

```text
/Users/Data/conductor/workspaces/tianze-website/cloudflare-next-proxy-proof
```

## Required local docs check

Before changing code, read the installed Next docs from:

```text
node_modules/next/dist/docs/
```

The installed package docs are the source of truth for this repository.

## Required proof commands

Run the wrapper. It runs these sequentially, not in parallel, and writes exit codes plus logs:

```bash
node /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/cloudflare/run-proxy-proof.mjs
```

Artifact:

```text
reports/cloudflare-proxy/proof-artifact.json
```

## Mainline rule

- If all commands pass with `src/proxy.ts`, open a separate migration PR.
- If Cloudflare/OpenNext fails, keep `src/middleware.ts` and update docs to say Next migration is blocked by platform proof.
- Do not mix this migration with SEO/content/proof changes.
```

- [ ] **Step 8: 新增 package script 并跑测试**

Modify `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`:

```json
"proof:cf:proxy": "node scripts/cloudflare/proxy-proof-check.mjs reports/cloudflare-proxy/proof-artifact.json"
```

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm exec vitest run tests/unit/scripts/cloudflare-proxy-proof-check.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
git add package.json docs/proofs/cloudflare-proxy-proof.md scripts/cloudflare/run-proxy-proof.mjs scripts/cloudflare/proxy-proof-check.mjs tests/unit/scripts/cloudflare-proxy-proof-check.test.ts
git commit -m "docs: add Cloudflare proxy proof lane"
```

Expected: commit succeeds.

### Task 6: Route mode manual proof 和 client boundary guard

**Files:**
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/quality/route-mode-proof.md`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/client-boundary-budget.mjs`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/client-boundary-budget.test.ts`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/quality/client-boundary-budget.json`
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/run-all-guardrails-review.js`

- [ ] **Step 1: 写 route mode manual proof 文档**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/quality/route-mode-proof.md` with:

```md
# Route Mode Proof

## Decision

Route mode is a manual proof lane in this wave. Do not add an automated route-mode gate until the project has a stable, version-checked parser for Next.js 16 build artifacts.

## Why

The previous plan described a script that would read `reports/quality/route-mode-current.json`, but no step generated that file from `.next`. Because `reports/` is ignored, that design is not reproducible from a clean checkout.

## Manual proof command

Run:

```bash
pnpm build
```

Then inspect the Next.js route summary printed by the build. Record the route mode evidence in the repair PR notes for these pages:

- `/en`
- `/zh`
- `/en/contact`
- `/zh/contact`
- `/en/products`
- `/en/products/north-america`
- `/en/about`

## Follow-up automation rule

Only add `review:route-mode` when the script can derive current route mode from a stable artifact in the same run, create its own report directory, and pass from a clean checkout.
```

- [ ] **Step 2: 写 client boundary 失败测试**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/client-boundary-budget.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
  compareClientBoundaryBudget,
  findClientBoundaryFiles,
} from "../../../scripts/client-boundary-budget.mjs";

describe("client-boundary-budget", () => {
  it("finds files with use client directive", () => {
    expect(
      findClientBoundaryFiles([
        { path: "src/a.tsx", source: '"use client";\nexport function A() {}' },
        { path: "src/b.tsx", source: "export function B() {}" },
      ]),
    ).toEqual(["src/a.tsx"]);
  });

  it("fails when boundary count exceeds budget", () => {
    expect(
      compareClientBoundaryBudget({
        budget: { maxClientBoundaryFiles: 1, allowedFiles: ["src/a.tsx"] },
        currentFiles: ["src/a.tsx", "src/b.tsx"],
      }),
    ).toEqual({
      ok: false,
      excessFiles: ["src/b.tsx"],
      count: 2,
      maxClientBoundaryFiles: 1,
    });
  });
});
```

- [ ] **Step 3: 实现 client boundary 脚本**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/client-boundary-budget.mjs` with:

```js
import { glob } from "glob";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export function findClientBoundaryFiles(files) {
  return files
    .filter((file) => /^\s*["']use client["'];?/.test(file.source))
    .map((file) => file.path)
    .sort();
}

export function compareClientBoundaryBudget({ budget, currentFiles }) {
  const allowed = new Set(budget.allowedFiles);
  const excessFiles = currentFiles.filter((file) => !allowed.has(file));
  const countExceeded = currentFiles.length > budget.maxClientBoundaryFiles;
  return {
    ok: excessFiles.length === 0 && !countExceeded,
    excessFiles,
    count: currentFiles.length,
    maxClientBoundaryFiles: budget.maxClientBoundaryFiles,
  };
}

async function readSourceFiles() {
  const paths = await glob("src/**/*.{ts,tsx}", {
    ignore: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  });
  return Promise.all(
    paths.map(async (path) => ({ path, source: await readFile(path, "utf8") })),
  );
}

async function main() {
  const budget = JSON.parse(
    await readFile("docs/quality/client-boundary-budget.json", "utf8"),
  );
  const currentFiles = findClientBoundaryFiles(await readSourceFiles());
  const result = compareClientBoundaryBudget({ budget, currentFiles });
  await mkdir(dirname("reports/quality/client-boundary-budget.json"), {
    recursive: true,
  });
  await writeFile(
    "reports/quality/client-boundary-budget.json",
    `${JSON.stringify({ ...result, currentFiles }, null, 2)}\n`,
  );
  if (!result.ok) {
    console.error("[client-boundary] budget failed");
    process.exit(1);
  }
  console.log("[client-boundary] budget passed");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("[client-boundary] unexpected error:", error);
    process.exit(1);
  });
}
```

- [ ] **Step 4: 创建初始 budget 文件**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/quality/client-boundary-budget.json` with:

```json
{
  "maxClientBoundaryFiles": 60,
  "allowedFiles": []
}
```

Then populate `allowedFiles` from current source:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
grep -R -l '^[[:space:]]*["'\"'"]use client["'\"'"]' src --include='*.tsx' --include='*.ts' | sort
```

Expected: command outputs current client boundary file list. Paste that exact list into `allowedFiles`, one string per file. Do not invent paths.

- [ ] **Step 5: 新增 package scripts**

Modify `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`:

```json
"review:client-boundary": "node scripts/client-boundary-budget.mjs"
```

- [ ] **Step 6: 将 client boundary 接入 all guardrails**

Modify `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/run-all-guardrails-review.js` so the command list includes:

```js
{
  name: "client-boundary",
  command: "pnpm",
  args: ["review:client-boundary"],
}
```

Do not add `review:route-mode` here until route current generation is fully automated from stable build artifacts; route mode remains manual/build-dependent in this wave.

- [ ] **Step 7: 运行单测和 guard**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm exec vitest run tests/unit/scripts/client-boundary-budget.test.ts
pnpm review:client-boundary
```

Expected: tests PASS and client-boundary budget PASS after `allowedFiles` is populated.

- [ ] **Step 8: Commit**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
git add package.json scripts/client-boundary-budget.mjs scripts/run-all-guardrails-review.js tests/unit/scripts/client-boundary-budget.test.ts docs/quality/route-mode-proof.md docs/quality/client-boundary-budget.json
git commit -m "chore: add route and client boundary guards"
```

Expected: commit succeeds.

---

## Wave 3：代码和内容质量深化

### Task 7: 生成热点瘦身 register

**Files:**
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/hotspot-slimming-report.mjs`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/hotspot-slimming-report.test.ts`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/quality/hotspot-slimming-register.md`
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`

- [ ] **Step 1: 写失败测试**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/hotspot-slimming-report.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
  rankHotspotCandidates,
  renderHotspotRegister,
} from "../../../scripts/hotspot-slimming-report.mjs";

describe("hotspot-slimming-report", () => {
  it("prioritizes critical source hotspots", () => {
    expect(
      rankHotspotCandidates([
        { file: "src/lib/seo-metadata.ts", complexity: 40, lines: 300 },
        { file: "docs/example.md", complexity: 90, lines: 1000 },
        { file: "src/lib/lead-pipeline/process-lead.ts", complexity: 30, lines: 220 },
      ]),
    ).toEqual([
      { file: "src/lib/seo-metadata.ts", complexity: 40, lines: 300, score: 70 },
      {
        file: "src/lib/lead-pipeline/process-lead.ts",
        complexity: 30,
        lines: 220,
        score: 52,
      },
    ]);
  });

  it("renders a register with explicit no-behavior-change rule", () => {
    expect(
      renderHotspotRegister([
        { file: "src/lib/seo-metadata.ts", complexity: 40, lines: 300, score: 70 },
      ]),
    ).toContain("No behavior change is allowed without a failing characterization test.");
  });
});
```

- [ ] **Step 2: 实现 report 脚本**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/hotspot-slimming-report.mjs` with:

```js
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SOURCE_PREFIXES = [
  "src/lib/lead-pipeline/",
  "src/lib/seo-metadata.ts",
  "src/lib/structured-data-generators.ts",
  "scripts/",
];

export function rankHotspotCandidates(rows) {
  return rows
    .filter((row) => SOURCE_PREFIXES.some((prefix) => row.file.startsWith(prefix)))
    .map((row) => ({
      ...row,
      score: row.complexity + Math.round(row.lines / 10),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);
}

export function renderHotspotRegister(candidates) {
  const lines = [
    "# Hotspot Slimming Register",
    "",
    "No behavior change is allowed without a failing characterization test.",
    "",
    "| File | Complexity | Lines | Score | Plan | Verification |",
    "| --- | ---: | ---: | ---: | --- | --- |",
  ];

  for (const candidate of candidates) {
    lines.push(
      `| \`${candidate.file}\` | ${candidate.complexity} | ${candidate.lines} | ${candidate.score} | Characterize first, then extract helpers in small steps. | Focused unit tests + type-check + lint. |`,
    );
  }

  lines.push("");
  return lines.join("\n");
}

async function main() {
  const metricsPath = process.argv[2] ?? "reports/quality/hotspots.json";
  const outputPath = "docs/quality/hotspot-slimming-register.md";
  const rows = JSON.parse(await readFile(metricsPath, "utf8"));
  const candidates = rankHotspotCandidates(rows);
  await writeFile(outputPath, renderHotspotRegister(candidates));
  console.log(`[hotspot-slimming] wrote ${outputPath}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("[hotspot-slimming] unexpected error:", error);
    process.exit(1);
  });
}
```

- [ ] **Step 3: 新增 package script**

Modify `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`:

```json
"review:hotspot-slimming": "node scripts/hotspot-slimming-report.mjs"
```

- [ ] **Step 4: 运行架构指标并生成 register**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm arch:metrics
pnpm arch:hotspots
```

If existing hotspot output is not JSON, convert only the top rows into `reports/quality/hotspots.json` with this shape:

```json
[
  { "file": "src/lib/seo-metadata.ts", "complexity": 40, "lines": 300 },
  { "file": "src/lib/structured-data-generators.ts", "complexity": 35, "lines": 380 },
  { "file": "src/lib/lead-pipeline/process-lead.ts", "complexity": 30, "lines": 220 }
]
```

Use actual metrics from the command output, not the sample numbers above.

Then run:

```bash
pnpm exec vitest run tests/unit/scripts/hotspot-slimming-report.test.ts
pnpm review:hotspot-slimming reports/quality/hotspots.json
```

Expected: test PASS and `docs/quality/hotspot-slimming-register.md` is created.

- [ ] **Step 5: Commit**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
git add package.json scripts/hotspot-slimming-report.mjs tests/unit/scripts/hotspot-slimming-report.test.ts docs/quality/hotspot-slimming-register.md
git commit -m "chore: add hotspot slimming register"
```

Expected: commit succeeds.

### Task 8: SEO metadata 小步瘦身并守住 contact canonical 合同

**Files:**
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/seo-metadata.ts`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/__tests__/seo-metadata.characterization.test.ts`

- [ ] **Step 1: 写 characterization test**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/__tests__/seo-metadata.characterization.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { generateMetadataForPath } from "../seo-metadata";

describe("seo metadata characterization", () => {
  it("generates one production canonical for contact path", () => {
    const metadata = generateMetadataForPath({
      locale: "en",
      pageType: "contact",
      path: "/contact",
      config: {
        title: "Contact Tianze",
        description: "Contact Tianze for PVC conduit fittings.",
        keywords: ["PVC conduit fittings"],
      },
    });

    expect(metadata.alternates?.canonical?.toString()).toContain("/en/contact");
    expect(metadata.alternates?.canonical?.toString()).not.toContain(
      "localhost",
    );
  });

  it("keeps locale alternates for en zh and x-default", () => {
    const metadata = generateMetadataForPath({
      locale: "en",
      pageType: "products",
      path: "/products",
      config: {
        title: "Products",
        description: "PVC conduit fittings products.",
      },
    });

    expect(metadata.alternates?.languages).toMatchObject({
      en: expect.stringContaining("/en/products"),
      zh: expect.stringContaining("/zh/products"),
      "x-default": expect.stringContaining("/en/products"),
    });
  });
});
```

- [ ] **Step 2: 运行测试，记录当前行为**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm exec vitest run src/lib/__tests__/seo-metadata.characterization.test.ts
```

Expected: PASS if function already behaves correctly in isolation; FAIL if current function contract is already broken. If it fails because the test signature does not match actual `generateMetadataForPath`, adjust the test to call the current exported signature, not the implementation.

- [ ] **Step 3: 阅读当前函数并只抽 helper**

Open current file:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
sed -n '1,320p' src/lib/seo-metadata.ts
```

Extract only pure helper functions inside `src/lib/seo-metadata.ts`, for example:

```ts
function buildLocalizedPath(locale: Locale, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalizedPath === "/" ? "" : normalizedPath}`;
}

function buildLanguageAlternates(path: string) {
  return {
    en: buildAbsoluteUrl(buildLocalizedPath("en", path)),
    zh: buildAbsoluteUrl(buildLocalizedPath("zh", path)),
    "x-default": buildAbsoluteUrl(buildLocalizedPath("en", path)),
  };
}
```

Use actual existing types and URL helper names from the file. Do not change public exported function names.

- [ ] **Step 4: 运行 focused tests**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm exec vitest run src/lib/__tests__/seo-metadata.characterization.test.ts
pnpm test:e2e:page-contracts
```

Expected: characterization PASS. `page-contracts` should PASS only after placeholder adaptation work is complete; if it still fails on known trust asset placeholder, record it and continue to Task 11.

- [ ] **Step 5: Commit**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
git add src/lib/seo-metadata.ts src/lib/__tests__/seo-metadata.characterization.test.ts
git commit -m "refactor: characterize SEO metadata contracts"
```

Expected: commit succeeds.

### Task 9: Structured data generators 小步瘦身

**Files:**
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/structured-data-generators.ts`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/__tests__/structured-data-generators.characterization.test.ts`

- [ ] **Step 1: 写 characterization test**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/__tests__/structured-data-generators.characterization.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
  buildLocalBusinessSchema,
  generateOrganizationData,
  generateProductGroupData,
  generateWebSiteData,
} from "../structured-data-generators";

const t = (key: string, options?: { defaultValue?: string }) =>
  options?.defaultValue ?? key;

describe("structured data generators characterization", () => {
  it("keeps organization schema identity stable", () => {
    const data = generateOrganizationData(t, {});
    expect(data["@type"]).toBe("Organization");
    expect(data.name).toMatch(/Tianze/i);
    expect(JSON.stringify(data)).not.toContain("+86-518-0000-0000");
  });

  it("keeps website schema searchable", () => {
    const data = generateWebSiteData(t, {});
    expect(data["@type"]).toBe("WebSite");
    expect(data.url).toMatch(/^https:\/\//);
  });

  it("keeps product group schema typed as ProductGroup", () => {
    const data = generateProductGroupData({
      name: "PVC Conduit Fittings",
      description: "PVC conduit fittings for distributor sourcing.",
      url: "https://www.tianze-pipe.com/en/products",
      brand: "Tianze",
      products: [
        {
          name: "PVC Coupling",
          image: "https://www.tianze-pipe.com/images/products/pvc-fittings.svg",
        },
      ],
    });
    expect(data["@type"]).toBe("ProductGroup");
    expect(data.name).toBe("PVC Conduit Fittings");
  });

  it("local business schema does not expose fake phone", () => {
    expect(
      JSON.stringify(
        buildLocalBusinessSchema({
          name: "Tianze",
          address: "Lianyungang, Jiangsu, China",
          phone: undefined,
        }),
      ),
    ).not.toContain("+86-518-0000-0000");
  });
});
```

- [ ] **Step 2: 运行测试，确认当前行为**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm exec vitest run src/lib/__tests__/structured-data-generators.characterization.test.ts
```

Expected before trust-asset adaptation: tests may fail if fake phone is still emitted. Keep the failure as evidence and fix through config/content readiness adaptation, not by deleting schema wholesale.

- [ ] **Step 3: 抽取纯 helper，不改变 schema 输出**

Open file:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
sed -n '1,420p' src/lib/structured-data-generators.ts
```

Refactor only repeated small pieces into helpers, for example:

```ts
function definedSchemaEntries<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== ""),
  ) as T;
}
```

Use the actual output shape from the file. Do not rename exported functions.

- [ ] **Step 4: 运行 focused tests**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm exec vitest run src/lib/__tests__/structured-data-generators.characterization.test.ts
pnpm type-check
```

Expected: PASS after trust-asset adaptation is complete. If fake phone remains by design until owner provides real data, the adaptation must hide empty/fake phone from schema instead of emitting it.

- [ ] **Step 5: Commit**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
git add src/lib/structured-data-generators.ts src/lib/__tests__/structured-data-generators.characterization.test.ts
git commit -m "refactor: characterize structured data generators"
```

Expected: commit succeeds.

### Task 10: Lead pipeline partial success 行为合同

**Files:**
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/lead-pipeline/process-lead.ts`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/lead-pipeline/__tests__/process-lead.characterization.test.ts`

- [ ] **Step 1: 写 characterization test**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/lead-pipeline/__tests__/process-lead.characterization.test.ts` with:

```ts
import { describe, expect, it, vi } from "vitest";
import { processLead } from "../process-lead";

describe("processLead characterization", () => {
  it("returns partial success when at least one non-critical service succeeds", async () => {
    const result = await processLead({
      kind: "contact",
      payload: {
        firstName: "Test",
        lastName: "Buyer",
        email: "buyer@example.com",
        company: "Example Distributor",
        message: "Need PVC conduit fittings.",
        acceptPrivacy: true,
      },
      services: {
        airtable: vi.fn().mockResolvedValue({ ok: true, id: "rec123" }),
        email: vi.fn().mockRejectedValue(new Error("email unavailable")),
      },
    });

    expect(result.status).toBe("partial-success");
    expect(JSON.stringify(result)).toContain("email unavailable");
  });
});
```

If current `processLead` does not accept injectable services, adapt the test to the existing testing pattern in `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/lib/lead-pipeline/__tests__/process-lead.test.ts`. The behavior being locked is partial success observability, not a specific dependency injection style.

- [ ] **Step 2: 运行测试，确认当前调用方式**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm exec vitest run src/lib/lead-pipeline/__tests__/process-lead.characterization.test.ts src/lib/lead-pipeline/__tests__/process-lead.test.ts
```

Expected: PASS after aligning to current processLead API. If the new characterization exposes missing behavior, preserve the failing test and implement the smallest behavior-safe fix.

- [ ] **Step 3: 拆小 processLead 内部 helper**

Open current process-lead implementation:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
sed -n '1,320p' src/lib/lead-pipeline/process-lead.ts
```

Extract only pure decision helpers, for example:

```ts
function classifyLeadPipelineStatus(results: ServiceResult[]): LeadPipelineStatus {
  if (results.every((result) => result.ok)) {
    return "success";
  }
  if (results.some((result) => result.ok)) {
    return "partial-success";
  }
  return "failed";
}
```

Use actual existing types and names. Keep external return shape unchanged.

- [ ] **Step 4: 运行 lead family tests**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm test:lead-family
pnpm exec vitest run src/lib/lead-pipeline/__tests__/process-lead.characterization.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
git add src/lib/lead-pipeline/process-lead.ts src/lib/lead-pipeline/__tests__/process-lead.characterization.test.ts
git commit -m "refactor: characterize lead pipeline status handling"
```

Expected: commit succeeds.

### Task 11: Content readiness guard 和占位资产适配

**Files:**
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/content-readiness-check.mjs`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/content-readiness-check.test.ts`
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`
- Modify likely: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/config/single-site.ts`
- Modify likely: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/public/images/products/sample-product.svg`

- [ ] **Step 1: 写失败测试**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/content-readiness-check.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
  checkContentReadiness,
  shouldScanLivePath,
} from "../../../scripts/content-readiness-check.mjs";

describe("content-readiness-check", () => {
  it("scans live source and public paths", () => {
    expect(shouldScanLivePath("src/config/single-site.ts")).toBe(true);
    expect(shouldScanLivePath("src/config/public-trust.ts")).toBe(false);
    expect(shouldScanLivePath("public/images/products/sample-product.svg")).toBe(
      true,
    );
    expect(shouldScanLivePath("src/lib/__tests__/structured-data.test.ts")).toBe(
      false,
    );
    expect(shouldScanLivePath("src/components/foo.test.tsx")).toBe(false);
    expect(shouldScanLivePath("content/_archive/old.md")).toBe(false);
    expect(shouldScanLivePath("docs/superpowers/plans/example.md")).toBe(false);
  });

  it("detects obvious launch-facing placeholders", () => {
    expect(
      checkContentReadiness([
        {
          path: "src/config/single-site.ts",
          text: 'phone: "+86-518-0000-0000"',
        },
        {
          path: "public/images/products/sample-product.svg",
          text: "Replace this image with your real product photo",
        },
      ]),
    ).toEqual({
      ok: false,
      findings: [
        {
          path: "src/config/single-site.ts",
          label: "fake phone",
          match: "+86-518-0000-0000",
        },
        {
          path: "public/images/products/sample-product.svg",
          label: "sample product replacement instruction",
          match: "Replace this image",
        },
      ],
    });
  });
});
```

- [ ] **Step 2: 实现 content readiness check**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/content-readiness-check.mjs` with:

```js
import { glob } from "glob";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const LIVE_PREFIXES = ["content/pages/", "messages/", "public/images/"];
const LIVE_EXACT_FILES = ["src/config/single-site.ts"];
const EXCLUDED_PREFIXES = [
  "content/_archive/",
  "docs/",
  "reports/",
  "node_modules/",
  ".next/",
  ".open-next/",
  "src/config/public-trust.ts",
];
const EXCLUDED_PATH_PATTERNS = [
  /\/__tests__\//,
  /\.test\.[cm]?[jt]sx?$/,
  /\.spec\.[cm]?[jt]sx?$/,
  /\/__mocks__\//,
];

const PATTERNS = [
  { label: "fake phone", pattern: /\+86-518-0000-0000/i },
  {
    label: "sample product replacement instruction",
    pattern: /Replace this image/i,
  },
  { label: "sample product label", pattern: /Sample Product/i },
  { label: "missing translation marker", pattern: /MISSING_MESSAGE/i },
  { label: "template todo marker", pattern: /\bTODO\b/i },
];

export function shouldScanLivePath(path) {
  return (
    (LIVE_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
      LIVE_EXACT_FILES.includes(path)) &&
    !EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix)) &&
    !EXCLUDED_PATH_PATTERNS.some((pattern) => pattern.test(path))
  );
}

export function checkContentReadiness(files) {
  const findings = [];

  for (const file of files) {
    if (!shouldScanLivePath(file.path)) {
      continue;
    }
    for (const { label, pattern } of PATTERNS) {
      const match = file.text.match(pattern);
      if (match) {
        findings.push({ path: file.path, label, match: match[0] });
      }
    }
  }

  return { ok: findings.length === 0, findings };
}

async function readLiveFiles() {
  const globbedPaths = await glob(
    "{content/pages,messages,public/images}/**/*",
    {
      nodir: true,
      ignore: ["content/_archive/**"],
    },
  );
  const paths = [...globbedPaths, ...LIVE_EXACT_FILES].filter(
    shouldScanLivePath,
  );

  const files = [];
  for (const path of paths) {
    files.push({ path, text: await readFile(path, "utf8") });
  }
  return files;
}

async function main() {
  const result = checkContentReadiness(await readLiveFiles());
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) {
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("[content-readiness] unexpected error:", error);
    process.exit(1);
  });
}
```

- [ ] **Step 3: 新增 package script**

Modify `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`:

```json
"content:readiness": "node scripts/content-readiness-check.mjs"
```

- [ ] **Step 4: 跑测试和 readiness，确认当前会抓到已知问题**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm exec vitest run tests/unit/scripts/content-readiness-check.test.ts
pnpm content:readiness
```

Expected before adaptation: `content:readiness` FAILS and reports fake phone / sample product / replacement instruction if they still exist.

- [ ] **Step 5: 适配公开电话，不填假电话**

Modify `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/src/config/single-site.ts`:

- Replace hardcoded fake phone with an empty optional value or owner-provided configuration placeholder that does not render as a phone.
- The runtime rule is: if phone is empty or marked unavailable, UI and JSON-LD must omit telephone instead of emitting fake data.

Use this shape if the current config allows it:

```ts
phone: "",
phoneDisplay: "",
```

If current types reject empty string, add a typed optional field:

```ts
phone: undefined,
phoneDisplay: undefined,
```

Then update renderers/schema builders to skip missing phone.

- [ ] **Step 6: 适配 sample product 图，不要求真实产品图**

Modify `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/public/images/products/sample-product.svg`:

- Remove visible text `Sample Product`.
- Remove visible text `Replace this image with your real product photo`.
- Replace with neutral non-deceptive text such as `Product image pending`.

Acceptable SVG text:

```svg
<text ...>Product image pending</text>
```

This keeps a usable placeholder asset without pretending to be a real product photo and without shipping internal replacement instructions.

- [ ] **Step 7: 运行 content readiness 和 page contracts**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm content:readiness
pnpm test:e2e:page-contracts
```

Expected: PASS. If `page-contracts` still fails because `/images/logo.svg` is referenced but absent, add a neutral `public/images/logo.svg` placeholder or update config to omit logo until real asset exists. Do not leave a broken public URL.

- [ ] **Step 8: 接入 CI**

Modify `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/.github/workflows/ci.yml` in the existing quality/content job to add:

```yaml
      - name: 内容上线就绪检查
        run: pnpm content:readiness
```

Place it near translation/content/config validation steps, not after deployment.

- [ ] **Step 9: Commit**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
git add package.json .github/workflows/ci.yml scripts/content-readiness-check.mjs tests/unit/scripts/content-readiness-check.test.ts src/config/single-site.ts public/images/products/sample-product.svg public/images/logo.svg
git commit -m "fix: guard launch-facing placeholder content"
```

Expected: commit succeeds. If `public/images/logo.svg` was not needed, omit it from `git add`.

### Task 12: Preview observability summary

**Files:**
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/deploy/preview-observability-summary.mjs`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/preview-observability-summary.test.ts`
- Create: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/guides/PREVIEW-OBSERVABILITY.md`
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`
- Modify: `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/.github/workflows/vercel-deploy.yml`

- [ ] **Step 1: 写失败测试**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/tests/unit/scripts/preview-observability-summary.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
  buildObservabilityReport,
  summarizeHeaders,
} from "../../../scripts/deploy/preview-observability-summary.mjs";

describe("preview-observability-summary", () => {
  it("summarizes request observability headers", () => {
    expect(
      summarizeHeaders({
        "x-request-id": "req_123",
        "x-observability-surface": "api:health",
      }),
    ).toEqual({
      requestId: "req_123",
      surface: "api:health",
      ok: true,
      missing: [],
    });
  });

  it("reports missing headers", () => {
    expect(summarizeHeaders({})).toEqual({
      requestId: "",
      surface: "",
      ok: false,
      missing: ["x-request-id", "x-observability-surface"],
    });
  });

  it("builds stable report", () => {
    expect(
      buildObservabilityReport({
        baseUrl: "https://example-preview.vercel.app",
        checkedAt: "2026-05-01T00:00:00.000Z",
        probes: [
          {
            pathname: "/api/health",
            status: 200,
            requestId: "req_123",
            surface: "api:health",
            ok: true,
            missing: [],
          },
        ],
      }),
    ).toEqual({
      tool: "preview-observability-summary",
      baseUrl: "https://example-preview.vercel.app",
      checkedAt: "2026-05-01T00:00:00.000Z",
      ok: true,
      probes: [
        {
          pathname: "/api/health",
          status: 200,
          requestId: "req_123",
          surface: "api:health",
          ok: true,
          missing: [],
        },
      ],
    });
  });
});
```

- [ ] **Step 2: 实现 observability summary 脚本**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/scripts/deploy/preview-observability-summary.mjs` with:

```js
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_OUTPUT = "reports/deploy/preview-observability-summary.json";
const PROBES = ["/api/health"];

export function summarizeHeaders(headers) {
  const requestId = headers["x-request-id"] ?? "";
  const surface = headers["x-observability-surface"] ?? "";
  const missing = [];
  if (!requestId) {
    missing.push("x-request-id");
  }
  if (!surface) {
    missing.push("x-observability-surface");
  }
  return { requestId, surface, ok: missing.length === 0, missing };
}

export function buildObservabilityReport({ baseUrl, checkedAt, probes }) {
  return {
    tool: "preview-observability-summary",
    baseUrl,
    checkedAt,
    ok: probes.every((probe) => probe.ok && probe.status < 500),
    probes,
  };
}

function parseArgs(argv) {
  const args = {
    baseUrl: "",
    output: DEFAULT_OUTPUT,
    headerName: "",
    headerValue: "",
  };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--base-url" && index + 1 < argv.length) {
      args.baseUrl = argv[++index];
      continue;
    }
    if (arg === "--output" && index + 1 < argv.length) {
      args.output = argv[++index];
      continue;
    }
    if (arg === "--header-name" && index + 1 < argv.length) {
      args.headerName = argv[++index];
      continue;
    }
    if (arg === "--header-value" && index + 1 < argv.length) {
      args.headerValue = argv[++index];
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  if (!args.baseUrl) {
    throw new Error("Missing required --base-url");
  }
  if (Boolean(args.headerName) !== Boolean(args.headerValue)) {
    throw new Error(
      "Both --header-name and --header-value must be provided together",
    );
  }
  return args;
}

function buildHeaders(args) {
  const headers = { "user-agent": "preview-observability-summary" };
  if (args.headerName && args.headerValue) {
    headers[args.headerName] = args.headerValue;
  }
  return headers;
}

async function probe(baseUrl, pathname, headers) {
  const response = await fetch(new URL(pathname, baseUrl), {
    headers,
    signal: AbortSignal.timeout(30000),
  });
  const responseHeaders = Object.fromEntries(response.headers.entries());
  return {
    pathname,
    status: response.status,
    ...summarizeHeaders(responseHeaders),
  };
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const args = parseArgs(process.argv);
  const headers = buildHeaders(args);
  const probes = [];
  for (const pathname of PROBES) {
    probes.push(await probe(args.baseUrl, pathname, headers));
  }
  const report = buildObservabilityReport({
    baseUrl: args.baseUrl,
    checkedAt: new Date().toISOString(),
    probes,
  });
  await writeJson(args.output, report);
  if (!report.ok) {
    console.error("[preview-observability] missing required signals");
    process.exit(1);
  }
  console.log("[preview-observability] passed");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("[preview-observability] unexpected error:", error);
    process.exit(1);
  });
}
```

- [ ] **Step 3: 写文档**

Create `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/docs/guides/PREVIEW-OBSERVABILITY.md` with:

```md
# Preview Observability

## Purpose

Preview proof should not only say a page is reachable. It should also capture enough request identity to debug a failed preview run.

## Required signals

- `x-request-id`
- `x-observability-surface`

## Command

```bash
pnpm proof:preview-observability -- --base-url https://example-preview.vercel.app
```

## Report

The script writes:

```text
reports/deploy/preview-observability-summary.json
```

The report records status, request id, surface name, and missing headers per probe.
```

- [ ] **Step 4: 新增 package script**

Modify `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/package.json`:

```json
"proof:preview-observability": "node scripts/deploy/preview-observability-summary.mjs"
```

- [ ] **Step 5: 接入 Vercel workflow**

Modify `/Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501/.github/workflows/vercel-deploy.yml` inside `post-deployment-verification`, immediately after the preview proof step from Task 2:

```yaml
      - name: 预览部署可观测性摘要
        run: |
          set -euo pipefail
          pnpm proof:preview-observability -- \
            --base-url "${{ needs.deploy-to-vercel.outputs.preview_url }}" \
            --header-name "x-vercel-protection-bypass" \
            --header-value "${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}" \
            --output reports/deploy/preview-observability-summary.json
        env:
          CI: true

      - name: 上传预览部署可观测性摘要
        if: always()
        uses: actions/upload-artifact@v7
        with:
          name: preview-observability-summary.json
          path: reports/deploy/preview-observability-summary.json
          if-no-files-found: ignore
```

This step belongs in `post-deployment-verification`, after `等待部署就绪（增强版）`, not in `deploy-to-vercel`.

- [ ] **Step 6: 运行测试**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm exec vitest run tests/unit/scripts/preview-observability-summary.test.ts
pnpm lint:check
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
git add package.json .github/workflows/vercel-deploy.yml scripts/deploy/preview-observability-summary.mjs tests/unit/scripts/preview-observability-summary.test.ts docs/guides/PREVIEW-OBSERVABILITY.md
git commit -m "ci: capture preview observability proof"
```

Expected: commit succeeds.

---

## Final verification bundle

### Task 13: 本轮整体验证

**Files:**
- No source changes unless verification exposes a real bug.

- [ ] **Step 1: 运行 focused unit tests**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm exec vitest run \
  tests/unit/scripts/preview-proof.test.ts \
  tests/unit/scripts/staging-lead-canary.test.ts \
  tests/unit/scripts/cloudflare-proxy-proof-check.test.ts \
  tests/unit/scripts/client-boundary-budget.test.ts \
  tests/unit/scripts/hotspot-slimming-report.test.ts \
  tests/unit/scripts/content-readiness-check.test.ts \
  tests/unit/scripts/preview-observability-summary.test.ts
```

Expected: PASS.

- [ ] **Step 2: 运行核心质量门禁**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm type-check
pnpm lint:check
pnpm content:readiness
pnpm review:client-boundary
```

Expected: PASS.

- [ ] **Step 3: 运行 release-facing build 和 page contracts**

Run sequentially:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm build
pnpm start
```

In another terminal:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm test:e2e:page-contracts
```

Expected: PASS.

- [ ] **Step 4: 运行 Cloudflare build proof，不和 Next build 并行**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm build
pnpm build:cf
pnpm smoke:cf:preview
pnpm smoke:cf:preview:strict
```

Expected: PASS. If Cloudflare preview requires environment secrets not present locally, record exact missing variable and run the available build proof.

- [ ] **Step 5: 运行 full local CI**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
pnpm ci:local
```

Expected: PASS.

- [ ] **Step 6: 输出最终状态**

Run:

```bash
cd /Users/Data/conductor/workspaces/tianze-website/quality-proof-uplift-waves-20260501
git status --short --branch
git log --oneline --max-count=12
```

Expected: worktree clean and recent commits match the tasks above.

---

## Starter sync

### Task 14: 把可复用品质证明能力同步到 starter 计划

**Files:**
- Modify: `/Users/Data/Warehouse/Pipe/tianze-website/docs/superpowers/plans/2026-04-30-showcase-website-starter-extraction.md`
- Later create in starter branch: `/Users/Data/workspace/showcase-website-starter/docs/website/quality-proof.md`

- [ ] **Step 1: 确认 Tianze 主实现已合并**

Run:

```bash
cd /Users/Data/Warehouse/Pipe/tianze-website
git status --short --branch
git log --oneline --max-count=5
```

Expected: main or integration branch contains merged quality/proof uplift commits. Do not sync starter from an unmerged experimental branch.

- [ ] **Step 2: 新建 starter sync 分支或切到 starter plan 分支**

Run:

```bash
cd /Users/Data/Warehouse/Pipe/tianze-website
git switch docs/showcase-website-starter-plan
git pull --ff-only
git switch -c docs/starter-quality-proof-sync
```

Expected: branch created from current starter plan branch.

- [ ] **Step 3: 更新 starter extraction plan 的同步段落**

Modify `/Users/Data/Warehouse/Pipe/tianze-website/docs/superpowers/plans/2026-04-30-showcase-website-starter-extraction.md` and add this section before final verification:

```md
## Quality Proof Capabilities to Carry into Starter

When the Tianze quality/proof uplift series is merged, carry the reusable subset into the starter. Do not carry Tianze-specific facts.

### Carry

- Preview proof runner adapted to generic website pages.
- Page contract Playwright spec with starter routes.
- Content readiness guard with generic placeholder patterns.
- Preview observability summary for health/API headers.
- Client boundary budget guard.
- Route mode baseline mechanism after the starter has its first successful production build.
- Staging lead canary pattern, renamed as a generic form canary and disabled by default.

### Do not carry

- Tianze company facts.
- Tianze product specs.
- Tianze real or pending phone/logo/product asset state.
- Airtable table names or production integration ids.
- Tianze domain names.
- Cloudflare proof result that only applies to the Tianze deployment.

### Starter naming

Use starter command names:

- `website:proof:preview`
- `website:proof:observability`
- `website:content:readiness`
- `website:review:client-boundary`
- `website:test:page-contracts`

Do not use `template:*`.
```

- [ ] **Step 4: 为 starter 目标文档写占位规划，不创建 starter 目录**

Add this target file description to the starter plan file structure:

```md
- Create later: `/Users/Data/workspace/showcase-website-starter/docs/website/quality-proof.md`
  - Documents preview proof, page contracts, content readiness, observability, and client boundary budgets for starter users.
```

Do not create `/Users/Data/workspace/showcase-website-starter` in this sync task unless the starter extraction implementation has started.

- [ ] **Step 5: 验证 starter plan 没有错误命名**

Run:

```bash
cd /Users/Data/Warehouse/Pipe/tianze-website
grep -n "template:\\|docs/template\\|template website" docs/superpowers/plans/2026-04-30-showcase-website-starter-extraction.md || true
grep -n "website:proof\\|quality-proof.md\\|Quality Proof Capabilities" docs/superpowers/plans/2026-04-30-showcase-website-starter-extraction.md
```

Expected: first command returns no forbidden naming. Second command returns the new sync section.

- [ ] **Step 6: Commit starter sync plan**

Run:

```bash
cd /Users/Data/Warehouse/Pipe/tianze-website
git add docs/superpowers/plans/2026-04-30-showcase-website-starter-extraction.md
git commit -m "docs: sync quality proof plan into starter extraction"
```

Expected: commit succeeds.

---

## Execution order

1. Task 1：preview proof script
2. Task 2：Vercel workflow preview proof
3. Task 3：page contracts
4. Task 4：staging lead canary
5. Task 5：Cloudflare proxy proof lane
6. Task 6：route/client boundary guard
7. Task 7：hotspot register
8. Task 8：SEO metadata characterization/slimming
9. Task 9：structured data characterization/slimming
10. Task 10：lead pipeline partial success characterization/slimming
11. Task 11：content readiness and placeholder adaptation
12. Task 12：preview observability
13. Task 13：final verification bundle
14. Task 14：starter sync

## Review checkpoints

- After Task 4: Wave 1 proof checkpoint. Expected new value: preview deployment proof is no longer just reachability.
- After Task 6: Wave 2 platform checkpoint. Expected new value: Cloudflare/proxy risk has a proof lane and client boundary drift is guarded.
- After Task 12: Wave 3 quality checkpoint. Expected new value: key hotspots have behavior locks, content readiness catches public placeholder drift, preview failures have observability evidence.
- After Task 14: starter sync checkpoint. Expected new value: reusable proof system is not trapped in Tianze-only code.

## Expected score movement

- Engineering health: from about 82/100 to 86-89/100 after Wave 1+2+3, because proof lanes and guardrails become fresher and more automated.
- Code quality stability: from about 76/100 to 82-86/100 after characterization tests, client boundary guard, and hotspot slimming.
- Launch readiness: from about 68-70/100 to 78-84/100 without real phone/logo/product photo, because preview proof, content readiness, canary, and observability reduce launch risk. Final real assets and owner-approved public contact details are still required for a higher score.

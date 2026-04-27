# Launch Readiness Third Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining PR #87 follow-up items without reopening the runtime cache architecture or performing destructive Cloudflare cleanup.

**Architecture:** This batch is a cleanup and proof-hardening pass after the runtime cache removal PR has landed. It keeps the chosen architecture intact: static generation plus redeploy for content updates, phase6 split-worker Cloudflare deployment, no live R2/D1/DO runtime cache bindings, and no automatic legacy Durable Object deletion. Work is split into documentation truth fixes, small code hardening, one contact-copy compatibility improvement, and a read-only legacy DO cleanup runbook.

**Tech Stack:** Next.js 16.2 App Router, React 19.2, TypeScript 5.9, Vitest, Playwright, Cloudflare Workers, OpenNext Cloudflare phase6 scripts, Wrangler.

---

## Current Safety Boundary

The implementation starts from `followup/issue-65-prefetch-topology`, one commit ahead of PR #87's merge base. That branch contains the catalog-driven prefetch patch target fix:

- `scripts/cloudflare/patch-prefetch-hints-manifest.mjs`
- `scripts/cloudflare/phase6-topology-contract.mjs`
- `tests/unit/scripts/phase6-topology-contract.test.ts`

Treat those changes as existing work. Do not overwrite or revert them. Before touching any of those paths, compare against `origin/main` and keep the existing catalog-driven prefetch patch change unless a later explicit review proves it wrong.

This batch does **not** execute legacy Cloudflare Durable Object deletion. It only tightens the read-only investigation checklist and cleanup runbook.

---

## File Structure

### Documentation and truth alignment

- Modify `exa-results/nextjs-cloudflare-pitfalls-2026-04-26.md`  
  Correct the `cookies()` wording so it no longer says `next/headers` cookies are Node-only across all server usage.

- Modify `src/lib/cache/cache-tags.ts`  
  Update stale invalidation wording to static grouping and redeploy wording.

- Modify `docs/audits/cloudflare-opennext-field-risks.md`  
  Remove the free-tier versus paid-plan contradiction and align the document with the current phase6 + Smart Placement posture.

- Modify `docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md`  
  Add the missing locale-cookie health test file to Cluster 5.

- Modify `HANDOFF.md`  
  Add a deterministic checklist for the next session and keep legacy DO cleanup explicitly separate from normal preview work.

- Modify `docs/technical/deployment-notes.md`  
  Replace the legacy DO cleanup section with safer wording: read current deployments and migration history first, never reuse migration tags, never assume phase6 deletion affects old worker names.

### Code hardening

- Modify `src/lib/contact/getContactCopy.ts`  
  Prefer top-level `contact.*` copy while preserving fallback to the existing `underConstruction.pages.contact.*` namespace.

- Modify `src/lib/__tests__/contact-get-contact-copy.test.ts`  
  Add behavior coverage for top-level `contact.*` priority and legacy namespace fallback.

- Modify `scripts/cloudflare/check-official-compare.mjs`  
  Make forbidden checks less prone to comment/string false positives, add generated-config strict mode, and make deploy script checks exact for phase6 entrypoints.

- Modify `scripts/cloudflare/build-phase6-workers.mjs`  
  Add the route matcher serialization invariant and remove stray leading tabs from generated worker templates. Keep Smart Placement inheritance unchanged in this batch.

- Modify `scripts/deploy/post-deploy-smoke.mjs`  
  Remove the dead retry-loop throw, keep intentional serial probing documented, and make retry waits visible and deterministic.

### Existing branch changes to preserve

- Preserve `scripts/cloudflare/patch-prefetch-hints-manifest.mjs`
- Preserve `scripts/cloudflare/phase6-topology-contract.mjs`
- Preserve `tests/unit/scripts/phase6-topology-contract.test.ts`

These three files already contain a catalog-driven change for prefetch patch targets on `followup/issue-65-prefetch-topology`. If this batch edits nearby phase6 code, keep that work and run the existing topology unit test.

---

## Task 0: Baseline Safety and Branch Setup

**Files:**
- Read: repository status and existing branch diff
- No code changes in this task

- [ ] **Step 1: Confirm branch and current worktree**

Run:

```bash
git status --short --branch
```

Expected:

```text
## followup/issue-65-prefetch-topology...origin/followup/issue-65-prefetch-topology
?? docs/superpowers/plans/2026-04-27-launch-readiness-third-batch.md
```

If additional files appear, inspect them before continuing and do not overwrite them.

- [ ] **Step 2: Inspect the existing phase6 branch diff**

Run:

```bash
git diff --name-status origin/main...HEAD
git diff origin/main...HEAD -- scripts/cloudflare/patch-prefetch-hints-manifest.mjs scripts/cloudflare/phase6-topology-contract.mjs tests/unit/scripts/phase6-topology-contract.test.ts
```

Expected: the diff shows `getPhase6PatchPrefetchWorkerKeys()` added to the topology contract and used by the prefetch manifest patcher. Keep that change.

- [ ] **Step 3: Create the broader third-batch branch from the current follow-up branch**

Run:

```bash
git switch -c chore/launch-readiness-third-batch
```

Expected: branch switches successfully. The untracked plan file remains present, and the prefetch topology commit remains in branch history.

- [ ] **Step 4: Run the two cheap baseline gates**

Run:

```bash
pnpm review:docs-truth
pnpm review:cf:official-compare:source
```

Expected: both commands exit 0. Artifact-level Cloudflare compare now lives behind `pnpm review:cf:official-compare` and requires `pnpm build:cf:phase6` first.

---

## Task 1: Align Documentation Wording with the Current Architecture

**Files:**
- Modify: `exa-results/nextjs-cloudflare-pitfalls-2026-04-26.md`
- Modify: `src/lib/cache/cache-tags.ts`
- Modify: `docs/audits/cloudflare-opennext-field-risks.md`
- Modify: `docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md`

- [ ] **Step 1: Correct the `cookies()` field note**

In `exa-results/nextjs-cloudflare-pitfalls-2026-04-26.md`, replace the two bullets under `### 4.1 Middleware 限制`:

```md
**[High] cookies() API 在 Worker 中静默失败**
- 来源：[lewiskori.com](https://lewiskori.com/blog/deploying-a-next-js-monorepo-to-cloudflare-workers/)
- `next/headers` 的 `cookies()` 是 Node.js only，Worker 中必须用 `req.cookies`
```

with:

```md
**[High] Middleware / Proxy cookie API 用错会静默失败**
- 来源：[lewiskori.com](https://lewiskori.com/blog/deploying-a-next-js-monorepo-to-cloudflare-workers/)
- `next/headers` 的 `cookies()` 可用于 Server Components、Server Functions 和 Route Handlers；但 Middleware / Proxy 运行在 Edge 边界，必须读取当前请求对象上的 cookies，例如 `request.cookies`
```

- [ ] **Step 2: Replace stale invalidation wording in cache tags**

In `src/lib/cache/cache-tags.ts`, replace:

```ts
/** All tags for a product (includes list tags for cascading invalidation) */
```

with:

```ts
/** Related product cache groups kept for build-time grouping; updates ship by redeploy. */
```

- [ ] **Step 3: Rewrite the paid/free tier section**

In `docs/audits/cloudflare-opennext-field-risks.md`, replace section `### B5. wrangler.jsonc 的 paid/free tier 假设要写清楚` through its three numbered action items with:

```md
### B5. Cloudflare 计划口径要保持单一

外部经验：

- Workers bundle size、CPU、构建分钟、Smart Placement、Durable Objects、R2、D1 都可能影响账单。

当前状态：

- 当前部署口径按 Workers paid plan 能力做规划：已启用 Smart Placement，并保留 phase6 split-worker 部署链。
- PR #87 已移除当前上线链路里的 R2 / D1 / Durable Object runtime cache 依赖；这些不再作为本轮上线成本项。

建议动作：

1. 部署文档只保留 paid Workers plan 口径，不再同时承诺 free-tier bundle 目标。
2. 如果未来重新引入 R2 / D1 / Durable Objects，必须重新做成本和行为评审。
3. 月度账单观察放到上线后运营检查，不阻塞当前 workers.dev preview 收尾。
```

- [ ] **Step 4: Add the missing health test file to Cluster 5**

In `docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md`, change Cluster 5 file list from:

```md
- `src/lib/cache/cache-tags.ts`
- `src/app/api/health/route.ts`
- `src/lib/api/cache-health-response.ts`
- `tests/integration/api/health.test.ts`
```

to:

```md
- `src/lib/cache/cache-tags.ts`
- `src/app/api/health/route.ts`
- `src/lib/api/cache-health-response.ts`
- `tests/integration/api/health.test.ts`
- `src/__tests__/middleware-locale-cookie.test.ts`
```

- [ ] **Step 5: Run documentation truth checks**

Run:

```bash
pnpm review:docs-truth
pnpm review:health
```

Expected: both commands exit 0.

---

## Task 2: Preserve Contact Copy Compatibility While Moving Toward `contact.*`

**Files:**
- Modify: `src/lib/__tests__/contact-get-contact-copy.test.ts`
- Modify: `src/lib/contact/getContactCopy.ts`

- [ ] **Step 1: Add a failing test for top-level `contact.*` priority**

In `src/lib/__tests__/contact-get-contact-copy.test.ts`, add this test after `beforeEach` and before `it("builds a structured copy model for the given locale"...`:

```ts
  it("prefers the top-level contact namespace over the legacy contact copy path", () => {
    const copy = getContactCopyFromMessages({
      contact: {
        title: "Top-level contact",
        description: "Top-level description",
        panel: {
          contactTitle: "Top-level methods",
          email: "Top-level email",
          phone: "Top-level phone",
          hoursTitle: "Top-level hours",
          weekdays: "Top-level weekdays",
          saturday: "Top-level saturday",
          sunday: "Top-level sunday",
          closed: "Top-level closed",
          responseTitle: "Top-level response",
          responseTimeLabel: "Top-level response label",
          responseTimeValue: "Top-level response value",
          bestForLabel: "Top-level best for",
          bestForValue: "Top-level best value",
          prepareLabel: "Top-level prepare label",
          prepareValue: "Top-level prepare value",
        },
      },
      underConstruction: {
        pages: {
          contact: {
            title: "Legacy contact",
            description: "Legacy description",
            panel: {
              contactTitle: "Legacy methods",
              email: "Legacy email",
              phone: "Legacy phone",
              hoursTitle: "Legacy hours",
              weekdays: "Legacy weekdays",
              saturday: "Legacy saturday",
              sunday: "Legacy sunday",
              closed: "Legacy closed",
              responseTitle: "Legacy response",
              responseTimeLabel: "Legacy response label",
              responseTimeValue: "Legacy response value",
              bestForLabel: "Legacy best for",
              bestForValue: "Legacy best value",
              prepareLabel: "Legacy prepare label",
              prepareValue: "Legacy prepare value",
            },
          },
        },
      },
    });

    expect(copy.header.title).toBe("Top-level contact");
    expect(copy.header.description).toBe("Top-level description");
    expect(copy.panel.contact.title).toBe("Top-level methods");
    expect(copy.panel.response.prepareValue).toBe("Top-level prepare value");
  });
```

- [ ] **Step 2: Add a test proving the legacy namespace still works**

Rename the existing test:

```ts
it("builds a structured copy model for the given locale", async () => {
```

to:

```ts
it("keeps the legacy underConstruction contact namespace as a compatibility fallback", async () => {
```

Keep its assertions unchanged. This proves `underConstruction.pages.contact.*` still works while migration to top-level `contact.*` is staged.

- [ ] **Step 3: Run the contact-copy test and verify the new priority test fails**

Run:

```bash
pnpm exec vitest run src/lib/__tests__/contact-get-contact-copy.test.ts
```

Expected: the new top-level priority test fails because `getContactCopyFromMessages()` still reads only `underConstruction.pages.contact.*`.

- [ ] **Step 4: Implement namespace priority with legacy fallback**

In `src/lib/contact/getContactCopy.ts`, replace `readContactMessage()` with this implementation:

```ts
const CONTACT_MESSAGE_ROOTS = [
  ["contact"],
  ["underConstruction", "pages", "contact"],
] as const;

function readMessageAtPath(messages: MessageRecord, pathSegments: string[]) {
  let current: unknown = messages;

  for (const segment of pathSegments) {
    if (
      typeof current !== "object" ||
      current === null ||
      !Object.prototype.hasOwnProperty.call(current, segment)
    ) {
      return null;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === "string" ? current : null;
}

function readContactMessage(messages: MessageRecord, key: string) {
  const keySegments = key.split(".");

  for (const rootSegments of CONTACT_MESSAGE_ROOTS) {
    const value = readMessageAtPath(messages, [...rootSegments, ...keySegments]);
    if (value !== null) {
      return value;
    }
  }

  return null;
}
```

- [ ] **Step 5: Update the JSDoc to describe both namespaces**

In `src/lib/contact/getContactCopy.ts`, replace:

```ts
 * Depends only on the explicit `locale` parameter and the
 * `underConstruction.pages.contact` i18n namespace.
```

with:

```ts
 * Depends only on the explicit `locale` parameter. Reads `contact.*` first and
 * falls back to the legacy `underConstruction.pages.contact.*` namespace.
```

- [ ] **Step 6: Run the targeted test**

Run:

```bash
pnpm exec vitest run src/lib/__tests__/contact-get-contact-copy.test.ts
```

Expected: all tests in that file pass.

---

## Task 3: Harden the Cloudflare Official Compare Gate

**Files:**
- Modify: `scripts/cloudflare/check-official-compare.mjs`

- [ ] **Step 1: Add argument parsing and generated-config strict mode**

Near the top of `scripts/cloudflare/check-official-compare.mjs`, after `const PHASE6_CONFIG_DIR = ...`, add:

```js
const SOURCE_ONLY = process.argv.includes("--source-only");
const REQUIRE_GENERATED_CONFIG =
  process.argv.includes("--require-generated") || !SOURCE_ONLY;
```

Expected behavior:

- Default `pnpm review:cf:official-compare` fails if `.open-next/wrangler/phase6` is absent.
- `pnpm review:cf:official-compare:source` is the source-only check to run before `pnpm build:cf:phase6`.

- [ ] **Step 2: Replace raw forbidden-snippet checks with typed checks**

Add these helpers after `function read(relPath) { ... }`:

```js
function normalizeForbiddenCheck(snippet) {
  if (typeof snippet === "string") {
    return { match: snippet, type: "substring" };
  }

  return snippet;
}

function hasForbiddenContent(content, snippet) {
  const check = normalizeForbiddenCheck(snippet);

  if (check.type === "quoted") {
    return content.includes(`"${check.match}"`) || content.includes(`'${check.match}'`);
  }

  if (check.type === "regex") {
    return check.match.test(content);
  }

  return content.includes(check.match);
}

function findForbiddenSnippets(content, snippets) {
  return snippets.filter((snippet) => hasForbiddenContent(content, snippet));
}

function formatForbiddenSnippet(snippet) {
  const check = normalizeForbiddenCheck(snippet);
  return check.type === "regex" ? check.match.toString() : check.match;
}
```

Then replace both places that use:

```js
const forbidden = check.forbiddenSnippets.filter((snippet) =>
  content.includes(snippet),
);
```

with:

```js
const forbidden = findForbiddenSnippets(content, check.forbiddenSnippets);
```

And replace generated-config forbidden filtering:

```js
const forbidden = generatedConfigForbiddenSnippets.filter((snippet) =>
  content.includes(snippet),
);
```

with:

```js
const forbidden = findForbiddenSnippets(
  content,
  generatedConfigForbiddenSnippets,
);
```

Finally, in the error printer, replace:

```js
console.error(`  - forbidden snippet still present: ${snippet}`);
```

with:

```js
console.error(
  `  - forbidden snippet still present: ${formatForbiddenSnippet(snippet)}`,
);
```

- [ ] **Step 3: Make the `apiOps` check key-like instead of comment-like**

In the `open-next.config.ts` check, replace:

```js
"apiOps",
```

with:

```js
{ match: "apiOps", type: "quoted" },
```

Keep `/api/cache/invalidate` as a substring because the URL itself must not return to the config.

- [ ] **Step 4: Make missing generated config explicit**

Replace:

```js
if (fs.existsSync(PHASE6_CONFIG_DIR)) {
  const phase6ConfigFiles = fs
    .readdirSync(PHASE6_CONFIG_DIR)
    .filter((fileName) => fileName.endsWith(".jsonc"));

  for (const fileName of phase6ConfigFiles) {
    const relPath = path.join(".open-next", "wrangler", "phase6", fileName);
    const content = read(relPath);
    const forbidden = generatedConfigForbiddenSnippets.filter((snippet) =>
      content.includes(snippet),
    );

    if (forbidden.length > 0) {
      failures.push({
        file: relPath,
        label:
          "phase6 generated deploy config must not reintroduce runtime cache bindings",
        missing: [],
        forbidden,
      });
    }
  }
}
```

with:

```js
if (fs.existsSync(PHASE6_CONFIG_DIR)) {
  const phase6ConfigFiles = fs
    .readdirSync(PHASE6_CONFIG_DIR)
    .filter((fileName) => fileName.endsWith(".jsonc"));

  for (const fileName of phase6ConfigFiles) {
    const relPath = path.join(".open-next", "wrangler", "phase6", fileName);
    const content = read(relPath);
    const forbidden = findForbiddenSnippets(
      content,
      generatedConfigForbiddenSnippets,
    );

    if (forbidden.length > 0) {
      failures.push({
        file: relPath,
        label:
          "phase6 generated deploy config must not reintroduce runtime cache bindings",
        missing: [],
        forbidden,
      });
    }
  }
} else if (REQUIRE_GENERATED_CONFIG) {
  failures.push({
    file: path.relative(ROOT, PHASE6_CONFIG_DIR),
    label: "phase6 generated deploy config must exist for strict compare",
    missing: ["run pnpm build:cf:phase6 before strict compare"],
    forbidden: [],
  });
} else {
  console.warn(
    "cf-official-compare: phase6 generated config absent; run with --require-generated after pnpm build:cf:phase6 for deploy-artifact proof.",
  );
}
```

- [ ] **Step 5: Make deploy-script checks exact where exactness is safe**

Replace `deployScriptChecks` with:

```js
const deployScriptChecks = [
  {
    name: "deploy:cf",
    expected: "pnpm deploy:cf:phase6:production",
    mode: "startsWith",
  },
  {
    name: "deploy:cf:preview",
    expected: "pnpm deploy:cf:phase6:preview",
    mode: "startsWith",
  },
  {
    name: "deploy:cf:dry-run",
    expected: "pnpm deploy:cf:phase6:dry-run",
    mode: "startsWith",
  },
  {
    name: "preview:cf:wrangler",
    expected: "legacy-entrypoint-guard.mjs",
    mode: "includes",
  },
];
```

Then replace the deploy-script loop with:

```js
for (const check of deployScriptChecks) {
  const script = scripts[check.name];
  const matches =
    typeof script === "string" &&
    (check.mode === "startsWith"
      ? script.startsWith(check.expected)
      : script.includes(check.expected));

  if (!matches) {
    failures.push({
      file: "package.json",
      label: "legacy Cloudflare deploy entrypoints must not bypass phase6",
      missing: [`${check.name}: ${check.expected}`],
      forbidden: [],
    });
  }
}
```

- [ ] **Step 6: Validate the default compare mode**

Run:

```bash
pnpm review:cf:official-compare
```

Expected: exit 0. If `.open-next/wrangler/phase6` is absent, output includes the generated-config warning and still exits 0.

- [ ] **Step 7: Validate strict compare after generating phase6 artifacts**

Run:

```bash
pnpm clean:next-artifacts
pnpm build:cf:phase6
node scripts/cloudflare/check-official-compare.mjs --require-generated
```

Expected: all three commands exit 0; strict compare proves generated phase6 config has no R2/D1/DO/migrations runtime cache keys.

---

## Task 4: Polish Phase6 Worker Generation Without Changing Topology

**Files:**
- Modify: `scripts/cloudflare/build-phase6-workers.mjs`
- Preserve: `scripts/cloudflare/phase6-topology-contract.mjs`
- Preserve: `scripts/cloudflare/patch-prefetch-hints-manifest.mjs`
- Preserve: `tests/unit/scripts/phase6-topology-contract.test.ts`

- [ ] **Step 1: Reinspect existing phase6 dirty changes**

Run:

```bash
git diff -- scripts/cloudflare/patch-prefetch-hints-manifest.mjs scripts/cloudflare/phase6-topology-contract.mjs tests/unit/scripts/phase6-topology-contract.test.ts
```

Expected: existing catalog-driven prefetch target change is still present.

- [ ] **Step 2: Add the matcher serialization invariant**

In `scripts/cloudflare/build-phase6-workers.mjs`, add this comment immediately above `const API_ROUTE_BINDING_RULES = [`:

```js
// Each matcher must be self-contained. build-phase6-workers serializes
// rule.match with .toString() into the generated gateway worker, so a matcher
// cannot close over external constants, regexes, or helper functions.
```

- [ ] **Step 3: Keep Smart Placement unchanged and document why**

In `createCommonConfig()`, replace:

```js
  if (baseConfig.placement) {
    config.placement = cloneJSON(baseConfig.placement);
  }
```

with:

```js
  // Keep placement as a deployment-wide intent. The current launch posture is
  // all phase6 workers inherit wrangler.jsonc Smart Placement until production
  // traffic proves a worker-specific placement split is better.
  if (baseConfig.placement) {
    config.placement = cloneJSON(baseConfig.placement);
  }
```

- [ ] **Step 4: Remove stray leading tabs from generated gateway imports**

In `createGatewayWorkerSource()`, replace the return string prefix:

```js
  return `//@ts-expect-error: Will be resolved by wrangler build
	import { handleImageRequest } from "../cloudflare/images.js";
//@ts-expect-error: Will be resolved by wrangler build
import { runWithCloudflareRequestContext } from "../cloudflare/init.js";
//@ts-expect-error: Will be resolved by wrangler build
	import { maybeGetSkewProtectionResponse } from "../cloudflare/skew-protection.js";
	// @ts-expect-error: Will be resolved by wrangler build
	import { handler as middlewareHandler } from "../middleware/handler.mjs";
	
	const routeRules = [
${routeRulesSource}
];
```

with:

```js
  return `//@ts-expect-error: Will be resolved by wrangler build
import { handleImageRequest } from "../cloudflare/images.js";
//@ts-expect-error: Will be resolved by wrangler build
import { runWithCloudflareRequestContext } from "../cloudflare/init.js";
//@ts-expect-error: Will be resolved by wrangler build
import { maybeGetSkewProtectionResponse } from "../cloudflare/skew-protection.js";
// @ts-expect-error: Will be resolved by wrangler build
import { handler as middlewareHandler } from "../middleware/handler.mjs";

const routeRules = [
${routeRulesSource}
];
```

- [ ] **Step 5: Remove stray leading tabs from generated service-worker imports**

In `createServiceWorkerSource()`, replace the return string prefix:

```js
  return `//@ts-expect-error: Will be resolved by wrangler build
	import { runWithCloudflareRequestContext } from "../cloudflare/init.js";
	
	let cachedHandler;
```

with:

```js
  return `//@ts-expect-error: Will be resolved by wrangler build
import { runWithCloudflareRequestContext } from "../cloudflare/init.js";

let cachedHandler;
```

- [ ] **Step 6: Run topology and generated-artifact checks**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/phase6-topology-contract.test.ts
pnpm clean:next-artifacts
pnpm build:cf:phase6
node scripts/cloudflare/check-official-compare.mjs --require-generated
```

Expected: all commands exit 0.

---

## Task 5: Make Post-Deploy Smoke Retry Behavior Easier to Trust

**Files:**
- Modify: `scripts/deploy/post-deploy-smoke.mjs`

- [ ] **Step 1: Add deterministic retry-delay helper**

After `function delay(ms) { ... }`, add:

```js
function getRetryDelayMs(attempt) {
  return RETRY_DELAY_MS * 2 ** attempt;
}
```

- [ ] **Step 2: Remove the stale `lastError` variable and dead trailing throw**

In `request()`, remove:

```js
  let lastError;
```

Remove:

```js
      lastError = error;
```

Replace both:

```js
        await delay(RETRY_DELAY_MS);
```

with:

```js
        await delay(getRetryDelayMs(attempt));
```

At the end of `request()`, replace:

```js
  throw lastError;
```

with:

```js
  throw new Error("post-deploy-smoke retry loop exited without a response");
```

- [ ] **Step 3: Document why page probes stay serial**

In `main()`, before:

```js
  const pages = [];
  for (const pathname of [
```

add:

```js
  // Probe serially so Cloudflare cold-start retries stay readable and do not
  // hammer a freshly deployed workers.dev preview.
```

- [ ] **Step 4: Run lint and the deployed smoke against the known workers.dev preview**

Run:

```bash
pnpm lint:check
pnpm smoke:cf:deploy -- --base-url https://tianze-website-gateway-preview.kei-tang.workers.dev
```

Expected:

- `pnpm lint:check` exits 0.
- Smoke exits 0 and ends with `[post-deploy-smoke] All checks passed`.
- If retries happen, the output includes `[post-deploy-smoke] Retried probes:` with path, reason, and next attempt.

---

## Task 6: Tighten HANDOFF and Legacy DO Cleanup Runbook

**Files:**
- Modify: `HANDOFF.md`
- Modify: `docs/technical/deployment-notes.md`

- [ ] **Step 1: Add deterministic next-session checklist to HANDOFF**

In `HANDOFF.md`, replace the current `## Next Steps` list with:

```md
## Next Steps

1. Third batch cleanup should run on a branch, not directly on `main`. Start with:
   - `pnpm truth:check`
   - `pnpm review:translation-quartet`
   - `pnpm review:translate-compat`
2. If touching runtime, Cloudflare, or phase6 scripts, also run:
   - `pnpm clean:next-artifacts`
   - `pnpm build`
   - `pnpm build:cf:phase6`
   - `node scripts/cloudflare/check-official-compare.mjs --require-generated`
3. Cloudflare zone 权限补齐后，确认 SSL Full Strict、DNS root/www/preview、Resend DKIM/CNAME；Worker secrets 补齐后再跑真实询盘邮件/Airtable 链路。
4. OEM / Bending Machines 的 no-JS 内容深度仍需后续单独处理；workers.dev 可访问，但 HTML 仍有 skeleton marker。
5. **Legacy DO cleanup deferred**：旧 `tianze-website*` 服务名下的 `DOQueueHandler` / `DOShardedTagCache` / `BucketCachePurge` 仍未删除。完整执行口径见 `docs/technical/deployment-notes.md` 的 Legacy Durable Object cleanup 段。前置条件：PR #87 已 merged、production phase6 稳定运行至少 7 天、Cloudflare zone 权限就位、旧 worker tail 日志确认无流量。没有用户明确确认时，只做只读调查，不执行 cleanup deploy 或 worker delete。
```

- [ ] **Step 2: Replace the legacy DO cleanup action section with safer read-first wording**

In `docs/technical/deployment-notes.md`, inside `## 2026-04-26 Legacy Durable Object cleanup boundary`, replace the subsection starting at `### 真正执行 cleanup 的步骤（独立 PR）` through `在 HANDOFF.md 移除"Legacy DO cleanup deferred"待办` with:

````md
### Legacy DO cleanup 的安全执行口径（独立维护窗口）

前置条件：

- PR #87 已 merged，且 production phase6 拓扑稳定运行至少 7 天
- 拥有能读取 Worker deployments / versions / Durable Object namespace 的 Cloudflare token 或 dashboard 权限
- 旧 `tianze-website*` Worker 服务确认不再承载流量
- 用户明确确认进入 cleanup 维护窗口

只读调查：

```bash
pnpm exec wrangler deployments list --name tianze-website --json
pnpm exec wrangler deployments list --name tianze-website-preview --json
pnpm exec wrangler deployments list --name tianze-website-production --json
pnpm exec wrangler versions list --name tianze-website --json
pnpm exec wrangler versions list --name tianze-website-preview --json
pnpm exec wrangler versions list --name tianze-website-production --json
```

尾日志确认：

```bash
pnpm exec wrangler tail tianze-website --format json
pnpm exec wrangler tail tianze-website-preview --format json
pnpm exec wrangler tail tianze-website-production --format json
```

Cleanup 设计原则：

1. DO migration 必须部署到旧 Worker 服务名本身，不能部署到 phase6 的 `tianze-website-web` / `tianze-website-api-lead` / `tianze-website-gateway`。
2. 先读取旧 Worker 的实际 deployment / version / migration 历史，再选择新的 migration tag。不要复用历史 tag。
3. `deleted_classes` 只能包含旧 Worker 当前实际存在且代码已不再引用的 DO class。
4. 不要把 `new_sqlite_classes` 写进 cleanup 配置，除非当前旧 Worker 历史证明该 class 从未注册过；否则会和历史 migration 冲突。
5. 不要直接 `wrangler delete` 旧 Worker。先完成同名 Worker 的 `deleted_classes` migration 并确认 Durable Object namespace 清空。

执行动作保持单独 PR / 单独维护窗口；本第三批只允许更新 runbook 和只读调查，不执行 cleanup deploy。

执行完后：

- 在本文档记录 cleanup 完成日期、受影响服务名、migration tag 和验证证据
- 在 `HANDOFF.md` 移除 `Legacy DO cleanup deferred` 待办
````

- [ ] **Step 3: Run doc truth and guardrail checks**

Run:

```bash
pnpm review:docs-truth
pnpm review:legacy-markers
```

Expected: both commands exit 0.

---

## Task 7: Final Verification and Commit Grouping

**Files:**
- Verify all files changed in Tasks 1-6
- No new implementation files in this task

- [ ] **Step 1: Run targeted verification**

Run:

```bash
pnpm review:docs-truth
pnpm review:cf:official-compare
pnpm exec vitest run src/lib/__tests__/contact-get-contact-copy.test.ts tests/unit/scripts/phase6-topology-contract.test.ts
pnpm lint:check
```

Expected: all commands exit 0.

- [ ] **Step 2: Run generated Cloudflare artifact proof**

Run:

```bash
pnpm clean:next-artifacts
pnpm build:cf:phase6
node scripts/cloudflare/check-official-compare.mjs --require-generated
```

Expected:

- `pnpm build:cf:phase6` exits 0.
- strict compare exits 0.
- Generated `.open-next/wrangler/phase6/*.jsonc` files do not contain `r2_buckets`, `d1_databases`, `durable_objects`, or `migrations`.

- [ ] **Step 3: Run broader local confidence checks**

Run:

```bash
pnpm type-check
pnpm review:translate-compat
```

Expected: both commands exit 0.

- [ ] **Step 4: Inspect final diff by group**

Run:

```bash
git status --short
git diff --stat
git diff -- docs/superpowers/plans/2026-04-27-launch-readiness-third-batch.md
git diff -- src/lib/contact/getContactCopy.ts src/lib/__tests__/contact-get-contact-copy.test.ts
git diff -- scripts/cloudflare/check-official-compare.mjs scripts/cloudflare/build-phase6-workers.mjs scripts/deploy/post-deploy-smoke.mjs
git diff -- HANDOFF.md docs/technical/deployment-notes.md docs/audits/cloudflare-opennext-field-risks.md docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md exa-results/nextjs-cloudflare-pitfalls-2026-04-26.md src/lib/cache/cache-tags.ts
```

Expected: no unrelated files appear. The existing prefetch topology dirty files remain part of the phase6 script group if they are still modified.

- [ ] **Step 5: Commit in three reviewable groups**

Commit documentation truth and runbook first:

```bash
git add docs/superpowers/plans/2026-04-27-launch-readiness-third-batch.md exa-results/nextjs-cloudflare-pitfalls-2026-04-26.md src/lib/cache/cache-tags.ts docs/audits/cloudflare-opennext-field-risks.md docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md HANDOFF.md docs/technical/deployment-notes.md
git commit -m "docs: align launch readiness follow-up notes"
```

Commit contact-copy compatibility second:

```bash
git add src/lib/contact/getContactCopy.ts src/lib/__tests__/contact-get-contact-copy.test.ts
git commit -m "fix: preserve contact copy namespace compatibility"
```

Commit Cloudflare and smoke hardening third:

```bash
git add scripts/cloudflare/check-official-compare.mjs scripts/cloudflare/build-phase6-workers.mjs scripts/deploy/post-deploy-smoke.mjs scripts/cloudflare/patch-prefetch-hints-manifest.mjs scripts/cloudflare/phase6-topology-contract.mjs tests/unit/scripts/phase6-topology-contract.test.ts
git commit -m "fix: harden cloudflare follow-up gates"
```

Expected: three commits are created on `chore/launch-readiness-third-batch`.

- [ ] **Step 6: Push the branch**

Run:

```bash
git push -u origin chore/launch-readiness-third-batch
```

Expected: branch is pushed successfully and ready for PR creation.

---

## Not in This Batch

- No production deployment.
- No official-domain DNS or SSL changes.
- No Resend / Airtable / Turnstile secret setup.
- No legacy Durable Object delete migration execution.
- No `wrangler delete`.
- No permanent file deletion.
- No redesign of Smart Placement policy. Current policy remains: all phase6 workers inherit `wrangler.jsonc` Smart Placement.

---

## Self-Review

### Spec coverage

- Documentation stale wording: covered by Task 1.
- Contact namespace migration safety: covered by Task 2.
- Cloudflare official compare false-positive and generated-artifact proof: covered by Task 3.
- Phase6 generator nits without topology change: covered by Task 4.
- Post-deploy smoke retry readability: covered by Task 5.
- Legacy DO cleanup runbook without destructive action: covered by Task 6.
- Verification and commit grouping: covered by Task 7.

### Placeholder scan

The plan contains no open implementation placeholders. Commands use concrete paths and the known workers.dev preview URL.

### Type and naming consistency

New contact helper names are consistent across test and implementation:

- `CONTACT_MESSAGE_ROOTS`
- `readMessageAtPath`
- `readContactMessage`

Cloudflare compare names are consistent:

- `REQUIRE_GENERATED_CONFIG`
- `normalizeForbiddenCheck`
- `hasForbiddenContent`
- `findForbiddenSnippets`
- `formatForbiddenSnippet`

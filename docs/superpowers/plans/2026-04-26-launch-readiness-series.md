# Launch Readiness Series Revised Implementation Plan

> For agentic workers: use `superpowers:executing-plans` by default. Do not run this as "one subagent per task". This plan has shared build artifacts, shared config files, and an atomic cache-removal group.

**Goal:** Remove the runtime cache invalidation architecture, keep the site on static generation plus redeploy-driven content updates, then prove Cloudflare deployment, SEO, i18n, and inquiry delivery are ready for launch.

**Architecture:** The project chooses path B: static generation + redeploy. Runtime `revalidateTag` / `revalidatePath` invalidation, R2 incremental cache, D1 tag cache, DO queue, and the `apiOps` worker split are removed from the current launch path. A narrow `"use cache"` + `cacheLife()` boundary may remain where Next.js Cache Components needs it for build correctness, but it must not use `cacheTag()` and must not become the content update mechanism. The release proof chain must be updated in the same change set, otherwise the repo will still look for deleted infrastructure.

**Tech stack:** Next.js 16.2.3, React 19.2.5, @opennextjs/cloudflare 1.18.0, Wrangler 4.79.0, next-intl, Resend, Vitest, Playwright.

## Execution Status - 2026-04-26

- Phase A completed locally.
- `pnpm release:verify` passed before the later JSON-LD / Smart Placement changes; it must be rerun before final completion.
- Cloudflare phase6 preview deploy now works with local `.env.local` credentials and automatic Server Actions key sync.
- workers.dev preview is live at `https://tianze-website-gateway-preview.kei-tang.workers.dev`.
- Deployed smoke passed against workers.dev preview after Contact runtime fix and after Smart Placement deploy.
- JSON-LD multi-script risk has been fixed: deployed HTML now shows one `application/ld+json` script per checked page with a page-level `@graph`.
- hreflang workers.dev HTML evidence passes for checked pages.
- Suspense / no-JS evidence remains an SEO quality follow-up for OEM and Bending Machines; not a runtime cache removal blocker.
- Custom domain / zone-level checks remain blocked by Cloudflare zone access: the current token can deploy Workers but cannot read the `tianze-pipe.com` zone.

---

## Execution Policy

These rules override the earlier draft.

1. **No broad staging.** Do not use `git add -A`. Stage explicit paths only, and only if the user asks for staging or commit.
2. **No destructive checkout.** Do not use `git checkout -- <file>`, `git reset --hard`, `git clean`, `rm`, `rmdir`, `find -delete`, or equivalent destructive cleanup.
3. **Trash rule.** When removing tracked files, move them to `~/.Trash/` with timestamped names, then stage the deletions explicitly if committing is requested.
4. **zsh-safe paths.** Every command path containing `[locale]` or `[market]` must be quoted, for example `'src/app/[locale]/products/[market]/page.tsx'`.
5. **Build serialization.** Never run `pnpm build`, `pnpm build:cf`, `pnpm preview:cf`, or deploy commands in parallel. They share `.next`, `.open-next`, and Cloudflare state.
6. **One owner for shared files.** Only the main executor may edit `package.json`, `open-next.config.ts`, `wrangler.jsonc`, `next.config.ts`, `docs/technical/deployment-notes.md`, and `HANDOFF.md`.
7. **Atomic group rule.** Phase A may temporarily fail type-check after early file moves. Do not stop midway unless an unexpected unrelated change appears.
8. **Evidence placeholders are allowed only in audit docs.** Use `<EVIDENCE: ...>` markers only in evidence files that are filled during live verification. Do not use placeholders in code or config.

## Subagent Boundary

Supported pattern:

| Work type | Subagent allowed | Write access |
|---|---:|---|
| Phase A cache removal implementation | No | Main executor only |
| Phase A read-only grep/check review | Yes | None |
| Phase B deployed JSON-LD / hreflang / no-JS evidence collection | Yes, after preview is stable | Separate evidence files only |
| Dashboard checks for Cloudflare / Resend | No | Human/main executor records result |
| Build / preview / deploy | No | Main executor only |
| Shared docs append to `deployment-notes.md` | No | Main executor only |

If a worker is used, give it one bounded task and tell it not to touch shared files.

## Deletion Blueprint Scan

The following scan was performed before rewriting this plan:

```bash
for pattern in \
  'cache:invalidate|test:cache-health|review:cache-health' \
  'apiOps|apiLead' \
  'WORKER_SELF_REFERENCE|NEXT_INC_CACHE_R2_BUCKET|NEXT_TAG_CACHE_D1|NEXT_CACHE_DO_QUEUE' \
  'DOQueueHandler|DOShardedTagCache|BucketCachePurge' \
  '/api/cache/invalidate' \
  'revalidateTag|revalidatePath|cacheLife\(|cacheTag\(|"use cache"' \
  'cache-directive-policy'
do
  rg -n "$pattern" . \
    --glob '!node_modules/**' \
    --glob '!.next/**' \
    --glob '!.open-next/**' \
    --glob '!coverage/**' \
    --glob '!test-results/**' \
    --glob '!playwright-report/**' \
    --glob '!docs/superpowers/plans/2026-04-26-launch-readiness-series.md'
done
```

The impacted surface is larger than the original draft. Phase A includes every current hit that is part of live code, tests, release proof, Cloudflare topology, or repo governance.

---

# Phase A: Runtime Cache Removal and Proof Chain Repair

**Phase type:** atomic implementation group.

**Do not split into independent subagents.** Tasks A1-A8 are one logical change. Early tasks intentionally remove code that later tasks repair in tests, scripts, and docs.

## Task A0: Baseline and Guardrails

**Files:** none.

- [ ] Check current worktree:

```bash
git status --short
```

Expected known untracked files may include:

```text
?? docs/audits/
?? docs/superpowers/plans/2026-04-26-launch-readiness-series.md
?? exa-results/
```

Do not stage unrelated untracked files unless the user asks.

- [ ] Confirm no preview/build process is running from another terminal before any build task.

- [ ] Read these rules before editing:

```bash
sed -n '1,220p' AGENTS.md
sed -n '1,220p' .claude/rules/cloudflare.md
sed -n '1,180p' .claude/rules/conventions.md
sed -n '1,180p' .claude/rules/i18n.md
```

## Task A1: Remove Product Market Runtime Tag Invalidation Usage

**Depends on:** A0  
**Atomic group:** A1-A8  
**Files:**

- Modify: `src/app/[locale]/products/[market]/page.tsx`
- Modify: `tests/architecture/cache-directive-policy.test.ts`

**Change:**

1. In `'src/app/[locale]/products/[market]/page.tsx'`, remove:
   - any `cacheTag` import from `"next/cache"`
   - `import { contentTags } from "@/lib/cache/cache-tags";`
   - `cacheTag(contentTags.page("product-market", locale));`

2. Keep the helper as an explicit Cache Components boundary without tag invalidation:

```ts
import { cacheLife } from "next/cache";

async function getProductMarketFaqItems(locale: Locale): Promise<FaqItem[]> {
  "use cache";
  cacheLife("days");

  const faqPage = await getPageBySlug("product-market", locale);
  return extractFaqFromMetadata(faqPage.metadata);
}
```

3. In `tests/architecture/cache-directive-policy.test.ts`, replace the product-market policy with "cached without tag invalidation":

```ts
it("keeps product market page-owned MDX reads cached without tag invalidation", () => {
  const source = readProductMarketPageSource();

  expect(source).not.toContain('import { cacheLife, cacheTag } from "next/cache"');
  expect(source).toContain('import { cacheLife } from "next/cache"');
  expect(source).not.toContain('import { contentTags } from "@/lib/cache/cache-tags"');
  expect(source).toMatch(
    /async function getProductMarketFaqItems\([^)]*\)[\s\S]*?['"]use cache['"]/,
  );
  expect(source).toContain('cacheLife("days")');
  expect(source).not.toContain("cacheTag(");
});
```

**Validation:**

```bash
pnpm exec vitest run tests/architecture/cache-directive-policy.test.ts 'src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx'
```

Expected: pass.

## Task A2: Remove Cache Invalidation Route, Libs, CLI, and Package Scripts

**Depends on:** A1  
**Atomic group:** A1-A8  
**Files:**

- Move to Trash: `src/app/api/cache/invalidate/`
- Move to Trash: `src/lib/cache/invalidate.ts`
- Move to Trash: `src/lib/cache/invalidation-policy.ts`
- Move to Trash: `src/lib/cache/invalidation-guards.ts`
- Move to Trash: `scripts/invalidate-cache.js`
- Modify: `src/lib/cache/index.ts`
- Modify: `src/lib/api/cache-health-response.ts`
- Modify: `package.json`
- Modify or move to Trash: `tests/integration/api/cache-health-contract.test.ts`
- Modify: `scripts/release-proof.sh`

**Trash commands:**

```bash
STAMP="$(date +%Y%m%d-%H%M%S)"
mv src/app/api/cache/invalidate "$HOME/.Trash/cache-invalidate-route-$STAMP"
mv src/lib/cache/invalidate.ts "$HOME/.Trash/cache-invalidate-$STAMP.ts"
mv src/lib/cache/invalidation-policy.ts "$HOME/.Trash/cache-invalidation-policy-$STAMP.ts"
mv src/lib/cache/invalidation-guards.ts "$HOME/.Trash/cache-invalidation-guards-$STAMP.ts"
mv scripts/invalidate-cache.js "$HOME/.Trash/invalidate-cache-$STAMP.js"
```

**`src/lib/cache/index.ts` target behavior:**

Export only cache tag utilities. Remove all invalidation exports.

```ts
/**
 * Cache Utilities Index
 *
 * Exports cache tag generation utilities used by `unstable_cache`.
 * Runtime invalidation was removed on 2026-04-26; content updates flow through
 * redeploys, not runtime `revalidateTag` / `revalidatePath` APIs.
 */

export {
  CACHE_DOMAINS,
  CACHE_ENTITIES,
  cacheTags,
  i18nTags,
  contentTags,
  productTags,
  seoTags,
  type CacheDomain,
} from "./cache-tags";
```

**`src/lib/api/cache-health-response.ts` target behavior:**

Keep:

- `CacheHealthResponse`
- `CacheErrorResponse`
- `createCacheHealthResponse`
- `createObservedCacheHealthResponse`
- `createCacheHealthErrorResponse`

Remove:

- `CacheInvalidationResponse`
- `createCacheInvalidationResponse`
- import of `InvalidationResult`
- imports used only by invalidation response status codes

**`package.json` changes:**

Remove scripts:

- `test:cache-health`
- `cache:invalidate`
- `cache:invalidate:i18n`
- `cache:invalidate:content`
- `cache:invalidate:all`
- `review:cache-health`

Change `i18n:full` to:

```json
"i18n:full": "pnpm scan:translations && pnpm sync:translations:enhanced && pnpm validate:translations && pnpm content:slug-check"
```

**`scripts/release-proof.sh` change:**

Remove:

```bash
pnpm test:cache-health
```

Do not remove `pnpm test:lead-family`, `pnpm test:locale-runtime`, or build steps.

**Integration test handling:**

If `tests/integration/api/cache-health-contract.test.ts` only has one health-route test plus invalidation tests, keep the health assertion by moving it into `tests/integration/api/health.test.ts` if not already covered, then move the old mixed contract file to Trash. If the existing `tests/integration/api/health.test.ts` already covers the same behavior, move `cache-health-contract.test.ts` to Trash.

**Validation:**

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"
pnpm exec vitest run tests/integration/api/health.test.ts src/lib/api/__tests__ 2>/dev/null || pnpm exec vitest run tests/integration/api/health.test.ts
```

Expected: JSON parse succeeds; health tests pass.

## Task A3: Update Cloudflare Topology to Remove `apiOps`

**Depends on:** A2  
**Atomic group:** A1-A8  
**Files:**

- Modify: `open-next.config.ts`
- Modify: `wrangler.jsonc`
- Modify: `scripts/cloudflare/build-phase5-worker.mjs`
- Modify: `scripts/cloudflare/build-phase6-workers.mjs`
- Modify: `scripts/cloudflare/phase6-topology-contract.mjs`
- Modify: `tests/unit/scripts/phase6-topology-contract.test.ts`
- Modify: `scripts/cloudflare/patch-prefetch-hints-manifest.mjs`
- Modify: `scripts/cloudflare/check-official-compare.mjs`

**`open-next.config.ts` target behavior:**

- Remove imports:
  - `r2IncrementalCache`
  - `doQueue`
  - `d1NextTagCache`
- Use `defineCloudflareConfig({})`
- Keep only `apiLead`
- Route `/api/csp-report` through the default worker, not `apiOps`
- Keep `cloudflareConfig.default.minify = false`

**`wrangler.jsonc` target behavior:**

Remove top-level and env-level:

- `services` with `WORKER_SELF_REFERENCE`
- `r2_buckets`
- `d1_databases`
- `durable_objects`
- `migrations`

Keep:

- `name`
- `main`
- `compatibility_date`
- `compatibility_flags`
- `minify`
- `keep_names`
- `alias`
- `assets`
- `env.preview.vars`
- `env.production.vars`

Do not delete actual Cloudflare R2/D1/DO resources yet. Record cleanup as a later dashboard/resource task.

**`scripts/cloudflare/build-phase5-worker.mjs` target behavior:**

- Remove exported DO classes:
  - `DOQueueHandler`
  - `DOShardedTagCache`
  - `BucketCachePurge`
- Remove `apiOps` from `serverFunctionLoaders`
- Change `resolveServerFunction()` so only these routes return `apiLead`:
  - `/api/inquiry`
  - `/api/subscribe`
  - `/api/verify-turnstile`
  - `/api/health`
- `/api/csp-report` returns `default`
- `/api/cache/invalidate` no longer appears

**`scripts/cloudflare/build-phase6-workers.mjs` target behavior:**

- Remove the `apiOps` binding rule.
- Remove DO class exports from generated gateway/web/service worker source.
- Keep `apiLead` binding rule for inquiry, subscribe, verify-turnstile, and health.
- `resolveEnvConfig()` may still copy generic `vars`; it should not require R2/D1/DO objects to exist.

**`scripts/cloudflare/phase6-topology-contract.mjs` target behavior:**

Remove the `apiOps` worker descriptor.

Expected worker keys:

```ts
["gateway", "web", "apiLead"]
```

Expected deploy order:

```ts
["web.jsonc", "api-lead.jsonc", "gateway.jsonc"]
```

Expected server-actions key sync workers:

```ts
[
  "tianze-website-gateway",
  "tianze-website-web",
  "tianze-website-api-lead",
]
```

**`scripts/cloudflare/patch-prefetch-hints-manifest.mjs` target behavior:**

Patch only:

- `.open-next/server-functions/apiLead/index.mjs`

Remove:

- `.open-next/server-functions/apiOps/index.mjs`

**`scripts/cloudflare/check-official-compare.mjs` target behavior:**

Update this from "official baseline primitives must include R2/D1/DO" to "current static-generation Cloudflare baseline must not require runtime cache bindings".

Required snippets should include:

- `defineCloudflareConfig`
- `"app/api/inquiry/route"`
- `"app/api/subscribe/route"`
- `"app/api/verify-turnstile/route"`
- `"app/api/health/route"`
- `".open-next/worker.js"`
- `"ASSETS"`

Forbidden snippets should include:

- `r2IncrementalCache`
- `doQueue`
- `d1NextTagCache`
- `"WORKER_SELF_REFERENCE"`
- `"NEXT_INC_CACHE_R2_BUCKET"`
- `"NEXT_TAG_CACHE_D1"`
- `"NEXT_CACHE_DO_QUEUE"`
- `apiOps`
- `/api/cache/invalidate`

The script should fail if a forbidden snippet remains in `open-next.config.ts` or `wrangler.jsonc`.

**Validation:**

```bash
pnpm exec vitest run tests/unit/scripts/phase6-topology-contract.test.ts
pnpm review:cf:official-compare
node scripts/cloudflare/build-phase5-worker.mjs
```

Expected: pass; generated phase5 worker does not mention `apiOps` or DO classes.

## Task A4: Update Governance, Cluster, and Security Rule References

**Depends on:** A3  
**Atomic group:** A1-A8  
**Files:**

- Modify: `scripts/structural-cluster-registry.js`
- Modify: `scripts/tier-a-impact.js`
- Modify: `docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md`
- Modify: `docs/guides/TIER-A-OWNER-MAP.md`
- Modify: `.claude/rules/i18n.md`
- Modify: `docs/technical/next16-cache-notes.md`
- Modify: `docs/guides/RELEASE-PROOF-RUNBOOK.md`
- Modify: `semgrep.yml`
- Modify: `tests/semgrep/rules/api-route-free-text-error-response.yaml`
- Modify: `src/lib/observability/__tests__/system-observability.test.ts`
- Optional: `docs/technical/project-architecture-tree.md`
- Optional: `docs/technical/project-architecture-diagram.svg`

**Required changes:**

1. Rename the old "Cache invalidation + health signals" cluster to "Health signals + cache tag utilities".
2. Remove deleted files from cluster file lists:
   - `src/app/api/cache/invalidate/**`
   - `src/lib/cache/invalidate.ts`
   - `src/lib/cache/invalidation-policy.ts`
   - `src/lib/cache/invalidation-guards.ts`
   - `tests/integration/api/cache-health-contract.test.ts` if deleted
3. Replace `pnpm review:cache-health` references with an existing health/API proof command. Use one of:
   - `pnpm exec vitest run tests/integration/api/health.test.ts`
   - or a new package script named `review:health` if added intentionally.
4. In `.claude/rules/i18n.md`, change line describing `i18n:full` so it no longer mentions cache invalidation.
5. In `docs/technical/next16-cache-notes.md`, state the new policy:
   - `cacheComponents: true` remains enabled.
   - Product market FAQ has one narrow `"use cache"` + `cacheLife()` boundary for build correctness.
   - No current `cacheTag()` callers.
   - Runtime `revalidateTag` / `revalidatePath` invalidation is not part of launch architecture.
   - `unstable_cache` in message loading remains allowed if it is bypass-safe on Cloudflare.
6. In `semgrep.yml` and `tests/semgrep/rules/api-route-free-text-error-response.yaml`, remove excludes for the deleted cache invalidate route.
7. In `src/lib/observability/__tests__/system-observability.test.ts`, replace the synthetic route example `/api/cache/invalidate` with an active route such as `/api/health` or `/api/inquiry`.

**Validation:**

```bash
pnpm review:docs-truth
pnpm exec vitest run src/lib/observability/__tests__/system-observability.test.ts
pnpm exec vitest run tests/semgrep 2>/dev/null || true
```

Expected: docs truth passes; observability test passes. Semgrep test command is best-effort because semgrep rule tests may be wired through repo scripts.

## Task A5: Update `next.config.ts` Cache Components Comment

**Depends on:** A1  
**Atomic group:** A1-A8  
**Files:**

- Modify: `next.config.ts`

**Change:**

Keep:

```ts
cacheComponents: true,
```

Update the comment to say:

```ts
  // Enable Next.js 16 Cache Components mode.
  // 2026-04-26: One product FAQ helper keeps a Cache Components boundary for
  // build correctness, but runtime tag invalidation is not part of launch.
  // Content updates flow through redeploys.
  // See open-next.config.ts and wrangler.jsonc: no R2/D1/DO cache stack.
  cacheComponents: true,
```

**Validation:**

```bash
pnpm type-check
```

Expected: pass after all Phase A code updates are complete.

## Task A6: Full Runtime Cache Residue Scan

**Depends on:** A1-A5  
**Atomic group:** A1-A8  
**Files:** modify any remaining live file found by the scan.

Run:

```bash
for pattern in \
  'cache:invalidate|test:cache-health|review:cache-health' \
  'apiOps' \
  'WORKER_SELF_REFERENCE|NEXT_INC_CACHE_R2_BUCKET|NEXT_TAG_CACHE_D1|NEXT_CACHE_DO_QUEUE' \
  'DOQueueHandler|DOShardedTagCache|BucketCachePurge' \
  '/api/cache/invalidate' \
  'revalidateTag|revalidatePath|cacheLife\(|cacheTag\(|"use cache"'
do
  printf '\n=== %s ===\n' "$pattern"
  rg -n "$pattern" . \
    --glob '!node_modules/**' \
    --glob '!.next/**' \
    --glob '!.open-next/**' \
    --glob '!coverage/**' \
    --glob '!test-results/**' \
    --glob '!playwright-report/**' \
    --glob '!exa-results/**' \
    --glob '!docs/audits/cloudflare-opennext-field-risks.md' \
    --glob '!docs/superpowers/plans/2026-04-26-launch-readiness-series.md'
done
```

Allowed remaining hits:

- Historical docs that clearly say "archived" or "external report".
- Next.js bundled docs references in `node_modules/next/dist/docs/`.
- `src/test/setup.next.ts` test mocks for Next cache APIs, only if still needed by unrelated tests.
- `src/lib/load-messages.ts` using `unstable_cache`, if Cloudflare bypass behavior remains intentional.

Not allowed:

- Live code importing `revalidateTag`, `revalidatePath`, or `cacheTag`.
- `cacheLife` imports outside the approved product market FAQ boundary.
- Any live `/api/cache/invalidate` route or caller.
- `apiOps` in current build/deploy scripts.
- Required R2/D1/DO bindings in current configs or proof scripts.

## Task A7: Phase A Validation

**Depends on:** A6  
**Atomic group:** A1-A8  
**Files:** none unless validation fails.

Run in order:

```bash
pnpm type-check
pnpm lint:check
pnpm exec vitest run tests/architecture/cache-directive-policy.test.ts
pnpm exec vitest run tests/integration/api/health.test.ts
pnpm exec vitest run tests/unit/scripts/phase6-topology-contract.test.ts
pnpm review:cf:official-compare
pnpm review:tier-a
pnpm review:clusters
pnpm review:docs-truth
```

Expected: all pass. If a command fails due to a deleted cache invalidation reference, update the corresponding script/test/doc in Phase A scope before moving on.

## Task A8: Build Proof After Cache Removal

**Depends on:** A7  
**Atomic group:** A1-A8  
**Files:** none unless validation fails.

Run sequentially:

```bash
pnpm clean:next-artifacts
pnpm build
pnpm build:cf
pnpm deploy:cf:phase6:dry-run
```

Expected: all pass.

If `deploy:cf:phase6:dry-run` fails because it still expects `apiOps` or DO exports, return to Task A3.

---

# Phase B: Deployed Launch Verification

Phase B starts only after Phase A passes. Build/deploy remains single-owner work.

## Task B1: Preview Deploy for Verification

**Depends on:** A8  
**Files:** none.

Run:

```bash
pnpm deploy:cf:preview
```

Record the preview URL. If the deployed URL is not `https://preview.tianze-pipe.com`, use the actual URL in all evidence files.

## Task B2: Smart Placement Evaluation

**Depends on:** B1  
**Files:**

- Modify conditionally: `wrangler.jsonc`
- Modify conditionally: `docs/technical/deployment-notes.md`

**Rule:** Smart Placement is an optimization, not a prerequisite for removing runtime cache.

1. Capture baseline P95 for `/api/inquiry` against the preview URL.
2. Add:

```jsonc
  "placement": { "mode": "smart" },
```

near the top-level worker config only if the main executor decides to test it.

3. Deploy preview again.
4. Compare P95.

Use evidence fields:

```markdown
Baseline P95: <EVIDENCE: baseline-ms>
Smart Placement P95: <EVIDENCE: smart-ms>
Decision: keep / revert / defer
```

Do not use `git checkout wrangler.jsonc` to revert. Use an explicit reverse patch if reverting.

## Task B3: JSON-LD Evidence

**Depends on:** B1  
**Subagent allowed:** yes, evidence file only.  
**Files:**

- Create: `docs/audits/2026-04-26-jsonld-richresults-evidence.md`
- Modify conditionally: SEO structured data files only if evidence fails.

Test:

- `/en`
- `/en/products/north-america`
- `/en/capabilities/bending-machines`

Record:

```markdown
# JSON-LD Rich Results Verification - 2026-04-26

Preview URL: <EVIDENCE: preview-url>
Tool: Google Rich Results Test

| Page | Detected items | Errors | Warnings | Verdict |
|---|---|---:|---:|---|
| /en | <EVIDENCE: list> | <EVIDENCE: count> | <EVIDENCE: count> | PASS/FAIL |
| /en/products/north-america | <EVIDENCE: list> | <EVIDENCE: count> | <EVIDENCE: count> | PASS/FAIL |
| /en/capabilities/bending-machines | <EVIDENCE: list> | <EVIDENCE: count> | <EVIDENCE: count> | PASS/FAIL |
```

Conditional fix only if a page fails:

- Create a small `JsonLdGraph` server component.
- Consolidate schemas only on failing page types.
- Do not preemptively refactor every page.

## Task B4: hreflang Evidence

**Depends on:** B1  
**Subagent allowed:** yes, evidence file only.  
**Files:**

- Create: `docs/audits/2026-04-26-hreflang-evidence.md`
- Modify conditionally: `src/lib/seo-metadata.ts`
- Modify conditionally: `src/app/sitemap.ts`

Pages:

- `/en`
- `/zh`
- `/en/about`
- `/en/contact`
- `/en/products/north-america`
- `/en/capabilities/bending-machines`
- `/en/privacy`

Commands:

```bash
URL="https://preview.tianze-pipe.com/en"
curl -s "$URL" | grep -E '<link rel="alternate"[^>]*hreflang' | sort
curl -s https://preview.tianze-pipe.com/sitemap.xml > /tmp/tianze-sitemap.xml
```

Record:

```markdown
| Page | HTML alternates | Sitemap alternates | x-default includes /en | All hrefs 200 | Verdict |
|---|---:|---:|---|---|---|
```

Conditional fix only if evidence fails.

## Task B5: Suspense No-JS Evidence

**Depends on:** B1  
**Subagent allowed:** yes, evidence file only.  
**Files:**

- Create: `docs/audits/2026-04-26-suspense-no-js-evidence.md`
- Modify conditionally: failing page files only.

Pages:

- `/en/privacy`
- `/en/terms`
- `/en/about`
- `/en/contact`
- `/en/oem-custom-manufacturing`
- `/en/capabilities/bending-machines`

Command template:

```bash
PAGE="https://preview.tianze-pipe.com/en/privacy"
curl -s -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" "$PAGE" > /tmp/tianze-page.html
python3 - <<'PY'
import re
html = open('/tmp/tianze-page.html').read()
text = re.sub(r'<script.*?</script>', '', html, flags=re.DOTALL)
text = re.sub(r'<style.*?</style>', '', text, flags=re.DOTALL)
text = re.sub(r'<[^>]+>', ' ', text)
text = re.sub(r'\s+', ' ', text).strip()
print(len(text))
print(text[:240])
print(text[-240:])
PY
```

Record:

```markdown
| Page | Visible chars | Lead text present | Skeleton markers present | Verdict |
|---|---:|---|---|---|
```

Conditional fix only if a page fails. Preferred fix is to reduce Suspense scope around large content, not to add global streaming patches.

## Task B6: Cloudflare / Resend / Inquiry Checklist

**Depends on:** B1  
**Files:**

- Modify: `docs/technical/deployment-notes.md`

Record:

- Cloudflare SSL/TLS mode is Full (strict).
- Always Use HTTPS is on.
- Automatic HTTPS Rewrites is on.
- root and www resolve without loops.
- Resend domain is verified.
- DKIM CNAME is DNS Only.
- SPF and DMARC exist.
- Gmail and Outlook inbox tests pass.
- Manual inquiry submission succeeds.
- Deployed smoke passes:

```bash
pnpm smoke:cf:deploy -- --base-url https://preview.tianze-pipe.com
```

Use `<EVIDENCE: ...>` markers while collecting data, then replace them before calling the checklist done.

---

# Phase C: Post-Launch / Conditional Optimization

These are not required to complete runtime cache removal.

## Task C1: Cloudflare Custom Image Loader

Trigger only when real product/factory images replace placeholders.

Files:

- Create conditionally: `image-loader.ts`
- Create conditionally: `__tests__/image-loader.test.ts`
- Modify conditionally: `next.config.ts`

Do not start this while Phase A or B is in progress because it also touches `next.config.ts` and Cloudflare cache behavior.

## Task C2: Server Component Await Parallelization

Trigger after launch or after evidence shows meaningful render delay.

Files:

- `src/app/[locale]/products/[market]/page.tsx`
- `src/app/[locale]/capabilities/bending-machines/page.tsx`
- `src/app/[locale]/oem-custom-manufacturing/page.tsx`

Do not run this in parallel with JSON-LD or Suspense conditional fixes because it shares page files.

## Task C3: Artifact Size Baseline

Run after Phase A and any Phase B code changes are final:

```bash
pnpm clean:next-artifacts
pnpm build
pnpm build:cf
ls -lh .open-next/server-functions/default/handler.mjs
ls -lh .open-next/server-functions/apiLead/handler.mjs 2>/dev/null || true
find .next/static/css -name "*.css" -exec ls -lh {} \;
```

Append final sizes to `docs/technical/deployment-notes.md`.

---

# Final Verification Before Calling Done

Run these in order:

```bash
pnpm review:docs-truth
pnpm review:cf:official-compare
pnpm review:derivative-readiness
pnpm type-check
pnpm lint:check
pnpm review:tier-a
pnpm review:clusters
pnpm test:locale-runtime
pnpm test:lead-family
pnpm validate:translations
pnpm clean:next-artifacts
pnpm build
pnpm build:site:equipment
pnpm build:cf
pnpm deploy:cf:phase6:dry-run
pnpm test:release-smoke
```

If a command still references deleted cache invalidation infrastructure, the plan is not complete. Return to Phase A.

## Handoff Note

Update `HANDOFF.md` after Phase A or before ending a long session. It should say:

- launch readiness focus replaced the old product-page focus;
- architecture chose static generation + redeploy over runtime cache invalidation;
- runtime cache removal is an atomic group touching code, Cloudflare topology, release proof, and docs;
- no one should run one-subagent-per-task on this plan.

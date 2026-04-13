# Cloudflare Issue Taxonomy

## Purpose

This file gives the repository one simple way to describe Cloudflare-related failures.

Use it to avoid mixing:

- platform/runtime boundary issues
- generated artifact compatibility issues
- current site page regressions
- final deployed behavior

## Four Buckets

### 1. Platform entry / local runtime issue

Meaning:

- Wrangler / Miniflare / preview startup is unhealthy
- a request may fail before current site business code really gets a fair run

Typical signals:

- local preview never becomes stable
- request hangs before page code meaningfully runs
- inspector / local worker boot failures

Do not describe this as:

- “the page logic is broken”

### 2. Generated artifact compatibility issue

Meaning:

- the build succeeds, but generated output is not fully compatible with the current local Cloudflare path

Typical signals:

- manifest load problems
- dynamic require regressions in generated handlers
- preview-only 500s after framework / OpenNext upgrades

Do not describe this as:

- “a content bug”
- “a translation bug”

### 3. Current site runtime regression

Meaning:

- Tianze site behavior is wrong even if the platform boots

Typical signals:

- wrong redirects
- wrong cookies or leaked internal headers
- page content, SEO, or contact behavior regresses

### 4. Final deployed behavior issue

Meaning:

- the deployed Cloudflare environment still behaves incorrectly after local proof

Typical signals:

- deployed `/api/health` fails
- deployed page/runtime behavior differs from verified local expectations

Do not describe this as:

- “preview proof failed, so production must be broken”

## Contact-page Recovery Boundary

- As of 2026-04-09, `pnpm proof:cf:preview-deployed` passed and `/en/contact` + `/zh/contact` recovered to 200. Treat that as a current-site runtime regression fixed, not as proof that the API line is healthy.
- The failure bucket was the current-site runtime regression side: `Uncached data was accessed outside of <Suspense>` and the Cloudflare runtime `setTimeout()` / Cache Components boundary.
- If deeper API worker paths still fail in `server-functions/${target}/index.mjs`, `default/handler.mjs`, or static route-wrapper experiments, keep them in generated-artifact / runtime mismatch debt unless stronger deployed proof says otherwise.

## Proof Mapping

| Bucket | Strongest first useful proof |
|---|---|
| Platform entry / local runtime issue | `pnpm preview:cf` plus local diagnostics |
| Generated artifact compatibility issue | `pnpm build:cf` plus generated-artifact diagnostic blockers and `pnpm smoke:cf:preview` |
| Current site runtime regression | page-level tests, `pnpm build`, `pnpm build:cf`, `pnpm smoke:cf:preview` |
| Final deployed behavior issue | `pnpm smoke:cf:deploy -- --base-url <url>` |

## Writing Rule

When documenting or reporting a Cloudflare failure:

1. Name the bucket first.
2. Then name the failing proof level.
3. Only then describe the symptom.

Example:

- “Generated artifact compatibility issue; build log blocker failed on `Unexpected loadManifest` before preview proof.”
- “Generated artifact compatibility issue; local preview proof failed with a manifest load regression.”
- “Final deployed behavior issue; deployed smoke failed on `/api/health`.”

## Generated-Artifact Contract Hint

- Current contract source: retired from the main tree in wave 8
- If the blocker script fails, keep the diagnosis in bucket 2 unless stronger proof shows a current-site runtime bug.

## Contact-page / API Debt Boundary

The recovered contact page and the unresolved deeper API mismatch must stay in different buckets:

- Bucket 3 is closed for the contact page when `pnpm proof:cf:preview-deployed` passes and `/en/contact` + `/zh/contact` return 200 again. That recovery was a current-site runtime regression, not API closure.
- Bucket 2 remains open for deeper API-worker debt until deployed proof says otherwise. Keep failures here in generated-artifact / runtime mismatch territory.

Confirmed API failure families that still belong to bucket 2:

- `server-functions/${target}/index.mjs` paths that assume fs, `BUILD_ID`, or `.env` access in ways the current Cloudflare path does not support
- `default/handler.mjs` paths that dynamically require generated API route modules
- static route-wrapper experiments that depend on `__dirname` or `next/dist/server/node-environment*` internals

## Related Canonical Docs

- [`QUALITY-PROOF-LEVELS.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [`RELEASE-PROOF-RUNBOOK.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/RELEASE-PROOF-RUNBOOK.md)
- [`CANONICAL-TRUTH-REGISTRY.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CANONICAL-TRUTH-REGISTRY.md)

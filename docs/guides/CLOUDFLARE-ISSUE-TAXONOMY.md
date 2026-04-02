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

## Proof Mapping

| Bucket | Strongest first useful proof |
|---|---|
| Platform entry / local runtime issue | `pnpm preview:cf` plus local diagnostics |
| Generated artifact compatibility issue | `pnpm build:cf`, `pnpm smoke:cf:preview`, and when needed `pnpm build:cf:turbo` |
| Current site runtime regression | page-level tests, `pnpm build`, `pnpm build:cf`, `pnpm smoke:cf:preview` |
| Final deployed behavior issue | `pnpm smoke:cf:deploy -- --base-url <url>` |

## Writing Rule

When documenting or reporting a Cloudflare failure:

1. Name the bucket first.
2. Then name the failing proof level.
3. Only then describe the symptom.

Example:

- “Generated artifact compatibility issue; local preview proof failed with a manifest load regression.”
- “Final deployed behavior issue; deployed smoke failed on `/api/health`.”

## Related Canonical Docs

- [`QUALITY-PROOF-LEVELS.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [`RELEASE-PROOF-RUNBOOK.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/RELEASE-PROOF-RUNBOOK.md)
- [`CANONICAL-TRUTH-REGISTRY.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CANONICAL-TRUTH-REGISTRY.md)

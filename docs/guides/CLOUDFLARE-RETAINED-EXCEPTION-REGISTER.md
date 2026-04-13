# Cloudflare Retained Exception Register

## Purpose

This register freezes which Cloudflare deviations are still retained or deferred after the current official-alignment waves.

A retained item is not a failure. It is a documented statement that removing it now would weaken proof or break current behavior.

## Current retained exceptions

### CF-EXCEPT-001 — Generated-artifact compatibility layer (remaining patch set)
- Status: RETIRED from main tree
- Type: retired legacy patch + exception-contract
- Issue category: generated-artifact
- Priority: high
- Files:
  - retired in wave 8: `scripts/cloudflare/patch-prefetch-hints-manifest.mjs`
  - retired in wave 8: `scripts/cloudflare/generated-artifact-exception-contract.mjs`
  - retired in wave 8: `scripts/cloudflare/check-generated-artifact-log.mjs`
- What was active before retirement:
  - middleware manifest loader rewrite
  - `requirePage` async promotion
  - API route `return require(...)` -> `return await import(...)`
  - split-function cache/composable-cache path rewrites
- Why retired:
  - current canonical Route B commands and release proof already run green on stock `opennextjs-cloudflare build`
  - stock build/preview/deploy truth now outranks the old repo-local generated-artifact checker model
  - the patch dry-run had already drifted from current generated output shape, so the compatibility layer was no longer a trustworthy active command boundary
- Evidence:
  - `.sisyphus/evidence/task-6-dry-run-before.txt`
  - `.sisyphus/evidence/task-6-dry-run-after.txt`
  - `.sisyphus/evidence/task-6-build.txt`
  - `.sisyphus/evidence/task-6-build-cf.txt`
  - `.sisyphus/evidence/task-6-preview.txt`
  - `.sisyphus/evidence/task-6-retire-patch.txt`
  - `.sisyphus/evidence/fully-stock-task-1-baseline.txt`
- Proof impact:
  - none on canonical Route B release proof after wave 8
- Reevaluation trigger:
  - only if a future legacy-only compatibility layer is intentionally reintroduced

### CF-EXCEPT-002 — Alias / shim contract
- Status: RETIRED from main tree
- Type: retired legacy contract + shim
- Issue category: platform-entry / generated-artifact
- Priority: medium
- Files:
  - retired in wave 6: `scripts/cloudflare/alias-shim-exception-contract.mjs`
  - retired in wave 6: `scripts/cloudflare/check-alias-shim-contract.mjs`
- Why retired:
  - the single-worker alias now lives directly in `wrangler.jsonc`
  - the old phase6-specific alias contract no longer has a live operational entrypoint
- Evidence:
  - `.sisyphus/evidence/task-9-contract-audit.txt`
  - `.sisyphus/evidence/task-9-proof-impact.txt`
- Proof impact:
  - none on canonical Route B release proof
- Reevaluation trigger:
  - only if a future legacy-only phase6 surface is intentionally reintroduced

### CF-EXCEPT-003 — Preview degraded contract
- Status: RETIRED from main tree
- Type: retired exception-contract
- Issue category: platform-entry / deployment-behavior
- Priority: medium
- Files:
  - retired from main tree: `scripts/cloudflare/preview-degraded-contract.mjs`
  - retired from main tree: `scripts/cloudflare/check-preview-degraded-contract.mjs`
- Why retired:
  - preview workflow now requires real preview secrets
  - preview workflow no longer injects `ALLOW_MEMORY_RATE_LIMIT` / `ALLOW_MEMORY_IDEMPOTENCY`
  - preview placeholder fallback has been removed from the active workflow path
- Evidence:
  - `.sisyphus/evidence/task-9-contract-audit.txt`
  - `.sisyphus/evidence/task-9-proof-impact.txt`
  - `.sisyphus/evidence/preview-degraded-retirement-prereqs.txt`
- Proof impact:
  - none on canonical Route B release proof after workflow cleanup
- Reevaluation trigger:
  - only if a future preview-degraded exception is intentionally reintroduced

### CF-EXCEPT-004 — Server-actions secret propagation contract
- Status: RETIRED from main tree
- Type: retired legacy helper set
- Issue category: deployment-behavior
- Priority: medium
- Files:
  - retired in wave 5: `scripts/cloudflare/server-actions-secret-contract.mjs`
  - retired in wave 5: `scripts/cloudflare/check-server-actions-secret-contract.mjs`
  - retired in wave 5: `scripts/cloudflare/sync-server-actions-key.mjs`
- Why retired:
  - the old phase6 deploy helper has already been removed from the main tree
  - single-worker Route B does not depend on a multi-worker server-actions key sync surface
- Evidence:
  - `.sisyphus/evidence/task-9-contract-audit.txt`
  - `.sisyphus/evidence/task-9-proof-impact.txt`
- Proof impact:
  - none on canonical Route B release proof
- Reevaluation trigger:
  - only if a future legacy-only phase6 deploy flow is intentionally reintroduced

### CF-EXCEPT-005 — Phase topology contract and generation layer
- Status: RETIRED from main tree
- Type: retired legacy generator + config glue
- Issue category: deployment-behavior
- Priority: high
- Files:
  - retired in wave 7: `scripts/cloudflare/phase-topology-contract.mjs`
  - retired in wave 7: `scripts/cloudflare/build-phase6-workers.mjs`
  - retired in wave 4: `scripts/cloudflare/deploy-phase6.mjs`
- Why retired:
  - current Route B stock operation no longer uses a custom phase6 generator/config surface
  - the remaining active split-server-function and preview-runtime logic was extracted into smaller non-phase6 contracts before retirement
- Evidence:
  - `.sisyphus/evidence/task-9-contract-audit.txt`
  - `.sisyphus/evidence/task-10-scope-check.txt`
- Proof impact:
  - none on canonical Route B release proof
- Reevaluation trigger:
  - only if a future legacy-only phase6 generator/deploy flow is intentionally reintroduced

### CF-EXCEPT-006 — Minify disabled in OpenNext config
- Status: DEFERRED
- Type: config
- Issue category: platform-entry / generated-artifact
- Priority: medium
- Files:
  - `open-next.config.ts`
- Why deferred:
  - this series explicitly excludes re-enabling minify without fresh build + preview + deploy proof
- Evidence:
  - assessment out-of-scope rules in `docs/guides/CLOUDFLARE-DEPLOYMENT-ASSESSMENT.md`
- Proof impact:
  - potential future performance/packaging tradeoff, but not an active Wave 2–4 change
- Reevaluation trigger:
  - only in a future dedicated proof run that re-tests build, preview, and deployed smoke together

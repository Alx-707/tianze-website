# Notes: Five-Priority Execution And Current Decoupling State

## Priority Execution Summary

### Existing Sub-Agent Status
- The previously listed reusable sub-agents (`Epicurus`, `James`, `Helmholtz`, `Descartes`) are no longer live.
- Status check result: all four returned `not_found`.
- Current work therefore used fresh sub-agents instead of attempting to reuse stale threads.

### Final Repo-Local Completion State
- Review-surface drift is now materially reduced:
  - wide scan and single-cluster entrypoints share a registry
  - helper/shared files are recognized as part of their structural surfaces
- Ownership activation now has a concrete future checklist:
  - `docs/guides/MAINTAINER-ACTIVATION-CHECKLIST.md`
- The main remaining blocker is no longer repo-local implementation work.
- The main remaining blocker is organizational:
  - there is not yet a second enforceable repository owner identity mapped into the repo-level owner surface

### Priority 1: Ownership Resilience
- Tightened owner semantics so the repository default is primary-only and the backup path stays concentrated on Tier A surfaces.
- Rewrote governance docs to state the real remaining constraint plainly:
  - active maintenance is broader than one person in practice
  - the backup path improves review resilience but does not eliminate enforceable ownership concentration
- Added an operational checklist and hard ceiling language so Tier A ownership is treated as a review-routing model, not as diversified maintainer headcount.
- Added `docs/guides/MAINTAINER-ACTIVATION-CHECKLIST.md` so a future enforceable owner expansion has a concrete activation path instead of an implied handoff.
- Updated:
  - `.github/CODEOWNERS`
  - `docs/guides/TIER-A-OWNER-MAP.md`
  - `docs/guides/OWNERSHIP-RESILIENCE.md`
  - `docs/guides/POLICY-SOURCE-OF-TRUTH.md`
  - `docs/guides/STRUCTURAL-GOVERNANCE-LEDGER.md`
  - `docs/guides/ARCHIVE-HYGIENE.md`

### Priority 2: Implementation-Level Decoupling

#### Translation Quartet
- Shared quartet helper now owns:
  - split/flat path lookup
  - nested traversal
  - nested read/write helpers
- Updated:
  - `scripts/translation-flat-utils.js`
  - `scripts/translation-sync.js`
  - `scripts/validate-translations.js`
  - `scripts/i18n-shape-check.js`
  - `docs/guides/TRANSLATION-QUARTET-CONTRACT.md`
- Structural effect:
  - quartet sync and quartet validation now share the same traversal primitives instead of reimplementing leaf/diff logic

#### Locale Runtime Surface
- Locale coercion and presentation semantics are now more centralized through:
  - `src/i18n/locale-utils.ts`
  - `src/i18n/locale-presentation.ts`
- Runtime-adjacent consumers now rely less on one-off locale branches.

#### Cache Invalidation + Health
- Shared layers now exist for:
  - response shaping: `src/lib/api/cache-health-response.ts`
  - invalidation policy: `src/lib/cache/invalidation-policy.ts`
  - route guards: `src/lib/cache/invalidation-guards.ts`
- Request observability now also exists for this surface:
  - `x-request-id`
  - `x-observability-surface: cache-health`
- Route orchestration is thinner in:
  - `src/app/api/cache/invalidate/route.ts`
  - `src/app/api/health/route.ts`

#### Lead API Family Observability
- The write-path family now exposes:
  - `x-request-id`
  - `x-observability-surface: lead-family`
- If a caller provides `x-request-id`, the family preserves it in the response.
- Lead-family route signals now also feed the shared system observability collector.

#### Homepage Section Cluster
- Shared structural primitives now exist for:
  - CTA targets: `src/components/sections/homepage-section-links.ts`
  - section shell: `src/components/sections/homepage-section-shell.tsx`
  - proof/trust strip: `src/components/sections/homepage-trust-strip.tsx`
- Shared structure is now used across:
  - `hero-section.tsx`
  - `products-section.tsx`
  - `final-cta.tsx`
  - `sample-cta.tsx`
  - `resources-section.tsx`
  - `scenarios-section.tsx`
  - `quality-section.tsx`
  - `chain-section.tsx`

### Priority 3: Real Review-Cycle Validation
- Representative staged review cycle was exercised by temporarily staging:
  - `src/components/sections/hero-section.tsx`
  - `src/app/api/cache/invalidate/route.ts`
  - `src/app/api/health/route.ts`
  - `src/lib/cache/invalidation-policy.ts`
  - `src/lib/cache/invalidation-guards.ts`
  - `src/lib/api/cache-health-response.ts`
- The second staged cycle proved the review surface is executable and reusable.
- `pnpm review:tier-a:staged` correctly identified:
  - `Cache invalidation + health signals`
  - suggested review: `pnpm review:cache-health`
- `pnpm review:clusters:staged` correctly matched:
  - `Homepage section cluster`
  - and ran `pnpm review:homepage-sections`

### Priority 4: Re-Score After Usage, Not Immediately
- Evidence review indicates:
  - `S3`, `R2`, and `G1` are trending upward
  - `R3` should remain conservative
  - `G2` remains capped by owner concentration
- Decision:
  - keep the numeric score unchanged in this pass
  - update the report narrative instead of forcing another score increase
  - treat the second staged cycle as evidence for executability, not diversification

### Priority 5: Low-Drift Governance
- Canonical vs supplemental policy language was tightened.
- Archive hygiene now explicitly points back to the canonical policy index when older files appear current.
- Structural governance ledger now describes ownership resilience more honestly instead of over-claiming diversification.

## Validation Results

### Cluster / Surface Reviews
- `pnpm review:translation-quartet`
  - passed
- `pnpm review:homepage-sections`
  - `7` files passed
  - `32` tests passed
- `pnpm review:cache-health`
  - `3` files passed
  - `9` tests passed
- `pnpm review:locale-runtime`
  - `4` files passed
  - `23` tests passed

### Staged Review Flow
- `pnpm review:tier-a:staged`
  - passed
- `pnpm review:clusters:staged`
  - passed

### Second Staged Review Cycle
- A second staged review cycle was executed against a different object set:
  - translation quartet tooling surface
  - cache invalidation + health signals
- Staged files included:
  - `scripts/translation-flat-utils.js`
  - `scripts/regenerate-flat-translations.js`
  - `scripts/translation-sync.js`
  - `scripts/validate-translations.js`
  - `scripts/i18n-shape-check.js`
  - `src/app/api/cache/invalidate/route.ts`
  - `src/app/api/health/route.ts`
  - `src/lib/cache/invalidation-policy.ts`
  - `src/lib/cache/invalidation-guards.ts`
  - `src/lib/api/cache-health-response.ts`
  - `tests/integration/api/cache-health-contract.test.ts`
- `pnpm review:tier-a:staged`
  - passed
  - correctly identified:
    - `Translation critical path`
    - `Cache invalidation + health signals`
- `pnpm review:clusters:staged`
  - passed
  - correctly ran:
    - `pnpm review:translation-quartet`
    - `pnpm review:cache-health`
- `pnpm review:cluster cache-health --staged`
  - passed
- `pnpm review:cluster translation-quartet --staged`
  - initially skipped due stale pattern matching in `scripts/run-cluster-review.js`
  - fixed by extending the dispatcher to recognize quartet tooling files
  - rerun passed

### Review-Surface Friction Found
- Before the fix, `review:clusters:staged` and `review:cluster translation-quartet --staged` were inconsistent:
  - wide scan matched quartet tooling files
  - single-cluster dispatcher did not
- Fix applied:
  - `scripts/run-cluster-review.js` now recognizes quartet tooling files, expanded homepage shared-layer files, and cache-health helper/test files
- Human-facing friction was also reduced in:
  - `.claude/rules/review-checklist.md`
  - `docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md`

### Final Review-Surface Alignment
- Shared registry now covers:
  - `translation quartet`
  - `lead API family`
  - `homepage section cluster`
  - `locale runtime surface`
  - `cache invalidation + health`
- Additional helper/shared-file coverage now includes:
  - `src/lib/api/lead-route-response.ts`
  - `src/lib/seo-metadata.ts`
  - `src/lib/content-utils.ts`
  - `src/lib/api/cache-health-response.ts`
  - translation quartet tooling scripts
- Targeted proof:
  - `node scripts/review-clusters.js src/lib/api/lead-route-response.ts`
  - `node scripts/review-clusters.js src/lib/seo-metadata.ts`
  - `node scripts/tier-a-impact.js src/lib/api/lead-route-response.ts scripts/translation-flat-utils.js src/lib/api/cache-health-response.ts src/lib/seo-metadata.ts`
  all matched the expected structural surfaces

### Final Validation Additions
- `pnpm review:lead-family`
  - `2` files passed
  - `10` tests passed
- `pnpm review:locale-runtime`
  - `4` files passed
  - `23` tests passed
- `pnpm review:cache-health`
  - `3` files passed
  - `9` tests passed
- `pnpm exec vitest run tests/integration/api/health.test.ts`
  - `1` file passed
  - `1` test passed
- `pnpm exec vitest run src/lib/observability/__tests__/system-observability.test.ts src/lib/lead-pipeline/__tests__/metrics.test.ts tests/integration/api/lead-family-contract.test.ts tests/integration/api/cache-health-contract.test.ts tests/integration/api/health.test.ts`
  - `5` files passed
  - `32` tests passed

## Heavy Observability Pass
- Added a shared system signal collector:
  - `src/lib/observability/system-observability.ts`
- Added a route signal helper:
  - `src/lib/observability/api-signals.ts`
- High-value route surfaces now record structured `api_request` signals.
- Lead-pipeline metrics and summaries now record:
  - `pipeline_metric`
  - `pipeline_summary`
- Shared signal model now supports:
  - recent signal retention
  - aggregate counts by `surface + kind + name`
  - request correlation when `requestId` is available
- Added guide:
  - `docs/guides/SYSTEM-OBSERVABILITY.md`

## Non-Blocking Observations
- The previous Vitest warning about a non-top-level `vi.mock("lucide-react")` in `src/test/setup.icons.ts` has been removed by moving the mock to a true top-level form with a browser-mode fallback.

## Current Mainline Judgment
- The repository has materially advanced all five report priorities.
- The strongest new evidence is not only more rules, but also:
  - shared implementation layers
  - staged review entrypoints that now execute real cluster checks
  - stable request observability headers on high-value write and health surfaces
  - clearer canonical-source boundaries
- The main unresolved structural risk is still:
  - ownership concentration

## Review-Surface Friction
- The main documentation friction was entrypoint selection, not command availability.
- Clarified usage now distinguishes:
  - `pnpm review:tier-a:staged` for staged diffs that hit Tier A paths
  - `pnpm review:clusters:staged` for the broad staged structural-cluster pass
  - `pnpm review:cluster <name> --staged` for a known single-cluster scope

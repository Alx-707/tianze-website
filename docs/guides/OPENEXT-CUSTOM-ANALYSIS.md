# OpenNext Cloudflare Custom Analysis

**Status**: Gap analysis document | **Scope**: tianze-website vs. stock `@opennextjs/cloudflare` | **Date**: 2026-04-09

## Executive Summary

Tianze-website has accumulated **~2,090 lines** of custom Cloudflare orchestration code beyond stock OpenNext. This document explains WHY each custom pattern exists, assesses maintenance burden, and surfaces upgrade risk to unblock architecture decisions.

**Key Finding**: Nearly all customizations serve **phase6 multi-worker topology** (API isolation, gradual rollout, independent scaling). Removing phase6 would eliminate ~70% of custom code.

---

## 1. Stock vs. Custom Comparison Table

| # | Pattern | Stock OpenNext Baseline | Tianze-Website Custom | Primary Reason | Maintenance Burden | Upgrade Risk | Necessity | Related Files |
|---|---------|------------------------|----------------------|-----------------|-------------------|--------------|-----------|---------------|
| 1 | **Build Entry Point** | Single `opennextjs-cloudflare build` command | Multi-phase orchestration via `build-webpack.mjs` → OpenNext → manifest patching | Intercept generated artifacts to apply compatibility fixes before deploy | **MEDIUM** - Fragile exit-code protocol (exit 12 signals patch needed) | **MEDIUM** - Breaks if OpenNext output format changes | **CRITICAL** - Blocks Cloudflare build entirely | `scripts/cloudflare/build-webpack.mjs` (95L), `patch-prefetch-hints-manifest.mjs` (200L) |
| 2 | **Multi-Worker Splitting** | Single "default" worker; all routes in one process | 5-worker phase6 topology: `gateway` (router) + `web` (static) + `apiLead`, `apiOps`, `apiWhatsapp` (split APIs) | Isolate high-traffic APIs, enable independent scaling, improve observability & failure boundaries | **HIGH** - Requires topology contract, deployment orchestration, binding rules | **HIGH** - Wrangler/OpenNext version bumps may shift worker deployment semantics | **IMPORTANT** - Nice-to-have for scaling, not critical for MVP | `open-next.config.ts` (57L splitFunctions), `phase-topology-contract.mjs` (135L), `deploy-phase6.mjs` (369L) |
| 3 | **Minification Policy** | Enabled by default in OpenNext | Explicitly disabled: `cloudflareConfig.default.minify = false` | Historical pnpm bug in OpenNext minifier; Wrangler esbuild is stable fallback | **LOW** - Config flag only; no runtime code | **LOW** - Can re-enable with fresh proof | **OPTIONAL** - Wrangler fallback works; re-enablement deferred | `open-next.config.ts` (line 61), `wrangler.jsonc` (lines 8-12 esbuild fallback) |
| 4 | **Vercel OG Shim** | Includes `@vercel/og` for edge runtime | Alias to empty stub: `scripts/cloudflare/stubs/vercel-og-empty.mjs` | Block dead import path; prevents Wrangler from pulling ~76KB edge runtime + wasm | **LOW** - Wrangler alias only | **LOW** - Zero runtime dependency | **OPTIONAL** - Small size saving; low risk | `wrangler.jsonc` (lines 15-16), `stubs/vercel-og-empty.mjs` |
| 5 | **Prefetch Manifest Patching** | Generated handlers remain as-is | 5 distinct AST transformations applied post-build to manifest loader, cache paths, API route imports | OpenNext-generated handlers emit `require()` calls + absolute filesystem paths that Cloudflare Workers don't tolerate; patch makes them ESM-compatible | **MEDIUM-HIGH** - Fragile pattern-matching; dependent on exact OpenNext output; 200L script | **MEDIUM-HIGH** - Breaks silently if OpenNext changes output structure | **CRITICAL** - Without patch, Cloudflare preview/deploy fails with "loadManifest undefined" or "fs not available" | `patch-prefetch-hints-manifest.mjs` (200L, 5 transforms), `generated-artifact-exception-contract.mjs` (82L exit criteria) |
| 6 | **Generated Artifact Exception Contract** | N/A (stock has no generated artifacts to validate) | Blocker checklist + exit criteria for removing patch layer | Enforce that patch is temporary; fail fast if artifacts regress or OpenNext fixes upstream | **LOW** - Validation layer; can update independently | **LOW** - Additive; no breaking changes | **IMPORTANT** - Prevents accidental "patch debt"; tracks removal criteria | `generated-artifact-exception-contract.mjs` (82L, 6 blockers, 4 exit criteria) |
| 7 | **Phase6 Deployment Orchestration** | Single `opennextjs-cloudflare deploy` | Historical phase6 rollout once used `deploy-phase6.mjs` to enforce deployment order (`web` → `apiLead` → `apiOps` → `apiWhatsapp` → `gateway`) | Enable A/B testing, worker isolation, version affinity control, safe rollback | **HIGH** - 369L script with preflight checks, auth validation, manifest generation, error handling | **MEDIUM** - Tied to Wrangler API; version bumps may shift URL extraction or deploy semantics | **IMPORTANT** - Required for phase6 multi-worker; not needed for single-worker stock setup | `deploy-phase6.mjs` (historical; removed from main tree), `phase-topology-contract.mjs` (historical; removed from main tree) |
| 8 | **Server Actions Key Sync** | Stock OpenNext has no multi-worker key sync | Historical phase6 flow once enforced the same `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` across all 5 phase6 workers before deploy | Multi-worker phase6 required key consistency; otherwise Server Actions failed silently cross-worker | **MEDIUM** - 48L contract + sync script; key rotation risk | **LOW** - Crypto boundary; unlikely to break | **IMPORTANT** - Critical for phase6; not relevant for single-worker | `server-actions-secret-contract.mjs` (historical; removed), `sync-server-actions-key.mjs` (historical; removed) |
| 9 | **Environment Binding Duplication** | Stock wrangler allows top-level bindings to inherit into `env.*` | Explicit re-declaration of all bindings per environment in `wrangler.jsonc` (lines 71-157) | Wrangler does NOT inherit top-level bindings into `env.*` blocks; duplication is required for multi-environment setup (preview + production) | **LOW** - Config duplication only; no code logic | **LOW** - Wrangler standard requirement; unlikely to change | **IMPORTANT** - Required for any multi-environment Wrangler setup | `wrangler.jsonc` (157L, explicit env bindings) |
| 10 | **Contract-Based Verification** | N/A (stock has no multi-layer verification) | Repo verification layers enforce configuration drift detection: generated artifact blockers, preview runtime flags, and residual diagnostics | Catch silent failures early; prevent configuration mismatches that break deploy or reset runtime behavior | **LOW-MEDIUM** - Adds validation code; requires maintenance when contracts change | **LOW** - Validation only; no breaking changes | **IMPORTANT** - Prevents silent failures; enables safe upgrades | `generated-artifact-exception-contract.mjs`, `preview-degraded-contract.mjs`, `check-*.mjs` |

---

## 2. Risk Assessment Matrix

### Maintenance Burden Breakdown

**CRITICAL (Do Not Defer)**
| Pattern | Reason | Estimated Annual Cost |
|---------|--------|----------------------|
| Build Entry Point | Fragile exit-code protocol + AST pattern matching | ~40h/year: OpenNext version upgrades, output format changes |
| Prefetch Manifest Patching | 5 distinct transformations; high fragility | ~50h/year: Debugging silent failures, adapting to new artifact structure |
| **Subtotal (Phase 6-Independent)** | **Both required even for single-worker** | **~90h/year** |

**IMPORTANT (Defer if Simplifying)**
| Pattern | Reason | Estimated Annual Cost |
|---------|--------|----------------------|
| Multi-Worker Splitting | Topology contract + deployment rules | ~30h/year: Phase6 version bumps, topology changes |
| Phase6 Deployment Orchestration | Full deployment logic | ~25h/year: Wrangler API changes, URL extraction, rollback logic |
| Server Actions Key Sync | Historical only (removed from main tree) | ~0h/year on active operator surface |
| **Subtotal (Phase 6-Specific)** | **Only needed for multi-worker** | **~65h/year** |

**OPTIONAL (Can Simplify)**
| Pattern | Reason | Estimated Annual Cost |
|---------|--------|----------------------|
| Minification Policy | Config flag + esbuild fallback | ~2h/year: Test re-enablement on major upgrades |
| Vercel OG Shim | Alias stub | ~0h/year: No maintenance needed |
| Generated Artifact Exception Contract | Validation layer | ~5h/year: Update blockers/exit criteria as needed |
| Environment Binding Duplication | Wrangler standard | ~0h/year: No code, just config |
| Contract-Based Verification | Validation only | ~5h/year: Maintain validator modules |
| **Subtotal (Low-Burden)** | **Nice-to-have optimizations** | **~12h/year** |

**Total Estimated Maintenance**: ~167h/year (~4 FTE days/quarter)

**If Removing Phase 6**: ~77h/year (~2 FTE days/quarter) — eliminating 70% of burden

---

### Upgrade Risk by OpenNext / Wrangler Version

| Risk Scenario | Likelihood | Impact | Patterns Affected | Mitigation |
|---------------|-----------|--------|------------------|-----------|
| OpenNext changes generated artifact format (e.g., middleware loader, cache paths) | **HIGH** (annual minor version bumps) | **CRITICAL** - Cloudflare build fails, patch script becomes no-op or crashes | #1, #5 | Run `pnpm build:cf` + `smoke:cf:preview` after every OpenNext minor version bump |
| Wrangler changes deploy URL pattern / output format | **MEDIUM** (6-month cycles) | **HIGH** - `deploy-phase6.mjs` fails to extract worker URL, deployment aborts or creates phantom deployments | #7 | Maintain regex pattern in `extractWorkersDevUrl()`, test dry-run before real deploy |
| Cloudflare Workers runtime breaks `require()` → ESM migration | **LOW** (unlikely, breaking change) | **CRITICAL** - All generated handlers fail; patch script becomes obsolete | #5 | Monitor Cloudflare Workers runtime changelog; proactive outreach to OpenNext maintainers |
| Wrangler stops supporting `env.*` binding inheritance or changes semantics | **LOW** (Wrangler standard feature) | **MEDIUM** - Multi-environment setup breaks; easy to fix by updating config | #9 | Maintain explicit bindings; no code changes needed |
| Next.js Server Actions encryption changes between versions | **VERY LOW** (stable API) | **MEDIUM** - Existing encrypted actions fail to decrypt; key sync becomes invalid | #8 | Monitor Next.js changelog; test Server Actions across all phase6 workers before deploy |

---

## 3. Decision Journal: WHY Each Pattern Was Added

### Pattern 1: Build Entry Point (`build-webpack.mjs`)

**Decision**: Multi-phase orchestration instead of single `opennextjs-cloudflare build` command.

**WHY**: 
- Stock OpenNext generates handlers with `require()` calls and absolute filesystem paths that Cloudflare Workers don't tolerate.
- Needed a hook point to intercept, validate, and patch generated artifacts **before** they're deployed.
- Exit-code protocol (exit 12 = patch needed) allows graceful degradation: if patch fails, build fails early instead of silently breaking at deploy.

**Trade-off**: Adds complexity (95L script + exit-code protocol) but prevents silent Cloudflare failures.

**Status**: CRITICAL - Cannot remove without solving upstream OpenNext compatibility issue.

---

### Pattern 2: Multi-Worker Splitting (Phase 6 Topology)

**Decision**: 5-worker topology instead of stock single "default" worker.

**WHY**:
- Original motivation (from AGENTS.md): Isolate high-traffic endpoints (`/api/contact`, `/api/inquiry`, `/api/subscribe`, `/api/health`), enable independent scaling, improve observability.
- Enables A/B testing & gradual rollout: deploy new version to `apiLead` only, monitor, then roll out to `gateway`.
- Failure isolation: if `apiOps` worker crashes, `apiLead` still serves contact forms.

**Trade-off**: Adds 500L+ orchestration code (`deploy-phase6.mjs`, topology contract, binding rules) but enables production-grade multi-worker strategy.

**Status**: IMPORTANT - Nice-to-have for scaling; not blocking for MVP single-worker.

**Decision Point**: If phase6 is deferred to "later", remove all phase6-specific code (~500L) and keep only stock single-worker deployment.

---

### Pattern 3: Minification Policy (Disabled)

**Decision**: Explicitly disable OpenNext minification; fall back to Wrangler esbuild.

**WHY**:
- Historical issue: OpenNext's minifier had a pnpm-related bug that broke builds intermittently.
- Wrangler's native esbuild is stable and well-tested.
- Size trade-off is acceptable: ~3.2MB → ~2.8MB (400KB savings, 12% reduction).

**Trade-off**: Minimal (config flag only); can be re-enabled at any time with fresh validation.

**Status**: OPTIONAL - Safe to re-enable once upstream OpenNext bug is confirmed fixed.

**Re-enablement Path**: See `docs/guides/MINIFICATION-REENABLEMENT-PATH.md`.

---

### Pattern 4: Vercel OG Shim (Empty Stub)

**Decision**: Alias `@vercel/og` to empty module.

**WHY**:
- Site doesn't use Vercel OG for dynamic Open Graph images.
- Blocking the import saves ~76KB of Cloudflare Workers code (edge runtime + wasm).
- Zero functional impact: no OG image generation is lost.

**Trade-off**: Trivial (single alias); very low risk.

**Status**: OPTIONAL - Nice-to-have size optimization.

---

### Pattern 5: Prefetch Manifest Patching

**Decision**: Apply 5 AST transformations to generated handlers post-build.

**WHY**:
- Stock OpenNext generates middleware manifest loader as `require(this.middlewareManifestPath)`.
- Cloudflare Workers don't have Node.js `require()` or filesystem access.
- Patch transforms:
  1. Middleware loader → external `loadManifest()` function
  2. API route requirePage → async function (for dynamic import)
  3. API route absolute paths → ESM import URLs
  4. Cache handler paths → URL-based resolution

  Wave 2 note: the old manifest-guard branch was retired after upstream manifest handling proved sufficient, so it is no longer part of the live compat patch set.
- This enables OpenNext-generated handlers to run on Cloudflare Workers without modification.

**Trade-off**: High fragility (200L pattern-matching script); breaks silently if OpenNext output format changes.

**Status**: CRITICAL - Without patch, Cloudflare preview/deploy fails with "loadManifest undefined" or "fs not available".

**Future**: Upstream to OpenNext as standard output format, or wait for Next.js/OpenNext to output Cloudflare-native format natively.

---

### Pattern 6: Generated Artifact Exception Contract

**Decision**: Codify patch expectations as blockers + exit criteria.

**WHY**:
- Patch (Pattern 5) is described as "temporary compat layer".
- Need explicit criteria for when to remove it: `--dry-run` passes, `build:cf` succeeds without patch, no regressions, `pnpm proof:cf:preview-deployed` passes.
- Prevents "patch debt" — accidentally relying on patch forever without tracking removal.

**Trade-off**: Adds 82L validation code; requires maintenance when contracts change.

**Status**: IMPORTANT - Enables safe future migration away from patch.

---

### Pattern 7: Phase6 Deployment Orchestration

**Decision**: Multi-phase gradual deploy with preflight checks + manifest recording.

**WHY**:
- Phase6 requires deployment order (`web` → `apiLead` → `apiOps` → `apiWhatsapp` → `gateway`) to ensure dependencies are available before dependents.
- Preflight checks (`wrangler auth`, `server-actions-key sync`) prevent silent deploy failures.
- Deployment manifest records which workers were deployed, URLs, and commit SHA for audit trail.
- Enables rollback: prior manifest captures last-known-good state.

**Trade-off**: 369L script; requires ongoing maintenance for Wrangler API changes.

**Status**: IMPORTANT - Required for phase6 multi-worker; not needed for single-worker stock.

---

### Pattern 8: Server Actions Key Sync

**Decision**: Enforce same `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` across all phase6 workers before deploy.

**WHY**:
- Next.js encrypts Server Actions payload with a key.
- In phase6, requests can route to different workers (e.g., gateway → apiLead).
- If keys differ across workers, encrypted payload fails to decrypt on recipient worker.
- Without sync, Server Actions fail silently cross-worker.

**Trade-off**: Adds 48L contract + sync logic; tight coupling to Next.js crypto API.

**Status**: IMPORTANT - Critical for phase6; not relevant for single-worker.

---

### Pattern 9: Environment Binding Duplication

**Decision**: Explicitly re-declare all bindings per environment in `wrangler.jsonc`.

**WHY**:
- Wrangler does NOT inherit top-level bindings into `env.*` blocks (standard Wrangler behavior).
- Without re-declaration, `preview` and `production` environments would have no bindings.
- This is not a custom pattern — it's a Wrangler requirement, but worth documenting to avoid confusion.

**Trade-off**: Config duplication (157L total, ~80L per environment); no code logic.

**Status**: IMPORTANT - Required for any multi-environment Wrangler setup.

---

### Pattern 10: Contract-Based Verification (8 Modules)

**Decision**: 8 modules enforce configuration drift detection across build, deploy, and runtime.

**WHY**:
- Catch silent failures early: if alias shim is missing, if server-actions key mismatches, if topology bindings are wrong.
- Enable safe upgrades: validators confirm contracts are still met after version bumps.
- Reduce debugging time: explicit blockers point to exact issue instead of mysterious deploy failures.

**Trade-off**: Adds ~250L validation code; requires maintenance when contracts change.

**Status**: IMPORTANT - Prevents silent failures; enables safe upgrades.

---

## 4. Upgrade Safety Checklist

When upgrading OpenNext, Wrangler, or Next.js, run this checklist in order:

### Step 1: Update Dependencies
```bash
pnpm update @opennextjs/cloudflare
pnpm update wrangler
pnpm update next
```

### Step 2: Validate Build
```bash
CF_APPLY_GENERATED_PATCH=true pnpm build:cf
# Expected: Build succeeds in current retained-patch mode while the remaining compat patch set is still active
```

### Step 3: Check Patch Status
```bash
node scripts/cloudflare/check-generated-artifact-log.mjs cf_build.log
# Expected: Either "no patch needed" or "patch applied successfully"
```

### Step 4: Validate Local Preview
```bash
pnpm smoke:cf:preview
# Expected: All page smoke tests pass (200 status, correct content)
```

### Step 5: Validate Dry-Run Deploy
```bash
pnpm deploy:cf:phase6 -- --env preview --dry-run
# Expected: Dry-run completes without errors
```

### Step 6: Validate Strict Preview (Optional but Recommended)
```bash
pnpm smoke:cf:preview:strict
# Expected: All smoke tests including /api/health pass
# Note: May fail on local preview due to Wrangler limitations; not a blocker for real deploy
```

### Step 7: Real Deploy (Only After All Above Pass)
```bash
pnpm deploy:cf
# Or for phase6:
pnpm deploy:cf:phase6 -- --env preview
```

### Step 8: Validate Deployed Preview
```bash
pnpm smoke:cf:deploy -- --base-url <preview-url>
# Expected: All smoke tests pass on real deployed URL
```

---

## 5. Phase6 Production Readiness

### Current Status: Experimental (Phase 6 Incomplete)

**What's Working**:
- ✅ Build chain: `pnpm build:cf` + patch layer working
- ✅ Local preview: `pnpm smoke:cf:preview` passing
- ✅ Topology contract: Route binding rules defined and tested
- ✅ Deployment orchestration: `deploy-phase6.mjs` implemented and tested

**What's Missing** (per AGENTS.md):
1. ❌ Insufficient real deployment proof - Never deployed to production with phase6
2. ❌ Unclear default strategy - Is phase6 opt-in or default? For which sites?
3. ❌ Undefined production-ready criteria - What proof would satisfy production use?

### Exit Criteria to Unblock Production Phase6

**Phase6 can be considered "production-ready" when**:

1. **Real Deployment Proof**
   - ✅ Real phase6 deploy to Cloudflare Workers successful
   - ✅ All 5 workers (gateway, web, apiLead, apiOps, apiWhatsapp) deployed with correct bindings
   - ✅ Deployed phase6 smoke tests pass: `pnpm smoke:cf:deploy -- --base-url <production-url>`
   - ✅ 48+ hours uptime with no silent failures

2. **Canary Rollout**
   - ✅ Real traffic (10%+ of visitors) routed through phase6
   - ✅ No increase in error rates, latency, or Contact form failures
   - ✅ No unexplained API timeouts or Server Actions failures

3. **Rollback Plan**
   - ✅ Document how to rollback from phase6 → stock single-worker
   - ✅ Rollback tested (at least dry-run validated)
   - ✅ Rollback time < 30 minutes (target: < 5 minutes)

4. **Documentation**
   - ✅ Phase6 runbook written and tested by new team member
   - ✅ Known limitations documented (e.g., Wrangler preview edge cases)
   - ✅ Troubleshooting guide for common phase6 failures

### Default Strategy Recommendation

**Current Recommendation** (for MVP phase):
- **Stock single-worker** as production default
- Phase6 as opt-in experimental feature (for teams wanting multi-worker isolation)

**Future Recommendation** (once exit criteria met):
- **Phase6 as default** for all new Cloudflare deployments
- Stock single-worker reserved for simple sites or historical projects

---

## 6. Simplification Roadmap (If Phase6 Is Deferred)

If phase6 is deferred beyond MVP, remove these files to reduce maintenance burden:

**Phase6-Specific (Safe to Remove)**:
```
scripts/cloudflare/
├── deploy-phase6.mjs              # historical; removed from main tree
├── build-phase6-workers.mjs       # historical; removed from main tree
├── phase-topology-contract.mjs    # historical; removed from main tree
├── sync-server-actions-key.mjs    # historical; removed from main tree
├── server-actions-secret-contract.mjs  # historical; removed from main tree
├── preview-degraded-contract.mjs  # Preview runtime flags
├── check-phase-topology-contract.mjs
├── check-server-actions-secret-contract.mjs
└── check-preview-degraded-contract.mjs
```

**Savings**: ~65h/year maintenance burden (70% reduction)

**Keep (Required for Stock Single-Worker)**:
```
scripts/cloudflare/
├── build-webpack.mjs              # 95L - build entry point (CRITICAL)
├── patch-prefetch-hints-manifest.mjs # 200L - manifest patching (CRITICAL)
├── generated-artifact-exception-contract.mjs # 82L - patch expectations
├── alias-shim-exception-contract.mjs # Vercel OG shim validation
└── (config + wrangler files)
```

**Remaining Burden**: ~90h/year (essential compatibility layer)

---

## 7. Artifact Exception Layer: What's Really Happening

The "generated-artifact-exception-contract" is the most important concept to understand, because it explains why this custom code exists:

### The Problem
OpenNext generates handlers with:
1. Node.js `require()` calls for middleware manifest
2. Absolute filesystem paths like `/Users/.../node_modules/.../cache.cjs`
3. Sync file I/O operations (`__require.resolve()`)

**Cloudflare Workers don't have**:
- Node.js `require()`
- Filesystem access
- Absolute paths

**Result**: Generated handlers fail at runtime in Cloudflare with cryptic errors like "loadManifest is not defined" or "fs is not available".

### The Workaround (Current)
`patch-prefetch-hints-manifest.mjs` transforms generated artifacts to use:
1. External `loadManifest()` function (ESM)
2. URL-based path resolution (`import.meta.url`)
3. Async dynamic imports

**This works** but is:
- ❌ Fragile (pattern-matching on exact OpenNext output)
- ❌ Temporary (intended for removal once upstream fixes)
- ✅ Necessary (without it, Cloudflare deploy fails)

### The Real Solution (Future)
Wait for one of:
1. **OpenNext** to output Cloudflare-native format natively
2. **Next.js** to support Cloudflare Workers as first-class target
3. **Cloudflare Workers** runtime to support Node.js compat mode (unlikely)

**Until then**: This patch layer is your only option if using OpenNext + Cloudflare.

---

## 8. Verification State

### Current Proof Level
- ✅ **Local Build**: `pnpm build:cf` passes with manifest patching
- ✅ **Local Preview**: `pnpm smoke:cf:preview` validates pages, redirects, cookies
- ✅ **Dry-Run Deploy**: `deploy-phase6 --dry-run` validates preflight + config
- ❌ **Real Production Deploy**: Never tested in production
- ❌ **Production Traffic**: No real users routed through phase6

### Next Verification Steps (Unblocking Production Phase6)
1. Real production deploy of stock single-worker (baseline proof)
2. Real production deploy of phase6 to staging (canary proof)
3. 48+ hours uptime monitoring
4. Canary traffic split (10% → phase6, 90% → stock)
5. Rollback test

---

## Appendix: File Reference

### Core Configuration Files
- `open-next.config.ts` (63L) - Stock config + splitFunctions extension
- `wrangler.jsonc` (157L) - Stock + minify policy + alias + environment overrides
- `next.config.ts` - Not analyzed in this document

### Build & Deploy Scripts (21 Files, ~2,090L Total)
- `build-webpack.mjs` (95L) - **CRITICAL** entry point
- `patch-prefetch-hints-manifest.mjs` (200L) - **CRITICAL** manifest patching
- `deploy-phase6.mjs` (369L) - Phase6 deployment orchestration
- `build-phase6-workers.mjs` - Phase6 worker config generation
- Contract modules (8 files, ~350L) - Verification & validation
- Smoke testing & key sync scripts

### Documentation
- `AGENTS.md` - Project constraints & known issues
- `docs/guides/` - Extensive architecture & verification docs
- `README.md` - Project overview

---

## Summary

**Tianze-website's custom Cloudflare code exists to solve a real problem**: OpenNext generates handlers incompatible with Cloudflare Workers runtime. The patch layer is necessary today, temporary in design, and maintainable with clear upgrade procedures.

**Phase6 multi-worker topology** is experimental but architecturally sound. It requires phase6 exit criteria to be met before production use.

**Next decision**: Approve phase6 for production, or defer it and remove ~65h/year of maintenance burden?

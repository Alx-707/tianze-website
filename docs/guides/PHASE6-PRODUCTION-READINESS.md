# Phase6 Production Readiness Guide

**Status**: Experimental / non-canonical under Route B (local proof complete; production proof pending)  
**Last Updated**: 2026-04-09  
**Decision Gate**: Ready to greenlight phase6 for production? See exit criteria below.

> **Supersession note (2026-04-10):** This guide remains a decision-support document for phase6 go/no-go thinking, but it is no longer the canonical source for current Cloudflare command truth. Route B now treats stock OpenNext Cloudflare build/preview/deploy as canonical and phase6 as a non-canonical topology.

---

## TL;DR: What is Phase6?

**Phase6** is tianze-website's experimental **multi-worker deployment strategy** for Cloudflare.

**Stock approach** (single-worker):
- All routes run in one Cloudflare Worker (`web`)
- Simpler, lower operational overhead
- Easier to debug, deploy, rollback

**Phase6 approach** (multi-worker):
- Routes split across specialized workers: `web` (pages) → `apiLead` (contact/inquiry/subscribe) → `apiOps` (cache invalidation) → `apiWhatsapp` (WhatsApp API) → `gateway` (orchestration)
- Intended benefit: Isolate API routes from page rendering, reduce worker size, enable targeted scaling
- Current status: Works locally; production deployment proof missing

**Decision**: Should we enable phase6 for production, or stick with stock single-worker?

---

## Current Readiness Status

### ✅ What Works (Proof Exists)

| Component | Proof Level | Evidence |
|-----------|-------------|----------|
| **Local build** | ✅ Verified | `CF_APPLY_GENERATED_PATCH=true pnpm build:cf` produces current `.open-next/` artifacts with the retained compat patch set applied |
| **Local preview (stock page proof)** | ✅ Verified | `CF_APPLY_GENERATED_PATCH=true pnpm preview:cf` + `pnpm smoke:cf:preview` passes for page/header/cookie/redirect proof |
| **Local preview (phase6)** | ✅ Historical only | earlier phase6 local preview experiments once ran through generated worker/config output; this is no longer part of the active Route B path |
| **Dry-run deploy** | ✅ Historical only | the old `deploy-phase6.mjs --dry-run` path once succeeded; the helper has now been removed from the main tree |
| **Manifest / generated-artifact patching** | ✅ Verified | remaining compat patch set is applied post-build; the obsolete manifest-guard branch was retired in Wave 2 |
| **Preflight checks** | ✅ Verified | Wrangler auth, server actions key sync work |

### ❓ What's Uncertain (Proof Missing)

| Component | Gap | Impact | Why Uncertain |
|-----------|-----|--------|---------------|
| **Real production deploy** | No real Cloudflare account tested | CRITICAL | Analysis-only session; no actual deploy performed |
| **Production traffic** | Zero live requests validated | CRITICAL | Phase6 never received real traffic |
| **Canary rollout** | No staged deployment plan | HIGH | How do we roll out without 100% cutover risk? |
| **Rollback procedure** | Not tested under failure | MEDIUM | Can we revert to stock single-worker if phase6 fails? |
| **Performance baseline** | No latency/throughput comparison | MEDIUM | Does phase6 actually improve perf vs. stock? |
| **API error handling** | Split workers' failure modes unknown | MEDIUM | What happens if `apiLead` crashes but `web` is healthy? |
| **Multi-worker coordination** | Service bindings untested at scale | MEDIUM | Do inter-worker calls stay within SLA under load? |
| **Split worker size limits** | Unknown if any worker exceeds Cloudflare limits | LOW | Phase6 split reduces individual worker size, but validation missing |

---

## Production Readiness Exit Criteria

### Tier 1: Mandatory (Must Complete Before Greenlight)

These prove phase6 is **safe to deploy**.

- [ ] **Real production deploy executed** (~30 min)
  - Recreate a dedicated legacy-only phase6 deploy helper before attempting a real Cloudflare deploy
  - Collect deployment manifest + worker URLs
  - Verify all 5 workers deployed successfully
  
- [ ] **Deployed smoke test passed** (~10 min)
  - Run `pnpm smoke:cf:deploy -- --base-url <phase6-gateway-url>`
  - Verify: pages load (✅), APIs respond (✅), health check works (✅), no manifest errors (✅)
  
- [ ] **Production traffic validation** (~1-4 hours, depending on traffic volume)
  - Route real user traffic to phase6 gateway
  - Monitor error rates, latency, API success rates
  - Target SLA: Error rate < 0.1%, latency p99 < 2s (baseline from stock)
  - Duration: Minimum 30 minutes at steady state, ideally 1 hour
  
- [ ] **Rollback plan validated** (~1 hour)
  - Document: "If phase6 fails, cut traffic back to stock single-worker in <5 min"
  - Test: Actually perform rollback (cutover back to single-worker, verify traffic recovers)
  - Verify: No data loss, no stuck requests, clean cutover

### Tier 2: Recommended (Strongly Advised Before Full Production)

These prove phase6 is **robust and maintainable**.

- [ ] **Canary rollout plan documented**
  - Define: Route X% of traffic to phase6, monitor, increase %
  - Example canary: 1% → 5% → 10% → 50% → 100%
  - Define decision gates (error threshold, latency threshold for proceeding to next %)
  
- [ ] **API failure modes tested**
  - Simulate: `apiLead` worker crashes; verify `web` pages still load
  - Simulate: `apiOps` worker crashes; verify contact form still works
  - Simulate: Gateway crashes; verify fallback to stock single-worker works
  - Document: Expected behavior in each scenario
  
- [ ] **Performance baseline established**
  - Compare phase6 latency/throughput vs. stock single-worker
  - Expected result: Phase6 ≥ stock performance (or tradeoff explicitly accepted)
  - Baseline metrics: p50, p99 latency; requests/sec; error rate; cold start time
  
- [ ] **Multi-worker coordination tested at load**
  - Run load test (e.g., `k6` or `wrk2`) targeting contact API through phase6 gateway
  - Target: 100+ concurrent requests, 5+ minute duration
  - Verify: All inter-worker calls succeed, no timeouts, no service binding failures
  
- [ ] **Cost impact quantified**
  - Calculate: Monthly spend (stock single-worker) vs. phase6 multi-worker
  - Include: Request pricing, worker compute, data transfer, R2 cache
  - Document: Is phase6 cost-effective? (If cost > benefit, consider deferring)

### Tier 3: Nice-to-Have (Can Defer to Post-Launch)

- [ ] **Deployment automation**: CI/CD integration for phase6 deploys
- [ ] **Monitoring dashboard**: Real-time phase6 worker health, latency, error rates
- [ ] **Documentation**: Phase6 troubleshooting guide for ops team
- [ ] **Staged worker deployment**: Ability to deploy workers individually without full cutover

---

## Current Proof Gaps (What's Blocking Greenlight)

### Gap 1: Real Deployment Never Executed
**Status**: ❌ Blocker  
**Why it matters**: Dry-run deploy is not the same as real deployment. Real Cloudflare API may have different rate limits, auth requirements, or edge-case behaviors.  
**How to close**: Recreate a dedicated legacy-only phase6 deploy helper, then execute a real phase6 deploy on a real Cloudflare account (or staging account if production unavailable). Document the URL.  
**Effort**: ~30 min

### Gap 2: Production Traffic Never Validated
**Status**: ❌ Blocker  
**Why it matters**: Local preview doesn't replicate Cloudflare production environment (edge locations, caching, rate limiting, request patterns). Phase6 might work locally but fail under real traffic.  
**How to close**: Route real traffic to phase6 gateway. Monitor for 1+ hour at steady state. If error rate < 0.1% and latency p99 < 2s, gap closed.  
**Effort**: ~1-4 hours (depends on traffic volume)

### Gap 3: Rollback Untested
**Status**: ❌ High Risk  
**Why it matters**: If phase6 fails in production, we need a fast, safe way to revert. Untested rollback is a liability.  
**How to close**: Document rollback procedure (switch DNS/gateway config back to stock single-worker). Then actually test it by performing a real rollback and verifying recovery.  
**Effort**: ~1 hour

### Gap 4: No Performance Baseline
**Status**: ⚠️ Medium Risk  
**Why it matters**: We don't know if phase6 is actually faster/cheaper than stock. If latency is worse, we're introducing complexity for zero benefit.  
**How to close**: Compare p50/p99 latency, throughput, error rates between phase6 and stock under identical load.  
**Effort**: ~2 hours

### Gap 5: API Failure Modes Unknown
**Status**: ⚠️ Medium Risk  
**Why it matters**: If one phase6 worker crashes, what happens? Does the whole system cascade? Or does it degrade gracefully?  
**How to close**: Simulate worker crashes (kill worker via Cloudflare UI or script). Document expected behavior.  
**Effort**: ~1 hour

### Gap 6: Service Bindings Untested at Scale
**Status**: ⚠️ Low-Medium Risk  
**Why it matters**: Phase6 workers communicate via Cloudflare service bindings. These are untested under load.  
**How to close**: Load test phase6 (100+ concurrent requests for 5+ minutes) and verify all inter-worker calls succeed.  
**Effort**: ~1-2 hours

---

## Decision Framework: Stock vs. Phase6

Use this table to decide which strategy is right for your situation.

| Decision Factor | Stock Single-Worker | Phase6 Multi-Worker |
|---|---|---|
| **Operational complexity** | Low | High |
| **Debugging difficulty** | Easy (1 worker) | Hard (5 workers, async calls) |
| **Deployment time** | ~2 min | ~5 min |
| **Rollback time** | ~1 min | ~5 min (if plan exists) |
| **Worker size limit risk** | Medium (might hit 10 MB limit as features grow) | Low (routes isolated) |
| **Estimated perf improvement** | Baseline | Unknown (needs testing) |
| **Estimated cost** | Baseline | Unknown (likely higher due to 5 workers) |
| **Production proof** | ✅ Mature (battle-tested) | ❌ Experimental (local proof only) |
| **Maintenance burden** | ~77h/year | ~167h/year (Phase6 adds ~90h/year) |
| **Recommended for** | MVP, stable production | High-traffic sites, complex APIs, teams with DevOps expertise |

---

## Recommended Path Forward

### **Option 1: Stock Single-Worker (Recommended for MVP)**
- Deploy to production using stock `opennextjs-cloudflare` + current compatible patching
- Maintain for 1-2 quarters until feature growth justifies phase6 complexity
- Effort: Minimal (already working locally); risk: Low
- **Decision**: Greenlight stock for production now; defer phase6 to Q3

### **Option 2: Phase6 Greenlight (If You Have DevOps Bandwidth)**
- Close Tier 1 gaps (real deploy, smoke test, traffic validation, rollback test)
- Then deploy phase6 as canary (1% traffic) and monitor for 24-48 hours
- Proceed to 100% only after canary passes SLA
- Effort: ~4-6 hours upfront; ongoing ~90h/year maintenance; risk: Medium (untested in production, but rollback path exists)
- **Decision**: Close gaps in next sprint; canary phase6 in 2 weeks

### **Option 3: Hybrid (Safest Path)**
- Deploy stock single-worker to production now (low risk, proven)
- In parallel, complete Tier 1 phase6 validation on staging account
- When phase6 is proven, perform gradual cutover (canary → 50% → 100%)
- Effort: Immediate production is fast; phase6 validation happens in background; risk: Low to medium
- **Decision**: Ship stock now; phase6 staging validation starts immediately; production cutover in 2-4 weeks once proven

---

## Rollback Plan Template

**If phase6 fails in production:**

1. **Detect failure** (automated alert)
   - Error rate > 1%? Alert and page on-call.
   - Latency p99 > 5s? Alert.
   - API timeout > 10 sec? Alert and page on-call.

2. **Decision point** (< 1 minute)
   - Review error logs: Is failure isolated to one worker, or systemic?
   - If isolated: Restart that worker via Cloudflare UI
   - If systemic: Proceed to step 3 (full rollback)

3. **Full rollback** (< 5 minutes)
   - Switch gateway URL in DNS/load balancer back to stock single-worker
   - Verify traffic recovers (error rate < 0.1%, latency < 2s)
   - Document incident

4. **Post-mortem** (~1 hour)
   - What broke? Was it phase6-specific or a general bug?
   - Can we fix and retry, or do we need architectural changes?
   - Update phase6 docs with learnings

---

## Appendix: Phase6 Architecture

### Worker Topology

```
User Request
    ↓
[Gateway Worker]
    ↓
    ├─→ /pages/* → [Web Worker] → SSR HTML pages
    ├─→ /api/contact → [API Lead Worker] → Contact form submission
    ├─→ /api/inquiry → [API Lead Worker] → Inquiry API
    ├─→ /api/subscribe → [API Lead Worker] → Subscribe API
    ├─→ /api/verify-turnstile → [API Lead Worker] → CAPTCHA verification
    ├─→ /api/health → [API Lead Worker] → Health check (or gateway fallback)
    ├─→ /api/cache/invalidate → [API Ops Worker] → Cache invalidation
    ├─→ /api/csp-report → [API Ops Worker] → CSP violation reports
    └─→ /api/whatsapp/* → [API WhatsApp Worker] → WhatsApp integrations
```

### Key Files

- `scripts/cloudflare/phase-topology-contract.mjs` — Route → worker mapping rules
- `scripts/cloudflare/deploy-phase6.mjs` — Removed from the main tree; any future phase6 deploy orchestration must be recreated as legacy-only tooling
- `scripts/cloudflare/build-phase6-workers.mjs` — Phase6 config generation
- `.open-next/wrangler/phase6/*.jsonc` — Generated per-worker configs
- `open-next.config.ts` — `splitFunctions` extension (defines routes to split)

---

## Related Documents

- `docs/guides/OPENEXT-CUSTOM-ANALYSIS.md` — Detailed gap analysis of all 10 custom patterns (why phase6 exists, maintenance burden, upgrade risk)
- `docs/guides/POLICY-SOURCE-OF-TRUTH.md` — Which files define current Cloudflare policy
- `docs/guides/QUALITY-PROOF-LEVELS.md` — What each proof level (local, dry-run, deployed) actually proves
- `AGENTS.md` — Project constraints and phase6-specific gotchas

---

## Decision Checklist

**Before greenlight, confirm:**

- [ ] Stakeholders understand phase6 is experimental (production proof missing)
- [ ] Team has capacity for ~90h/year ongoing maintenance
- [ ] Rollback plan is documented and tested
- [ ] Real production deploy can be executed by someone on the team
- [ ] Cost impact is acceptable (likely higher than stock due to 5 workers)
- [ ] Site traffic justifies complexity (phase6 is for high-traffic sites, not MVPs)

**If any of the above is NO, defer phase6 and stick with stock single-worker.**

---

**Last Updated**: 2026-04-09  
**Next Review**: After real production deploy (if greenlit) or Q3 2026 (if deferred)

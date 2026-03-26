# Performance and Accessibility Repair Program

## Purpose
This document defines the full repair series for the repository, combining:
- the previously consolidated audit findings,
- the newly verified performance deep-dive work,
- the newly verified accessibility deep-dive work,
- and the remaining unresolved release and governance items.

It is organized as a dependency-aware execution program, not a flat todo list.

## Planning Principles
- Work from release truth outward: fix what determines whether the product is safely releasable before spending effort on cleanup.
- Separate critical path from parallel work: not all important tasks should block each other.
- Treat already-fixed work as “guardrail and verification” tasks, not as open implementation.
- Avoid mixing structural program work with opportunistic refactors.

## Current State Snapshot

### Already Improved
- Main navigation now appears in initial HTML.
- Skip link and stable main-content anchor now exist.
- Contact page initial HTML contains real content and a usable fallback form.
- Global client translation payload is significantly reduced.
- Contact-specific client translations are locally scoped.
- WhatsApp floating chat has better dialog semantics and focus return.
- Cookie preferences and language toggle expose clearer accessibility state.
- Homepage top-loader loading is delayed far enough that normal homepage visits do not pay for that optional package immediately.
- Attribution bootstrap now avoids loading the UTM client logic unless attribution-bearing URL params are present.
- The dormant global toaster has been removed from the layout path because no current shipped UI produces toasts.
- The dead toaster implementation and its unused dependency have also been removed, so the repository no longer carries that dormant global UI stack at all.
- Repository-controlled Cloudflare preview drift for locale-cookie flags and leaked internal middleware headers is now fixed.
- The stock Cloudflare preview page routes are now healthy again after broadening the generated-manifest fallback patch in the default worker.

### Still Not Fully Closed
- ~~Cloudflare runtime parity~~ → closed with split-layer verification policy (2026-03-26)
- ~~Contact Server Action client IP correctness under Cloudflare~~ → materially closed at repo level
- ~~single release gate tied to deployment~~ → effectively closed (`pnpm release:verify` + deployed smoke)
- full production env fail-fast contract (partially closed, remaining work minor)
- long-term governance docs and truth registry
- residual shared runtime script cost
- trustworthy local parity proof for the split-worker Cloudflare architecture

## Task Inventory

### Track A: Release Truth and Deployment Safety

#### A1. Cloudflare support decision
- Goal: Decide whether Cloudflare is a supported release-grade platform or a secondary/non-release platform.
- Depends on: none
- Enables: A2, A3, A4, governance documentation
- Status: **decided (2026-03-26)** — Cloudflare is the primary deployment platform
- Deliverables:
  - ✅ explicit support statement in `.claude/rules/architecture.md`
  - ✅ aligned verification policy (split-layer: local preview + deployed smoke)
- Release impact: **resolved**

#### A2. Cloudflare runtime parity closure
- Goal: Ensure Cloudflare runtime routes behave correctly, not just builds.
- Depends on: A1
- Enables: A5
- Status: **closed with split-layer policy (2026-03-26)**
  - `pnpm smoke:cf:preview` passes — proves page/header/cookie/redirect behavior locally
  - `pnpm smoke:cf:preview:strict` still fails on `/api/health` — formally downgraded to diagnostic (not release-blocking)
  - the old `prefetch-hints` / optional-manifest crash family is resolved upstream by `@opennextjs/cloudflare@1.17.3`
  - remaining `/api/health` local failure is an upstream OpenNext/Wrangler local-preview limitation, not an application defect
- Deliverables:
  - ✅ working local preview smoke for page routes
  - ✅ failure made visible in automated checks
  - ✅ split-layer verification policy documented in `.claude/rules/architecture.md`
- Release impact: **resolved** — local preview proves pages, deployed smoke proves API
- Policy: see `.claude/rules/architecture.md` → "Cloudflare Verification Policy"

#### A3. Contact client IP correctness under Cloudflare
- Goal: Ensure Contact lead protection logic uses real client identity on Cloudflare.
- Depends on: A1
- Enables: A5
- Status: **closed (2026-03-26)**
  - the current repository fix uses a middleware-derived internal client-IP header so the Contact Server Action does not need to trust raw Cloudflare headers directly in `headers()`-only contexts
  - focused middleware, helper, Contact action, and integration coverage now protect this path
- Deliverables:
  - ✅ corrected client IP path for Contact action
  - ✅ Cloudflare-specific automated regression
- Release impact: **resolved**

#### A4. Production env fail-fast contract
- Goal: Make missing release-critical secrets or stores fail before production requests.
- Depends on: none
- Enables: A5
- Status: materially improved in the current execution slice
- Deliverables:
  - production validation covers all required stores/secrets
  - deploy workflows invoke builds in explicit production mode so the stricter runtime contract actually runs on release paths
- Release impact: blocker

#### A5. Single release gate
- Goal: Replace fragmented checks with one deploy-blocking verification command.
- Depends on: A2, A3, A4
- Enables: final release readiness
- Status: **effectively closed (2026-03-26)**
  - canonical repo-side entrypoint `pnpm release:verify` exists and passes locally
  - deploy workflows are wired to call it
  - Cloudflare proof boundary is now formally split: local preview for pages, deployed smoke for API
  - post-deploy smoke is unified across Cloudflare and Vercel
- Deliverables:
  - ✅ one command (`pnpm release:verify`)
  - ✅ wired into deploy workflow
  - ✅ documented pass/fail criteria (see `.claude/rules/architecture.md` → Cloudflare Verification Policy)
- Release impact: **resolved**

### Track B: Performance Structural Closure

#### B1. Root client message scoping
- Goal: Keep the global client translation payload limited to truly global interactive namespaces.
- Depends on: none
- Status: implementation substantially complete, continue verification-only
- Deliverables:
  - allowlist maintained
  - tests guarding scope
- Release impact: high priority, not blocker

#### B2. Page-local client message scoping
- Goal: Ensure page-local interactive islands carry their own translation payload instead of using the root client provider.
- Depends on: B1
- Status: Contact completed; audit remaining candidates
- Candidate surfaces:
  - product inquiry flows
  - newsletter subscription flows
  - any future page-only interactive islands
- Release impact: high priority

#### B3. Shared runtime script attribution and budget
- Goal: Attribute the remaining large homepage scripts and decide which are framework floor versus app-owned cost.
- Depends on: none
- Enables: B4, B5
- Status: attribution completed for the current homepage payload; remaining large cost is mostly framework/shared, with a smaller layout-island bundle still worth trimming
- Deliverables:
  - chunk attribution table
  - “must keep” vs “can reduce” split
- Release impact: medium-high

#### B4. Remaining app-owned script reduction
- Goal: Shrink app-owned client script cost that still appears in key routes.
- Depends on: B3
- Status: initial low-risk reductions landed (`nextjs-toploader` home deferral, attribution bootstrap gating, removal of the dormant global toaster, and cleanup of the dead toaster code/dependency); the remaining candidates are materially higher-risk than the cuts already landed
- Candidate targets:
  - optional interaction islands
  - delayed components with route-specific logic
  - page-only client modules
- Release impact: medium-high

#### B5. Lazy/idle strategy standardization
- Goal: Formalize when optional UI should be delayed, route-scoped, or omitted from first paint.
- Depends on: B3
- Deliverables:
  - documented delay/load policy
  - regression checks for key optional UI
- Release impact: medium

### Track C: Accessibility Structural Closure

#### C1. Main navigation semantic stability
- Goal: Keep desktop main navigation available in initial HTML with stable landmark semantics.
- Depends on: none
- Status: implementation complete; keep verification and guardrails
- Release impact: high priority

#### C2. Contact form accessibility hardening
- Goal: Ensure Contact remains usable across no-JS, keyboard, screen reader, and failure states.
- Depends on: none
- Status: substantially complete; keep verification and refine if regressions appear
- Release impact: high priority

#### C3. Floating and modal interaction contract
- Goal: Standardize dialog-like behavior across floating chat, cookie preferences, mobile menu, and similar surfaces.
- Depends on: none
- Status:
  - WhatsApp: improved
  - Cookie preferences: improved
  - mobile menu: already fairly covered, keep in verification
- Deliverables:
  - trigger relationship semantics
  - focus enter/return behavior
  - Escape handling
- Release impact: high priority

#### C4. Language switching menu semantics
- Goal: Ensure language switching remains correctly announced and keyboard operable.
- Depends on: none
- Status: improved, continue verification-only
- Release impact: medium-high

#### C5. Accessibility regression suite
- Goal: Make critical keyboard and landmark behavior part of ongoing regression testing.
- Depends on: C1, C2, C3, C4
- Deliverables:
  - stable chromium regression coverage for critical paths
- Release impact: high priority

### Track D: Governance and Repository Truth

#### D1. Deployment and identity docs alignment
- Goal: Make project identity, deployment story, and supported platforms match reality.
- Depends on: A1
- Release impact: medium

#### D2. Canonical truth registry
- Goal: Record the true runtime entrypoints, message sources, lead paths, and test-only surfaces.
- Depends on: A1 and latest implementation state
- Release impact: medium

#### D3. Dead code / fake abstraction cleanup
- Goal: Remove or isolate code that survives mainly through tests or old structure.
- Depends on: D2
- Release impact: medium

## Dependency Graph

### Hard Critical Path
1. A1 Cloudflare support decision
2. A2 Cloudflare parity closure
3. A3 Contact client IP correctness
4. A4 Production env fail-fast
5. A5 Single release gate

This is the release readiness path. If this chain is not complete, the repository is still not fully closed as a release program.
For A2/A5 specifically, the current evidence supports splitting Cloudflare proof into:
- local stock-preview proof for page-route recovery and middleware/header correctness
- deployed phase6 proof for the final split-worker API/runtime behavior

### Performance and Accessibility Parallel Path
1. B1 Root client message scoping
2. B2 Page-local client message scoping
3. B3 Shared runtime script attribution
4. B4 Remaining app-owned script reduction
5. B5 Lazy/idle strategy standardization

This path can run in parallel with A2/A3/A4 after A1 is decided, because it does not need to wait for Cloudflare fixes to produce value.

### Accessibility Parallel Path
1. C1 Main navigation semantic stability
2. C2 Contact form accessibility hardening
3. C3 Floating and modal interaction contract
4. C4 Language switching menu semantics
5. C5 Accessibility regression suite

This path is mostly parallelizable with the performance path, except C5 should happen after the key behavior fixes are in place.

### Governance Path
1. D1 Deployment and identity docs alignment
2. D2 Canonical truth registry
3. D3 Dead code / fake abstraction cleanup

This path should not block core release repairs, but D1 and D2 should happen before calling the whole program “closed.”

## Parallelization Matrix

### Can Run in Parallel Safely
- A2 with A4
- B1 with C1
- B2 with C2
- B3 with C3
- C4 with B3
- D1 can run once A1 is decided, without waiting for A2/A3/A4 completion

### Should Not Run in Parallel
- A5 should wait for A2, A3, and A4
- B4 should wait for B3 attribution
- C5 should wait for C1/C2/C3/C4 stabilization
- D3 should wait for D2, otherwise cleanup risks deleting the wrong thing

### Merge/Validation Risk Notes
- Work touching release checks, deploy workflows, or env validation should stay coordinated; those are high-conflict files.
- Work touching Contact fallbacks and Contact action behavior should stay coordinated; both affect the same user path.
- Documentation/governance work can run alongside code work, but should be updated after technical decisions, not before.

## Recommended Execution Waves

### Wave 0: Decision and Gate Foundations
- A1 Cloudflare support decision
- A4 Production env fail-fast

Reason:
- A1 unlocks the correct deployment plan.
- A4 is independent and reduces hidden runtime risk immediately.

Current status:
- A4 is now partially closed:
  - `validate:config` enforces the release-critical runtime env contract in production mode,
  - focused tests and positive/negative CLI verification have passed,
  - Cloudflare and Vercel deploy builds now run with `NODE_ENV=production`.
- Remaining Wave 0 work is now dominated by A1, because the main unresolved release truths have shifted back to platform support and runtime parity.

### Wave 1: Release Blocker Repair
- A2 Cloudflare parity closure
- A3 Contact client IP correctness

Reason:
- These are the highest-risk unresolved production truths.

Current status:
- A2 now has stronger evidence and a repeatable local reproducer:
  - `build:cf` passes under the stronger production env contract,
  - `pnpm smoke:cf:preview` now passes and proves the stock-preview page/header/cookie/redirect slice,
  - `pnpm smoke:cf:preview:strict` still isolates `/api/health` as the remaining stock-preview API gap,
  - upgrading to `@opennextjs/cloudflare@1.17.3` did not remove that remaining `/api/health` gap,
  - `pnpm smoke:cf:deploy -- --base-url <url>` is now the explicit final deployed proof command.
- A3 is now materially closed at the repository level:
  - Contact-on-Cloudflare uses a middleware-derived internal client-IP header,
  - focused tests plus `tsc`, `build`, and `build:cf` passed after the fix.

### Wave 2: Platform Safety Closure
- A5 Single release gate
- D1 Deployment and identity docs alignment

Reason:
- Once release truths are known, gate them and document them.

### Wave 3: Performance and Accessibility Structural Closure
- B1 verify root message scoping
- B2 finish page-local message scoping for remaining candidates
- B3 shared runtime script attribution
- C1 verify main navigation semantics
- C2 verify Contact form accessibility
- C3 finish floating/modal interaction contract
- C4 verify language menu semantics

Reason:
- These tasks are mostly parallel and now sit on a more stable base.

### Wave 4: Guardrails and Cleanup
- B4 remaining app-owned script reduction
- B5 lazy/idle strategy standardization
- C5 accessibility regression suite completion
- D2 canonical truth registry
- D3 dead code / fake abstraction cleanup

Reason:
- After the major truths are fixed, convert them into durable guardrails and cleanup.

## Suggested Ownership Split

### Stream 1: Release / Platform
- A1, A2, A3, A4, A5

### Stream 2: Performance / Client Payload
- B1, B2, B3, B4, B5

### Stream 3: Accessibility / Interaction Quality
- C1, C2, C3, C4, C5

### Stream 4: Governance / Cleanup
- D1, D2, D3

This split minimizes overlap while preserving a clear critical path.

## Completion Criteria

The program is only “closed” when all of the following are true:
- Release blockers are resolved and enforced by a real release gate.
- Main navigation and Contact remain meaningful in no-JS HTML.
- Client payload scoping is reduced and protected by tests.
- Critical floating/modal interactions have explicit accessibility behavior and tests.
- Performance remains stable after the payload reductions.
- Documentation reflects actual runtime and deployment truth.

## Residual Risks
- Shared runtime/framework chunk cost remains and may not be easy to reduce without deeper framework-level tradeoffs.
- Future reintroduction of page-local interactive features can accidentally widen the global client payload again unless the current scoping rules are preserved.
- New dialog-like UI can regress focus behavior if it bypasses the now-established interaction contract.

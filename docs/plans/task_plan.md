# Task Plan: Performance and Accessibility Repair Program

## Goal
Drive the repair program forward with dependency-aware execution, sub-agent coordination, and verified progress on the remaining performance and accessibility closure work.

## Phases
- [x] Phase 1: Plan and setup
- [x] Phase 2: Consolidate findings and constraints
- [x] Phase 3: Build dependency-aware repair program
- [x] Phase 4: Parallel execution and initial integration
- [x] Phase 5: Verification and plan refresh
- [x] Phase 6: Deliver updated execution state

## Key Questions
1. Which tasks are true release blockers versus important but non-blocking improvements?
2. Which tasks can run safely in parallel without causing merge or validation conflicts?
3. Which tasks sit on the critical path because other work depends on them being finished first?
4. Which items are already fixed or partially fixed and therefore should move from “implementation” to “verification/guardrail” work?

## Decisions Made
- Use `docs/plans/` files as the working memory for this planning task so dependencies, findings, and deliverables are explicit and reusable.
- Scope this plan to the combined repair program, with special attention to performance and accessibility because those were the last major deep-dive tracks.
- Shift from planning-only mode into execution mode with coordinated substreams rather than a single serial thread.
- Keep browser-regression changes isolated to Playwright coverage where possible, while the main thread handles remaining production accessibility fixes and plan updates.
- Treat the remaining homepage byte problem as a layout-island problem, not a page-content problem, unless later evidence contradicts that.
- Keep stable accessibility browser assertions in `tests/e2e/navigation.spec.ts` rather than maintaining a second overlapping Playwright suite that is more sensitive to deferred UI timing.
- Use low-risk app-owned layout islands as the next performance lever before considering broader structural tradeoffs in framework/runtime cost.
- Remove dormant layout-level UI helpers when the current shipped codebase has no real producers for them, instead of keeping a permanent global slot “just in case”.
- Treat `cookie-consent` and `theme` as higher-risk global feature chains, not as routine byte-trimming candidates, unless new evidence shows a clearly isolated waste path.
- Start a new execution slice on Track A4 because the next highest-value closure is preventing production deploys that are "build green but runtime broken" due to missing secrets, stores, or explicit degraded overrides.
- Expand the fail-fast contract beyond site-config placeholders to cover the real Contact and security path, because the shipped Contact flow is a release-critical production surface.
- Keep the strict runtime contract gated on `NODE_ENV=production` so local non-release builds are not forced to carry production secrets, then wire deploy workflows to run builds in explicit production mode.
- Move the next execution slice to A2 Cloudflare runtime parity, because A4 is no longer the weakest point on the release-critical path.
- Treat this A2 slice as “make the failure reproducible and automation-ready” before attempting a runtime workaround, because the current strongest evidence points to an OpenNext-generated handler incompatibility rather than a missing repository asset.
- Split the current A2 follow-up into parallel substreams: generated-worker compatibility, middleware cookie/header drift, and workflow/release-gate integration.
- Prioritize repository-controlled parity fixes (cookie/header drift) in the main thread while sub-agents map the generated-worker incompatibility and the safe workflow integration path.
- Treat the stock `opennextjs-cloudflare preview` path as a noisy but still useful signal: it can catch obvious breakage, but it is not automatically a faithful release-grade proof for the repo's split-worker Cloudflare design.
- Treat the remaining A2 failure as two problems, not one:
  - page-route rendering in the default worker still trips over multiple Next 16 manifests,
  - API requests in the same stock preview still run through the default worker even though the repo is configured with split API workers.
- Treat the generated phase6 local harness as a separate tooling-risk track, not as the default next step for A2.
  - Recent `wrangler dev` attempts against the generated `web`, `apiLead`, and `gateway` configs show local Wrangler/Miniflare runtime startup failures even with `--no-bundle` and unique inspector ports, so continuing to build a bespoke local harness is not the highest-value next move right now.
- Add a canonical repo-side release entrypoint now, even before the final Cloudflare proof split is fully closed.
  - `release:verify` can cover the repo-owned checks immediately, while the remaining Cloudflare split-worker proof stays explicitly tracked as an open A2/A5 edge.
- Treat real Cloudflare deployment verification as passed based on external execution evidence, so the remaining program scope is no longer release truth. The final cleanup phase now focuses on third-party service completion, guardrails, and governance.
- Use `docs/plans/final_cleanup_execution_checklist.md` as the new execution handoff for the close-out phase.

## Errors Encountered
- A targeted mobile-navigation unit test failed after localizing the language section label because the assertion expected the wrong casing.
  - Resolution: update the assertion to the actual translated string and rerun the focused suite.
- An experimental standalone `interaction-accessibility` Playwright spec duplicated checks already covered elsewhere and proved flaky against deferred surfaces like cookie consent and mobile navigation activation timing.
  - Resolution: remove the standalone spec and keep the stable assertions inside `tests/e2e/navigation.spec.ts`.
- The historical WhatsApp floating launcher was never guaranteed to appear in every local verification environment because the placeholder phone number disabled the feature at runtime.
  - Resolution: preserve the historical unit-level accessibility proof in archive context, but remove active browser-level expectations now that the launcher is retired before launch.
- The existing `validate:config` hook runs during every `prebuild`, so making runtime env validation unconditional would have broken ordinary local builds that are not meant to carry release secrets.
  - Resolution: restrict the strict runtime contract to explicit production mode and update deploy workflows to set `NODE_ENV=production` on their build steps.
- Cloudflare preview still fails even after a clean `build:cf` with a complete production-style env contract.
  - Resolution: capture the failure with a reusable smoke script, confirm the exact manifest loader error, and record the header/cookie drift separately from the 500 root cause.
- After the middleware drift was fixed, the stock Cloudflare preview still returned 500s for key routes but the underlying causes changed across reruns (`prefetch-hints.json`, `subresource-integrity-manifest.json`, and `dynamic-css-manifest` on page routes, plus dynamic API-route loading in the default worker).
  - Resolution: stop treating this as one missing file or one bad header; record it as a broader generated-worker compatibility problem and keep it separate from the now-fixed repository-controlled middleware drift.
- The phase6 generator produces a different routing shape than the stock preview entrypoint: gateway + web + split API workers, with service bindings between them.
  - Resolution: do not assume the stock single-worker preview alone is enough to prove split-worker parity; either build a local phase6 harness or downgrade Cloudflare release expectations.
- A trial workaround to force `/api/health` onto the Edge runtime failed at normal `pnpm build` time because this repo has `cacheComponents` enabled and Next 16 rejects route-level `runtime` config in that mode.
  - Resolution: revert the runtime experiment and keep `/api/health` on the default route configuration; do not retry this workaround unless the cache-components constraint changes.
- Generated phase6 workers still fail to start cleanly under local `wrangler dev`, even when bundle work is skipped.
  - Evidence:
    - `wrangler dev --config .open-next/wrangler/phase6/{web,api-lead,gateway}.jsonc --no-bundle ...`
    - observed `MiniflareCoreError [ERR_RUNTIME_FAILURE]` / `service core:user:tianze-website-*-preview: Uncaught Error: internal error`
  - Resolution: stop treating a local phase6 harness as an immediately attainable proof path; record it as a tooling/runtime blocker and shift attention back to A1/A5 planning.
- Local phase6 worker attempts can also produce misleading inspector-port noise.
  - Evidence:
    - Wrangler reported `Address already in use` for explicitly chosen `--inspector-port` values while short-lived `workerd` processes briefly appeared on the requested ports.
  - Resolution: do not over-interpret local inspector-port errors as application-route failures; classify them under the same local tooling instability bucket.
- The initial canonical release-smoke bundle is now verified locally.
  - Evidence:
    - `pnpm test:release-smoke`
    - result: `43 passed, 1 skipped`
  - Resolution: keep this smaller browser bundle as the first repo-side release proof surface while the broader deploy-blocking release gate is still being assembled.
- The full canonical repo-side release gate now passes locally.
  - Evidence:
    - `pnpm release:verify`
    - result: passed end-to-end after lint closure work
  - Resolution: the remaining A5 gap is no longer “does the command work?” but “is it wired and policy-correct in deploy workflows, especially for Cloudflare’s split proof model?”
- Deploy workflows now share one reusable post-deploy route smoke script instead of carrying separate shell-only checks.
  - Evidence:
    - `scripts/deploy/post-deploy-smoke.mjs`
    - wired into both Cloudflare and Vercel workflows
    - verified locally against `pnpm start`
  - Resolution: repo-side deploy proof is now more consistent across platforms; the remaining gap is the Cloudflare proof boundary, not missing route coverage on deployed checks.
- The new deploy smoke script fails fast when no target server is running.
  - Evidence:
    - first local run against `http://127.0.0.1:3000` failed with `ECONNREFUSED`
    - rerun passed after `pnpm start`
  - Resolution: expected behavior; treat this as a useful availability check, not a script defect.
- Contact-on-Cloudflare identity correctness was blocked by a context mismatch:
  - API routes can still validate client identity from `NextRequest`,
  - but the shipped Contact Server Action only sees `headers()`,
  - so the Cloudflare branch of `getClientIPFromHeaders()` intentionally failed closed and collapsed Contact submissions into `0.0.0.0`.
  - Resolution:
    - derive an internal client-IP header in middleware while the request is still in trusted request context,
    - then let the Contact Server Action trust only that middleware-derived internal header on Cloudflare.
- Cloudflare proof expectations were still too implicit even after the release gate and post-deploy smoke landed.
  - Resolution:
    - make the proof split explicit in scripts:
      - `pnpm smoke:cf:preview` for stock-preview page/header proof,
      - `pnpm smoke:cf:preview:strict` for stock-preview plus `/api/health`,
      - `pnpm smoke:cf:deploy -- --base-url <url>` for deployed final proof.
    - verify that the default preview proof passes while the strict preview proof still isolates the remaining `/api/health` gap.
- The first proof-split rerun surfaced a false-positive cookie mismatch in stock preview:
  - `Expires=` timestamp differences caused the preview script to flag cookie drift even though the meaningful behavior flags matched.
  - Resolution:
    - ignore `Expires=` while comparing `Set-Cookie` flags in the stock preview smoke script.
- Upgrading `@opennextjs/cloudflare` changed the Cloudflare build result materially:
  - the upstream 1.17.3 package now already includes manifest handling for `prefetch-hints`, `dynamic-css-manifest`, and `subresource-integrity-manifest`,
  - our historical local patch script became stale and initially caused `pnpm build:cf` to fail even though the upstream build itself succeeded.
  - Resolution:
    - upgrade to `@opennextjs/cloudflare@1.17.3`,
    - make the local patch script detect upstream support and exit cleanly,
    - verify that the remaining strict-preview failure is still only `/api/health`.

## Status
**Track A closed (2026-03-26)** — All release-truth items resolved:
- A1: Cloudflare is the primary deployment platform
- A2: Split-layer verification policy adopted — local preview proves pages, deployed smoke proves API. The `/api/health` local-preview failure is an upstream OpenNext/Wrangler limitation, formally downgraded to diagnostic
- A3: Contact client IP correctness fixed at repo level via middleware-derived internal header
- A4: Production env fail-fast contract in place, deploy workflows run in production mode
- A5: `pnpm release:verify` passes locally, deploy workflows run post-deploy smoke, proof boundary documented

Policy reference: `.claude/rules/architecture.md` → Cloudflare Verification Policy

Remaining program work is in Tracks B (performance), C (accessibility), and D (governance) — none of which are release blockers.

## Final Cleanup Snapshot
- Deliverable created: `docs/plans/final_cleanup_execution_checklist.md`
- Main remaining work:
  - fill production secrets / third-party service config
  - finish performance guardrails
  - finish accessibility guardrails
  - continue dead-code / fake-entry cleanup
- Parallel sub-agent attempts for inventory and dependency mapping failed due upstream `503 Service Unavailable`; main-thread review completed the checklist directly.
- Pre-commit cleanup verified:
  - targeted Contact/navigation/cookie/header tests passed
  - `pnpm build` passed
  - `pnpm build:cf` passed
  - `pnpm build:cf:webpack` passed
  - `pnpm deploy:cf:webpack:dry-run` passed
  - local Wrangler preview is still a bounded proof surface under the current Webpack-based Cloudflare mainline and must not be treated as full deployed proof.
  - active rules, active guides, README, and canonical truth registry are now aligned to the current Cloudflare build/proof model

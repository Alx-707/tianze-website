# Technical Debt Waves A/B/C Design

**Date:** 2026-05-04
**Branch:** `tech-debt-waves-20260504`
**Status:** Approved design for implementation planning

## Goal

Close the six currently actionable engineering follow-ups without relying on formal production launch, production-domain cutover, or missing business assets.

The six follow-ups are grouped into three small waves:

1. **Wave A - Lead reliability:** partial-success owner recovery and staging lead canary contract hardening.
2. **Wave B - Product truth guards:** product family/spec parity and product sitemap freshness.
3. **Wave C - Proof gap and security decision prep:** local Cloudflare preview smoke diagnosis and CSP paid-traffic decision memo.

This is not a launch branch. It must not deploy production, submit production canary data, clean legacy Cloudflare Durable Objects, or replace business-owned assets such as logo, phone, certificates, privacy legal text, or photos.

## Why this split

The six items touch different risk surfaces:

- lead pipeline behavior and operational recovery;
- product catalog/spec/SEO truth;
- Cloudflare/OpenNext local runtime proof;
- CSP policy trade-off for future paid traffic.

Putting all six into one large behavior PR would make review noisy and increase regression risk. The implementation should be planned as three independently reviewable waves, each with its own tests and verification.

## Non-goals

- No production deploy.
- No official-domain traffic cutover.
- No production lead canary.
- No Cloudflare Durable Object deletion or migration cleanup.
- No replacement of missing business assets.
- No broad CSP policy rewrite.
- No `next/image` logo migration before real logo assets exist.

## Wave A - Lead reliability

### Problem

The contact lead pipeline can produce partial success when one downstream service succeeds and another fails. For example, email may send while CRM creation fails, or CRM creation may succeed while email sending fails.

Today the code returns a partial state and logs it, but there is no owner-facing recovery signal. That means a buyer can receive a successful-looking outcome while the site owner has no reliable recovery path.

The staging lead canary already has a safe `dry-run` and guarded `submit` / `strict` contract, but the workflow must continue to avoid overclaiming it as production proof.

### Design

Implement the smallest owner-recovery hook that is useful without adding a queue system:

1. Keep the existing buyer-facing partial-success response shape.
2. Add a focused owner-alert/recovery event path for partial contact leads.
3. Include enough sanitized context for an owner to follow up:
   - lead reference ID;
   - sanitized email;
   - whether email was sent;
   - whether CRM record was created;
   - request ID when available.
4. Keep external notification delivery best-effort and non-blocking unless the project already has a blocking alert abstraction.
5. Test the partial-success path directly at the pipeline/action boundary instead of relying on real Resend or Airtable calls.
6. Strengthen staging canary tests/docs so `dry-run`, `submit`, and `strict` remain clearly non-production.

### Acceptance criteria

- A test proves email-success/CRM-failure emits an owner-recovery signal.
- A test proves CRM-success/email-failure emits an owner-recovery signal.
- The owner-recovery signal uses sanitized email and includes the lead reference ID.
- The buyer-facing partial-success contract remains unchanged unless a test explicitly documents the new behavior.
- Staging canary docs and/or contract tests continue to state that it is not production lead proof.
- No production URL is accepted by staging canary submit/strict mode.

### Verification

Use targeted tests first:

- lead pipeline partial-success tests;
- contact action or contact processing tests if the partial state is transformed there;
- staging lead canary unit tests.

Then run a broader targeted command for lead-family coverage.

## Wave B - Product truth guards

### Problem

Product catalog data and product spec data are separate truth surfaces. A market page can silently omit a product family when there is no matching spec entry. Product sitemap freshness is also currently a static value that can drift from product edits.

These are not launch blockers by themselves, but they are exactly the kind of silent drift that makes later edits risky.

### Design

Add guardrails without redesigning the product model:

1. Create a parity test that compares visible product families with market spec registry entries.
2. Fail when a catalog family lacks a matching spec entry for a market page that renders specs.
3. Fail when the spec registry contains orphan entries that are not represented in the active product catalog, unless an explicit exception list exists with a reason.
4. Replace or fence the static product sitemap `lastModified` source with a named product freshness source.
5. Keep current rendered product pages unchanged unless the guard exposes a real inconsistency.

The sitemap freshness fix should prefer a small explicit metadata source over clever filesystem timestamp logic. The purpose is stable source truth, not volatile build-machine timestamps.

### Acceptance criteria

- A product/spec parity test fails if a new family is added without spec truth.
- The test names the missing or orphan family clearly.
- Sitemap lastmod source is named and reviewable.
- A test or source-contract assertion protects the sitemap freshness source from becoming an anonymous manual constant again.
- Existing product pages continue to build and render.

### Verification

Use targeted product/spec and sitemap tests first, then run product-related review or unit suites that already exist in the repo.

## Wave C - Proof gap and CSP decision prep

### Problem

TD-004 records that local Cloudflare preview smoke returns 500 or worker-hung on page routes. This weakens local Cloudflare proof, even though deployed smoke remains stronger.

TD-001 records a CSP trade-off: `script-src` is nonce-scoped, but `script-src-elem` allows `'unsafe-inline'` because Next.js App Router / Cache Components can emit unnonced inline script elements in static or RSC-streamed output.

The project is not formally launching now, so the right outcome is diagnosis and decision readiness, not production-risk changes.

### Design

For TD-004:

1. Reproduce the local preview failure in isolation.
2. Capture the exact route/status/log behavior.
3. Determine whether the failure belongs to:
   - generated OpenNext artifacts;
   - local workerd/Wrangler preview behavior;
   - route/runtime code;
   - smoke script assumptions.
4. If a low-risk code fix exists, implement it with a regression command.
5. If not, document the root cause and the current stronger replacement proof path.

For CSP:

1. Do not remove `script-src-elem 'unsafe-inline'` in this wave.
2. Produce a paid-traffic decision memo that explains:
   - current risk;
   - why the current exception exists;
   - what evidence would justify changing it;
   - what alternatives exist;
   - what verification must run before any future policy change.
3. Keep the CSP checker aligned with runtime reality: it should prove that `script-src` stays nonce-scoped and that any element-level inline exception is explicit and documented.

### Acceptance criteria

- TD-004 has fresh reproduction evidence or a documented reason it no longer reproduces.
- If fixed, `pnpm smoke:cf:preview` or the relevant replacement command passes.
- If not fixed, `docs/technical/technical-debt.md` and the related proof docs state the current truth without overclaiming.
- CSP decision memo exists and does not recommend an immediate broad rewrite.
- No production Cloudflare command is run as part of this wave.

### Verification

For TD-004, commands may be slower and must be serialized because `.next` / `.open-next` are shared build artifacts. Do not run `pnpm build`, `pnpm build:cf`, `pnpm preview:cf`, or deploy commands in parallel.

For CSP, use existing security/CSP checker commands and document-only review where no behavior changes are made.

## Cross-wave implementation rules

1. Use an isolated worktree or feature branch.
2. Use test-first discipline for behavior changes.
3. Keep Wave A, Wave B, and Wave C independently reviewable.
4. Do not let TD-004 block Wave A or Wave B.
5. Do not modify production deployment state.
6. Before claiming completion, run fresh verification and record the exact commands.
7. Before merge or final completion, perform a read-only adversarial review focused on proof overclaiming, production-safety boundaries, and hidden behavior drift.

## Suggested implementation order

1. Wave A first because it protects lead capture.
2. Wave B second because it protects product truth and SEO drift.
3. Wave C third because local Cloudflare preview diagnosis can take longer and should not hold smaller improvements hostage.

## Open decisions fixed by this design

- Partial-success handling should start with owner-facing recovery signal, not a full queue/outbox rewrite.
- Product sitemap freshness should use explicit source metadata, not filesystem mtimes.
- Staging canary remains non-production unless a separate staging security/data contract is configured.
- CSP remains a decision-prep task, not a main-policy rewrite.
- TD-004 can result in either a code fix or a documented root-cause/proof-boundary update.

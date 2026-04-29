# Technical Debt Registry

Active technical debt items with context, risk assessment, and decision triggers.

---

## TD-001: CSP `script-src-elem 'unsafe-inline'`

**Introduced:** Wave 1 (2026-04-26)
**Severity:** Medium — mitigated by strict `script-src` + nonce + no user-generated content

`script-src` is strict (self + nonce only). However, `script-src-elem` allows
`'unsafe-inline'` because Next.js App Router prerendered and RSC-streamed inline
`<script>` elements cannot reliably receive a per-request nonce. This is a known
Next.js limitation — static/cached HTML is generated at build time, before any
request nonce exists.

**What this means:** An attacker who can inject a `<script>` tag into the HTML
response could execute it. The practical risk is low because:
- The site has no user-generated content surfaces (no comments, no rich-text input)
- All form submissions go through server actions, not client-side rendering
- CSP report-uri is active and would surface violations

**Previous approach:** A 136-entry SHA-256 hash allowlist. This was unmaintainable
— every content, navigation, or JSON-LD change drifted the hashes.

**Options:**
1. Accept current trade-off, keep monitoring via CSP reports
2. Restrict `'unsafe-inline'` to only prerendered routes (if Next.js adds per-route CSP)
3. Move to full dynamic rendering with nonce on all pages (sacrifices PPR/static performance)

**Decision trigger:** Before scaling to paid traffic (Google Ads).

---

## TD-002: Logo uses `<img>` instead of `next/image`

**Introduced:** Wave 1 (2026-04-26)
**Severity:** Low — intentional for now, revisit when logo file exists

`src/components/layout/logo.tsx` uses a native `<img>` tag to avoid pulling the
`next/image` runtime into the shared layout chunk. The logo file does not yet
exist (business asset blocked). Once the real logo is delivered, re-evaluate
whether `next/image` is appropriate for a small static SVG in the critical layout
path.

**Decision trigger:** When Task 8 (logo replacement) is executed.

---

## TD-003: Legacy Cloudflare Durable Object cleanup after phase6 production cutover

**Introduced:** Launch readiness runtime cache removal (PR #87, 2026-04-26)
**Severity:** Medium operational debt — not a current preview blocker

PR #87 removed the current runtime cache stack from the deploy path:

- R2 incremental cache binding
- D1 tag cache binding
- Durable Object cache queue binding
- `/api/cache/invalidate`
- old `apiOps` split worker

However, removing code and Wrangler bindings does not prove Cloudflare has deleted
historical Durable Object classes or namespaces that may have been created under
old Worker service names:

- `tianze-website`
- `tianze-website-preview`
- `tianze-website-production`

The current phase6 Worker names are different:

- `tianze-website-gateway`
- `tianze-website-web`
- `tianze-website-api-lead`

Cloudflare Durable Object migrations are tied to the Worker script being
deployed. A `deleted_classes` migration on a phase6 Worker name does not prove
that a class created under an old `tianze-website*` Worker name has been cleaned
up. This is why phase6 generated configs intentionally do not include a
misleading `deleted_classes` migration.

**Current decision:** Defer real cleanup. During workers.dev preview and local
readiness work, only read-only investigation is allowed.

**Important timing rule:** The "stable for 7 days" clock starts only after the
official production domain traffic is intentionally cut over to the phase6
production Worker path. workers.dev preview availability does not start this
clock. If the site is not formally deployed on the production domain, this debt
stays in observation mode.

Running `deploy:cf:phase6:production` by itself is only a production Worker
deploy. It does not prove the official domain has been routed to phase6 and does
not start the 7-day cleanup clock.

**Allowed now:**

- Read Worker deployment/version metadata
- Read Durable Object namespace inventory
- Tail old Worker logs to check whether traffic still exists
- Improve runbooks and review prompts

**Not allowed now:**

- `deleted_classes` migration
- cleanup Worker deploy
- `wrangler delete`
- deleting old Worker services
- deleting Durable Object namespaces or data

**Cleanup prerequisites:**

1. Production domain traffic has been cut over to phase6 production Workers.
2. Phase6 production has been stable for at least 7 days after the cutover.
3. Cloudflare token or dashboard access can read Workers, deployments, versions,
   logs, and Durable Object namespaces for the relevant account.
4. Old `tianze-website*` Workers show zero real traffic in tail logs.
5. The old Worker migration history is inspected before choosing any new
   migration tag.
6. The cleanup plan is reviewed in a separate maintenance PR or maintenance
   window.

**Decision trigger:** After official production-domain phase6 cutover plus 7
days of stable operation. Until that happens, keep this item open and do not
execute destructive cleanup.

**Primary references:**

- `docs/technical/deployment-notes.md` — Legacy Durable Object cleanup boundary
- `HANDOFF.md` — Legacy DO cleanup deferred next step
- `docs/superpowers/prompts/legacy-do-cleanup-review-swarm.md` — independent
  review prompt for the cleanup runbook and future cleanup PR

---

## TD-004: Local Cloudflare preview smoke returns 500 on page routes

**Introduced:** Observed during Wrangler 4.86.0 isolated patch validation
(2026-04-28)
**Severity:** Medium operational proof gap — deployed smoke remains the stronger
Cloudflare runtime proof

During the Wrangler `4.85.0` -> `4.86.0` patch lane, `pnpm preview:cf` started
successfully, but `pnpm smoke:cf:preview` returned 500 for `/en`, `/zh`,
`/en/contact`, and `/zh/contact`. The preview process logged:

```text
Uncaught Error: The Workers runtime canceled this request because it detected that your Worker's code had hung and would never generate a response.
```

The same smoke failure reproduced on `main` with `wrangler 4.85.0`, so this is
not currently classified as a `4.86.0` regression.

**Current decision:** Do not treat local preview smoke as a release-blocking
proof for the Wrangler 4.86 patch. Keep using:

- `pnpm build`
- `pnpm build:cf:phase6`
- `pnpm review:cf:official-compare`
- `pnpm deploy:cf:phase6:dry-run`
- deployed smoke when a deployed preview URL exists

**Follow-up scope:** Debug local preview separately, starting from the generated
OpenNext worker request path and Cloudflare workerd hang behavior. Do not mix
that fix into dependency patch lanes unless the new dependency version is proven
to introduce the failure.

**Decision trigger:** Before relying on local Cloudflare preview smoke as a
merge gate again.

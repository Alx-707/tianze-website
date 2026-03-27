# Final Cleanup Execution Checklist

## Goal
Close the remaining non-blocking work after release-truth and Cloudflare deployment validation are considered complete.

## Assumption
- Real Cloudflare deployment validation has already passed.
- Remaining work is cleanup, hardening, documentation, and third-party service completion rather than release blocking.

## Parallel Workstreams

### Workstream 1: Secrets and Third-Party Service Completion
- Owner type: platform + product operations
- Depends on: user-provided secrets / external account access
- Can run in parallel with: Workstreams 2, 3, and 4

Tasks:
- Fill required deployment secrets for stable production operation:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
  - `RATE_LIMIT_PEPPER`
  - `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
  - `TURNSTILE_SECRET_KEY`
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `RESEND_API_KEY`
  - `AIRTABLE_API_KEY`
  - `AIRTABLE_BASE_ID`
- Decide whether preview should keep degraded overrides:
  - `ALLOW_MEMORY_RATE_LIMIT`
  - `ALLOW_MEMORY_IDEMPOTENCY`
- Review secondary / optional secrets and decide whether they are in active use:
  - `AIRTABLE_TABLE_NAME`
  - `EMAIL_FROM`
  - `EMAIL_REPLY_TO`
  - `CACHE_INVALIDATION_SECRET`
  - `ADMIN_API_TOKEN`
  - `WHATSAPP_API_KEY`
  - `WHATSAPP_ACCESS_TOKEN`
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `WHATSAPP_BUSINESS_ACCOUNT_ID`
  - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
  - `WHATSAPP_APP_SECRET`
  - `NEXT_PUBLIC_WHATSAPP_NUMBER`
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
  - `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`
  - `GOOGLE_SITE_VERIFICATION`

Done when:
- Every production-relevant external dependency is classified as one of:
  - configured and live
  - intentionally disabled
  - allowed to degrade
- Missing config no longer leaves hidden gray areas.

### Workstream 2: Performance Final Cleanup
- Owner type: frontend / runtime
- Depends on: none
- Can run in parallel with: Workstreams 1, 3, and 4

Tasks:
- Audit remaining page-local interactive islands so they do not leak route-specific client messages into the root payload.
- Review remaining app-owned layout-level script cost:
  - theme chain
  - cookie-consent chain
  - WhatsApp chain
  - attribution chain
- Write a lazy / idle / route-scoped loading policy for optional UI.
- Add guardrails so later changes do not reintroduce unnecessary global client cost.

Done when:
- Remaining app-owned client cost is explained and intentional.
- Optional UI loading rules are written down and testable.

### Workstream 3: Accessibility Guardrails
- Owner type: frontend / QA
- Depends on: none
- Can run in parallel with: Workstreams 1, 2, and 4

Tasks:
- Convert current accessibility fixes into long-term regression coverage for:
  - main navigation
  - Contact form
  - language switcher
  - cookie preferences
  - WhatsApp floating chat
  - mobile navigation
- Keep Contact failure-state behavior explicit when third-party services are unavailable or degraded.
- Verify focus return, Escape handling, and landmark semantics stay stable after future changes.

Done when:
- The current accessibility improvements are guarded by stable automated checks rather than memory.

### Workstream 4: Governance and Truth Cleanup
- Owner type: documentation + architecture
- Depends on: none
- Can run in parallel with: Workstreams 1, 2, and 3

Tasks:
- Align README, project identity, and deployment story with current reality.
- Create a canonical truth registry that records:
  - runtime entrypoint
  - i18n runtime truth
  - main shipped lead path
  - Cloudflare proof model
  - test-only / tooling-only non-production surfaces
- Continue cleaning dead code and fake entrypoints that are mainly kept alive by tests.

Done when:
- A new maintainer can understand what is actually live without reverse-engineering the repository.

## API Key / Secret List For User Completion

### Required For Stable Cloudflare Production Operation
- `CLOUDFLARE_API_TOKEN`: Cloudflare deployment from GitHub Actions
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare deployment target account
- `RATE_LIMIT_PEPPER`: stable server-side key hardening for abuse protection
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`: stable Server Actions encryption key
- `TURNSTILE_SECRET_KEY`: server-side Turnstile verification
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: browser-side Turnstile widget key
- `RESEND_API_KEY`: admin notification / email send path
- `AIRTABLE_API_KEY`: lead record persistence
- `AIRTABLE_BASE_ID`: Airtable target base

### Usually Required If Corresponding Feature Is Live
- `AIRTABLE_TABLE_NAME`: Airtable target table name
- `EMAIL_FROM`: outbound sender address
- `EMAIL_REPLY_TO`: reply-to address
- `CACHE_INVALIDATION_SECRET`: cache invalidation API protection
- `ADMIN_API_TOKEN`: admin-protected contact API access
- `WHATSAPP_API_KEY`: protects the WhatsApp send API route
- `WHATSAPP_ACCESS_TOKEN`: Meta WhatsApp API access
- `WHATSAPP_PHONE_NUMBER_ID`: WhatsApp sending identity
- `WHATSAPP_BUSINESS_ACCOUNT_ID`: WhatsApp business account linkage
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`: WhatsApp webhook verification
- `WHATSAPP_APP_SECRET`: webhook signature verification / app security
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: enables the public WhatsApp entry point

### Optional / Platform / Analytics
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: GA4 measurement
- `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`: Vercel analytics
- `GOOGLE_SITE_VERIFICATION`: Google Search Console verification

## Recommended Execution Order
1. User fills required production secrets.
2. Platform verifies third-party service behavior and degradation rules.
3. Frontend closes performance and accessibility guardrails in parallel.
4. Documentation / truth registry cleanup lands.
5. Dead-code cleanup follows after truth registry is written, so it uses the correct production closure.

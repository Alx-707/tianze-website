# Lane 02 - Security / Trust Boundary

## 1. Scope

Lane scope: public write paths, trust boundary, input validation, bot checks, client IP handling, rate limiting, idempotency, CSP, error responses, and logging.

Audited baseline:

- `origin/main @ 3ea482b53ca8db35f534f495211450d94bee963a`
- Local HEAD: `3ea482b53ca8db35f534f495211450d94bee963a`
- PR #90 merge commit included by preflight.
- Business-code diff for this lane: not modified.

Trust boundary map:

- Browser / buyer input crosses into:
  - Contact page Server Action: `src/lib/actions/contact.ts`
  - Product inquiry API: `src/app/api/inquiry/route.ts`
  - Newsletter subscribe API: `src/app/api/subscribe/route.ts`
  - Turnstile verification API: `src/app/api/verify-turnstile/route.ts`
  - CSP report ingest: `src/app/api/csp-report/route.ts`
- Bot / abuse controls:
  - Turnstile: `src/lib/turnstile.ts`, `src/lib/security/turnstile-config.ts`
  - Rate limit: `src/lib/api/with-rate-limit.ts`, `src/lib/security/distributed-rate-limit.ts`
  - Idempotency: `src/lib/idempotency.ts`, `src/lib/security/stores/idempotency-store.ts`
- Client identity:
  - API routes use `getClientIP(request)`.
  - Cloudflare Server Actions rely on middleware-derived `x-internal-client-ip`.
  - Raw `cf-connecting-ip` / `x-forwarded-for` are not supposed to be trusted directly outside the trusted entry code.
- Side effects:
  - Lead pipeline sends email and writes CRM records via `processLead`.
  - Production requires Upstash-backed rate limit / idempotency, Turnstile secret, Resend, Airtable, and stable Server Actions key.
- CSP:
  - Middleware applies security headers for page routes.
  - `/api/csp-report` accepts browser CSP violation reports and logs normalized evidence.

P0/P1 result for this lane: no confirmed P0/P1 security finding from fresh evidence. The findings below are P2/P3 because they are real trust-boundary weaknesses, but not yet proven as direct data compromise, deployed outage, or confirmed buyer-blocking production behavior.

## 2. Fresh Evidence Collected

| Evidence ID | Type | Exact reference | Result | Notes |
| --- | --- | --- | --- | --- |
| E-L02-001 | file | `docs/audits/full-project-health-v1/evidence/preflight.md` | Confirms clean baseline, target SHA, allowed writes, and security lane command list. | Preflight owned by orchestrator. |
| E-L02-002 | file | `.claude/rules/security.md` | Security policy requires rate limit, body-size gate, validation, Turnstile where applicable, and idempotency for public write endpoints. | Static policy evidence. |
| E-L02-003 | file | `.claude/rules/cloudflare.md` | Cloudflare Server Actions must use middleware-derived internal client IP. | Static policy evidence. |
| E-L02-004 | file | `src/app/api/inquiry/route.ts:124-203` | `/api/inquiry` runs rate limit, body read/hash, schema validation, Turnstile, idempotency, then lead processing. | Static code evidence. |
| E-L02-005 | file | `src/app/api/subscribe/route.ts:92-147` | `/api/subscribe` reads bounded JSON and requires idempotency, but only checks email presence before Turnstile; full email schema validation happens later inside `processLead`. | Finding FPH-L02-001. |
| E-L02-006 | file | `src/lib/lead-pipeline/lead-schema.ts:125-128`, `src/lib/lead-pipeline/process-lead.ts:99-106` | Newsletter email validation is defined in the lead schema and enforced inside `processLead`, after Subscribe route's Turnstile call. | Finding FPH-L02-001. |
| E-L02-007 | file | `src/lib/actions/contact.ts:211-252`, `src/lib/contact-form-processing.ts:117-158` | Contact Server Action performs idempotency-required processing and validates contact data before Turnstile verification. | Comparison evidence. |
| E-L02-008 | file | `src/lib/security/client-ip.ts:185-254`, `src/middleware.ts:40-54,247-265` | Client IP trust model is explicit: Cloudflare Server Actions use internal header, API routes use trusted platform headers only when source checks pass. | Static code evidence. |
| E-L02-009 | command | `pnpm security:semgrep` -> `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/security-semgrep.txt` | Passed. Semgrep ERROR findings: 0; WARNING findings: 2. | Warning JSON copied to lane evidence. |
| E-L02-010 | report | `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/semgrep-warning-1777287984901.json` | Two warning-level static signals: Turnstile placeholder computed property and UTM attribution key loop. | Manually reviewed as not P0/P1. |
| E-L02-011 | command | `pnpm security:audit` -> `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/security-audit.txt` | Passed. No known production dependency vulnerabilities found. | Fresh dependency audit. |
| E-L02-012 | command | `pnpm lint:pii` -> `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/lint-pii.txt` | Passed. No unsanitized PII in log statements per repo script. | Does not prove logs are perfect; only proves this guardrail passed. |
| E-L02-013 | command | `pnpm security:csp:check` -> `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/security-csp-check.txt` | Failed / blocked. Script tried `next start`, but `.next` production build was absent and this lane is forbidden to run `pnpm build`. | Environment/process blocked, not a project security failure. |
| E-L02-014 | command | `pnpm exec vitest run ...security core tests...` -> `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/vitest-security-core.txt` | Passed: 4 files, 190 tests. | Covers client IP, rate limit key strategies, distributed rate limit, idempotency store. |
| E-L02-015 | command | `pnpm exec vitest run ...api security tests...` -> `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/vitest-api-security.txt` | Passed: 6 files, 64 tests. | Covers inquiry, Turnstile endpoint, and CSP report endpoint. Does not cover subscribe route. |
| E-L02-016 | command | `pnpm exec vitest run src/app/__tests__/actions.test.ts src/app/__tests__/contact-integration.test.ts` -> `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/vitest-contact-action-security.txt` | Passed: 2 files, 30 tests. | Covers contact Server Action security chain. |
| E-L02-017 | command | `rg -n "subscribe" src/app/api/subscribe src/components src/app -g '*test*'` -> `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/rg-subscribe-tests.txt` | Passed, but only found Turnstile widget tests using `newsletter_subscribe`; no `/api/subscribe` route tests found. | Finding FPH-L02-002. |
| E-L02-018 | file | `src/config/security.ts:55-63` | Production `script-src-elem` includes `'unsafe-inline'`. | Finding FPH-L02-003. |
| E-L02-019 | file | `src/app/api/csp-report/route.ts:73-93,205-238` | CSP report logging sanitizes URLs and IPs, truncates script sample, but still accepts user-controlled report fields into logs. | Finding FPH-L02-004. |
| E-L02-020 | command | `APP_ENV=production NODE_ENV=production pnpm validate:config` -> `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/validate-config-production-env.txt` | Failed as expected in local environment because production secrets/base URL are absent. | Environment-blocked for live production readiness; useful proof that local lane env lacks credentials. |
| E-L02-021 | command | source inventory -> `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/source-inventory.txt` | Shows `src/lib/rate-limit`, `src/lib/validation`, and `src/lib/validations.ts` do not exist in this baseline. | Process note: lane prompt/security rule names stale paths; actual validation lives under form schema / lead schema. |

## 3. Commands Run

| Command | Result | Classification |
| --- | --- | --- |
| `git status --short --branch` | passed | diagnostic |
| `rg --files .claude/rules semgrep.yml src/app/api src/lib/security src/lib/contact src/lib/rate-limit src/lib/validation` | failed | diagnostic |
| `pnpm security:semgrep` | passed | optional |
| `pnpm security:audit` | passed | optional |
| `pnpm security:csp:check` | failed | environment-blocked |
| `pnpm lint:pii` | passed | optional |
| `pnpm exec vitest run src/lib/security/__tests__/client-ip.test.ts src/lib/security/__tests__/rate-limit-key-strategies.test.ts src/lib/security/__tests__/distributed-rate-limit.test.ts src/lib/security/__tests__/idempotency-store.test.ts` | passed | diagnostic |
| `pnpm exec vitest run src/app/api/inquiry/__tests__/route.test.ts src/app/api/inquiry/__tests__/inquiry-integration.test.ts src/app/api/verify-turnstile/__tests__/route.test.ts src/app/api/csp-report/__tests__/route-post-core.test.ts src/app/api/csp-report/__tests__/route-post-security.test.ts src/app/api/csp-report/__tests__/route-rate-limit.test.ts` | passed | diagnostic |
| `pnpm exec vitest run src/app/__tests__/actions.test.ts src/app/__tests__/contact-integration.test.ts` | passed | diagnostic |
| `rg -n "subscribe" src/app/api/subscribe src/components src/app -g '*test*'` | passed | diagnostic |
| `APP_ENV=production NODE_ENV=production pnpm validate:config` | failed | environment-blocked |

## 4. Findings

### FPH-L02-001: `/api/subscribe` spends Turnstile verification before full email schema validation

- Severity: P2
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: security
- Source lane: 02-security-trust-boundary
- Evidence:
  - type: file
    reference: `src/app/api/subscribe/route.ts:92-127`
    summary: Subscribe route reads bounded JSON, checks only that `email` is present, then calls `validateLeadTurnstileToken`.
  - type: file
    reference: `src/app/api/subscribe/route.ts:129-137`
    summary: Route builds newsletter lead input after Turnstile and sends it to `processLead`.
  - type: file
    reference: `src/lib/lead-pipeline/lead-schema.ts:125-128`
    summary: Actual newsletter email format and max-length validation lives in `newsletterLeadSchema`.
  - type: file
    reference: `src/lib/lead-pipeline/process-lead.ts:99-106`
    summary: Full lead schema validation happens inside `processLead`, after Subscribe has already spent the Turnstile call.
- Business impact:
  - A bad newsletter request can still force the server to call the external Turnstile verifier before the app rejects the email as invalid. That wastes protection budget, adds latency, and gives abuse traffic a more expensive path than it needs.
- Root cause:
  - Subscribe route uses the shared lead pipeline for final validation, but the route-level security gate only checks `email !== undefined && email !== ""`. Contact and inquiry have a clearer cheap-validation-before-external-call shape; Subscribe diverged.
- Recommended fix:
  - Add a small route-level Subscribe schema before Turnstile: bounded object, `email: z.string().email().max(...)`, optional `turnstileToken` type check, and any allowed `pageType` handling. Only call Turnstile after this parse succeeds.
- Verification needed:
  - Add a targeted test where invalid email plus a token returns validation error and `verifyTurnstileDetailed` is not called. Also verify valid email still reaches Turnstile and `processLead`.
- Suggested Linus Gate: Simplify

### FPH-L02-002: `/api/subscribe` has code-level controls but no route-level security regression tests

- Severity: P2
- Evidence level: Confirmed by execution
- Confidence: high
- Domain: tests
- Source lane: 02-security-trust-boundary
- Evidence:
  - type: command
    reference: `rg -n "subscribe" src/app/api/subscribe src/components src/app -g '*test*'` in `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/rg-subscribe-tests.txt`
    summary: Search found only `newsletter_subscribe` widget action assertions; no `/api/subscribe` route test file or route-level protection test appeared.
  - type: command
    reference: `pnpm exec vitest run ...api security tests...` in `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/vitest-api-security.txt`
    summary: Fresh API security tests passed for inquiry, Turnstile, and CSP report; Subscribe route was not part of the executed security proof.
  - type: file
    reference: `src/app/api/subscribe/route.ts:92-147`
    summary: Subscribe is a public write endpoint with rate limit, idempotency, body parsing, Turnstile, and lead side effects, so it needs executable protection coverage.
- Business impact:
  - The newsletter form is a public submission path. If rate limit, idempotency, Turnstile, body size, or validation behavior regresses, current targeted security tests are unlikely to catch it before launch.
- Root cause:
  - Inquiry and contact got explicit route/action security tests; Subscribe kept similar controls in code but did not receive the same proof contract.
- Recommended fix:
  - Add `src/app/api/subscribe/__tests__/route.test.ts` and a small integration test suite covering: invalid JSON, 413 body size, missing idempotency key, duplicate idempotency replay, rate-limit short-circuit, missing/invalid Turnstile, invalid email before Turnstile, and valid happy path.
- Verification needed:
  - Run the new targeted Subscribe tests plus existing `vitest-api-security` command. Orchestrator should not treat Subscribe as equally proven until this exists.
- Suggested Linus Gate: Needs proof

### FPH-L02-003: Production CSP still allows inline script elements through `script-src-elem`

- Severity: P2
- Evidence level: Confirmed by static evidence
- Confidence: medium
- Domain: security
- Source lane: 02-security-trust-boundary
- Evidence:
  - type: file
    reference: `src/config/security.ts:55-63`
    summary: `script-src-elem` includes `'unsafe-inline'` for production, while the stricter `script-src` path uses nonce when available.
  - type: command
    reference: `pnpm security:csp:check` in `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/security-csp-check.txt`
    summary: Runtime CSP inline-script check could not run because no `.next` production build existed and this lane is forbidden to run `pnpm build`.
- Business impact:
  - CSP is meant to be the last safety net if an HTML/script injection bug appears. Allowing inline script elements means that last net is weaker for `<script>` element injection. No current injection sink was proven in this lane, so this is a defense-depth risk, not a confirmed exploit.
- Root cause:
  - The config carries a compatibility workaround for prerendered/App Router inline scripts, but the exception is broad and permanent rather than tied to a measured list of required inline framework scripts.
- Recommended fix:
  - Re-run CSP proof after Lane 00 produces a build. If inline scripts are still required, document the exact unavoidable scripts and prefer nonce/hash-based allowance where possible. If they are not required, remove `'unsafe-inline'` from `script-src-elem`.
- Verification needed:
  - After `pnpm build`, run `pnpm security:csp:check`; then inspect browser CSP headers on representative pages and confirm no required script breaks.
- Suggested Linus Gate: Needs proof

### FPH-L02-004: CSP report logs are size-limited but still accept several user-controlled fields into logs

- Severity: P3
- Evidence level: Confirmed by static evidence
- Confidence: medium
- Domain: security
- Source lane: 02-security-trust-boundary
- Evidence:
  - type: file
    reference: `src/app/api/csp-report/route.ts:73-93`
    summary: CSP report log payload includes browser-provided directive fields, `scriptSample`, `userAgent`, and client IP.
  - type: file
    reference: `src/app/api/csp-report/route.ts:205-238`
    summary: Logs pass through `sanitizeLogContext`; IP and URLs are normalized, and `scriptSample` is truncated, but not redacted or allowlisted.
  - type: command
    reference: `pnpm lint:pii` in `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/lint-pii.txt`
    summary: Existing PII lint passed, so this is not a detected unsanitized PII violation by current guardrails.
- Business impact:
  - CSP reports are attacker-influenced telemetry. The current endpoint limits body size and trims URLs, which is good, but debugging fields can still put noisy or sensitive snippets into production logs. This is mostly an observability hygiene risk unless the logging backend exposes those logs broadly.
- Root cause:
  - The endpoint favors useful debugging detail over a strict log allowlist. The sanitizer handles known PII keys but does not make CSP report fields a strict schema for logging.
- Recommended fix:
  - Keep the 16 KB body limit, but log only a compact allowlist: directive, blocked URL origin/path, status code, redacted user-agent family, and a hash or first-safe-fragment of `script-sample`. Strip control characters from all logged strings.
- Verification needed:
  - Add a CSP report test with query strings, control characters, and script sample content; assert logs do not contain raw query tokens or raw script samples.
- Suggested Linus Gate: Simplify

## 5. Blocked / Not Proven

| Claim | Blocker | Needed proof | Suggested classification |
| --- | --- | --- | --- |
| Live Cloudflare request headers and deployed client IP behavior are correct. | No Cloudflare dashboard/deployed runtime credentials in this lane. | Deployed smoke or Cloudflare preview with request header capture showing `cf-connecting-ip`, trusted source behavior, and Server Action `x-internal-client-ip`. | Blocked |
| Real Turnstile validation works against the production widget/secret. | Real Turnstile secret/site key not available to this lane; local tests mock external verification. | Safe staging token test against Cloudflare Turnstile with expected hostname/action. | Blocked |
| Resend and Airtable side effects are delivered end-to-end from contact/inquiry/subscribe. | Credentials unavailable and production writes are forbidden. | Non-production credentialed smoke that verifies email/CRM side effects without touching production. | Blocked |
| Runtime CSP has no unsafe inline script violations on built pages. | `pnpm security:csp:check` needs an existing production `.next`; this lane cannot run `pnpm build`. | Lane 00 build artifact, then `pnpm security:csp:check` and page header inspection. | Blocked |
| Subscribe route security behavior is proven by tests. | No route-level Subscribe tests found. | Add and run Subscribe API tests covering all public-write controls. | Needs proof |
| The lane prompt path list is fully current. | `src/lib/rate-limit`, `src/lib/validation`, and `src/lib/validations.ts` are absent in this baseline. | Orchestrator should update future lane prompts/rules to point at `src/lib/security/**`, `src/lib/form-schema/**`, and `src/lib/lead-pipeline/lead-schema.ts`. | Needs proof |

## 6. Handoff to Orchestrator

| Finding ID | Handoff action | Reason |
| --- | --- | --- |
| FPH-L02-001 | merge | Real trust-boundary ordering issue in Subscribe. Challenge severity if Lane 05 adds stronger test evidence. |
| FPH-L02-002 | merge | Confirmed proof gap for a public write endpoint. Should likely be deduped with Lane 05 if they report the same Subscribe test gap. |
| FPH-L02-003 | challenge | Static CSP weakness is real, but runtime impact depends on Lane 00 build/CSP proof. Do not upgrade without runtime evidence or a proven injection sink. |
| FPH-L02-004 | keep | Low-severity log boundary cleanup. Keep as P3 unless logging exposure or raw sensitive samples are proven. |

Orchestrator should especially challenge:

- Whether Subscribe deserves P2 or P1. My lane evidence supports P2: the flow has protections in code, but order and proof are weaker than contact/inquiry.
- Whether CSP `script-src-elem 'unsafe-inline'` is unavoidable for current Next.js output. This requires built-page proof, not opinion.
- Whether any final report claim about live Cloudflare/Turnstile/Resend/Airtable should stay blocked until credentials exist.

## 7. Process Notes

- I did not modify business code, config, dependencies, workflow, content, build scripts, or public assets.
- I wrote only:
  - `docs/audits/full-project-health-v1/lanes/02-security-trust-boundary.md`
  - `docs/audits/full-project-health-v1/evidence/02-security-trust-boundary/**`
- No screenshots were needed or created.
- `pnpm security:semgrep` creates ignored files under `reports/`; I copied the run's Semgrep JSON into this lane's allowed evidence directory so the tracked lane evidence does not depend on ignored report paths.
- Existing untracked evidence from other lanes was present when this lane started. I did not edit or move those files.

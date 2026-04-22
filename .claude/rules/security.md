---
paths:
  - "src/app/api/**/*"
  - "src/lib/security/**/*"
  - "src/lib/validations.ts"
---

# Security Implementation

## Threat Modeling

See `/.claude/rules/threat-modeling.md` for STRIDE analysis on new/changed API routes.

## Server Code Protection

- Add `import "server-only"` at top of sensitive server files
- Server Actions / Route Handlers must perform authn/authz internally (DAL-style); proxy/middleware may act as optional front-line filtering only and must not be the sole auth layer

## XSS Prevention

- **Never** use unfiltered `dangerouslySetInnerHTML`
- Must use `DOMPurify.sanitize()` to filter user HTML
- URLs must validate protocol (only `https://`, `http://`, `/`)

## Input Validation

- **All user input** must use Zod schema validation
- API routes must call `schema.parse(body)` before processing
- Query params: explicitly validate type (may be string/array/object)
- File paths: use allowlist or `path.resolve()` + prefix check (symlinks may escape)
- Public JSON endpoints must have an explicit **body size gate** before or during parsing
- Shared JSON parsers (for example `safeParseJson`) are preferred over per-route ad hoc parsing so size/error behavior stays consistent

## Static Analysis (Semgrep)

- Code-level security scanning is governed by Semgrep (`semgrep.yml`); CI runs baseline scanning in the `security` job of `.github/workflows/ci.yml`.
- `eslint-plugin-security`'s `security/detect-object-injection` is disabled by default in this project because it cannot understand TypeScript type constraints and creates tool-driven code noise; object-injection coverage is handled by Semgrep rules instead.

## API Security

### API Error Contract

- Public API routes must expose a stable machine-readable error contract.
- Prefer `errorCode` + shared response helpers (for example `createApiErrorResponse()` / `createApiSuccessResponse()`) over free-text `error` / `message` fields.
- Do not treat English literals as protocol.
- Do not return raw validation internals or ad hoc `details` payloads to clients unless the endpoint explicitly defines that contract.
- When server routes move to `errorCode`, client consumers and tests must move with them; do not keep dual contracts alive.

| Measure | Config |
|---------|--------|
| Rate Limiting | Default 10/min/IP, Contact API 5/min/IP |
| Anti-abuse / Bot filtering | Cloudflare Turnstile (human verification, not a CSRF token) |
| Idempotency | Required for side-effectful public write paths where duplicate submission matters |
| CSRF | Not required in the current architecture (no cookie-based session auth); if that changes, add Origin validation + SameSite + CSRF token |

Rate limit utility: `src/lib/security/distributed-rate-limit.ts`

### Known API Endpoints & Protection Status

| Endpoint | Required Protection | Status |
|----------|---------------------|--------|
| `/api/whatsapp/send` | API Key Auth + Rate Limit | ✅ |
| `/api/whatsapp/webhook` | Signature Verify + Rate Limit | ✅ |
| Contact page Server Action | Rate Limit + validation + idempotency on the canonical lead path | ✅ |
| `/api/inquiry` | Turnstile + Rate Limit + Idempotency + JSON body size gate | ✅ |
| `/api/subscribe` | Rate Limit + Idempotency + JSON body size gate | ✅ |
| `/api/cache/invalidate` | Secret Auth + Pre/Post Rate Limit | ✅ |
| `/api/csp-report` | Rate Limit + Body size gate | ✅ |
| `/api/verify-turnstile` | JSON body size gate | ✅ |
| `/api/health` | (Public healthcheck) | - |

New write endpoints (POST/PUT/PATCH/DELETE) must define an explicit anti-abuse strategy before merge: auth, OR Turnstile + rate-limit + input validation (the latter applies to public submission flows such as contact/subscribe).

### Public Write Endpoint Rule

For public write endpoints, verify all applicable controls:
- rate limit
- body size gate
- input validation
- Turnstile or equivalent anti-abuse check when exposed to browsers
- idempotency when duplicate submissions would create duplicate side effects

### Security Headers
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Content Security Policy

- Config: `src/config/security.ts`
- Report endpoint: `/api/csp-report`
- Core: `default-src 'self'`, `frame-ancestors 'none'`, nonce over `unsafe-inline`

## Environment Variables

### Client Exposure
- `NEXT_PUBLIC_` vars exposed to client bundle — use sparingly

### Sensitive Keys (Never Commit)
- `AIRTABLE_API_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`

### Cookie Config
- `httpOnly: true`, `secure: true`, `sameSite: 'strict'`

---
paths:
  - "src/app/api/**/*"
  - "src/lib/security/**/*"
  - "src/lib/validations.ts"
---

# Security Implementation

> This file mixes framework-backed security behavior with repo security policy. Repo-specific rules are labeled where the framework does not prescribe one exact approach.

## Server Code Protection

- Add `import "server-only"` at top of sensitive server files
- Server Actions / Route Handlers must perform authn/authz internally (DAL-style); proxy/middleware may act as optional front-line filtering only and must not be the sole auth layer

## New API Route Steps

When creating a public write endpoint (POST/PUT/PATCH/DELETE):

1. Define Zod schema in `src/lib/validations.ts`
2. Add rate limit preset in `src/lib/security/distributed-rate-limit.ts`
3. Write the route handler with this skeleton:

```typescript
import 'server-only';
import { NextRequest } from 'next/server';
import { API_ERROR_CODES } from '@/constants/api-error-codes';
import { HTTP_TOO_MANY_REQUESTS } from '@/constants';
import { checkDistributedRateLimit } from '@/lib/security/distributed-rate-limit';
import { getClientIP } from '@/lib/security/client-ip';
import { safeParseJson } from '@/lib/api/safe-parse-json';
import {
  createApiErrorResponse,
  createApiSuccessResponse,
} from '@/lib/api/api-response';
import { mySchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateResult = await checkDistributedRateLimit(clientIP, 'my-endpoint');
  if (!rateResult.allowed) {
    return createApiErrorResponse(
      API_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      HTTP_TOO_MANY_REQUESTS,
    );
  }

  const body = await safeParseJson(request);
  if (!body.ok) {
    return createApiErrorResponse(body.errorCode, body.statusCode);
  }

  const parsed = mySchema.safeParse(body.data);
  if (!parsed.success) {
    return createApiErrorResponse(API_ERROR_CODES.INVALID_REQUEST, 400);
  }

  // Business logic here
  return createApiSuccessResponse({ /* result */ });
}
```

4. Add endpoint to the "Known API Endpoints" table below
5. Add tests covering rate limit, validation rejection, and happy path

## XSS Prevention

- **Never** use unfiltered `dangerouslySetInnerHTML` → use `DOMPurify.sanitize()` instead
- URLs must validate protocol (only `https://`, `http://`, `/`)

## Input Validation

- **Repo policy**: all user input uses Zod schema validation
- API routes must validate request data with `schema.parse(...)` or `schema.safeParse(...)` before processing. Use `safeParse` when the route needs to return a structured validation response instead of throwing.
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
| Rate Limiting | Default 10/min/IP, canonical contact lead path 5/min/IP |
| Anti-abuse / Bot filtering | Cloudflare Turnstile (human verification, not a CSRF token) |
| Idempotency | Required for side-effectful public write paths where duplicate submission matters |
| CSRF | Not required in the current architecture (no cookie-based session auth); if that changes, add Origin validation + SameSite + CSRF token |

Rate limit utility: `src/lib/security/distributed-rate-limit.ts`

### Known API Endpoints & Protection Status

| Endpoint | Required Protection | Status |
|----------|---------------------|--------|
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
- Locale cookie (`NEXT_LOCALE`) uses `sameSite: 'lax'` so cross-origin navigations preserve the chosen language (set in `src/middleware.ts`).
- For any future authentication or session cookie, default to `httpOnly: true`, `secure: true`, `sameSite: 'strict'` unless a specific flow requires otherwise.

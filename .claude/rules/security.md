---
paths:
  - "src/app/api/**/*"
  - "src/lib/security/**/*"
  - "src/lib/validations/**/*"
---

# Security Implementation

## Threat Modeling

See `/.claude/rules/threat-modeling.md` for STRIDE analysis on new/changed API routes.

## Server Code Protection

- Add `import "server-only"` at top of sensitive server files
- Server Actions must verify authentication in middleware

## XSS Prevention

- **Never** use unfiltered `dangerouslySetInnerHTML`
- Must use `DOMPurify.sanitize()` to filter user HTML
- URLs must validate protocol (only `https://`, `http://`, `/`)

## Input Validation

- **All user input** must use Zod schema validation
- API routes must call `schema.parse(body)` before processing
- Query params: explicitly validate type (may be string/array/object)
- File paths: use allowlist or `path.resolve()` + prefix check (symlinks may escape)

## Static Analysis (Semgrep)

- 代码级安全扫描以 Semgrep 为准（`semgrep.yml`），CI 会在 `.github/workflows/ci.yml` 的 `security` job 执行 baseline 扫描。
- `eslint-plugin-security` 的 `security/detect-object-injection` 在本项目中默认关闭：该规则无法理解 TypeScript 的类型约束，误报会迫使代码为工具服务；对象注入相关检查由 Semgrep 的 object-injection 规则承担。

## API Security

| Measure | Config |
|---------|--------|
| Rate Limiting | Default 10/min/IP, Contact API 5/min/IP |
| CSRF | Cloudflare Turnstile |

Rate limit utility: `src/lib/security/security-rate-limit.ts`

### Known API Endpoints & Protection Status

| Endpoint | Required Protection | Status |
|----------|---------------------|--------|
| `/api/whatsapp/send` | API Key Auth + Rate Limit | ✅ |
| `/api/whatsapp/webhook` | Signature Verify + Rate Limit | ✅ |
| `/api/contact` | Rate Limit | ✅ |
| `/api/inquiry` | Turnstile + Rate Limit | ✅ |
| `/api/subscribe` | Rate Limit | ✅ |
| `/api/cache/invalidate` | Secret Auth + Pre/Post Rate Limit | ✅ |
| `/api/csp-report` | Rate Limit | ✅ |
| `/api/verify-turnstile` | (Verification endpoint) | - |
| `/api/health` | (Public healthcheck) | - |

New write endpoints (POST/PUT/PATCH/DELETE) must have auth + rate limiting before merge.

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

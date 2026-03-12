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
- Server Actions / Route Handlers 内部必须自行做 authn/authz（DAL 模式）；proxy/middleware 仅可选做前置拦截，不能作为唯一 auth 层

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

- 代码级安全扫描以 Semgrep 为准（`semgrep.yml`），CI 会在 `.github/workflows/ci.yml` 的 `security` job 执行 baseline 扫描。
- `eslint-plugin-security` 的 `security/detect-object-injection` 在本项目中默认关闭：该规则无法理解 TypeScript 的类型约束，误报会迫使代码为工具服务；对象注入相关检查由 Semgrep 的 object-injection 规则承担。

## API Security

| Measure | Config |
|---------|--------|
| Rate Limiting | Default 10/min/IP, Contact API 5/min/IP |
| Anti-abuse / Bot 过滤 | Cloudflare Turnstile（human 校验，非 CSRF token） |
| Idempotency | Required for side-effectful public write paths where duplicate submission matters |
| CSRF | 当前架构无需（无 cookie-based session auth）；若引入后必须加 Origin 校验 + SameSite + CSRF token |

Rate limit utility: `src/lib/security/distributed-rate-limit.ts`

### Known API Endpoints & Protection Status

| Endpoint | Required Protection | Status |
|----------|---------------------|--------|
| `/api/whatsapp/send` | API Key Auth + Rate Limit | ✅ |
| `/api/whatsapp/webhook` | Signature Verify + Rate Limit | ✅ |
| `/api/contact` | Rate Limit + JSON body size gate | ✅ |
| `/api/inquiry` | Turnstile + Rate Limit + Idempotency + JSON body size gate | ✅ |
| `/api/subscribe` | Rate Limit + Idempotency + JSON body size gate | ✅ |
| `/api/cache/invalidate` | Secret Auth + Pre/Post Rate Limit | ✅ |
| `/api/csp-report` | Rate Limit + Body size gate | ✅ |
| `/api/verify-turnstile` | JSON body size gate | ✅ |
| `/api/health` | (Public healthcheck) | - |

New write endpoints (POST/PUT/PATCH/DELETE) must have explicit anti-abuse strategy before merge: auth, OR Turnstile + rate-limit + input validation（公开提交类接口如 contact/subscribe 适用后者）。

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

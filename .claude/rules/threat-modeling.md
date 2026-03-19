---
paths:
  - "src/app/api/**/*"
---

# Threat Modeling

## When to Apply

Run STRIDE analysis when:
- Adding new API routes
- Handling user input (forms, file uploads)
- Integrating third-party services
- Modifying authentication/authorization

## STRIDE Checklist

| Threat | Question | Mitigation |
|--------|----------|------------|
| **S**poofing | Can attacker impersonate user/system? | Auth tokens, CSRF protection |
| **T**ampering | Can data be modified in transit/storage? | Input validation, integrity checks |
| **R**epudiation | Can actions be denied without proof? | Audit logs, timestamps |
| **I**nformation Disclosure | Can sensitive data leak? | Encryption, access controls |
| **D**enial of Service | Can service be overwhelmed? | Rate limiting, input limits |
| **E**levation of Privilege | Can attacker gain unauthorized access? | Principle of least privilege |

## API Route Template

Before implementing, answer:

```markdown
## Route: /api/[endpoint]

### Assets
- What data does this route access?
- What actions can it perform?

### Trust Boundaries
- Who can call this route? (public/authenticated/admin)
- What external services does it call?

### STRIDE Assessment
- [ ] Spoofing: Auth required? Token validation?
- [ ] Tampering: Zod schema validation?
- [ ] Repudiation: Logging implemented?
- [ ] Information Disclosure: PII handling?
- [ ] DoS: Rate limiting configured?
- [ ] Elevation: Role checks in place?
```

## Project Mitigations

| Threat | Implementation |
|--------|----------------|
| Anti-abuse / Bot filtering | Cloudflare Turnstile (human verification, not a CSRF token) |
| CSRF | Not required in the current architecture (no cookie-based session auth); if that changes, add Origin validation + SameSite + CSRF token |
| Rate Limiting | `src/lib/security/distributed-rate-limit.ts` |
| Input Validation | Zod schemas |
| XSS | CSP headers, DOMPurify |
| Injection | Parameterized queries, path validation |

## CSRF Strategy (Documented Decision)

当前应用**不使用显式 CSRF token**。理由：

1. **无 cookie-based session auth** — 所有表单提交是无状态的 POST 请求
2. **Turnstile 验证** — 公开表单端点要求 Turnstile token（人机校验）
3. **CORS 白名单** — `src/config/cors.ts` 基于白名单，非通配符
4. **SameSite cookie** — `NEXT_LOCALE` cookie 设置 `sameSite: "lax"`
5. **幂等性保护** — 仅用户发起且会产生事务性副作用的表单端点要求 `Idempotency-Key` header（如 `contact` / `inquiry` / `subscribe`）

其他写入端点的当前保护方式：
- `verify-turnstile` — 无状态 token 校验
- `csp-report` — fire-and-forget 安全日志
- `whatsapp/webhook` — 签名校验 + 重放防护
- `cache/invalidate` — Bearer token 管理接口鉴权

**触发条件**：若未来引入 cookie-based 认证或开放跨域 API，**必须**补充 CSRF token 验证。

## Rate Limiting Deployment Note

当前速率限制使用**进程内 Map 存储**（`src/lib/security/distributed-rate-limit.ts`）。

- **单实例部署**（Vercel Serverless / Cloudflare Worker 单 isolate）：✅ 有效
- **多实例部署**：⚠️ 各实例独立计数，总限制为 `preset × 实例数`
- **生产建议**：配置 Upstash Redis 作为分布式后端（环境变量 `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`）
- **运维建议**：若生产环境明确是多实例部署，应在启动期至少输出 loud warning；若后续引入强制策略，可增加 fail-fast 开关（例如 `REQUIRE_DISTRIBUTED_RATE_LIMIT=true`）

## Client IP Extraction

`DEPLOYMENT_PLATFORM` 环境变量必须在生产环境中设置（`vercel` 或 `cloudflare`）。
未设置时当前实现会回退到 `0.0.0.0`，导致所有请求共享同一速率限制桶。
这只能作为临时降级行为，不能被视为有效的生产级 per-IP 速率限制。

## File Locations

- CSP config: `src/config/security.ts`
- Rate limiter: `src/lib/security/distributed-rate-limit.ts`
- Input schemas: `src/lib/validations.ts`
- Client IP: `src/lib/security/client-ip.ts`
- CORS config: `src/config/cors.ts`
- Idempotency: `src/lib/idempotency.ts`

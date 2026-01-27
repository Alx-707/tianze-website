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
| CSRF | Cloudflare Turnstile |
| Rate Limiting | `src/lib/security/security-rate-limit.ts` |
| Input Validation | Zod schemas |
| XSS | CSP headers, DOMPurify |
| Injection | Parameterized queries, path validation |

## File Locations

- CSP config: `src/config/security.ts`
- Rate limiter: `src/lib/security/security-rate-limit.ts`
- Input schemas: `src/lib/validations/`

# Lane 02 - Security / Trust Boundary

## Verdict

No confirmed exploitable security defect was found in this run. Semgrep, dependency audit, API route tests, rate-limit/idempotency tests, and the repo security guardrails are green.

There is one medium-severity hardening gap: the repo security rule says sensitive server files should start with `import "server-only"`, but this is applied inconsistently.

## Commands and reports

| Command | Result |
| --- | --- |
| `pnpm security:semgrep` | passed; 0 error findings and 0 warning findings |
| `pnpm security:audit` | passed; no known production vulnerabilities |
| `pnpm test` | passed; includes API, CSP, Turnstile, rate limit, client IP, idempotency, and lead pipeline tests |
| `pnpm review:architecture-truth` | passed; includes boundary and env checks |

## Confirmed healthy areas

- Public write endpoints have tests around validation, rate limit, Turnstile, idempotency, or body gates depending on endpoint type.
- CSP report route has body-size and rate-limit coverage.
- Semgrep found no current error or warning findings.
- Production dependency audit found no known vulnerabilities.

## Finding owned by this lane

- `FPH-006`: Sensitive server-only files do not consistently include `import "server-only"`.

## Blocked proof

The following were not proven because credentials or external dashboards were not available:

- Real Resend delivery.
- Real Airtable delivery.
- Cloudflare deployed worker headers and runtime.
- Production CSP report delivery.

## Evidence artifacts

- `evidence/02-security-trust-boundary/semgrep-error-1777481534019.json`
- `evidence/02-security-trust-boundary/semgrep-warning-1777481534019.json`


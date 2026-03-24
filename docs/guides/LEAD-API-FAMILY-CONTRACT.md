# Lead API Family Contract

## Scope
This contract covers the write-path family:
- `POST /api/contact`
- `POST /api/inquiry`
- `POST /api/subscribe`
- `src/lib/api/lead-route-response.ts`

It does not cover:
- `GET /api/contact` admin stats
- unrelated verification or webhook routes

## Purpose
These routes are a known structural change cluster. This file makes their intended shared contract explicit so reviewers do not need to infer it from three route implementations.

## Shared Contract Rules

### Success Shape
All successful write-path family responses should use:

```json
{
  "success": true,
  "data": {
    "referenceId": "..."
  }
}
```

### Error Shape
All failed write-path family responses should communicate failure through:

```json
{
  "success": false,
  "errorCode": "..."
}
```

HTTP status communicates transport/error class.
`errorCode` communicates the machine-readable product meaning.

### Observability Headers
- Write-path family responses should expose:
  - `x-request-id`
  - `x-observability-surface: lead-family`
- If the caller provides `x-request-id`, the response should preserve it.

### Idempotency
- Public write-path family routes should require `Idempotency-Key`.
- Duplicate same-body requests should replay cached success.
- Same key reused with a different body/fingerprint should return `409`.
- This rule applies to:
  - `POST /api/contact`
  - `POST /api/inquiry`
  - `POST /api/subscribe`

### Turnstile / Abuse Protection
- Routes using Turnstile must reject:
  - missing token
  - invalid token
- These cases should use stable route-specific `errorCode`s.
- Shared mechanics may be centralized, but route-specific error semantics remain explicit.
- For the current family:
  - `inquiry` and `subscribe` expose route-specific security error codes directly
  - `contact` enforces Turnstile through its validation path before processing succeeds

### Rate Limiting
- Public write-path family routes must remain rate-limited.
- A rate-limit breach should return `429` and must prevent downstream processing.

## Intentional Differences
- `contact` has additional admin `GET` behavior; it is not part of the write-path family contract.
- Validation schemas differ by route because input domains differ.
- Logging detail may differ by route, but response contract should not drift without explicit family review.

## Review Rule
If one route in this family changes:
1. inspect the other two family members
2. confirm the family contract still holds
3. update this file if the family contract intentionally changes

## Regression Coverage
- [`lead-family-contract.test.ts`](/Users/Data/Warehouse/Pipe/tianze-website/tests/integration/api/lead-family-contract.test.ts)
- [`lead-family-protection.test.ts`](/Users/Data/Warehouse/Pipe/tianze-website/tests/integration/api/lead-family-protection.test.ts)

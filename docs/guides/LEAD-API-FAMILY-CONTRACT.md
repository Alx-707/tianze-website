# Lead API Family Contract

## Scope
This contract covers the remaining write-path API family:
- `POST /api/inquiry`
- `POST /api/subscribe`
- `src/lib/api/lead-route-response.ts`

It does not cover:
- the contact page Server Action (`src/lib/actions/contact.ts`)
- unrelated verification or webhook routes

## Purpose
These routes are a known structural change cluster. This file makes their intended shared contract explicit so reviewers do not need to infer it from multiple route implementations.

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

### Recoverable Partial Success
- If the downstream lead pipeline reaches a stable partial-success state, the route should not collapse it into a generic processing error.
- Current contract:
  - `success: false`
  - route-specific partial-success `errorCode`
  - `data.referenceId`
  - `data.partialSuccess: true`

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

### Rate Limiting
- Public write-path family routes must remain rate-limited.
- A rate-limit breach should return `429` and must prevent downstream processing.

## Intentional Differences
- `contact` now ships through a Server Action path and is intentionally outside this HTTP API contract.
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

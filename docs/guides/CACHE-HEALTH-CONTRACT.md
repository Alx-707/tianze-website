# Cache And Health Contract

## Scope
This contract covers:
- `src/app/api/cache/invalidate/route.ts`
- `src/lib/cache/invalidate.ts`
- `src/lib/cache/cache-tags.ts`
- `src/app/api/health/route.ts`
- `src/lib/api/cache-health-response.ts`
- `src/lib/cache/invalidation-policy.ts`
- `src/lib/cache/invalidation-guards.ts`
- `tests/integration/api/cache-health-contract.test.ts`

## Purpose
These files form one operational surface:
- cache invalidation policy
- cache invalidation execution
- cache tag naming
- health signal exposure

They should be reviewed as one structural unit when changed.

## Shared Contract Rules

### 1. Health Endpoint Stability
- `GET /api/health` must remain minimal and stable.
- It should return a machine-readable availability signal and avoid cacheable responses.
- It should expose:
  - `x-request-id`
  - `x-observability-surface: cache-health`

### 2. Invalidation Protection
- `POST /api/cache/invalidate` must remain protected by authorization and rate limiting.
- Invalidations should not silently bypass secret validation.
- Invalidation responses should also expose:
  - `x-request-id`
  - `x-observability-surface: cache-health`

### 3. Explicit Domain Semantics
- Cache invalidation behavior should remain explicit by domain/entity, not hidden behind broad opaque switches.
- Domain-level invalidation responses must remain machine-readable.

### 4. Cache Tag Coherence
- Tag naming must stay consistent with invalidation helpers.
- Tag generators and invalidation helpers should evolve together.

## Review Command

```bash
pnpm review:cache-health
```

## Regression Coverage
- [`src/app/api/cache/invalidate/__tests__/route.test.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/app/api/cache/invalidate/__tests__/route.test.ts)
- [`tests/integration/api/health.test.ts`](/Users/Data/Warehouse/Pipe/tianze-website/tests/integration/api/health.test.ts)
- [`tests/integration/api/cache-health-contract.test.ts`](/Users/Data/Warehouse/Pipe/tianze-website/tests/integration/api/cache-health-contract.test.ts)

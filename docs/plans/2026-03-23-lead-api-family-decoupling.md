# Lead API Family Decoupling

## Objective
Reduce structural coupling in the `contact` / `inquiry` / `subscribe` API family with the smallest high-leverage change.

## Changes
- Added shared lead-route response helper:
  - [lead-route-response.ts](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/api/lead-route-response.ts)
- Added shared family contract doc:
  - [LEAD-API-FAMILY-CONTRACT.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/LEAD-API-FAMILY-CONTRACT.md)
- Updated:
  - [contact route](/Users/Data/Warehouse/Pipe/tianze-website/src/app/api/contact/route.ts)
  - [inquiry route](/Users/Data/Warehouse/Pipe/tianze-website/src/app/api/inquiry/route.ts)
  - [subscribe route](/Users/Data/Warehouse/Pipe/tianze-website/src/app/api/subscribe/route.ts)

## Structural Effect
- `subscribe` no longer maintains a divergent success contract.
- `inquiry` and `subscribe` now share a family-level response packaging path.
- `inquiry` and `subscribe` now also share a family-level Turnstile validation path.
- This lowers API family drift without introducing a large abstraction layer.

## Validation
Executed:

```bash
pnpm exec vitest run \
  tests/integration/api/contact.test.ts \
  tests/integration/api/subscribe.test.ts \
  src/app/api/inquiry/__tests__/route.test.ts
```

Result:
- 3 test files passed
- 32 tests passed

Also executed:

```bash
pnpm exec vitest run \
  tests/integration/api/contact.test.ts \
  src/app/api/contact/__tests__/route-post.test.ts
```

Result:
- 2 test files passed
- 16 tests passed

Also executed:

```bash
pnpm exec vitest run tests/integration/api/lead-family-contract.test.ts
```

Result:
- 1 test file passed
- 6 tests passed

Also executed:

```bash
pnpm review:lead-family
```

Result:
- 2 test files passed
- 10 tests passed

## Lock-In
- Added family contract regression test:
  - [lead-family-contract.test.ts](/Users/Data/Warehouse/Pipe/tianze-website/tests/integration/api/lead-family-contract.test.ts)
- Added family protection regression test:
  - [lead-family-protection.test.ts](/Users/Data/Warehouse/Pipe/tianze-website/tests/integration/api/lead-family-protection.test.ts)
- Added review/CI-friendly entrypoint:
  - `pnpm review:lead-family`

## Follow-up Candidates
- Unify family-level Turnstile error handling helpers if this family continues to co-change heavily.
- Consider a family-level contract doc if downstream consumers grow.

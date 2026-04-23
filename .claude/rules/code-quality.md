# Code Quality Constraints

## Complexity Limits

All limits are **function-level** (cyclomatic complexity measured per function).

| File Type | max-lines | max-lines-per-function | complexity | max-depth | max-params |
|-----------|-----------|------------------------|------------|-----------|------------|
| **Production** | 500 | 120 | 15 | 3 | 3 |
| **Config** | 800 | 250 | 18 | - | - |
| **Test** | 800 | 700 | 20 | - | 8 |

### Additional Limits

| Rule | Production | Test |
|------|------------|------|
| `max-nested-callbacks` | 2 | 6 |
| `max-statements` | 20 | 50 |

### Exemptions
- Config files: `*.config.{js,ts,mjs}`
- Dev tools: `src/components/dev-tools/**`, `src/app/**/dev-tools/**`

## Magic Numbers

```typescript
// ❌ Bare number
if (response.status === 429) { ... }
setTimeout(retry, 5000);

// ✅ Named constant
import { HTTP_STATUS } from '@/constants/http';
import { RETRY_DELAY_MS } from '@/constants/time';
if (response.status === HTTP_STATUS.TOO_MANY_REQUESTS) { ... }
setTimeout(retry, RETRY_DELAY_MS);
```

**ESLint allowlist**: `no-magic-numbers.ignore` in `eslint.config.mjs` (source of truth)

Constants by domain:
- `src/constants/performance-constants.ts` — Performance thresholds
- `src/constants/time.ts` — Time values

## Zero Tolerance

- TypeScript: Zero errors
- ESLint: Zero warnings
- Build: No errors

## ESLint Disable Usage

```typescript
// ❌ Broad suppress without reason
// eslint-disable-next-line
const result = riskyCall();

// ✅ Specific rule + justification
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- validated by Zod above
const email = parsed.data.email!;
```

Prefer line-level over block-level disables.

## Production Import Boundaries

- Production code must not import `src/test/**`, `src/testing/**`, or `src/constants/test-*`
  - Enforced by `dependency-cruiser`

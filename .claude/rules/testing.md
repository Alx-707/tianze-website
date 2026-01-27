---
paths:
  - "**/*.{test,spec}.{ts,tsx}"
  - "tests/**/*"
---

# Testing Standards

## Framework

- **Unit/Integration**: Vitest + React Testing Library
- **E2E**: Playwright
- **Config**: `vitest.config.mts`

## Commands

```bash
pnpm test              # Run all unit tests
pnpm test:coverage     # With coverage report
pnpm test:e2e          # Playwright E2E tests
```

## Test File Organization

- Unit tests: `src/[module]/__tests__/[file].test.tsx`
- E2E tests: `tests/e2e/`
- Integration: `tests/integration/`

## Playwright E2E Selectors

**IMPORTANT**: Selector priority (highest to lowest):

| Priority | Method | Use Case |
|----------|--------|----------|
| 1️⃣ | `getByRole()` | Semantic roles (button, link, heading) |
| 2️⃣ | `getByLabel()` | Form labels |
| 3️⃣ | `getByPlaceholder()` | Input placeholders |
| 4️⃣ | `getByText()` | Text content |
| 5️⃣ | `getByTestId()` | When above not applicable |

```typescript
// ✅ Recommended: semantic selectors
page.getByRole('button', { name: 'Submit' });
page.getByLabel('Email address');

// ✅ Acceptable: when role/text not applicable
page.getByTestId('login-form');

// ❌ Forbidden: CSS class selectors (fragile)
page.locator('button.btn-primary.submit-form');
```

## vi.hoisted Usage

**IMPORTANT**: `vi.hoisted` callback **cannot reference external imports**, only inline literals.

```typescript
// ❌ Error: referencing external import
import { someHelper } from './helpers';
const mockFn = vi.hoisted(() => {
  return someHelper(); // ESM initialization order error!
});

// ✅ Correct: use inline literals
const mockFn = vi.hoisted(() => vi.fn());
const mockData = vi.hoisted(() => ({
  id: 'test-id',
  name: 'Test Name'
}));

vi.mock('@/lib/api', () => ({
  fetchData: mockFn
}));
```

## Centralized Mock System

**Must use centralized mocks**, no duplicate creation:

| Resource | Path |
|----------|------|
| i18n mock messages | `src/test/constants/mock-messages.ts` |
| Test utilities | `@/test/utils` |
| Mock utilities | `src/test/mock-utils.ts` |

```typescript
// ✅ Correct
import { renderWithIntl } from '@/test/utils';
import { mockMessages } from '@/test/constants/mock-messages';

// ❌ Forbidden: duplicate creation
const mockMessages = { ... };
```

## Testing Async Server Components

Server Components cannot be rendered directly. Test their logic separately:

```typescript
import { getAllProductsCached } from '@/lib/content/products';

describe('getAllProductsCached', () => {
  it('should return product list', async () => {
    const products = await getAllProductsCached('en');
    expect(products).toBeDefined();
  });
});
```

## Component-Test Sync (Twin File Principle)

When modifying source files:

1. **Check**: Does `__tests__/` contain corresponding test file?
2. **Read**: Understand current assertions
3. **Sync**: Update for DOM/API/prop changes
4. **Verify**: Run related tests before committing

| Source Change | Test Update Required |
|---------------|---------------------|
| Element type (`<a>` → `<button>`) | Update `getByRole()` queries |
| New required props | Update mock data |
| Function signature | Update assertions |

## Type-Safe Mocking

```typescript
// ❌ Bad: Bypasses type checking
const mockConfig = { enabled: true } as any;

// ✅ Good: satisfies ensures completeness
const mockConfig = {
  enabled: true,
  requiredField: 'value',
} satisfies Config;

// ✅ Good: Factory function
const mockConfig = createMockConfig({ enabled: true });
```

Factory functions in `src/test/factories/` — when interface changes, factory fails first.

## Skipped Tests Policy

**Target: 0 permanently skipped tests**

Every skip must have:
1. Clear technical reason
2. Issue tracking link
3. Owner + TTL
4. Alternative coverage

```typescript
// ✅ Acceptable (temporary)
// SKIP REASON: React 19 SSR limitation
// ISSUE: https://github.com/org/repo/issues/456
// OWNER: @username | TTL: 2025-Q2
test.skip('requires server environment');

// ✅ Better: Use test.todo
test.todo('should support advanced caching');

// ❌ Forbidden: No documentation
it.skip('some test', () => { ... });
```

## Testing SSR-Safe Hooks

For `'use client'` hooks with SSR safety:

```typescript
// ❌ Wrong: Delete window
delete global.window;  // Triggers React errors

// ✅ Correct: Mock unavailable API
const originalIO = global.IntersectionObserver;
(global as any).IntersectionObserver = undefined;

const { result } = renderHook(() => useIntersectionObserver());
expect(result.current.isVisible).toBe(true); // Fallback mode

global.IntersectionObserver = originalIO;
```

## Pre-commit Verification

```bash
pnpm vitest related src/path/to/file.tsx --run
```

CI enforcement: See `scripts/quality-gate.js`

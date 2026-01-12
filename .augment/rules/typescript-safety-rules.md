---
type: "auto"
description: "TypeScript safety: strict mode, avoid any, exactOptionalPropertyTypes patterns, satisfies, interface-first, cast completeness, browser API extensions"
---

# TypeScript Safety Rules

- Strict mode: enable full strictness; avoid `any` and unsafe type assertions.
- Interfaces first: prefer `interface` over `type` for object shapes; avoid `enum` (use const-asserted objects + unions).
- satisfies: validate object shapes against types with `satisfies`.
- exactOptionalPropertyTypes: do not pass `undefined` to optional props; use conditional object spreading.
- Cast completeness: when casting to interfaces, provide all required properties; avoid partial casts.
- Browser API typing: extend Navigator or other Web APIs via intersection types instead of `any`.

## Generic Components and Functions

### Type-Safe Generic Components

```typescript
// src/components/DataTable.tsx
import React from 'react';

// Generic component for type-safe props
interface DataTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    render?: (value: T[keyof T]) => React.ReactNode;
  }>;
  onRowClick?: (item: T) => void;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick
}: DataTableProps<T>) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={String(column.key)} className="px-6 py-3 text-left">
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr
            key={index}
            onClick={() => onRowClick?.(item)}
            className="hover:bg-gray-50 cursor-pointer"
          >
            {columns.map((column) => (
              <td key={String(column.key)} className="px-6 py-4">
                {column.render
                  ? column.render(item[column.key])
                  : String(item[column.key])
                }
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage example - User interface for table
interface TableUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

function UserTable({ users }: { users: TableUser[] }) {
  return (
    <DataTable
      data={users}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        {
          key: 'role',
          label: 'Role',
          render: (role) => (
            <span className={`px-2 py-1 rounded ${
              role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {role}
            </span>
          )
        },
      ]}
      onRowClick={(user) => console.log('Selected user:', user)}
    />
  );
}
```

### Generic API Functions

```typescript
// src/lib/api-client.ts

// Generic API response type
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Generic fetch function with proper error handling
async function fetchData<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

// Usage examples
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface User {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

// Type-safe API calls
const products = await fetchData<Product[]>('/api/products');
const user = await fetchData<User>('/api/user/123');
const searchResults = await fetchData<Product[]>('/api/search?q=laptop');
```

## Test Environment Type Safety

### When to Use `any` in Tests

**Allowed scenarios**:
```typescript
// ✅ Third-party library mocks - complex types hard to fully define
const mockComplexLibrary = {
  complexMethod: vi.fn() as any,
  nestedConfig: {} as any,
};

// ✅ Test data construction - complex test scenarios
const testScenario: any = {
  // Simulate complex API responses or error scenarios
  error: { code: 500, details: { nested: { data: 'test' } } },
};

// ✅ DOM event mocking - complex event object types
const mockEvent = {
  target: { value: 'test' },
  preventDefault: vi.fn(),
} as any;
```

**Recommended type-safe alternatives**:
```typescript
// ✅ Recommended: Define specific Mock interfaces
interface MockApiClient {
  get: ReturnType<typeof vi.fn<(url: string) => Promise<ApiResponse>>>;
  post: ReturnType<typeof vi.fn<(url: string, data: unknown) => Promise<ApiResponse>>>;
}

const mockApiClient: MockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
};

// ✅ Recommended: Type-safe test data factories
interface TestUser {
  id: string;
  email: string;
  name: string;
}

function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    ...overrides,
  };
}

// ✅ Recommended: Type-safe event mocks
interface MockFormEvent {
  target: { value: string };
  preventDefault: ReturnType<typeof vi.fn>;
}

const createMockFormEvent = (value: string): MockFormEvent => ({
  target: { value },
  preventDefault: vi.fn(),
});
```

### Browser API Type Extensions

**Window object extension**:
```typescript
// src/types/global.d.ts
declare global {
  interface Window {
    webVitalsMonitor?: WebVitalsMonitor;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }

  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}
```

**Navigator object extension**:
```typescript
// Extend Navigator interface
declare global {
  interface Navigator {
    connection?: {
      effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
      downlink: number;
      rtt: number;
    };
  }
}
```

### Test Environment Best Practices

1. **Prefer specific types**: Avoid `any` even in tests
2. **Create test-specific types**: Define dedicated interfaces for test scenarios
3. **Use type factories**: Create reusable test data generation functions
4. **Mock type safety**: Ensure Mock objects conform to original interfaces
5. **Progressive typing**: Start with `any`, gradually refine to specific types

### ESLint Test File Configuration

```javascript
// eslint.config.mjs - Test file special configuration
{
  name: 'test-files-typescript',
  files: [
    '**/*.test.{js,jsx,ts,tsx}',
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    'tests/**/*.{js,jsx,ts,tsx}',
    'src/test/**/*.{js,jsx,ts,tsx}',
    'src/testing/**/*.{js,jsx,ts,tsx}'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off', // Allow any in test files
    '@typescript-eslint/no-unsafe-assignment': 'off', // Allow unsafe assignment
    '@typescript-eslint/no-unsafe-member-access': 'off', // Allow unsafe member access
    '@typescript-eslint/no-unsafe-call': 'off', // Allow unsafe calls
  },
}
```

## Advanced Type Safety Patterns

### Unknown vs Any - Safer Type Handling

```typescript
// src/lib/data-processor.ts

// Define processed data type
interface ProcessedData {
  id: string;
  processedAt: Date;
  result: any;
}

// ✅ Use unknown for safer type handling
function processApiResponse(data: unknown): ProcessedData {
  if (isValidApiResponse(data)) {
    return {
      id: crypto.randomUUID(),
      processedAt: new Date(),
      result: data.data,
    };
  }
  throw new Error('Invalid API response format');
}

// ❌ Avoid any - unsafe and bypasses type checking
function processApiResponseUnsafe(data: any): ProcessedData {
  return {
    id: crypto.randomUUID(),
    processedAt: new Date(),
    result: data, // No type safety
  };
}

// Type guard implementation - avoiding any
function isValidApiResponse(data: unknown): data is ApiResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    'data' in data &&
    typeof (data as Record<string, unknown>).status === 'string' &&
    ['success', 'error'].includes((data as Record<string, unknown>).status as string)
  );
}

// Advanced type guards for complex objects
function isApiUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data &&
    'profile' in data &&
    typeof (data as Record<string, unknown>).id === 'string' &&
    typeof (data as Record<string, unknown>).email === 'string' &&
    isUserProfile((data as Record<string, unknown>).profile)
  );
}

function isUserProfile(data: unknown): data is User['profile'] {
  return (
    typeof data === 'object' &&
    data !== null &&
    'firstName' in data &&
    'lastName' in data &&
    typeof (data as Record<string, unknown>).firstName === 'string' &&
    typeof (data as Record<string, unknown>).lastName === 'string'
  );
}
```

### Utility Types for Enhanced Safety

```typescript
// Create strict partial types
type StrictPartial<T> = {
  [P in keyof T]?: T[P] | undefined;
};

// Create required subset types
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Example usage
interface UserForm {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user';
}

// Require specific fields for form submission
type UserSubmission = RequiredFields<UserForm, 'email' | 'firstName' | 'lastName'>;

function submitUser(user: UserSubmission) {
  // TypeScript ensures email, firstName, lastName are provided
  console.log(`Submitting user: ${user.firstName} ${user.lastName} (${user.email})`);
}

// Conditional types for API responses
type ApiResult<T> = T extends string
  ? { message: T }
  : T extends object
    ? { data: T }
    : { value: T };

// Usage
type StringResult = ApiResult<string>;     // { message: string }
type ObjectResult = ApiResult<User>;       // { data: User }
type NumberResult = ApiResult<number>;     // { value: number }
```


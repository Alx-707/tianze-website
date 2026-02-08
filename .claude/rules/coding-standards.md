# Coding Standards

## TypeScript

### Strict Mode
- `strict: true`, `noImplicitAny: true`
- **No `any`** (tests have limited exceptions)
- Prefer `interface` over `type`
- Use `satisfies` for type-safe object literals
- Avoid `enum`, use `const` objects

### exactOptionalPropertyTypes

Cannot pass explicit `undefined` to optional properties:

```typescript
// ❌ Error
const config: Config = { name: 'test', description: undefined };

// ✅ Correct: conditional spread
const config: Config = { name: 'test', ...(desc ? { description: desc } : {}) };
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | `use` prefix | `useBreakpoint.ts` |
| Utilities | camelCase | `formatPrice.ts` |
| Constants | SCREAMING_SNAKE | `MAX_ITEMS` |
| Directories | kebab-case | `user-profile/` |
| Booleans | `is/has/can/should` | `isLoading` |
| Event handlers | `handle` prefix | `handleSubmit` |

## Imports

### Path Aliases
Always use `@/` alias. No deep relative imports.

### Import Order (Prettier enforced)

Configured in `.prettierrc.json` via `@ianvs/prettier-plugin-sort-imports`:

1. `react`, `react/*`
2. `next`, `next/*`
3. Third-party modules
4. `@/types/*`
5. `@/lib/*`
6. `@/components/*`
7. `@/app/*`
8. Other `@/*` aliases
9. Relative imports (`./`, `../`)

## Constants

- No magic numbers
- Organize by domain in `src/constants/`
- Use `as const`
- User-facing text must use i18n keys

## Logging

- **No `console.log` in production**
- Only `console.error`, `console.warn` allowed
- Use `src/lib/logger.ts` for structured logging

## Testing

### Behavior-Driven Descriptions

Write tests from the user's perspective, not the implementation's perspective. Describe **what the user does and sees**, not what the component renders internally.

```typescript
// ❌ Implementation-focused: verifies existence
it("renders primary and secondary CTA buttons", () => {
  expect(screen.getByText("Get Quote")).toBeInTheDocument();
});

// ✅ Behavior-focused: verifies what the user can do
it("navigates to contact page when user clicks primary CTA", () => {
  const link = screen.getByText("Get Quote").closest("a");
  expect(link).toHaveAttribute("href", "/contact");
});
```

Rules:
- Interactive elements (Button, Link, Form) must verify **behavior** (navigation target, submission), not just presence
- Link tests must verify `href` resolves to a known route
- Test descriptions use "user does X → Y happens" language

### [2026-02-08] Origin — Codex review found 4 functional bugs (dead CTA buttons, broken links) that existing presence-only tests failed to catch.

## Git Commits

Conventional Commits: `type(scope): description`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`

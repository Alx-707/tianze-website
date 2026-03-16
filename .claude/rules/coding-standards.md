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

### Import Order (Convention — not yet enforced)

`@ianvs/prettier-plugin-sort-imports` is installed, but the project does not currently ship a `.prettierrc`, so the ordering rules are not enforced yet. Maintain the following order manually:

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

## Testing (BDD)

### Behavior-Driven Development

The project uses full BDD workflow: Discovery → Formulation → Automation.

- **Discovery**: clarify requirements through `brainstorming`
- **Formulation**: write `bdd-specs.md` with Given/When/Then scenarios
- **Automation**: Red-Green-Refactor (TDD loop)

### Test Writing Principles

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
- **No production code without a failing test first** (Iron Law)
- Interactive elements (Button, Link, Form) must verify **behavior** (navigation target, submission), not just presence
- Link tests must verify `href` resolves to a known route
- Test descriptions use "user does X → Y happens" language
- Each BDD scenario maps to 2 tasks: Red (write the failing test) + Green (implement the minimal fix)

### [2026-02-08] Origin — Codex review found 4 functional bugs (dead CTA buttons, broken links) that existing presence-only tests failed to catch.

## Git Commits

Conventional Commits format:

```
<type>[optional scope]: <description>    (≤50 chars, lowercase, imperative)

- Bullet point 1                         (body required, ≤72 chars/line)
- Bullet point 2
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `build`, `ci`, `style`

Breaking changes: add `!` before `:` (e.g., `feat(api)!: migrate to oauth`)

## Git Branching (GitHub Flow)

- **`main`**: the only long-lived branch, always deployable
- **`feature/*`**: feature branches merged into `main` via PR
- **`hotfix/*`**: emergency fix branches merged into `main` via PR

Flow: `main` → create feature branch → develop → open PR → pass CI → merge → delete branch.

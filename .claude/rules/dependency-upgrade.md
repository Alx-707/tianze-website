# Dependency Upgrade Protocol

## Core Dependencies

These require full validation:
- `next` — Framework
- `react` / `react-dom` — Runtime
- `typescript` — Type system
- `next-intl` — i18n
- `tailwindcss` — Styling

## Upgrade Checklist

### Pre-Upgrade
```bash
git checkout -b chore/upgrade-[package]-[version]
git stash  # Save uncommitted work
```

### Validation Steps

| Step | Command | Must Pass |
|------|---------|-----------|
| 1. Install | `pnpm install` | ✓ |
| 2. Types | `pnpm type-check` | ✓ |
| 3. Lint | `pnpm lint:check` | ✓ |
| 4. Tests | `pnpm test` | ✓ |
| 5. Build | `pnpm build` | ✓ |
| 6. E2E | `pnpm test:e2e` | Recommended |
| 7. Lighthouse | `pnpm perf:lighthouse` | Recommended |

### Quick Validation (Minor/Patch)
```bash
pnpm ci:local:quick && pnpm build
```

### Full Validation (Major)
```bash
pnpm ci:local
```

## Security Patches

For vulnerabilities (`pnpm audit`):

1. Check if patch exists: `pnpm audit --fix`
2. If no patch, add override in `package.json`:
   ```json
   "pnpm": {
     "overrides": {
       "vulnerable-package": ">=safe-version"
     }
   }
   ```
3. Document in commit message

## Breaking Changes

### Next.js Major Upgrades
1. Read migration guide: `https://nextjs.org/docs/app/guides/upgrading`
2. Run codemods: `npx @next/codemod@latest [codemod-name] .`
3. Check `docs/known-issue/` for project-specific issues

### React Major Upgrades
1. Check compatibility with UI libraries (Radix, shadcn)
2. Verify server component boundaries
3. Test hydration behavior

## Rollback

If validation fails:
```bash
git checkout package.json pnpm-lock.yaml
pnpm install
```

## Commit Convention

```
chore(deps): upgrade [package] to [version]

- [Breaking change handled]
- [Migration step applied]
- Closes #[issue] (if applicable)
```

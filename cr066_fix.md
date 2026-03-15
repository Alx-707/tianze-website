# CR-066 Fix Summary

## Problem
`ResponsiveLayout` still carried a set of deprecated legacy props that had no real production consumers and were mainly being kept alive by tests:
- `mobileLayout`
- `tabletLayout`
- `desktopLayout`
- `mobileNavigation`
- `tabletSidebar`
- `desktopSidebar`
- `onLayoutChange`

## Fix
- Removed the deprecated props from `ResponsiveLayout`
- Simplified the implementation to use only the current `mobileContent` / `tabletContent` / `desktopContent` API
- Updated the test suite to stop preserving the legacy prop contract

## Verification
- `pnpm exec vitest run src/components/__tests__/responsive-layout.test.tsx`

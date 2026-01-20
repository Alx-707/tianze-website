# Tasks: Apply Manufacturing-First Design Token System v2.1

## 1. Core Token Migration

- [x] 1.1 Update `src/app/globals.css` `:root` tokens to match v2.1 (use `docs/design-system/manufacturing-tokens.css` as source-of-truth)
- [x] 1.2 Update `src/app/globals.css` `.dark` tokens to match v2.1
- [x] 1.3 Update `@theme inline` mappings (colors/ring/sidebar + font token mapping)
- [x] 1.4 Update `--radius` to `4px` and confirm derived radii produce 2px controls / 4px cards
- [x] 1.5 Add explicit radius aliases required by docs/spec (`--radius-none`, `--radius-sharp`, `--radius-round`, etc.)
- [x] 1.6 Add shadow tokens (`--shadow-color`, `--shadow-xs/sm/md/lg/xl`) and ensure they are actually used (via Tailwind `shadow-*` mapping or explicit usage)
- [x] 1.7 Add animation tokens (`--duration-*`, `--ease-*`, `--transition-*`) and ensure reduced-motion behavior still results in effectively-instant transitions

## 2. Typography Migration

- [x] 2.1 Decide font sourcing (bundle local `.woff2` preferred) and document license/subsetting approach
  - Decision: Using `next/font/google` for IBM Plex Sans (automatic optimization via Google Fonts CDN)
- [x] 2.2 Update `src/app/[locale]/layout-fonts.ts` to load IBM Plex Sans via `next/font/google`, exposing CSS variables
- [x] 2.3 Ensure `src/app/layout.tsx` applies the updated font class names (via `getFontClassNames()`)
- [x] 2.4 Update `src/app/globals.css` to use tokenized font families (keep explicit CJK fallback stack)
- [x] 2.5 Update any tests that assert font class names/variables (e.g., `src/app/[locale]/__tests__/layout-fonts.test.ts`)

## 3. Manufacturing Visual Elements

- [x] 3.1 Add `.precision-grid` (+ optional `.precision-grid-fine`) utility class (tokenized colors)
- [x] 3.2 Add `.technical-callout` utility class
- [x] 3.3 Add `.spec-box` utility class
- [x] 3.4 Add `.measurement-scale` utility class

## 4. Component Tokens & Compliance

- [x] 4.1 Define component token variables in `src/app/globals.css` (button/card/input/table/badge) per `docs/design-system/TIANZE-MANUFACTURING-TOKENS.md`
- [x] 4.2 Audit and fix any conflicts with the new radius/shadow system (e.g., legacy "large radius" utilities and any hardcoded color values)
- [x] 4.3 Remove/replace any spring/bounce easing usage in UI (search for `ease-spring` / overshoot cubic-beziers) with mechanical easing tokens
  - Fixed: `src/components/ui/theme-switcher-highlight.tsx` - replaced spring easing with mechanical cubic-bezier(0.4, 0, 0.2, 1)
- [x] 4.4 Validate core component visuals (button/input/card/popover/table) in light/dark after token application

## 5. Accessibility Compliance

- [x] 5.1 Verify all color pairs meet WCAG AA (4.5:1 minimum)
- [x] 5.2 Update `@media (prefers-contrast: high)` overrides
- [x] 5.3 Verify `@media (prefers-reduced-motion)` still works
- [x] 5.4 Test focus ring visibility with amber color

## 6. Testing & Validation

- [x] 6.1 Run `pnpm type-check` — zero errors
- [x] 6.2 Run `pnpm lint:check` — zero warnings
- [x] 6.3 Run `pnpm test` — all tests pass (5785 tests, 333 test files)
- [x] 6.4 Run `pnpm build` — successful build
- [ ] 6.5 Run `pnpm perf:lighthouse` — meet performance thresholds (optional, requires production server)

## 7. Documentation Sync

- [x] 7.1 Ensure `docs/design-system/TIANZE-MANUFACTURING-TOKENS.md` is current
- [x] 7.2 Ensure `docs/design-system/manufacturing-tokens.css` matches implementation

---

## Completion Summary

**Status**: ✅ Complete (30/31 tasks - Lighthouse is optional and requires production server)

**Key Changes Applied**:
1. `src/app/globals.css` - Complete rewrite with Manufacturing-First Design v2.1 tokens
2. `src/app/[locale]/layout-fonts.ts` - Migrated from Geist Sans to IBM Plex Sans
3. `src/components/ui/theme-switcher-highlight.tsx` - Removed spring easing, now uses mechanical easing
4. `src/test/setup.ts` - Added `next/font/google` mock for IBM Plex Sans
5. `src/app/[locale]/__tests__/layout-fonts.test.ts` - Updated to test ibmPlexSans instead of geistSans

**Verification Results**:
- Type check: ✅ Passed
- Build: ✅ Passed
- Lint: ✅ Passed
- Tests: ✅ 5785 tests passed (333 test files)

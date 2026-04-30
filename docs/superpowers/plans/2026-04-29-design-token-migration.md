# Design Token Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Tianze from a provisional hard-coded steel-blue token set to a Radix-style, role-based, easily replaceable design token system without freezing the final brand color.

**Architecture:** Keep `src/app/globals.css` as the browser runtime token source, add a 12-step primitive brand/neutral scale, and keep existing semantic tokens such as `--primary`, `--background`, `--border`, and `--ring` as the stable interface consumed by components. Update rules and docs in the same workstream so Codex, Claude, and future AI edits do not keep writing stale color decisions. Do not introduce Radix Themes or a wholesale visual redesign in this migration.

**Tech Stack:** Next.js 16.2 App Router, React 19.2, TypeScript, Tailwind CSS v4 `@theme inline`, shadcn/Radix UI components, Vitest architecture tests, local browser visual smoke.

---

## Scope and stop lines

In scope:

- Introduce a Tianze-owned Radix-style 12-step color architecture.
- Treat current `#004D9E` only as a provisional candidate, not as final brand truth.
- Preserve existing semantic token names so component churn stays low.
- Remove high-risk production hard-coded brand/status colors from key UI surfaces.
- Synchronize docs and rules that guide AI agents.
- Add guardrails that stop new production UI from bypassing semantic tokens.
- Verify key buyer-facing pages and form states visually.

Out of scope:

- No direct adoption of Radix Themes.
- No dependency on `@radix-ui/colors` in the first migration branch.
- No full brand identity freeze.
- No product copy rewrite.
- No product photo or asset redesign.
- No large homepage redesign.
- No dark-mode product launch unless a separate plan is approved.
- No full neutral utility cleanup in this branch. Footer `text-neutral-*` utility classes may remain unless they conflict with touched tests.
- No permanent deletion of files. If a file must be removed from the working tree, move it to Trash or stop and ask the owner.

## Migration principles

1. **Roles before values:** Components use roles like `--primary`, `--ring`, `--success-muted`, not raw blue, green, amber, or red.
2. **Replaceable bottom layer:** Future brand changes should mainly touch primitive scale values and a small non-CSS bridge for email/static surfaces.
3. **Current values are provisional:** Docs must say the current blue is a working candidate.
4. **Rules move with code:** `.claude/rules/ui.md`, `AGENTS.md`, and `CLAUDE.md` must route design-token work to the right truth sources.
5. **No Radix visual costume:** Use Radix's 12-step usage model, not Radix's SaaS/app visual identity.

## File structure map

### New files

- `tests/architecture/design-token-contract.test.ts`
  - Proves the new primitive and semantic token contract exists.
  - Proves semantic tokens point to primitive or component roles.
  - Proves selected production UI files do not keep raw Tailwind palette classes after migration.

- `src/config/static-theme-colors.ts`
  - Holds sRGB fallback values for non-CSS surfaces such as email templates.
  - This is a narrow bridge for environments that cannot read CSS variables.

- `src/config/__tests__/static-theme-colors.test.ts`
  - Proves the static bridge includes only the small approved non-CSS surface set.
  - Proves key values are valid hex colors and that the bridge is documented as a manual, non-CSS-only bridge rather than a new brand truth source.

- `src/components/forms/form-status-styles.ts`
  - Centralizes contact form status class names.
  - Keeps success, error, submitting, and partial-success UI states on semantic CSS variables.

- `src/components/forms/__tests__/form-status-styles.test.ts`
  - Proves form status classes use semantic CSS-variable tokens and no raw `green`, `red`, `blue`, or `amber` Tailwind palette classes.

- `docs/impeccable/system/COLOR-SYSTEM.md`
  - Human-readable current token contract.
  - Explains that the role system is stable while values remain provisional.

### Modified files

- `src/app/globals.css`
  - Add primitive `--brand-1` to `--brand-12`.
  - Add primitive `--neutral-1` to `--neutral-12`.
  - Map semantic tokens to primitive roles.
  - Add status aliases such as `--success-muted`, `--warning-border`, and `--error-foreground`.
  - Add scenario visual helper classes for art-directed backgrounds that should not live inline in TSX.

- `src/components/ui/button.tsx`
  - Replace hard-coded white/border hover classes with token-backed classes.

- `src/components/forms/contact-form-feedback.tsx`
  - Replace raw Tailwind status palette classes with `form-status-styles.ts`.

- `src/components/forms/contact-form-fields.tsx`
- `src/components/forms/fields/name-fields.tsx`
- `src/components/forms/fields/contact-fields.tsx`
- `src/components/forms/fields/checkbox-fields.tsx`
- `src/components/forms/fields/message-field.tsx`
  - Replace required asterisk raw red classes with semantic destructive token classes.

- `src/components/forms/contact-form-container.tsx`
  - Replace raw amber text class with warning semantic token class.

- `src/components/security/turnstile.tsx`
  - Replace raw amber classes with warning semantic token classes.

- `src/components/sections/quality-section.tsx`
  - Replace raw amber badge classes with warning semantic token classes.

- `src/components/sections/chain-section.tsx`
  - Replace raw green text class and `--success-light` surface references with success semantic token classes.

- `src/components/sections/scenarios-section.tsx`
  - Replace inline hard-coded gradients with named CSS helper classes from `globals.css`.

- `src/emails/theme.ts`
  - Use `STATIC_THEME_COLORS` for email-safe values.

- `src/config/footer-style-tokens.ts`
  - Use token-compatible class names and static bridge values where CSS variables cannot apply.

- `.claude/rules/ui.md`
  - Add design-token migration rules.

- `AGENTS.md`
  - Add design-token routing to the rule table.

- `CLAUDE.md`
  - Add design-token routing to Claude rule loading.

- `DESIGN.md`
  - Clarify that role architecture is the current stable design decision; exact values are provisional.

- `docs/design-truth.md`
  - Clarify that industrial clarity and token roles are current truth; `#004D9E` is a candidate, not final identity.

- `docs/impeccable/system/TIANZE-DESIGN-TOKENS.md`
  - Mark the old document as superseded by `COLOR-SYSTEM.md` for current token contract, or update it to point to the new current source.

- `docs/guides/CANONICAL-TRUTH-REGISTRY.md`
  - Add a Design System Truth section for runtime, intent, rule, and proof sources.

## Task 0: Preflight and baseline snapshot

**Files:**
- Read: `AGENTS.md`
- Read: `CLAUDE.md`
- Read: `.claude/rules/ui.md`
- Read: `DESIGN.md`
- Read: `docs/design-truth.md`
- Read: `docs/guides/CANONICAL-TRUTH-REGISTRY.md`
- Read: `src/app/globals.css`

- [ ] **Step 1: Create or confirm the migration branch**

Run:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git log --oneline -1
```

Expected:

```text
The only allowed pre-existing change is this plan file:
?? docs/superpowers/plans/2026-04-29-design-token-migration.md
The branch may currently be main before the next command, but migration work must not continue on main.
The latest commit is visible and can be recorded as the migration baseline.
```

If the branch is `main`, run:

```bash
git switch -c Alx-707/design-token-migration
```

If already on a feature branch for this migration, do not create a second branch. Continue only if the branch name clearly belongs to this migration.

Expected after branch setup:

```text
git rev-parse --abbrev-ref HEAD prints Alx-707/design-token-migration or another clearly named design-token migration branch.
No production migration edits have happened on main.
```

- [ ] **Step 2: Record the base commit for final review**

Run:

```bash
BASE_COMMIT=$(git rev-parse HEAD)
printf "BASE_COMMIT=%s\n" "$BASE_COMMIT"
```

Expected:

```text
BASE_COMMIT prints the commit that existed before any migration code changes.
Record this value in worker notes and use it for the final diff instead of HEAD~N.
```

- [ ] **Step 3: Decide and commit the plan file before production edits**

The plan file is part of the execution contract. If it is untracked, commit it before touching production code:

```bash
git add docs/superpowers/plans/2026-04-29-design-token-migration.md
git commit -m "docs: plan design token migration"
```

If the plan file was already committed in a previous handoff, skip this commit and record the commit hash in worker notes.

Expected:

```text
The implementation branch has a committed plan document or a recorded prior plan commit.
git status --short prints no unrelated changes before Task 1.
Do not push or open a PR while later TDD tasks are intentionally red.
```

- [ ] **Step 4: Confirm package and local-doc context**

Run:

```bash
pnpm --version
node --version
sed -n '1,120p' node_modules/next/dist/docs/01-app/01-getting-started/11-css.md
```

Expected:

```text
pnpm and node print installed versions.
The Next.js CSS doc opens from node_modules, proving local docs are available before CSS work.
```

- [ ] **Step 5: Snapshot current production color surfaces**

Run:

```bash
rg -n --glob '!**/__tests__/**' --glob '!**/*.test.*' --glob '!**/*.generated.*' --glob '!node_modules/**' -- '#[0-9a-fA-F]{3,8}|rgba?\(|oklch\(|text-(slate|gray|blue|red|green|amber|yellow|cyan|sky|emerald|purple|violet)-|bg-(slate|gray|blue|red|green|amber|yellow|cyan|sky|emerald|purple|violet)-|border-(slate|gray|blue|red|green|amber|yellow|cyan|sky|emerald|purple|violet)-' src/app src/components src/config src/emails src/styles
```

Expected:

```text
The scan shows src/app/globals.css plus a short set of production components and static theme files.
Record the output in the worker notes so later cleanup can prove reduction.
```

- [ ] **Step 6: Commit preflight notes if the branch process expects audit artifacts**

If the implementation branch already uses workstream notes, create or update the branch note file chosen by that workstream. If no branch note file exists, do not create one for this migration.

Run:

```bash
git status --short
```

Expected:

```text
No files changed during preflight unless the existing branch explicitly uses a workstream note.
```

## Task 1: Add failing token contract tests

**Files:**
- Create: `tests/architecture/design-token-contract.test.ts`

- [ ] **Step 1: Create the failing design token contract test**

Create `tests/architecture/design-token-contract.test.ts`:

```ts
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const GLOBALS_CSS = "src/app/globals.css";

const RAW_COLOR_PRODUCTION_FILES = [
  "src/components/ui/button.tsx",
  "src/components/forms/contact-form-feedback.tsx",
  "src/components/forms/contact-form-container.tsx",
  "src/components/security/turnstile.tsx",
  "src/components/sections/quality-section.tsx",
  "src/components/sections/chain-section.tsx",
  "src/components/sections/scenarios-section.tsx",
] as const;

const REQUIRED_BRAND_STEPS = Array.from(
  { length: 12 },
  (_, index) => `--brand-${index + 1}`,
);

const REQUIRED_NEUTRAL_STEPS = Array.from(
  { length: 12 },
  (_, index) => `--neutral-${index + 1}`,
);

const REQUIRED_STATUS_TOKENS = [
  "--success-muted",
  "--success-border",
  "--success-foreground",
  "--warning-muted",
  "--warning-border",
  "--warning-foreground",
  "--error-muted",
  "--error-border",
  "--error-foreground",
  "--info-muted",
  "--info-border",
  "--info-foreground",
] as const;

const SEMANTIC_TOKEN_EXPECTATIONS = {
  "--background": "var(--neutral-1)",
  "--foreground": "var(--neutral-12)",
  "--card": "var(--neutral-1)",
  "--card-foreground": "var(--neutral-12)",
  "--popover": "var(--neutral-1)",
  "--popover-foreground": "var(--neutral-12)",
  "--primary": "var(--brand-9)",
  "--primary-foreground": "var(--neutral-1)",
  "--primary-dark": "var(--brand-10)",
  "--primary-light": "var(--brand-3)",
  "--primary-50": "var(--brand-2)",
  "--accent": "var(--brand-3)",
  "--accent-foreground": "var(--brand-11)",
  "--muted": "var(--neutral-3)",
  "--muted-foreground": "var(--neutral-9)",
  "--border": "var(--neutral-4)",
  "--border-light": "var(--neutral-3)",
  "--ring": "var(--brand-8)",
  "--success-light": "var(--success-muted)",
} as const;

const BANNED_RAW_CLASS_PATTERN =
  /\b(?:bg|text|border|ring|outline)-(?:green|red|blue|amber|yellow|cyan|sky|emerald|purple|violet|slate|gray)-\d{2,3}\b/;

const BANNED_INLINE_BRAND_PATTERN =
  /#004d9e|#003b7a|rgba\(\s*0\s*,\s*77\s*,\s*158\b/i;

function readRepoFile(filePath: string) {
  if (!existsSync(filePath)) {
    throw new Error(`Missing expected file: ${filePath}`);
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- architecture test reads fixed repo files
  return readFileSync(filePath, "utf8");
}

function readCssVariable(css: string, tokenName: string) {
  const escapedTokenName = tokenName.replaceAll("-", "\\-");
  const pattern = new RegExp(`${escapedTokenName}\\s*:\\s*([^;]+);`);
  const match = css.match(pattern);

  return match?.[1]?.trim();
}

describe("design token contract", () => {
  it("defines a 12-step brand and neutral primitive scale", () => {
    const css = readRepoFile(GLOBALS_CSS);

    for (const token of [...REQUIRED_BRAND_STEPS, ...REQUIRED_NEUTRAL_STEPS]) {
      expect(
        readCssVariable(css, token),
        `${token} should exist in ${GLOBALS_CSS}`,
      ).toBeDefined();
    }
  });

  it("maps semantic UI roles to primitive token roles", () => {
    const css = readRepoFile(GLOBALS_CSS);

    for (const [token, expectedValue] of Object.entries(
      SEMANTIC_TOKEN_EXPECTATIONS,
    )) {
      expect(readCssVariable(css, token), token).toBe(expectedValue);
    }
  });

  it("defines status state aliases for forms and system feedback", () => {
    const css = readRepoFile(GLOBALS_CSS);

    for (const token of REQUIRED_STATUS_TOKENS) {
      expect(
        readCssVariable(css, token),
        `${token} should exist in ${GLOBALS_CSS}`,
      ).toBeDefined();
    }
  });

  it("keeps selected production UI files off raw palette classes", () => {
    for (const filePath of RAW_COLOR_PRODUCTION_FILES) {
      const source = readRepoFile(filePath);

      expect(
        source.match(BANNED_RAW_CLASS_PATTERN),
        `${filePath} should use semantic token classes instead of raw Tailwind palette classes`,
      ).toBeNull();
    }
  });

  it("keeps selected production UI files from embedding old brand color values", () => {
    for (const filePath of RAW_COLOR_PRODUCTION_FILES) {
      const source = readRepoFile(filePath);

      expect(
        source.match(BANNED_INLINE_BRAND_PATTERN),
        `${filePath} should not embed the old steel-blue value directly`,
      ).toBeNull();
    }
  });

  it("does not keep old brand color values in the browser runtime CSS", () => {
    const css = readRepoFile(GLOBALS_CSS);

    expect(
      css.match(BANNED_INLINE_BRAND_PATTERN),
      `${GLOBALS_CSS} should not keep old brand hex or rgba values, including high-contrast overrides`,
    ).toBeNull();
  });
});
```

- [ ] **Step 2: Run the new architecture test and verify it fails**

Run:

```bash
pnpm exec vitest run tests/architecture/design-token-contract.test.ts
```

Expected:

```text
FAIL tests/architecture/design-token-contract.test.ts
At least one failure mentions missing --brand-1 or semantic token values not matching var(--brand-9).
At least one failure may mention raw Tailwind palette classes in selected production UI files.
At least one failure may mention old brand color values still present in src/app/globals.css.
```

- [ ] **Step 3: Commit the failing test**

Run:

```bash
git add tests/architecture/design-token-contract.test.ts
git commit -m "test: define design token migration contract"
```

Expected:

```text
A commit is created with only tests/architecture/design-token-contract.test.ts staged.
This failing-test commit is local-only TDD scaffolding. Do not push or open a PR until the full plan is green.
```

## Task 2: Migrate browser runtime tokens in globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace the primitive and semantic color section**

In `src/app/globals.css`, replace the entire section from:

```css
/* ==================== PRIMITIVE TOKENS ==================== */
```

through the end of the current component token `:root` block immediately before:

```css
/* ==================== TAILWIND THEME BINDINGS ==================== */
```

with this complete copy-paste-safe block. Do not partially merge it with the old block.

```css
/* ==================== PRIMITIVE TOKENS ==================== */
/* Design System: Tianze-owned Radix-style roles.
   Values are provisional. Component code must consume semantic tokens. */

:root {
  /* Brand Scale, provisional steel-blue candidate.
     1-2 backgrounds, 3-5 component states, 6-8 borders/focus,
     9-10 solid actions, 11-12 brand text. */
  --brand-1: oklch(0.985 0.006 240);
  --brand-2: oklch(0.965 0.012 240);
  --brand-3: oklch(0.94 0.02 240);
  --brand-4: oklch(0.9 0.035 240);
  --brand-5: oklch(0.84 0.055 240);
  --brand-6: oklch(0.78 0.07 240);
  --brand-7: oklch(0.7 0.085 240);
  --brand-8: oklch(0.61 0.1 240);
  --brand-9: oklch(0.47 0.12 240);
  --brand-10: oklch(0.4 0.11 240);
  --brand-11: oklch(0.36 0.095 240);
  --brand-12: oklch(0.25 0.06 240);

  /* Neutral Scale, lightly blue-tinted for manufacturing clarity. */
  --neutral-1: oklch(0.985 0.004 240);
  --neutral-2: oklch(0.965 0.006 240);
  --neutral-3: oklch(0.94 0.007 240);
  --neutral-4: oklch(0.9 0.008 240);
  --neutral-5: oklch(0.84 0.009 240);
  --neutral-6: oklch(0.76 0.01 240);
  --neutral-7: oklch(0.64 0.012 240);
  --neutral-8: oklch(0.52 0.014 240);
  --neutral-9: oklch(0.42 0.015 240);
  --neutral-10: oklch(0.34 0.014 240);
  --neutral-11: oklch(0.29 0.013 240);
  --neutral-12: oklch(0.22 0.012 240);

  /* Legacy scale aliases kept for low-churn compatibility. */
  --gray-50: var(--neutral-1);
  --gray-100: var(--neutral-3);
  --gray-200: var(--neutral-4);
  --gray-300: var(--neutral-5);
  --gray-400: var(--neutral-6);
  --gray-500: var(--neutral-8);
  --gray-600: var(--neutral-9);
  --gray-700: var(--neutral-10);
  --gray-800: var(--neutral-11);
  --gray-900: var(--neutral-12);
  --gray-950: oklch(0.16 0.014 240);

  --blue-50: var(--brand-2);
  --blue-100: var(--brand-3);
  --blue-200: var(--brand-5);
  --blue-300: var(--brand-6);
  --blue-400: var(--brand-8);
  --blue-500: var(--brand-9);
  --blue-600: var(--brand-10);
  --blue-700: var(--brand-11);
  --blue-800: var(--brand-12);
  --blue-900: oklch(0.2 0.05 240);
  --blue-950: oklch(0.16 0.04 240);

  /* Border Radius — 8px base (Vercel precision) */
  --radius: 0.5rem;
  --radius-none: 0;
  --radius-sharp: 0.125rem;
  --radius-base: 0.25rem;
  --radius-soft: 0.375rem;
  --radius-round: 9999px;

  /* Foundation */
  --background: var(--neutral-1);
  --foreground: var(--neutral-12);

  /* Surfaces */
  --card: var(--neutral-1);
  --card-foreground: var(--neutral-12);
  --popover: var(--neutral-1);
  --popover-foreground: var(--neutral-12);

  /* Brand Primary */
  --primary: var(--brand-9);
  --primary-foreground: var(--neutral-1);
  --primary-dark: var(--brand-10);
  --primary-light: var(--brand-3);
  --primary-50: var(--brand-2);

  /* Secondary */
  --secondary: var(--neutral-1);
  --secondary-foreground: var(--neutral-12);

  /* Accent */
  --accent: var(--brand-3);
  --accent-foreground: var(--brand-11);

  /* Muted */
  --muted: var(--neutral-3);
  --muted-foreground: var(--neutral-9);

  /* Status Colors */
  --success: oklch(0.56 0.13 155);
  --success-muted: oklch(0.965 0.025 155);
  --success-border: oklch(0.86 0.06 155);
  --success-foreground: oklch(0.3 0.075 155);
  --success-light: var(--success-muted);

  --warning: oklch(0.66 0.14 72);
  --warning-muted: oklch(0.965 0.035 72);
  --warning-border: oklch(0.86 0.075 72);
  --warning-foreground: oklch(0.34 0.075 72);

  --error: oklch(0.55 0.2 27);
  --error-muted: oklch(0.965 0.025 27);
  --error-border: oklch(0.86 0.065 27);
  --error-foreground: oklch(0.35 0.13 27);

  --info: var(--brand-9);
  --info-muted: var(--brand-2);
  --info-border: var(--brand-5);
  --info-foreground: var(--brand-11);

  --destructive: var(--error);
  --destructive-foreground: var(--neutral-1);

  /* Borders & Inputs */
  --border: var(--neutral-4);
  --border-light: var(--neutral-3);
  --input: var(--neutral-1);
  --ring: var(--brand-8);

  /* Charts */
  --chart-1: var(--brand-9);
  --chart-2: var(--success);
  --chart-3: var(--warning);
  --chart-4: oklch(0.58 0.13 280);
  --chart-5: var(--error);

  /* Selection */
  --selection-background: color-mix(in oklch, var(--primary) 20%, transparent);
  --selection-foreground: var(--foreground);

  /* Sidebar */
  --sidebar: var(--neutral-1);
  --sidebar-foreground: var(--neutral-12);
  --sidebar-primary: var(--primary);
  --sidebar-primary-foreground: var(--primary-foreground);
  --sidebar-accent: var(--accent);
  --sidebar-accent-foreground: var(--accent-foreground);
  --sidebar-border: var(--border);
  --sidebar-ring: var(--ring);

  /* Shadows — Visible, subtle */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.03);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.03);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.06), 0 8px 10px rgba(0, 0, 0, 0.03);
  --shadow-inset: inset 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-accent: 0 0 0 3px color-mix(in oklch, var(--primary) 20%, transparent);

  /* Shadow-Border (Vercel technique: shadow as border for smooth transitions) */
  --shadow-card-active:
    0 0 0 1px var(--primary),
    0 0 0 4px color-mix(in oklch, var(--primary) 12%, transparent);

  /* Section Divider (Vercel-style) */
  --divider: var(--neutral-4);

  /* Grid System */
  --grid-guide: color-mix(in oklch, var(--neutral-12) 5%, transparent);
  --grid-divider: var(--neutral-4);
  --grid-crosshair: var(--neutral-6);

  /* Animation */
  --duration-instant: 50ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 400ms;

  --ease-linear: linear;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);

  --transition-colors:
    color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
  --transition-opacity: opacity var(--duration-normal) var(--ease-smooth);
  --transition-transform: transform var(--duration-normal) var(--ease-out);
  --transition-shadow: box-shadow var(--duration-fast) var(--ease-out);
  --transition-all: all var(--duration-normal) var(--ease-smooth);

  /* Typography — Figtree + monospace fallback */
  --font-sans:
    var(--font-figtree), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  --font-mono:
    var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo,
    Consolas, "Liberation Mono", monospace;
  --font-chinese:
    "Source Han Sans SC", "Noto Sans SC", "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", sans-serif;

  /* Container */
  --container-max: 1080px;
  --nav-h: 56px;

  /* Footer Dark Surface */
  --footer-bg: var(--neutral-11);
  --footer-text: var(--neutral-5);
  --footer-heading: var(--neutral-6);
  --footer-link: var(--neutral-4);
  --footer-divider: color-mix(in oklch, var(--neutral-1) 8%, transparent);
}

/* ==================== COMPONENT TOKENS ==================== */

:root {
  /* Button — 6px radius, 150ms */
  --button-radius: 6px;
  --button-font-weight: 600;

  --button-primary-bg: var(--primary);
  --button-primary-fg: var(--primary-foreground);
  --button-primary-hover-bg: var(--primary-dark);

  --button-accent-bg: var(--accent);
  --button-accent-fg: var(--accent-foreground);
  --button-accent-hover-bg: var(--brand-4);

  --button-secondary-bg: var(--secondary);
  --button-secondary-fg: var(--secondary-foreground);
  --button-secondary-border: var(--border);
  --button-secondary-hover-border: var(--neutral-5);

  --button-outline-bg: transparent;
  --button-outline-fg: var(--primary);
  --button-outline-border: var(--primary);
  --button-outline-hover-bg: color-mix(in oklch, var(--primary) 10%, transparent);

  --button-ghost-bg: transparent;
  --button-ghost-fg: var(--foreground);
  --button-ghost-hover-bg: var(--accent);

  --button-destructive-bg: var(--destructive);
  --button-destructive-fg: var(--destructive-foreground);

  /* Card — 8px radius */
  --card-radius: var(--radius);
  --card-padding: 1.5rem;
  --card-default-shadow: none;
  --card-elevated-shadow: var(--shadow-md);

  /* Input */
  --input-height: 2.5rem;
  --input-padding-x: 1rem;
  --input-radius: var(--radius);

  /* Table */
  --table-radius: var(--radius-soft);
  --table-header-bg: var(--neutral-3);
  --table-row-hover-bg: color-mix(in oklch, var(--primary) 8%, transparent);

  /* Badge */
  --badge-radius: var(--radius-round);
  --badge-padding-x: 0.75rem;
  --badge-padding-y: 0.25rem;
}
```

- [ ] **Step 2: Replace high-contrast old brand override**

In the existing high contrast block, replace:

```css
  @media (prefers-contrast: high) {
    :root {
      --border: #4a545b;
      --ring: #003b7a;
    }
```

with:

```css
  @media (prefers-contrast: high) {
    :root {
      --border: var(--neutral-8);
      --ring: var(--brand-10);
    }
```

- [ ] **Step 3: Add scenario visual helper classes**

Add this block below the existing `@layer base` block or inside a new `@layer components` block near other shared CSS helpers:

```css
@layer components {
  .tianze-scenario-surface {
    background:
      radial-gradient(
        circle at top left,
        color-mix(in oklch, var(--success) 22%, transparent),
        transparent 45%
      ),
      linear-gradient(135deg, var(--neutral-12), var(--neutral-10));
    color: var(--neutral-1);
  }

  .tianze-scenario-grid {
    background-image:
      linear-gradient(
        color-mix(in oklch, var(--neutral-1) 12%, transparent) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        color-mix(in oklch, var(--neutral-1) 12%, transparent) 1px,
        transparent 1px
      );
    background-size: 22px 22px;
  }
}
```

- [ ] **Step 4: Run the token contract test and verify only component cleanup failures remain**

Run:

```bash
pnpm exec vitest run tests/architecture/design-token-contract.test.ts
```

Expected:

```text
Primitive and semantic token assertions pass.
Failures, if any, are limited to selected production UI files still using raw palette classes.
```

- [ ] **Step 5: Commit CSS token migration**

Run:

```bash
git add src/app/globals.css
git commit -m "feat: add replaceable design token color roles"
```

Expected:

```text
A commit is created with only src/app/globals.css staged.
```

## Task 3: Move form and feedback states to semantic tokens

**Files:**
- Create: `src/components/forms/form-status-styles.ts`
- Create: `src/components/forms/__tests__/form-status-styles.test.ts`
- Modify: `src/components/forms/contact-form-feedback.tsx`
- Modify: `src/components/forms/contact-form-fields.tsx`
- Modify: `src/components/forms/fields/name-fields.tsx`
- Modify: `src/components/forms/fields/contact-fields.tsx`
- Modify: `src/components/forms/fields/checkbox-fields.tsx`
- Modify: `src/components/forms/fields/message-field.tsx`
- Modify: `src/components/forms/contact-form-container.tsx`

- [ ] **Step 1: Write the form status style test**

Create `src/components/forms/__tests__/form-status-styles.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  FORM_FIELD_REQUIRED_CLASS_NAME,
  FORM_STATUS_CLASS_NAMES,
} from "../form-status-styles";

const RAW_PALETTE_PATTERN =
  /\b(?:bg|text|border)-(?:green|red|blue|amber)-\d{2,3}\b/;

describe("form status styles", () => {
  it("uses semantic tokens for every form status tone", () => {
    for (const [tone, className] of Object.entries(FORM_STATUS_CLASS_NAMES)) {
      expect(className, tone).toContain("var(--");
      expect(className.match(RAW_PALETTE_PATTERN), tone).toBeNull();
    }
  });

  it("uses destructive semantics for required indicators", () => {
    expect(FORM_FIELD_REQUIRED_CLASS_NAME).toBe(
      "after:ml-0.5 after:text-destructive after:content-['*']",
    );
  });
});
```

- [ ] **Step 2: Run the new form style test and verify it fails**

Run:

```bash
pnpm exec vitest run src/components/forms/__tests__/form-status-styles.test.ts
```

Expected:

```text
FAIL because src/components/forms/form-status-styles.ts does not exist.
```

- [ ] **Step 3: Create semantic form status styles**

Create `src/components/forms/form-status-styles.ts`:

```ts
export const FORM_STATUS_CLASS_NAMES = {
  success:
    "border-[var(--success-border)] bg-[var(--success-muted)] text-[var(--success-foreground)]",
  error:
    "border-[var(--error-border)] bg-[var(--error-muted)] text-[var(--error-foreground)]",
  submitting:
    "border-[var(--info-border)] bg-[var(--info-muted)] text-[var(--info-foreground)]",
  partialSuccess:
    "border-[var(--warning-border)] bg-[var(--warning-muted)] text-[var(--warning-foreground)]",
  warningText: "text-[var(--warning-foreground)]",
} as const;

export const FORM_FIELD_REQUIRED_CLASS_NAME =
  "after:ml-0.5 after:text-destructive after:content-['*']";
```

- [ ] **Step 4: Update contact form feedback to use the shared map**

In `src/components/forms/contact-form-feedback.tsx`, add this import:

```ts
import { FORM_STATUS_CLASS_NAMES } from "@/components/forms/form-status-styles";
```

Replace `getStatusConfig()` class names with:

```ts
export function getStatusConfig(
  status: FormSubmissionStatus,
  t: (key: string) => string,
): { className: string; message: string } | undefined {
  switch (status) {
    case "success":
      return {
        className: FORM_STATUS_CLASS_NAMES.success,
        message: t("submitSuccess"),
      };
    case "error":
      return {
        className: FORM_STATUS_CLASS_NAMES.error,
        message: t("submitError"),
      };
    case "submitting":
      return {
        className: FORM_STATUS_CLASS_NAMES.submitting,
        message: t("submitting"),
      };
    case "idle":
    default:
      return undefined;
  }
}
```

Replace `containerClass` in `getErrorDisplayState()` with:

```ts
    containerClass: isPartialSuccess
      ? `rounded-lg border p-4 ${FORM_STATUS_CLASS_NAMES.partialSuccess}`
      : `rounded-lg border p-4 ${FORM_STATUS_CLASS_NAMES.error}`,
```

- [ ] **Step 5: Update required-field indicators**

In each listed form field file, import the shared class:

```ts
import { FORM_FIELD_REQUIRED_CLASS_NAME } from "@/components/forms/form-status-styles";
```

Replace every required-marker class:

```tsx
className="after:ml-0.5 after:text-red-500 after:content-['*']"
```

with:

```tsx
className={FORM_FIELD_REQUIRED_CLASS_NAME}
```

For `src/components/forms/fields/checkbox-fields.tsx`, preserve the existing `text-sm` class. Add this import:

```ts
import { cn } from "@/lib/utils";
```

and replace:

```tsx
className="text-sm after:ml-0.5 after:text-red-500 after:content-['*']"
```

with:

```tsx
className={cn("text-sm", FORM_FIELD_REQUIRED_CLASS_NAME)}
```

For conditional usage in `src/components/forms/contact-form-fields.tsx`, replace the true branch:

```ts
? "after:ml-0.5 after:text-red-500 after:content-['*']"
```

with:

```ts
? FORM_FIELD_REQUIRED_CLASS_NAME
```

- [ ] **Step 6: Update contact warning text**

In `src/components/forms/contact-form-container.tsx`, add:

```ts
import { FORM_STATUS_CLASS_NAMES } from "@/components/forms/form-status-styles";
```

Replace:

```tsx
<p className="text-center text-sm text-amber-600" aria-live="polite">
```

with:

```tsx
<p
  className={`text-center text-sm ${FORM_STATUS_CLASS_NAMES.warningText}`}
  aria-live="polite"
>
```

- [ ] **Step 7: Run focused form tests**

Run:

```bash
pnpm exec vitest run src/components/forms/__tests__/form-status-styles.test.ts src/components/forms/__tests__/contact-form-container.test.tsx
```

Expected:

```text
PASS src/components/forms/__tests__/form-status-styles.test.ts
PASS src/components/forms/__tests__/contact-form-container.test.tsx
```

- [ ] **Step 8: Run token contract test**

Run:

```bash
pnpm exec vitest run tests/architecture/design-token-contract.test.ts
```

Expected:

```text
The selected contact form files no longer fail raw green, red, blue, or amber class checks.
Remaining failures point to button, Turnstile, quality, chain, or scenarios files if they are not yet migrated.
```

- [ ] **Step 9: Commit form state migration**

Run:

```bash
git add src/components/forms/form-status-styles.ts src/components/forms/__tests__/form-status-styles.test.ts src/components/forms/contact-form-feedback.tsx src/components/forms/contact-form-fields.tsx src/components/forms/fields/name-fields.tsx src/components/forms/fields/contact-fields.tsx src/components/forms/fields/checkbox-fields.tsx src/components/forms/fields/message-field.tsx src/components/forms/contact-form-container.tsx
git commit -m "refactor: route form status colors through design tokens"
```

Expected:

```text
A commit is created with only form state migration files staged.
```

## Task 4: Move remaining selected UI surfaces to semantic tokens

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/security/turnstile.tsx`
- Modify: `src/components/sections/quality-section.tsx`
- Modify: `src/components/sections/chain-section.tsx`
- Modify: `src/components/sections/scenarios-section.tsx`

- [ ] **Step 1: Update button variants**

In `src/components/ui/button.tsx`, replace the `buttonVariants` color classes for these variants:

```ts
        default:
          "bg-primary text-primary-foreground hover:bg-[var(--button-primary-hover-bg)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-[color-mix(in_oklch,var(--destructive)_90%,black)] focus-visible:ring-destructive",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-[var(--button-outline-hover-bg)]",
        secondary:
          "border border-border bg-secondary text-secondary-foreground shadow-[var(--shadow-xs)] hover:border-[var(--button-secondary-hover-border)] hover:shadow-[var(--shadow-sm)]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        accent:
          "bg-accent text-accent-foreground hover:bg-[var(--button-accent-hover-bg)]",
        "on-dark":
          "bg-[var(--neutral-1)] text-primary hover:bg-[color-mix(in_oklch,var(--neutral-1)_90%,transparent)]",
        "ghost-dark":
          "border border-[color-mix(in_oklch,var(--neutral-1)_30%,transparent)] bg-transparent text-[var(--neutral-1)] hover:border-[color-mix(in_oklch,var(--neutral-1)_50%,transparent)] hover:bg-[color-mix(in_oklch,var(--neutral-1)_8%,transparent)]",
```

- [ ] **Step 2: Update Turnstile warning surface**

In `src/components/security/turnstile.tsx`, replace the raw amber class string:

```tsx
className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
```

with:

```tsx
className="rounded-md border border-[var(--warning-border)] bg-[var(--warning-muted)] p-3 text-sm text-[var(--warning-foreground)]"
```

- [ ] **Step 3: Update quality warning badge**

In `src/components/sections/quality-section.tsx`, replace:

```tsx
className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
```

with:

```tsx
className="rounded bg-[var(--warning-muted)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--warning-foreground)]"
```

- [ ] **Step 4: Update chain success text**

In `src/components/sections/chain-section.tsx`, replace the stat badge wrapper:

```tsx
<div className="flex items-center gap-3 rounded-lg border border-[var(--success-light)] bg-[var(--success-light)] px-5 py-4">
```

with:

```tsx
<div className="flex items-center gap-3 rounded-lg border border-[var(--success-border)] bg-[var(--success-muted)] px-5 py-4">
```

Then replace:

```tsx
<span className="text-green-600">
```

with:

```tsx
<span className="text-[var(--success)]">
```

- [ ] **Step 5: Update scenario visual background**

In `src/components/sections/scenarios-section.tsx`, replace:

```tsx
<div className="relative h-40 overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.22),_transparent_45%),linear-gradient(135deg,_rgba(15,23,42,0.95),_rgba(30,41,59,0.85))] text-white">
  <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:22px_22px]" />
```

with:

```tsx
<div className="tianze-scenario-surface relative h-40 overflow-hidden">
  <div className="tianze-scenario-grid absolute inset-0 opacity-30" />
```

- [ ] **Step 6: Run focused UI tests**

Run:

```bash
pnpm exec vitest run src/components/ui/__tests__/button.test.tsx src/components/sections/__tests__/quality-section.test.tsx
```

Expected:

```text
PASS src/components/ui/__tests__/button.test.tsx
PASS src/components/sections/__tests__/quality-section.test.tsx
```

- [ ] **Step 7: Run token contract test**

Run:

```bash
pnpm exec vitest run tests/architecture/design-token-contract.test.ts
```

Expected:

```text
PASS tests/architecture/design-token-contract.test.ts
```

- [ ] **Step 8: Commit selected UI cleanup**

Run:

```bash
git add src/components/ui/button.tsx src/components/security/turnstile.tsx src/components/sections/quality-section.tsx src/components/sections/chain-section.tsx src/components/sections/scenarios-section.tsx src/app/globals.css
git commit -m "refactor: use design tokens for selected UI color states"
```

Expected:

```text
A commit is created with selected UI files and any scenario CSS helper adjustments.
```

## Task 5: Add a static color bridge for email and non-CSS surfaces

**Files:**
- Create: `src/config/static-theme-colors.ts`
- Create: `src/config/__tests__/static-theme-colors.test.ts`
- Modify: `src/emails/theme.ts`
- Modify: `src/config/footer-style-tokens.ts`

- [ ] **Step 1: Write the static theme bridge test**

Create `src/config/__tests__/static-theme-colors.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { STATIC_THEME_COLORS } from "../static-theme-colors";

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const BRIDGE_SOURCE = readFileSync("src/config/static-theme-colors.ts", "utf8");

describe("static theme colors", () => {
  it("exposes email-safe sRGB values for non-CSS surfaces", () => {
    expect(Object.keys(STATIC_THEME_COLORS).sort()).toEqual([
      "background",
      "border",
      "contentBackground",
      "error",
      "footerSelectionBackground",
      "footerSelectionForeground",
      "headerText",
      "muted",
      "primary",
      "primaryHover",
      "success",
      "successLight",
      "text",
      "textLight",
      "warning",
      "warningLight",
    ]);
  });

  it("keeps every exported value as a full hex color", () => {
    for (const [name, value] of Object.entries(STATIC_THEME_COLORS)) {
      expect(value, name).toMatch(HEX_COLOR_PATTERN);
    }
  });

  it("documents the bridge boundary instead of pretending to be brand truth", () => {
    expect(BRIDGE_SOURCE).toContain("sRGB bridge for src/app/globals.css");
    expect(BRIDGE_SOURCE).toContain("non-CSS surfaces only");
    expect(BRIDGE_SOURCE).toContain("not the brand truth source");
  });
});
```

This test intentionally does not parse OKLCH values from `globals.css`. The bridge is manually maintained sRGB for email/static consumers, so the test proves boundary and format rather than pretending to mathematically prove visual equivalence.

- [ ] **Step 2: Run the new static bridge test and verify it fails**

Run:

```bash
pnpm exec vitest run src/config/__tests__/static-theme-colors.test.ts
```

Expected:

```text
FAIL because src/config/static-theme-colors.ts does not exist.
```

- [ ] **Step 3: Create the static bridge**

Create `src/config/static-theme-colors.ts`:

```ts
/**
 * sRGB bridge for src/app/globals.css.
 *
 * Use this file for email templates and non-CSS surfaces only.
 * This is not the brand truth source; browser UI must consume CSS tokens.
 */
export const STATIC_THEME_COLORS = {
  primary: "#004d9e",
  primaryHover: "#003b7a",
  success: "#0f7b5f",
  successLight: "#eefbf4",
  warning: "#9a5a00",
  warningLight: "#fff7dc",
  error: "#b42318",
  text: "#29343b",
  textLight: "#5f6b73",
  muted: "#66727a",
  background: "#fbfcfd",
  contentBackground: "#f3f6f8",
  headerText: "#fbfcfd",
  border: "#dce3e8",
  footerSelectionBackground: "#ededed",
  footerSelectionForeground: "#1a1a1a",
} as const;
```

- [ ] **Step 4: Update email theme to use the static bridge**

In `src/emails/theme.ts`, add:

```ts
import { STATIC_THEME_COLORS } from "@/config/static-theme-colors";
```

Replace the `COLORS` object with:

```ts
export const COLORS = {
  primary: STATIC_THEME_COLORS.primary,
  success: STATIC_THEME_COLORS.success,
  successLight: STATIC_THEME_COLORS.successLight,
  text: STATIC_THEME_COLORS.text,
  textLight: STATIC_THEME_COLORS.textLight,
  muted: STATIC_THEME_COLORS.muted,
  background: STATIC_THEME_COLORS.background,
  contentBackground: STATIC_THEME_COLORS.contentBackground,
  headerText: STATIC_THEME_COLORS.headerText,
  border: STATIC_THEME_COLORS.border,
} as const;
```

- [ ] **Step 5: Update footer selection colors to use static bridge**

In `src/config/footer-style-tokens.ts`, add:

```ts
import { STATIC_THEME_COLORS } from "@/config/static-theme-colors";
```

Replace the `selection` values with:

```ts
    selection: {
      dark: {
        background: STATIC_THEME_COLORS.footerSelectionBackground,
        foreground: STATIC_THEME_COLORS.footerSelectionForeground,
      },
      light: {
        background: STATIC_THEME_COLORS.footerSelectionForeground,
        foreground: STATIC_THEME_COLORS.footerSelectionBackground,
      },
    },
```

- [ ] **Step 6: Run bridge and footer/email type checks**

Run:

```bash
pnpm exec vitest run src/config/__tests__/static-theme-colors.test.ts src/components/footer/__tests__/Footer.test.tsx
pnpm type-check
```

Expected:

```text
PASS src/config/__tests__/static-theme-colors.test.ts
PASS src/components/footer/__tests__/Footer.test.tsx
pnpm type-check exits 0
```

- [ ] **Step 7: Commit static bridge migration**

Run:

```bash
git add src/config/static-theme-colors.ts src/config/__tests__/static-theme-colors.test.ts src/emails/theme.ts src/config/footer-style-tokens.ts
git commit -m "refactor: add static color bridge for non-css surfaces"
```

Expected:

```text
A commit is created with the static color bridge and its consumers.
```

## Task 6: Update rules and current design truth documents

**Files:**
- Modify: `.claude/rules/ui.md`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`
- Modify: `DESIGN.md`
- Modify: `docs/design-truth.md`
- Modify: `docs/guides/CANONICAL-TRUTH-REGISTRY.md`
- Create: `docs/impeccable/system/COLOR-SYSTEM.md`
- Modify: `docs/impeccable/system/TIANZE-DESIGN-TOKENS.md`

- [ ] **Step 1: Update UI rule with token migration contract**

In `.claude/rules/ui.md`, add this section after `## Design Tokens`:

```markdown
### Design token migration rule

The current color values are provisional. Do not treat `#004D9E` or any current blue as final brand identity.

For production UI:

- Use semantic tokens from `src/app/globals.css`, such as `bg-primary`, `text-foreground`, `border-border`, `ring-ring`, or explicit CSS-variable classes like `bg-[var(--success-muted)]`.
- Do not introduce raw brand hex values in components.
- Do not introduce raw Tailwind palette classes such as `bg-blue-50`, `text-red-500`, `border-amber-200`, or `text-green-600` in production UI unless the class is inside a test fixture.
- If a new visual state is needed, add or reuse a semantic/component token in `src/app/globals.css`.
- If a non-CSS surface needs a color, use `src/config/static-theme-colors.ts`.

Before changing brand color, theme, or design-token architecture, read:

1. `DESIGN.md`
2. `docs/design-truth.md`
3. `docs/impeccable/system/COLOR-SYSTEM.md`
4. `docs/guides/CANONICAL-TRUTH-REGISTRY.md`
```

- [ ] **Step 2: Update AGENTS routing table**

In `AGENTS.md`, add this row to the Rule Routing table:

```markdown
| Design tokens, brand color, theme, visual system, color migration | `ui.md` + `DESIGN.md` + `docs/design-truth.md` + `docs/impeccable/system/COLOR-SYSTEM.md` |
```

- [ ] **Step 3: Update CLAUDE rule loading list**

In `CLAUDE.md`, add this bullet under Rule Loading:

```markdown
- Design tokens, brand color, theme, visual system, or color migration: `ui.md` + `DESIGN.md` + `docs/design-truth.md` + `docs/impeccable/system/COLOR-SYSTEM.md`
```

- [ ] **Step 4: Create the current color system document**

Create `docs/impeccable/system/COLOR-SYSTEM.md`:

```markdown
# Tianze Color System

## Current status

The color architecture is current. The exact color values are provisional.

This means agents may rely on the role system, but must not treat the current blue value as final brand identity.

## Runtime source

Browser runtime tokens live in `src/app/globals.css`.

Non-CSS surfaces, such as email templates, use the narrow sRGB bridge in `src/config/static-theme-colors.ts`.

## Token layers

### Primitive roles

- `--brand-1` to `--brand-12`: Tianze-owned Radix-style brand scale.
- `--neutral-1` to `--neutral-12`: lightly tinted neutral scale.

Use the scale by role:

| Steps | Role |
| --- | --- |
| 1-2 | App and subtle backgrounds |
| 3-5 | Component backgrounds, hover, selected states |
| 6-8 | Borders, interactive borders, focus rings |
| 9-10 | Solid action surfaces and action hover |
| 11-12 | Low and high emphasis brand text |

### Semantic roles

Components should consume semantic tokens:

- `--background`
- `--foreground`
- `--card`
- `--primary`
- `--primary-dark`
- `--accent`
- `--muted`
- `--muted-foreground`
- `--border`
- `--ring`
- `--success-*`
- `--warning-*`
- `--error-*`
- `--info-*`

## Rules for AI agents

- Do not write raw brand hex values in production components.
- Do not use Tailwind raw palette classes for production UI states.
- Do not import Radix Themes for this migration.
- Do not treat the current steel blue as final.
- If the owner asks for a brand color adjustment, change primitive values first and leave component code stable.

## Visual intent

Tianze should look like a credible B2B manufacturer: clear, restrained, precise, and procurement-friendly.

The color system should reduce owner decision load and keep AI-generated UI from drifting into generic SaaS or AI landing-page aesthetics.
```

- [ ] **Step 5: Update DESIGN.md and docs/design-truth.md**

In `DESIGN.md`, update the color status language so it includes this exact meaning:

```markdown
The stable design decision is the role-based color architecture, not the exact current blue value. Current color values are provisional and may change after pilot-page validation.
```

In `docs/design-truth.md`, update the color section so it includes this exact meaning:

```markdown
Current truth: Tianze uses a replaceable role-based color system. The current steel-blue candidate is not final brand identity. Agents should preserve the role system and avoid writing raw color values into production components.
```

- [ ] **Step 6: Mark the old token document as superseded for current contract**

At the top of `docs/impeccable/system/TIANZE-DESIGN-TOKENS.md`, after the title block, add:

```markdown
> Current contract note: `docs/impeccable/system/COLOR-SYSTEM.md` is the current color-system contract. This document remains useful as historical design-token background and implementation detail, but it must not override `src/app/globals.css` or `COLOR-SYSTEM.md`.
```

- [ ] **Step 7: Add design system truth to canonical registry**

In `docs/guides/CANONICAL-TRUTH-REGISTRY.md`, add this section before `##配套 canonical docs`:

```markdown
## Design System Truth

| Layer | Canonical source | 用途 |
| --- | --- | --- |
| Runtime color tokens | `src/app/globals.css` | Browser CSS variables and Tailwind `@theme inline` bindings |
| Static color bridge | `src/config/static-theme-colors.ts` | Email and non-CSS surfaces that cannot read CSS variables |
| Design intent | `DESIGN.md` + `docs/design-truth.md` | Business-facing design direction and current truth |
| Current color contract | `docs/impeccable/system/COLOR-SYSTEM.md` | Agent-readable token role rules |
| Agent implementation rule | `.claude/rules/ui.md` | What future Codex/Claude edits must follow |
| Proof | `tests/architecture/design-token-contract.test.ts` + browser visual smoke | Contract and visual regression checks |

Rule: current token values are provisional. The role architecture is the stable interface.
```

- [ ] **Step 8: Run doc and routing scans**

Run:

```bash
rg -n "Design token migration rule|COLOR-SYSTEM|role-based color|current steel-blue candidate|Design System Truth" AGENTS.md CLAUDE.md .claude/rules/ui.md DESIGN.md docs/design-truth.md docs/guides/CANONICAL-TRUTH-REGISTRY.md docs/impeccable/system/COLOR-SYSTEM.md docs/impeccable/system/TIANZE-DESIGN-TOKENS.md
```

Expected:

```text
Every searched phrase appears in the intended rule or design document.
```

- [ ] **Step 9: Commit rules and design docs**

Run:

```bash
git add .claude/rules/ui.md AGENTS.md CLAUDE.md DESIGN.md docs/design-truth.md docs/guides/CANONICAL-TRUTH-REGISTRY.md docs/impeccable/system/COLOR-SYSTEM.md docs/impeccable/system/TIANZE-DESIGN-TOKENS.md
git commit -m "docs: define replaceable design token truth"
```

Expected:

```text
A commit is created with rule and design-truth documents only.
```

## Task 7: Run full focused verification

**Files:**
- Read: `package.json`
- Read: `.claude/rules/testing.md`

- [ ] **Step 1: Run design-token and touched-surface tests**

Run:

```bash
pnpm exec vitest run tests/architecture/design-token-contract.test.ts src/components/forms/__tests__/form-status-styles.test.ts src/config/__tests__/static-theme-colors.test.ts src/components/ui/__tests__/button.test.tsx src/components/footer/__tests__/Footer.test.tsx
```

Expected:

```text
PASS all listed test files.
```

- [ ] **Step 2: Run type and lint gates**

Run:

```bash
pnpm type-check
pnpm lint:check
```

Expected:

```text
pnpm type-check exits 0.
pnpm lint:check exits 0.
```

- [ ] **Step 3: Run production build**

Run:

```bash
pnpm build
```

Expected:

```text
pnpm build exits 0.
No CSS parsing error appears for OKLCH, color-mix, or Tailwind arbitrary value classes.
```

- [ ] **Step 4: Run Cloudflare build only after standard build succeeds**

Run:

```bash
pnpm build:cf
```

Expected:

```text
pnpm build:cf exits 0.
Do not run pnpm build and pnpm build:cf in parallel because both write .next.
```

- [ ] **Step 5: Run final production color scan**

Run:

```bash
rg -n --glob '!**/__tests__/**' --glob '!**/*.test.*' --glob '!**/*.generated.*' --glob '!node_modules/**' -- '#004d9e|#003b7a|rgba\(\s*0\s*,\s*77\s*,\s*158\b|text-(green|red|blue|amber)-\d{2,3}|bg-(green|red|blue|amber)-\d{2,3}|border-(green|red|blue|amber)-\d{2,3}' src/app src/components src/config src/emails src/styles
```

Expected:

```text
No matches are allowed in src/app/globals.css, including high-contrast overrides.
Old brand hex values are allowed only in src/config/static-theme-colors.ts and explicit historical docs/tests.
Selected production UI files from the contract test have no matches.
Raw neutral utility classes such as text-neutral-600 in footer-style-tokens.ts are not part of this brand/status migration and may remain for now.
```

## Task 8: Visual smoke on buyer-facing pages

**Files:**
- Read: `src/app/[locale]/page.tsx`
- Read: `src/app/[locale]/contact/page.tsx`
- Read: `src/app/[locale]/products/page.tsx`
- Read: `src/app/[locale]/products/[market]/page.tsx`
- Read: `src/app/[locale]/oem-custom-manufacturing/page.tsx`

- [ ] **Step 1: Start local dev server**

Run in a dedicated terminal:

```bash
pnpm dev
```

Expected:

```text
The dev server starts and prints a local URL such as http://localhost:3000.
```

- [ ] **Step 2: Check English key pages**

Open these paths in the browser:

```text
http://localhost:3000/en
http://localhost:3000/en/products
http://localhost:3000/en/products/north-america
http://localhost:3000/en/oem-custom-manufacturing
http://localhost:3000/en/contact
```

Expected:

```text
Primary CTA is visible and has a consistent action color.
Hover states do not look washed out.
Card borders and muted backgrounds are subtle and consistent.
Contact form feedback and required markers use the same status language.
The site still feels like a restrained B2B manufacturer, not a generic SaaS app.
```

- [ ] **Step 3: Check Chinese key pages**

Open these paths in the browser:

```text
http://localhost:3000/zh
http://localhost:3000/zh/products
http://localhost:3000/zh/products/north-america
http://localhost:3000/zh/oem-custom-manufacturing
http://localhost:3000/zh/contact
```

Expected:

```text
Chinese text remains readable.
The color hierarchy matches the English pages.
No page has brand color drift or raw status-color patches.
```

- [ ] **Step 4: Check responsive states**

In the browser, check these viewport widths:

```text
390px mobile
768px tablet
1440px desktop
```

Expected:

```text
Navigation, CTAs, forms, cards, and scenario surfaces remain readable.
Focus rings remain visible.
No color contrast regression is obvious on mobile.
```

- [ ] **Step 5: Record visual smoke result**

Add a short note to the implementation PR body or branch handoff:

```markdown
Visual smoke checked:
- /en, /en/products, /en/products/north-america, /en/oem-custom-manufacturing, /en/contact
- /zh, /zh/products, /zh/products/north-america, /zh/oem-custom-manufacturing, /zh/contact
- 390px, 768px, 1440px
Result: no visible token migration regression found.
```

Expected:

```text
The visual result is recorded before merge or PR review request.
```

## Task 9: Final review, cleanup, and handoff

**Files:**
- Read: `git diff --stat`
- Read: `git diff`
- Read: `git log --oneline -8`

- [ ] **Step 1: Review final diff scope**

Run:

```bash
git diff --stat "$BASE_COMMIT"..HEAD
git diff --name-only "$BASE_COMMIT"..HEAD
```

Expected:

```text
Diff range uses the BASE_COMMIT recorded in Task 0, not HEAD~N.
Diff is limited to design-token migration, selected UI color cleanup, tests, and rules/docs.
No unrelated content, SEO, API, security, or product-copy files are included.
```

- [ ] **Step 2: Run final status check**

Run:

```bash
git status --short
```

Expected:

```text
git status --short prints no unstaged or uncommitted changes.
```

- [ ] **Step 3: Prepare PR summary**

Use this PR summary structure:

```markdown
## Summary

- Added a replaceable Radix-style Tianze color role system.
- Routed selected production UI status/action colors through semantic tokens.
- Added a static sRGB bridge for email and non-CSS surfaces.
- Updated agent rules and design-truth docs so future AI edits do not hard-code provisional colors.

## Verification

- pnpm exec vitest run tests/architecture/design-token-contract.test.ts src/components/forms/__tests__/form-status-styles.test.ts src/config/__tests__/static-theme-colors.test.ts src/components/ui/__tests__/button.test.tsx src/components/footer/__tests__/Footer.test.tsx
- pnpm type-check
- pnpm lint:check
- pnpm build
- pnpm build:cf
- Browser smoke on English and Chinese key pages at 390px, 768px, and 1440px

## Notes

- The current blue value remains provisional.
- The migration stabilizes color roles and lowers future brand-color adjustment cost.
- Radix Themes and `@radix-ui/colors` were intentionally not added.
```

Expected:

```text
The PR summary distinguishes stable role architecture from provisional color values.
```

- [ ] **Step 4: Stop if visual smoke finds brand-direction concerns**

If the visual smoke shows the site becoming too SaaS-like, too washed out, too dark, or less trustworthy, do not merge the branch. Record the failing pages and adjust primitive scale values in `src/app/globals.css` before changing component code.

Run after adjustments:

```bash
pnpm exec vitest run tests/architecture/design-token-contract.test.ts
pnpm build
```

Expected:

```text
The contract test and build stay green after primitive value adjustment.
```

## Self-review checklist

- Spec coverage: This plan covers runtime tokens, component cleanup, non-CSS surfaces, rules, design docs, canonical truth registry, tests, builds, and visual smoke.
- Placeholder scan: The plan contains no unresolved implementation placeholders.
- Type consistency: New exports are `STATIC_THEME_COLORS`, `FORM_STATUS_CLASS_NAMES`, and `FORM_FIELD_REQUIRED_CLASS_NAME`; every task uses these names consistently.
- Scope check: This is one cohesive migration workstream. It does not combine full rebrand, asset redesign, content rewrite, or Radix Themes adoption.

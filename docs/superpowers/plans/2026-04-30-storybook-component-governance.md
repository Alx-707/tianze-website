# Storybook Component Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small Storybook pilot plus component governance rules so AI agents reuse project UI components instead of inventing parallel implementations.

**Architecture:** Storybook is a dev-only component preview surface. Component governance lives in `docs/impeccable/system/COMPONENT-GOVERNANCE.md` and `.claude/rules/ui.md`, while lightweight architecture tests enforce the highest-value rules: Storybook coverage for core UI primitives and Radix imports staying inside the UI wrapper layer.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/Radix wrappers, Storybook Next.js Vite, Vitest architecture tests.

---

### Task 0: Branch and baseline

**Files:**
- Read: `package.json`
- Read: `.claude/rules/ui.md`
- Read: `.dependency-cruiser.js`
- Read: `src/components/ui/*.tsx`

- [x] **Step 1: Work on a feature branch**

Branch: `feat/storybook-component-governance`

- [ ] **Step 2: Record dirty baseline**

Run: `git status --short --branch`

Expected:
- current branch is `feat/storybook-component-governance`
- existing unrelated untracked plan file remains untouched
- pre-existing `src/components/forms/contact-form.tsx` comment edit is visible and must be either committed with this branch or separated by the final committer

### Task 1: Component governance rules

**Files:**
- Create: `docs/impeccable/system/COMPONENT-GOVERNANCE.md`
- Modify: `.claude/rules/ui.md`
- Modify: `docs/impeccable/system/COMPONENT-INVENTORY.md`

- [ ] **Step 1: Write governance doc**

Create a human-readable component governance document covering:
- component layers: UI primitives, composed business components, page sections, route pages
- reuse decision tree: reuse first, add variant second, create new component only with reason
- new component intake checklist
- Storybook story requirements
- Radix wrapper boundary
- AI reporting checklist

- [ ] **Step 2: Route UI agents to the governance doc**

Update `.claude/rules/ui.md` so UI work must read `docs/impeccable/system/COMPONENT-GOVERNANCE.md` when creating, changing, or reviewing reusable components.

- [ ] **Step 3: Update component inventory status**

Update `docs/impeccable/system/COMPONENT-INVENTORY.md` to state that it is a homepage/prototype inventory, and the reusable component governance source of truth is `COMPONENT-GOVERNANCE.md`.

### Task 2: Storybook pilot

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `.storybook/main.ts`
- Create: `.storybook/preview.ts`
- Create: `src/components/ui/button.stories.tsx`
- Create: `src/components/ui/badge.stories.tsx`
- Create: `src/components/ui/card.stories.tsx`
- Create: `src/components/ui/input.stories.tsx`
- Create: `src/components/ui/textarea.stories.tsx`
- Create: `src/components/ui/label.stories.tsx`

- [ ] **Step 1: Install Storybook Next.js Vite packages**

Add dev dependencies through pnpm, preferring `storybook` and `@storybook/nextjs-vite`.

- [ ] **Step 2: Add scripts**

Add scripts:
- `storybook`: local preview
- `storybook:build`: static Storybook build

- [ ] **Step 3: Configure Storybook**

Storybook must:
- load stories from `src/**/*.stories.@(ts|tsx|mdx)`
- use `@storybook/nextjs-vite`
- import project globals CSS through `preview.ts`
- define light/dark background options enough for early component review

- [ ] **Step 4: Add core UI stories**

Add first-batch stories for:
- Button
- Badge
- Card
- Input
- Textarea
- Label

Stories should show practical states, not every theoretical state.

### Task 3: Governance tests

**Files:**
- Create: `tests/architecture/component-governance.test.ts`

- [ ] **Step 1: Add failing tests first**

Test must verify:
- core UI components have colocated `.stories.tsx` files
- non-test production files outside `src/components/ui/` do not import `@radix-ui/*`

- [ ] **Step 2: Run the new test and verify failure before implementation if Task 2 has not yet created stories**

Run: `pnpm exec vitest run tests/architecture/component-governance.test.ts`

Expected before Task 2 story files exist: FAIL because stories are missing.

- [ ] **Step 3: Make tests pass after Storybook stories exist**

Run the same command.

Expected after Task 2: PASS.

### Task 4: Verification and commit

**Files:**
- All files touched by Tasks 1-3

- [ ] **Step 1: Run focused verification**

Run:
- `pnpm exec vitest run tests/architecture/component-governance.test.ts tests/architecture/design-token-contract.test.ts`
- `pnpm storybook:build`
- `pnpm type-check`

- [ ] **Step 2: Check final diff**

Run:
- `git diff --stat`
- `git status --short`

- [ ] **Step 3: Commit**

Commit message:
- `feat: add storybook component governance`

Do not include unrelated untracked files unless explicitly requested.

### Self-review

- Scope is intentionally small: Storybook pilot + governance, not full design-system migration.
- Contact form full Storybook integration is out of scope for this first pass.
- Visual regression/Chromatic is out of scope for this first pass.
- Product table tooling is out of scope because product specs do not need filtering or comparison.

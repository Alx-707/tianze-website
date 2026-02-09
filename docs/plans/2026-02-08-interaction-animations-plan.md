# Interaction Animations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add hover micro-interactions to homepage cards and buttons for a complete interaction layer.

**Architecture:** Pure CSS/Tailwind changes to existing components. No new components, no new hooks, no JS logic changes. Only class additions.

**Tech Stack:** Tailwind CSS 4 utility classes

---

### Task 1: ProductCard hover lift

**Files:**
- Modify: `src/components/sections/products-section.tsx:26`

**Step 1: Update ProductCard hover classes**

Change line 26 from:
```tsx
<div className="group rounded-lg bg-background p-6 shadow-card transition-shadow hover:shadow-[var(--shadow-card-active)]">
```
To:
```tsx
<div className="group rounded-lg bg-background p-6 shadow-card transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-active)]">
```

**Step 2: Run type-check + test**
```bash
pnpm type-check && pnpm test -- products-section
```

**Step 3: Visual verify in browser**

---

### Task 2: ScenarioCard hover lift + image scale

**Files:**
- Modify: `src/components/sections/scenarios-section.tsx:20,22`

**Step 1: Update ScenarioCard container**

Change line 20 from:
```tsx
<div className="group overflow-hidden rounded-lg bg-white shadow-card transition-shadow hover:shadow-card-hover">
```
To:
```tsx
<div className="group overflow-hidden rounded-lg bg-white shadow-card transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-card-hover">
```

**Step 2: Add image scale on card hover**

Change line 22 from:
```tsx
<div className="h-40 bg-gradient-to-br from-muted to-muted/60" />
```
To:
```tsx
<div className="h-40 bg-gradient-to-br from-muted to-muted/60 transition-transform duration-300 group-hover:scale-[1.02]" />
```

**Step 3: Run type-check + test**
```bash
pnpm type-check && pnpm test -- scenarios-section
```

---

### Task 3: ResourceCard arrow slide

**Files:**
- Modify: `src/components/sections/resources-section.tsx:117`

**Step 1: Add arrow transition**

Change line 117 from:
```tsx
<span className="mt-auto text-sm font-medium text-primary">&rarr;</span>
```
To:
```tsx
<span className="mt-auto inline-block text-sm font-medium text-primary transition-transform duration-150 group-hover:translate-x-1">&rarr;</span>
```

Note: `inline-block` is required for `transform` to work on `<span>`.

**Step 2: Verify ResourceCard is wrapped in `<a>` with group behavior**

The `<a>` at line 108-110 already acts as the group container. No additional `group` class needed since `<a>` is the root element — but we need to add `group` class to the `<a>` tag.

Change line 108-110 from:
```tsx
<a
  href={link}
  className="flex flex-col gap-3 bg-background p-6 transition-colors hover:bg-[var(--primary-50)]"
>
```
To:
```tsx
<a
  href={link}
  className="group flex flex-col gap-3 bg-background p-6 transition-colors hover:bg-[var(--primary-50)]"
>
```

**Step 3: Run type-check + test**
```bash
pnpm type-check && pnpm test -- resources-section
```

---

### Task 4: Button active press

**Files:**
- Modify: `src/components/ui/button.tsx:7`

**Step 1: Add active:scale to button base**

Change line 7 from:
```tsx
"inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[6px] text-sm font-semibold whitespace-nowrap transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
```
To:
```tsx
"inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[6px] text-sm font-semibold whitespace-nowrap transition-all duration-150 outline-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
```

**Step 2: Run button tests**
```bash
pnpm type-check && pnpm test -- button
```

---

### Task 5: QualitySection commitment card hover

**Files:**
- Modify: `src/components/sections/quality-section.tsx:131`

**Step 1: Add hover state to commitment cards**

Change line 131 from:
```tsx
<div key={key} className="bg-white p-5">
```
To:
```tsx
<div key={key} className="bg-white p-5 transition-colors duration-150 hover:bg-[var(--primary-50)]">
```

**Step 2: Run type-check + test**
```bash
pnpm type-check && pnpm test -- quality-section
```

---

### Task 6: Full verification + commit

**Step 1: Run full CI**
```bash
pnpm type-check && pnpm lint && pnpm test && pnpm build
```

**Step 2: Visual verification in browser**

Check each component:
- ProductCard: hover shows lift + blue ring
- ScenarioCard: hover shows lift + shadow + image scale
- ResourceCard: hover shows bg change + arrow slides right
- Buttons: click shows subtle press
- QualityCommitment: hover shows light blue bg

**Step 3: Commit**
```bash
git add src/components/sections/products-section.tsx
git add src/components/sections/scenarios-section.tsx
git add src/components/sections/resources-section.tsx
git add src/components/ui/button.tsx
git add src/components/sections/quality-section.tsx
git commit -m "feat(motion): add hover micro-interactions to homepage cards and buttons"
```

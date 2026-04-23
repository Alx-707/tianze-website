# Homepage Scroll Animations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add scroll-triggered entrance animations to all 8 homepage sections using existing infrastructure (useIntersectionObserver + CSS transitions).

**Architecture:** `<ScrollReveal>` wrapper component for scroll-triggered sections; CSS animation classes for Hero mount stagger. Zero new dependencies — leverages existing hooks and CSS tokens.

**Tech Stack:** React 19, Tailwind CSS 4, existing `useIntersectionObserver` / `useIntersectionObserverWithDelay` hooks, CSS keyframe animations.

---

### Task 1: Add animation CSS tokens and hero stagger classes

**Files:**
- Modify: `src/app/globals.css` (animation utilities section, lines ~607-683)

**Step 1: Add scroll-reveal CSS tokens**

In the `@theme inline` block (around line 155, after existing easing tokens), add:

```css
--scroll-reveal-distance: 20px;
--scroll-reveal-duration: 600ms;
--scroll-reveal-stagger: 80ms;
```

**Step 2: Add hero-stagger utility classes**

After the existing animation utilities block (after line 641), add:

```css
/* Hero stagger — mount-triggered entrance sequence */
.hero-stagger-1 { animation: slideUp 500ms var(--ease-out) 0ms both; }
.hero-stagger-2 { animation: slideUp 500ms var(--ease-out) 80ms both; }
.hero-stagger-3 { animation: slideUp 500ms var(--ease-out) 160ms both; }
.hero-stagger-4 { animation: slideUp 500ms var(--ease-out) 240ms both; }
.hero-stagger-5 { animation: slideUp 500ms var(--ease-out) 320ms both; }
.hero-stagger-6 { animation: slideUp 600ms var(--ease-out) 200ms both; }
```

**Step 3: Verify existing slideUp keyframe**

Confirm `@keyframes slideUp` already exists (lines 652-661) with `opacity 0→1` + `translateY(8px)→0`. ✓ Already present.

**Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(animation): add scroll-reveal tokens and hero stagger CSS classes"
```

---

### Task 2: Create ScrollReveal component with tests

**Files:**
- Create: `src/components/ui/scroll-reveal.tsx`
- Create: `src/components/ui/__tests__/scroll-reveal.test.tsx`

**Step 1: Write the failing tests**

Create `src/components/ui/__tests__/scroll-reveal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScrollReveal } from "../scroll-reveal";

// Mock the intersection observer hook
const mockUseIntersectionObserver = vi.fn();
const mockUseIntersectionObserverWithDelay = vi.fn();

vi.mock("@/hooks/use-intersection-observer", () => ({
  useIntersectionObserver: (...args: unknown[]) =>
    mockUseIntersectionObserver(...args),
  useIntersectionObserverWithDelay: (...args: unknown[]) =>
    mockUseIntersectionObserverWithDelay(...args),
}));

// Default mock: not yet visible
function setupMock(isVisible = false) {
  const ref = vi.fn();
  mockUseIntersectionObserver.mockReturnValue({
    ref,
    isVisible,
    hasBeenVisible: isVisible,
  });
  mockUseIntersectionObserverWithDelay.mockReturnValue({
    ref,
    isVisible,
    hasBeenVisible: isVisible,
  });
}

describe("ScrollReveal", () => {
  it("renders children", () => {
    setupMock(true);
    render(<ScrollReveal>Hello World</ScrollReveal>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("applies hidden state classes when not visible", () => {
    setupMock(false);
    const { container } = render(
      <ScrollReveal>Content</ScrollReveal>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("opacity-0");
    expect(wrapper).toHaveClass("translate-y-5");
  });

  it("applies visible state classes when visible", () => {
    setupMock(true);
    const { container } = render(
      <ScrollReveal>Content</ScrollReveal>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("opacity-100");
    expect(wrapper).toHaveClass("translate-y-0");
  });

  it("supports direction=fade (no translate)", () => {
    setupMock(false);
    const { container } = render(
      <ScrollReveal direction="fade">Content</ScrollReveal>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("opacity-0");
    expect(wrapper).not.toHaveClass("translate-y-5");
  });

  it("supports direction=scale", () => {
    setupMock(false);
    const { container } = render(
      <ScrollReveal direction="scale">Content</ScrollReveal>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("scale-[0.97]");
  });

  it("uses delay hook when delay > 0", () => {
    setupMock(false);
    render(<ScrollReveal delay={100}>Content</ScrollReveal>);
    expect(mockUseIntersectionObserverWithDelay).toHaveBeenCalled();
  });

  it("computes delay from staggerIndex", () => {
    setupMock(false);
    render(<ScrollReveal staggerIndex={2}>Content</ScrollReveal>);
    expect(mockUseIntersectionObserverWithDelay).toHaveBeenCalledWith(
      expect.any(Object),
      160, // 2 * 80ms default stagger
    );
  });

  it("renders as specified HTML tag", () => {
    setupMock(true);
    const { container } = render(
      <ScrollReveal as="section">Content</ScrollReveal>,
    );
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  it("passes className through", () => {
    setupMock(true);
    const { container } = render(
      <ScrollReveal className="custom-class">Content</ScrollReveal>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("includes transition classes", () => {
    setupMock(false);
    const { container } = render(
      <ScrollReveal>Content</ScrollReveal>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("transition-[opacity,transform]");
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/components/ui/__tests__/scroll-reveal.test.tsx`
Expected: FAIL — module not found

**Step 3: Write ScrollReveal component**

Create `src/components/ui/scroll-reveal.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";
import {
  useIntersectionObserver,
  useIntersectionObserverWithDelay,
} from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";
import { ZERO } from "@/constants";

const DEFAULT_STAGGER_INTERVAL = 80;
const DEFAULT_THRESHOLD = 0.15;

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "fade" | "scale";
  delay?: number;
  staggerIndex?: number;
  staggerInterval?: number;
  threshold?: number;
  as?: "div" | "section" | "article";
  className?: string;
}

/** Hidden-state classes by direction */
const HIDDEN_CLASSES: Record<string, string> = {
  up: "opacity-0 translate-y-5",
  down: "opacity-0 -translate-y-5",
  fade: "opacity-0",
  scale: "opacity-0 scale-[0.97]",
};

/** Visible-state classes by direction */
const VISIBLE_CLASSES: Record<string, string> = {
  up: "opacity-100 translate-y-0",
  down: "opacity-100 translate-y-0",
  fade: "opacity-100",
  scale: "opacity-100 scale-100",
};

export function ScrollReveal({
  children,
  direction = "up",
  delay,
  staggerIndex,
  staggerInterval = DEFAULT_STAGGER_INTERVAL,
  threshold = DEFAULT_THRESHOLD,
  as: Tag = "div",
  className,
}: ScrollRevealProps) {
  const computedDelay =
    delay ?? (staggerIndex !== undefined ? staggerIndex * staggerInterval : ZERO);

  const observerOptions = { threshold, triggerOnce: true };

  const { ref, isVisible } =
    computedDelay > ZERO
      ? useIntersectionObserverWithDelay(observerOptions, computedDelay)
      : useIntersectionObserver(observerOptions);

  return (
    <Tag
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-[600ms] ease-out",
        isVisible ? VISIBLE_CLASSES[direction] : HIDDEN_CLASSES[direction],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
```

**Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/components/ui/__tests__/scroll-reveal.test.tsx`
Expected: ALL PASS

**Step 5: Type check**

Run: `pnpm type-check`
Expected: No errors

**Step 6: Commit**

```bash
git add src/components/ui/scroll-reveal.tsx src/components/ui/__tests__/scroll-reveal.test.tsx
git commit -m "feat(animation): add ScrollReveal component with tests"
```

---

### Task 3: Add Hero section stagger animation

**Files:**
- Modify: `src/components/sections/hero-section.tsx`

**Step 1: Add stagger classes to hero elements**

Each direct child element in the hero gets a `hero-stagger-N` class:

```diff
 function HeroEyebrow({ text }: { text: string }) {
   return (
-    <div className="flex items-center gap-2">
+    <div className="hero-stagger-1 flex items-center gap-2">
```

In `HeroSection()`:
```diff
-          <h1 className="mt-4 text-[36px] ...">
+          <h1 className="hero-stagger-2 mt-4 text-[36px] ...">

-          <p className="mt-4 max-w-[480px] text-lg text-muted-foreground">
+          <p className="hero-stagger-3 mt-4 max-w-[480px] text-lg text-muted-foreground">

-          <div className="mt-7 flex flex-wrap gap-3">
+          <div className="hero-stagger-4 mt-7 flex flex-wrap gap-3">
```

In `ProofBar`:
```diff
-    <div className="mt-7 flex flex-wrap gap-6 border-t ...">
+    <div className="hero-stagger-5 mt-7 flex flex-wrap gap-6 border-t ...">
```

In `HeroVisual`:
```diff
-    <div className="grid grid-cols-2 grid-rows-[180px_160px] gap-3">
+    <div className="hero-stagger-6 grid grid-cols-2 grid-rows-[180px_160px] gap-3">
```

**Step 2: Verify E2E tests still pass**

Run: `pnpm vitest run src/components/sections/` (unit tests)
Run: verify existing tests aren't broken with: `pnpm test`

**Step 3: Commit**

```bash
git add src/components/sections/hero-section.tsx
git commit -m "feat(animation): add stagger entrance animation to hero section"
```

---

### Task 4: Add ScrollReveal to ChainSection + SampleCTA + FinalCTA

These three sections use a single `<ScrollReveal>` wrapper (no card stagger).

**Files:**
- Modify: `src/components/sections/chain-section.tsx`
- Modify: `src/components/sections/sample-cta.tsx`
- Modify: `src/components/sections/final-cta.tsx`

**Step 1: Wrap ChainSection inner content**

```diff
+import { ScrollReveal } from "@/components/ui/scroll-reveal";

 export function ChainSection() {
   ...
   return (
     <section className="section-divider py-14 md:py-[72px]">
-      <div className="mx-auto max-w-[1080px] px-6">
+      <ScrollReveal className="mx-auto max-w-[1080px] px-6">
         <SectionHead ... />
         {/* Steps grid */}
         ...
         {/* Stats */}
         ...
-      </div>
+      </ScrollReveal>
     </section>
   );
 }
```

**Step 2: Wrap SampleCTA inner content**

```diff
+import { ScrollReveal } from "@/components/ui/scroll-reveal";

 export function SampleCTA() {
   ...
   return (
     <section className="section-divider py-14 md:py-[72px]">
-      <div className="mx-auto max-w-[1080px] px-6">
+      <ScrollReveal className="mx-auto max-w-[1080px] px-6">
         <div className="flex flex-col ...">
           ...
         </div>
-      </div>
+      </ScrollReveal>
     </section>
   );
 }
```

**Step 3: Wrap FinalCTA inner content (fade direction)**

```diff
+import { ScrollReveal } from "@/components/ui/scroll-reveal";

 export function FinalCTA() {
   ...
   return (
     <section className="bg-primary py-14 md:py-[72px]">
-      <div className="mx-auto max-w-[1080px] px-6 text-center">
+      <ScrollReveal direction="fade" className="mx-auto max-w-[1080px] px-6 text-center">
         ...
-      </div>
+      </ScrollReveal>
     </section>
   );
 }
```

**Step 4: Run tests**

Run: `pnpm test`
Expected: All pass

**Step 5: Commit**

```bash
git add src/components/sections/chain-section.tsx src/components/sections/sample-cta.tsx src/components/sections/final-cta.tsx
git commit -m "feat(animation): add scroll-reveal to chain, sample-cta, and final-cta sections"
```

---

### Task 5: Add ScrollReveal with card stagger to ProductsSection

**Files:**
- Modify: `src/components/sections/products-section.tsx`

**Step 1: Add imports and wrap SectionHead**

```diff
+import { ScrollReveal } from "@/components/ui/scroll-reveal";

 export function ProductsSection() {
   ...
   return (
     <section className="section-divider py-14 md:py-[72px]">
       <div className="mx-auto max-w-[1080px] px-6">
-        <SectionHead ... />
-        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
-          {products.map((product) => (
-            <ProductCard key={product.tag} {...product} />
+        <ScrollReveal>
+          <SectionHead ... />
+        </ScrollReveal>
+        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
+          {products.map((product, index) => (
+            <ScrollReveal key={product.tag} staggerIndex={index}>
+              <ProductCard {...product} />
+            </ScrollReveal>
           ))}
         </div>
       </div>
     </section>
   );
 }
```

**Step 2: Run tests**

Run: `pnpm test`
Expected: All pass

**Step 3: Commit**

```bash
git add src/components/sections/products-section.tsx
git commit -m "feat(animation): add scroll-reveal with card stagger to products section"
```

---

### Task 6: Add ScrollReveal with card stagger to ResourcesSection

**Files:**
- Modify: `src/components/sections/resources-section.tsx`

**Step 1: Wrap SectionHead + stagger cards**

Same pattern as Task 5. Wrap `<SectionHead>` in `<ScrollReveal>`, wrap each `<ResourceCard>` in `<ScrollReveal staggerIndex={index}>`.

Note: ResourceCard is an `<a>` tag inside a grid with `gap-[2px]` borders. The ScrollReveal wrapper (div) goes **inside** the grid, so each cell becomes `<ScrollReveal><ResourceCard /></ScrollReveal>`.

```diff
+import { ScrollReveal } from "@/components/ui/scroll-reveal";

 export function ResourcesSection() {
   ...
   return (
     <section className="section-divider py-14 md:py-[72px]">
       <div className="mx-auto max-w-[1080px] px-6">
-        <SectionHead ... />
+        <ScrollReveal>
+          <SectionHead ... />
+        </ScrollReveal>
         <div className="overflow-hidden rounded-lg border bg-border">
           <div className="grid grid-cols-1 gap-[2px] sm:grid-cols-2 lg:grid-cols-4">
-            {resources.map((resource) => (
-              <ResourceCard key={resource.title} {...resource} />
+            {resources.map((resource, index) => (
+              <ScrollReveal key={resource.title} staggerIndex={index}>
+                <ResourceCard {...resource} />
+              </ScrollReveal>
             ))}
           </div>
         </div>
       </div>
     </section>
   );
 }
```

**Step 2: Run tests + commit**

```bash
pnpm test
git add src/components/sections/resources-section.tsx
git commit -m "feat(animation): add scroll-reveal with card stagger to resources section"
```

---

### Task 7: Add ScrollReveal with card stagger to ScenariosSection

**Files:**
- Modify: `src/components/sections/scenarios-section.tsx`

**Step 1: Same pattern as Task 5**

```diff
+import { ScrollReveal } from "@/components/ui/scroll-reveal";

 export function ScenariosSection() {
   ...
   return (
     <section className="py-14 md:py-[72px]">
       <div className="mx-auto max-w-[1080px] px-6">
-        <SectionHead ... />
+        <ScrollReveal>
+          <SectionHead ... />
+        </ScrollReveal>
         <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
-          {SCENARIO_KEYS.map((key) => (
-            <div key={key} className="group overflow-hidden ...">
+          {SCENARIO_KEYS.map((key, index) => (
+            <ScrollReveal key={key} staggerIndex={index}>
+              <div className="group overflow-hidden ...">
               ...
-            </div>
+              </div>
+            </ScrollReveal>
           ))}
         </div>
       </div>
     </section>
   );
 }
```

**Step 2: Run tests + commit**

```bash
pnpm test
git add src/components/sections/scenarios-section.tsx
git commit -m "feat(animation): add scroll-reveal with card stagger to scenarios section"
```

---

### Task 8: Add ScrollReveal with card stagger to QualitySection

**Files:**
- Modify: `src/components/sections/quality-section.tsx`

**Step 1: Wrap SectionHead, commitment cards with stagger, cert badges with stagger**

```diff
+import { ScrollReveal } from "@/components/ui/scroll-reveal";

 export function QualitySection() {
   ...
   return (
     <section className="py-14 md:py-[72px]">
       <div className="mx-auto max-w-[1080px] px-6">
-        <SectionHead ... />
+        <ScrollReveal>
+          <SectionHead ... />
+        </ScrollReveal>

         {/* Commitments grid */}
-        <div className="grid ... overflow-hidden rounded-lg border bg-border ...">
-          {COMMITMENT_KEYS.map((key) => (
-            <div key={key} className="bg-white p-5">
+        <div className="overflow-hidden rounded-lg border bg-border ...">
+          <div className="grid ...">
+            {COMMITMENT_KEYS.map((key, index) => (
+              <ScrollReveal key={key} staggerIndex={index}>
+                <div className="bg-white p-5">
                 ...
-            </div>
-          ))}
+                </div>
+              </ScrollReveal>
+            ))}
+          </div>
         </div>

         {/* Cert badges */}
-        <div className="mt-8 flex flex-wrap items-center gap-4">
+        <ScrollReveal className="mt-8 flex flex-wrap items-center gap-4">
           ...
-        </div>
+        </ScrollReveal>

         {/* Logo wall placeholder */}
-        <div className="mt-8 ...">
+        <ScrollReveal className="mt-8 ...">
           ...
-        </div>
+        </ScrollReveal>
       </div>
     </section>
   );
 }
```

**Step 2: Run tests + commit**

```bash
pnpm test
git add src/components/sections/quality-section.tsx
git commit -m "feat(animation): add scroll-reveal with card stagger to quality section"
```

---

### Task 9: Full verification

**Step 1: Type check**

Run: `pnpm type-check`
Expected: 0 errors

**Step 2: Lint**

Run: `pnpm lint`
Expected: 0 production errors

**Step 3: Full test suite**

Run: `pnpm test`
Expected: All pass

**Step 4: Build**

Run: `pnpm build`
Expected: Success

**Step 5: Update progress**

Record results in `docs/plans/progress.md`.

---

## Execution Notes

- All sections are `"use client"` — `ScrollReveal` (also `"use client"`) can be imported directly
- `ScrollReveal` replaces `<div>` wrappers — no extra DOM nesting where it replaces existing containers
- Card stagger adds wrapper `<div>` inside grid cells — verify visual layout isn't broken
- `prefers-reduced-motion` handled by existing hook — elements appear immediately without animation
- E2E tests already disable animations — should not be affected

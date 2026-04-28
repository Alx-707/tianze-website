# Lane 03 - UI / Performance / Accessibility

## 1. Scope

This lane audited buyer-visible UI, performance, and accessibility risk on the clean Audit Run 1 baseline:

- home page
- products listing and product market pages
- contact page and form
- about page shell
- mobile navigation
- form accessibility
- image usage
- animation/loading behavior
- available performance/a11y proof hooks

Lane boundary: read-only. No business code, content, config, dependency, workflow, build script, or public asset was intentionally modified.

Lane conclusion:

- A first-time buyer can statically see the basic story: Tianze identity, product categories, catalog CTA, quote CTA, and contact route are all present.
- No P0/P1 buyer-visible blocker was proven by this lane.
- The main confirmed UI/accessibility issue is density: several mobile/touch controls are visually smaller than the common 44px touch-target guideline.
- Stronger runtime performance claims are blocked in this worker because there was no local server on port 3000 and no `.next` artifact available; `pnpm build` / `pnpm build:cf` are explicitly owned by Lane 00.
- Existing targeted component tests passed, but the Playwright axe helper is currently a false-confidence wrapper because it does not assert returned violations.

## 2. Fresh Evidence Collected

| Evidence ID | Type | Exact reference | Result | Notes |
| --- | --- | --- | --- | --- |
| E-L03-001 | file | `src/components/ui/button.tsx:27-30`; copied to `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/button-touch-targets.txt` | Button sizes are `h-[38px]`, `h-8`, `h-10`, and `size-9`, so common CTA/icon controls are below 44px. | Static evidence only; runtime rendered box measurements still needed for exact viewport proof. |
| E-L03-002 | file | `src/components/layout/mobile-navigation.tsx:50-70`; copied to `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/mobile-navigation-touch-targets.txt` | Mobile menu links use `px-3 py-2 text-sm`, and CTA uses same vertical padding. | Text line-height plus padding likely renders around 36px. |
| E-L03-003 | file | `src/components/layout/mobile-navigation-interactive.tsx:157-178`; copied to `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/mobile-navigation-interactive.txt` | Mobile language options use `px-3 py-2 text-sm`. | Same touch-density pattern as main mobile nav. |
| E-L03-004 | file | `src/components/products/sticky-family-nav.tsx:22-28`; copied to `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/sticky-family-nav-touch-targets.txt` | Product family jump links use `px-3 py-1.5 text-sm` in a horizontal scroller. | Product-page mobile navigation is especially dense. |
| E-L03-005 | command | `pnpm exec vitest run src/components/forms/__tests__/contact-form-accessibility.test.tsx src/components/layout/__tests__/mobile-navigation-items-accessibility.test.tsx src/components/layout/__tests__/mobile-navigation-responsive.test.tsx src/components/__tests__/responsive-layout.test.tsx`; output in `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/targeted-vitest-a11y-responsive.txt` | Passed: 4 files, 67 tests. | Component-level proof only; not a browser/axe/Lighthouse proof. Vitest also emitted ignored `reports/test-results.json`; not used as final evidence. |
| E-L03-006 | file | `tests/e2e/helpers/axe.ts:31-37`; copied to `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/e2e-axe-helper.txt` | `checkA11y` calls `builder.analyze()` but does not inspect/assert `violations`; it also ignores `_context` and `_options`. | This proves the helper is not currently a failing a11y gate. |
| E-L03-007 | file | `tests/e2e/homepage.spec.ts:314-317`; copied to `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/homepage-axe-usage.txt` | Homepage test calls `checkA11y`. | Because the helper does not assert, this usage can pass despite violations. |
| E-L03-008 | file | `tests/e2e/navigation.spec.ts:460-491`; copied to `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/navigation-axe-usage.txt` | Navigation tests call `checkA11y` with context/options. | The helper ignores both arguments. |
| E-L03-009 | file | `src/app/globals.css:650-670`; copied to `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/globals-animation-responsive.txt` | Hero stagger classes animate opacity/transform with 700-800ms durations and 0-400ms delays. | Reduced-motion fallback exists at `src/app/globals.css:371-389`. |
| E-L03-010 | file | `src/components/sections/hero-section.tsx:83-112`; copied to `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/hero-section-animation-usage.txt` | Hero title, subtitle, CTA, proof strip, and visual all use `hero-stagger-*` classes. | Static proof of entrance animation on first viewport. |
| E-L03-011 | command | `find .next -maxdepth 3 -type f \( -name '*.js' -o -name '*.css' -o -name '*.html' \)`; output in `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/next-artifacts-scan.txt` | Failed with `find: .next: No such file or directory`. | Runtime/bundle artifact inspection blocked; Lane 03 must not run `pnpm build`. |
| E-L03-012 | command | `lsof -nP -iTCP:3000 -sTCP:LISTEN`; output in `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/local-port-3000-check.txt` | Failed with no output, meaning no local listener was available on port 3000. | Browser screenshots and Lighthouse were not run. |
| E-L03-013 | file | `lighthouserc.js:50-109`; copied to `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/lighthouserc-current.txt` | Lighthouse config exists and expects `pnpm start` plus localhost URLs. | It needs a built app/server owned by Lane 00 or a provided URL. |
| E-L03-014 | command | `rg -n "<Image|next/image|<img|alt=|priority=|sizes=" src/app src/components`; output in `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/image-usage-scan.txt` | Current product/trust/equipment image usage generally uses `next/image`, `alt`, and `sizes`; logo uses a deliberate static `<img>` with alt. | No missing-alt P1 was proven statically. |
| E-L03-015 | command | `find public -maxdepth 4 -type f | sort`; output in `docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility/public-assets-list.txt` | Public image assets are mostly SVG product/hero placeholders plus a small set of JPG OG/blog images. | No asset-size claim made without `.next` or runtime waterfall. |

## 3. Commands Run

| Command | Result | Classification |
| --- | --- | --- |
| `git rev-parse origin/main` | passed | diagnostic |
| `git rev-parse HEAD` | passed | diagnostic |
| `git status --short --branch --untracked-files=all` | passed | diagnostic |
| `git diff --name-only origin/main...HEAD -- ':!docs/audits/full-project-health-v1/**' ':!docs/superpowers/plans/2026-04-27-full-project-health-audit-v1-conductor.md' ':!.context/audits/full-project-health-v1/**'` | passed | diagnostic |
| `git status --short --untracked-files=all -- ':!docs/audits/full-project-health-v1/**' ':!docs/superpowers/plans/2026-04-27-full-project-health-audit-v1-conductor.md' ':!.context/audits/full-project-health-v1/**'` | passed | diagnostic |
| `mkdir -p docs/audits/full-project-health-v1/evidence/03-ui-performance-accessibility docs/audits/full-project-health-v1/evidence/screenshots/03-ui-performance-accessibility .context/audits/full-project-health-v1` | passed | diagnostic |
| `find src/app -maxdepth 3 -type f | sort` | passed | diagnostic |
| `find src/components -maxdepth 3 -type f | sort` | passed | diagnostic |
| `node -e "const p=require('./package.json'); console.log(JSON.stringify({scripts:p.scripts, deps:p.dependencies, devDeps:p.devDependencies}, null, 2))"` | passed | diagnostic |
| `rg -n "<Image|next/image|<img|alt=|priority|loading=|fill|sizes=" src/app src/components` | passed | diagnostic |
| `rg -n "aria-|role=|sr-only|Dialog|Sheet|NavigationMenu|button|<a |href=|onClick|tabIndex" src/components src/app/[locale]` | failed | diagnostic |
| `rg -n "motion|animate-|transition|duration-|setInterval|requestAnimationFrame|scroll|IntersectionObserver|will-change|backdrop-blur|blur-|opacity|transform" src/components src/app/[locale]` | failed | diagnostic |
| `rg -n "w-\[|h-\[|min-w-|max-w-|overflow-x|fixed|sticky|grid-cols|sm:|md:|lg:|xl:|2xl:|hidden md|md:hidden|text-xs|size-\d|h-\d|w-\d" src/components src/app/[locale]` | failed | diagnostic |
| `pnpm exec vitest run src/components/forms/__tests__/contact-form-accessibility.test.tsx src/components/layout/__tests__/mobile-navigation-items-accessibility.test.tsx src/components/layout/__tests__/mobile-navigation-responsive.test.tsx src/components/__tests__/responsive-layout.test.tsx` | passed | diagnostic |
| `test -d .next/static` | failed | environment-blocked |
| `find .next -maxdepth 3 -type f \( -name '*.js' -o -name '*.css' -o -name '*.html' \)` | failed | environment-blocked |
| `find public -maxdepth 4 -type f | sort` | passed | diagnostic |
| `find . -maxdepth 2 -name 'lighthouserc*' -o -name '*lighthouse*'` | passed | diagnostic |
| `lsof -nP -iTCP:3000 -sTCP:LISTEN` | failed | environment-blocked |
| `rg -n "<Image|next/image|<img|alt=|priority=|sizes=" src/app src/components` | passed | diagnostic |
| `rg -n "h-8|h-9|size-9|py-1\.5|py-2|px-3 py-2|h-4 w-4|size-4" src/components src/app` | passed | diagnostic |

Note: three early `rg` commands failed because zsh expanded the unquoted `src/app/[locale]` path. The audit did not rely on those failed outputs; later reads used quoted paths or broader `src/app src/components` scans.

## 4. Findings

### FPH-L03-001: Mobile and touch controls are visually too dense for easy buyer tapping

- Severity: P2
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: accessibility
- Source lane: 03-ui-performance-accessibility
- Evidence:
  - type: file
    reference: `src/components/ui/button.tsx:27-30`
    summary: Shared button variants render as `h-[38px]`, `h-8`, `h-10`, and `size-9`, below the common 44px touch-target guideline.
  - type: file
    reference: `src/components/layout/mobile-navigation.tsx:50-70`
    summary: Mobile navigation links and CTA use `px-3 py-2 text-sm`, likely around 36px tall.
  - type: file
    reference: `src/components/layout/mobile-navigation-interactive.tsx:157-178`
    summary: Mobile language links use the same `px-3 py-2 text-sm` density.
  - type: file
    reference: `src/components/products/sticky-family-nav.tsx:22-28`
    summary: Product family jump links use `px-3 py-1.5 text-sm`, even smaller than the mobile menu rows.
- Business impact: On phones, buyers scanning product families or opening the menu have less forgiving tap areas. This does not block the inquiry path, but it increases mis-taps and makes the site feel less easy to use for procurement users on mobile.
- Root cause: Shared UI defaults optimize for desktop density first, and product/mobile navigation reuses compact padding instead of a separate touch-sized variant.
- Recommended fix: Add a touch-size rule for mobile-critical controls: keep visual density if desired, but ensure the clickable box is at least 44px high for mobile menu rows, sticky product-family links, icon buttons, and primary CTAs.
- Verification needed: Run a browser-level mobile viewport check measuring rendered bounding boxes for `/en`, `/en/products`, `/en/products/north-america`, and `/en/contact`; then rerun targeted mobile navigation tests.
- Suggested Linus Gate: Simplify

### FPH-L03-002: Playwright axe accessibility checks do not currently fail on violations

- Severity: P2
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: accessibility
- Source lane: 03-ui-performance-accessibility
- Evidence:
  - type: file
    reference: `tests/e2e/helpers/axe.ts:31-37`
    summary: `checkA11y` constructs `AxeBuilder`, calls `builder.analyze()`, and returns without asserting the `violations` array.
  - type: file
    reference: `tests/e2e/helpers/axe.ts:31-37`
    summary: The helper ignores `_context` and `_options`, so caller-provided scan scope, disabled rules, and included impacts are not applied.
  - type: file
    reference: `tests/e2e/homepage.spec.ts:314-317`
    summary: Homepage test calls `checkA11y`, but the helper cannot fail the test based on violations.
  - type: file
    reference: `tests/e2e/navigation.spec.ts:460-491`
    summary: Navigation tests pass context/options into `checkA11y`, but the helper discards them.
- Business impact: The project may believe it has browser-level accessibility coverage when it actually has a smoke call. Real buyer-facing issues such as missing labels, bad contrast, or focus problems can slip through until manual review.
- Root cause: The migration wrapper for `@axe-core/playwright` preserved the old helper signature but did not finish the enforcement step.
- Recommended fix: Make `checkA11y` apply context/options and assert no unapproved `violations`; keep any intentional suppressions explicit in the call site.
- Verification needed: Add a small failing fixture or temporary local page with a known axe violation to prove the helper fails, then run the existing homepage/navigation a11y e2e checks against a built local server.
- Suggested Linus Gate: Needs proof

### FPH-L03-003: Hero entrance animation adds first-viewport motion before runtime performance proof exists

- Severity: P3
- Evidence level: Confirmed by static evidence
- Confidence: medium
- Domain: performance
- Source lane: 03-ui-performance-accessibility
- Evidence:
  - type: file
    reference: `src/components/sections/hero-section.tsx:83-112`
    summary: Hero title, subtitle, CTA row, proof strip, and visual grid all use `hero-stagger-*` classes.
  - type: file
    reference: `src/app/globals.css:650-670`
    summary: `hero-stagger-*` applies 700-800ms opacity/transform animations with 0-400ms staggered delays.
  - type: file
    reference: `src/app/globals.css:371-389`
    summary: Reduced-motion support exists, so this is not an accessibility blocker.
- Business impact: The first screen is intentionally animated before the buyer starts reading. It probably looks polished, but it can also make the page feel slightly slower and can complicate LCP/perceived-speed debugging.
- Root cause: The hero treats entrance animation as a default visual pattern rather than something proven harmless by Lighthouse/Web Vitals evidence.
- Recommended fix: Keep the hero headline and primary CTA immediately visible, or shorten/remove only the above-the-fold stagger while leaving below-fold reveal effects intact.
- Verification needed: Run Lighthouse or Playwright Web Vitals before/after on `/en` and `/zh`, comparing LCP, FCP, Speed Index, and visual screenshots.
- Suggested Linus Gate: Keep

## 5. Blocked / Not Proven

| Claim | Blocker | Needed proof | Suggested classification |
| --- | --- | --- | --- |
| Exact Lighthouse/PageSpeed/Core Web Vitals score for `/en`, `/zh`, `/en/products`, `/en/contact` | No `.next` build artifact was present, no local server was listening on port 3000, and Lane 03 must not run `pnpm build` or `pnpm build:cf`. | Lane 00-provided build/server, or a safe preview URL, then `pnpm perf:lighthouse` or an approved Lighthouse/PageSpeed run. | Blocked |
| Real mobile screenshots for home/products/contact/about | No local browser target/server was available. Starting a dev/build server would cross the lane's write/build boundary. | Existing local server or orchestrator-approved preview URL; screenshots saved under `docs/audits/full-project-health-v1/evidence/screenshots/03-ui-performance-accessibility/`. | Blocked |
| Real deployed performance and CrUX field data | Requires external URL/data and possibly Google/PageSpeed access; none was provided to this lane. | PageSpeed/CrUX API access or official report for the production/preview URL. | Blocked |
| Actual asset transfer size and JS chunk cost | `.next` was absent and this lane cannot build. | Lane 00 build artifact or a deployed runtime waterfall. | Blocked |
| Whether the hero animation measurably hurts LCP | Static evidence proves animation exists but not performance impact. | Fresh Lighthouse/Web Vitals comparison with and without above-fold stagger. | Needs proof |

## 6. Handoff to Orchestrator

| Finding ID | Handoff action | Reason |
| --- | --- | --- |
| FPH-L03-001 | challenge | Confirm whether the final audit wants to enforce 44px touch targets as a launch-quality rule. If yes, merge as P2; if only strict WCAG 2.2 AA minimum is enforced, downgrade to P3. |
| FPH-L03-002 | merge | This is confirmed static evidence and explains why browser-level accessibility confidence is weaker than it looks. May dedupe with Lane 05 tests/proof-quality findings. |
| FPH-L03-003 | keep | Keep as P3 only unless Lane 00 or orchestrator later supplies Lighthouse/Web Vitals evidence showing measurable damage. |

## 7. Process Notes

- I used the `audit` skill as a diagnostic checklist only; no auto-fix or `optimize` action was run.
- I did not run `pnpm build`, `pnpm build:cf`, deploy commands, or production-mutating commands.
- I did not write screenshots because there was no local server/browser target available.
- Targeted Vitest passed and is useful smoke evidence, but it is not a substitute for browser-level axe and Lighthouse evidence.
- The `pnpm exec vitest ...` run printed that it wrote `reports/test-results.json`; that path is ignored by `git status` in this workspace and was not used as final evidence.
- Other workers' evidence files were present in `git status`; I did not edit or move them.

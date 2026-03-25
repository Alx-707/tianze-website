# Plan Review: Distributed FAQ + Core Numbers
**Plan File**: docs/superpowers/plans/2026-03-25-distributed-faq-and-core-numbers.md
**Reviewer**: Codex

---

## Round 1 — 2026-03-25

## Overall Assessment (Rating: 5/10)

The plan has a solid direction (a reusable FAQ section, distributed placement, and a single source of truth for company numbers), but it currently has several “this will break mid-way” sequencing problems and a few direct mismatches with the BDD requirements and the design handoff. As written, a careful engineer could still implement it, but they would have to correct multiple gaps and inconsistencies along the way.

## Issues

### 1) Critical — Sequencing will break `/faq` before it is deleted
- **Plan location**: Task 1 → Step 1 (lines 57–60) + Execution Order Summary (lines 765–773).
- **Description**: The plan removes/replaces the existing `faq` translation structure early (“Remove the existing `faq` block…”) while the standalone `/faq` route is only deleted later (Task 7). If the current `/faq` page reads those existing keys, this creates an “in-between” state where builds/tests can start failing before route cleanup happens.
- **Improvement suggestion**: Either (a) move Task 7 (route removal) *before* Task 1’s key removal, or (b) keep backwards-compatible keys until the `/faq` route is deleted and all references are removed (then delete the old keys at the end).

### 2) High — The plan does not implement the required chevron + rotation behavior
- **Plan location**: Task 2 → Step 1 tests (lines 205–222) + Task 2 → Step 3 `FaqAccordion` code (lines 318–358).
- **Description**: BDD Scenario 1.3 requires “a chevron icon rotates to indicate open state,” but the proposed `FaqAccordion` doesn’t render an icon at all, and the tests don’t assert it.
- **Improvement suggestion**: Add a chevron icon inside each trigger, and rotate it based on Radix’s `data-state=open` attribute (plus add a test that checks the icon rotation class changes when opened).

### 3) High — Mobile touch target requirement is implemented with the wrong breakpoint
- **Plan location**: Task 2 → Step 3 `FaqAccordion` code (line 345).
- **Description**: The plan uses `sm:min-h-[44px]`, which applies the 44px minimum height only on larger screens, not on mobile. This conflicts with the handoff and BDD mobile requirement.
- **Improvement suggestion**: Use `min-h-[44px]` as the base class (mobile-first), and only override on larger breakpoints if needed.

### 4) High — “20 Q&As distributed across 5 pages” is likely not met due to duplicates
- **Plan location**: Goal statement (lines 5, 11) + page integration steps (lines 403–415, 444–454, 480–490, 517–527).
- **Description**: The displayed item lists include repeated keys across pages (e.g., `oem`, `samples`, `manufacturer`, `bendingRadius`). That means fewer than 20 *unique* Q&As will actually appear across the site, even though Task 1 adds 20 items and the goal says “20 … Q&As distributed.”
- **Improvement suggestion**: Provide an explicit “20-item coverage map” in the plan that ensures every key is shown on at least one page (or update the goal/BDD to clarify that only a subset is shown and the rest are reserved for later).

### 5) High — Shared `faq` namespace contradicts the design handoff and may increase payload/maintenance risk
- **Plan location**: Architecture/Design Decisions (lines 7, 13) + Task 1 (lines 57–99).
- **Description**: The plan intentionally diverges from the handoff’s per-page `namespace` approach and puts everything under one shared `faq` pool. This can cause:
  - larger translation payloads per page (loading a big pool for a small subset),
  - weaker ownership (harder to keep page-specific wording consistent),
  - less flexibility for page-specific titles/subtitles later.
- **Improvement suggestion**: Either revert to per-page namespaces as in `HANDOFF.md` (e.g., `contact.faq`, `about.faq`, …), or keep a shared pool but add a plan-level rule: every page must define its own title/subtitle keys and only “items” are shared.

### 6) High — Proposed `FaqSection` code has an incorrect / non-existent `Locale` import
- **Plan location**: Task 2 → Step 3 `FaqSection` code (lines 269–300).
- **Description**: The plan imports `Locale` from `@/types/content.types`, but the existing structured-data code uses `Locale` from the structured-data/i18n types (and that import path may not exist). This is a concrete compile-risk.
- **Improvement suggestion**: Use the project’s existing locale type (e.g., from `@/i18n/routing` or the re-export in `src/lib/structured-data.ts`) and type `locale` as `"en" | "zh"` instead of `string` so callers can’t pass invalid values.

### 7) Medium — FAQ schema placement is inconsistent with the handoff and isn’t configurable
- **Plan location**: Architecture (line 7) + Task 2 → Step 3 `FaqSection` code (lines 297–312).
- **Description**: The handoff says “each page generates its own `FAQPage` JSON-LD,” but the plan bakes schema generation into the section component itself. That’s not always wrong, but it reduces flexibility (e.g., if a page later needs multiple FAQ sections, or wants schema only for one).
- **Improvement suggestion**: Add a prop like `includeSchema?: boolean` (default `true`) or return schema data to the page so the page can decide where/when to emit JSON-LD.

### 8) Medium — The answer renderer can’t satisfy the “tables scroll horizontally” requirement
- **Plan location**: Task 2 → Step 3 `FaqAccordion` code (lines 348–352) + BDD “Mobile” section (bdd-specs lines 282–287).
- **Description**: The plan renders answers as a single `<p>` string. If any answer needs a table (the BDD explicitly calls this out), there is no way to implement it with this structure.
- **Improvement suggestion**: Decide one of these approaches and bake it into the plan:
  - support rich text (e.g., `t.rich`) with a wrapper that applies `overflow-x-auto` for tables, or
  - store table-like answers as structured data (TypeScript) and render a dedicated table component, or
  - explicitly remove “tables” from the scope/BDD for this batch.

### 9) Medium — The file list is incomplete (missing `faq-accordion.tsx` and test targets)
- **Plan location**: File Structure table (lines 23–46) vs Task 2 instructions (lines 316–358) and Tasks 3–6 test steps (lines 381–397, 513–516).
- **Description**: The plan instructs creating `src/components/sections/faq-accordion.tsx`, but it isn’t listed in the File Structure table. Also, Tasks 3–6 talk about adding failing tests, but don’t specify the actual test file paths to edit/create.
- **Improvement suggestion**: Update the File Structure table to include `faq-accordion.tsx` and explicitly list the intended integration test files (or a single consolidated test suite) so execution is unambiguous.

### 10) High — Route deletion checklist coverage is incomplete and too “optional”
- **Plan location**: Task 7 (lines 543–624) + Route Deletion Checklist in `.claude/rules/architecture.md` (lines 88–101).
- **Description**: The plan mentions some checklist items, but makes others optional (“Also check and remove…”, “Check … for any … referencing faq”). The checklist is explicit that these must be grepped and cleaned (types, route parsing patterns, constants helpers, etc.).
- **Improvement suggestion**: Convert the checklist into a hard “must-check” sub-list inside Task 7 that explicitly includes:
  - `src/config/paths/types.ts`,
  - `src/lib/i18n/route-parsing.ts`,
  - `src/constants/` helpers for route params,
  - navigation components/config (not only translation files),
  - and (ideally) a decision on whether to add a 301 redirect from `/faq` to `/contact`.

### 11) High — Core numbers plan is too open-ended and lacks reliable tests for the required behavior
- **Plan location**: Task 8 (lines 640–723) + BDD mapping for 7.1–7.3 (bdd-specs lines 311–314).
- **Description**: The plan mostly relies on grep and a placeholder test that inspects raw JSON. That doesn’t prove the homepage/about pages actually render values from `siteFacts`, or that ICU interpolation is wired correctly in real components.
- **Improvement suggestion**: Add concrete unit tests that render the specific homepage/about “numbers” UI and assert:
  - the displayed numbers match `siteFacts`,
  - the “+” suffix comes from translations (not data),
  - and ICU placeholders render correctly via `t("…", { countries, year, employees })`.

### 12) High — “Years in business” can become stale under caching unless explicitly defined
- **Plan location**: Task 8 (lines 686–716) + BDD Scenario 7.2 (bdd-specs lines 231–238) + Cache Components note in architecture guide (architecture.md lines 8–10).
- **Description**: If “years in business” is computed from `established` and the current date, caching can freeze that value until a redeploy/revalidation. The plan doesn’t define whether the UI should show “Established 2018” (stable) or “X years” (time-dependent), nor how it stays correct over time.
- **Improvement suggestion**: Pick one and encode it into the plan:
  - **Stable**: show the established year only, or
  - **Dynamic**: compute years with a defined revalidation strategy (e.g., yearly), or compute client-side in a small island if correctness matters more than caching.

### 13) Medium — Parallelization guidance creates likely merge conflicts in `messages/*/critical.json`
- **Plan location**: Task 7 file list (lines 545–553) + Task 8 file list (lines 642–648) + parallelization note (lines 772–776).
- **Description**: Task 7 and Task 8 both touch `messages/en/critical.json` and `messages/zh/critical.json`. Encouraging parallel work here is a recipe for conflicts and rework.
- **Improvement suggestion**: Either (a) sequence Task 7 and Task 8 explicitly, or (b) split responsibilities so one task owns nav cleanup and the other owns number unification, with a defined merge plan and “single final edit pass” on critical.json.

## Positive Aspects
- Clear goal and a sensible high-level architecture (Server Component wrapper with a small client boundary).
- Reuses the existing Radix-based accordion rather than introducing new UI dependencies.
- Includes SEO structured data as a first-class requirement, not an afterthought.
- Explicit route deletion task references the project’s checklist (good governance signal).
- The “single source of truth” direction via `siteFacts` is the right long-term move.

## Summary (Top 3 Issues)
- **Sequencing risk**: Task 1 can break `/faq` before Task 7 deletes it (lines 57–60 vs 543–636).
- **BDD mismatch**: Chevron + rotation and mobile touch targets aren’t implemented correctly (lines 205–222, 345).
- **Coverage gap**: The “20 distributed Q&As” requirement is likely unmet due to duplicated keys across pages (lines 403–527).

## Consensus Status
**NEEDS_REVISION**

---

## Round 2 — 2026-03-25

### Overall Assessment
The revised plan is meaningfully stronger: it fixes the biggest “will break mid-way” sequencing problem, adds an explicit 20-item coverage map, tightens the route deletion checklist, and addresses the touch-target requirement. However, it still has a couple of hard blockers that would prevent a clean implementation pass (most importantly: a broken/inconsistent `locale` prop story in Task 2 and an unresolved mismatch with the BDD requirement around table rendering). With a few targeted fixes, it can become implementation-ready.

**Rating**: 6/10

### Previous Round Tracking
| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | Sequencing will break `/faq` before it is deleted | Resolved | Task 1 now keeps old keys and explicitly says “backward-compatible”; Task 7 adds Step 0 to remove old keys only when deleting the route (plan lines 60–63, 584–587). |
| 2 | Missing chevron + rotation behavior | Partially Resolved | Chevron icon is added in `FaqAccordion`, but the rotation class likely won’t work unless the trigger is also marked as a `group`, and there is still no test asserting rotation (plan lines 349–352). |
| 3 | Wrong breakpoint for 44px touch targets | Resolved | Trigger now uses `min-h-[44px]` (mobile-first) and the plan calls this out explicitly (plan lines 349, 365–367). |
| 4 | “20 Q&As distributed” not met due to duplicates | Resolved | Plan adds a 20-item coverage map and assigns previously unassigned keys to product pages (plan lines 505–506, 826–851). |
| 5 | Shared `faq` namespace contradicts handoff / maintenance risk | Partially Resolved | The plan explicitly keeps a shared namespace and provides a rationale; it still diverges from the handoff approach and doesn’t add page-specific title/subtitle guidance (plan line 13). |
| 6 | Incorrect / non-existent `Locale` import | Unresolved | `FaqSection` still imports `Locale` from `@/types/content.types` and casts `locale as Locale` while `locale` is typed as `string` (plan lines 272–303). |
| 7 | Schema placement not configurable / inconsistent with handoff | Unresolved | Schema is still always emitted inside `FaqSection` and the plan does not add an `includeSchema` option (plan lines 300–315). |
| 8 | Answer renderer can’t support tables (BDD mobile requirement) | Unresolved | The plan explicitly defers table support (“prose-only; table rendering support is deferred”), which conflicts with the BDD requirement as written (plan lines 369–370). |
| 9 | File list incomplete (missing `faq-accordion.tsx`, test targets) | Partially Resolved | File structure now includes `faq-accordion.tsx`, but the plan still doesn’t specify which integration test files to edit/create for Tasks 3–6 (plan lines 31–38, 392–408, 526–529). |
| 10 | Route deletion checklist was optional/incomplete | Partially Resolved | Checklist is now marked “ALL items are mandatory” and covers types + route parsing, but it still omits the “`src/constants/` helpers” check from the project checklist (plan lines 569–581). |
| 11 | Core numbers plan lacked reliable tests | Partially Resolved | Plan adds a note that tests must render real components and adds placeholder tests for homepage/about rendering, but still leaves the tests underspecified (no concrete test file paths, no concrete component names) and keeps a raw-JSON placeholder test (plan lines 692–717). |
| 12 | “Years in business” caching staleness not defined | Partially Resolved | The plan chooses a stable “Established {year}” display to avoid cache staleness, but this may not satisfy the BDD wording that asks for “years in business” (plan lines 13, 710–714). |
| 13 | Parallelization causes critical.json merge conflicts | Resolved | Execution order now forces Task 7 before Task 8 explicitly to avoid `messages/*/critical.json` conflicts (plan lines 819–825). |

### Issues (new or unresolved)

#### A) Critical — Task 2’s test code and component props don’t match (plan is not internally consistent)
- **Plan location**: Task 2 tests (plan lines 169–176) vs `FaqSectionProps` (plan lines 275–284).
- **What’s wrong**: The tests call `FaqSection({ items, title })` but the proposed `FaqSectionProps` requires `locale`. This makes the plan’s own Red→Green loop impossible without “secret edits” that aren’t written down.
- **What to change**: Either (1) make `locale` optional (or remove it if it isn’t needed by `generateFAQSchema`), or (2) update every test + every page integration snippet to pass the correct locale value consistently.

#### B) High — Chevron rotation likely won’t work as written
- **Plan location**: `FaqAccordion` chevron class (plan line 351) and trigger class (plan line 349).
- **What’s wrong**: The icon uses `group-data-[state=open]:rotate-180`, but the plan does not add a `group` class to the trigger (or any parent). Without that, the rotation may never apply.
- **What to change**: Add `group` to the trigger class (e.g., `className="group …"`), or switch to a selector strategy that definitely matches how `data-state` is applied by Radix. Also add a test that proves the rotation behavior.

#### C) High — Locale typing/import remains a concrete compile-risk
- **Plan location**: Task 2 → `FaqSection` code (plan lines 272–303).
- **What’s wrong**: `@/types/content.types` is not established as the project’s locale type source in the referenced files, and `locale: string` + `as Locale` is a type escape hatch rather than a real contract.
- **What to change**: Use the project’s real locale type (for example, from the i18n routing types) and type `locale` as `"en" | "zh"` (or whatever the project uses) so invalid locales are impossible at compile time.

#### D) High — Table support is still a spec mismatch (must be resolved one way or the other)
- **Plan location**: Task 2 notes (plan lines 369–370) vs BDD mobile requirement for tables.
- **What’s wrong**: The plan defers table rendering support, but the BDD spec explicitly requires that tables inside answers scroll horizontally on narrow screens.
- **What to change**: Either (1) implement minimal rich-content support now (enough to render a table wrapper with horizontal scroll), or (2) explicitly revise the BDD spec/acceptance criteria to remove the table requirement for this batch.

#### E) Medium — “Established {year}” may not satisfy “years in business” (BDD wording mismatch)
- **Plan location**: Design decision statement (plan line 13) + core numbers tests (plan lines 710–714).
- **What’s wrong**: The plan intentionally avoids dynamic year computation, but the BDD scenario describes “years in business,” which implies a computed value rather than the founding year.
- **What to change**: Either update the BDD spec to match “Established {year}”, or define a safe strategy to compute years without cache staleness (for example, a defined revalidation window or a small client-side computation).

#### F) Medium — Integration test steps are still too vague to execute reliably
- **Plan location**: Tasks 3–6 test steps (plan lines 392–408, 449–452, 485–488, 526–529).
- **What’s wrong**: The plan says “add to the contact page test file (or create a focused test)” but does not name the test file(s), nor does it describe how to render App Router pages that take locale params in this codebase.
- **What to change**: Specify the exact test file paths to create/edit and the exact rendering strategy used in this repo (so someone can follow the plan without guesswork).

### Positive Aspects
- The plan now explicitly prevents the mid-way breakage of `/faq` by keeping backward-compatible i18n keys until deletion.
- The 20-item coverage map makes the scope concrete and checkable.
- Route deletion guidance is stricter and closer to the project’s real checklist.
- The plan now sequences Task 7 → Task 8 to avoid translation merge conflicts.

### Summary
The plan is close, but not yet implementation-ready because it still has internal inconsistencies and unresolved spec mismatches. Fixing the `locale` prop contract (and its tests), validating chevron rotation, and deciding the “tables in answers” requirement are the key remaining steps.

**Consensus Status**: NEEDS_REVISION

---

## Round 3 — 2026-03-25

### Overall Assessment
This revision fixes most of the Round 2 blockers in the right way: the `locale` prop is now consistently passed, the chevron rotation is wired correctly via a `group` trigger, the locale typing is tightened, and the BDD spec now explicitly matches the “prose-only” FAQ content and the stable “Established {year}” display. The plan is now close to implementation-ready, but it still contains a couple of concrete “follow the plan and you’ll hit TypeScript/test gaps” problems (mainly: the test helper still types `locale` as `string`, and integration test paths/patterns are only fully specified for the contact page).

**Rating**: 7/10

### Previous Round Tracking
| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | Sequencing will break `/faq` before it is deleted | Resolved | Backward-compatible i18n guidance remains, and Task 7 still removes old keys at deletion time (plan lines 60–63, 595–598). |
| 2 | Missing chevron + rotation behavior | Resolved | `FaqAccordion` now adds `group` on the trigger and uses `group-data-[state=open]:rotate-180` (plan lines 350–353). |
| 3 | Wrong breakpoint for 44px touch targets | Resolved | Trigger uses `min-h-[44px]` (plan line 350). |
| 4 | “20 Q&As distributed” not met due to duplicates | Resolved | Coverage map remains and product page includes the formerly-unassigned items (plan lines 510–517, 837–862). |
| 5 | Shared `faq` namespace contradicts handoff / maintenance risk | Partially Resolved | Plan keeps the shared namespace and documents the rationale; handoff divergence remains (plan line 13). |
| 6 | Incorrect / non-existent `Locale` import | Resolved | The `Locale` type is now used directly (no `as Locale` cast) and the import path corresponds to an existing file in this repo (`src/types/content.types.ts`) (plan lines 273–304). |
| 7 | Schema placement not configurable / inconsistent with handoff | Partially Resolved | Schema is still emitted inside `FaqSection`. That’s workable for this batch (one FAQ section per page), but the plan still doesn’t explicitly reconcile this with the handoff’s “page generates schema” guidance or provide an opt-out prop (plan lines 301–315). |
| 8 | Answer renderer can’t support tables (BDD mobile requirement) | Resolved | BDD now explicitly marks table support as deferred for prose-only content, matching the plan (bdd-specs line 286; plan line 370). |
| 9 | File list incomplete (missing `faq-accordion.tsx`, test targets) | Partially Resolved | `faq-accordion.tsx` is listed, and contact integration test path/pattern is now concrete; other pages still lack concrete test file paths (plan lines 31–33, 395–419). |
| 10 | Route deletion checklist was optional/incomplete | Partially Resolved | Checklist is mandatory and expanded, but it still doesn’t explicitly include the architecture guide’s “check `src/constants/` helpers” item (plan lines 580–592). |
| 11 | Core numbers plan lacked reliable tests | Partially Resolved | BDD is now aligned on “Established {year}”, but the plan’s tests are still placeholders without concrete test file paths or specific component targets (plan lines 703–725). |
| 12 | “Years in business” caching staleness not defined | Resolved | Plan uses stable “Established {year}”, and BDD Scenario 7.2 now matches that (bdd-specs lines 231–238; plan line 13). |
| 13 | Parallelization causes critical.json merge conflicts | Resolved | Execution order still sequences Task 7 before Task 8 and calls out the conflict risk (plan lines 820–836). |
| A | Task 2’s test code and component props don’t match | Partially Resolved | Locale is now passed in the test helper (plan lines 169–176), but the helper still types `locale` as `string`, which can cause strict TypeScript friction when passing into `FaqSection`’s `locale: Locale` prop. |
| B | Chevron rotation likely won’t work as written | Resolved | Trigger now includes `group`, enabling the rotation selector to work (plan line 350). |
| C | Locale typing/import remains a compile-risk | Resolved | `locale` is now typed as `Locale` in `FaqSectionProps` and the cast is removed (plan lines 283–304). |
| D | Table support spec mismatch | Resolved | BDD explicitly defers table support for prose-only content (bdd-specs line 286). |
| E | “Established {year}” vs “years in business” mismatch | Resolved | BDD Scenario 7.2 now uses “Established {year}” language (bdd-specs lines 231–238). |
| F | Integration test steps too vague to execute | Partially Resolved | Contact page test path + render pattern is now concrete; other integration tests still need the same treatment (plan lines 395–419, 460–463, 496–499, 537–540). |

### Issues (new or unresolved)

#### 1) High — Task 2 test helper still types `locale` as `string` instead of `Locale`
- **Plan location**: Task 2 test helper signature (plan line 169) and `FaqSectionProps` locale type (plan lines 283–285).
- **Description**: The plan says TypeScript strict and now types `FaqSectionProps.locale` as `Locale`, but the test helper still declares `locale: string`. If someone follows the plan literally, they may hit a TypeScript mismatch when passing `props?.locale` through.
- **Improvement suggestion**: Change the helper type to `locale: Locale` (and set the default to `"en"`), so the test code matches the component contract cleanly.

#### 2) Medium — Integration test file paths/patterns are still missing for About/Product/OEM/Bending pages
- **Plan location**: Task 4 Step 1 (plan lines 460–463), Task 5 Step 1 (plan lines 496–499), Task 6 Step 1 (plan lines 537–540).
- **Description**: Only the contact page has a concrete integration test file path and a concrete render pattern. The other integration scenarios are still described at a high level.
- **Improvement suggestion**: Add the same “Test file: …” + “render pattern: import page + pass `{ params: Promise.resolve({ locale: 'en' }) }`” blocks for each of these pages, so the plan is uniformly executable.

#### 3) Medium — Core numbers tests still lack concrete test file paths and concrete component targets
- **Plan location**: Task 8 Step 2 (plan lines 703–725).
- **Description**: The plan correctly says tests must render real components, but it still doesn’t say which test files to edit/create, nor which components should be rendered for homepage/about stats.
- **Improvement suggestion**: Name the exact test files and the exact component entrypoints to render (mirroring the contact page approach), so the “core numbers” work can be implemented without guesswork.

#### 4) Low — Route deletion checklist still omits the `src/constants/` scan called out by the project architecture guide
- **Plan location**: Task 7 mandatory checklist (plan lines 580–592) vs `.claude/rules/architecture.md` route deletion checklist.
- **Description**: The plan’s checklist is stronger than before, but it still doesn’t explicitly mention scanning `src/constants/` for route helpers.
- **Improvement suggestion**: Add a line item for checking/removing any `src/constants/` helpers that reference the deleted route, even if it’s “usually none for /faq”.

### Positive Aspects
- The plan and BDD spec are now aligned on the key scope decisions (prose-only FAQ, stable “Established {year}”).
- The most error-prone UI details (chevron rotation + 44px touch targets) are now explicitly handled.
- Contact page integration testing is now concrete and uses a clear, repeatable rendering pattern.

### Summary
Most of the prior blockers are resolved, and the plan is now close. The remaining work is mainly tightening the plan so it is consistently executable under strict TypeScript and consistently testable across all pages (not just contact).

**Consensus Status**: NEEDS_REVISION

---

## Round 4 — 2026-03-25

### Overall Assessment
The plan is now implementation-ready. The Round 3 execution blockers are addressed directly in the plan (locale typing in the test helper, concrete test paths/patterns for all page integrations, concrete core-numbers test targets, and a stronger route deletion checklist). The remaining “differences from the design handoff” are now clearly in the “intentional and acceptable” category for this batch, rather than hidden gaps.

**Rating**: 9/10

### Previous Round Tracking
| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | Sequencing will break `/faq` before it is deleted | Resolved | Task 1 remains backward-compatible and Task 7 removes old keys when deleting the route. |
| 2 | Missing chevron + rotation behavior | Resolved | Trigger includes `group` and chevron rotation selector is in place. |
| 3 | Wrong breakpoint for 44px touch targets | Resolved | Trigger uses `min-h-[44px]`. |
| 4 | “20 Q&As distributed” not met due to duplicates | Resolved | Coverage map remains and the plan assigns all 20 items to at least one page. |
| 5 | Shared `faq` namespace contradicts handoff / maintenance risk | Acceptable | Plan explicitly chooses a shared namespace and documents why; acceptable for this batch. |
| 6 | Incorrect / non-existent `Locale` import | Resolved | Locale typing is now consistent and no longer relies on a cast. |
| 7 | Schema placement not configurable / inconsistent with handoff | Acceptable | Schema emission inside `FaqSection` is consistent and workable given one FAQ section per page in this batch. |
| 8 | Answer renderer can’t support tables (BDD mobile requirement) | Resolved | BDD now explicitly defers table support for prose-only content. |
| 9 | File list incomplete (missing `faq-accordion.tsx`, test targets) | Resolved | File list includes `faq-accordion.tsx`, and integration test targets are now concrete across pages. |
| 10 | Route deletion checklist was optional/incomplete | Resolved | Checklist now explicitly includes `src/constants/` as a mandatory check. |
| 11 | Core numbers plan lacked reliable tests | Resolved | Plan now specifies concrete test files/targets (homepage via `hero-section.test.tsx`, about via about page test). |
| 12 | “Years in business” caching staleness not defined | Resolved | BDD + plan now align on stable “Established {year}”. |
| 13 | Parallelization causes critical.json merge conflicts | Resolved | Execution order still sequences Task 7 before Task 8 to avoid conflicts. |
| A | Task 2’s test code and component props don’t match | Resolved | Test helper now passes locale and types it as `"en" | "zh"`. |
| B | Chevron rotation likely won’t work as written | Resolved | `group` class is added on the trigger, enabling the selector. |
| C | Locale typing/import remains a compile-risk | Resolved | Locale prop is typed as a locale union and the cast is removed. |
| D | Table support spec mismatch | Resolved | BDD updated to explicitly defer table support. |
| E | “Established {year}” vs “years in business” mismatch | Resolved | BDD updated to “Established {year}”. |
| F | Integration test steps too vague to execute | Resolved | Test file paths and render patterns are now concrete for all target pages. |

### Issues (new or unresolved)
No new blocking issues found in this revision.

### Positive Aspects
- The plan is now “followable” end-to-end without needing unstated fixes to make tests/type-checks work.
- Page integration testing guidance is consistent across all target routes.
- Route deletion cleanup is aligned with the project’s own checklist, reducing the risk of dead links and orphaned config.

### Summary
All previously raised blocking issues are resolved, and the remaining design deviations are explicitly chosen and acceptable for this batch.

**Consensus Status**: APPROVED

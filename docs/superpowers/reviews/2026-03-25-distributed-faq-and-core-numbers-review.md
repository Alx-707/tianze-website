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


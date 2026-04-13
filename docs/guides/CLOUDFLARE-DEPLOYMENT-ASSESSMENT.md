# Cloudflare Deployment Assessment

## One-line conclusion

Tianze should stay on Next.js + OpenNext + Cloudflare, but keep shrinking repo-local Cloudflare deviations one proof-backed step at a time instead of treating stock OpenNext as a magic fix.

## Why this document exists

This document explains where Tianze is already close to official OpenNext usage, where it still diverges, which divergences are load-bearing today, and how to reduce them without weakening proof.

This is not a rewrite proposal. It is a bounded alignment plan.

## Ecosystem findings

### What comparable projects usually do

Most comparable Next.js + Cloudflare projects stay close to stock `@opennextjs/cloudflare` entrypoints:

- build with `opennextjs-cloudflare build`
- preview with `opennextjs-cloudflare preview`
- keep OpenNext config close to documented defaults
- avoid large repo-local post-build patches unless a specific upstream gap forces one

### What is different about Tianze

Tianze already uses official OpenNext configuration primitives in `open-next.config.ts`, but it still carries a heavier-than-normal repo-local Cloudflare layer because this repository has to preserve proof for:

- split-worker phase6 deployment topology
- page-level local preview proof
- generated-artifact compatibility gaps that upstream has not fully closed yet
- repo-specific deployment ordering and service binding rules

### Why gradual alignment is preferred

A big-bang cleanup would create false confidence.

The practical risk is not just "build fails." The larger risk is:

- build looks greener
- wrapper count drops
- but page/header proof, preview behavior, or deployed smoke becomes thinner or less trustworthy

That is why the series treats alignment progress as **smaller deviation surface plus unchanged proof boundaries**, not as “fewer files” or “closer to stock” alone.

## Current Tianze deviation map

### Current alignment level

Using the Wave 1 rubric, Tianze currently sits around **L2 (partially aligned)**, not L3.

Why it is not L1 anymore:

- `open-next.config.ts` already uses `defineCloudflareConfig(...)`
- the repo uses stock OpenNext bundle generation inside the current wrapper flow
- the Wave 2 Task 6 retirement proved that the old manifest-guard branch was redundant and could be removed safely

Why it is still not L3:

- `pnpm build:cf` now routes through stock `opennextjs-cloudflare build`
- preview degraded handling still remains as explicit compatibility debt
- preview proof remains page/header level only; deployed smoke is still the only final API/deploy truth

### Deviation classes

#### 1. Generated-artifact compatibility

Files:

- historical only: `scripts/cloudflare/patch-prefetch-hints-manifest.mjs`
- historical only: `scripts/cloudflare/generated-artifact-exception-contract.mjs`
- historical only: `scripts/cloudflare/check-generated-artifact-log.mjs`

Current state:

- **Manifest-guard branch retired in Wave 2 Task 6**
- Later cleanup waves kept the remaining generated-artifact layer as diagnostic compatibility debt
- Wave 8 retired the repo-local generated-artifact patch/checker/contract layer from the main tree after stock Route B build, preview, and release proof stayed green

Practical meaning:

This section is now historical analysis, not current command truth.

#### 2. Wrapper and orchestration layer

Files:

- `scripts/cloudflare/build-webpack.mjs` (historical diagnostic wrapper)
- `scripts/cloudflare/build-phase6-workers.mjs` (historical; removed from main tree)
- `scripts/cloudflare/deploy-phase6.mjs` (historical; removed from main tree)
- package scripts in `package.json`

Current state:

- `build-webpack.mjs` is no longer the formal Cloudflare build entry for this repo
- phase6 worker generation and ordered deploy behavior are now historical/legacy-only concerns
- `preview:cf` now follows stock Route B command truth

Practical meaning:

The remaining wrapper layer is now mostly legacy/diagnostic glue. The active proof boundary is stock Route B plus retained generated-artifact and preview-degraded compatibility debt.

#### 3. Repo-specific topology and deployment rules

Files:

- historical only: `scripts/cloudflare/phase-topology-contract.mjs`
- historical only: `scripts/cloudflare/build-phase6-workers.mjs`
- historical only: `scripts/cloudflare/deploy-phase6.mjs`

Current state:

- This repo once deployed a five-worker phase6 topology (`gateway`, `web`, `apiLead`, `apiOps`, `apiWhatsapp`)
- That topology helper surface has now been removed from the main tree

Practical meaning:

This class is now historical analysis, not the current platform shape for this project.

#### 4. Retained exception and contract enforcement layer

Files:

- `scripts/cloudflare/preview-degraded-contract.mjs`
- checker scripts under `scripts/cloudflare/check-*.mjs`

Current state:

- These files define and enforce current repo truth
- They should only be removed after the underlying exception itself is gone

Practical meaning:

Deleting these early would not make the repo more official. It would only make drift harder to see.

## Official entrypoints vs repo-specific wrappers

### Official entrypoints the repo already uses

At the tool level, Tianze is already built on official OpenNext surfaces:

- `@opennextjs/cloudflare` in `open-next.config.ts`
- `pnpm exec opennextjs-cloudflare build`
- `pnpm exec opennextjs-cloudflare preview --env preview`

These are the upstream entrypoints that define the base platform behavior.

### Repo-specific wrappers that still exist today

#### `pnpm build:cf`

What it does:

- cleans build artifacts
- runs stock OpenNext Cloudflare bundling

Why it still exists:

- this repo still needs explicit generated-artifact compatibility control
- this is the current formal Cloudflare build proof boundary via stock Route B command truth

What it does **not** mean:

- it does not prove generated-artifact patch debt is gone
- it only means this repo still has remaining compat work before that debt can be retired

#### `pnpm preview:cf`

What it does:

- rebuilds through the current `build:cf` path
- then launches stock `opennextjs-cloudflare preview --env preview`

Why it still exists:

- preview proof must use the same retained compat mode as the build proof while generated-artifact patches remain active

What it proves:

- page/header/cookie/redirect behavior in local preview

What it does **not** prove:

- deployed API truth
- phase6 split-worker parity

#### `scripts/cloudflare/build-phase6-workers.mjs`

What it does:

- turns the current phase6 topology contract into worker-specific Wrangler configs

Why it still exists:

- this is repo-specific topology glue, not just convenience syntax

#### `scripts/cloudflare/deploy-phase6.mjs`

Current state:

- removed from the main tree
- any future phase6 deploy flow would need an explicit legacy-only reintroduction

### Current convergence objective

The correct convergence objective is:

1. retire narrow generated-artifact patches where proof shows they are redundant
2. keep wrappers that are still load-bearing
3. document each retained wrapper with a blocker and reevaluation trigger
4. only then evaluate whether the wrapper can collapse into a thinner stock-command path

This is evidence-led convergence, not wrapper deletion for its own sake.

## Proof boundaries that must stay explicit

This repo must keep these proof levels separate:

- **Build proof**: `pnpm build`, `pnpm build:cf`
- **Local page preview proof**: `pnpm smoke:cf:preview`
- **Deployed smoke proof**: `pnpm smoke:cf:deploy -- --base-url <url>`

Rules:

- local preview is a valuable signal
- local preview is **not** deployed truth
- a cleaner wrapper count does **not** justify dropping any proof surface
- Wave 2 progress does not mean `/api/health` is now provable from local preview

## Recommended sequence

### Step 1 — keep current formal build/preview mode

Continue using:

```bash
CF_APPLY_GENERATED_PATCH=true pnpm build:cf
CF_APPLY_GENERATED_PATCH=true pnpm preview:cf
pnpm smoke:cf:preview
```

as long as any generated-artifact compatibility patch remains active.

### Step 2 — retire generated-artifact patches one by one

Wave 2 Task 6 proved the correct pattern:

- fix any prerequisite portability bug first
- capture before/after dry-run evidence
- remove only one candidate branch
- re-run build proof and preview proof
- document success or retention explicitly

### Step 3 — audit retained exception contracts against current reality

Do not assume every contract is still perfectly aligned. Audit them one by one and keep only those that still describe a real boundary.

### Step 4 — evaluate wrapper convergence after patch narrowing

At this stage, the old wrapper convergence question is historical. The active next evaluation is whether preview-degraded handling can be retired once preview has real integrations.

- preview can move from degraded preview handling to fully real preview integrations

### Step 5 — freeze retained exceptions and publish a runbook

After the audits, convert the current truth into:

- a retained/deferred exception list
- an ordered runbook for future maintainers

## Out-of-scope items for this series

The main path for this series must **not** include:

- phase6 topology rewrite
- worker regrouping
- `middleware -> proxy` migration
- re-enabling minify
- platform switch
- large version gamble

These items may appear in a future backlog, but they are not active recommendations in this wave.

## What Wave 2 changed in practical terms

Wave 2 Task 6 is not a dramatic visual change, but it matters.

What changed now:

- the machine-specific absolute-path bug in the generated-artifact patch script is gone
- the manifest-guard branch was retired successfully
- standard build stayed green
- compat-mode Cloudflare build stayed green
- page/header preview smoke stayed green

What did **not** change yet:

- generated-artifact compat mode has been retired from the main tree
- build now flows through stock `opennextjs-cloudflare build`
- local preview still does not count as deployed API proof
- preview-degraded handling is now the last clearly active non-stock operator boundary

## Bottom line

This repo is closer to official OpenNext than it was at the start of the series, but it is not yet “stock.”

That is acceptable.

The real win is not pretending the repo is simpler than it is. The real win is proving, one narrow change at a time, which deviations are no longer needed and which ones are still load-bearing.


## Remaining generated-artifact patch audit

After the Wave 2 manifest-guard retirement, the generated-artifact compatibility layer still contains five live patch points.

### Remaining patch points and status

| Patch point | Generated target | Current status | Blocker type | Why it stays |
|---|---|---|---|---|
| Middleware manifest loader replacement | `.open-next/server-functions/default/handler.mjs` | Retain | preview / generated-artifact blocker | Current generated default handler still needs the `require(...) -> loadManifest(...)` rewrite in compat mode. |
| `requirePage` async promotion | `.open-next/server-functions/default/handler.mjs` | Retain | preview / generated-artifact blocker | Needed so the default handler can safely await ESM imports for API route modules. |
| API route `return require(...)` -> `return await import(...)` | `.open-next/server-functions/default/handler.mjs` | Retain | preview / generated-artifact blocker | Current OpenNext output still emits absolute-path API route loading patterns that are not safe in Workers. |

### What changed in Wave 2 and what did not

What changed:

- the machine-specific absolute-path bug in the API route rewrite is fixed
- the obsolete manifest-guard branch is retired
- the API route rewrite is now narrowed so it only rewrites `return require("...app/api/...")` branches instead of corrupting unrelated generated factories

What did not change:

- the default handler still needs middleware/API compatibility rewriting
- split server-function cache/composable-cache path rewrites also still remain load-bearing
- the generated-artifact exception contract remains active for the remaining compat patch set

### Current recommendation for the remaining patch set

For Wave 3, the remaining patch points are **retain**, not retire.

The right next move is not to force-delete them. The right next move is to harden how they are detected:

- reduce exact-string matching fragility
- add content-aware checks alongside log scanning
- continue retiring one patch point at a time only after proof stays intact

## Exception-contract and checker audit

### Generated-artifact contract

Files:

- `scripts/cloudflare/generated-artifact-exception-contract.mjs`
- `scripts/cloudflare/check-generated-artifact-log.mjs`
- `scripts/cloudflare/patch-prefetch-hints-manifest.mjs`

What it currently proves:

- this repo still carries a temporary compatibility layer for generated OpenNext artifacts
- known generated-artifact regressions are still blocked at build/log level

What it does **not** fully prove today:

- that the patch script dry-run remains trustworthy across all future generated handler shapes
- that log scanning alone catches every meaningful generated-artifact regression

Audit result:

- contract remains valid
- checker is useful but partial
- keep active

### Alias / shim contract

Files:

- `scripts/cloudflare/alias-shim-exception-contract.mjs`
- `scripts/cloudflare/check-alias-shim-contract.mjs`

What it currently proves:

- the single-worker alias block in `wrangler.jsonc` matches the declared alias contract

Current gap:

- the checker does **not** fully cover `PHASE6_ALIAS`
- it does not validate generated phase6 configs under `.open-next/wrangler/phase6/*.jsonc`

Audit result:

- contract remains valid
- checker coverage is now stronger: generated phase6 config alias blocks are checked directly when present
- keep active because the alias/shim exception itself is still required

### Preview degraded contract

Files:

- `scripts/cloudflare/preview-degraded-contract.mjs`
- `scripts/cloudflare/check-preview-degraded-contract.mjs`

What it currently proves:

- preview workflow and release-proof still include the expected degraded-mode guardrails and placeholder-secret handling

Current gap:

- checker relies on brittle string matching against workflow/script text
- it is checking syntax presence more than end-to-end behavior

Audit result:

- contract remains valid
- checker coverage is now semantic for workflow env mappings and release-proof guard structure
- keep active because the degraded preview exception itself is still part of the current platform behavior

### Server-actions secret contract

Current state:

- retired from the main tree in wave 5
- retained only as historical analysis context

### Phase topology contract

Files:

- historical only: `scripts/cloudflare/phase-topology-contract.mjs`
- historical only: `scripts/cloudflare/build-phase6-workers.mjs`
- historical only: `scripts/cloudflare/deploy-phase6.mjs`

What it currently proves:

- the repo has a single declared source of truth for phase6 worker names, route rules, and deploy order

Current gap:

- there is no dedicated checker that asserts generated phase6 configs still faithfully reflect that topology contract

Audit result:

- the old topology/generator layer has been retired from the main tree
- any future phase6 revival now requires an explicit legacy-only reintroduction, not accidental reuse of live helpers

## Stock-command convergence opportunities

The project should keep the long-term goal of moving closer to stock OpenNext command flow, but not by weakening proof or pretending repo-specific topology glue is generic.

### Candidate convergence items

| Candidate | Current recommendation | Risk | Blocker type |
|---|---|---|---|
| Retire `build-webpack.mjs` from active command truth | Completed in Route B / wave 8 | Closed | Stock `pnpm build:cf` is canonical and the old generated-artifact wrapper layer is now retired |
| Move `preview:cf` closer to fully non-degraded preview usage | Not safe yet | High | Preview still depends on degraded preview flags/placeholders in the workflow |
| Reduce exact-string patch/check fragility | Completed in this round | Low | Checker hardening landed; not a wrapper-thinning step |
| Remove phase6 generation/deploy wrappers | Do not pursue in current wave | High | This is topology-specific orchestration, not simple command cleanup |
| Replace current checker set with stronger semantic validators | Partially completed | Low/Medium | Major checker hardening landed; remaining work is not the main blocker anymore |

### What should not be marketed as convergence yet

These are **not** current wins:

- wrapper count dropping without equivalent proof
- local preview being treated as deployed API truth
- deleting contracts/checkers before the underlying exception is gone
- folding phase6 topology glue into “official alignment” language as if upstream already covers it

### Recommended Wave 3 posture

Wave 3 should be framed as:

- **narrow remaining compatibility debt**
- **harden exception checks where they are partial or brittle**
- **prepare future wrapper thinning only after those checks and patch audits are stronger**

That keeps the repo moving toward official alignment without turning “command cleanup” into hidden scope creep.

# Cloudflare Official Alignment Runbook

## Purpose

This runbook turns the Cloudflare official-alignment work into an execution order that does not rely on chat history.

Use it when you need to:

- continue the official-alignment series
- re-run proof after a retirement attempt
- explain why a deviation was retained
- avoid scope creep while shrinking repo-local Cloudflare divergence

> **Route B note (2026-04-10):** This runbook remains valuable as historical official-alignment evidence, but it is no longer the canonical active command flow. Current command truth now follows Route B: `pnpm build:cf`, `pnpm preview:cf`, `pnpm deploy:cf:preview`, `pnpm deploy:cf`.

## Non-negotiable boundaries

Do not turn this runbook into a hidden rewrite.

Forbidden in the active series:

- phase6 topology rewrite
- worker regrouping
- `middleware -> proxy` migration
- re-enabling minify
- platform switch
- large version gamble

Also do not claim deployed truth from local preview.

## Proof vocabulary

Use these proof surfaces exactly:

- **Build proof**: `pnpm build`, `pnpm build:cf`
- **Local page preview proof**: `pnpm smoke:cf:preview`
- **Deployed smoke proof**: `pnpm smoke:cf:deploy -- --base-url <url>`

Under Route B, generated-artifact compatibility tooling is retained only as diagnostic debt analysis, not as canonical command truth.

## Current repo truth after Wave 8

### What is already retired

- the entire repo-local generated-artifact patch/checker/contract layer
- the phase6 deploy/generator/config skeleton

### What is still retained

- preview degraded contract/checker
- historical decision-support docs and archives

## Ordered execution sequence

### Step 0 — prepare evidence workspace

```bash
mkdir -p .sisyphus/evidence .sisyphus/evidence/final-qa
```

Expected result:

- evidence destination exists before any redirected commands run

Evidence:

- `.sisyphus/evidence/task-0-workspace.txt`

### Step 1 — standard build proof first

```bash
pnpm clean:next-artifacts && pnpm build
```

Expected result:

- standard Next build passes before Cloudflare-specific proof begins

Evidence path pattern:

- `.sisyphus/evidence/<task>-build.txt`

Rollback rule:

- if this fails, stop the Cloudflare-specific retirement attempt and fix the standard build first

### Step 2 — Cloudflare build proof in the correct mode

Current mode while generated-artifact patches remain active:

```bash
pnpm build:cf
```

The old repo-local generated-artifact patch/checker layer has been retired from the main tree.

Expected result:

- Cloudflare build passes
- stock OpenNext Cloudflare output is accepted without repo-local post-build mutation

Rollback rule:

- if stock build itself starts failing again, treat that as a new upstream/runtime regression rather than automatically reintroducing old patch scripts

### Step 3 — generated-artifact patch layer is retired

The old repo-local generated-artifact patch/checker layer is no longer part of the active operator model.

### Step 4 — local preview proof

Current preview path:

```bash
pnpm preview:cf
pnpm smoke:cf:preview --base-url <preview-url>
```

Current known safe local preview claim:

- page/header/cookie/redirect proof only

Do not upgrade this into deployed API truth.

Expected result:

- locale pages and contact pages return 200
- locale redirects, cookie flags, and internal-header non-leakage remain correct

Rollback rule:

- if preview fails after a retirement attempt, treat that attempt as unsuccessful even if `build:cf` stayed green

### Step 5 — stronger local or deployed proof when needed

Use stronger proof only when the task needs it:

```bash
pnpm proof:cf:preview-deployed
pnpm smoke:cf:deploy -- --base-url <deployed-url>
```

Use these when:

- a change claims progress beyond local page preview
- a final formal proof is required before calling the exception retired across deployed truth

### Step 6 — document outcome immediately

If a retirement succeeds:

- write `.sisyphus/evidence/<task>-retire-patch.txt`
- update the assessment and later the retained-exception register

If a retirement fails:

- write `.sisyphus/evidence/<task>-retain-doc.txt`
- include failed command output paths
- include a reevaluation trigger

Do not leave a failed retirement as tribal knowledge.

## Wave-by-wave execution order

### Wave 2 (already completed)

- Task 5: deployment assessment published
- Task 6: manifest-guard branch retired; absolute-path prerequisite bug fixed
- Task 7: wrapper convergence documentation published

### Wave 3

- Task 8: audit remaining generated-artifact patches one by one
- Task 9: audit exception contracts and checker coverage gaps
- Task 10: document stock-command convergence opportunities without changing topology

### Wave 4

- Task 11: publish this runbook
- Task 12: freeze retained exceptions and deferrals in a dedicated register
- Task 13: prepare next-wave backlog separated from active scope

### Final Wave

Run only after Waves 1–4 outputs are complete:

- F1: plan compliance audit
- F2: documentation and command-quality review
- F3: real QA execution
- F4: scope fidelity and anti-creep review

## Current retained-exception posture

At this point in the series:

- the repo is closer to official OpenNext than before
- but the remaining generated-artifact patch set and multiple repo-specific wrappers are still retained by evidence
- the next gains should come from narrower compatibility retirement and stronger checkers, not from cosmetic command cleanup
- current evidence does not support thinning `build-webpack.mjs` or `preview:cf`; wrapper convergence remains blocked until the retained generated-artifact patch set shrinks further in real proof

## Failure handling and rollback

### If a build gate fails

- stop the current retirement path
- keep the current compat mode in place
- capture the failing evidence path
- do not continue to preview proof until build is restored

### If preview proof fails after build succeeds

- treat the retirement as failed
- revert only the target-only change
- keep the rest of the compat layer intact
- register a retained exception with a reevaluation trigger

### If a checker is too weak to support a conclusion

- do not overclaim retirement readiness
- document the checker gap first
- move the hardening work into the active wave or next-wave backlog depending on scope

## Quick command checklist

```bash
mkdir -p .sisyphus/evidence .sisyphus/evidence/final-qa
pnpm clean:next-artifacts && pnpm build
CF_APPLY_GENERATED_PATCH=true pnpm build:cf
node scripts/cloudflare/patch-prefetch-hints-manifest.mjs --dry-run
node scripts/cloudflare/check-generated-artifact-log.mjs .sisyphus/evidence/task-6-build-cf.txt
CF_APPLY_GENERATED_PATCH=true pnpm preview:cf
pnpm smoke:cf:preview
```

## How to talk about progress

Use this pattern:

- what got closer to official
- what still remains load-bearing
- what proof was earned
- what proof was **not** earned
- what should happen next

That keeps the runbook honest and avoids claiming more than the repo has actually proved.

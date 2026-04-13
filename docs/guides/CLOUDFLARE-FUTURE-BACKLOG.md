## Retirement frontier status (2026-04-10)

The current round fully exercised the realistic generated-artifact patch retirement candidates.

Outcome:
- retired successfully: manifest-guard branch only
- attempted and retained by evidence: split-function cache/composable-cache rewrites, API route import rewrite, requirePage async, middleware manifest loader

Implication:
- do not keep repeating the same target-only retirement attempts unless upstream generated output changes or new stronger deployed evidence changes the picture
- the next profitable work should shift toward wrapper-thinning analysis, stronger upstream alignment, or new proof surfaces rather than more blind retirement retries

## Wrapper thinning status (2026-04-10)

Current conclusion:
- do not thin `build-webpack.mjs` yet
- do not thin `preview:cf` yet

Reason:
- the retained generated-artifact patch set is still proven load-bearing in real preview proof, so the wrapper remains part of the active proof boundary rather than a cosmetic layer

# Future Official-Alignment Backlog

## Purpose

This backlog captures future official-alignment work that should not be smuggled into the current active wave.

## Future-wave candidates

### 1. Evaluate thinner build wrapper after more patch narrowing
- Blocker type: remaining generated-artifact compat layer
- Why not active now: wrapper thinning before patch narrowing would overclaim convergence
- Trigger: after one or more remaining generated-artifact patch points are retired safely

### 2. Evaluate preview command convergence after wrapper thinning evidence exists
- Blocker type: proof integrity
- Why not active now: preview must still reuse the compat-mode build path while retained patches remain
- Trigger: after build wrapper thinning becomes evidence-backed

## Explicitly future-only / not for the active wave

These items may be explored later, but they are not active recommendations now:

- phase6 topology rewrite
- worker regrouping
- `middleware -> proxy` migration
- re-enabling minify
- platform switch
- large version gamble

## Separation rule

Active wave work should continue to ask:

- does this reduce deviation without weakening proof?

Future-wave work can ask larger questions, but only after the retained exceptions and current runbook are stable.

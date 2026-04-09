# Learnings — cloudflare-official-alignment

## Fri Apr 10 2026 — Task 3: Proof Matrix + Proof Boundary

### Proof level discipline is the core of this plan

The biggest learning from building the proof matrix is that the repo already
has the right tools — the problem is that proof claims have historically been
made at the wrong level. "build:cf passes" getting treated as page routing
proof is the canonical example of this pattern.

### Proof gaps are not all equal

- RISK-02 (generated artifact patch) and RISK-06 (server-functions handlers)
  are genuine open technical debt with no current proof path.
- RISK-09 (local/deployed divergence) is a permanent structural constraint
  that cannot be "fixed" — it must be enforced as a discipline.
- RISK-08 (contact page) is actually closed — do not re-open it without new
  evidence of regression.

### The four Cloudflare issue buckets are the right classification frame

Before deciding which proof command to reach for, classify the failure first:
1. Platform entry / local runtime issue → preview:cf + local diagnostics
2. Generated artifact compatibility → build:cf + log blockers + smoke:cf:preview
3. Current site runtime regression → page tests + build + build:cf + smoke:cf:preview
4. Final deployed behavior → smoke:cf:deploy -- --base-url <url> only

Reaching for the wrong command wastes time and produces misleading signals.

### Phase6 proof has a hard minimum: real deployed preview URL

No amount of local harness can substitute for a real deploy URL + deployed smoke.
Dry-run passing is necessary but not sufficient. Wrangler dev failures are not
reliable phase6 indicators.

### Degraded flags in preview are OK; in release-proof they are a blocker

ALLOW_MEMORY_RATE_LIMIT and ALLOW_MEMORY_IDEMPOTENCY are legitimate preview
affordances. They become a proof violation if present in a release-proof run.
This distinction needs to be enforced explicitly, not assumed.

### TypeScript 5.9.3 constraint is stable but fragile

TS 6 causes Maximum call stack exceeded in next build. The constraint is
documented and stable, but it is easy to accidentally bump. The ignoreDeprecations
value must track the active TS version ("5.0" not "6.0").

## Fri Apr 10 2026 — Task 2: Inventory All Repo-Local Cloudflare Deviations

### 17 deviations inventoried across 6 categories

The full scripts/cloudflare/ directory plus open-next.config.ts were read and
classified. 15 scripts + open-next.config.ts + config interactions = 17 items
total. Categories used: WORKAROUND, REPO-SPECIFIC-CONFIG, CONTRACT-ENFORCEMENT,
OPERATIONAL-GLUE, SHIM/STUB, EXCEPTION-CONTRACT.

### The repo has a complete contract-enforcement layer — and a gap in it

Four contract checkers (check-alias-shim, check-generated-artifact-log,
check-preview-degraded, check-server-actions-secret) form an enforcement
chain. But PHASE6_ALIAS has no dedicated drift checker — it is only injected
by build-phase6-workers.mjs and never separately verified. The §24 drift
incident (phase-topology-contract API change leaving build-phase6-workers.mjs
on the old API) is exactly this class of silent failure: no checker caught it
until deploy smoke failed.

### The absolute path bug in patch-prefetch-hints-manifest.mjs is the highest portability risk

Fix A part 2 contains a hardcoded filesystem path:
  /Users/Data/Warehouse/Pipe/tianze-website/
This regex will produce zero matches (and therefore no patch) silently on any
machine or CI environment where the repo is not checked out to that exact path.
There is no error, no warning — just an unchecked no-op. This is the single
highest-portability risk in the entire deviation inventory. It must be fixed
(replaced with process.cwd()-relative path) before any retirement validation
build is run, because otherwise the "does the patch still work?" check is only
valid on the original developer's machine.

### OPEN_NEXT_DEPLOY_ENV naming is confusing but currently correct

server-actions-secret-contract.mjs exports: OPEN_NEXT_DEPLOY_ENV = "OPEN_NEXT_DEPLOY"
The export name sounds like the env var name includes _ENV as a suffix, but the
actual env var name is OPEN_NEXT_DEPLOY. deploy-phase6.mjs reads
process.env.OPEN_NEXT_DEPLOY directly and does not import the contract constant.
Behavior is correct today, but if the env var name changes in the contract, the
deployer will silently use the old name. Low-risk now, naming clarity recommended.

### minify conflict between open-next.config.ts and wrangler.jsonc is unresolved

open-next.config.ts sets minify: false for the default worker and all 3 split
function workers. wrangler.jsonc has top-level minify: true. The precedence
between these two config layers is undocumented. Whether OpenNext's minify:false
overrides wrangler.jsonc minify:true (or vice versa) needs to be clarified before
any minification changes are attempted.

### PHASE6_ALIAS gap: only present in generated configs, not in wrangler.jsonc

SINGLE_WORKER_ALIAS is in wrangler.jsonc and checked by check-alias-shim-contract.mjs.
PHASE6_ALIAS is only injected into generated phase6 worker configs by
build-phase6-workers.mjs — it is not in wrangler.jsonc, and it is not
separately drift-checked. The only way to catch PHASE6_ALIAS drift today is
via build-phase6-workers.mjs output inspection or deploy smoke failure.

### The patch script is both the highest-risk workaround and the most documented one

patch-prefetch-hints-manifest.mjs has the most documentation of any deviation:
explicit exit criteria in generated-artifact-exception-contract.mjs, explicit
references in AGENTS.md §2, §12, §25, and the opt-in gate CF_APPLY_GENERATED_PATCH.
This level of documentation reflects how critical and fragile this workaround is.
The documentation is the evidence that retiring it requires real proof — not inference.

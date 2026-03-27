# Quality Proof Levels

## Purpose
This is the single current rule for what different proof levels mean in this repository.

Use this document to distinguish:
- `fast gate`
- `local-full proof`
- `ci-proof`
- `release-proof`

Do not treat these as interchangeable.

## Proof Levels

### 1. `fast gate`
Purpose:
- fast local feedback before push
- useful for iteration
- not sufficient evidence for release confidence

Typical commands:
- `pnpm quality:gate:fast`
- staged/pre-commit/pre-push checks from `lefthook.yml`

What it proves:
- local code-quality and security basics were checked
- some architecture and translation checks may run

What it does **not** prove:
- coverage gate
- performance gate
- full runtime behavior
- dual-platform build correctness
- release readiness

Use for:
- normal local iteration
- early PR preparation

Never use as sole proof for:
- Tier A merges with runtime/platform impact
- release decisions

### 2. `local-full proof`
Purpose:
- strong local evidence before asking CI or before merging higher-risk changes

Minimum bundle:
- `pnpm build`
- `pnpm test:coverage`
- `pnpm quality:gate -- --skip-test-run` or equivalent full local gate flow
- `pnpm validate:translations` when i18n/messages/content changes are involved

Add when relevant:
- `pnpm build:cf` for platform/runtime/build-chain changes
- `pnpm build:cf:turbo` when the change touches the Cloudflare build toolchain itself and you need to keep the comparison path healthy
- `CI=1 pnpm test:e2e` for key-path UI/runtime changes

What it proves:
- the developer has run the heavier local checks intentionally
- the change is stronger than fast local evidence

What it still does **not** prove by itself:
- independent CI environment validation
- release-grade multi-job confirmation

Use for:
- Tier A merges
- runtime/security/i18n/platform-sensitive changes

### 3. `ci-proof`
Purpose:
- repository-controlled, independent proof from the main CI workflow

Source of truth:
- `.github/workflows/ci.yml`

Minimum expectation:
- basic checks succeed
- tests succeed
- translation quality succeeds
- architecture succeeds
- security succeeds
- performance succeeds

What it proves:
- the repo's central gates passed in a clean CI environment

What it does **not** prove by itself:
- release-specific deployment health
- environment-specific rollout correctness
- manual signoff on Tier A ownership if required

Use for:
- merge confidence
- baseline release candidate confidence

### 4. `release-proof`
Purpose:
- highest proof level for changes that can affect production runtime semantics or deployment safety

Required when:
- `src/middleware.ts` changes
- locale redirect / nonce / security headers change
- `open-next.config.ts` or Cloudflare deployment chain changes
- critical translation bundles or runtime locale semantics change
- contact / inquiry / abuse-protection policy changes materially affect production behavior

Minimum expectation:
- `local-full proof`
- successful CI proof
- explicit dual-platform validation when applicable:
  - `pnpm build`
  - `pnpm build:cf`
- key-path runtime checks for affected paths
- Tier A owner review expectations satisfied

What it proves:
- the change has enough evidence for production-facing confidence

## Mapping by Change Type

| Change Type | Minimum Required Proof |
|---|---|
| Normal UI/component cleanup outside Tier A | `fast gate` |
| Non-critical feature work with ordinary merge risk | `local-full proof` |
| Tier A runtime/security/i18n/platform changes | `local-full proof` minimum |
| Merge-ready repository confirmation | `ci-proof` |
| Production-sensitive runtime/platform changes | `release-proof` |

## Common Misuses to Avoid
- Treating `fast gate` as equivalent to `ci-proof`
- Treating a green local run as equivalent to `release-proof`
- Treating `pnpm build` success as sufficient proof for Cloudflare-compatible paths
- Treating broad coverage totals as proof of key-path stability

## Repository-Specific Notes
- `build:cf` internally runs the build chain. Do not run `pnpm build` and `pnpm build:cf` in parallel.
- For current Cloudflare compatibility, `src/middleware.ts` remains the preferred runtime entrypoint over `proxy.ts`.
- Translation proof for runtime-facing changes must include both full message bundles and critical bundles.

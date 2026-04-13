# AI Smell Guardrails

Use this file as the single source of truth for project-specific AI smell review.

## Severity Defaults

- Critical path test-only branch / skip masking / fail-open / warning-only proof bypass: `High`
- Hollow integration or fake-page tests acting as main proof: `High`
- Production importing test support assets: `High`
- Live placeholder artifacts on public pages: `Medium`, promote to `High` on homepage / contact / products
- Signal noise / suppression: `Medium`
- Truth-source drift: `Medium | DOC`

## Main Classes

### 1. Test-Only Branches

- Definition: code adds `TEST_MODE`, `PLAYWRIGHT_TEST`, `NEXT_PUBLIC_TEST_MODE`, `ALLOW_MEMORY_*`, `SKIP_ENV_VALIDATION`, or similar branches so tests run on a different path than production.
- Review check: ask whether a green test proves production behavior or only a test-specific path.
- Exceptions: only for narrow local harness setup, and only when a stronger production-like proof still exists.
- New occurrences on critical paths: block.

### 2. Skip Masking on Critical Tests

- Definition: key smoke/E2E tests skip when runtime behavior fails instead of failing loudly.
- Review check: if the page errors, do we get a red signal or does coverage disappear?
- Exceptions: missing external prerequisites at suite startup with owner + TTL + alternate proof.
- New occurrences on contact, inquiry, subscribe, security, or deploy smoke paths: block.

### 3. Hollow Integration / Contract Tests

- Definition: tests named `integration`, `contract`, or `protection` mock the core protection/submission chain and only verify wrappers, shapes, or headers.
- Review check: did the test keep rate limit, Turnstile, validation, and processing semantics real enough for the claim it makes?
- Exceptions: auxiliary response-surface checks may stay, but must be documented as auxiliary rather than main proof.
- New occurrences claiming main proof: block.

### 4. Silent Degradation Through Business Continuation

- Definition: runtime failures in security, rate limit, idempotency, duplicate protection, or anti-abuse paths log and continue as if nothing changed.
- Review check: if the guard breaks, does the user get a clearly different outcome, or does the system silently continue?
- Exceptions: preview-only degraded modes that are explicitly marked and kept out of release proof.
- New critical-path fail-open branches: block.

### 5. Warning / Bypass Proof Erosion

- Definition: release or truth checks rely on `VALIDATE_CONFIG_SKIP_RUNTIME`, `ALLOW_MEMORY_*`, warning-only validation, or similar proof-weakening bypasses.
- Review check: does “green” still mean what the docs say it means?
- Exceptions: preview/debug flows that are clearly labeled as non-release proof.
- New usage inside release-proof or truth-check surfaces: block.

### 6. Fake Page / Fake Wiring Tests

- Definition: page tests heavily mock `Suspense`, translations, loaders, schema, forms, and content sources until they are no longer testing the real page wiring.
- Review check: is the page test still testing the page, or a hand-built stage set?
- Exceptions: narrow rendering-only tests with explicit auxiliary naming.
- New critical-page fake-proof suites: block.

### 7. Production Code Depending on Test Assets

- Definition: runtime code imports `src/test/**`, `src/testing/**`, `src/constants/test-*`, test messages, or test helpers.
- Review check: does production logic depend on test-only constants or setup?
- Exceptions: none for production modules.
- New occurrences: block.

### 8. Live Placeholder Artifacts

- Definition: public pages ship placeholder image assets, placeholder copy, dashed placeholder boxes, or obvious “coming soon” visual stubs.
- Review check: is the user seeing real content, a neutral complete presentation, or an unfinished placeholder?
- Exceptions: none on live homepage / contact / products surfaces unless product approval and tracking are explicit.
- New occurrences: block on critical pages, otherwise strong review.

### 9. Signal Noise / Signal Suppression

- Definition: code emits build/runtime noise and tests then globally mute `console.warn/error`, hiding meaningful failures.
- Review check: are we filtering known fixed noise, or suppressing broad classes of useful errors?
- Exceptions: narrow, documented suppression of known platform noise.
- New broad warn/error suppression: strong review.

## Auxiliary Class

### 10. Truth-Source Drift

- Definition: behavior contracts, runbooks, or review docs describe proof coverage that no longer matches the repository.
- Review check: if docs say “covered” or “untested”, is that still true in the current tree?
- Exceptions: none; drift should be corrected quickly.
- New drift: not always blocking, but must be fixed before treating the doc as proof.

### 11. Premature Structure Hardening

- Definition: code introduces multi-site shells, abstractions, or package-style layering before current site identity, content assets, and proof boundaries are actually stabilized.
- Review check: is the structure solving a validated problem now, or freezing a guess too early?
- Exceptions: minimal site-definition scaffolding that reduces current truth-source drift without forcing a full structural migration.
- New occurrences on broad project surfaces without pilot proof: strong review.

### 12. Business Truth Hidden in Shared-Looking Layers

- Definition: brand identity, contact data, SEO defaults, export claims, or market facts are added to wrappers or generic-looking config files instead of the canonical site-definition layer.
- Review check: if a second site were added, would this value be found in one place or scattered again?
- Exceptions: temporary compatibility wrappers that transparently proxy the canonical source.
- New occurrences: block on critical identity surfaces.

### 13. Site Truth Drifting Back Out Of Single-Site Sources

- Definition: brand identity, contact facts, SEO defaults, navigation copy, or product-structure copy is edited in scattered wrappers or page-local strings instead of the current single-site truth sources (`src/config/single-site.ts`, `src/config/site-types.ts`, `src/config/single-site-product-catalog.ts`, and shared `messages/**` split bundles).
- Review check: is this change preserving the current single-site truth model, or reintroducing scattered ownership because it was the fastest place to paste it?
- Exceptions: transparent compatibility wrappers that only consume the canonical source without inventing new truth.
- New occurrences on homepage, contact, products, SEO, or structured-data copy: strong review.

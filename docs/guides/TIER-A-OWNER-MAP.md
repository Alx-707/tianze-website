# Tier A Owner Map

## Purpose
This file defines the highest-risk paths in the repository and the minimum ownership/review expectations for them.

It is intentionally role-based first. Once stable GitHub handles are confirmed, mirror this map into `.github/CODEOWNERS`.

## Tier A Definition
Tier A paths are repository areas where a change can materially affect:
- request entry behavior
- locale / SEO / SSR semantics
- production security posture
- multi-platform build or runtime correctness
- lead capture / contact pipeline correctness

## Review Policy
- Tier A changes require one primary owner review and one cross-domain review when the change crosses runtime/security/platform boundaries.
- Tier A changes are not considered proven by fast local gates alone.
- Tier A changes must use the proof levels defined in [QUALITY-PROOF-LEVELS.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md).
- The repository default owner remains primary-only; the backup identity is reserved for Tier A paths and other explicitly critical surfaces.
- When a second maintainer can be mapped into enforceable repository ownership, follow [MAINTAINER-ACTIVATION-CHECKLIST.md](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/MAINTAINER-ACTIVATION-CHECKLIST.md) instead of inventing a new ownership model.

## Operational Checklist For Tier A Changes
1. Identify whether the touched path is Tier A using the owner map below.
2. Confirm the primary owner review path is available.
3. If the change crosses runtime, security, or platform boundaries, require the cross-review listed for that row.
4. Run the relevant staged review entrypoint before merge, not after merge.
5. If the backup review path is unavailable, treat the change as blocked or re-scope it; do not describe the repo as diversified.
6. If the change is release-critical, require the proof level listed for that row and pair it with release-proof policy.

## Owner Map

| Tier A Area | Paths | Primary Owner Role | Backup Owner Role | Required Cross-Review | Minimum Proof Before Merge |
|---|---|---|---|---|---|
| Runtime entry + locale routing | `src/middleware.ts`, `src/i18n/**`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/head.tsx` | Runtime / i18n maintainer | Platform maintainer | Security review when headers/nonce/cookies change | `local-full` for normal merges, `release-proof` for release-critical changes |
| Contact + inquiry + subscribe pipeline | `src/lib/actions/contact.ts`, `src/app/api/inquiry/**`, `src/app/api/subscribe/**`, `src/lib/contact-form-processing.ts`, `src/lib/lead-pipeline/**`, `src/components/forms/**` | Lead pipeline maintainer | Runtime maintainer | Security review when validation/rate-limit/abuse checks change | `local-full` minimum; `ci-proof` required before release branch merge |
| Abuse protection + request security | `src/config/security.ts`, `src/lib/security/**`, `src/app/api/verify-turnstile/**`, `src/app/api/csp-report/**` | Security maintainer | Runtime maintainer | Platform review when Cloudflare/Vercel behavior may differ | `ci-proof` minimum; `release-proof` for policy/header/nonce changes |
| Platform build + deployment chain | `open-next.config.ts`, `next.config.ts`, `.github/workflows/**`, `scripts/cloudflare/**`, `wrangler.jsonc`, `vercel.json` | Platform maintainer | Runtime maintainer | Runtime review when request path behavior is affected | `release-proof` |
| Translation critical path | `messages/en.json`, `messages/zh.json`, `messages/en/critical.json`, `messages/zh/critical.json`, `scripts/validate-translations.js`, `scripts/translation-sync.js`, `scripts/regenerate-flat-translations.js` | i18n maintainer | Runtime maintainer | Runtime review when SSR/critical-path keys change | `local-full` minimum; `ci-proof` when user-facing entry paths are affected |
| Cache invalidation + health signals | `src/app/api/cache/invalidate/**`, `src/lib/cache/**`, `src/app/api/health/**` | Platform maintainer | Runtime maintainer | Security review for auth/invalidation policy changes | `ci-proof` minimum |

## Current Repository State
- Repository-level ownership is now enforced via [`.github/CODEOWNERS`](/Users/Data/Warehouse/Pipe/tianze-website/.github/CODEOWNERS).
- This map remains the semantic owner-definition layer above raw CODEOWNERS patterns.
- The current enforceable default owner is:
  - primary: `@Alx-707`
- The current enforceable Tier A backup review path is:
  - `developer@flood-control.com`
- The remaining constraint is explicit:
  - active maintenance is broader than one person in practice
  - there is still not a second enforceable repository owner identity that independently shares Tier A throughput
  - the backup path improves review resilience, but it does not eliminate enforceable ownership concentration
- Role separation remains documented above the identity mapping so future expansion does not collapse into raw file ownership alone.

## Hard Ceiling
- This file can define routing, review expectations, and proof requirements.
- It cannot create a second enforceable repository owner identity.
- Until another owner identity is actually mapped into repo-level enforcement, Tier A resilience remains a review fallback model, not a diversified operating model.

## Promotion / Demotion Rules
- Promote to Tier A when a path affects runtime entry behavior, dual-platform compatibility, security posture, or lead capture correctness.
- Demote from Tier A only after two conditions hold:
  - the path is no longer on a critical path, and
  - ownership and proof requirements have been reduced intentionally, not by drift.

## Next Step
Reduce enforceable owner concentration over time by mapping the Tier A backup review path to at least one additional repository owner identity as soon as one is actually available.

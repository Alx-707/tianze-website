# Legacy Cloudflare DO Cleanup Review Swarm Prompt

Use this prompt in a fresh Codex session when you want an independent,
read-only review of the legacy Cloudflare Durable Object cleanup debt or a
future cleanup PR.

```md
[$craft-workspace-tianze-website:review-swarm](.codex/skills/review-swarm/SKILL.md)

请对 `tianze-website` 的 legacy Cloudflare Durable Object cleanup 技术债做一次 read-only review-swarm 审查。

## Scope

Repo: local clone of `tianze-website` (open this prompt from your working copy).

Primary review files:

- `docs/technical/technical-debt.md`
- `docs/technical/deployment-notes.md`
- `HANDOFF.md`
- `wrangler.jsonc`
- `package.json`
- `open-next.config.ts`
- `scripts/cloudflare/build-phase6-workers.mjs`
- `scripts/cloudflare/check-official-compare.mjs`
- `scripts/cloudflare/deploy-phase6.mjs`
- `scripts/cloudflare/phase6-topology-contract.mjs`
- `scripts/cloudflare/patch-prefetch-hints-manifest.mjs`
- `tests/unit/scripts/phase6-topology-contract.test.ts`

If this is reviewing a PR branch, compare that branch against `origin/main`.
If there is no PR branch, review the current git diff and the files above.

## Intent packet

The intended behavior is:

1. PR #87 removed the current runtime cache stack from the deploy path:
   - R2 incremental cache
   - D1 tag cache
   - Durable Object cache queue
   - `/api/cache/invalidate`
   - old `apiOps` split worker
2. The current deploy architecture is phase6 split-worker:
   - `tianze-website-gateway`
   - `tianze-website-web`
   - `tianze-website-api-lead`
3. Historical Durable Object classes may still exist under old Worker service
   names:
   - `tianze-website`
   - `tianze-website-preview`
   - `tianze-website-production`
4. This technical debt is intentionally deferred. Real cleanup must not happen
   during workers.dev preview work.
5. The 7-day stability clock starts only after official production-domain
   traffic is intentionally cut over to the phase6 production Worker path.
   workers.dev preview does not start this clock.
6. Until formal production cutover happens, only read-only investigation is
   allowed.

Behavior that must remain unchanged:

- Do not reintroduce R2 / D1 / Durable Object runtime cache bindings into
  current deploy configs.
- Do not reintroduce `/api/cache/invalidate`.
- Do not add `deleted_classes` migrations to phase6 generated configs as if
  that would clean old Worker service names.
- Do not make ordinary preview deploys perform destructive cleanup.
- Do not trust `.env.local` or local Cloudflare credentials for production
  destructive actions.

Hard constraints:

- This review is read-only.
- Do not edit files.
- Do not run `apply_patch`.
- Do not stage, commit, or push.
- Do not run `wrangler deploy`.
- Do not run `wrangler delete`.
- Do not execute any `deleted_classes` migration.
- Do not print or inspect secret values from `.env.local`.
- Cloudflare live queries, if any, must be read-only and clearly labeled as
  optional evidence.

## What to review

Use four read-only reviewer perspectives:

1. Intent and regression:
   - Do docs and scripts clearly say cleanup is deferred?
   - Is the "7 days stable" rule clearly tied to official production-domain
     phase6 cutover, not workers.dev preview?
   - Are there any contradictory docs that imply cleanup can happen now?

2. Security and privacy:
   - Could the runbook encourage unsafe production actions from local env?
   - Could it expose Cloudflare tokens, account IDs, or secrets?
   - Are destructive actions guarded by explicit user approval and a maintenance
     window?

3. Performance and reliability:
   - Could old Worker names still receive traffic after phase6 cutover?
   - Does the runbook require tail logs or equivalent evidence before cleanup?
   - Are migration ordering and rollback risks clearly called out?

4. Contracts and coverage:
   - Do package scripts and compare gates prevent accidental old single-worker
     deploys?
   - Do tests cover topology assumptions enough?
   - Is there enough evidence that phase6 generated configs stay free of
     R2/D1/DO/migrations runtime cache fields?

## Expected output

Return a concise review with:

- `merge / no-merge` recommendation if reviewing a PR
- high-confidence findings only
- each finding with file/path, category, severity, why it matters, recommended
  follow-up, and confidence
- separate `fix now`, `fix soon`, and `optional follow-up`

If there are no material issues, say that directly. Do not manufacture nits.
```

# Cloudflare Next Proxy Proof

## Decision

Do not rename `src/middleware.ts` to `src/proxy.ts` on main until Cloudflare/OpenNext proof passes.

## Why this exists

Next.js 16 says the old `middleware` file convention is deprecated and recommends `proxy`.
This repo also ships through Cloudflare/OpenNext, so the migration has to prove two things:

1. Next.js can build the renamed entry.
2. Cloudflare/OpenNext preview behavior still works after the rename.

Until both are proven in a separate proof branch, `src/middleware.ts` stays as the mainline runtime entry.

## Proof branch only

Use a separate branch:

```bash
proof/cloudflare-next-proxy
```

Use a separate worktree:

```text
/Users/Data/conductor/workspaces/tianze-website/cloudflare-next-proxy-proof
```

The proof worktree may run:

```bash
git mv src/middleware.ts src/proxy.ts
```

Do not bring that rename back to the main plan worktree.

## Required local docs check

Before changing code, read the installed Next.js docs from:

```text
node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md
node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
```

The installed package docs are the source of truth for this repository.

## Required proof commands

Run the full proof from the proof worktree:

```bash
pnpm proof:cf:proxy
```

This command reruns the proof from scratch, then checks the generated artifact
when the run step succeeds. It runs these commands sequentially, not in
parallel:

1. `pnpm build`
2. `pnpm build:cf`
3. `pnpm smoke:cf:preview`
4. `pnpm smoke:cf:preview:strict`

Artifact:

```text
reports/cloudflare-proxy/proof-artifact.json
```

Each step must record:

- `name`
- `exitCode`
- `logPath`

If one step fails, the wrapper stops and does not run later steps.
The artifact still remains in `reports/cloudflare-proxy/proof-artifact.json`;
that is enough to mark the proof failed, and you can inspect it with
`pnpm proof:cf:proxy:check`.

## Check-only command

To inspect an existing artifact without rerunning the heavy proof commands, run:

```bash
pnpm proof:cf:proxy:check
```

This is only for debugging or review of an already generated artifact. It cannot
replace a fresh proof, because it does not rerun `pnpm build`, `pnpm build:cf`,
`pnpm smoke:cf:preview`, or `pnpm smoke:cf:preview:strict`.

The checker returns:

- `proxy-compatible` only when all required proof steps are present exactly once, every recorded step exits `0`, and the proof worktree file state is exactly `src/proxy.ts` present + `src/middleware.ts` absent
- `keep-middleware` when any step fails, the artifact subject is not `src/proxy.ts`, `src/proxy.ts` is missing, or `src/middleware.ts` is still present
- `keep-middleware` when any required proof step is missing, any step is duplicated, any step is unknown, or the artifact schema is malformed

Run both `pnpm proof:cf:proxy` and `pnpm proof:cf:proxy:check` from the proof
worktree itself. The checker reads `reports/cloudflare-proxy/proof-artifact.json`
and checks the current worktree files on disk. Do not run the check from the main
plan worktree, because mainline intentionally keeps `src/middleware.ts`.

## Mainline rule

- If all commands pass with `src/proxy.ts`, open a separate migration PR.
- If Cloudflare/OpenNext fails, keep `src/middleware.ts` and record that Next.js proxy migration is blocked by platform proof.
- Do not mix this migration with SEO, content, launch proof, or unrelated quality changes.

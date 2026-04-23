# Cloudflare Official Compare Runbook

## Purpose

This file defines the **official compare lane** for Next / OpenNext / Wrangler
upgrade work.

Its job is simple:

- keep the repository grounded against the official
  `opennextjs/opennextjs-cloudflare` example shape
- avoid relying only on local historical repo folklore
- make platform-boundary drift visible before it becomes a debugging spiral

## When to use it

Run this lane whenever a change touches:

- `open-next.config.ts`
- `wrangler.jsonc`
- `scripts/cloudflare/**`
- Next / OpenNext / Wrangler version bumps
- Cloudflare build / preview / deploy proof policy

## Official reference surface

Primary upstream reference:

- `opennextjs/opennextjs-cloudflare`

Concrete example files:

- `examples/playground16/open-next.config.ts`
- `examples/playground16/wrangler.jsonc`

## What to compare

### 1. OpenNext adapter baseline

Check that this repo still anchors to the official Cloudflare adapter shape:

- `defineCloudflareConfig(...)`
- incremental cache override
- queue override
- tag-cache override

Repo-specific patches are allowed, but they must be clearly understood as
project-specific deltas rather than accidental drift.

### 2. Wrangler baseline bindings

Check that this repo still keeps the official Cloudflare binding family:

- worker main points to `.open-next/worker.js`
- static asset binding
- self-reference service binding
- R2 incremental cache binding
- D1 tag cache binding
- DO queue binding

### 3. Proof boundary policy

Check that we still distinguish:

- official platform baseline
- repo-specific compatibility patches
- local preview proof
- stronger local proof
- deployed proof

## Local command

Run:

```bash
pnpm review:cf:official-compare
```

This is a lightweight static gate. It does **not** replace build or deployed
proof. It only proves that the repository has not silently drifted away from the
official baseline primitives.

## Follow-up proof

After the compare lane passes, continue with the normal repo proof:

```bash
pnpm build:cf
```

If the change is upgrade-sensitive or Cloudflare-sensitive, continue with the
current stronger proof lanes from the release and dependency runbooks.

## Current repository rule

Use the official compare lane to catch drift.
Do **not** use it to erase repo-specific patches or stronger repo-specific proof
requirements.

# Lane 01 - Architecture / Coupling

## Verdict

The repository is structurally stronger than a typical solo B2B site: dependency conformance is clean, architecture guardrails pass, and TypeScript/ESLint are clean.

The main architecture risk is not current breakage. It is operational drift around framework conventions and audit truth sources:

1. Next.js now treats `middleware` as deprecated in favor of `proxy`, while the repo-specific Cloudflare rule still pins `src/middleware.ts`.
2. The v2 audit profile is stale and points reviewers at outdated stack versions and a non-existent `.next-docs/` path.

## Commands and reports

| Evidence | Result |
| --- | --- |
| `pnpm dep:check` | passed; no dependency violations |
| `pnpm arch:conformance` | passed; total violations 0 |
| `pnpm review:architecture-truth` | passed |
| `pnpm arch:metrics` | generated current metrics |
| `pnpm arch:hotspots` | generated current hotspot map |

## Current architecture metrics

From `reports/architecture/metrics-1777481590975.md`:

- Export star count: 1.
- TypeScript errors: 0.
- ESLint issues: 0.
- Total files: 615.

## Hotspots

From `reports/architecture/structural-hotspots-1777481591995.md`, top high-change files include:

- `package.json`
- `messages/en/critical.json`
- `messages/zh/critical.json`
- `src/app/[locale]/contact/page.tsx`
- `src/app/[locale]/products/[market]/page.tsx`
- `.github/workflows/ci.yml`
- `src/app/[locale]/layout.tsx`
- `scripts/quality-gate.js`
- `src/app/api/subscribe/route.ts`
- `src/app/api/inquiry/route.ts`

High change count is not a defect by itself. It tells us where future regressions are most likely to appear.

## Findings owned by this lane

- `FPH-003`: Next.js `middleware` convention is deprecated, but Cloudflare adapter rules still require it.
- `FPH-004`: `full-project-health-v2/project-profile.md` is stale.

## Evidence artifacts

- `evidence/01-architecture-coupling/dependency-conformance-1777481527662.md`
- `evidence/01-architecture-coupling/metrics-1777481590975.md`
- `evidence/01-architecture-coupling/structural-hotspots-1777481591995.md`


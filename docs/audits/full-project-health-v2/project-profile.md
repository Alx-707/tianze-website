# Tianze Project Profile for Full Project Health Audit v2

## Business goal

Tianze is a PVC conduit fittings manufacturer in Lianyungang, Jiangsu. The website exists to help overseas B2B buyers judge product fit, trust factory capability, and send an inquiry.

The audit should judge launch readiness from the buyer's view, not only whether CI is green.

## Stack and runtime

- Next.js 16.2 App Router with Cache Components
- React 19.2
- TypeScript 5.9
- Tailwind CSS 4.2
- next-intl 4.8
- Cloudflare/OpenNext deployment path

Version-locked Next.js docs live in `.next-docs/`. Read them before making Next.js claims or proposing framework changes.

## Critical buyer flows

1. Buyer lands on the English or Chinese home page and understands what Tianze makes.
2. Buyer browses product family pages and product detail pages.
3. Buyer checks factory capability and trust signals.
4. Buyer reaches `/en/contact` or `/zh/contact`.
5. Buyer submits an inquiry or can still use a no-JS fallback path.

## Source-of-truth files

- `AGENTS.md`
- `CLAUDE.md`
- `.claude/rules/*`
- `package.json`
- `.next-docs/`
- `next.config.*`
- `open-next.config.*`
- `wrangler.*`
- `.github/workflows/*`

## Runtime proof boundaries

Local code and tests can prove implementation. They cannot prove Cloudflare preview behavior, production behavior, Google indexing, or lead-delivery service state.

Runtime surfaces should be classified separately:

- local static/code evidence
- local build evidence
- local server evidence
- Cloudflare preview evidence
- production evidence
- external dashboard evidence

## Credential-dependent areas

- Cloudflare preview deploy, worker tail, and deployed smoke
- Google Search Console
- URL Inspection
- CrUX / PageSpeed API quota
- Resend delivery proof
- Airtable delivery proof

If credentials are unavailable, mark the claim `Blocked` and state exactly what is needed.

## Owner-dependent launch inputs

These should stay ready to update when the owner provides real data. They should not be marked fixed or confirmed without current evidence:

- public buyer-facing phone number
- real product family images
- certificates, factory photos, or other trust assets

## v1 lessons carried into v2

- Runtime proof must arrive before UI, SEO, and security lanes finish.
- Old audit reports are only clues.
- P0/P1 requires fresh evidence from the current run.
- Google-side claims require Google-side data.
- Cloudflare proof cannot be inferred from local Next.js build alone.
- `src/app/[locale]` paths must be quoted in zsh commands.
- Ignored script side effects under `reports/` must be copied into tracked audit evidence if cited.

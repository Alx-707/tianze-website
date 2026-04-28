# Full Project Health Audit v1 - Runtime Proof Addendum

## 0. Short conclusion

Preview runtime proof is now partially executed.

Result:

- Cloudflare auth/deploy blocker is resolved for preview when using the main repo env file:
  `/Users/Data/Warehouse/Pipe/tianze-website/.env.local`
- Preview phase6 deployment succeeded for all three workers:
  - `tianze-website-web-preview`
  - `tianze-website-api-lead-preview`
  - `tianze-website-gateway-preview`
- Gateway workers.dev URL is:
  `https://tianze-website-gateway-preview.kei-tang.workers.dev`
- Preview smoke did **not** pass: `/en/contact` and `/zh/contact` return `500`.
- Local Next runtime control passes `/en/contact` and `/zh/contact` with `200`, so the contact failure is Cloudflare/OpenNext runtime-specific, not a generic Next page failure.
- Real form external delivery remains blocked: preview workers currently list only `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` as a secret, not Resend / Airtable / Turnstile secrets.

## 1. Credential / env finding

Current shell did not contain `CLOUDFLARE_API_TOKEN`.

Wrangler OAuth was logged in, but the successful preview deploy used the main repo env file:

```text
/Users/Data/Warehouse/Pipe/tianze-website/.env.local
```

Presence check, without printing values:

| Key | Status |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | present |
| `CLOUDFLARE_ACCOUNT_ID` | present |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | present |
| `RESEND_API_KEY` | absent |
| `AIRTABLE_API_KEY` | absent |
| `AIRTABLE_BASE_ID` | absent |
| `AIRTABLE_TABLE_NAME` | absent |
| `TURNSTILE_SECRET_KEY` | absent |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | absent |

## 2. Commands executed

### Initial canonical proof command

```bash
pnpm proof:cf:preview-deployed
```

Result: blocked.

Reason: the Conductor workspace itself had no `.env.local`, so the script could not find `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`.

Evidence:

```text
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/proof-cf-preview-deployed.txt
```

### Preview deploy with explicit env file

```bash
node scripts/cloudflare/deploy-phase6.mjs \
  --env preview \
  --env-file /Users/Data/Warehouse/Pipe/tianze-website/.env.local
```

Result: passed.

Evidence:

```text
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/deploy-phase6-preview-envfile.txt
```

Important lines:

- Server Actions secret sync completed for preview workers.
- `tianze-website-web-preview` deployed.
- `tianze-website-api-lead-preview` deployed.
- `tianze-website-gateway-preview` deployed.
- Gateway URL: `https://tianze-website-gateway-preview.kei-tang.workers.dev`

### Deployed smoke against gateway workers.dev

```bash
pnpm smoke:cf:deploy -- \
  --base-url https://tianze-website-gateway-preview.kei-tang.workers.dev
```

Result: failed.

Evidence:

```text
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/smoke-cf-deploy-gateway-workers.txt
```

Failure:

```text
Expected /en/contact to return 200, got 500
Expected /zh/contact to return 200, got 500
```

### Serial route probe against gateway workers.dev

Evidence:

```text
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/serial-preview-smoke-equivalent.txt
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/gateway-route-probe-after-failed-smoke.txt
```

Result:

| Route | Status |
| --- | --- |
| `/` | 307 to `/en` |
| `/invalid/contact` | 307 to `/en/contact` |
| `/fr/products/eu/fittings` | 307 to `/en/products/eu/fittings` |
| `/en` | 200 |
| `/zh` | 200 |
| `/api/health` | 200 |
| `/en/products` | 200 |
| `/en/products/north-america` | 200 |
| `/en/contact` | 500 |
| `/zh/contact` | 500 |

### Canonical preview domain probe

Target:

```text
https://preview.tianze-pipe.com
```

Result from this machine: fetch failed.

DNS result:

```text
198.18.59.119
```

Evidence:

```text
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/preview-domain-dns.txt
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/preview-domain-probe.txt
```

Interpretation: this environment cannot currently use `preview.tianze-pipe.com` as the smoke target. The successful deployed target is the workers.dev gateway URL.

### Local Next runtime control

Command shape:

```bash
PORT=3210 SECURITY_HEADERS_ENABLED=true NEXT_PUBLIC_SECURITY_MODE=strict pnpm start
```

Probe result:

| Route | Status |
| --- | --- |
| `/en/contact` | 200 |
| `/zh/contact` | 200 |
| `/en` | 200 |
| `/zh` | 200 |
| `/api/health` | 200 |

Evidence:

```text
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/local-next-contact-control.txt
```

Interpretation: contact page 500 is not reproduced by plain local Next runtime.

### Local OpenNext Cloudflare preview smoke

Command shape:

```bash
pnpm exec opennextjs-cloudflare preview --env preview
pnpm smoke:cf:preview:strict
```

Result: failed.

Evidence:

```text
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/local-opennext-preview-smoke-strict.txt
```

Failures:

```text
Expected /en to return 200, got 500
Expected /zh to return 200, got 500
Expected /en/contact to return 200, got 500
Expected /zh/contact to return 200, got 500
```

Interpretation: local OpenNext preview is also not clean, but its failure shape is broader than the deployed gateway, so it should be treated as a related Cloudflare/OpenNext runtime signal, not a perfect reproduction of deployed behavior.

### Runtime CSP proof

The package script:

```bash
pnpm security:csp:check
```

returned `143` while shutting down `next start`, so it did not provide a clean script-level pass.

Manual equivalent check was then run against local `next start`.

Evidence:

```text
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/security-csp-check-after-preview-build.txt
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/manual-csp-runtime-check.txt
```

Manual result:

```text
/en status=200 csp=present nonce=present inline=39 nonced=0 unnonced=39
/zh status=200 csp=present nonce=present inline=37 nonced=0 unnonced=37
manual CSP runtime check passed
```

Interpretation: current local runtime matches the existing CSP contract: `script-src` has a nonce, but App Router inline script elements remain unnonced and rely on `script-src-elem 'unsafe-inline'`. This changes FPH-016 from "runtime proof unavailable" to "runtime proof confirms why the current exception exists." It does **not** mean the CSP is ideal; it means removing `'unsafe-inline'` needs a separate Next/App Router proof plan.

### Preview secret list

Correct config-based secret list shows each preview worker currently has only:

```text
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
```

Evidence:

```text
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/secret-list-gateway-preview-config.txt
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/secret-list-web-preview-config.txt
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/secret-list-api-lead-preview-config.txt
```

Interpretation: real contact / inquiry / subscribe external delivery cannot be honestly claimed on this preview runtime.

## 3. Updated runtime verdict

```text
Cloudflare preview deploy: pass
Gateway workers.dev route smoke: partial fail
Official preview domain smoke: blocked from this environment
Local Next runtime contact page: pass
Local OpenNext preview: fail
Runtime CSP local proof: pass under current exception contract
External lead delivery: blocked
Full preview buyer flow: fail, because contact page returns 500 on deployed workers.dev
```

## 4. New blocker

The main new blocker is:

```text
Preview Cloudflare gateway returns 500 for /en/contact and /zh/contact.
```

This is more severe than the original Audit Run 1 local baseline because contact is a lead-generation page. It should be handled as the next repair/debug target before calling preview runtime ready.

## 5. Contact 500 systematic-debugging result

Status: root failure class confirmed; exact source line still needs a repair-branch proof.

What is confirmed:

- Fresh repro still fails:
  `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/live-gateway-contact-reprobe.txt`
- The gateway worker receives the request as `Ok`; the web worker emits the runtime error:
  `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/tail-gateway-pretty.txt`
  `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/tail-web-json.txt`
- Cloudflare web worker error:
  `Route "/[locale]/contact": Uncached data was accessed outside of <Suspense>.`
- `/en/products` in the same JSON tail has no exception.
- Local controls pass:
  `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/local-next-dev-contact-control.txt`
  `docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/local-next-contact-control.txt`
- `next build --debug-prerender` completes and marks `/[locale]/contact` as Partial Prerender, but does not reproduce the Cloudflare error:
  `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/next-build-debug-prerender.txt`

Narrow code correlation:

- `src/app/[locale]/contact/page.tsx` only wraps `<ContactForm />` in Suspense, not the full route body.
- Other async content pages that call content/message loaders, such as about/privacy/terms/OEM, wrap their content component in a page-level Suspense.
- The contact route registers `contactFormAction` in its page server-reference manifest:
  `.next/server/app/[locale]/contact/page/server-reference-manifest.json`
- The form hook binds that Server Action with `useActionState`:
  `src/components/forms/use-contact-form.ts:45-48`
- The action reads request headers when executed:
  `src/lib/actions/contact.ts:211-218`

Interpretation:

```text
Confirmed root-cause class:
Cloudflare/OpenNext is tripping Next Cache Components blocking-route while rendering /[locale]/contact.

Strong hypothesis:
The contact route has a dynamic/PPR boundary problem around its Server Action-backed form and Suspense placement. This is not yet source-mapped to one original TypeScript line.
```

## 6. Recommended next debugging target

Do not start by changing content or styling.

Start by isolating why the contact route differs across runtimes in a repair branch:

1. Keep deployed preview smoke as the failing test:
   `/en/contact` and `/zh/contact` must return `200`.
2. Try the smallest boundary change first:
   wrap the full `ContactContentBody` route output in a page-level `<Suspense>` fallback, matching the about/privacy/terms/OEM pattern.
3. If that does not close the error, split the Server Action-backed form island away from the prerendered route shell and keep the static fallback.
4. Re-run:
   - `node scripts/cloudflare/deploy-phase6.mjs --env preview --env-file /Users/Data/Warehouse/Pipe/tianze-website/.env.local`
   - `pnpm smoke:cf:deploy -- --base-url https://tianze-website-gateway-preview.kei-tang.workers.dev`
   - `pnpm exec wrangler tail tianze-website-web-preview --format=json --env-file /Users/Data/Warehouse/Pipe/tianze-website/.env.local`

Do not claim the full form delivery flow until preview has Turnstile, Resend, and Airtable credentials. Right now the route page itself is the blocker.

## 7. Process note

Two wrong worker-name secret-list attempts produced evidence files ending in:

```text
secret-list-gateway-preview.txt
secret-list-api-lead-preview.txt
```

They used the wrong combination of worker name and `--env`, causing `*-preview-preview`. The correct evidence files are the `*-config.txt` files listed above.

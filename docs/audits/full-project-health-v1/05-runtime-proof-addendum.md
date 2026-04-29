# Full Project Health Audit v1 - Runtime Proof Addendum

## 0. Short conclusion

Preview runtime proof was first executed during the baseline audit, then rerun
after the repair wave.

Result:

- Cloudflare auth/deploy blocker is resolved for preview when using the redacted main repo env file.
- Preview phase6 deployment succeeded for all three workers:
-  - `<redacted-web-preview-worker>`
  - `<redacted-api-lead-preview-worker>`
  - `<redacted-gateway-preview-worker>`
- Baseline preview smoke did **not** pass: `/en/contact` and `/zh/contact` returned `500`.
- Repair-wave preview smoke now passes: `/en/contact` and `/zh/contact` return `200`.
- Local Next runtime control also passes `/en/contact` and `/zh/contact` with `200`.
- Real form external delivery remains blocked: preview workers currently list only `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` as a secret, not Resend / Airtable / Turnstile secrets.

## 1. Credential / env finding

Current shell did not contain `CLOUDFLARE_API_TOKEN`.

Wrangler OAuth was logged in, but the successful preview deploy used the redacted main repo env file:

```text
<redacted-main-repo-env-file>
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
  --env-file <redacted-main-repo-env-file>
```

Result: passed.

Evidence:

```text
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/deploy-phase6-preview-envfile.txt
```

Important lines:

- Server Actions secret sync completed for preview workers.
- `<redacted-web-preview-worker>` deployed.
- `<redacted-api-lead-preview-worker>` deployed.
- `<redacted-gateway-preview-worker>` deployed.
- Gateway URL: `<redacted-workers-dev-gateway-url>`

### Deployed smoke against gateway workers.dev

```bash
pnpm smoke:cf:deploy -- \
  --base-url <redacted-workers-dev-gateway-url>
```

Result after repair wave: passed.

Evidence:

```text
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/smoke-cf-deploy-gateway-workers.txt
```

Output:

```text
[post-deploy-smoke] All checks passed
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
<redacted-preview-domain>
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

Interpretation: this environment cannot currently use `<redacted-preview-domain-host>` as the smoke target. The successful deployed target is the workers.dev gateway URL.

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

The package script was rerun after the FPH-016 proof harness was tightened:

```bash
CSP_CHECK_OUTPUT_PATH=docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/fph016-csp-runtime-proof.txt pnpm security:csp:check
```

Result: passed.

Evidence:

```text
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/security-csp-check-after-preview-build.txt
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/manual-csp-runtime-check.txt
docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/fph016-csp-runtime-proof.txt
```

Fresh FPH-016 result at `origin/main` / `HEAD` `0ce02d3`:

```text
/en status=200 csp=present script-src nonce=present unsafe-inline=false script-src-elem unsafe-inline=true inline total=38 nonced=0 unnonced=38 unnonced-executable=37 unnonced-non-executable=1
  executable categories: next-rsc-flight-payload=36, next-themes-init=1
  non-executable categories: project-json-ld=1
/zh status=200 csp=present script-src nonce=present unsafe-inline=false script-src-elem unsafe-inline=true inline total=35 nonced=0 unnonced=35 unnonced-executable=34 unnonced-non-executable=1
  executable categories: next-rsc-flight-payload=33, next-themes-init=1
  non-executable categories: project-json-ld=1
```

Interpretation: current local runtime matches the existing CSP contract: `script-src` has a nonce and does not allow `'unsafe-inline'`, but App Router / RSC flight payloads and the `next-themes` init script remain unnonced executable inline scripts in built HTML and rely on `script-src-elem 'unsafe-inline'`. Project JSON-LD is present as an unnonced non-executable data block, so it is evidence of inline markup shape but not the reason the execution exception is needed. This changes FPH-016 from "runtime proof unavailable" to "runtime proof confirms why the current exception exists." It does **not** mean the CSP is ideal; it means removing `'unsafe-inline'` needs a separate strict-CSP plan that accounts for Next.js dynamic rendering / Cache Components trade-offs.

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
Gateway preview route smoke: pass after repair wave
Official preview domain smoke: blocked from this environment
Local Next runtime contact page: pass
Local OpenNext preview: historical baseline fail for contact route
Runtime CSP local proof: pass under current exception contract
External lead delivery: blocked
Full preview buyer flow: blocked only by external delivery credentials, not by contact route 500
```

## 4. Baseline blocker and repair status

The baseline blocker was:

```text
Preview Cloudflare gateway returns 500 for /en/contact and /zh/contact.
```

Repair status:

```text
Closed for route smoke. The deployed preview gateway now returns 200 for both contact routes, and post-deploy smoke passes.
```

## 5. Contact 500 systematic-debugging result

Status: root failure class was confirmed during debugging; repair-wave proof closed the deployed route failure.

What is confirmed:

- Historical fresh repro failed:
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

## 6. Repair-wave verification target

The original debugging target was handled in the repair wave:

1. Keep deployed preview smoke as the route proof.
2. Require `/en/contact` and `/zh/contact` to return `200`.
3. Do not claim real form delivery until preview has Turnstile, Resend, and Airtable credentials.

Current route proof is recorded in `07-repair-closure.md`.

## 7. Process note

Two wrong worker-name secret-list attempts produced evidence files ending in:

```text
secret-list-gateway-preview.txt
secret-list-api-lead-preview.txt
```

They used the wrong combination of worker name and `--env`, causing `*-preview-preview`. The correct evidence files are the `*-config.txt` files listed above.

# Contact preview 500 debug note

## 0. Outcome

During the baseline debug run, `/en/contact` and `/zh/contact` were confirmed failing on the deployed Cloudflare preview gateway:

```text
<redacted-workers-dev-gateway-url>/en/contact -> 500
<redacted-workers-dev-gateway-url>/zh/contact -> 500
```

This was a preview runtime blocker for the lead-generation page. It was not a generic local Next.js page failure: both local `next dev` and local `next start` controls returned 200 for the same contact routes.

Repair-wave status:

```text
pnpm smoke:cf:deploy -- --base-url <redacted-workers-dev-gateway-url>
[post-deploy-smoke] All checks passed
```

Current deployed route smoke returns 200 for both contact routes.

## 1. Phase 1 - Root cause investigation

### Error read

Cloudflare web worker tail reports:

```text
Route "/[locale]/contact": Uncached data was accessed outside of <Suspense>.
```

The same JSON tail shows `/en/products` returns 200 without exceptions.

Evidence:

- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/tail-web-json.txt`
- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/tail-web-pretty.txt`

### Reproduction

Fresh gateway repro:

- `/en/contact` -> 500
- `/zh/contact` -> 500
- `/en` -> 200
- `/zh` -> 200
- `/api/health` -> 200

Evidence:

- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/live-gateway-contact-reprobe.txt`
- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/tail-json-trigger-fetch.txt`

### Failing component boundary

The gateway worker sees the routed contact requests as `Ok`; the web worker is where the exception appears.

Evidence:

- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/tail-gateway-pretty.txt`
- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/tail-web-json.txt`

### Local controls

Local controls pass:

- `next dev`: `/en/contact`, `/zh/contact`, `/en`, `/zh`, `/api/health` all 200.
- `next start`: `/en/contact`, `/zh/contact`, `/en`, `/zh`, `/api/health` all 200.

Evidence:

- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/local-next-dev-contact-control.txt`
- `docs/audits/full-project-health-v1/evidence/runtime-proof-addendum/local-next-contact-control.txt`

## 2. Phase 2 - Pattern analysis

Working deployed preview routes:

- `/en`, `/zh`
- `/en/products`, `/zh/products`
- `/en/products/north-america`, `/zh/products/north-america`
- `/en/about`, `/zh/about`
- `/en/privacy`, `/zh/privacy`
- `/en/terms`, `/zh/terms`
- `/en/oem-custom-manufacturing`, `/zh/oem-custom-manufacturing`

Evidence:

- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/live-gateway-products-reprobe.txt`
- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/live-gateway-related-pages-reprobe.txt`

Key differences:

- `src/app/[locale]/contact/page.tsx` wraps only `<ContactForm />` in `<Suspense>`.
- About/privacy/terms/OEM pages wrap the page content component in a page-level `<Suspense>`.
- Contact route is the probed public page that registers a Server Action reference in its page manifest:
  `.next/server/app/[locale]/contact/page/server-reference-manifest.json`
- Contact form binds that action with `useActionState`:
  `src/components/forms/use-contact-form.ts:45-48`
- The action reads request headers when executed:
  `src/lib/actions/contact.ts:211-218`

## 3. Phase 3 - Current hypothesis

Confirmed root-cause class:

```text
Cloudflare/OpenNext is tripping Next Cache Components blocking-route while rendering /[locale]/contact.
```

Strong hypothesis:

```text
The contact route has a dynamic/PPR boundary problem around its Server Action-backed form and Suspense placement.
```

Important limitation:

The exact original TypeScript line is not confirmed. Cloudflare JSON tail provides a minified stack, and `next build --debug-prerender` completes without reproducing the deployed Cloudflare error.

Evidence:

- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/next-build-debug-prerender.txt`
- `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/tail-web-json.txt`

## 4. Phase 4 - Implementation status

No business code was changed in the baseline audit/debug run. The later repair wave isolated the contact form runtime boundary and verified deployed preview route smoke.

Completed repair branch sequence:

1. Kept deployed preview smoke as the proof.
2. Isolated the Server Action-backed client form island from the prerendered contact shell.
3. Redeployed preview and verified:
   - `/en/contact` -> 200
   - `/zh/contact` -> 200

Do not claim real form delivery until preview has non-production Turnstile, Resend, and Airtable credentials. Current preview secret proof only shows `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`.

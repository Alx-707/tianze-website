# Stock MVP Deployment Runbook (Single-Worker, Proven Path)

**Status**: Historical strategy memo | Path: Option 1 (Recommended)

> **Status update (2026-04-10):** This file is no longer the canonical execution runbook for current Cloudflare deployment behavior. Use `docs/guides/CLOUDFLARE-OFFICIAL-ALIGNMENT-RUNBOOK.md` for active proof commands and `docs/guides/CLOUDFLARE-DEPLOYMENT-ASSESSMENT.md` for retained patch truth. Inline commands below that use plain `build:cf` / `preview:cf` reflect historical strategy context unless explicitly updated.

---

## Overview

### What is Stock MVP?

**Stock MVP** is the simplest, proven Cloudflare deployment path for Tianze Website:

- **1 single worker** (default OpenNext adapter, no multi-worker orchestration)
- **Simple wrangler deploy** (no custom phase6 logic, no split-function topology)
- **Verified locally**: `pnpm smoke:cf:preview` already passes (pages, redirects, cookies, headers)
- **Risk**: Minimal (stock OpenNext, no custom orchestration)
- **Build time**: ~90s (Webpack build-cf path, includes manifest patching)
- **Deployment time**: ~30s (wrangler deploy)

### Why Choose Stock Now?

1. **Proven local validation**: Pages/redirects/security headers already validated via `pnpm smoke:cf:preview`
2. **No blockers**: Build succeeds, manifest patching works, Cloudflare entry point functional
3. **Fast path to production**: 1-2 hours from decision to live deployment
4. **Parallel phase6 staging**: Stock production doesn't block phase6 staging validation (can proceed in parallel)
5. **Low rollback risk**: Single worker, simple wrangler rollback (restore previous worker version or revert environment binding)

### Decision Context

This runbook implements **Option 1** from `PHASE6-PRODUCTION-READINESS.md`:
- ✅ Deploy stock MVP to production **now** (proven, low risk, high confidence)
- ⏳ Begin phase6 staging validation **in parallel** (4-6 weeks, Tier 1 gaps closure)
- 🎯 Evaluate phase6 production readiness **after** staging proof (no blockers holding stock back)

---

## Pre-Deployment Validation Checklist

**Required**: All 8 checks must PASS before proceeding to deployment.

### ✅ Check 1: Build Succeeds In Current Stock Route B Mode

```bash
pnpm clean:next-artifacts && pnpm build:cf 2>&1 | tee cf_build.log
```

**Expected output**:
```
OpenNext build complete.
```

**Exit code**: Must be `0`

**If build fails**: treat it as a current stock build/runtime regression; do not assume the old patch layer still exists.

**Validation**:
- ✅ No `TypeScript` errors
- ✅ No `next build` failures
- ✅ No `opennextjs-cloudflare` compilation errors
- ✅ `.open-next/server-functions/default/handler.mjs` is generated and > 100KB
- ✅ Exit code = 0

**Failure guidance**: If build fails, check:
1. Node version: `node -v` (should be 20.19.x, not 22.x)
2. Dependencies installed: `pnpm install` and `pnpm update -r --recursive` (resolve any peer dependency warnings)
3. Environment: `.env.local` has `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`
4. TypeScript: `pnpm type-check` must pass (if it fails, fix before build)

---

### ✅ Check 2: Build Output Verified

```bash
pnpm smoke:cf:preview
```

**Expected output**:
- locale pages and contact pages return 200
- redirects, cookie flags, and internal-header non-leakage remain correct

**Exit code**: Must be `0`

**What it proves**: The current stock Route B build can proceed into local preview proof without repo-local post-build mutation.

**Failure guidance**: If build fails, treat it as a current stock build/runtime regression; do not assume the old patch layer still exists.

---

### ✅ Check 3: Wrangler Configuration Valid

```bash
pnpm exec wrangler publish --dry-run
```

**Expected output**:
```
⛅ wrangler [version]
Total size: [number]KB

Would publish to:
[environment name] (production)
```

**Exit code**: Must be `0`

**What it proves**:
- `wrangler.jsonc` syntax is valid
- All environment bindings (KV, D1, R2, Analytics, etc.) are correctly defined
- Account ID and API token are present and valid
- Production environment is active and writable

**Failure guidance**: If validation fails:
1. Check `CLOUDFLARE_API_TOKEN` is set and valid: `echo $CLOUDFLARE_API_TOKEN | wc -c` (should be ~88 chars)
2. Check `CLOUDFLARE_ACCOUNT_ID` is set: `echo $CLOUDFLARE_ACCOUNT_ID` (should be 32-char hex)
3. Check `wrangler.jsonc` syntax: `pnpm exec wrangler publish --dry-run 2>&1 | head -20`
4. If API token expired, regenerate at https://dash.cloudflare.com/profile/api-tokens

---

### ✅ Check 4: Environment Secrets Present

```bash
# Check all required production secrets are set
REQUIRED_SECRETS=(
  "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY"
  "RATE_LIMIT_PEPPER"
  "TURNSTILE_SECRET_KEY"
  "RESEND_API_KEY"
  "AIRTABLE_API_KEY"
  "AIRTABLE_BASE_ID"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
  if [ -z "${!secret}" ]; then
    echo "❌ Missing: $secret"
  else
    echo "✅ Found: $secret"
  fi
done
```

**Expected output**:
```
✅ Found: NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
✅ Found: RATE_LIMIT_PEPPER
✅ Found: TURNSTILE_SECRET_KEY
✅ Found: RESEND_API_KEY
✅ Found: AIRTABLE_API_KEY
✅ Found: AIRTABLE_BASE_ID
```

**What it proves**: All critical runtime secrets are available in the current shell environment (they will be synced to Cloudflare during deployment).

**Failure guidance**: If any secret is missing:
1. Load from `.env.production` (if using local file): `source .env.production`
2. Load from secret management service (Vercel KV, 1Password, AWS Secrets Manager, etc.)
3. Verify keys are not empty or malformed:
   - `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` should be 44+ chars (base64)
   - `RATE_LIMIT_PEPPER` should be 32+ chars
   - `TURNSTILE_SECRET_KEY` should be 40+ chars
   - `RESEND_API_KEY` should start with `re_`
   - `AIRTABLE_API_KEY` should start with `pat`
   - `AIRTABLE_BASE_ID` should be 17 chars (e.g., `appXXXXXXXXXXXXXX`)

---

### ✅ Check 5: Server Actions Key Synced (Pre-Deployment)

> **Legacy note (2026-04-11):** This check belonged to the old phase6 split-worker rollout. The related sync helper has now been removed from the main tree, so this section remains historical context only.

```bash
# Legacy phase6 example removed from main tree.
```

**Expected output**:
```
[server-actions-key] printing server actions secret contract...
[server-actions-key] target workers: tianze-website | envs: production
[server-actions-key] [dry-run] pnpm exec wrangler secret put NEXT_SERVER_ACTIONS_ENCRYPTION_KEY --name tianze-website --env production
[server-actions-key] sync complete
```

**Exit code**: Must be `0`

**What it proved**: The legacy phase6 key sync script could once reach Wrangler and correctly identify the target worker name and environment.

**⚠️ IMPORTANT**: This was a DRY-RUN for the old phase6 split-worker flow. The helper itself is no longer present in the main tree.

**Failure guidance**: If dry-run fails:
1. Check Wrangler is installed: `pnpm exec wrangler --version`
2. Check API token is valid: `pnpm exec wrangler whoami`
3. Check worker name in `wrangler.jsonc` matches: `grep '"name"' wrangler.jsonc`

---

### ✅ Check 6: Turnstile Keys Valid

```bash
# Verify both public and secret keys are set and correctly formatted
echo "Public key: $NEXT_PUBLIC_TURNSTILE_SITE_KEY"
echo "Public key length: ${#NEXT_PUBLIC_TURNSTILE_SITE_KEY}"
echo "Secret key present: $([ -n "$TURNSTILE_SECRET_KEY" ] && echo 'YES' || echo 'NO')"
echo "Secret key length: ${#TURNSTILE_SECRET_KEY}"
```

**Expected output**:
```
Public key: 0x4AAAAAAA...                          # 36-40 chars, starts with 0x4
Public key length: 40
Secret key present: YES
Secret key length: 40
```

**What it proves**:
- Cloudflare Turnstile keys are present in the current environment
- Keys have correct format (public starts with `0x4`, length 36-40)
- Contact form bot protection will be active on Cloudflare

**Failure guidance**: If keys are missing or malformed:
1. Obtain from Cloudflare Dashboard: https://dash.cloudflare.com/?to=/:account/turnstile
2. Verify format: public keys always start with `0x4` or `0x2` (testing), never start with `sk_`
3. Set in environment: `export NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4..."` and `export TURNSTILE_SECRET_KEY="0x..."`

---

### ✅ Check 7: i18n Locale Files Synced

```bash
pnpm validate:translations
```

**Expected output**:
```
[i18n-sync] scanning messages/ directory...
[i18n-sync] en/critical.json: 156 keys ✓
[i18n-sync] en/deferred.json: 312 keys ✓
[i18n-sync] zh/critical.json: 156 keys ✓
[i18n-sync] zh/deferred.json: 312 keys ✓
[i18n-sync] all translations synchronized
```

**Exit code**: Must be `0`

**What it proves**:
- English and Chinese translation files are in sync
- No missing keys in either language
- No orphaned keys that shouldn't exist
- Runtime i18n will not fail due to missing translations

**Failure guidance**: If validation fails:
1. Run sync tool: `pnpm i18n:sync`
2. Check for conflicting keys: `diff messages/en/critical.json messages/zh/critical.json | grep "^<\|^>"`
3. If keys are legitimately different (e.g., SaaS branding), document in `docs/guides/POLICY-SOURCE-OF-TRUTH.md`

---

### ✅ Check 8: Local Smoke Test Passes (Pages, Redirects, Security)

```bash
pnpm smoke:cf:preview
```

**Expected output**:
```
[preview-smoke] Testing Cloudflare preview...
[preview-smoke] / -> 307/308 (redirect to /en) ✓
[preview-smoke] /en -> 200 ✓
[preview-smoke] /zh -> 200 ✓
[preview-smoke] /en/contact -> 200 ✓
[preview-smoke] /zh/contact -> 200 ✓
[preview-smoke] /invalid/locale -> 307/308 (redirect to /en) ✓
[preview-smoke] CSP nonce header present ✓
[preview-smoke] Language cookie set ✓
[preview-smoke] All checks passed
```

**Exit code**: Must be `0`

**What it proves**:
- Pages render without 500 errors
- Locale redirects work correctly
- Security headers (CSP nonce) are present
- i18n cookie is set and persists across requests
- Middleware and routing are functional

**Failure guidance**: If smoke test fails:
1. Check build is fresh: `ls -la .open-next/server-functions/default/handler.mjs` (should be recent, < 5 min old)
2. Run local Cloudflare preview: `pnpm preview:cf` (in separate terminal) and check for errors
3. Check middleware is valid: `pnpm exec wrangler publish --dry-run 2>&1 | grep -i error`
4. If specific page 500s, check server logs: `pnpm preview:cf 2>&1 | grep -A 5 "500"`

---

## Deployment Steps

**Prerequisites**: All 8 checks from section above must PASS.

### Step 1: Confirm Go/No-Go Decision

**Stakeholder sign-off required**:
- [ ] Product: Approve stock MVP for production release?
- [ ] Engineering: All blockers closed, build verified?
- [ ] Ops: Production Cloudflare account access confirmed?

**Go-decision**: Proceed to Step 2.  
**No-go decision**: Document blocker, defer to next sprint.

---

### Step 2: Pre-Deployment Backup

Create a snapshot of the current production state (for rollback if needed).

```bash
# Export current worker metadata (for rollback reference)
pnpm exec wrangler deployments list --name tianze-website --env production > /tmp/cf-deploy-backup.json

# Note the top deployment ID and timestamp
echo "Current deployment ID: $(jq -r '.[0].id' /tmp/cf-deploy-backup.json)"
echo "Current deployed at: $(jq -r '.[0].created_on' /tmp/cf-deploy-backup.json)"
```

**Expected output**:
```
Current deployment ID: abc123def456...
Current deployed at: 2026-04-01T10:30:00Z
```

**What this proves**: You have a reference point for rollback (previous worker version ID).

---

### Step 3: Execute Deployment

```bash
# Run the stock deployment command
pnpm deploy:cf
```

**This command expands to**:
```bash
pnpm clean:next-artifacts && pnpm build:cf && pnpm exec wrangler deploy --env production
```

**Expected progress** (watch the output):

1. **Clean phase** (5-10s):
   ```
   [clean-next-build-artifacts] Removing .next, .open-next, .wrangler/tmp...
   ```

2. **Build phase** (90-120s):
   ```
   [build-webpack] Cleaning build artifacts...
   [build-webpack] Running next build... (Turbopack + TypeScript 5.9)
   [build-webpack] Running opennextjs-cloudflare build...
   [build-webpack] manifest patch check: not required or applied
   [build-webpack] Build complete: .open-next/dist
   Total output size: ~2.8MB
   ```

3. **Wrangler deploy phase** (30-60s):
   ```
   ⛅ wrangler [version]
   ✨ Successfully published to http://tianze-website.ACCOUNT_HASH.workers.dev/
   Uploaded worker code at {version}: {timestamp}
   ```

**Exit code**: Must be `0` for all three phases.

**CRITICAL**: Do NOT interrupt this command once started. If interrupted mid-deployment:
- Worker code may be in inconsistent state
- Proceed to Step 5 (Rollback) immediately
- Do not retry without investigation

---

### Step 4: Post-Deployment Verification (Real Deployment)

Once `pnpm deploy:cf` completes with exit code 0, proceed to smoke testing on the **real, live deployment**.

#### 4a: Obtain Live URL

```bash
# Cloudflare auto-generates a deployment URL
LIVE_URL="https://tianze-website.ACCOUNT_HASH.workers.dev"
# Or use custom domain if configured:
LIVE_URL="https://tianze.com"

echo "Live deployment URL: $LIVE_URL"
```

**Note**: Replace `ACCOUNT_HASH` with your actual Cloudflare account hash, or use your custom domain.

#### 4b: Run Smoke Tests on Live Deployment

```bash
pnpm smoke:cf:deploy -- --base-url "$LIVE_URL"
```

**Expected output**:
```
[post-deploy-smoke] Probing https://tianze-website.ACCOUNT_HASH.workers.dev
[post-deploy-smoke] / -> 307 (redirect to /en) ✓
[post-deploy-smoke] /en -> 200 ✓
[post-deploy-smoke] /zh -> 200 ✓
[post-deploy-smoke] /en/contact -> 200 ✓
[post-deploy-smoke] /zh/contact -> 200 ✓
[post-deploy-smoke] /invalid/contact -> 307 (redirect to /en/contact) ✓
[post-deploy-smoke] /api/health -> 200 ✓
[post-deploy-smoke] All checks passed
```

**Exit code**: Must be `0`

**What it tests** (from `post-deploy-smoke.mjs`):
- ✅ Root redirect (`/` → `/en`) works
- ✅ Homepage renders (`/en`, `/zh`)
- ✅ Health check responds (`/api/health` → 200)
- ✅ Contact form page renders (`/en/contact`, `/zh/contact`)
- ✅ Invalid locale redirect (`/invalid/contact` → `/en/contact`)
- ✅ All response statuses are 200 (or 307/308 for redirects)

**Failure guidance**: If smoke test fails:
1. Check URL is reachable: `curl -I "$LIVE_URL/"` (should be 200 or 3xx, not 502/503)
2. Check deployment actually deployed: `pnpm exec wrangler deployments list --name tianze-website --env production | head -1`
3. If most checks pass but `/api/health` fails: This is expected if gateway is not yet configured; proceed anyway (health check is phase6 concern)
4. If pages are 500: Check Cloudflare error logs or proceed to Step 5 (Rollback)

---

### Step 5: Sync Server Actions Key (Post-Deployment)

> **Legacy note (2026-04-11):** This post-deploy step also belonged to the old phase6 split-worker rollout. Under the current Route B stock deployment path, this is no longer an active production step.

Now that the worker is live, note that the old phase6 secret-sync step is no longer available in the main tree.

```bash
# Legacy phase6 deploy secret-sync helper has been removed from the main tree.
```

**Expected output**:
```
[server-actions-key] printing server actions secret contract...
[server-actions-key] target workers: tianze-website | envs: production
[server-actions-key] syncing NEXT_SERVER_ACTIONS_ENCRYPTION_KEY -> worker=tianze-website env=production
[server-actions-key] sync complete
```

**Exit code**: Must be `0`

**What it did**:
- Sends the key to Cloudflare Workers Secret Manager
- Worker can now sign and decrypt Server Actions (e.g., Contact form submissions, inquiry submissions)
- Without this, Server Actions will fail with "missing encryption key" error

**Failure guidance**: If sync fails:
1. Check key format: `echo $NEXT_SERVER_ACTIONS_ENCRYPTION_KEY | wc -c` (should be ~44 chars)
2. Check Wrangler access: `pnpm exec wrangler whoami`
3. If API token expired: Regenerate and retry
4. If worker doesn't exist: Check deployment from Step 3 actually succeeded

---

### Step 6: Final Verification (Transactional Test)

Test a real transactional endpoint (Contact form) to verify end-to-end functionality.

```bash
curl -X POST "https://tianze-website.ACCOUNT_HASH.workers.dev/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smoke Test",
    "email": "test@example.com",
    "phone": "+86 010-1234-5678",
    "company": "Test Company",
    "message": "Smoke test contact submission",
    "locale": "en"
  }'
```

**Expected response** (one of):
- ✅ **200**: Contact submission accepted
  ```json
  {"success":true,"submissionId":"sub_xxx"}
  ```
- ✅ **422**: Validation error (e.g., invalid Turnstile token) — still proves API is working
  ```json
  {"error":"Turnstile verification failed"}
  ```
- ❌ **500**: Server error — BLOCKER, proceed to Step 7 (Rollback)

**If 200 response**: Check Airtable to verify submission was recorded:
1. Log into Airtable: https://airtable.com/
2. Navigate to base `AIRTABLE_BASE_ID` (from env)
3. Check latest record in Contact/Inquiry table
4. Verify it contains: `name`, `email`, `phone`, `company`, `message`, timestamp

**Failure guidance**: If submission fails or doesn't appear in Airtable:
1. Check Resend API key is valid: Test with `curl https://api.resend.com/emails -H "Authorization: Bearer $RESEND_API_KEY"`
2. Check Airtable credentials: `curl https://api.airtable.com/v0/meta/bases -H "Authorization: Bearer $AIRTABLE_API_KEY"`
3. If API credentials invalid, fix and redeploy (Step 3) or proceed to rollback (Step 7)

---

## Stock Deployment Complete ✅

If all smoke tests pass and transactional test succeeds, **stock MVP is now live**.

**Next steps**:
1. Monitor production logs for 24 hours: `pnpm logs:cf:production` (if tool exists; else check Cloudflare Dashboard)
2. Document deployment timestamp and version: Record in release notes or deployment log
3. Begin phase6 staging validation in parallel (see Section "Phase6 Parallel Staging Roadmap")

---

## Rollback Plan (If Needed)

Use this only if post-deployment smoke test **fails** or production experiences critical issues.

### Rollback Decision Criteria

**Execute rollback if ANY of these are true**:
- [ ] Smoke test fails with status 500 on `/`, `/en`, or `/api/health`
- [ ] Contact form consistently rejects valid submissions (not due to Turnstile)
- [ ] Cloudflare dashboard shows worker error rate > 5% sustained for > 5 minutes
- [ ] User reports indicate site is down or non-functional

### Rollback Execution (4 Steps)

#### Step 1: Identify Previous Deployment

```bash
# List recent deployments
pnpm exec wrangler deployments list --name tianze-website --env production --limit 5

# Output example:
# ID                          Created                 Status
# xyz789abc...               2026-04-01T10:30:00Z    active
# abc123def...               2026-03-28T15:45:00Z    superseded
# def456ghi...               2026-03-25T12:00:00Z    superseded
```

**Choose the most recent "superseded" deployment** (usually the one right before current "active").

Record: `PREVIOUS_DEPLOYMENT_ID=abc123def...`

#### Step 2: Rollback via Wrangler

```bash
# Rollback to previous deployment
pnpm exec wrangler rollback \
  --name tianze-website \
  --env production \
  --deployment-id abc123def...
```

**Expected output**:
```
✨ Successfully rolled back to deployment abc123def...
```

**Exit code**: Must be `0`

#### Step 3: Verify Rollback

```bash
# Run smoke test on the rolled-back deployment
pnpm smoke:cf:deploy -- --base-url "https://tianze-website.ACCOUNT_HASH.workers.dev"
```

**Expected**: All smoke tests pass (same as before rollback).

#### Step 4: Investigate Root Cause

**Do NOT re-deploy** until root cause is identified:

1. **Build issue**: 
   - Run `pnpm build:cf` locally
   - Check TypeScript errors: `pnpm type-check`
   - Inspect `cf_build.log` directly for current stock build/runtime regressions

2. **Secrets issue**:
    - Verify all required env vars present: (Check 4 from validation section)
    - Legacy phase6 only: verify from historical rollout records; the old sync helper is no longer present in the main tree

3. **Deployment issue**:
   - Check Cloudflare Dashboard for worker errors: https://dash.cloudflare.com/?to=/:account/workers
   - Check recent requests/errors in analytics

4. **Environmental issue**:
   - Check Airtable, Resend, Turnstile APIs are accessible
   - Test API credentials with curl (see Step 6 of deployment)

**Once root cause is fixed**: Return to "Deployment Steps" section and re-deploy.

---

## Phase6 Parallel Staging Roadmap

Once stock MVP is live, begin phase6 validation **in parallel** (does not block or delay stock production).

### Timeline

- **Week 1-2** (This week if approved): Deploy phase6 to staging environment
- **Week 2-3**: Validate real traffic, multi-worker coordination, split-function topology
- **Week 3-4**: Stress test, rollback procedures, monitoring/alerting setup
- **Week 4+**: Prepare phase6 production runbook, schedule production migration

### Go/No-Go Criteria for Phase6 Production

**MANDATORY (Tier 1)** — Must all PASS before phase6 production:
- [ ] Staging phase6 deployment succeeds and all smoke tests pass
- [ ] Real traffic (synthetic or limited user traffic) validates without errors for 1 week
- [ ] Split-worker coordination (gateway → web → apiLead → etc.) verified end-to-end
- [ ] Rollback procedure tested and confirmed working on staging

**RECOMMENDED (Tier 2)** — Should PASS for production confidence:
- [ ] Stress test (1000+ req/s) shows no worker crashes or timeout cascades
- [ ] Monitoring/alerting configured (worker error rate, latency, cold starts)
- [ ] Phase6 production runbook drafted and reviewed

**NICE-TO-HAVE (Tier 3)** — Can defer to post-production:
- [ ] Route-level profiling (API latency, worker duration) analyzed and optimized
- [ ] Advanced traffic shadowing (1% real traffic duplicated to phase6 staging)

### Phase6 Staging Deployment (Command Reference)

> **Legacy note (2026-04-11):** The old `deploy-phase6.mjs` helper has been removed from the main tree. This section remains historical context only.

```bash
# Build phase6 workers
node scripts/cloudflare/build-phase6-workers.mjs

# Deploy helper removed from main tree; restore a dedicated legacy-only deploy step before using phase6 again.

# Verify staging deployment
pnpm smoke:cf:deploy -- --base-url <preview-gateway-url>
```

**Details**: Refer to `PHASE6-PRODUCTION-READINESS.md` for full phase6 decision framework and gap analysis.

---

## Decision Gates & Go/No-Go Criteria

### Stock MVP Go/No-Go Gate

**Go (Proceed to Deployment)**:
- ✅ All 8 pre-deployment checks PASS
- ✅ Product approval obtained
- ✅ On-call engineer assigned for monitoring first 24h

**No-Go (Defer Deployment)**:
- ❌ Any pre-deployment check FAILS
- ❌ Smoke test fails after deployment
- ❌ Product blocker identified
- ❌ On-call engineer unavailable

**Default**: If decision is unclear, defer to next week (no penalty; stock MVP is proven, not urgent).

### Phase6 Parallel Staging Gate

**Begin Phase6 Staging** (once stock MVP is live):
- ✅ Stock MVP production deployment succeeded
- ✅ 24h monitoring completed without critical issues
- ✅ Phase6 staging environment provisioned (worker names, KV, D1, bindings)

**Defer Phase6** (stock production doesn't block this):
- ⏳ If critical stock production issue found and requires re-architecture
- ⏳ If phase6 staging environment not ready (infrastructure delay)

**Note**: Phase6 staging can begin before stock 24h monitoring is complete; they are independent.

---

## FAQs & Troubleshooting

### Q: Can I deploy stock MVP without phase6 staging running?

**A**: Yes, completely independent. Stock MVP is production-ready on its own. Phase6 staging is validation work only (no impact on stock).

---

### Q: What if smoke test passes locally but fails on live deployment?

**A**: This usually indicates environment difference (missing secrets, wrong Turnstile keys, or API credential mismatch). Check:
1. Legacy phase6 only: confirm any required secret sync from historical rollout records; the old helper is no longer present in the main tree
2. Turnstile keys are correct: Verify in Cloudflare Dashboard
3. API credentials (Airtable, Resend) are active and not rate-limited

---

### Q: Can I enable minification on stock for performance?

**A**: Not recommended for MVP. Minification is optional (currently disabled in `wrangler.jsonc`) and adds risk with no proven benefit. Defer to phase6 optimization pass.

---

### Q: How do I monitor stock production after deployment?

**A**: 
1. **Cloudflare Dashboard**: https://dash.cloudflare.com/?to=/:account/workers (view error rate, requests)
2. **Real-time logs**: `pnpm logs:cf:production` (if tool exists)
3. **Synthetic monitoring**: Set up Uptimerobot or Pingdom to ping `/api/health` every 5 minutes
4. **Error tracking**: Check Sentry (if enabled) or review Cloudflare error logs daily for first week

---

### Q: What's the production URL after deployment?

**A**: 
- **Worker default URL**: `https://tianze-website.ACCOUNT_HASH.workers.dev`
- **Custom domain** (if configured): `https://tianze.com` or your domain
- **Staging URL** (for phase6): Will be provided after staging deploy

---

### Q: Can I roll back without using the rollback command?

**A**: Yes, two alternative approaches:
1. **Git revert + redeploy**: `git revert HEAD && pnpm deploy:cf`
2. **Manual wrangler**: `pnpm exec wrangler publish --env production` (re-publishes current working directory)

Wrangler rollback is preferred because it's instant (no rebuild).

---

### Q: How long until phase6 production?

**A**: Estimated 4-6 weeks after stock MVP is live (parallel validation track). Depends on staging validation results. No hard deadline.

---

## Appendix: Command Reference

### Pre-Deployment

```bash
pnpm clean:next-artifacts && pnpm build:cf              # Build
pnpm smoke:cf:preview                                   # Local validation
cat cf_build.log  # Inspect current stock build/runtime failures directly
pnpm validate:translations                              # i18n check
```

### Deployment

```bash
pnpm deploy:cf                                          # Full deployment
pnpm smoke:cf:deploy -- --base-url "$URL"              # Post-deploy validation
# Legacy phase6 secret-sync helper removed from main tree
```

### Rollback

```bash
pnpm exec wrangler deployments list --name tianze-website --env production  # List deployments
pnpm exec wrangler rollback --name tianze-website --env production --deployment-id <ID>  # Rollback
```

### Monitoring

```bash
pnpm exec wrangler deployments list --name tianze-website --env production  # Check current deployment
pnpm preview:cf                                         # Local Cloudflare preview
```

---

## Sign-Off

**Prepared by**: Claude (Librarian) | Phase 3 Analysis  
**Status**: Ready for stakeholder review and sign-off  
**Last updated**: 2026-04-09

---

**Next step**: Stakeholder review and approval to proceed with stock MVP deployment.

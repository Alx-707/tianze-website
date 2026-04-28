# Full Project Health Audit v1 - Process Retro

This retro judges the audit system itself: signal quality, repeatability, and whether the outputs were actionable.

## 1. Which skills clearly improved audit stability?

- `superpowers:using-superpowers` helped enforce workflow routing before jumping into repo work.
- `superpowers:subagent-driven-development` fit the lane-based audit shape, even though this was read-only rather than implementation.
- `ai-smell-audit` was useful as a lens for proof-chain problems: mocked validation, fake-green tests, broad dead-code entries, and primitive-test overgrowth.
- `Linus` was useful only as a final gate label: Delete / Simplify / Needs proof. It should not replace evidence.

## 2. Which skills produced generic or noisy output?

- The UI lane referenced `audit` as a checklist, but the useful output came from concrete code/test evidence, not generic audit framing.
- SEO-specific skills were unavailable, so the SEO lane correctly recorded that as blocked and used static implementation evidence.

## 3. Which workers produced duplicate conclusions?

- Lane 00 and Lane 01 both found the dependency-cruiser barrel warning. Final report merged it into FPH-019.
- Lane 03 and Lane 05 both found false accessibility proof. Final report merged axe helper and contact ARIA tautology into FPH-011.
- Lane 02 subscribe proof gap and Lane 05 test-proof concerns overlapped in theme, but not exact endpoint; final report kept subscribe as FPH-010 and inquiry as FPH-005.

## 4. Which workers lacked evidence?

No lane handed off unsupported P0/P1 without evidence.

Weaker areas:

- Lane 03 could not provide screenshots/Lighthouse because no local server target was available and it could not build.
- Lane 02 could not complete CSP runtime proof because CSP check needed build artifacts and the lane was forbidden to run build.
- Lane 04 could not prove Google-side facts because credentials/exports were unavailable.

These were correctly marked Blocked or Needs proof.

Post-lane runtime proof changed one important blocked class: preview deploy/auth became partially proved, and deployed workers.dev smoke exposed a real contact-page runtime blocker. This validates the retro point that the audit needs a cleaner runtime handoff; local build proof alone was not enough.

## 5. Which commands produced the most useful proof?

- `pnpm type-check`
- `pnpm lint:check`
- `pnpm test`
- `pnpm build`
- `pnpm build:cf`
- `pnpm security:semgrep`
- `pnpm security:audit`
- `pnpm dep:check`
- `pnpm arch:conformance`
- `pnpm review:architecture-truth`
- targeted SEO Vitest suite
- targeted security Vitest suite
- targeted UI accessibility/responsive Vitest suite
- direct `rg` / `nl -ba` evidence extraction

Most valuable single lane: Lane 04, because it found launch-facing buyer trust blockers that normal CI cannot catch.

## 6. Which commands produced the most noise?

- `pnpm arch:*` and `pnpm review:architecture-truth` generated ignored `reports/architecture/*` side effects. They were useful, but the output location is awkward for strict lane write scopes.
- `pnpm exec vitest ... --reporter=basic` failed because Vitest 4 treated `basic` as a custom module. The default reporter worked.
- Several unquoted `src/app/[locale]` shell paths failed under zsh globbing. Workers corrected them, but prompts should warn to quote bracketed App Router paths.

## 7. Which checks should become a fixed project workflow?

1. Launch content proof check:
   - placeholder phone
   - missing public proof assets
   - `sample-product.svg` references in live product specs
   - standards vocabulary consistency
2. Inquiry route tests with real schema validation.
3. Subscribe route security tests.
4. Playwright axe helper assertion test with a known failing fixture.
5. Strict production reachability mode for Knip.
6. Mutation guard command-vs-package script consistency test.
7. CSP runtime proof after `pnpm build`.

## 8. Which checks should not be repeated next time?

- Do not rerun full static scans without copying decisive snippets into tracked evidence.
- Do not run UI/SEO runtime checks in lanes that are not given a server URL or build artifact.
- Do not ask workers to inspect paths that no longer exist, such as `src/sites` or stale `src/lib/rate-limit` / `src/lib/validation` paths, unless the prompt explicitly says they may be absent.
- Do not use `--reporter=basic` with current Vitest setup.

## 9. Which audit angles still lack a good skill or workflow?

- Buyer trust asset validation: phone, certificates, real product media, standards vocabulary.
- Google-side SEO evidence import: Search Console, URL Inspection, CrUX, PageSpeed.
- Runtime accessibility screenshot/axe workflow that can attach screenshots and violation artifacts under lane evidence.
- Safe non-production lead delivery smoke for Turnstile + Resend + Airtable.

## 10. How should Full Project Health Audit v2 change?

1. Keep the 6-lane structure.
2. Add a prebuilt runtime handoff:
   - Lane 00 builds.
   - Orchestrator starts or provides one read-only local server/preview URL.
   - UI/SEO/Security lanes use that target for screenshots, Lighthouse, CSP, and smoke proof.
3. Add a fixed "launch trust assets" lane or subcheck; it produced the highest business value in v1.
4. Update lane prompts to avoid stale paths and require quoted App Router paths.
5. Add a rule that ignored script side effects under `reports/` must be copied into lane evidence and listed in process notes.
6. Make P1 proof-chain findings explain whether they are "runtime broken" or "launch gate cannot be trusted." FPH-005 is the latter.
7. Add a fixed post-deploy smoke/tail step for lead-generation routes. The contact preview 500 was only caught after credentialed preview deploy and worker tail were added after the six lanes.

## Final process verdict

The package worked well enough to produce actionable findings without modifying business code. The biggest gap is runtime handoff: build artifacts and local/deployed URL evidence were not smoothly available to UI, SEO, and CSP checks. v2 should solve that before expanding the lane count.

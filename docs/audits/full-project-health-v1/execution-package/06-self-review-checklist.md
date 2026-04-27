# Self-Review Checklist

Run this before handing the package to Conductor workers.

## Completeness

- [ ] README declares the package as the single self-contained execution source.
- [ ] Preflight contract answers base, commit, dirty work, write paths, forbidden paths, commands, and blocked commands.
- [ ] Report contract defines evidence levels, severity, findings JSON, final report sections, and Linus Gate labels.
- [ ] Orchestrator prompt starts with preflight and forbids direct audit before preflight.
- [ ] Six lane prompts exist and each has one output file.
- [ ] Lane report template exists.
- [ ] Stop lines exist and explain what to do when blocked.
- [ ] Process retro exists and evaluates the audit process itself.
- [ ] Run metadata requirements exist.
- [ ] The execution package is in a tracked path and can be committed before worker dispatch.

## Safety

- [ ] No prompt tells workers to fix business code.
- [ ] No prompt tells workers to deploy.
- [ ] No prompt tells workers to run `pnpm build` and `pnpm build:cf` in parallel.
- [ ] No prompt treats old reports as final evidence.
- [ ] No prompt allows low-evidence P0/P1 findings.
- [ ] No prompt allows permanent deletion.
- [ ] Allowed and forbidden write paths are explicit.

## Evidence discipline

- [ ] Every lane prompt requires evidence level and severity.
- [ ] Credentials-dependent checks can be marked `Blocked`.
- [ ] Google data is not claimed without Google access.
- [ ] Cloudflare deployment truth is separated from local build truth.
- [ ] Mutation testing is not run automatically.
- [ ] Findings JSON is an array and validates with `jq`.
- [ ] Findings JSON requires exact enum values and required fields, not only JSON syntax.
- [ ] Lane findings can be traced into final findings through `source_finding_ids` and `source_lane`.

## Business readability

- [ ] Final report structure has owner-readable executive summary.
- [ ] Business impact is required for each finding.
- [ ] Repair plan is delete-first / simplify-first, not patch-first.

## Dispatch gate

- [ ] Package self-review is complete.
- [ ] Package readiness proof from `00-preflight-contract.md` passes.
- [ ] Package is committed before any audit lane worker starts.
- [ ] No business-code file is changed by package creation.

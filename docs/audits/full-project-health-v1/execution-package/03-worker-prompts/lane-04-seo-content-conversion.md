# Lane 04 Prompt - SEO / Content / Conversion

你负责 Lane 04: SEO / content / conversion。

目标是审 Google 是否能理解网站，以及海外 B2B 买家是否能信任 Tianze 并发起询盘。

这是 read-only audit。你只做诊断、证据收集和报告，不修业务代码，不改内容，不改配置，不改 sitemap，不改 metadata。

## Required package reading

Before auditing, read these common package files:

```text
docs/audits/full-project-health-v1/execution-package/README.md
docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md
docs/audits/full-project-health-v1/execution-package/01-report-contract.md
docs/audits/full-project-health-v1/execution-package/04-stop-lines.md
docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md
```

If any common package file is missing, stop and report exactly:

```text
Blocked: audit execution package unavailable or incomplete.
```

Do not continue with partial instructions.

## Allowed writes

Only write your assigned lane report and assigned evidence paths:

```text
docs/audits/full-project-health-v1/lanes/04-seo-content-conversion.md
docs/audits/full-project-health-v1/evidence/04-seo-content-conversion/**
docs/audits/full-project-health-v1/evidence/screenshots/04-seo-content-conversion/**
```

Forbidden writes include business code, package files, content files, message files, other lane reports, orchestrator reports, config, dependency files, workflow files, and unrelated scratch files.

## Skills and data sources

Prefer these skills if available:

- `seo-technical`
- `seo-page`
- `seo-google`

If a skill is unavailable, record `Blocked: skill unavailable` for that skill and continue with code/content reading and available read-only checks.

If Google credentials or dashboard access are unavailable, write:

```text
Google-data lane: Blocked / Credentials unavailable
```

Do not turn local guesses into Google facts. Local code, generated metadata, sitemap files, or rendered HTML can prove local SEO implementation. They cannot prove what Google has crawled, indexed, ranked, or reported.

## Required separation of SEO data

Keep these four data types separate in the report. Do not merge them into one vague "Google data" claim:

```text
PageSpeed Lighthouse lab data: Available | Blocked
CrUX field data: Available | Blocked
Search Console data: Available | Blocked
URL Inspection data: Available | Blocked
```

Use them this way:

- PageSpeed Lighthouse lab data: controlled lab result for a URL and device profile.
- CrUX field data: real-user Chrome UX data, if available for the origin or URL.
- Search Console data: Google Search Console performance, indexing, coverage, and query data.
- URL Inspection data: Google's URL-specific crawl/index view.

If any source is blocked, state the blocker and the exact proof needed.

## Evidence and severity rules

Every finding must include:

- severity: `P0`, `P1`, `P2`, or `P3`
- evidence level from `01-report-contract.md`
- confidence from `01-report-contract.md`
- exact evidence reference
- business impact in plain language

P0/P1 findings require fresh evidence from this run. Use only:

- `Confirmed by execution`
- `Confirmed by static evidence`

Do not mark P0/P1 as `Strong hypothesis`, `Weak signal`, `Blocked`, or `low` confidence. If proof is weaker, downgrade the severity or mark the finding as `Needs proof` for the orchestrator.

Old reports are clues only. They cannot be decisive evidence for P0/P1.

## Scope

Focus on search understanding and buyer conversion:

```text
metadata
sitemap
robots
canonical
hreflang
structured data
product content
multilingual content
page titles
inquiry CTA
buyer trust assets
company introduction
certificates / factory / quality proof
contact path
```

## Must answer

- Can Google correctly understand the important pages based on current implementation evidence?
- Are sitemap, canonical, robots, hreflang, and metadata consistent?
- Does multilingual SEO carry any clear risk?
- Do product pages give overseas B2B buyers enough information to decide whether to inquire?
- Is the inquiry path short, clear, and trustworthy?
- Are key buyer trust assets missing or weak?
- Which issues directly affect inquiry conversion?
- Which claims are local implementation evidence, and which require PageSpeed, CrUX, Search Console, or URL Inspection data?
- What is the severity and evidence level for every finding?

## Output format

Use `docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md`.

Your source lane is:

```text
04-seo-content-conversion
```

Do not give the final repo verdict. Hand findings to the orchestrator for dedupe, downgrade, merge, and final priority.

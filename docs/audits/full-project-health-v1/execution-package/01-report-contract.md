# Report Contract

All lane reports and the final orchestrator report must use this contract.

## Evidence levels

| Level | Meaning |
| --- | --- |
| Confirmed by execution | Verified by a real command, test, build, page visit, API call, screenshot, or generated report from this run |
| Confirmed by static evidence | Verified by current code or config reading, without runtime execution |
| Strong hypothesis | Evidence is strong, but one decisive runtime proof is still missing |
| Weak signal | Suspicious pattern only; needs follow-up before it can drive priority |
| Blocked | Environment, credential, permission, missing script, or missing external data prevents confirmation |

## Severity

| Severity | Meaning |
| --- | --- |
| P0 | Website cannot build/deploy, inquiry flow is broken, clear security risk, or real buyer cannot complete a critical action |
| P1 | Should be fixed before public launch; high regression, trust, SEO, conversion, security, or maintenance risk |
| P2 | Schedule for cleanup; medium maintainability, coupling, UX, or proof-quality cost |
| P3 | Optimization, style consistency, small UX improvement, or documentation cleanup |

## JSON enums

Use exactly one literal value from each enum. Do not paste pipe-separated option lists into findings. `domain` is a single primary domain, not a list. Cross-domain findings should be deduplicated under the root-cause domain and referenced from other sections in the final report.

```text
severity: P0 | P1 | P2 | P3
confidence: high | medium | low
evidence_level: Confirmed by execution | Confirmed by static evidence | Strong hypothesis | Weak signal | Blocked
domain: baseline | architecture | security | performance | seo | ui | accessibility | tests | ai-smell | dead-code | conversion | process
evidence.type: file | command | runtime | screenshot | report | external
linus_gate: Keep | Simplify | Delete | Needs proof | n/a
command.result: passed | failed | blocked | not-run
command.classification: required | optional | diagnostic | credential-blocked | environment-blocked | script-unavailable
```

Rules:

- P0/P1 findings require `Confirmed by execution` or `Confirmed by static evidence` from this run. Otherwise downgrade severity or mark `Needs proof`.
- Old reports may appear as `evidence.type: "report"` only as a clue, not as decisive evidence for P0/P1.
- `Blocked` findings must explain the missing credential, environment, script, or external data in `verification_needed`.
- `.context/audits/full-project-health-v1/` is scratch-only; do not cite it as final evidence unless the same evidence is copied into the tracked audit artifact root.

## Confidence rules

| Confidence | Use when |
| --- | --- |
| high | Evidence directly proves the current behavior, current code path, or current artifact |
| medium | Evidence is current and relevant, but one runtime or cross-lane proof is still missing |
| low | Pattern is suspicious, old reports suggest it, or the lane could not fully prove it |

## Evidence type rules

| Type | Required reference |
| --- | --- |
| file | Current repo path plus line number when practical |
| command | Exact command plus where the output is recorded |
| runtime | URL, route, API call, browser action, or local server state plus result |
| screenshot | Tracked screenshot path under `docs/audits/full-project-health-v1/evidence/screenshots/` |
| report | Tracked report path and whether it is fresh or old |
| external | External dashboard or service data source; mark `Blocked` if credentials are missing |

Every evidence object must include `type`, `reference`, and `summary`.

## Required finding fields

Every final JSON finding must include all fields shown in the shape below. Do not omit fields. If a field is not applicable, write a short reason such as `n/a: no fix needed` or set `linus_gate` to `n/a`.

## Finding JSON shape

```json
[
  {
    "id": "FPH-001",
    "source_finding_ids": ["FPH-L01-001"],
    "title": "Short finding title",
    "severity": "P1",
    "domain": "architecture",
    "source_lane": "01-architecture-coupling",
    "confidence": "high",
    "evidence_level": "Confirmed by static evidence",
    "evidence": [
      {
        "type": "file",
        "reference": "exact file path, command, or artifact path",
        "summary": "what this proves"
      }
    ],
    "impact": "owner-readable business impact",
    "root_cause": "why this exists",
    "recommended_fix": "delete-first or simplify-first repair direction",
    "verification_needed": "how to prove the fix later",
    "linus_gate": "Simplify"
  }
]
```

`source_finding_ids` preserves traceability after the orchestrator deduplicates, merges, or renumbers lane findings.

`02-findings.json` must be a JSON array. No Markdown fences, no comments, no trailing commas. Validate syntax with:

```bash
jq . docs/audits/full-project-health-v1/02-findings.json
```

Syntax validation is not enough. The orchestrator must also inspect every finding for required fields and exact enum values before treating it as mergeable.

## Final report files

The orchestrator writes these files:

```text
docs/audits/full-project-health-v1/00-final-report.md
docs/audits/full-project-health-v1/01-quality-map.md
docs/audits/full-project-health-v1/02-findings.json
docs/audits/full-project-health-v1/03-evidence-log.md
docs/audits/full-project-health-v1/04-process-retro.md
```

`.context/audits/full-project-health-v1/` may store temporary scratch notes, but it is not the final report root.

## Final report sections

```markdown
# Tianze Full Project Health Audit v1

## 0. Executive Summary
## 1. Audit Scope and Baseline
## 2. Current Quality Verdict
## 3. P0 / P1 Findings
## 4. Architecture and Coupling Map
## 5. Security and Trust Boundary Findings
## 6. UI / Performance / Accessibility Findings
## 7. SEO / Content / Conversion Findings
## 8. Test Value and AI-Smell Findings
## 9. Change-Cost Map
## 10. Delete-First Repair Plan
## 11. Recommended Repair Sequence
## 12. What We Could Not Prove
## 13. Process Retro
## Appendix A: Evidence Log
## Appendix B: Full Findings JSON
```

## Linus Gate labels

Every high-priority finding gets one of these labels:

- `Keep`
- `Simplify`
- `Delete`
- `Needs proof`

The final report must explain why the label was chosen.

# Lane XX - <Name>

## 1. Scope

## 2. Fresh Evidence Collected

| Evidence ID | Type | Exact reference | Result | Notes |
| --- | --- | --- | --- | --- |
| E-LXX-001 | file / command / runtime / screenshot / report / external | path, command, URL, or artifact | what it proves | limitation, if any |

## 3. Commands Run

| Command | Result | Classification |
| --- | --- | --- |
| `exact command` | passed / failed / blocked / not-run | required / optional / diagnostic / credential-blocked / environment-blocked / script-unavailable |

## 4. Findings

### FPH-LXX-001: <title>

- Severity: REPLACE_WITH_SINGLE_SEVERITY_LITERAL
- Evidence level: REPLACE_WITH_SINGLE_EVIDENCE_LEVEL_LITERAL
- Confidence: REPLACE_WITH_SINGLE_CONFIDENCE_LITERAL
- Domain: REPLACE_WITH_SINGLE_DOMAIN_LITERAL
- Source lane: REPLACE_WITH_LANE_ID_AND_NAME
- Evidence:
  - type: REPLACE_WITH_SINGLE_EVIDENCE_TYPE_LITERAL
    reference: REPLACE_WITH_EXACT_PATH_COMMAND_URL_OR_ARTIFACT
    summary: REPLACE_WITH_SHORT_PROOF_SUMMARY
- Business impact:
- Root cause:
- Recommended fix:
- Verification needed:
- Suggested Linus Gate: REPLACE_WITH_SINGLE_LINUS_GATE_LITERAL

Rules:

- Do not use P0/P1 with `Strong hypothesis`, `Weak signal`, `Blocked`, or `low` confidence. P0/P1 require `Confirmed by execution` or `Confirmed by static evidence` from this run. Downgrade or mark `Needs proof`.
- Do not use old reports as decisive evidence for P0/P1.
- Replace every `REPLACE_WITH_*` placeholder with exactly one literal enum value or exact reference before handing off.
- Use exact enum values from `01-report-contract.md`; do not paste option lists into fields.
- Keep evidence structured so it can be copied into `02-findings.json`.

## 5. Blocked / Not Proven

Use this section for claims that could not be proven.

| Claim | Blocker | Needed proof | Suggested classification |
| --- | --- | --- | --- |
| what could not be proven | missing credential, script, external data, or environment condition | exact command, access, or artifact needed | Blocked / Needs proof |

## 6. Handoff to Orchestrator

List the findings the orchestrator should merge, downgrade, dedupe, or challenge.

| Finding ID | Handoff action | Reason |
| --- | --- | --- |
| FPH-LXX-001 | merge / downgrade / dedupe / challenge / keep | why |

## 7. Process Notes

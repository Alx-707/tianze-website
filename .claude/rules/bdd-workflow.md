# BDD Workflow Integration Rule

## Mandatory Behavioral Specification Step

When obra/superpowers `brainstorming` completes and suggests invoking `writing-plans`:

**DO NOT invoke writing-plans immediately.**

Instead, follow this sequence:

1. **brainstorming** completes → design document approved
2. **Apply `behavioral-specification` skill** → produce `docs/specs/{feature}/bdd-specs.md`
3. **Then invoke `writing-plans`** with BOTH the design doc AND bdd-specs.md as input

This is non-negotiable. writing-plans must receive behavioral specs so that:
- Every task maps to a specific BDD scenario
- Each scenario becomes 1 Red task + 1 Green task
- The spec compliance reviewer in subagent-driven-development can verify against the specs

## writing-plans Input Convention

When invoking writing-plans, ensure it reads:
- Design document: `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
- Behavioral specs: `docs/specs/{feature}/bdd-specs.md`

Include in the writing-plans prompt:
```
Reference the behavioral specs at docs/specs/{feature}/bdd-specs.md.
Each Given/When/Then scenario must map to at least one Red task (failing test)
and one Green task (minimal implementation).
```

## Mandatory: Codex Plan Review

After `writing-plans` produces the implementation plan, **must** invoke `/plan-review` for adversarial Codex review.

Uses the official `codex@openai-codex` plugin (codex-cc) via `~/.claude/skills/codex/scripts/ask_codex.sh`.

Flow:
```
writing-plans → /plan-review <plan-file> → [multi-round discussion via --session] → Claude decides → TDD
```

### Multi-Round Discussion Protocol

1. **First call**: Run `ask_codex.sh` with the plan review prompt. Save the returned `session_id`.
2. **Read response**: Codex returns findings. Claude independently evaluates each one.
3. **Follow-up rounds** (if needed): For points Claude wants to challenge or clarify:
   ```bash
   ~/.claude/skills/codex/scripts/ask_codex.sh \
     "Regarding your point about X: [Claude's counterargument or question]. 
      Also, I've decided to accept Y and reject Z because [reasoning]." \
     --session <session_id>
   ```
4. **Termination**: Claude decides the discussion is complete when:
   - All findings have been evaluated (accept / reject / adapt)
   - No new substantive points are being raised
   - OR Claude has enough information to make a final judgment
5. **Record**: Claude documents the final decisions (accepted, rejected with reason, adapted) in the plan file or as a summary before proceeding to TDD.

There is no fixed round limit. Claude ends the discussion when ready — not when Codex says "APPROVED."

### Decision Authority

**Claude holds final decision authority, not Codex.** Codex is an adversarial reviewer — its job is to surface risks, blind spots, and alternatives. Claude's job is to:

1. **Independently evaluate** each Codex suggestion against actual codebase state, project constraints, and business intent
2. **Accept, reject, or adapt** each point with explicit reasoning
3. **Provide detailed feedback** back to Codex for multi-round discussion when needed
4. **Make the final call** — if Claude disagrees with Codex after thorough evaluation, Claude proceeds with its own judgment and documents why

The goal is adversarial stress-testing of the plan, not outsourcing approval authority. A plan that survives rigorous challenge is stronger — but "Codex said no" is never sufficient reason to block progress.

### Context Injection (Critical)

Codex runs in an isolated process — it has full workspace access and can read any project file, but **cannot** see Claude's conversation context. Without proper context, Codex reviews in a vacuum and its feedback will be misaligned.

**Step 1: Plan file header must contain:**

1. **User Requirements** — the original business intent that prompted this feature
2. **Design Decisions** — key choices from brainstorming (with rationale for each)
3. **BDD Specs Reference** — path to `docs/specs/{feature}/bdd-specs.md`
4. **Constraints** — any project-specific constraints Codex should respect

**Step 2: In the review prompt, provide branch context and reading instructions:**

Codex has full workspace access — do not pass project files via `--file` (wastes tokens). Instead, tell Codex which branch it's on and which files to read itself. Only pass the plan file via `--file`.

```bash
~/.claude/skills/codex/scripts/ask_codex.sh \
  "You are reviewing an implementation plan on branch '<current-branch>'.
   Read these project files first for context:
   - CLAUDE.md (project overview, stack, constraints)
   - .claude/rules/architecture.md (project decisions, pitfalls)
   - .claude/rules/coding-standards.md (naming, imports, BDD)
   - <additional rules files matching the plan's domain>
   - <key source files the plan touches>
   Then review the plan at <plan-file-path> for:
   [review criteria...]" \
  --file <plan-file>
```

**File reading principle**: list 3-6 high-signal files in the prompt for Codex to read. Codex will discover related files on its own from there. Match the reading list to the plan's domain — if it touches i18n, include `.claude/rules/i18n.md`; if security, include `.claude/rules/security.md`.

## Optional: Codex Execution Participation

Beyond the two mandatory review points, Claude **autonomously decides** whether to involve Codex in execution — no human instruction needed.

**When to delegate coding to Codex (`codex` skill):**
- Task is clear and well-scoped, requiring implementation not architecture
- Batch/repetitive changes across multiple files (e.g., rename pattern in 12 files)
- Test writing based on existing implementation
- Simple-to-moderate bug fixes where root cause is already identified

**When to invoke Codex rescue (`codex:codex-rescue` agent):**
- Same problem attempted 2+ times without resolution
- Need a fundamentally different diagnostic angle
- Claude is going in circles on a debugging path

**When NOT to involve Codex:**
- Architectural decisions, design trade-offs
- Business logic requiring project context Claude already holds
- Tasks faster to do directly than to describe and delegate

When Claude decides to involve Codex, briefly state why. When not, no explanation needed.

## Verification

Before writing-plans produces the final plan, verify:
- [ ] Every BDD scenario has corresponding Red + Green tasks
- [ ] No tasks exist without a traceable BDD scenario or acceptance criterion
- [ ] Task test descriptions reference the original scenario language

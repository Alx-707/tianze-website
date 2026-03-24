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

## Optional: Dual-AI Plan Review

After `writing-plans` produces the implementation plan, **consider** invoking `/codex-feedback-loop plan` for Claude-Codex iterative review.

**When to use:**
- Multi-step features with architectural impact (e.g., new page system, API redesign)
- Plans involving unfamiliar patterns or significant risk
- When Claude's confidence in the plan is moderate rather than high

**When to skip:**
- Small features, bug fixes, or single-component changes
- Plans that closely follow established patterns (e.g., adding another product page using existing templates)

Flow when used:
```
writing-plans → /codex-feedback-loop plan → [3-5 rounds convergence] → TDD
```

Claude should suggest this step when the plan complexity warrants it. The user decides whether to invoke.

## Verification

Before writing-plans produces the final plan, verify:
- [ ] Every BDD scenario has corresponding Red + Green tasks
- [ ] No tasks exist without a traceable BDD scenario or acceptance criterion
- [ ] Task test descriptions reference the original scenario language

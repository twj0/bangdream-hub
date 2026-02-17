# Contributing Guide

## Workflow Principle

KiloCode uses document-first development:

1. Define or update related docs.
2. Align implementation to documented contract.
3. Validate behavior.
4. Submit PR with evidence.

## Branch Strategy

- `main`: stable integration branch.
- `feat/<scope>`: feature work.
- `fix/<scope>`: bug fixes.
- `docs/<scope>`: documentation-only updates.

Examples:
- `feat/router-fallback`
- `fix/adapter-cleanup`
- `docs/adapter-spec`

## Commit Convention

Use conventional commits:

```text
<type>(<scope>): <subject>
```

Allowed types:
- `feat`
- `fix`
- `docs`
- `refactor`
- `test`
- `chore`

Examples:
- `feat(router): fallback to hub on invalid game id`
- `docs(adapter): add lifecycle cleanup checklist`

## Pull Request Requirements

Every PR must include:

- Purpose and context.
- Changed files/modules.
- Validation steps.
- Risks and rollback notes.

Recommended PR template section names:
- Background
- What changed
- How to verify
- Risk

## Definition of Done

A change is done only if:

- [ ] Related docs updated.
- [ ] Code matches architecture and specs.
- [ ] Manual verification completed.
- [ ] No obvious regression in route and mounting flow.
- [ ] Reviewer can reproduce key behavior from PR description.

## Code Review Checklist

Reviewers should verify:

- Router behavior remains deterministic.
- Adapter lifecycle is balanced (`mount`/`unmount`).
- Registry ids remain unique and consistent.
- Host shell and game adapters remain decoupled.
- New code follows project structure and naming rules.

## Testing Policy (Current Stage)

Minimum expected validation before merge:

1. `npm run dev` starts successfully.
2. Hub page displays game list.
3. Entering each game works.
4. Returning to hub works repeatedly.
5. No obvious console errors during transitions.

As test tooling is introduced, convert these checks into automated tests.

## Documentation Ownership

- Architecture and specs are living documents.
- Feature owner updates docs in same PR whenever behavior changes.
- If behavior diverges from docs, either docs or implementation must be corrected before merge.

## Release Notes Practice

For each release tag, summarize:
- New games
- Route behavior changes
- Adapter contract updates
- Breaking changes (if any)

# Roadmap

## Planning Baseline

Current version: `0.1.0`

Roadmap is organized by milestones with scope and Definition of Done (DoD).

## v0.1 - Documentation and Baseline Stabilization

Target:
- Establish document-first workflow.
- Stabilize current hub/router/adapter baseline.

Scope:
- Add core docs:
  - `README.md`
  - `docs/ARCHITECTURE.md`
  - `docs/GAME-ADAPTER-SPEC.md`
  - `docs/ROUTING-SPEC.md`
  - `docs/CONTRIBUTING.md`
  - `docs/ROADMAP.md`
- Verify existing placeholder games run through full enter/exit flow.

DoD:
- Docs are complete and internally consistent.
- Team can onboard using docs only.
- No major runtime errors in hub-to-game transitions.

## v0.2 - Reliability and Quality Guardrails

Target:
- Improve runtime robustness and development consistency.

Scope:
- Add registry validation:
  - duplicate id detection
  - metadata completeness checks
- Improve router fallback and error-safe behavior.
- Add minimum automated tests for:
  - router transitions
  - registry lookup/uniqueness checks

DoD:
- Invalid game id always recovers to hub.
- Registry rejects duplicate ids in development checks.
- Automated tests cover critical navigation and registry paths.

## v0.3 - Adapter Maturity and Expansion

Target:
- Make adapter lifecycle production-ready.
- Scale to more games with consistent integration quality.

Scope:
- Define stronger lifecycle conventions (pause/resume usage policy).
- Add adapter compliance checklist execution for each game.
- Integrate at least one additional non-placeholder game.
- Add basic runtime diagnostics for mount/unmount failures.

DoD:
- Adapters pass cleanup and remount checks.
- At least three games are integrated through shared spec.
- Lifecycle failures are observable and recoverable.

## Backlog Candidates

- URL-based route synchronization (`#/`, `#/game/:id`).
- 404/unknown route page.
- Lightweight telemetry hooks for adapter lifecycle.
- CI pipeline with build + tests + lint gates.
- Game template generator for faster onboarding.

## Governance

- Any scope change must update this roadmap in the same PR.
- Completed milestones must include a short release note section.

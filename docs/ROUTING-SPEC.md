# Routing Specification

## Purpose

This document defines route states, navigation rules, and fallback behavior for KiloCode Game Hub.

Source implementation: `src/app/router.ts`

## Route Model

Current route state is represented by:

```ts
type RouteState =
  | { type: 'hub' }
  | { type: 'game'; gameId: string };
```

## Current Navigation API

Router exposes:
- `start()`
- `goHub()`
- `goGame(gameId: string)`
- `getState()`

## State Semantics

### hub

- Represents game catalog page.
- Router renders hub page into `contentRoot`.
- No active game runtime should remain mounted.

### game

- Represents selected game runtime view.
- `gameId` must resolve to a valid registry entry.
- Router clears hub content and lets shell mount the game.

## Transition Rules

- Initial transition: `start()` must enter `hub`.
- `hub -> game`: allowed only when `gameId` exists in registry.
- `game -> hub`: always allowed.
- `game -> game`: implemented as `goGame(nextId)` after cleanup by shell.

## Validation and Fallback

- If `goGame(gameId)` cannot find matching game, router must fallback to `goHub()`.
- Router must emit route changes only with valid `RouteState` values.
- Invalid target must not leave app in partial state.

## Rendering Contract

Router responsibilities:
- Own route state transitions.
- Render hub page for `hub` state.
- Clear content root for `game` state.
- Trigger `onRouteChange` for shell orchestration.

Shell responsibilities:
- React to route changes.
- Resolve game metadata.
- Mount/unmount adapters.

## Error Handling Policy

- Invalid `gameId`: silent fallback to hub.
- Adapter mount failure: shell should show error-safe fallback and allow return to hub.
- Unknown runtime exception: preserve ability to navigate back to hub.

## Future URL Strategy (Planned)

Current implementation is in-memory route state.
Planned URL mapping:
- `#/` -> hub
- `#/game/:gameId` -> game

Additional planned behaviors:
- Browser back/forward synchronization.
- 404 route for unknown paths.
- Optional query params for game mode/state.

## Test Cases (Minimum)

- `start()` enters `hub`.
- `goGame(validId)` enters `game` with matching id.
- `goGame(invalidId)` falls back to `hub`.
- `getState()` always returns latest route state.
- Repeated `goHub()` remains stable.

## Non-Goals (Current Stage)

- Nested routes.
- Route guards with auth.
- Deep-link restore of internal game progress.

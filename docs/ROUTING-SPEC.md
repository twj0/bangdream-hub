# Routing Specification

## Purpose

This document defines route states, navigation rules, URL mapping, and fallback behavior for Bangdream Hub.

Source implementation: [`createRouter()`](src/app/router.ts:37)

## Route Model

Current route state is represented by:

```ts
type RouteState =
  | { type: 'hub' }
  | { type: 'game'; gameId: string };
```

## URL Strategy (Implemented)

The router is **path-based** (History API), not hash-based.

- Hub (catalog):
  - `/<base>/` (GitHub Pages example: `https://twj0.github.io/bangdream-hub/`)
- Game shortcuts (aliases):
  - `/<base>/shoot` → `gameId = note-shooter`
  - `/<base>/pazuru` → `gameId = puzzle-pico`
  - `/<base>/klotski` → `gameId = bang-klotski`

`<base>` is the deployed base path (GitHub Pages typically uses `/<repo>/`). The router uses relative pushes (e.g. `./shoot`) so it works under any base.

### Deep-linking

Directly opening the shortcut URL will go to the correct game:
- `.../bangdream-hub/shoot`
- `.../bangdream-hub/pazuru`
- `.../bangdream-hub/klotski`

This is handled by [`getRouteFromLocation()`](src/app/router.ts:15).

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

- Initial transition:
  - `start()` enters either:
    - `hub`, or
    - a `game` state when the current URL path matches a valid shortcut.
- `hub -> game`: allowed only when `gameId` exists in registry.
- `game -> hub`: always allowed.
- `game -> game`: implemented as `goGame(nextId)` after cleanup by shell.

## Browser Navigation (Back/Forward)

The router listens to `popstate` and re-renders the appropriate state.

Implementation: [`createRouter()` popstate listener](src/app/router.ts:67)

## Validation and Fallback

- If `goGame(gameId)` cannot find matching game, router falls back to `goHub()`.
- If path segment is unknown, `start()` falls back to hub.

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

## Test Cases (Minimum)

- Opening `/<base>/` renders hub.
- Opening `/<base>/shoot` loads `note-shooter`.
- Opening `/<base>/pazuru` loads `puzzle-pico`.
- Opening `/<base>/klotski` loads `bang-klotski`.
- `goGame(invalidId)` falls back to hub.
- Browser back/forward switches between hub/game without leaving mounted state behind.

## Non-Goals (Current Stage)

- Nested routes.
- Route guards with auth.
- Deep-link restore of internal game progress.

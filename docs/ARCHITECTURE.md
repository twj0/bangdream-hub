# Architecture

## Overview

KiloCode Game Hub is a lightweight host application for mini games.

It has three core layers:
- Hub: presents game catalog and entry points.
- Router: controls route state and transitions.
- Adapter: standardizes game lifecycle integration.

## Runtime Flow

1. App starts from `src/main.ts`.
2. Shell initializes app layout and route hooks.
3. Router starts in `hub` state and renders `hub-page`.
4. User selects a game from hub.
5. Router switches to `game` state and notifies shell.
6. Shell finds game meta in registry and mounts game adapter.
7. On exit/back, shell unmounts active adapter and returns to hub.

## Module Responsibilities

### App Layer

- `src/app/shell.ts`
  - Owns app-level DOM slots.
  - Reacts to route changes.
  - Mounts and unmounts game adapters.
- `src/app/router.ts`
  - Owns route state.
  - Exposes navigation API (`goHub`, `goGame`, `start`).
  - Validates selected game by id.

### Hub Layer

- `src/hub/game-registry.ts`
  - Source of truth for all registered games.
  - Provides `getAllGames` and `getGameById`.
- `src/hub/hub-page.ts`
  - Renders game list UI.
  - Emits game selection intent to router.

### Game Layer

- `src/games/_types/game-adapter.ts`
  - Integration contract for all games.
- `src/games/_types/game-meta.ts`
  - Metadata model for game catalog.
- `src/games/<game-id>/adapter.ts`
  - Concrete game adapter implementation.

## Data Model

### Route State

`RouteState` union:
- `{ type: 'hub' }`
- `{ type: 'game'; gameId: string }`

### Game Meta

Required fields:
- `id`
- `title`
- `description`
- `adapter`

Optional fields:
- `cover`
- `tags`

## Lifecycle Rules

- At most one game adapter is mounted at a time.
- Every mount must have a matching unmount.
- `pause` and `resume` are optional adapter capabilities.
- Invalid route target must fall back to hub.

## Design Constraints

- Keep host shell framework-free and deterministic.
- Keep adapters isolated from hub internals.
- Keep registry readable and auditable.
- Prefer explicit lifecycle over implicit side effects.

## Extension Points

- Add a new game by:
  1) creating a new adapter,
  2) registering a new `GameMeta` in registry,
  3) confirming lifecycle behavior.
- Add route modes by extending `RouteState` and router handlers.
- Add game preload policy in shell without changing adapter API.

## Non-Goals (Current Stage)

- Multi-tab game persistence.
- Online account/session state.
- Dynamic remote plugin loading.
- i18n and theme systems.

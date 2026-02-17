# Game Adapter Specification

## Purpose

This document defines the integration contract between KiloCode host shell and each mini game.

All games must be integrated through a `GameAdapter` implementation.

## Interface Contract

Source: `src/games/_types/game-adapter.ts`

```ts
export interface GameAdapter {
  id: string;
  name: string;
  mount(container: HTMLElement): Promise<void> | void;
  unmount(): Promise<void> | void;
  pause?(): void;
  resume?(): void;
}
```

## Required Behaviors

### id

- Must match the game id in registry metadata.
- Must be globally unique across all games.
- Must remain stable after release.

### name

- Human-readable game display name.
- Should align with `GameMeta.title`.

### mount(container)

- Must render all game UI only inside provided `container`.
- Must complete initialization safely on first call.
- Must not assume global DOM nodes outside `container`.
- Can be sync or async.

### unmount()

- Must clean all side effects created by `mount`.
- Must release timers, event listeners, animation loops, and external resources.
- Must be safe to call even if mount failed partially.
- Can be sync or async.

## Optional Behaviors

### pause()

- Called when game should stop active updates temporarily.
- Should pause animation/audio/input handling where applicable.

### resume()

- Called when game returns to active state.
- Should resume from paused state without reinitializing all resources.

## Lifecycle Sequence

Standard sequence:

1. `mount(container)`
2. zero or more `pause()` / `resume()` cycles
3. `unmount()`

Error branch:

1. `mount(container)` throws or rejects
2. host may still call `unmount()` for best-effort cleanup

## Adapter Constraints

- One adapter instance should manage one active runtime at a time.
- Do not mutate host route state directly.
- Do not register global CSS that can break hub/shell layout.
- Avoid blocking main thread during `mount`.

## Error Handling

- Adapter should throw explicit errors for fatal initialization failures.
- Host shell is responsible for fallback UI and route recovery.
- Adapter should not swallow fatal errors silently.

## Resource Management Checklist

Before marking adapter integration complete, verify:

- [ ] No running `setInterval` or `requestAnimationFrame` after unmount.
- [ ] No stale global event listeners after unmount.
- [ ] No detached DOM subtree references retained.
- [ ] No continued audio playback after unmount.
- [ ] Re-entering the game after unmount works correctly.

## Minimal Adapter Template

```ts
import type { GameAdapter } from '../_types/game-adapter';

export function createExampleAdapter(): GameAdapter {
  let root: HTMLElement | null = null;
  let rafId: number | null = null;

  return {
    id: 'example-game',
    name: 'Example Game',

    mount(container) {
      root = document.createElement('div');
      root.textContent = 'Example game mounted';
      container.appendChild(root);

      const tick = () => {
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    },

    unmount() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (root?.parentElement) {
        root.parentElement.removeChild(root);
      }
      root = null;
    },

    pause() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },

    resume() {
      if (rafId === null) {
        const tick = () => {
          rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
      }
    },
  };
}
```

## Acceptance Criteria

An adapter is considered compliant when:

- It matches the interface contract.
- It passes lifecycle and cleanup checklist.
- It is registered in `game-registry` with consistent id/title.
- It can be mounted, unmounted, and remounted without errors.

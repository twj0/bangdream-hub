## Attribution / Sources

This repository is a **front-end aggregation shell** that hosts mini games in a single website.

Original/upstream repositories:
- Shooter source: https://github.com/zfkdiyi/bangdream
- Puzzle (tetris-like) source: https://github.com/hamzaabamboo/pazuru-pico

## Tech Stack

- Vite
- TypeScript
- Native DOM rendering (no framework)

## Getting Started

### Requirements

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Directory Structure

```text
src/
  app/
    router.ts            # Route state and navigation
    shell.ts             # App shell and game mounting logic
  games/
    _types/
      game-adapter.ts    # Adapter interface contract
      game-meta.ts       # Game registry metadata type
    note-shooter/
      adapter.ts         # Game adapter
    puzzle-pico/
      adapter.ts         # Game adapter
  hub/
    game-registry.ts     # Registered game list and lookup
    hub-page.ts          # Hub page rendering
  styles/
    base.css
    hub.css
    game-shell.css
  main.ts
```

## Architecture Docs

- `docs/ARCHITECTURE.md`
- `docs/GAME-ADAPTER-SPEC.md`
- `docs/ROUTING-SPEC.md`
- `docs/CONTRIBUTING.md`
- `docs/ROADMAP.md`

## Development Principles

- Document-first for any non-trivial change.
- Keep `GameAdapter` contract stable and explicit.
- Add game features through adapters, not shell hacks.
- Keep router behavior deterministic and testable.

## Current Status

- Version: `0.1.0`
- Two games are integrated:
  - `note-shooter`
  - `puzzle-pico`

## License

Internal project. Add license policy before public release.

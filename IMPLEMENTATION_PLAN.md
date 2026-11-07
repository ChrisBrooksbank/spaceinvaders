# Implementation Plan

## Status

- Planning iterations: 1
- Build iterations: 0
- Last updated: 2026-11-06

## Tasks

Ordered by dependency. One task = one build iteration. Each logic task includes its unit tests.

- [x] 1. Scaffold project: package.json, Vite + TypeScript (strict), Vitest, ESLint, Prettier, index.html with canvas, `npm run check` (typecheck + lint + format check + test:run), scripts per AGENTS.md (spec: game-flow.md)
- [x] 2. Core types and constants: src/game/types.ts (GameState, Input, Rect, Bullet, Invader, Shield, Phase) and src/game/constants.ts (playfield size, speeds, sizes, points, lives=3) (spec: all)
- [x] 3. Input-state abstraction: src/input.ts with pure `InputState` (pressed set, left/right/fire/start derived; arrows + A/D, Space, Enter) plus DOM keyboard binding kept thin; tests (spec: player-controls.md)
- [x] 4. Player movement: constant speed, clamped to playfield; tests for move, stop on release, clamping (spec: player-controls.md)
- [x] 5. Player bullet: Space fires upward from ship, only one on screen, removed off-top; tests (spec: player-controls.md)
- [x] 6. Invader grid creation: 5x11, 3 types by row (top=type 0/30pts, middle two rows=20, bottom two=10); tests (spec: invader-behavior.md)
- [x] 7. Invader marching: horizontal move, drop one step and reverse at edges (accounting for only living invaders' bounds); tests (spec: invader-behavior.md)
- [x] 8. Invader speed-up as invaders are destroyed (step interval/speed derived from remaining count); tests (spec: invader-behavior.md)
- [x] 9. Invader firing: pick lowest living invader per column, random interval via injectable RNG for determinism; tests for column selection (spec: invader-behavior.md)
- [x] 10. Collisions: AABB helper; player bullet vs invader (both removed, score by type 30/20/10); tests (spec: collisions-scoring.md)
- [x] 11. Invader bullet vs player: lose a life (start 3), bullet removed; tests (spec: collisions-scoring.md)
- [x] 12. Shields: 4 destructible shields (cell/pixel grid), erode on hits from either side's bullets; tests for erosion (spec: collisions-scoring.md)
- [x] 13. Invaders reaching player's row => game over; lives 0 => game over (spec: invader-behavior.md, game-flow.md)
- [x] 14. Top-level `update(state, input, dt) -> state` with fixed-timestep, composing the above; phase machine start -> playing -> gameover -> restart via Enter; tests for transitions (spec: game-flow.md)
- [x] 15. Level advance: clearing all invaders spawns new grid with faster start speed, keeps score/lives; tests (spec: game-flow.md)
- [x] 16. High score: pure helpers + localStorage load/save wrapper (injectable storage, try/catch); updated on game over; tests with a fake storage (spec: game-flow.md)
- [x] 17. Rendering: src/render.ts draws playfield, ship, 3 invader types, bullets, shields, HUD (score, lives, high score), start and game-over screens; no logic (spec: collisions-scoring.md, game-flow.md)
- [x] 18. Main loop: src/main.ts with requestAnimationFrame and accumulator fixed-timestep (cap max frame delta), wiring input/update/render (spec: game-flow.md)
- [x] 19. Final validation: run `npm run check` and `npm run build`; walk through every spec acceptance criterion and fix gaps (spec: all)

## Completed

<!-- Completed tasks move here -->

## Notes

- Repo is empty (no package.json, no src); verified via file listing. Not a git repo.
- Architecture: pure logic in src/game/*.ts, drawing in src/render.ts, DOM glue in src/main.ts and src/input.ts. Logic must never touch canvas/DOM/localStorage directly.
- State updates are immutable-style `update(state, input, dt) -> state`; randomness via injected RNG so tests are deterministic.
- Fixed timestep (e.g. 1/60 s); the loop accumulates real time and calls update in steps.
- Out of scope: UFO, sound, touch/gamepad, multiplayer.
- render() assumes a FIELD_WIDTH x FIELD_HEIGHT canvas; index.html declares 672x768, so task 18 must set canvas.width/height from constants (or fix index.html).
- Keep tests colocated (src/game/*.test.ts).

# AGENTS.md - Operational Guide

Keep this file under 60 lines. It's loaded every iteration.

Project: browser Space Invaders (TypeScript + HTML Canvas, Vite, Vitest).
Done when: `npm run check` passes and all spec acceptance criteria are met.

## Build Commands

```bash
npm install            # Install dependencies
npm run dev            # Development server
npm run build          # Production build
```

## Test Commands

```bash
npm test               # Vitest (watch mode)
npm run test:run       # Run tests once
```

## Validation (run before finishing a task)

```bash
npm run check          # typecheck + lint + format check + tests (run once)
```

## Project Notes

- Keep game logic pure and separate from canvas rendering so it is unit-testable (e.g. src/game/*.ts for logic, src/render.ts for drawing).
- Use a fixed-timestep update function: `update(state, input, dt) -> state`.
- If `package.json` does not exist, the first plan task is scaffolding it.

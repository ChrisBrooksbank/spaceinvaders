# Game Flow

## Overview

The game moves between start, playing, and game-over states and advances through levels.

## User Stories

- As a player, I want a start screen and restart so that I can play repeatedly.
- As a player, I want a high score so that I can beat my best.

## Requirements

- [ ] Start screen; Enter begins play
- [ ] Clearing all invaders starts the next level with a faster start speed
- [ ] Game over when lives reach 0 or invaders reach the player; Enter restarts
- [ ] High score persisted in localStorage
- [ ] Game loop using requestAnimationFrame with fixed-timestep updates

## Acceptance Criteria

- [ ] Unit tests cover state transitions (start -> playing -> game over -> restart) and level advance
- [ ] `npm run check` passes

## Out of Scope

- Multiplayer

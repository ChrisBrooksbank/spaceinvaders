# Collisions and Scoring

## Overview

Bullets hit things, and hits change score, lives, and the shields.

## User Stories

- As a player, I want shots to destroy invaders and earn points so that I feel progress.
- As a player, I want shields so that I can take cover.

## Requirements

- [ ] AABB collision between player bullets and invaders; both are removed on hit
- [ ] Invader bullets hitting the player cost one life (start with 3)
- [ ] Points per invader type (top row 30, middle 20, bottom 10)
- [ ] 4 destructible shields that erode when hit by either side's bullets
- [ ] Score and lives are displayed in a HUD

## Acceptance Criteria

- [ ] Unit tests cover each collision type, scoring values, life loss, and shield erosion

## Out of Scope

- Sound assets (all audio is synthesised with Web Audio; see src/audio.ts)

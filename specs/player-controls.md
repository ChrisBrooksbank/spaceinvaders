# Player Controls

## Overview

The player moves a ship along the bottom of the screen and fires bullets at invaders.

## User Stories

- As a player, I want to move left and right so that I can line up shots and dodge fire.
- As a player, I want to shoot so that I can destroy invaders.

## Requirements

- [ ] Left/Right arrow keys (and A/D) move the ship horizontally at constant speed
- [ ] Ship is clamped within the playfield bounds
- [ ] Space fires a bullet upward from the ship's position
- [ ] Only one player bullet may be on screen at a time
- [ ] Input is handled via a testable input-state abstraction

## Acceptance Criteria

- [ ] Unit tests cover movement, clamping, and single-bullet limit
- [ ] Holding a key moves the ship smoothly; releasing stops it

## Out of Scope

- Touch/gamepad input

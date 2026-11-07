import { FIELD_HEIGHT } from './constants';
import { resolveInvaderBulletsHitPlayer, resolvePlayerBulletHit } from './collisions';
import { isGameOver } from './gameover';
import {
  createInvaderGrid,
  invaderStepInterval,
  nextFireInterval,
  updateInvaderFire,
  updateInvaderMarch,
} from './invaders';
import { createPlayer, fireBullet, moveBullet, movePlayer } from './player';
import { resolveBulletsHitShields, createShields } from './shields';
import type { Bullet, GameState, Input } from './types';

export type Rng = () => number;

/** A fresh state sitting on the start screen. */
export function createInitialState(rng: Rng = Math.random, highScore = 0): GameState {
  return {
    phase: 'start',
    level: 1,
    score: 0,
    highScore,
    player: createPlayer(),
    playerBullet: null,
    invaderBullets: [],
    invaders: {
      invaders: createInvaderGrid(),
      direction: 1,
      stepTimer: 0,
      fireTimer: 0,
      nextFireAt: nextFireInterval(rng),
    },
    shields: createShields(),
  };
}

/** Moves invader bullets down, dropping those that left the bottom of the playfield. */
function moveInvaderBullets(bullets: readonly Bullet[], dt: number): Bullet[] {
  return bullets.map((b) => ({ ...b, y: b.y + b.vy * dt })).filter((b) => b.y <= FIELD_HEIGHT);
}

function stepPlaying(state: GameState, input: Input, dt: number, rng: Rng): GameState {
  const level = state.level;
  const player = movePlayer(state.player, input, dt);
  const playerBullet = moveBullet(fireBullet(player, state.playerBullet, input), dt);
  const marched = updateInvaderMarch(
    state.invaders,
    dt,
    invaderStepInterval(state.invaders, level),
  );
  const fired = updateInvaderFire(marched, moveInvaderBullets(state.invaderBullets, dt), dt, rng);

  // Shields absorb bullets from either side.
  const shieldHit = resolveBulletsHitShields(
    [...(playerBullet ? [playerBullet] : []), ...fired.bullets],
    state.shields,
  );
  const survivingPlayerBullet =
    playerBullet && shieldHit.bullets.includes(playerBullet) ? playerBullet : null;
  const invaderBullets = shieldHit.bullets.filter((b) => b !== playerBullet);

  const invaderHit = resolvePlayerBulletHit(survivingPlayerBullet, fired.group);
  const playerHit = resolveInvaderBulletsHitPlayer(invaderBullets, player);

  const next: GameState = {
    ...state,
    score: state.score + invaderHit.points,
    player: playerHit.player,
    playerBullet: invaderHit.bullet,
    invaderBullets: playerHit.bullets,
    invaders: invaderHit.invaders,
    shields: shieldHit.shields,
  };
  if (isGameOver(next.player, next.invaders)) {
    return { ...next, phase: 'gameover', highScore: Math.max(next.highScore, next.score) };
  }
  if (next.invaders.invaders.every((i) => !i.alive)) return advanceLevel(next, rng);
  return next;
}

/** Spawns a fresh, faster grid for the next level, keeping score and lives. */
function advanceLevel(state: GameState, rng: Rng): GameState {
  return {
    ...state,
    level: state.level + 1,
    playerBullet: null,
    invaderBullets: [],
    invaders: {
      invaders: createInvaderGrid(),
      direction: 1,
      stepTimer: 0,
      fireTimer: 0,
      nextFireAt: nextFireInterval(rng),
    },
    shields: createShields(),
  };
}

/**
 * Advances the game by one fixed timestep. Pure: all randomness comes from `rng`.
 * Phases: start -> playing -> gameover -> (Enter) playing.
 */
export function update(
  state: GameState,
  input: Input,
  dt: number,
  rng: Rng = Math.random,
): GameState {
  switch (state.phase) {
    case 'start':
    case 'gameover':
      if (!input.start) return state;
      return { ...createInitialState(rng, state.highScore), phase: 'playing' };
    case 'playing':
      return stepPlaying(state, input, dt, rng);
  }
}

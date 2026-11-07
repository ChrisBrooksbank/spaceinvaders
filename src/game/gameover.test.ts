import { describe, expect, it } from 'vitest';
import { PLAYER_Y } from './constants';
import { invadersReachedPlayer, isGameOver } from './gameover';
import { createInvaderGrid } from './invaders';
import type { InvaderGroup, Player } from './types';

const group = (): InvaderGroup => ({
  invaders: createInvaderGrid(),
  direction: 1,
  stepTimer: 0,
  fireTimer: 0,
  nextFireAt: 1,
});

const player = (lives: number): Player => ({ x: 0, y: PLAYER_Y, width: 40, height: 20, lives });

describe('invadersReachedPlayer', () => {
  it('is false for a fresh grid', () => {
    expect(invadersReachedPlayer(group())).toBe(false);
  });

  it('is true when a living invader reaches the player row', () => {
    const g = group();
    const last = g.invaders[g.invaders.length - 1]!;
    last.y = PLAYER_Y - last.height;
    expect(invadersReachedPlayer(g)).toBe(true);
  });

  it('ignores dead invaders', () => {
    const g = group();
    const last = g.invaders[g.invaders.length - 1]!;
    last.y = PLAYER_Y;
    last.alive = false;
    expect(invadersReachedPlayer(g)).toBe(false);
  });
});

describe('isGameOver', () => {
  it('is false with lives and distant invaders', () => {
    expect(isGameOver(player(3), group())).toBe(false);
  });

  it('is true when lives reach 0', () => {
    expect(isGameOver(player(0), group())).toBe(true);
  });

  it('is true when invaders reach the player', () => {
    const g = group();
    g.invaders[0]!.y = PLAYER_Y;
    expect(isGameOver(player(3), g)).toBe(true);
  });
});

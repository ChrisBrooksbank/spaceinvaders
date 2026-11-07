import { describe, expect, it } from 'vitest';
import { detectSounds } from './sounds';
import { createInitialState } from './update';
import type { GameState } from './types';

function playing(): GameState {
  return { ...createInitialState(() => 0.5), phase: 'playing' };
}

describe('detectSounds', () => {
  it('is silent when nothing happened', () => {
    const s = playing();
    expect(detectSounds(s, s)).toEqual([]);
  });

  it('is silent outside the playing phase', () => {
    const s = createInitialState(() => 0.5);
    expect(detectSounds(s, { ...s, phase: 'playing' })).toEqual([]);
  });

  it('emits shoot when a player bullet appears', () => {
    const s = playing();
    const bullet = { x: 0, y: 0, width: 4, height: 12, vy: -480 };
    expect(detectSounds(s, { ...s, playerBullet: bullet })).toEqual(['shoot']);
  });

  it('emits march when the formation moves', () => {
    const s = playing();
    const moved = s.invaders.invaders.map((i) => ({ ...i, x: i.x + 8 }));
    expect(detectSounds(s, { ...s, invaders: { ...s.invaders, invaders: moved } })).toEqual([
      'march',
    ]);
  });

  it('emits invaderKilled when an invader dies', () => {
    const s = playing();
    const invaders = s.invaders.invaders.map((i, idx) => (idx === 30 ? { ...i, alive: false } : i));
    expect(detectSounds(s, { ...s, invaders: { ...s.invaders, invaders } })).toEqual([
      'invaderKilled',
    ]);
  });

  it('emits playerHit when a life is lost', () => {
    const s = playing();
    const next = { ...s, player: { ...s.player, lives: s.player.lives - 1 } };
    expect(detectSounds(s, next)).toEqual(['playerHit']);
  });

  it('emits only levelUp on level advance', () => {
    const s = playing();
    const dead = s.invaders.invaders.map((i) => ({ ...i, alive: false }));
    const prev = { ...s, invaders: { ...s.invaders, invaders: dead } };
    expect(detectSounds(prev, { ...s, level: 2 })).toEqual(['levelUp']);
  });

  it('emits gameOver when the phase ends', () => {
    const s = playing();
    expect(detectSounds(s, { ...s, phase: 'gameover' })).toEqual(['gameOver']);
  });
});

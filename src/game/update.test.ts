import { describe, expect, it } from 'vitest';
import { FIXED_DT, PLAYER_Y, STARTING_LIVES } from './constants';
import type { GameState, Input } from './types';
import { createInitialState, update } from './update';

const none: Input = { left: false, right: false, fire: false, start: false };
const rng = () => 0.5;

function playing(): GameState {
  return update(createInitialState(rng), { ...none, start: true }, FIXED_DT, rng);
}

describe('update phase machine', () => {
  it('stays on the start screen until start is pressed', () => {
    const s = createInitialState(rng);
    expect(update(s, none, FIXED_DT, rng)).toBe(s);
    expect(s.phase).toBe('start');
  });

  it('start -> playing on Enter', () => {
    const s = playing();
    expect(s.phase).toBe('playing');
    expect(s.player.lives).toBe(STARTING_LIVES);
  });

  it('moves the player while playing', () => {
    const s = playing();
    const next = update(s, { ...none, right: true }, FIXED_DT, rng);
    expect(next.player.x).toBeGreaterThan(s.player.x);
  });

  it('fires a single player bullet', () => {
    const next = update(playing(), { ...none, fire: true }, FIXED_DT, rng);
    expect(next.playerBullet).not.toBeNull();
  });

  it('playing -> gameover when lives reach 0, recording high score', () => {
    const s = playing();
    const dying: GameState = {
      ...s,
      score: 120,
      player: { ...s.player, lives: 1 },
      invaderBullets: [{ x: s.player.x + 10, y: PLAYER_Y, width: 4, height: 12, vy: 0 }],
    };
    const next = update(dying, none, FIXED_DT, rng);
    expect(next.phase).toBe('gameover');
    expect(next.player.lives).toBe(0);
    expect(next.highScore).toBe(120);
  });

  it('playing -> gameover when invaders reach the player', () => {
    const s = playing();
    const invaders = s.invaders.invaders.map((i, idx) => (idx === 0 ? { ...i, y: PLAYER_Y } : i));
    const next = update({ ...s, invaders: { ...s.invaders, invaders } }, none, FIXED_DT, rng);
    expect(next.phase).toBe('gameover');
  });

  it('gameover ignores input other than start, and restarts on Enter keeping high score', () => {
    const over: GameState = { ...playing(), phase: 'gameover', score: 50, highScore: 200 };
    expect(update(over, { ...none, fire: true }, FIXED_DT, rng)).toBe(over);
    const restarted = update(over, { ...none, start: true }, FIXED_DT, rng);
    expect(restarted.phase).toBe('playing');
    expect(restarted.score).toBe(0);
    expect(restarted.highScore).toBe(200);
    expect(restarted.player.lives).toBe(STARTING_LIVES);
  });

  it('awards score when the player bullet kills an invader', () => {
    const s = playing();
    const target = s.invaders.invaders[0]!;
    const bullet = { x: target.x + 10, y: target.y + 5, width: 4, height: 12, vy: 0 };
    const next = update({ ...s, playerBullet: bullet }, none, FIXED_DT, rng);
    expect(next.score).toBe(30);
    expect(next.playerBullet).toBeNull();
  });

  it('clearing all invaders advances the level, keeping score and lives', () => {
    const s = playing();
    const last = s.invaders.invaders.map((i, idx) => ({ ...i, alive: idx === 0 }));
    const target = last[0]!;
    const state: GameState = {
      ...s,
      score: 70,
      player: { ...s.player, lives: 2 },
      invaders: { ...s.invaders, invaders: last },
      playerBullet: { x: target.x, y: target.y, width: 4, height: 12, vy: -480 },
    };
    const next = update(state, none, FIXED_DT, rng);
    expect(next.phase).toBe('playing');
    expect(next.level).toBe(2);
    expect(next.score).toBeGreaterThan(70);
    expect(next.player.lives).toBe(2);
    expect(next.invaders.invaders.every((i) => i.alive)).toBe(true);
    expect(next.playerBullet).toBeNull();
  });
});

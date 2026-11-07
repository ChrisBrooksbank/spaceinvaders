import { describe, expect, it } from 'vitest';
import {
  BULLET_WIDTH,
  FIELD_WIDTH,
  PLAYER_BULLET_SPEED,
  PLAYER_SPEED,
  PLAYER_WIDTH,
  STARTING_LIVES,
} from './constants';
import { createPlayer, fireBullet, moveBullet, movePlayer } from './player';
import type { Input } from './types';

const none: Input = { left: false, right: false, fire: false, start: false };

describe('movePlayer', () => {
  it('starts centered with full lives', () => {
    const p = createPlayer();
    expect(p.x + PLAYER_WIDTH / 2).toBe(FIELD_WIDTH / 2);
    expect(p.lives).toBe(STARTING_LIVES);
  });

  it('moves right and left at constant speed', () => {
    const p = createPlayer();
    expect(movePlayer(p, { ...none, right: true }, 0.1).x).toBeCloseTo(p.x + PLAYER_SPEED * 0.1);
    expect(movePlayer(p, { ...none, left: true }, 0.1).x).toBeCloseTo(p.x - PLAYER_SPEED * 0.1);
  });

  it('stops when no key is held, and when both are held', () => {
    const p = createPlayer();
    expect(movePlayer(p, none, 0.1).x).toBe(p.x);
    expect(movePlayer(p, { ...none, left: true, right: true }, 0.1).x).toBe(p.x);
  });

  it('clamps to the playfield', () => {
    const p = createPlayer();
    expect(movePlayer({ ...p, x: 1 }, { ...none, left: true }, 1).x).toBe(0);
    expect(
      movePlayer({ ...p, x: FIELD_WIDTH - PLAYER_WIDTH - 1 }, { ...none, right: true }, 1).x,
    ).toBe(FIELD_WIDTH - PLAYER_WIDTH);
  });
});

describe('player bullet', () => {
  const fire: Input = { ...none, fire: true };

  it('fires upward from the ship center', () => {
    const p = createPlayer();
    const b = fireBullet(p, null, fire);
    expect(b).not.toBeNull();
    expect(b!.x + BULLET_WIDTH / 2).toBe(p.x + PLAYER_WIDTH / 2);
    expect(b!.vy).toBe(-PLAYER_BULLET_SPEED);
  });

  it('does not fire without the fire key', () => {
    expect(fireBullet(createPlayer(), null, none)).toBeNull();
  });

  it('allows only one bullet on screen', () => {
    const p = createPlayer();
    const first = fireBullet(p, null, fire);
    expect(fireBullet(p, first, fire)).toBe(first);
  });

  it('moves upward and is removed off the top', () => {
    const b = fireBullet(createPlayer(), null, fire)!;
    expect(moveBullet(b, 0.1)!.y).toBeCloseTo(b.y - PLAYER_BULLET_SPEED * 0.1);
    expect(moveBullet({ ...b, y: -b.height + 1 }, 0.1)).toBeNull();
    expect(moveBullet(null, 0.1)).toBeNull();
  });
});

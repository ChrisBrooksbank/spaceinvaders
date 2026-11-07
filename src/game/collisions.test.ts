import { describe, expect, it } from 'vitest';
import { aabbOverlap, resolveInvaderBulletsHitPlayer, resolvePlayerBulletHit } from './collisions';
import { INVADER_POINTS } from './constants';
import { createInvaderGrid } from './invaders';
import type { Bullet, InvaderGroup, Player } from './types';

const group = (): InvaderGroup => ({
  invaders: createInvaderGrid(),
  direction: 1,
  stepTimer: 0,
  fireTimer: 0,
  nextFireAt: 1,
});

const bulletAt = (x: number, y: number): Bullet => ({ x, y, width: 4, height: 12, vy: -480 });

describe('aabbOverlap', () => {
  const r = { x: 0, y: 0, width: 10, height: 10 };
  it('detects overlap', () => {
    expect(aabbOverlap(r, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
  });
  it('rejects separated and edge-touching rects', () => {
    expect(aabbOverlap(r, { x: 20, y: 0, width: 5, height: 5 })).toBe(false);
    expect(aabbOverlap(r, { x: 10, y: 0, width: 5, height: 5 })).toBe(false);
  });
});

describe('resolvePlayerBulletHit', () => {
  it('does nothing without a bullet or a hit', () => {
    const g = group();
    expect(resolvePlayerBulletHit(null, g)).toEqual({ bullet: null, invaders: g, points: 0 });
    const miss = bulletAt(0, 0);
    const res = resolvePlayerBulletHit(miss, g);
    expect(res.bullet).toBe(miss);
    expect(res.points).toBe(0);
  });

  it.each([
    [0, 0],
    [1, 1],
    [3, 2],
  ])('row %i awards points for type %i and removes both', (row, type) => {
    const g = group();
    const target = g.invaders.find((i) => i.row === row && i.col === 0)!;
    const res = resolvePlayerBulletHit(bulletAt(target.x + 2, target.y + 2), g);
    expect(res.bullet).toBeNull();
    expect(res.points).toBe(INVADER_POINTS[type as 0 | 1 | 2]);
    expect(res.invaders.invaders.filter((i) => !i.alive)).toHaveLength(1);
    expect(res.invaders.invaders.find((i) => i.row === row && i.col === 0)!.alive).toBe(false);
  });

  it('ignores dead invaders', () => {
    const g = group();
    const target = g.invaders[0]!;
    const dead = {
      ...g,
      invaders: g.invaders.map((i) => (i === target ? { ...i, alive: false } : i)),
    };
    const res = resolvePlayerBulletHit(bulletAt(target.x + 2, target.y + 2), dead);
    expect(res.points).toBe(0);
    expect(res.bullet).not.toBeNull();
  });
});

describe('resolveInvaderBulletsHitPlayer', () => {
  const player: Player = { x: 100, y: 500, width: 40, height: 20, lives: 3 };
  const down = (x: number, y: number): Bullet => ({ x, y, width: 4, height: 12, vy: 220 });

  it('does nothing on a miss', () => {
    const b = down(0, 0);
    const res = resolveInvaderBulletsHitPlayer([b], player);
    expect(res.hit).toBe(false);
    expect(res.player.lives).toBe(3);
    expect(res.bullets).toEqual([b]);
  });

  it('removes only the hitting bullet and costs one life', () => {
    const miss = down(0, 0);
    const res = resolveInvaderBulletsHitPlayer([miss, down(110, 505)], player);
    expect(res.hit).toBe(true);
    expect(res.player.lives).toBe(2);
    expect(res.bullets).toEqual([miss]);
  });

  it('never drops lives below zero', () => {
    const res = resolveInvaderBulletsHitPlayer([down(110, 505)], { ...player, lives: 0 });
    expect(res.player.lives).toBe(0);
  });
});

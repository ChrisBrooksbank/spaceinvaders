import { describe, expect, it } from 'vitest';
import { SHIELD_COUNT } from './constants';
import { createShields, resolveBulletsHitShields } from './shields';
import type { Bullet, Shield } from './types';

function shieldAt(shields: readonly Shield[], i: number): Shield {
  const s = shields[i];
  if (!s) throw new Error(`no shield ${i}`);
  return s;
}

const bulletAt = (x: number, y: number, vy = -480): Bullet => ({
  x,
  y,
  width: 4,
  height: 12,
  vy,
});

const intact = (cells: boolean[][]) => cells.flat().filter(Boolean).length;

describe('createShields', () => {
  it('creates 4 fully intact, non-overlapping shields', () => {
    const shields = createShields();
    expect(shields).toHaveLength(SHIELD_COUNT);
    for (const s of shields) expect(s.cells.flat().every(Boolean)).toBe(true);
    for (let i = 1; i < shields.length; i++) {
      expect(shieldAt(shields, i).x).toBeGreaterThan(
        shieldAt(shields, i - 1).x + shieldAt(shields, i - 1).width,
      );
    }
  });
});

describe('resolveBulletsHitShields', () => {
  it('leaves bullets that miss untouched', () => {
    const shields = createShields();
    const b = bulletAt(0, 0);
    const res = resolveBulletsHitShields([b], shields);
    expect(res.bullets).toEqual([b]);
    expect(res.shields).toEqual(shields);
  });

  it('removes a player bullet and erodes cells it hits', () => {
    const shields = createShields();
    const s = shieldAt(shields, 0);
    const before = intact(s.cells);
    const res = resolveBulletsHitShields([bulletAt(s.x + 20, s.y + 10)], shields);
    expect(res.bullets).toHaveLength(0);
    expect(intact(shieldAt(res.shields, 0).cells)).toBeLessThan(before);
    expect(intact(shieldAt(shields, 0).cells)).toBe(before);
    expect(shieldAt(res.shields, 1)).toBe(shieldAt(shields, 1));
  });

  it('erodes from an invader (downward) bullet too', () => {
    const shields = createShields();
    const s = shieldAt(shields, 2);
    const res = resolveBulletsHitShields([bulletAt(s.x + 8, s.y - 6, 220)], shields);
    expect(res.bullets).toHaveLength(0);
    expect(intact(shieldAt(res.shields, 2).cells)).toBeLessThan(intact(s.cells));
  });

  it('lets bullets pass through destroyed cells', () => {
    const shields = createShields();
    const s = shieldAt(shields, 0);
    const b = bulletAt(s.x, s.y);
    // Fully clear the shield, then fire again.
    const cleared: Shield = { ...s, cells: s.cells.map((row) => row.map(() => false)) };
    const res = resolveBulletsHitShields([b], [cleared]);
    expect(res.bullets).toEqual([b]);
  });
});

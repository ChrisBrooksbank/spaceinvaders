import { describe, expect, it } from 'vitest';
import {
  FIELD_WIDTH,
  INVADER_BASE_STEP_INTERVAL,
  INVADER_MIN_STEP_INTERVAL,
  LEVEL_SPEEDUP,
  INVADER_COLS,
  INVADER_FIRE_MAX_INTERVAL,
  INVADER_FIRE_MIN_INTERVAL,
  INVADER_BULLET_SPEED,
  INVADER_POINTS,
  INVADER_ROWS,
  INVADER_STEP_DOWN,
  INVADER_STEP_X,
} from './constants';
import {
  createInvaderGrid,
  invaderStepInterval,
  lowestInvaderPerColumn,
  nextFireInterval,
  updateInvaderFire,
  stepInvaders,
  updateInvaderMarch,
} from './invaders';
import type { InvaderGroup } from './types';

describe('createInvaderGrid', () => {
  const grid = createInvaderGrid();

  it('creates 5x11 living invaders', () => {
    expect(INVADER_ROWS).toBe(5);
    expect(INVADER_COLS).toBe(11);
    expect(grid).toHaveLength(55);
    expect(grid.every((i) => i.alive)).toBe(true);
  });

  it('assigns types by row', () => {
    const typeOfRow = (r: number) => grid.filter((i) => i.row === r).map((i) => i.type);
    expect(typeOfRow(0).every((t) => t === 0)).toBe(true);
    expect(typeOfRow(1).every((t) => t === 1)).toBe(true);
    expect(typeOfRow(2).every((t) => t === 1)).toBe(true);
    expect(typeOfRow(3).every((t) => t === 2)).toBe(true);
    expect(typeOfRow(4).every((t) => t === 2)).toBe(true);
    expect(INVADER_POINTS[grid[0]!.type]).toBe(30);
  });

  it('fits inside the playfield without overlap', () => {
    for (const i of grid) {
      expect(i.x).toBeGreaterThanOrEqual(0);
      expect(i.x + i.width).toBeLessThanOrEqual(FIELD_WIDTH);
    }
    const first = grid[0]!;
    const second = grid[1]!;
    expect(second.x).toBeGreaterThanOrEqual(first.x + first.width);
  });
});

function makeGroup(overrides: Partial<InvaderGroup> = {}): InvaderGroup {
  return {
    invaders: createInvaderGrid(),
    direction: 1,
    stepTimer: 0,
    fireTimer: 0,
    nextFireAt: 1,
    ...overrides,
  };
}

describe('stepInvaders', () => {
  it('moves sideways in the current direction', () => {
    const g = makeGroup();
    const n = stepInvaders(g);
    expect(n.invaders[0]!.x).toBe(g.invaders[0]!.x + INVADER_STEP_X);
    expect(n.invaders[0]!.y).toBe(g.invaders[0]!.y);
    expect(n.direction).toBe(1);
  });

  it('drops and reverses at the right edge', () => {
    let g = makeGroup();
    const shift = FIELD_WIDTH - Math.max(...g.invaders.map((i) => i.x + i.width)) - 1;
    g = { ...g, invaders: g.invaders.map((i) => ({ ...i, x: i.x + shift })) };
    const n = stepInvaders(g);
    expect(n.direction).toBe(-1);
    expect(n.invaders[0]!.x).toBe(g.invaders[0]!.x);
    expect(n.invaders[0]!.y).toBe(g.invaders[0]!.y + INVADER_STEP_DOWN);
  });

  it('drops and reverses at the left edge', () => {
    const g = makeGroup({ direction: -1 });
    const shift = -Math.min(...g.invaders.map((i) => i.x)) + 1;
    const moved = { ...g, invaders: g.invaders.map((i) => ({ ...i, x: i.x + shift })) };
    const n = stepInvaders(moved);
    expect(n.direction).toBe(1);
    expect(n.invaders[0]!.y).toBe(moved.invaders[0]!.y + INVADER_STEP_DOWN);
  });

  it('only considers living invaders for bounds', () => {
    const g = makeGroup();
    const rightmostCol = INVADER_COLS - 1;
    const killed = g.invaders.map((i) => (i.col === rightmostCol ? { ...i, alive: false } : i));
    const living = killed.filter((i) => i.alive);
    const shift = FIELD_WIDTH - Math.max(...living.map((i) => i.x + i.width)) - 1;
    const shifted = killed.map((i) => ({ ...i, x: i.x + shift }));
    const n = stepInvaders({ ...g, invaders: shifted });
    expect(n.direction).toBe(-1);
    const fresh = stepInvaders({ ...g, invaders: killed });
    expect(fresh.direction).toBe(1);
  });
});

describe('updateInvaderMarch', () => {
  it('does not step before the interval elapses', () => {
    const g = makeGroup();
    const n = updateInvaderMarch(g, 0.1, 0.5);
    expect(n.invaders[0]!.x).toBe(g.invaders[0]!.x);
    expect(n.stepTimer).toBeCloseTo(0.1);
  });

  it('steps once the interval elapses and keeps the remainder', () => {
    const g = makeGroup({ stepTimer: 0.45 });
    const n = updateInvaderMarch(g, 0.1, 0.5);
    expect(n.invaders[0]!.x).toBe(g.invaders[0]!.x + INVADER_STEP_X);
    expect(n.stepTimer).toBeCloseTo(0.05);
  });
});

describe('invaderStepInterval', () => {
  const kill = (g: InvaderGroup, n: number): InvaderGroup => ({
    ...g,
    invaders: g.invaders.map((i, idx) => (idx < n ? { ...i, alive: false } : i)),
  });

  it('uses the base interval with a full grid', () => {
    expect(invaderStepInterval(makeGroup())).toBeCloseTo(INVADER_BASE_STEP_INTERVAL);
  });

  it('gets faster as invaders are destroyed', () => {
    const g = makeGroup();
    const a = invaderStepInterval(kill(g, 10));
    const b = invaderStepInterval(kill(g, 30));
    const c = invaderStepInterval(kill(g, 54));
    expect(a).toBeLessThan(INVADER_BASE_STEP_INTERVAL);
    expect(b).toBeLessThan(a);
    expect(c).toBeLessThan(b);
    expect(c).toBeGreaterThanOrEqual(INVADER_MIN_STEP_INTERVAL);
  });

  it('is faster on higher levels but never below the minimum', () => {
    const g = makeGroup();
    expect(invaderStepInterval(g, 2)).toBeCloseTo(INVADER_BASE_STEP_INTERVAL * LEVEL_SPEEDUP);
    expect(invaderStepInterval(kill(g, 54), 50)).toBe(INVADER_MIN_STEP_INTERVAL);
  });
});

describe('invader firing', () => {
  const makeGroup = (fireTimer = 0, nextFireAt = 1): InvaderGroup => ({
    invaders: createInvaderGrid(),
    direction: 1,
    stepTimer: 0,
    fireTimer,
    nextFireAt,
  });

  it('selects the lowest living invader in each column', () => {
    const group = makeGroup();
    group.invaders.find((i) => i.row === 4 && i.col === 3)!.alive = false;
    const lowest = lowestInvaderPerColumn(group.invaders);
    expect(lowest).toHaveLength(INVADER_COLS);
    expect(lowest.find((i) => i.col === 3)!.row).toBe(3);
    expect(lowest.find((i) => i.col === 0)!.row).toBe(4);
  });

  it('skips columns with no living invaders', () => {
    const group = makeGroup();
    group.invaders.forEach((i) => {
      if (i.col === 0) i.alive = false;
    });
    expect(lowestInvaderPerColumn(group.invaders).some((i) => i.col === 0)).toBe(false);
  });

  it('nextFireInterval stays within configured bounds', () => {
    expect(nextFireInterval(() => 0)).toBe(INVADER_FIRE_MIN_INTERVAL);
    expect(nextFireInterval(() => 0.999999)).toBeLessThan(INVADER_FIRE_MAX_INTERVAL);
  });

  it('does not fire before the timer is due', () => {
    const r = updateInvaderFire(makeGroup(), [], 0.5, () => 0);
    expect(r.bullets).toHaveLength(0);
    expect(r.group.fireTimer).toBeCloseTo(0.5);
  });

  it('fires a downward bullet from the chosen column bottom when due', () => {
    const rolls = [0.5, 0];
    const rng = () => rolls.shift() ?? 0;
    const r = updateInvaderFire(makeGroup(0.9, 1), [], 0.2, rng);
    expect(r.bullets).toHaveLength(1);
    const b = r.bullets[0]!;
    expect(b.vy).toBe(INVADER_BULLET_SPEED);
    const shooter = lowestInvaderPerColumn(makeGroup().invaders)[0]!;
    expect(b.y).toBe(shooter.y + shooter.height);
    expect(b.x + b.width / 2).toBeCloseTo(shooter.x + shooter.width / 2);
    expect(r.group.fireTimer).toBe(0);
    expect(r.group.nextFireAt).toBe(
      INVADER_FIRE_MIN_INTERVAL + 0.5 * (INVADER_FIRE_MAX_INTERVAL - INVADER_FIRE_MIN_INTERVAL),
    );
  });

  it('fires nothing when no invaders are alive', () => {
    const group = makeGroup(2, 1);
    group.invaders.forEach((i) => (i.alive = false));
    expect(updateInvaderFire(group, [], 0.1, () => 0).bullets).toHaveLength(0);
  });
});

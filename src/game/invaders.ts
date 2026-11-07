import {
  BULLET_HEIGHT,
  BULLET_WIDTH,
  FIELD_WIDTH,
  INVADER_BASE_STEP_INTERVAL,
  INVADER_BULLET_SPEED,
  INVADER_COLS,
  INVADER_FIRE_MAX_INTERVAL,
  INVADER_FIRE_MIN_INTERVAL,
  INVADER_MIN_STEP_INTERVAL,
  INVADER_HEIGHT,
  INVADER_ROWS,
  INVADER_SPACING_X,
  INVADER_SPACING_Y,
  INVADER_START_X,
  INVADER_START_Y,
  INVADER_STEP_DOWN,
  INVADER_STEP_X,
  INVADER_WIDTH,
  LEVEL_SPEEDUP,
} from './constants';
import type { Bullet, Invader, InvaderGroup, InvaderType } from './types';

/** Top row = type 0, next two rows = type 1, bottom two rows = type 2. */
export function invaderTypeForRow(row: number): InvaderType {
  if (row === 0) return 0;
  return row <= 2 ? 1 : 2;
}

/** Creates the full INVADER_ROWS x INVADER_COLS grid, all alive. */
export function createInvaderGrid(): Invader[] {
  const invaders: Invader[] = [];
  for (let row = 0; row < INVADER_ROWS; row++) {
    for (let col = 0; col < INVADER_COLS; col++) {
      invaders.push({
        x: INVADER_START_X + col * (INVADER_WIDTH + INVADER_SPACING_X),
        y: INVADER_START_Y + row * (INVADER_HEIGHT + INVADER_SPACING_Y),
        width: INVADER_WIDTH,
        height: INVADER_HEIGHT,
        type: invaderTypeForRow(row),
        row,
        col,
        alive: true,
      });
    }
  }
  return invaders;
}

/** Performs one marching step: sideways, or drop and reverse if an edge would be crossed. */
export function stepInvaders(group: InvaderGroup): InvaderGroup {
  const living = group.invaders.filter((i) => i.alive);
  if (living.length === 0) return group;
  const dx = group.direction * INVADER_STEP_X;
  const minX = Math.min(...living.map((i) => i.x));
  const maxX = Math.max(...living.map((i) => i.x + i.width));
  const hitsEdge = minX + dx < 0 || maxX + dx > FIELD_WIDTH;
  if (hitsEdge) {
    return {
      ...group,
      direction: group.direction === 1 ? -1 : 1,
      invaders: group.invaders.map((i) => ({ ...i, y: i.y + INVADER_STEP_DOWN })),
    };
  }
  return { ...group, invaders: group.invaders.map((i) => ({ ...i, x: i.x + dx })) };
}

/**
 * Seconds between marching steps. Shrinks linearly as invaders are destroyed
 * and by LEVEL_SPEEDUP for each level beyond the first; never below the minimum.
 */
export function invaderStepInterval(group: InvaderGroup, level: number = 1): number {
  const total = INVADER_ROWS * INVADER_COLS;
  const living = Math.min(group.invaders.filter((i) => i.alive).length, total);
  const fraction = living / total;
  const base =
    INVADER_MIN_STEP_INTERVAL + (INVADER_BASE_STEP_INTERVAL - INVADER_MIN_STEP_INTERVAL) * fraction;
  const scaled = base * Math.pow(LEVEL_SPEEDUP, Math.max(0, level - 1));
  return Math.max(INVADER_MIN_STEP_INTERVAL, scaled);
}

/** Advances the march timer by dt, taking as many steps as are due. */
export function updateInvaderMarch(
  group: InvaderGroup,
  dt: number,
  stepInterval: number = INVADER_BASE_STEP_INTERVAL,
): InvaderGroup {
  let next: InvaderGroup = { ...group, stepTimer: group.stepTimer + dt };
  while (next.stepTimer >= stepInterval) {
    next = stepInvaders({ ...next, stepTimer: next.stepTimer - stepInterval });
  }
  return next;
}

/** Returns the lowest living invader in each column that still has one. */
export function lowestInvaderPerColumn(invaders: readonly Invader[]): Invader[] {
  const lowest = new Map<number, Invader>();
  for (const inv of invaders) {
    if (!inv.alive) continue;
    const current = lowest.get(inv.col);
    if (!current || inv.y > current.y) lowest.set(inv.col, inv);
  }
  return [...lowest.values()].sort((a, b) => a.col - b.col);
}

/** Random delay until the next shot; rng returns a value in [0, 1). */
export function nextFireInterval(rng: () => number): number {
  return (
    INVADER_FIRE_MIN_INTERVAL + rng() * (INVADER_FIRE_MAX_INTERVAL - INVADER_FIRE_MIN_INTERVAL)
  );
}

/**
 * Advances the fire timer; when due, a randomly chosen column's lowest invader
 * fires a downward bullet. Returns the updated group and bullet list.
 */
export function updateInvaderFire(
  group: InvaderGroup,
  bullets: readonly Bullet[],
  dt: number,
  rng: () => number,
): { group: InvaderGroup; bullets: Bullet[] } {
  const fireTimer = group.fireTimer + dt;
  if (fireTimer < group.nextFireAt) {
    return { group: { ...group, fireTimer }, bullets: [...bullets] };
  }
  const shooters = lowestInvaderPerColumn(group.invaders);
  const nextGroup = { ...group, fireTimer: 0, nextFireAt: nextFireInterval(rng) };
  if (shooters.length === 0) return { group: nextGroup, bullets: [...bullets] };
  const shooter = shooters[Math.min(shooters.length - 1, Math.floor(rng() * shooters.length))];
  if (!shooter) return { group: nextGroup, bullets: [...bullets] };
  const bullet: Bullet = {
    x: shooter.x + (shooter.width - BULLET_WIDTH) / 2,
    y: shooter.y + shooter.height,
    width: BULLET_WIDTH,
    height: BULLET_HEIGHT,
    vy: INVADER_BULLET_SPEED,
  };
  return { group: nextGroup, bullets: [...bullets, bullet] };
}

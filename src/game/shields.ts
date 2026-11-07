import {
  FIELD_WIDTH,
  SHIELD_CELL_SIZE,
  SHIELD_COLS,
  SHIELD_COUNT,
  SHIELD_ROWS,
  SHIELD_Y,
} from './constants';
import { aabbOverlap } from './collisions';
import type { Bullet, Shield } from './types';

/** Creates the evenly spaced, fully intact shields. */
export function createShields(): Shield[] {
  const width = SHIELD_COLS * SHIELD_CELL_SIZE;
  const height = SHIELD_ROWS * SHIELD_CELL_SIZE;
  const gap = (FIELD_WIDTH - SHIELD_COUNT * width) / (SHIELD_COUNT + 1);
  return Array.from({ length: SHIELD_COUNT }, (_, i) => ({
    x: gap + i * (width + gap),
    y: SHIELD_Y,
    width,
    height,
    cells: Array.from({ length: SHIELD_ROWS }, () => Array<boolean>(SHIELD_COLS).fill(true)),
  }));
}

/** Rect of a single shield cell. */
function cellRect(shield: Shield, row: number, col: number) {
  return {
    x: shield.x + col * SHIELD_CELL_SIZE,
    y: shield.y + row * SHIELD_CELL_SIZE,
    width: SHIELD_CELL_SIZE,
    height: SHIELD_CELL_SIZE,
  };
}

/** Erodes intact cells overlapped by the bullet. Returns null if the bullet hit nothing. */
function erodeShield(shield: Shield, bullet: Bullet): Shield | null {
  if (!aabbOverlap(bullet, shield)) return null;
  let hit = false;
  const cells = shield.cells.map((rowCells, row) =>
    rowCells.map((intact, col) => {
      if (intact && aabbOverlap(bullet, cellRect(shield, row, col))) {
        hit = true;
        return false;
      }
      return intact;
    }),
  );
  return hit ? { ...shield, cells } : null;
}

export interface ShieldHitResult {
  bullets: Bullet[];
  shields: Shield[];
}

/**
 * Resolves bullets (from either side) against shields. A bullet that touches
 * intact cells is removed and those cells are destroyed; others pass through.
 */
export function resolveBulletsHitShields(
  bullets: readonly Bullet[],
  shields: readonly Shield[],
): ShieldHitResult {
  const current = [...shields];
  const remaining: Bullet[] = [];
  for (const bullet of bullets) {
    let absorbed = false;
    for (const [i, shield] of current.entries()) {
      const eroded = erodeShield(shield, bullet);
      if (eroded) {
        current[i] = eroded;
        absorbed = true;
        break;
      }
    }
    if (!absorbed) remaining.push(bullet);
  }
  return { bullets: remaining, shields: current };
}

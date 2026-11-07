import { INVADER_POINTS } from './constants';
import type { Bullet, Invader, InvaderGroup, Player, Rect } from './types';

/** Axis-aligned bounding-box overlap test. Touching edges do not count as overlap. */
export function aabbOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export interface PlayerBulletHitResult {
  bullet: Bullet | null;
  invaders: InvaderGroup;
  /** Points earned by this hit (0 if nothing was hit). */
  points: number;
}

/** Resolves the player bullet against living invaders; both are removed on hit. */
export function resolvePlayerBulletHit(
  bullet: Bullet | null,
  group: InvaderGroup,
): PlayerBulletHitResult {
  if (!bullet) return { bullet, invaders: group, points: 0 };
  const target = group.invaders.find((inv) => inv.alive && aabbOverlap(bullet, inv));
  if (!target) return { bullet, invaders: group, points: 0 };
  const invaders = group.invaders.map((inv: Invader) =>
    inv === target ? { ...inv, alive: false } : inv,
  );
  return {
    bullet: null,
    invaders: { ...group, invaders },
    points: INVADER_POINTS[target.type],
  };
}

export interface InvaderBulletsHitResult {
  bullets: Bullet[];
  player: Player;
  /** True if the player lost a life this step. */
  hit: boolean;
}

/** Resolves invader bullets against the player; a hit removes the bullet and costs one life. */
export function resolveInvaderBulletsHitPlayer(
  bullets: readonly Bullet[],
  player: Player,
): InvaderBulletsHitResult {
  const target = bullets.find((b) => aabbOverlap(b, player));
  if (!target) return { bullets: [...bullets], player, hit: false };
  return {
    bullets: bullets.filter((b) => b !== target),
    player: { ...player, lives: Math.max(0, player.lives - 1) },
    hit: true,
  };
}

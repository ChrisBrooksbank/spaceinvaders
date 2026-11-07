import {
  BULLET_HEIGHT,
  BULLET_WIDTH,
  FIELD_WIDTH,
  PLAYER_BULLET_SPEED,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_WIDTH,
  PLAYER_Y,
  STARTING_LIVES,
} from './constants';
import type { Bullet, Input, Player } from './types';

export function createPlayer(): Player {
  return {
    x: (FIELD_WIDTH - PLAYER_WIDTH) / 2,
    y: PLAYER_Y,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    lives: STARTING_LIVES,
  };
}

/** Moves the player at constant speed, clamped to the playfield. */
export function movePlayer(player: Player, input: Input, dt: number): Player {
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const x = Math.min(Math.max(player.x + dir * PLAYER_SPEED * dt, 0), FIELD_WIDTH - player.width);
  return { ...player, x };
}

/** Fires a bullet upward from the ship's center if fire is held and none is on screen. */
export function fireBullet(player: Player, bullet: Bullet | null, input: Input): Bullet | null {
  if (bullet || !input.fire) return bullet;
  return {
    x: player.x + (player.width - BULLET_WIDTH) / 2,
    y: player.y - BULLET_HEIGHT,
    width: BULLET_WIDTH,
    height: BULLET_HEIGHT,
    vy: -PLAYER_BULLET_SPEED,
  };
}

/** Advances the player bullet; returns null once it has left the top of the playfield. */
export function moveBullet(bullet: Bullet | null, dt: number): Bullet | null {
  if (!bullet) return null;
  const moved = { ...bullet, y: bullet.y + bullet.vy * dt };
  return moved.y + moved.height < 0 ? null : moved;
}

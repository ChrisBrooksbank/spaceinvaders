import { PLAYER_Y } from './constants';
import type { InvaderGroup, Player } from './types';

/** True if any living invader's bottom edge has reached the player's row. */
export function invadersReachedPlayer(group: InvaderGroup): boolean {
  return group.invaders.some((inv) => inv.alive && inv.y + inv.height >= PLAYER_Y);
}

/** Game is over when the player is out of lives or the invaders reached the player's row. */
export function isGameOver(player: Player, group: InvaderGroup): boolean {
  return player.lives <= 0 || invadersReachedPlayer(group);
}

import type { GameState } from './types';

export type SoundEvent = 'shoot' | 'march' | 'invaderKilled' | 'playerHit' | 'levelUp' | 'gameOver';

function aliveCount(state: GameState): number {
  return state.invaders.invaders.filter((i) => i.alive).length;
}

function firstAlive(state: GameState): { x: number; y: number } | undefined {
  return state.invaders.invaders.find((i) => i.alive);
}

/**
 * Derives the sound events caused by one update step. Pure: it only compares
 * two consecutive states, so game logic stays free of audio concerns.
 */
export function detectSounds(prev: GameState, next: GameState): SoundEvent[] {
  if (prev.phase !== 'playing') return [];
  const events: SoundEvent[] = [];

  if (!prev.playerBullet && next.playerBullet) events.push('shoot');

  if (next.level > prev.level) {
    events.push('levelUp');
  } else {
    if (aliveCount(next) < aliveCount(prev)) events.push('invaderKilled');
    const a = firstAlive(prev);
    const b = firstAlive(next);
    if (a && b && (a.x !== b.x || a.y !== b.y)) events.push('march');
  }

  if (next.player.lives < prev.player.lives) events.push('playerHit');
  if (next.phase === 'gameover') events.push('gameOver');
  return events;
}

export const HIGH_SCORE_KEY = 'spaceinvaders.highScore';

/** Minimal subset of the Web Storage API so tests can inject a fake. */
export interface ScoreStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Pure: the greater of the current high score and a new score. */
export function nextHighScore(highScore: number, score: number): number {
  return Math.max(highScore, score);
}

/** Parse a stored value into a valid high score; anything invalid becomes 0. */
export function parseHighScore(raw: string | null): number {
  if (raw === null) return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export function loadHighScore(storage: ScoreStorage | undefined): number {
  if (!storage) return 0;
  try {
    return parseHighScore(storage.getItem(HIGH_SCORE_KEY));
  } catch {
    return 0;
  }
}

/** Persist the high score; returns false if storage is unavailable or throws. */
export function saveHighScore(storage: ScoreStorage | undefined, value: number): boolean {
  if (!storage) return false;
  try {
    storage.setItem(HIGH_SCORE_KEY, String(Math.floor(value)));
    return true;
  } catch {
    return false;
  }
}
